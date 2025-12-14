import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Song } from '@/types/music'
import { useSongSearch } from '@/hooks/useSongSearch'
import './SongSelectionView.css'

export interface SongSelectionViewProps {
  songs: Song[]
  onSongSelect: (song: Song) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  selectedTags?: string[]
  onTagFilter?: (tags: string[]) => void
  enableAdvancedSearch?: boolean
}

export type ViewMode = 'list' | 'grid'

/**
 * 楽曲選択ビューコンポーネント
 * 高い視認性を持つ楽曲一覧表示、検索・フィルタリング機能、モバイル最適化されたタッチ操作を提供
 * Requirements: 1.1, 1.4
 */
export const SongSelectionView: React.FC<SongSelectionViewProps> = ({
  songs,
  onSongSelect,
  searchTerm: externalSearchTerm,
  onSearchChange: externalOnSearchChange,
  selectedTags: externalSelectedTags,
  onTagFilter: externalOnTagFilter,
  enableAdvancedSearch = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // 検索フックの使用
  const {
    searchResult,
    isSearching,
    filters,
    setSearchTerm,
    setSelectedTags,
    setSortBy,
    toggleTag,
    clearSearch,
    searchSuggestions,
  } = useSongSearch(songs, {
    debounceDelay: 300,
    autoSearch: enableAdvancedSearch,
    initialFilters: {
      searchTerm: externalSearchTerm || '',
      selectedTags: externalSelectedTags || [],
      sortBy: 'title',
      sortOrder: 'asc',
    },
  })

  // 外部からの検索語句変更を反映
  useEffect(() => {
    if (
      externalSearchTerm !== undefined &&
      externalSearchTerm !== filters.searchTerm
    ) {
      setSearchTerm(externalSearchTerm)
    }
  }, [externalSearchTerm, filters.searchTerm, setSearchTerm])

  // 外部からのタグ選択変更を反映
  useEffect(() => {
    if (
      externalSelectedTags !== undefined &&
      JSON.stringify(externalSelectedTags) !==
        JSON.stringify(filters.selectedTags)
    ) {
      setSelectedTags(externalSelectedTags)
    }
  }, [externalSelectedTags, filters.selectedTags, setSelectedTags])

  // ページネーション計算
  const totalPages = Math.ceil(searchResult.filteredCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // ページネーション適用
  const paginatedSongs = useMemo(() => {
    return searchResult.songs.slice(startIndex, endIndex)
  }, [searchResult.songs, startIndex, endIndex])

  // ページ変更時に先頭にスクロール
  useEffect(() => {
    setCurrentPage(1)
  }, [searchResult.songs, filters.searchTerm])

  // ビューモード切り替え
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  // ソート変更
  const handleSortChange = useCallback(
    (sort: 'title' | 'recent' | 'artist') => {
      setSortBy(sort)
      setCurrentPage(1)
    },
    [setSortBy]
  )

  // ページ変更
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // モバイルでページ変更時に上部にスクロール
    const container = document.querySelector('.song-selection-container')
    if (container) {
      container.scrollTop = 0
    }
  }, [])

  // 検索語句変更ハンドラー
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value
      setSearchTerm(term)
      if (externalOnSearchChange) {
        externalOnSearchChange(term)
      }
    },
    [setSearchTerm, externalOnSearchChange]
  )

  // 検索語句を直接設定するハンドラー（検索候補用）
  const handleSearchTermChange = useCallback(
    (term: string) => {
      setSearchTerm(term)
      if (externalOnSearchChange) {
        externalOnSearchChange(term)
      }
    },
    [setSearchTerm, externalOnSearchChange]
  )

  // タグフィルター切り替え
  const handleTagToggle = useCallback(
    (tag: string) => {
      if (enableAdvancedSearch) {
        toggleTag(tag)
      }

      if (externalOnTagFilter) {
        const newSelectedTags = filters.selectedTags.includes(tag)
          ? filters.selectedTags.filter(t => t !== tag)
          : [...filters.selectedTags, tag]
        externalOnTagFilter(newSelectedTags)
      }

      setCurrentPage(1)
    },
    [enableAdvancedSearch, toggleTag, externalOnTagFilter, filters.selectedTags]
  )

  // 楽曲選択ハンドラー（タッチ操作最適化）
  const handleSongSelect = useCallback(
    (song: Song, event: React.MouseEvent | React.TouchEvent) => {
      event.preventDefault()
      onSongSelect(song)
    },
    [onSongSelect]
  )

  // ページネーションボタンの生成
  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 前のページボタン
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-button"
          aria-label="前のページ"
        >
          ‹
        </button>
      )
    }

    // ページ番号ボタン
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          aria-label={`ページ ${i}`}
        >
          {i}
        </button>
      )
    }

    // 次のページボタン
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-button"
          aria-label="次のページ"
        >
          ›
        </button>
      )
    }

    return buttons
  }

  return (
    <div className="song-selection-container">
      {/* 検索・フィルターセクション */}
      <div className="search-filter-section">
        <div className="search-input-container">
          <input
            type="text"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder="楽曲名、アーティスト、タグで検索..."
            className="search-input"
            disabled={isSearching}
            autoComplete="off"
            inputMode="text"
            enterKeyHint="search"
          />
          <div className="search-icon">{isSearching ? '⏳' : '🔍'}</div>

          {/* 検索候補 */}
          {searchSuggestions.length > 0 && filters.searchTerm && (
            <div className="search-suggestions">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchTermChange(suggestion)}
                  className="search-suggestion"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* タグフィルター */}
        {(enableAdvancedSearch || externalOnTagFilter) &&
          searchResult.availableTags.length > 0 && (
            <div className="tag-filter-section">
              <div className="tag-filter-label">
                タグでフィルター:
                {filters.selectedTags.length > 0 && (
                  <button
                    onClick={() => {
                      if (enableAdvancedSearch) {
                        setSelectedTags([])
                      }
                      if (externalOnTagFilter) {
                        externalOnTagFilter([])
                      }
                    }}
                    className="clear-tags-button"
                  >
                    クリア
                  </button>
                )}
              </div>
              <div className="tag-filter-chips">
                {searchResult.availableTags.slice(0, 15).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`tag-filter-chip ${filters.selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* コントロールセクション */}
      <div className="controls-section">
        <div className="view-controls">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
            aria-label="リスト表示"
          >
            ☰
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
            aria-label="グリッド表示"
          >
            ⊞
          </button>
        </div>

        <div className="sort-controls">
          <select
            value={filters.sortBy}
            onChange={e =>
              handleSortChange(e.target.value as 'title' | 'recent' | 'artist')
            }
            className="sort-select"
          >
            <option value="title">タイトル順</option>
            <option value="recent">新しい順</option>
            <option value="artist">アーティスト順</option>
          </select>
        </div>

        <div className="results-info">
          {searchResult.totalCount}件中 {startIndex + 1}-
          {Math.min(endIndex, searchResult.filteredCount)}件を表示
          {filters.searchTerm || filters.selectedTags.length > 0 ? (
            <span className="filter-indicator">
              （フィルター適用中: {searchResult.filteredCount}件）
            </span>
          ) : null}
        </div>
      </div>

      {/* 楽曲リスト */}
      <div className={`songs-container ${viewMode}`}>
        {paginatedSongs.length === 0 ? (
          <div className="no-songs">
            {filters.searchTerm || filters.selectedTags.length > 0
              ? '検索条件に一致する楽曲が見つかりません'
              : '楽曲が登録されていません'}
            {enableAdvancedSearch &&
              (filters.searchTerm || filters.selectedTags.length > 0) && (
                <button onClick={clearSearch} className="clear-search-button">
                  検索条件をクリア
                </button>
              )}
          </div>
        ) : (
          paginatedSongs.map(song => (
            <div
              key={song.id}
              className="song-item"
              onClick={e => handleSongSelect(song, e)}
              onTouchEnd={e => handleSongSelect(song, e)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSongSelect(song)
                }
              }}
            >
              <div className="song-main-info">
                <div className="song-title">{song.title}</div>
                <div className="song-details">
                  {song.lyricists.length > 0 && (
                    <span className="song-credit">
                      作詞: {song.lyricists.join(', ')}
                    </span>
                  )}
                  {song.composers.length > 0 && (
                    <span className="song-credit">
                      作曲: {song.composers.join(', ')}
                    </span>
                  )}
                  {song.arrangers.length > 0 && (
                    <span className="song-credit">
                      編曲: {song.arrangers.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {song.tags && song.tags.length > 0 && (
                <div className="song-tags">
                  {song.tags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="song-select-indicator">選択</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="pagination-section">
          <div className="pagination-controls">{renderPaginationButtons()}</div>
          <div className="pagination-info">
            ページ {currentPage} / {totalPages}
          </div>
        </div>
      )}
    </div>
  )
}

export default SongSelectionView
