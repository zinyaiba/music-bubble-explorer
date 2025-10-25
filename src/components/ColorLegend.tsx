import React from 'react'
import styled from 'styled-components'
import { CATEGORY_COLORS } from '@/services/roleBasedBubbleManager'

/**
 * 凡例アイテムの型定義
 * Requirements: 19.4 - 各カテゴリの色と意味を明確に示す凡例を提供する
 */
export interface LegendItem {
  category: keyof typeof CATEGORY_COLORS
  color: string
  label: string
  count?: number
  icon?: string
}

/**
 * ColorLegendコンポーネントのプロパティ
 * Requirements: 19.3, 19.4 - カテゴリ別の色分けの凡例を画面に表示する
 * Requirements: 4.1, 5.1, 5.2 - 凡例アイコンをクリック可能に変更とフィルター状態の視覚的表示
 */
export interface ColorLegendProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  isVisible?: boolean
  showCounts?: boolean
  categories?: LegendItem[]
  className?: string
  // カテゴリ別フィルタリング機能（複数選択対応）
  onCategoryClick?: (category: keyof typeof CATEGORY_COLORS) => void
  selectedCategories?: (keyof typeof CATEGORY_COLORS)[]
  filteredCount?: number
  totalCount?: number
  // インタラクティブ機能の強化
  enableInteraction?: boolean
}

/**
 * デフォルトの凡例アイテム
 */
const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  {
    category: 'song',
    color: CATEGORY_COLORS.song,
    label: '楽曲',
  },
  {
    category: 'lyricist',
    color: CATEGORY_COLORS.lyricist,
    label: '作詞',
  },
  {
    category: 'composer',
    color: CATEGORY_COLORS.composer,
    label: '作曲',
  },
  {
    category: 'arranger',
    color: CATEGORY_COLORS.arranger,
    label: '編曲',
  },
  {
    category: 'tag',
    color: CATEGORY_COLORS.tag,
    label: 'タグ',
  },
]

/**
 * ColorLegendコンポーネント
 * Requirements: 19.3, 19.4 - ColorLegendComponentの作成と表示機能
 * Requirements: 4.1, 5.1, 5.2 - 凡例アイコンをクリック可能に変更とフィルター状態の視覚的表示
 */
export const ColorLegend: React.FC<ColorLegendProps> = ({
  position = 'top-right',
  isVisible = true,
  showCounts = false,
  categories = DEFAULT_LEGEND_ITEMS,
  className,
  onCategoryClick,
  selectedCategories = [],
  filteredCount,
  totalCount,
  enableInteraction = true,
}) => {
  // window.console.log('🔍 [INIT] ColorLegend component initialized')

  if (!isVisible) {
    // window.console.log('🔍 [DEBUG] ColorLegend not visible, returning null')
    return null
  }

  const isClickable = !!onCategoryClick && enableInteraction
  const isFilterActive = selectedCategories.length > 0
  const showFilterStatus =
    isFilterActive && filteredCount !== undefined && totalCount !== undefined

  // デバッグ: ColorLegendの状態を確認
  // console.log('🔍 [DEBUG] ColorLegend render - isClickable:', isClickable)
  // console.log('🔍 [DEBUG] ColorLegend render - onCategoryClick exists:', !!onCategoryClick)
  // console.log('🔍 [DEBUG] ColorLegend render - enableInteraction:', enableInteraction)
  // console.log('🔍 [DEBUG] ColorLegend render - selectedCategories:', selectedCategories)

  /**
   * カテゴリクリック時の処理（複数選択対応）
   */
  const handleCategoryClick = (category: keyof typeof CATEGORY_COLORS) => {
    // console.log('🔍 [DEBUG] ColorLegend - handleCategoryClick called with:', category)
    // console.log('🔍 [DEBUG] ColorLegend - onCategoryClick exists:', !!onCategoryClick)
    if (onCategoryClick) {
      // console.log('🔍 [DEBUG] ColorLegend - Calling onCategoryClick with:', category)
      onCategoryClick(category)
    }
  }

  return (
    <LegendContainer
      position={position}
      className={className}
      isFilterActive={isFilterActive}
    >
      <LegendTitle>カテゴリ</LegendTitle>
      <LegendList>
        {categories.map(item => {
          const isSelected = selectedCategories.includes(item.category)
          const isItemClickable = isClickable

          return (
            <LegendItem
              key={item.category}
              isClickable={isItemClickable}
              isSelected={isSelected}
              onClick={
                isItemClickable
                  ? () => {
                      // window.console.log('🔍 [CLICK] LegendItem clicked:', item.category)
                      handleCategoryClick(item.category)
                    }
                  : undefined
              }
              role={isItemClickable ? 'button' : undefined}
              tabIndex={isItemClickable ? 0 : undefined}
              aria-label={`${item.label}${isSelected ? '（選択中）' : ''}`}
              onKeyDown={
                isItemClickable
                  ? e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleCategoryClick(item.category)
                      }
                    }
                  : undefined
              }
            >
              <ColorIndicator
                color={item.color}
                isSelected={isSelected}
                isClickable={isItemClickable}
              />
              <LegendContent isVisible={showCounts}>
                <LegendLabel isSelected={isSelected}>{item.label}</LegendLabel>
                {/* {showCounts && item.count !== undefined && (
                  <LegendCount>({item.count})</LegendCount>
                )} */}
              </LegendContent>
            </LegendItem>
          )
        })}
      </LegendList>

      {/* フィルター状態の表示 */}
      {showFilterStatus && (
        <FilterStatus>
          <FilterIcon isActive={isFilterActive}>🔍</FilterIcon>
          <FilterText>
            {filteredCount}/{totalCount}
          </FilterText>
          {selectedCategories.length > 0 && (
            <FilterCategory>
              {selectedCategories.length === 1
                ? categories.find(c => c.category === selectedCategories[0])
                    ?.label
                : `${selectedCategories.length}個選択中`}
            </FilterCategory>
          )}
        </FilterStatus>
      )}

      {/* 全選択解除ボタン */}
      {isFilterActive && isClickable && (
        <ClearFilterButton
          onClick={() => {
            // 全カテゴリを解除するため、各カテゴリを個別に解除
            selectedCategories.forEach(category => {
              onCategoryClick?.(category)
            })
          }}
          aria-label="全てのフィルターを解除"
        >
          ×
        </ClearFilterButton>
      )}
    </LegendContainer>
  )
}

