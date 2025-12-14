import React, { useState, useMemo, useCallback } from 'react'
import { BubbleEntity } from '@/types/bubble'
import { useTagList, TagListItem, TagSortBy } from '@/hooks/useTagList'
import { StandardLayout } from './StandardLayout'
import './EnhancedTagList.css'

/**
 * レイアウト方法の型定義
 */
export type TagLayout = 'grid' | 'list' | 'cloud'

/**
 * タグ一覧表示のプロパティ
 */
export interface EnhancedTagListProps {
  isVisible: boolean
  onClose: () => void
  onTagClick?: (tag: TagListItem) => void
  onTagDetailOpen?: (bubble: BubbleEntity) => void
}

/**
 * Enhanced Tag List Component
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 * Updated to use StandardLayout template for full-screen consistency
 */
export const EnhancedTagList: React.FC<EnhancedTagListProps> = ({
  isVisible,
  onClose,
  onTagClick,
  onTagDetailOpen,
}) => {
  // Use custom hook for tag management
  const { filterAndSortTags, isLoading, error, refreshData } = useTagList()

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<TagSortBy>('frequency')
  const [layout, setLayout] = useState<TagLayout>('grid')

  // タグ一覧が表示される時に最新データを再取得
  React.useEffect(() => {
    if (isVisible) {
      console.log('🏷️ EnhancedTagList: Visible - refreshing data')
      refreshData()
    }
  }, [isVisible, refreshData])

  // Filter and sort tags based on search and sort criteria
  const filteredAndSortedTags = useMemo(() => {
    return filterAndSortTags(searchTerm, sortBy)
  }, [filterAndSortTags, searchTerm, sortBy])

  // Handle tag click (Requirements: 21.4)
  const handleTagClick = useCallback(
    (tag: TagListItem) => {
      console.log('🏷️ EnhancedTagList: Tag clicked', {
        tagId: tag.id,
        tagName: tag.name,
        songCount: tag.songCount,
        onTagDetailOpen: !!onTagDetailOpen,
      })

      console.log('🏷️ EnhancedTagList: Props check', {
        onTagClick: !!onTagClick,
        onTagDetailOpen: !!onTagDetailOpen,
      })

      // Convert TagListItem to BubbleEntity for DetailModal
      const bubbleEntity = new BubbleEntity({
        id: tag.id,
        name: tag.name,
        type: 'tag',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 20,
        color: '#98FB98',
        opacity: 1,
        lifespan: 1000,
        relatedCount: tag.songCount,
      })

      console.log('🏷️ EnhancedTagList: Created bubble entity', bubbleEntity)

      // 親コンポーネントにタグ詳細表示を通知
      if (onTagDetailOpen) {
        console.log('🏷️ EnhancedTagList: Calling onTagDetailOpen')
        onTagDetailOpen(bubbleEntity)
      } else {
        console.warn('🏷️ EnhancedTagList: onTagDetailOpen is not provided')
      }

      onTagClick?.(tag)
    },
    [onTagClick, onTagDetailOpen]
  )

  // Get songs for selected tag - not needed anymore as DetailModal handles this

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value)
    },
    []
  )

  // Handle sort change
  const handleSortChange = useCallback((newSort: TagSortBy) => {
    setSortBy(newSort)
  }, [])

  // Handle layout change
  const handleLayoutChange = useCallback((newLayout: TagLayout) => {
    setLayout(newLayout)
  }, [])

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  return (
    <StandardLayout
      isVisible={isVisible}
      onClose={onClose}
      title="🏷️ タグ一覧"
      size="standard"
      mobileOptimized={true}
    >
      <div className="enhanced-tag-list-content">
        {/* Loading State */}
        {isLoading && (
          <div className="tag-list-loading">
            <div className="loading-spinner"></div>
            <p>タグデータを読み込んでいます...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="tag-list-error">
            <div className="error-icon">⚠️</div>
            <h3>タグ情報の取得に失敗しました</h3>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button className="retry-button" onClick={refreshData}>
                再試行
              </button>
              <button
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </button>
              <button className="close-button-secondary" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {/* Search Bar (Requirements: 21.3) - 検索とタグ数を横並び */}
            <div className="tag-search-bar">
              <form
                className="search-input-container"
                onSubmit={e => {
                  e.preventDefault()
                  // Enterキーでの送信を防止（Android対応）
                }}
              >
                <input
                  type="text"
                  placeholder="タグを検索..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    // Android対応: キーボード表示時にbodyのfixed解除
                    if (window.innerWidth <= 768) {
                      document.body.style.position = ''
                    }
                  }}
                  onBlur={() => {
                    // Android対応: キーボード非表示時にbodyのfixed復元
                    if (window.innerWidth <= 768) {
                      document.body.style.position = 'fixed'
                    }
                  }}
                  className="search-input"
                  aria-label="タグ検索"
                  inputMode="text"
                />
                <span className="search-tag-count">
                  {filteredAndSortedTags.length}個のタグ
                </span>
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-button"
                    onClick={handleClearSearch}
                    aria-label="検索をクリア"
                  >
                    ×
                  </button>
                )}
              </form>
            </div>

            {/* Sort and Layout Controls (Requirements: 21.3) */}
            <div className="tag-controls">
              <div className="sort-controls">
                <label htmlFor="sort-select">並び順:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => handleSortChange(e.target.value as TagSortBy)}
                  className="sort-select"
                >
                  <option value="frequency">登録が多い順</option>
                  <option value="recent">更新順</option>
                  <option value="alphabetical">アルファベット順</option>
                </select>
              </div>

              <div className="layout-controls">
                <button
                  className={`layout-button ${layout === 'grid' ? 'active' : ''}`}
                  onClick={() => handleLayoutChange('grid')}
                  aria-label="グリッド表示"
                  title="グリッド表示"
                >
                  ⊞
                </button>
                <button
                  className={`layout-button ${layout === 'list' ? 'active' : ''}`}
                  onClick={() => handleLayoutChange('list')}
                  aria-label="リスト表示"
                  title="リスト表示"
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Tag List (Requirements: 21.1, 21.2, 21.5) */}
            <div className={`tag-list-content ${layout}`}>
              {filteredAndSortedTags.length === 0 ? (
                <div className="no-tags-message">
                  <div className="empty-icon">🏷️</div>
                  {searchTerm ? (
                    <>
                      <p>「{searchTerm}」に一致するタグが見つかりません</p>
                      <p className="suggestion">
                        検索条件を変更してお試しください
                      </p>
                    </>
                  ) : (
                    <>
                      <p>登録されているタグがありません</p>
                      <p className="suggestion">
                        楽曲登録時にタグを追加すると、ここに表示されます
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className={`tag-grid ${layout}`}>
                  {filteredAndSortedTags.map(tag => (
                    <div
                      key={tag.id}
                      className="tag-item"
                      onClick={() => handleTagClick(tag)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleTagClick(tag)
                        }
                      }}
                      aria-label={`タグ ${tag.displayName}、${tag.songCount}曲`}
                    >
                      <div className="tag-name">{tag.name}</div>
                      <div className="tag-info">
                        <span className="song-count">{tag.songCount}曲</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StandardLayout>
  )
}

export default EnhancedTagList
