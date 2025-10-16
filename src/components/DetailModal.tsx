import React, { useEffect, useState, useMemo, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { BubbleEntity } from '@/types/bubble'
import type { EnhancedBubble } from '@/types/enhancedBubble'
import { Song, Person, Tag } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'

interface DetailModalProps {
  selectedBubble: BubbleEntity | null
  onClose: () => void
}

interface RelatedData {
  id: string
  name: string
  type: 'song' | 'person' | 'tag'
  role?: 'lyricist' | 'composer' | 'arranger'
  roles?: Array<{ type: 'lyricist' | 'composer' | 'arranger'; songCount: number }> // For multi-role persons
  details?: Song | Person | Tag
}

/**
 * DetailModal - シャボン玉の詳細情報を表示するモーダルコンポーネント（パフォーマンス最適化版）
 * Requirements: 3.2, 3.3, 3.4
 */
export const DetailModal: React.FC<DetailModalProps> = React.memo(({
  selectedBubble,
  onClose
}) => {
  const [relatedData, setRelatedData] = useState<RelatedData[]>([])
  const [isVisible, setIsVisible] = useState(false)
  
  // パフォーマンス最適化: MusicDataServiceインスタンスをメモ化
  const musicService = useMemo(() => MusicDataService.getInstance(), [])

  // モーダルの表示/非表示制御
  useEffect(() => {
    if (selectedBubble) {
      setIsVisible(true)
      loadRelatedData()
    } else {
      setIsVisible(false)
      setRelatedData([])
    }
  }, [selectedBubble])

  /**
   * Check if bubble is enhanced bubble
   */
  const isEnhancedBubble = useCallback((bubble: BubbleEntity): boolean => {
    return 'visualType' in bubble && 'iconType' in bubble && 'shapeType' in bubble
  }, [])

  /**
   * 関連データを読み込む（パフォーマンス最適化版 + Enhanced Bubble対応）
   * Requirements: 2.3 - Multi-role person display in modal
   */
  const loadRelatedData = useCallback(() => {
    if (!selectedBubble) return

    const data: RelatedData[] = []

    if (selectedBubble.type === 'song') {
      // 楽曲の場合：関連する人物（作詞家・作曲家・編曲家）を取得
      const song = musicService.getAllSongs().find(s => s.title === selectedBubble.name)
      if (song) {
        const people = musicService.getPeopleForSong(song.id)
        people.forEach(person => {
          data.push({
            id: person.id,
            name: person.name,
            type: 'person',
            role: person.type,
            details: person
          })
        })
      }
    } else if (selectedBubble.type === 'tag') {
      // タグの場合：そのタグが付けられた楽曲を取得
      // Requirements: 6.3 - タグクリック時の関連楽曲表示機能
      const songs = musicService.getSongsForTag(selectedBubble.name)
      songs.forEach(song => {
        data.push({
          id: song.id,
          name: song.title,
          type: 'song',
          details: song
        })
      })

      // タグの人気度情報も追加
      const popularity = musicService.getRelatedCountForTag(selectedBubble.name)
      const relatedTags = musicService.getRelatedTags(selectedBubble.name)
      
      console.log(`Tag "${selectedBubble.name}" details:`, {
        popularity,
        relatedSongs: songs.length,
        relatedTags: relatedTags.map((t: any) => t.name)
      })
    } else {
      // 人物の場合：関連する楽曲を取得
      // Enhanced bubble support: Check if this is a multi-role person
      if (isEnhancedBubble(selectedBubble)) {
        const enhancedBubble = selectedBubble as EnhancedBubble;
        if (enhancedBubble.isMultiRole && enhancedBubble.roles) {
          // Enhanced bubble with consolidated roles
          enhancedBubble.songs?.forEach((songId: string) => {
            const song = musicService.getSongById(songId)
            if (song) {
              data.push({
                id: song.id,
                name: song.title,
                type: 'song',
                details: song
              })
            }
          })
        }
      } else {
        // Standard person handling with consolidation
        const people = musicService.getPeopleByName(selectedBubble.name)
        if (people.length > 0) {
          // 全ての役割の楽曲を統合
          const allSongIds = new Set<string>()
          people.forEach(person => {
            person.songs.forEach(songId => allSongIds.add(songId))
          })
          
          allSongIds.forEach((songId: any) => {
            const song = musicService.getSongById(songId)
            if (song) {
              data.push({
                id: song.id,
                name: song.title,
                type: 'song',
                details: song
              })
            }
          })
        } else {
          // Fallback to original logic
          const people = musicService.getPeopleByName(selectedBubble.name)
          if (people.length > 0) {
            // 同じ名前で複数の役割を持つ場合があるので、全ての楽曲を統合
            const songIds = new Set<string>()
            people.forEach(person => {
              person.songs.forEach(songId => songIds.add(songId))
            })

            Array.from(songIds).forEach(songId => {
              const song = musicService.getSongById(songId)
              if (song) {
                data.push({
                  id: song.id,
                  name: song.title,
                  type: 'song',
                  details: song
                })
              }
            })
          }
        }
      }
    }

    setRelatedData(data)
  }, [selectedBubble, musicService, isEnhancedBubble])

  /**
   * モーダルを閉じる（パフォーマンス最適化版）
   */
  const handleClose = useCallback(() => {
    setIsVisible(false)
    // アニメーション完了後にonCloseを呼ぶ
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  /**
   * 背景クリックでモーダルを閉じる（パフォーマンス最適化版）
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  /**
   * キーボードナビゲーション（ESC、Tab、矢印キー）
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBubble) return

      switch (e.key) {
        case 'Escape':
          handleClose()
          break
        case 'Tab': {
          // Tab navigation within modal
          const focusableElements = document.querySelectorAll(
            '[role="dialog"] button, [role="dialog"] [tabindex="0"]'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement?.focus()
          }
          break
        }
        case 'ArrowDown':
        case 'ArrowUp': {
          // Arrow key navigation for list items
          const listItems = document.querySelectorAll('[role="listitem"]')
          const currentIndex = Array.from(listItems).findIndex(item => item === document.activeElement)
          
          if (currentIndex !== -1) {
            e.preventDefault()
            let nextIndex
            if (e.key === 'ArrowDown') {
              nextIndex = (currentIndex + 1) % listItems.length
            } else {
              nextIndex = (currentIndex - 1 + listItems.length) % listItems.length
            }
            (listItems[nextIndex] as HTMLElement)?.focus()
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedBubble, handleClose])

  /**
   * モーダル表示時にフォーカスを設定
   */
  useEffect(() => {
    if (selectedBubble && isVisible) {
      // モーダルが表示されたら最初のフォーカス可能な要素にフォーカス
      const timeoutId = setTimeout(() => {
        // テスト環境での安全性チェック
        if (typeof document === 'undefined') {
          return
        }
        
        const firstFocusable = document.querySelector('[role="dialog"] button') as HTMLElement
        firstFocusable?.focus()
      }, 100)
      
      // クリーンアップ関数でタイムアウトをクリア
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [selectedBubble, isVisible])

  /**
   * 役割の日本語表示を取得（パフォーマンス最適化版）
   */
  const getRoleLabel = useCallback((role: 'lyricist' | 'composer' | 'arranger'): string => {
    switch (role) {
      case 'lyricist': return '作詞'
      case 'composer': return '作曲'
      case 'arranger': return '編曲'
      default: return role
    }
  }, [])

  /**
   * タイプの日本語表示を取得（パフォーマンス最適化版）
   */
  const getTypeLabel = useCallback((type: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'): string => {
    switch (type) {
      case 'song': return '楽曲'
      case 'lyricist': return '作詞家'
      case 'composer': return '作曲家'
      case 'arranger': return '編曲家'
      case 'tag': return 'タグ'
      default: return type
    }
  }, [])

  if (!selectedBubble) return null

  return (
    <ModalOverlay 
      $isVisible={isVisible} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <ModalContent $isVisible={isVisible}>
        <ModalHeader>
          <BubbleTypeIcon $bubbleType={selectedBubble.type}>
            {getTypeLabel(selectedBubble.type)}
          </BubbleTypeIcon>
          <CloseButton 
            onClick={handleClose}
            aria-label="モーダルを閉じる"
            title="モーダルを閉じる (ESCキー)"
          >
            ×
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <MainTitle id="modal-title">
            {selectedBubble.type === 'tag' ? `#${selectedBubble.name}` : selectedBubble.name}
            {/* Show multi-role indicator for enhanced bubbles */}
            {isEnhancedBubble(selectedBubble) && (selectedBubble as EnhancedBubble).isMultiRole && (
              <MultiRoleIndicator>
                <span aria-label="複数の役割を持つ人物">🌟 複数役割</span>
              </MultiRoleIndicator>
            )}
          </MainTitle>
          
          {/* Display consolidated roles for multi-role persons */}
          {isEnhancedBubble(selectedBubble) && (selectedBubble as EnhancedBubble).isMultiRole && (selectedBubble as EnhancedBubble).roles && (
            <MultiRoleInfo>
              <RolesList>
                {(selectedBubble as EnhancedBubble).roles!.map((role, index) => (
                  <RoleItem key={index}>
                    <RoleTag $role={role.type} aria-label={`役割: ${getRoleLabel(role.type)}`}>
                      {getRoleLabel(role.type)}
                    </RoleTag>
                    <RoleCount>{role.songCount}曲</RoleCount>
                  </RoleItem>
                ))}
              </RolesList>
              <TotalCount>
                合計: {(selectedBubble as EnhancedBubble).roles!.reduce((sum, role) => sum + role.songCount, 0)}曲に関与
              </TotalCount>
            </MultiRoleInfo>
          )}
          
          {selectedBubble.type === 'song' ? (
            <SongDetails>
              <SectionTitle id="modal-description">関連する人物</SectionTitle>
              {relatedData.length > 0 ? (
                <RelatedList role="list" aria-label="関連する人物一覧">
                  {relatedData.map((item) => (
                    <RelatedItemMemo 
                      key={item.id}
                      item={item}
                      getRoleLabel={getRoleLabel}
                    />
                  ))}
                </RelatedList>
              ) : (
                <EmptyMessage role="status" aria-live="polite">関連する人物が見つかりません</EmptyMessage>
              )}
            </SongDetails>
          ) : selectedBubble.type === 'tag' ? (
            <TagDetails>
              <TagInfo>
                <TagPopularity>
                  🏷️ 人気度: {relatedData.length}曲に使用
                </TagPopularity>
                <TagDescription>
                  「#{selectedBubble.name}」タグの詳細情報
                </TagDescription>
              </TagInfo>
              <SectionTitle id="modal-description">このタグが付けられた楽曲</SectionTitle>
              {relatedData.length > 0 ? (
                <RelatedList role="list" aria-label="関連する楽曲一覧">
                  {relatedData.map((item, index) => (
                    <RelatedSongItemMemo 
                      key={item.id}
                      item={item}
                      index={index + 1}
                      total={relatedData.length}
                    />
                  ))}
                </RelatedList>
              ) : (
                <EmptyMessage role="status" aria-live="polite">
                  このタグが付けられた楽曲が見つかりません
                </EmptyMessage>
              )}
            </TagDetails>
          ) : (
            <PersonDetails>
              <SectionTitle id="modal-description">関連する楽曲</SectionTitle>
              {relatedData.length > 0 ? (
                <RelatedList role="list" aria-label="関連する楽曲一覧">
                  {relatedData.map((item) => (
                    <RelatedSongItemMemo 
                      key={item.id}
                      item={item}
                    />
                  ))}
                </RelatedList>
              ) : (
                <EmptyMessage role="status" aria-live="polite">関連する楽曲が見つかりません</EmptyMessage>
              )}
            </PersonDetails>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  )
})

/**
 * パフォーマンス最適化された関連アイテムコンポーネント（人物用）
 */
const RelatedItemMemo = React.memo<{
  item: RelatedData
  getRoleLabel: (role: 'lyricist' | 'composer' | 'arranger') => string
}>(({ item, getRoleLabel }) => (
  <RelatedItem role="listitem" tabIndex={0}>
    <RoleTag $role={item.role!} aria-label={`役割: ${getRoleLabel(item.role!)}`}>
      {getRoleLabel(item.role!)}
    </RoleTag>
    <PersonName>{item.name}</PersonName>
  </RelatedItem>
))

/**
 * パフォーマンス最適化された関連アイテムコンポーネント（楽曲用）
 */
const RelatedSongItemMemo = React.memo<{
  item: RelatedData
  index?: number
  total?: number
}>(({ item, index, total }) => (
  <RelatedItem 
    role="listitem" 
    tabIndex={0}
    aria-label={index && total ? `楽曲 ${index} / ${total}: ${item.name}` : `楽曲: ${item.name}`}
  >
    <SongTitle>{item.name}</SongTitle>
    {item.details && 'tags' in item.details && item.details.tags && item.details.tags.length > 0 && (
      <SongTags>
        {item.details.tags.slice(0, 3).map((tag, tagIndex) => (
          <TagChip key={tagIndex} aria-label={`タグ: #${tag}`}>
            #{tag}
          </TagChip>
        ))}
        {item.details.tags.length > 3 && (
          <MoreTagsIndicator aria-label={`他 ${item.details.tags.length - 3} 個のタグ`}>
            +{item.details.tags.length - 3}
          </MoreTagsIndicator>
        )}
      </SongTags>
    )}
  </RelatedItem>
))

// アニメーション定義
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const slideIn = keyframes`
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
`

// スタイル定義
const ModalOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.ui.modalOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  animation: ${({ $isVisible }) => $isVisible ? fadeIn : fadeOut} 
             ${({ theme }) => theme.animations.duration.normal} 
             ${({ theme }) => theme.animations.easing.easeInOut};
`

const ModalContent = styled.div<{ $isVisible: boolean }>`
  background: linear-gradient(135deg, #fff0f8 0%, #ffe8f0 100%);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(255, 105, 180, 0.3), 0 0 0 3px rgba(255, 182, 193, 0.5);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  backdrop-filter: blur(15px);
  border: 3px solid #ffb6c1;
  position: relative;
  
  animation: ${({ $isVisible }) => $isVisible ? slideIn : slideOut} 
             ${({ theme }) => theme.animations.duration.normal} 
             ${({ theme }) => theme.animations.easing.easeOut};

  /* Enhanced responsive breakpoints */
  @media (min-width: 1024px) {
    max-width: 600px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin: 16px;
    max-height: 85vh;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    margin: 12px;
    max-height: 90vh;
    border-radius: 10px;
  }

  /* Landscape orientation on mobile */
  @media (max-width: 767px) and (orientation: landscape) {
    max-height: 95vh;
    margin: 8px;
  }
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 2px solid #ffb6c1;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%);
  position: relative;

  &::before {
    content: '💖';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  &::after {
    content: '✨';
    position: absolute;
    top: 10px;
    right: 60px;
    font-size: 1rem;
    animation: twinkle 3s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: rotate(0deg); }
    50% { opacity: 0.5; transform: rotate(180deg); }
  }
`

const BubbleTypeIcon = styled.div<{ $bubbleType: string }>`
  background: ${({ $bubbleType }) => {
    switch ($bubbleType) {
      case 'song': return 'linear-gradient(135deg, #ff69b4, #ff1493)'
      case 'lyricist': return 'linear-gradient(135deg, #87ceeb, #4169e1)'
      case 'composer': return 'linear-gradient(135deg, #dda0dd, #9370db)'
      case 'arranger': return 'linear-gradient(135deg, #98fb98, #32cd32)'
      case 'tag': return 'linear-gradient(135deg, #90ee90, #32cd32)'
      default: return 'linear-gradient(135deg, #ffd700, #ffa500)'
    }
  }};
  color: white;
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
  position: relative;

  &::before {
    content: ${({ $bubbleType }) => {
      switch ($bubbleType) {
        case 'song': return "'🎵'"
        case 'lyricist': return "'✍️'"
        case 'composer': return "'🎼'"
        case 'arranger': return "'🎹'"
        case 'tag': return "'🏷️'"
        default: return "'🎶'"
      }
    }};
    margin-right: 4px;
  }
`

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 2px solid #fff;
  font-size: 18px;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  font-weight: bold;

  &:hover {
    background: linear-gradient(135deg, #ff1493, #dc143c);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 105, 180, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  /* Enhanced touch target for mobile */
  @media (hover: none) and (pointer: coarse) {
    width: 44px;
    height: 44px;
    font-size: 28px;
    padding: 8px;
    
    /* Remove hover effects on touch devices */
    &:hover {
      background: none;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 26px;
  }
`

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(80vh - 100px);
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */

  /* Enhanced responsive padding */
  @media (min-width: 1024px) {
    padding: 28px;
    max-height: calc(80vh - 110px);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 20px;
    max-height: calc(85vh - 90px);
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-height: calc(90vh - 80px);
  }

  /* Landscape orientation on mobile */
  @media (max-width: 767px) and (orientation: landscape) {
    padding: 16px 20px;
    max-height: calc(95vh - 70px);
  }
`

const MainTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
  line-height: 1.3;
  word-break: break-word;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const SongDetails = styled.div``

const PersonDetails = styled.div``

const TagDetails = styled.div``

const TagInfo = styled.div`
  background: linear-gradient(135deg, rgba(152, 251, 152, 0.1) 0%, rgba(144, 238, 144, 0.1) 100%);
  border: 1px solid rgba(152, 251, 152, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
`

const TagPopularity = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #98FB98, #90EE90);
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(152, 251, 152, 0.6);
  }
`

const TagDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-style: italic;
  margin-top: 4px;
`

const SongTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`

const TagChip = styled.span`
  background: linear-gradient(135deg, rgba(152, 251, 152, 0.2), rgba(144, 238, 144, 0.2));
  border: 1px solid rgba(152, 251, 152, 0.4);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`

const MoreTagsIndicator = styled.span`
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const RelatedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RelatedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.soft};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.ui.borderLight};
  transition: all ${({ theme }) => theme.animations.duration.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.ui.hoverOverlay};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.ui.shadowSoft};
  }
`

const RoleTag = styled.span<{ $role: string }>`
  background: ${({ $role, theme }) => {
    switch ($role) {
      case 'lyricist': return theme.colors.pastel.blue
      case 'composer': return theme.colors.pastel.purple
      case 'arranger': return theme.colors.pastel.green
      default: return theme.colors.pastel.yellow
    }
  }};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-width: 40px;
  text-align: center;
`

const PersonName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`

const SongTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`

const EmptyMessage = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text.light};
  font-style: italic;
  padding: 32px 16px;
  background: ${({ theme }) => theme.colors.background.soft};
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.ui.borderLight};
`

const MultiRoleIndicator = styled.div`
  display: inline-block;
  margin-left: 12px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
`

const MultiRoleInfo = styled.div`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`

const RolesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`

const RoleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  padding: 6px 10px;
`

const RoleCount = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`

const TotalCount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
`

export default DetailModal