/**
 * スタイル定義
 */
const LegendContainer = styled.div.withConfig({
  shouldForwardProp: prop => !['position', 'isFilterActive'].includes(prop),
})<{
  position: string
  isFilterActive?: boolean
}>`
  position: fixed;
  ${({ position }) => {
    switch (position) {
      case 'top-left':
        return 'top: 20px; left: 20px;'
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;'
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;'
      default:
        return 'top: 20px; right: 20px;'
    }
  }}

  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid
    ${({ isFilterActive }) =>
      isFilterActive ? 'rgba(33, 150, 243, 0.5)' : 'rgba(224, 224, 224, 0.3)'};
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.2s ease;
  position: relative;

  /* フィルターアクティブ時のスタイル */
  ${({ isFilterActive }) =>
    isFilterActive &&
    `
    background: rgba(252, 216, 241, 0.97);
    border-color: rgba(255, 254, 255, 0.65);
  `}

  /* モバイル対応 */
  @media (max-width: 768px) {
    padding: 6px;

    ${({ position }) => {
      switch (position) {
        case 'top-left':
          return 'top: 60px; left: 10px;'
        case 'top-right':
          return 'top: 60px; right: 10px;'
        case 'bottom-left':
          return 'bottom: 10px; left: 10px;'
        case 'bottom-right':
          return 'bottom: 10px; right: 8px;'
        default:
          return 'bottom: 10px; right: 10px;'
      }
    }}
  }
`

const LegendTitle = styled.h3`
  display: none; /* タイトルを非表示にしてコンパクト化 */
`

const LegendList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row; /* 横並びでコンパクト化 */
  gap: 4px;

  @media (max-width: 768px) {
    gap: 3px;
  }
`

const LegendItem = styled.li.withConfig({
  shouldForwardProp: prop => !['isClickable', 'isSelected'].includes(prop),
})<{
  isClickable?: boolean
  isSelected?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  position: relative;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'help')};
  transition: all 0.2s ease;
  min-height: 32px;
  min-width: 32px;

  /* 選択状態のスタイル - 背景色のみ */
  background: transparent;

  /* クリック可能な場合のホバー効果 */
  ${({ isClickable }) =>
    isClickable &&
    `
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
    
    &:focus {
      outline: none;
    }
  `}

  /* 通常のホバー効果（クリック不可の場合） */
  ${({ isClickable }) =>
    !isClickable &&
    `
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  `}



  /* モバイル対応 */
  @media (max-width: 768px) {
    min-height: 36px;
    min-width: 36px;

    ${({ isClickable }) =>
      isClickable &&
      `
      /* タップ領域を拡大 */
      &::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        z-index: -1;
      }
    `}
  }
`

const ColorIndicator = styled.div.withConfig({
  shouldForwardProp: prop =>
    !['color', 'isSelected', 'isClickable'].includes(prop),
})<{
  color: string
  isSelected?: boolean
  isClickable?: boolean
}>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }
`

const LegendContent = styled.div.withConfig({
  shouldForwardProp: prop => !['isVisible'].includes(prop),
})<{ isVisible?: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  margin-left: 4px;
  font-size: 10px;
`

const LegendLabel = styled.span.withConfig({
  shouldForwardProp: prop => !['isSelected'].includes(prop),
})<{ isSelected?: boolean }>`
  color: ${({ isSelected }) => (isSelected ? '#e91e63' : '#333')};
  font-weight: ${({ isSelected }) => (isSelected ? '600' : '500')};
  white-space: nowrap;
  transition: all 0.2s ease;
`

/* フィルター状態表示のスタイル */
const FilterStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  font-size: 10px;
  color: #1976d2;
`

const FilterIcon = styled.span.withConfig({
  shouldForwardProp: prop => !['isActive'].includes(prop),
})<{ isActive: boolean }>`
  font-size: 10px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};
`

const FilterText = styled.span`
  font-weight: 500;
  font-size: 10px;
`

const FilterCategory = styled.span`
  font-weight: 600;
  font-size: 10px;
  color: #1976d2;
  margin-left: 4px;
`

/* フィルター解除ボタンのスタイル */
const ClearFilterButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  z-index: 1001;

  &:hover {
    background: #d32f2f;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid #f44336;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    top: -10px;
    right: -10px;
    font-size: 14px;
  }
`

/**
 * ColorLegendのフック
 * Requirements: 19.4 - 凡例の動的更新機能
 */
export const useColorLegend = (bubbleStats?: any) => {
  const [legendItems, setLegendItems] =
    React.useState<LegendItem[]>(DEFAULT_LEGEND_ITEMS)

  React.useEffect(() => {
    if (bubbleStats) {
      const updatedItems = DEFAULT_LEGEND_ITEMS.map(item => ({
        ...item,
        count: bubbleStats[`${item.category}Bubbles`] || 0,
      }))
      setLegendItems(updatedItems)
    }
  }, [bubbleStats])

  return {
    legendItems,
    setLegendItems,
  }
}

export default ColorLegend
