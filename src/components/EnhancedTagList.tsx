import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { BubbleEntity } from '@/types/bubble'
import { useTagList, TagListItem, TagSortBy } from '@/hooks/useTagList'
import { useTagRename } from '@/hooks/useTagRename'
import { StandardLayout } from './StandardLayout'
import { TagEditDialog } from './TagEditDialog'
import { TagMergeDialog } from './TagMergeDialog'
import { TagShareDialog } from './TagShareDialog'
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
 * Requirements: 1.1, 2.1, 3.2, 3.3 (Tag Rename and Merge)
 * Updated to use StandardLayout template for full-screen consistency
 */
export const EnhancedTagList: React.FC<EnhancedTagListProps> = ({
  isVisible,
  onClose,
  onTagClick,
  onTagDetailOpen,
}) => {
  // Use custom hook for tag management
  const { filterAndSortTags, isLoading, error, refreshData, songs, tags } =
    useTagList()

  // Use custom hook for tag rename/merge functionality
  // Requirements: 1.1, 2.1 - タグ編集機能の統合
  const {
    editingTagId,
    editingValue,
    mergeDialogOpen,
    mergeSourceTag,
    mergeTargetTag,
    sourceSongCount,
    targetSongCount,
    isLoading: isRenameLoading,
    error: renameError,
    successMessage,
    startEditing,
    cancelEditing,
    submitRename,
    confirmMerge,
    cancelMerge,
    clearMessages,
  } = useTagRename({
    songs,
    tags,
    onSuccess: refreshData,
  })

  // 編集中のタグ名を取得
  const editingTagName = useMemo(() => {
    if (!editingTagId) return ''
    const tag = tags.find(t => t.id === editingTagId)
    return tag?.name || editingValue || ''
  }, [editingTagId, tags, editingValue])

  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<TagSortBy>('frequency')
  const [isCompactView, setIsCompactView] = useState(false) // コンパクト表示モード

  // 共有通知の状態管理 - Requirements: 3.2, 3.3, 3.4
  const [shareNotification, setShareNotification] = useState<{
    type: 'success' | 'error'
    message: string
    shareText?: string
  } | null>(null)

  // 共有ダイアログの状態管理
  const [shareDialogTagName, setShareDialogTagName] = useState<string | null>(
    null
  )

  // タグ一覧が表示される時に最新データを再取得
  useEffect(() => {
    if (isVisible) {
      console.log('🏷️ EnhancedTagList: Visible - refreshing data')
      refreshData()
    }
  }, [isVisible, refreshData])

  // 成功メッセージを自動的にクリア - Requirements: 3.3
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        clearMessages()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, clearMessages])

  // 共有通知を自動的にクリア - Requirements: 3.4
  useEffect(() => {
    if (shareNotification) {
      const timer = setTimeout(() => {
        setShareNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [shareNotification])

  // 共有成功ハンドラー - Requirements: 3.2
  const handleShareSuccess = useCallback((tagName: string) => {
    console.log('🔗 EnhancedTagList: Share success', { tagName })
    setShareNotification({
      type: 'success',
      message: 'コピーしました！Xに貼り付けてね 🐦',
    })
  }, [])

  // 共有エラーハンドラー - Requirements: 3.3
  const handleShareError = useCallback((error: string, shareText?: string) => {
    console.log('🔗 EnhancedTagList: Share error', { error })
    setShareNotification({
      type: 'error',
      message: error,
      shareText,
    })
  }, [])

  // 共有ダイアログを開く
  const handleOpenShareDialog = useCallback((tagName: string) => {
    console.log('🔗 EnhancedTagList: Opening share dialog', { tagName })
    setShareDialogTagName(tagName)
  }, [])

  // 共有ダイアログを閉じる
  const handleCloseShareDialog = useCallback(() => {
    setShareDialogTagName(null)
  }, [])

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

  // Handle edit button click - Requirements: 1.1
  const handleEditClick = useCallback(
    (e: React.MouseEvent, tag: TagListItem) => {
      e.stopPropagation() // タグクリックイベントを防止
      console.log('🏷️ EnhancedTagList: Edit button clicked', {
        tagId: tag.id,
        tagName: tag.name,
      })
      startEditing(tag.id, tag.name)
    },
    [startEditing]
  )

  // Handle save from edit dialog
  const handleSaveEdit = useCallback(
    (newName: string) => {
      console.log('🏷️ EnhancedTagList: Saving edit', { newName })
      submitRename(newName)
    },
    [submitRename]
  )

  // Handle cancel from edit dialog
  const handleCancelEdit = useCallback(() => {
    console.log('🏷️ EnhancedTagList: Canceling edit')
    cancelEditing()
  }, [cancelEditing])

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
                <button
                  className={`view-toggle-button ${isCompactView ? 'active' : ''}`}
                  onClick={() => setIsCompactView(!isCompactView)}
                  aria-label={
                    isCompactView
                      ? '詳細表示に切り替え'
                      : 'コンパクト表示に切り替え'
                  }
                  title={isCompactView ? '詳細表示' : 'コンパクト表示'}
                  type="button"
                >
                  {isCompactView ? '☰' : '▤'}
                </button>
              </div>
            </div>

            {/* Tag List (Requirements: 21.1, 21.2, 21.5) */}
            <div
              className={`tag-list-content grid ${isCompactView ? 'compact-view' : ''}`}
            >
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
                <div
                  className={`tag-grid grid ${isCompactView ? 'compact' : ''}`}
                >
                  {filteredAndSortedTags.map(tag => (
                    <div
                      key={tag.id}
                      className={`tag-item ${isCompactView ? 'compact' : ''}`}
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
                      {!isCompactView && (
                        <div className="tag-info">
                          <span className="song-count">{tag.songCount}曲</span>
                        </div>
                      )}
                      {/* 共有ボタン - Requirements: 1.1, 1.3 */}
                      <button
                        className="tag-share-button"
                        onClick={e => {
                          e.stopPropagation()
                          handleOpenShareDialog(tag.name)
                        }}
                        aria-label={`タグ「${tag.name}」をXで共有`}
                        title="Xで共有"
                        type="button"
                      >
                        🔗
                      </button>
                      {/* 編集ボタン - Requirements: 1.1, 4.1 */}
                      <button
                        className="tag-edit-button"
                        onClick={e => handleEditClick(e, tag)}
                        aria-label={`タグ「${tag.name}」を編集`}
                        title="タグ名を編集"
                        type="button"
                      >
                        ✏️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* 成功通知 - Requirements: 3.3 */}
        {successMessage && (
          <div
            className="tag-success-notification"
            role="status"
            aria-live="polite"
          >
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        {/* 共有通知（グローバル）- Requirements: 3.2, 3.3, 3.4 */}
        {shareNotification && (
          <div
            className={`tag-share-notification-global ${shareNotification.type}`}
            role="status"
            aria-live="polite"
          >
            <span className="notification-icon">
              {shareNotification.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span className="notification-message">
              {shareNotification.message}
            </span>
            {/* エラー時に手動コピー用テキストを表示 - Requirements: 3.3 */}
            {shareNotification.type === 'error' &&
              shareNotification.shareText && (
                <div className="notification-share-text">
                  <textarea
                    readOnly
                    value={shareNotification.shareText}
                    onClick={e => (e.target as HTMLTextAreaElement).select()}
                    aria-label="共有テキスト（手動でコピーしてください）"
                  />
                </div>
              )}
          </div>
        )}

        {/* タグ編集ダイアログ - Requirements: 1.1 */}
        <TagEditDialog
          isOpen={!!editingTagId}
          tagName={editingTagName}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isLoading={isRenameLoading}
          error={renameError}
        />

        {/* タグ統合確認ダイアログ - Requirements: 2.1, 2.2 */}
        <TagMergeDialog
          isOpen={mergeDialogOpen}
          sourceTag={mergeSourceTag || ''}
          targetTag={mergeTargetTag || ''}
          sourceSongCount={sourceSongCount}
          targetSongCount={targetSongCount}
          onConfirm={confirmMerge}
          onCancel={cancelMerge}
          isLoading={isRenameLoading}
        />

        {/* タグ共有ダイアログ */}
        <TagShareDialog
          isOpen={!!shareDialogTagName}
          tagName={shareDialogTagName || ''}
          onClose={handleCloseShareDialog}
          onShareSuccess={() => handleShareSuccess(shareDialogTagName || '')}
          onShareError={handleShareError}
        />
      </div>
    </StandardLayout>
  )
}

export default EnhancedTagList
