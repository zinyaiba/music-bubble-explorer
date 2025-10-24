import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { BubbleEntity } from '@/types/bubble'
import { Song, Person, Tag } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'
import { UnifiedDialogLayout } from './UnifiedDialogLayout'
import './DetailModal.css'

interface DetailModalProps {
  selectedBubble: BubbleEntity | null
  onClose: () => void
}

interface RelatedData {
  id: string
  name: string
  type: 'song' | 'person' | 'tag'
  role?: 'lyricist' | 'composer' | 'arranger'
  roles?: Array<{ type: 'lyricist' | 'composer' | 'arranger'; songCount: number }>
  details?: Song | Person | Tag
}

/**
 * シンプルなDetailModal - シャボン玉の詳細情報を表示するモーダルコンポーネント
 */
export const DetailModal: React.FC<DetailModalProps> = React.memo(({
  selectedBubble,
  onClose
}) => {
  const [relatedData, setRelatedData] = useState<RelatedData[]>([])
  
  const musicService = useMemo(() => MusicDataService.getInstance(), [])

  const loadRelatedData = useCallback(() => {
    if (!selectedBubble) return

    const data: RelatedData[] = []

    try {
      if (selectedBubble.type === 'song') {
        // 楽曲名から楽曲を検索（IDではなく名前で検索）
        const allSongs = musicService.getAllSongs()
        
        if (allSongs.length === 0) {
          setRelatedData([])
          return
        }
        
        const song = allSongs.find(s => s.title === selectedBubble.name)
        
        if (song) {
          song.lyricists.forEach(lyricist => {
            data.push({
              id: `lyricist-${lyricist}`,
              name: lyricist,
              type: 'person',
              role: 'lyricist'
            })
          })
          
          song.composers.forEach(composer => {
            data.push({
              id: `composer-${composer}`,
              name: composer,
              type: 'person',
              role: 'composer'
            })
          })
          
          song.arrangers.forEach(arranger => {
            data.push({
              id: `arranger-${arranger}`,
              name: arranger,
              type: 'person',
              role: 'arranger'
            })
          })
          
          // タグ情報も追加
          if (song.tags && song.tags.length > 0) {
            song.tags.forEach(tag => {
              data.push({
                id: `tag-${tag}`,
                name: tag,
                type: 'tag',
                role: 'tag' as any
              })
            })
          }
        } else {
          // 部分一致で再検索
          const partialMatch = allSongs.find(s => 
            s.title.toLowerCase().includes(selectedBubble.name.toLowerCase()) ||
            selectedBubble.name.toLowerCase().includes(s.title.toLowerCase())
          )
          
          if (partialMatch) {
            // 部分一致した楽曲の情報を使用
            partialMatch.lyricists.forEach(lyricist => {
              data.push({
                id: `lyricist-${lyricist}`,
                name: lyricist,
                type: 'person',
                role: 'lyricist'
              })
            })
            
            partialMatch.composers.forEach(composer => {
              data.push({
                id: `composer-${composer}`,
                name: composer,
                type: 'person',
                role: 'composer'
              })
            })
            
            partialMatch.arrangers.forEach(arranger => {
              data.push({
                id: `arranger-${arranger}`,
                name: arranger,
                type: 'person',
                role: 'arranger'
              })
            })
            
            if (partialMatch.tags && partialMatch.tags.length > 0) {
              partialMatch.tags.forEach(tag => {
                data.push({
                  id: `tag-${tag}`,
                  name: tag,
                  type: 'tag',
                  role: 'tag' as any
                })
              })
            }
          }
        }
      } else if (selectedBubble.type === 'tag') {
        // タグ名から関連楽曲を検索
        const allSongs = musicService.getAllSongs()
        
        if (allSongs.length === 0) {
          setRelatedData([])
          return
        }
        
        const taggedSongs = allSongs.filter(song => 
          song.tags && song.tags.includes(selectedBubble.name)
        )
        
        taggedSongs.forEach((song: Song) => {
          data.push({
            id: song.id,
            name: song.title,
            type: 'song',
            details: song
          })
        })
      } else {
        // 人物名から楽曲を検索（名前ベースで検索）
        const allSongs = musicService.getAllSongs()
        
        if (allSongs.length === 0) {
          setRelatedData([])
          return
        }
        
        const personSongs = allSongs.filter(song => 
          song.lyricists.includes(selectedBubble.name) ||
          song.composers.includes(selectedBubble.name) ||
          song.arrangers.includes(selectedBubble.name)
        )
        
        personSongs.forEach((song: Song) => {
          // Person関連の楽曲の場合、すべての役割を特定する
          const roles: Array<'lyricist' | 'composer' | 'arranger'> = []
          
          if (song.lyricists.includes(selectedBubble.name)) roles.push('lyricist')
          if (song.composers.includes(selectedBubble.name)) roles.push('composer')
          if (song.arrangers.includes(selectedBubble.name)) roles.push('arranger')
          
          // 複数の役割がある場合は、それぞれを個別のエントリとして追加
          if (roles.length > 1) {
            roles.forEach(role => {
              data.push({
                id: `${song.id}-${role}`,
                name: song.title,
                type: 'song',
                role,
                details: song
              })
            })
          } else if (roles.length === 1) {
            data.push({
              id: song.id,
              name: song.title,
              type: 'song',
              role: roles[0],
              details: song
            })
          }
        })
      }
    } catch (error) {
      console.error('Error loading related data:', error)
      setRelatedData([])
      return
    }

    setRelatedData(data)
  }, [selectedBubble, musicService])

  useEffect(() => {
    if (selectedBubble) {
      loadRelatedData()
    } else {
      setRelatedData([])
    }
  }, [selectedBubble, loadRelatedData])

  const getRoleLabel = useCallback((role: 'lyricist' | 'composer' | 'arranger' | 'tag') => {
    switch (role) {
      case 'lyricist': return '作詞'
      case 'composer': return '作曲'
      case 'arranger': return '編曲'
      case 'tag': return 'タグ'
      default: return role
    }
  }, [])



  if (!selectedBubble) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'song': return '🎵'
      case 'lyricist': return '✍️'
      case 'composer': return '🎼'
      case 'arranger': return '🎹'
      case 'tag': return '🏷️'
      default: return '💫'
    }
  }

  const title = `${getTypeIcon(selectedBubble.type)} ${selectedBubble.type === 'tag' ? `#${selectedBubble.name}` : selectedBubble.name}`

  return (
    <UnifiedDialogLayout
      isVisible={!!selectedBubble}
      onClose={onClose}
      title={title}
      size="standard"
      mobileOptimized={true}
    >
      <div className="detail-modal-content">
        {/* 楽曲名の重複表示を削除 - ヘッダーと重複のため */}

        {selectedBubble.type === 'song' ? (
          <div className="song-details">
            <h3 className="section-title">関連する人物</h3>
            {relatedData.length > 0 ? (
              <div className="related-list" role="list" aria-label="関連する人物一覧">
                {relatedData.map((item) => (
                  <div key={item.id} className="related-item" role="listitem" tabIndex={0}>
                    <span className={`role-tag role-${item.role}`} aria-label={`役割: ${getRoleLabel(item.role!)}`}>
                      {getRoleLabel(item.role!)}
                    </span>
                    <span className="item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message" role="status" aria-live="polite">
                関連する人物が見つかりません
              </div>
            )}
          </div>
        ) : selectedBubble.type === 'tag' ? (
          <div className="tag-details">
            <div className="tag-info">
              {/* <div className="tag-popularity">
                人気度: {Math.round((selectedBubble.relatedCount || 0) / Math.max(1, musicService.getAllSongs().length) * 100)}%  
              </div> */}
              <div className="tag-description">
                {selectedBubble.relatedCount || 0}曲で使用されています
              </div>
            </div>
            <h3 className="section-title">このタグが付けられた楽曲</h3>
            {relatedData.length > 0 ? (
              <div className="related-list" role="list" aria-label="関連する楽曲一覧">
                {relatedData.map((item) => {
                  console.log('🎵 Rendering tag song item:', {
                    itemId: item.id,
                    itemName: item.name,
                    className: 'related-item tag-song-item'
                  })
                  return (
                  <div key={item.id} className="related-item tag-song-item" role="listitem" tabIndex={0}>
                    <div className="song-info">
                      <div className="item-name">{item.name}</div>
                      {item.details && (
                        <div className="song-credits">
                          {(item.details as Song).lyricists && (item.details as Song).lyricists.length > 0 && (
                            <div className="credit-line">
                              <span className="credit-label">作詞:</span>
                              <span className="credit-names">{(item.details as Song).lyricists.join(', ')}</span>
                            </div>
                          )}
                          {(item.details as Song).composers && (item.details as Song).composers.length > 0 && (
                            <div className="credit-line">
                              <span className="credit-label">作曲:</span>
                              <span className="credit-names">{(item.details as Song).composers.join(', ')}</span>
                            </div>
                          )}
                          {(item.details as Song).arrangers && (item.details as Song).arrangers.length > 0 && (
                            <div className="credit-line">
                              <span className="credit-label">編曲:</span>
                              <span className="credit-names">{(item.details as Song).arrangers.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-message" role="status" aria-live="polite">
                このタグが付けられた楽曲が見つかりません
              </div>
            )}
          </div>
        ) : (
          <div className="person-details">
            <h3 className="section-title">関連する楽曲</h3>
            {relatedData.length > 0 ? (
              <div className="related-list" role="list" aria-label="関連する楽曲一覧">
                {relatedData.map((item) => (
                  <div key={item.id} className="related-item" role="listitem" tabIndex={0}>
                    <span className={`role-tag role-${item.role}`} aria-label={`役割: ${getRoleLabel(item.role!)}`}>
                      {getRoleLabel(item.role!)}
                    </span>
                    <span className="item-name">{item.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message" role="status" aria-live="polite">
                関連する楽曲が見つかりません
              </div>
            )}
          </div>
        )}
      </div>
    </UnifiedDialogLayout>
  )
})

export default DetailModal