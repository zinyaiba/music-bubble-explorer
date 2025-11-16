import React, { useCallback, useMemo, useState } from 'react'
import { ColorLegend, ColorLegendProps } from './ColorLegend'
import { BubbleEntity } from '../types/bubble'
import { AnalyticsService } from '@/services/analyticsService'

import { CATEGORY_COLORS } from '../services/roleBasedBubbleManager'

/**
 * カテゴリフィルター統合コンポーネントのプロパティ
 * Requirements: 5.1, 5.2, 5.3 - カテゴリ別フィルタリング機能の統合（複数選択対応）
 */
export interface GenreFilterIntegrationProps {
  bubbles: BubbleEntity[]
  onSelectedCategoriesChange?: (
    categories: (keyof typeof CATEGORY_COLORS)[]
  ) => void
  colorLegendProps?: Partial<ColorLegendProps>
  className?: string
}

/**
 * GenreFilterIntegration - カテゴリ別フィルタリング機能を統合したコンポーネント
 * Requirements: 5.1, 5.2, 5.3 - 凡例アイコンのインタラクティブ化とカテゴリ別フィルタリング
 */
export const GenreFilterIntegration: React.FC<GenreFilterIntegrationProps> = ({
  bubbles,
  onSelectedCategoriesChange,
  colorLegendProps = {},
  className,
}) => {
  // window.console.log('🔍 [INIT] GenreFilterIntegration component initialized')

  const [selectedCategories, setSelectedCategories] = useState<
    (keyof typeof CATEGORY_COLORS)[]
  >([])

  // 選択されたカテゴリの変更を親コンポーネントに通知
  React.useEffect(() => {
    // console.log('🔍 [DEBUG] GenreFilterIntegration - selectedCategories changed:', selectedCategories)
    if (onSelectedCategoriesChange) {
      // console.log('🔍 [DEBUG] GenreFilterIntegration - Calling onSelectedCategoriesChange with:', selectedCategories)
      onSelectedCategoriesChange(selectedCategories)
    } else {
      // console.log('🔍 [DEBUG] GenreFilterIntegration - onSelectedCategoriesChange is null!')
    }
  }, [selectedCategories, onSelectedCategoriesChange])

  /**
   * カテゴリクリック時の処理（複数選択対応）
   */
  const handleCategoryClick = useCallback(
    (category: keyof typeof CATEGORY_COLORS) => {
      console.log(
        '🔍 [DEBUG] GenreFilterIntegration - handleCategoryClick called with:',
        category
      )
      setSelectedCategories(prev => {
        const isSelected = prev.includes(category)
        const newCategories = isSelected
          ? prev.filter(c => c !== category)
          : [...prev, category]

        console.log(
          '🔍 [DEBUG] GenreFilterIntegration - Previous categories:',
          prev
        )
        console.log(
          '🔍 [DEBUG] GenreFilterIntegration - New categories:',
          newCategories
        )

        // Analytics tracking
        const analyticsService = AnalyticsService.getInstance()
        analyticsService.logCategoryFilter(newCategories)

        return newCategories
      })
    },
    []
  )

  /**
   * カテゴリ別の統計を取得
   */
  const categoryStats = useMemo(() => {
    const stats = {
      song: bubbles.filter(b => b.type === 'song').length,
      lyricist: bubbles.filter(b => b.type === 'lyricist').length,
      composer: bubbles.filter(b => b.type === 'composer').length,
      arranger: bubbles.filter(b => b.type === 'arranger').length,
      tag: bubbles.filter(b => b.type === 'tag').length,
    }
    return stats
  }, [bubbles])

  /**
   * 凡例アイテムを動的に生成
   */
  const legendItems = useMemo(() => {
    return [
      {
        category: 'song' as keyof typeof CATEGORY_COLORS,
        color: CATEGORY_COLORS.song,
        label: '楽曲',
        count: categoryStats.song,
      },
      {
        category: 'lyricist' as keyof typeof CATEGORY_COLORS,
        color: CATEGORY_COLORS.lyricist,
        label: '作詞',
        count: categoryStats.lyricist,
      },
      {
        category: 'composer' as keyof typeof CATEGORY_COLORS,
        color: CATEGORY_COLORS.composer,
        label: '作曲',
        count: categoryStats.composer,
      },
      {
        category: 'arranger' as keyof typeof CATEGORY_COLORS,
        color: CATEGORY_COLORS.arranger,
        label: '編曲',
        count: categoryStats.arranger,
      },
      {
        category: 'tag' as keyof typeof CATEGORY_COLORS,
        color: CATEGORY_COLORS.tag,
        label: 'タグ',
        count: categoryStats.tag,
      },
    ]
  }, [categoryStats])

  // デバッグ: GenreFilterIntegrationの状態を確認
  // console.log('🔍 [DEBUG] GenreFilterIntegration render - selectedCategories:', selectedCategories)
  // console.log('🔍 [DEBUG] GenreFilterIntegration render - handleCategoryClick exists:', !!handleCategoryClick)

  return (
    <div className={className}>
      {/* カテゴリ別フィルタリング凡例（複数選択対応） */}
      <ColorLegend
        {...colorLegendProps}
        categories={legendItems}
        onCategoryClick={handleCategoryClick}
        selectedCategories={selectedCategories}
        enableInteraction={true}
        showCounts={true}
      />
    </div>
  )
}

export default GenreFilterIntegration
