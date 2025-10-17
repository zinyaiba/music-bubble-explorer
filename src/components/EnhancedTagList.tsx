import React, { useState, useMemo, useCallback } from 'react'
import { Song } from '@/types/music'
import { useTagList, TagListItem, TagSortBy } from '@/hooks/useTagList'
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
}

/**
 * タグ詳細モーダルのプロパティ
 */
interface TagDetailModalProps {
  tag: TagListItem | null
  songs: Song[]
  onClose: () => void
}

/**
 * タグ詳細モーダルコンポーネント
 */
const TagDetailModal: React.FC<TagDetailModalProps> = ({ tag, songs, onClose }) => {
  if (!tag) return null

  return (
    <div className="tag-detail-modal-overlay" onClick={onClose}>
      <div className="tag-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tag-detail-header">
          <h3>{tag.displayName}</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="タグ詳細を閉じる"
          >
            ×
          </button>
        </div>
        
        <div className="tag-detail-content">
          <div className="tag-stats">
            <span className="tag-stat">
              <span className="stat-label">楽曲数:</span>
              <span className="stat-value">{tag.songCount}曲</span>
            </span>
            <span className="tag-stat">
              <span className="stat-label">人気度:</span>
              <span className="stat-value">{Math.round(tag.popularity * 100)}%</span>
            </span>
          </div>
          
          <div className="related-songs">
            <h4>関連楽曲</h4>
            <div className="song-list">
              {songs.map(song => (
                <div key={song.id} className="song-item">
                  <div className="song-title">{song.title}</div>
                  <div className="song-credits">
                    {song.lyricists.length > 0 && (
                      <span className="credit">作詞: {song.lyricists.join(', ')}</span>
                    )}
                    {song.composers.length > 0 && (
                      <span className="credit">作曲: {song.composers.join(', ')}</span>
                    )}
                    {song.arrangers.length > 0 && (
                      <span className="credit">編曲: {song.arrangers.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Enhanced Tag List Component
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 */
export const EnhancedTagList: React.FC<EnhancedTagListProps> = ({
  onClose,
  onTagClick
}) => {
  // Use custom hook for tag management
  const {
    getSongsForTag,
    filterAndSortTags,
    isLoading,
    error,
    refreshData
  } = useTagList()

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<TagSortBy>('frequency')
  const [layout, setLayout] = useState<TagLayout>('grid')
  const [selectedTag, setSelectedTag] = useState<TagListItem | null>(null)

  // Filter and sort tags based on search and sort criteria
  const filteredAndSortedTags = useMemo(() => {
    return filterAndSortTags(searchTerm, sortBy)
  }, [filterAndSortTags, searchTerm, sortBy])

  // Handle tag click (Requirements: 21.4)
  const handleTagClick = useCallback((tag: TagListItem) => {
    setSelectedTag(tag)
    onTagClick?.(tag)
  }, [onTagClick])

  // Handle tag detail modal close
  const handleTagDetailClose = useCallback(() => {
    setSelectedTag(null)
  }, [])

  // Get songs for selected tag
  const selectedTagSongs = useMemo(() => {
    if (!selectedTag) return []
    return getSongsForTag(selectedTag.name)
  }, [selectedTag, getSongsForTag])

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

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

  // SimpleDialogでラップされるため、オーバーレイは不要
  return (
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
              <button 
                className="retry-button"
                onClick={refreshData}
              >
                再試行
              </button>
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                ページを再読み込み
              </button>
              <button 
                className="close-button-secondary"
                onClick={onClose}
              >
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {/* Header削除 - ダイアログタイトルと重複のため */}

        {/* Search Bar (Requirements: 21.3) - 検索とタグ数を横並び */}
        <div className="tag-search-bar">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="タグを検索..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
              aria-label="タグ検索"
            />
            <span className="search-tag-count">
              {filteredAndSortedTags.length}個のタグ
            </span>
            {searchTerm && (
              <button 
                className="clear-search-button"
                onClick={handleClearSearch}
                aria-label="検索をクリア"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Sort and Layout Controls (Requirements: 21.3) */}
        <div className="tag-controls">
          <div className="sort-controls">
            <label htmlFor="sort-select">並び順:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as TagSortBy)}
              className="sort-select"
            >
              <option value="frequency">使用頻度順</option>
              <option value="alphabetical">アルファベット順</option>
              <option value="recent">最近使用順</option>
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
                  <p className="suggestion">検索条件を変更してお試しください</p>
                </>
              ) : (
                <>
                  <p>登録されているタグがありません</p>
                  <p className="suggestion">楽曲登録時にタグを追加すると、ここに表示されます</p>
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
                  onKeyDown={(e) => {
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

            {/* Tag Detail Modal (Requirements: 21.4) */}
            <TagDetailModal
              tag={selectedTag}
              songs={selectedTagSongs}
              onClose={handleTagDetailClose}
            />
          </>
        )}
    </div>
  )
}

export default EnhancedTagList