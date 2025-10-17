import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { BubbleEntity } from '@/types/bubble'
import type { EnhancedBubble } from '@/types/enhancedBubble'
import { Song, Person, Tag } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'
import { SimpleDialog } from './SimpleDialog'
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

  const isEnhancedBubble = useCallback((bubble: BubbleEntity): boolean => {
    return 'isMultiRole' in bubble || 'roles' in bubble || 'enhancedType' in bubble
  }, [])

  const loadRelatedData = useCallback(() => {
    if (!selectedBubble) return

    const data: RelatedData[] = []

    try {
      if (selectedBubble.type === 'song') {
        console.log('🎵 Loading song details for:', selectedBubble.name)
        
        // 楽曲名から楽曲を検索（IDではなく名前で検索）
        const allSongs = musicService.getAllSongs()
        const song = allSongs.find(s => s.title === selectedBubble.name)
        
        console.log('🎵 Found song:', song ? {
          title: song.title,
          lyricists: song.lyricists,
          composers: song.composers,
          arrangers: song.arrangers,
          tags: song.tags
        } : 'Not found')
        
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
                type: 'tag'
              })
            })
          }
        } else {
          console.warn('🎵 Song not found:', selectedBubble.name)
        }
      } else if (selectedBubble.type === 'tag') {
        console.log('🏷️ Loading tag details for:', selectedBubble.name)
        
        // タグ名から関連楽曲を検索
        const allSongs = musicService.getAllSongs()
        const taggedSongs = allSongs.filter(song => 
          song.tags && song.tags.includes(selectedBubble.name)
        )
        
        console.log('🏷️ Found tagged songs:', {
          tagName: selectedBubble.name,
          songsFound: taggedSongs.length,
          songs: taggedSongs.map(s => s.title)
        })
        
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
        console.log('🔍 Searching songs for person:', selectedBubble.name)
        
        const allSongs = musicService.getAllSongs()
        const personSongs = allSongs.filter(song => 
          song.lyricists.includes(selectedBubble.name) ||
          song.composers.includes(selectedBubble.name) ||
          song.arrangers.includes(selectedBubble.name)
        )
        
        console.log('🔍 Found songs for person:', {
          personName: selectedBubble.name,
          songsFound: personSongs.length,
          songs: personSongs.map(s => s.title)
        })
        
        personSongs.forEach((song: Song) => {
          // Person関連の楽曲の場合、役割を特定する
          let role: 'lyricist' | 'composer' | 'arranger' | undefined
          if (song.lyricists.includes(selectedBubble.name)) role = 'lyricist'
          else if (song.composers.includes(selectedBubble.name)) role = 'composer'
          else if (song.arrangers.includes(selectedBubble.name)) role = 'arranger'
          
          data.push({
            id: song.id,
            name: song.title,
            type: 'song',
            role,
            details: song
          })
        })
      }
    } catch (error) {
      console.error('🚨 Error loading related data:', error)
      // エラーが発生した場合は空のデータを設定
      setRelatedData([])
      return
    }

    console.log('📊 Final related data:', {
      bubbleType: selectedBubble.type,
      bubbleName: selectedBubble.name,
      relatedCount: data.length,
      data: data.map(d => ({ name: d.name, type: d.type, role: d.role }))
    })

    setRelatedData(data)
  }, [selectedBubble, musicService])

  useEffect(() => {
    if (selectedBubble) {
      loadRelatedData()
    } else {
      setRelatedData([])
    }
  }, [selectedBubble, loadRelatedData])

  const getRoleLabel = useCallback((role: 'lyricist' | 'composer' | 'arranger') => {
    switch (role) {
      case 'lyricist': return '作詞'
      case 'composer': return '作曲'
      case 'arranger': return '編曲'
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
    <SimpleDialog
      isVisible={!!selectedBubble}
      onClose={onClose}
      title={title}
      className="detail-modal"
    >
      <div className="detail-modal-content">
        <div className="main-info">
          <h2 className="main-title">
            {selectedBubble.type === 'tag' ? `#${selectedBubble.name}` : selectedBubble.name}
            {isEnhancedBubble(selectedBubble) && (selectedBubble as EnhancedBubble).isMultiRole && (
              <span className="multi-role-indicator">
                <span aria-label="複数の役割を持つ人物">🌟 複数役割</span>
              </span>
            )}
          </h2>
        </div>

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
              <div className="tag-popularity">
                人気度: {Math.round((selectedBubble.relatedCount || 0) / Math.max(1, musicService.getAllSongs().length) * 100)}%
              </div>
              <div className="tag-description">
                {selectedBubble.relatedCount || 0}曲で使用されています
              </div>
            </div>
            <h3 className="section-title">このタグが付けられた楽曲</h3>
            {relatedData.length > 0 ? (
              <div className="related-list" role="list" aria-label="関連する楽曲一覧">
                {relatedData.map((item) => (
                  <div key={item.id} className="related-item" role="listitem" tabIndex={0}>
                    <div className="item-name">{item.name}</div>
                    {item.details && (
                      <div className="item-details">
                        {(item.details as Song).lyricists?.join(', ')} / {(item.details as Song).composers?.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
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
    </SimpleDialog>
  )
})

export default DetailModal