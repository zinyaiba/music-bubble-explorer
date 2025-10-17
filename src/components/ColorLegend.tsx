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
 */
export interface ColorLegendProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  isVisible?: boolean
  showCounts?: boolean
  categories?: LegendItem[]
  className?: string
}

/**
 * デフォルトの凡例アイテム
 */
const DEFAULT_LEGEND_ITEMS: LegendItem[] = [
  {
    category: 'song',
    color: CATEGORY_COLORS.song,
    label: '楽曲',
    icon: '🎵'
  },
  {
    category: 'lyricist',
    color: CATEGORY_COLORS.lyricist,
    label: '作詞家',
    icon: '✍️'
  },
  {
    category: 'composer',
    color: CATEGORY_COLORS.composer,
    label: '作曲家',
    icon: '🎼'
  },
  {
    category: 'arranger',
    color: CATEGORY_COLORS.arranger,
    label: '編曲家',
    icon: '🎹'
  },
  {
    category: 'tag',
    color: CATEGORY_COLORS.tag,
    label: 'タグ',
    icon: '🏷️'
  }
]

/**
 * ColorLegendコンポーネント
 * Requirements: 19.3, 19.4 - ColorLegendComponentの作成と表示機能
 */
export const ColorLegend: React.FC<ColorLegendProps> = ({
  position = 'top-right',
  isVisible = true,
  showCounts = false,
  categories = DEFAULT_LEGEND_ITEMS,
  className
}) => {
  if (!isVisible) {
    return null
  }

  return (
    <LegendContainer position={position} className={className}>
      <LegendTitle>カテゴリ</LegendTitle>
      <LegendList>
        {categories.map((item) => (
          <LegendItem key={item.category} title={item.label}>
            <ColorIndicator color={item.color} />
            <LegendContent>
              <LegendLabel>
                {item.icon && <LegendIcon>{item.icon}</LegendIcon>}
                {item.label}
              </LegendLabel>
              {showCounts && item.count !== undefined && (
                <LegendCount>({item.count})</LegendCount>
              )}
            </LegendContent>
          </LegendItem>
        ))}
      </LegendList>
    </LegendContainer>
  )
}

/**
 * スタイル定義
 */
const LegendContainer = styled.div<{ position: string }>`
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
  border: 1px solid rgba(224, 224, 224, 0.3);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  
  /* コンパクトサイズ */
  width: auto;
  min-width: unset;
  max-width: unset;
  
  /* モバイル対応 */
  @media (max-width: 768px) {
    padding: 6px;
    
    ${({ position }) => {
      switch (position) {
        case 'top-left':
          return 'top: 60px; left: 10px;' /* ヘッダーの下に配置 */
        case 'top-right':
          return 'top: 60px; right: 10px;' /* ヘッダーの下に配置 */
        case 'bottom-left':
          return 'bottom: 80px; left: 10px;' /* ナビゲーションの上に配置 */
        case 'bottom-right':
          return 'bottom: 80px; right: 10px;' /* ナビゲーションの上に配置 */
        default:
          return 'top: 60px; right: 10px;'
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

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  position: relative;
  cursor: help;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  /* ツールチップ表示 */
  &:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1001;
    margin-bottom: 4px;
  }
`

const ColorIndicator = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
  }
`

const LegendContent = styled.div`
  display: none; /* テキストを非表示にしてアイコンのみ表示 */
`

const LegendLabel = styled.span`
  display: none; /* テキストを非表示 */
`

const LegendIcon = styled.span`
  display: none; /* アイコンを非表示（色のみで判別） */
`

const LegendCount = styled.span`
  display: none; /* カウントを非表示 */
`

/**
 * ColorLegendのフック
 * Requirements: 19.4 - 凡例の動的更新機能
 */
export const useColorLegend = (bubbleStats?: any) => {
  const [legendItems, setLegendItems] = React.useState<LegendItem[]>(DEFAULT_LEGEND_ITEMS)

  React.useEffect(() => {
    if (bubbleStats) {
      const updatedItems = DEFAULT_LEGEND_ITEMS.map(item => ({
        ...item,
        count: bubbleStats[`${item.category}Bubbles`] || 0
      }))
      setLegendItems(updatedItems)
    }
  }, [bubbleStats])

  return {
    legendItems,
    setLegendItems
  }
}

export default ColorLegend