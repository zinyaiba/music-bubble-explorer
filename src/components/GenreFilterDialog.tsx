import React, { useState, useEffect, useCallback } from 'react'
import { UnifiedDialogLayout } from './UnifiedDialogLayout'

/**
 * ジャンルフィルターダイアログのプロパティ
 * Requirements: 4.2, 4.3 - ジャンル選択ダイアログの作成と複数ジャンル選択機能
 */
export interface GenreFilterDialogProps {
  isVisible: boolean
  availableGenres: string[]
  selectedGenres: string[]
  onApplyFilter: (genres: string[]) => void
  onClearFilter: () => void
  onClose: () => void
}

/**
 * GenreFilterDialog - ジャンル選択ダイアログコンポーネント
 * Requirements: 4.2, 4.3 - ジャンル選択ダイアログの作成と複数ジャンル選択機能の実装
 */
export const GenreFilterDialog: React.FC<GenreFilterDialogProps> = ({
  isVisible,
  availableGenres,
  selectedGenres,
  onApplyFilter,
  onClearFilter,
  onClose,
}) => {
  const [localSelectedGenres, setLocalSelectedGenres] =
    useState<string[]>(selectedGenres)

  // 外部からの選択状態の変更を反映
  useEffect(() => {
    setLocalSelectedGenres(selectedGenres)
  }, [selectedGenres])

  /**
   * ジャンルの選択/解除を切り替え
   */
  const handleGenreToggle = useCallback((genre: string) => {
    setLocalSelectedGenres(prev => {
      const isSelected = prev.includes(genre)
      if (isSelected) {
        return prev.filter(g => g !== genre)
      } else {
        return [...prev, genre]
      }
    })
  }, [])

  /**
   * 全選択/全解除の切り替え
   */
  const handleSelectAll = useCallback(() => {
    if (localSelectedGenres.length === availableGenres.length) {
      // 全て選択されている場合は全解除
      setLocalSelectedGenres([])
    } else {
      // 一部または未選択の場合は全選択
      setLocalSelectedGenres([...availableGenres])
    }
  }, [localSelectedGenres.length, availableGenres])

  /**
   * フィルターを適用
   */
  const handleApplyFilter = useCallback(() => {
    onApplyFilter(localSelectedGenres)
    onClose()
  }, [localSelectedGenres, onApplyFilter, onClose])

  /**
   * フィルターをクリア
   */
  const handleClearFilter = useCallback(() => {
    setLocalSelectedGenres([])
    onClearFilter()
    onClose()
  }, [onClearFilter, onClose])

  if (!isVisible) {
    return null
  }

  const isAllSelected = localSelectedGenres.length === availableGenres.length
  const hasSelection = localSelectedGenres.length > 0

  return (
    <UnifiedDialogLayout
      isVisible={isVisible}
      onClose={onClose}
      title="ジャンルフィルター"
      size="standard"
      mobileOptimized={true}
      showFooter={true}
      footerContent={
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '1px solid #e0e0e0',
              background: '#f5f5f5',
              color: '#666',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleClearFilter}
            disabled={!hasSelection}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              border: '1px solid #ffb74d',
              background: '#fff3e0',
              color: '#f57c00',
              opacity: hasSelection ? 1 : 0.5,
            }}
          >
            クリア
          </button>
          <button
            onClick={handleApplyFilter}
            disabled={!hasSelection}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: hasSelection ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              border: '1px solid transparent',
              background: '#2196f3',
              color: 'white',
              opacity: hasSelection ? 1 : 0.5,
            }}
          >
            適用 ({localSelectedGenres.length})
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {availableGenres.length}個のジャンルから選択
          {hasSelection && (
            <span style={{ color: '#2196f3', fontWeight: '500' }}>
              （{localSelectedGenres.length}個選択中）
            </span>
          )}
        </div>

        <div>
          <button
            onClick={handleSelectAll}
            style={{
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              color: '#333',
              cursor: 'pointer',
            }}
          >
            {isAllSelected ? '全て解除' : '全て選択'}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {availableGenres.map(genre => {
            const isSelected = localSelectedGenres.includes(genre)
            return (
              <div
                key={genre}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  id={`genre-${genre}`}
                  checked={isSelected}
                  onChange={() => handleGenreToggle(genre)}
                  style={{
                    margin: '0 12px 0 0',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <label
                  htmlFor={`genre-${genre}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    flex: 1,
                    transition: 'all 0.2s ease',
                    background: isSelected ? '#E3F2FD' : 'transparent',
                    color: isSelected ? '#1976D2' : 'inherit',
                  }}
                >
                  <span
                    style={{ fontSize: '16px', opacity: isSelected ? 1 : 0.6 }}
                  >
                    🏷️
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>
                    {genre}
                  </span>
                </label>
              </div>
            )
          })}
        </div>

        {availableGenres.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#999',
              fontSize: '14px',
              padding: '40px 20px',
            }}
          >
            利用可能なジャンルがありません
          </div>
        )}
      </div>
    </UnifiedDialogLayout>
  )
}

export default GenreFilterDialog
