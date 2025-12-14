import React, { useState, useCallback, useMemo } from 'react'
import { Song } from '@/types/music'
import TagInput from './TagInput'
import './TagSelectionView.css'

export interface TagSelectionViewProps {
  song: Song
  selectedTags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  onBack?: () => void
  onRegister?: () => void
  isLoading?: boolean
  error?: string | null
  maxTags?: number
  warningThreshold?: number
}

/**
 * タグ選択・登録ビューコンポーネント
 * 既存タグの一覧表示と選択機能、新規タグの入力・追加機能、タグの視覚的表示（チップ形式）を提供
 * Requirements: 1.2, 1.3, 1.4
 */
export const TagSelectionView: React.FC<TagSelectionViewProps> = ({
  song,
  selectedTags,
  availableTags,
  onTagsChange,
  onBack,
  onRegister,
  isLoading = false,
  error = null,
  maxTags = 100,
  warningThreshold = 80,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)

  // 検索でフィルタリングされた利用可能なタグ
  const filteredAvailableTags = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableTags
    }

    return availableTags.filter(tag =>
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [availableTags, searchTerm])

  // 表示する利用可能なタグ（選択済みを除外）
  const displayedAvailableTags = useMemo(() => {
    // 選択済みタグを除外
    const unselectedTags = filteredAvailableTags.filter(
      tag => !selectedTags.includes(tag)
    )

    if (showAllTags) {
      return unselectedTags
    }

    // デフォルトでは最初の30個まで表示（100個対応のため増加）
    return unselectedTags.slice(0, 30)
  }, [filteredAvailableTags, selectedTags, showAllTags])

  // タグ制限の状態を計算
  const tagLimitStatus = useMemo(() => {
    const currentCount = selectedTags.length
    const isNearLimit =
      currentCount >= warningThreshold && currentCount < maxTags
    const isAtLimit = currentCount >= maxTags
    const remainingTags = maxTags - currentCount

    return {
      currentCount,
      maxTags,
      remainingTags,
      isNearLimit,
      isAtLimit,
      warningMessage: isNearLimit
        ? `タグ数が制限に近づいています（${currentCount}/${maxTags}個）`
        : null,
      errorMessage: isAtLimit
        ? `タグ数が上限に達しました（${currentCount}/${maxTags}個）`
        : null,
    }
  }, [selectedTags.length, maxTags, warningThreshold])

  // タグの追加処理
  const handleTagAdd = useCallback(
    (tag: string) => {
      if (selectedTags.includes(tag) || selectedTags.length >= maxTags) {
        return
      }

      const newTags = [...selectedTags, tag]
      onTagsChange(newTags)
    },
    [selectedTags, onTagsChange, maxTags]
  )

  // タグの削除処理
  const handleTagRemove = useCallback(
    (tag: string) => {
      const newTags = selectedTags.filter(t => t !== tag)
      onTagsChange(newTags)
    },
    [selectedTags, onTagsChange]
  )

  // TagInputコンポーネント用のハンドラー（既存のタグを保持）
  const handleTagInputChange = useCallback(
    (newTags: string[]) => {
      // 新しく追加されたタグのみを既存のselectedTagsに追加
      const addedTags = newTags.filter(tag => !selectedTags.includes(tag))
      if (addedTags.length > 0) {
        const updatedTags = [...selectedTags, ...addedTags]
        onTagsChange(updatedTags)
      }
    },
    [selectedTags, onTagsChange]
  )

  // 検索語句の変更処理
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value)
    },
    []
  )

  // 検索のクリア
  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  // 全タグ表示の切り替え
  const handleToggleShowAll = useCallback(() => {
    setShowAllTags(prev => !prev)
  }, [])

  return (
    <div className="tag-selection-view">
      <div className="tag-selection-content">
        {/* 楽曲情報セクション */}
        <div className="selected-song-info">
          <h3 className="song-title">{song.title}</h3>
          <div className="song-credits">
            {song.lyricists.length > 0 && (
              <div className="song-credit">
                作詞: {song.lyricists.join(', ')}
              </div>
            )}
            {song.composers.length > 0 && (
              <div className="song-credit">
                作曲: {song.composers.join(', ')}
              </div>
            )}
            {song.arrangers.length > 0 && (
              <div className="song-credit">
                編曲: {song.arrangers.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 1. 選択済みタグセクション（登録中のタグ） */}
        <div className="selected-tags-section">
          <div className="section-header">
            <h4 className="section-title">
              選択済みタグ ({tagLimitStatus.currentCount}/
              {tagLimitStatus.maxTags})
            </h4>
            {tagLimitStatus.remainingTags <= 20 &&
              tagLimitStatus.remainingTags > 0 && (
                <div className="tag-limit-info">
                  残り{tagLimitStatus.remainingTags}個まで追加可能
                </div>
              )}
          </div>

          {/* タグ制限の警告・エラー表示 */}
          {tagLimitStatus.warningMessage && (
            <div className="tag-limit-warning">
              ⚠️ {tagLimitStatus.warningMessage}
            </div>
          )}
          {tagLimitStatus.errorMessage && (
            <div className="tag-limit-error">
              🚫 {tagLimitStatus.errorMessage}
            </div>
          )}

          {selectedTags.length > 0 ? (
            <div className="selected-tags-container">
              {selectedTags.map((tag, index) => (
                <div key={index} className="selected-tag-chip">
                  <span className="tag-text">{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="tag-remove-button"
                    disabled={isLoading}
                    aria-label={`タグ「${tag}」を削除`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tags-message">
              タグが選択されていません。下から選択するか、新しいタグを追加してください。
            </div>
          )}
        </div>

        <div className="available-tags-section">
          <div className="section-header">
            <h4 className="section-title">
              選択可能なタグ (
              {availableTags.filter(tag => !selectedTags.includes(tag)).length})
            </h4>

            {/* 検索入力 */}
            <form
              className="tag-search-container"
              onSubmit={e => {
                e.preventDefault()
                // Enterキーでの送信を防止（Android対応）
              }}
            >
              <input
                type="text"
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
                placeholder="タグを検索..."
                className="tag-search-input"
                disabled={isLoading}
                inputMode="text"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="clear-search-button"
                  disabled={isLoading}
                >
                  ×
                </button>
              )}
            </form>
          </div>

          {displayedAvailableTags.length > 0 ? (
            <>
              <div className="tag-chips-container">
                {displayedAvailableTags.map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTagAdd(tag)}
                    className="available-tag-chip"
                    disabled={isLoading || selectedTags.length >= maxTags}
                  >
                    <span className="tag-text">{tag}</span>
                    <span className="add-icon">+</span>
                  </button>
                ))}
              </div>

              {/* もっと見るボタン */}
              {!showAllTags &&
                filteredAvailableTags.length >
                  displayedAvailableTags.length && (
                  <button
                    type="button"
                    onClick={handleToggleShowAll}
                    className="show-more-button"
                    disabled={isLoading}
                  >
                    さらに
                    {filteredAvailableTags.length -
                      displayedAvailableTags.length}
                    個のタグを表示
                  </button>
                )}

              {showAllTags && (
                <button
                  type="button"
                  onClick={handleToggleShowAll}
                  className="show-less-button"
                  disabled={isLoading}
                >
                  表示を減らす
                </button>
              )}
            </>
          ) : (
            <div className="no-available-tags">
              {searchTerm
                ? '検索条件に一致するタグが見つかりません'
                : '利用可能なタグがありません'}
            </div>
          )}
        </div>

        {/* 3. タグ入力セクション（新規登録） */}
        <div className="tag-input-section">
          <h4 className="section-title left-aligned">新規タグの登録</h4>
          <TagInput
            tags={[]}
            onTagsChange={handleTagInputChange}
            existingTags={availableTags.filter(
              tag => !selectedTags.includes(tag)
            )}
            maxTags={maxTags - selectedTags.length}
            placeholder="新しいタグを入力してください"
            disabled={isLoading || tagLimitStatus.isAtLimit}
          />
          <div className="help-text">
            ジャンルやテーマを個別に入力してください。既存のタグは候補として表示されます。
          </div>
        </div>

        {/* アクションボタン（ヘルプテキストの下） */}
        <div className="action-buttons-section">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="secondary-button"
              disabled={isLoading}
            >
              戻る
            </button>
          )}

          {onRegister && (
            <button
              type="button"
              onClick={onRegister}
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  登録中...
                </>
              ) : (
                'タグを登録'
              )}
            </button>
          )}
        </div>

        {/* エラー表示 */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

export default TagSelectionView
