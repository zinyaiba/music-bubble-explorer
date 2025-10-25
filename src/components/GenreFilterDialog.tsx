import React, { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'

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

  /**
   * キーボードイベントハンドラー
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        handleApplyFilter()
      }
    },
    [onClose, handleApplyFilter]
  )

  if (!isVisible) {
    return null
  }

  const isAllSelected = localSelectedGenres.length === availableGenres.length
  const hasSelection = localSelectedGenres.length > 0

  return (
    <DialogOverlay onClick={onClose} onKeyDown={handleKeyDown} tabIndex={-1}>
      <DialogContainer onClick={e => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>ジャンルフィルター</DialogTitle>
          <CloseButton onClick={onClose} aria-label="閉じる">
            ×
          </CloseButton>
        </DialogHeader>

        <DialogContent>
          <FilterInfo>
            {availableGenres.length}個のジャンルから選択
            {hasSelection && (
              <SelectedCount>
                （{localSelectedGenres.length}個選択中）
              </SelectedCount>
            )}
          </FilterInfo>

          <ControlButtons>
            <SelectAllButton onClick={handleSelectAll}>
              {isAllSelected ? '全て解除' : '全て選択'}
            </SelectAllButton>
          </ControlButtons>

          <GenreList>
            {availableGenres.map(genre => {
              const isSelected = localSelectedGenres.includes(genre)
              return (
                <GenreItem key={genre}>
                  <GenreCheckbox
                    type="checkbox"
                    id={`genre-${genre}`}
                    checked={isSelected}
                    onChange={() => handleGenreToggle(genre)}
                  />
                  <GenreLabel
                    htmlFor={`genre-${genre}`}
                    isSelected={isSelected}
                  >
                    <GenreIcon isSelected={isSelected}>🏷️</GenreIcon>
                    <GenreName>{genre}</GenreName>
                  </GenreLabel>
                </GenreItem>
              )
            })}
          </GenreList>

          {availableGenres.length === 0 && (
            <EmptyState>利用可能なジャンルがありません</EmptyState>
          )}
        </DialogContent>

        <DialogFooter>
          <ActionButtons>
            <CancelButton onClick={onClose}>キャンセル</CancelButton>
            <ClearButton onClick={handleClearFilter} disabled={!hasSelection}>
              クリア
            </ClearButton>
            <ApplyButton onClick={handleApplyFilter} disabled={!hasSelection}>
              適用 ({localSelectedGenres.length})
            </ApplyButton>
          </ActionButtons>
        </DialogFooter>
      </DialogContainer>
    </DialogOverlay>
  )
}

/**
 * スタイル定義
 */
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-end;
  }
`

const DialogContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    max-height: 90vh;
    border-radius: 12px 12px 0 0;
  }
`

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
`

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`

const DialogContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
`

const FilterInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const SelectedCount = styled.span`
  color: #2196f3;
  font-weight: 500;
`

const ControlButtons = styled.div`
  margin-bottom: 16px;
`

const SelectAllButton = styled.button`
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  &:hover {
    background: #eeeeee;
    border-color: #cccccc;
  }
`

const GenreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`

const GenreItem = styled.div`
  display: flex;
  align-items: center;
`

const GenreCheckbox = styled.input`
  margin: 0;
  margin-right: 12px;
  width: 18px;
  height: 18px;
  cursor: pointer;
`

const GenreLabel = styled.label<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  flex: 1;
  transition: all 0.2s ease;

  ${({ isSelected }) =>
    isSelected
      ? `
    background: #E3F2FD;
    color: #1976D2;
  `
      : `
    &:hover {
      background: #F5F5F5;
    }
  `}
`

const GenreIcon = styled.span<{ isSelected: boolean }>`
  font-size: 16px;
  opacity: ${({ isSelected }) => (isSelected ? 1 : 0.6)};
`

const GenreName = styled.span`
  font-size: 14px;
  font-weight: 500;
`

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 40px 20px;
`

const DialogFooter = styled.div`
  padding: 16px 24px 20px;
  border-top: 1px solid #e0e0e0;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`

const BaseButton = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
  }
`

const CancelButton = styled(BaseButton)`
  background: #f5f5f5;
  color: #666;
  border-color: #e0e0e0;

  &:hover:not(:disabled) {
    background: #eeeeee;
    border-color: #cccccc;
  }
`

const ClearButton = styled(BaseButton)`
  background: #fff3e0;
  color: #f57c00;
  border-color: #ffb74d;

  &:hover:not(:disabled) {
    background: #ffe0b2;
    border-color: #ff9800;
  }
`

const ApplyButton = styled(BaseButton)`
  background: #2196f3;
  color: white;

  &:hover:not(:disabled) {
    background: #1976d2;
  }
`

export default GenreFilterDialog
