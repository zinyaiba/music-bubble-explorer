import { useState, useEffect, useCallback, useMemo } from 'react'
import { RoleBasedBubbleManager, CATEGORY_COLORS } from '@/services/roleBasedBubbleManager'
import { BubbleEntity } from '@/types/bubble'
import type { MusicDatabase } from '@/types/music'
import type { LegendItem } from '@/components/ColorLegend'

/**
 * 役割別シャボン玉システムのフック
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5 - 役割別シャボン玉システムの統合
 */
export const useRoleBasedBubbles = (
  musicDatabase: MusicDatabase,
  canvasWidth: number,
  canvasHeight: number,
  maxBubbles: number = 25
) => {
  const [bubbleManager, setBubbleManager] = useState<RoleBasedBubbleManager | null>(null)
  const [bubbles, setBubbles] = useState<BubbleEntity[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // バブルマネージャーの初期化
  useEffect(() => {
    if (musicDatabase.songs.length > 0) {
      const config = {
        canvasWidth,
        canvasHeight,
        maxBubbles,
        minLifespan: 5000,
        maxLifespan: 10000,
        minVelocity: 8,
        maxVelocity: 35
      }

      const manager = new RoleBasedBubbleManager(musicDatabase, config)
      setBubbleManager(manager)
      setIsInitialized(true)

      console.log('RoleBasedBubbleManager initialized:', {
        songs: musicDatabase.songs.length,
        people: musicDatabase.people.length,
        tags: musicDatabase.tags?.length || 0
      })
    }
  }, [musicDatabase, canvasWidth, canvasHeight, maxBubbles])

  // 音楽データベース更新時の処理
  useEffect(() => {
    if (bubbleManager && musicDatabase) {
      bubbleManager.updateMusicDatabase(musicDatabase)
    }
  }, [bubbleManager, musicDatabase])

  // アニメーションフレーム更新
  const updateFrame = useCallback(() => {
    if (!bubbleManager) return []

    try {
      const updatedBubbles = bubbleManager.updateFrame()
      setBubbles(updatedBubbles)
      return updatedBubbles
    } catch (error) {
      console.error('Error updating bubble frame:', error)
      return []
    }
  }, [bubbleManager])

  // シャボン玉クリック処理
  const handleBubbleClick = useCallback((x: number, y: number): BubbleEntity | null => {
    if (!bubbleManager) return null

    const clickedBubble = bubbleManager.findBubbleAtPosition(x, y)
    if (clickedBubble) {
      bubbleManager.triggerClickAnimation(clickedBubble.id)
    }
    return clickedBubble
  }, [bubbleManager])

  // 特定の人物の役割別シャボン玉を生成
  const generatePersonRoleBubbles = useCallback((personName: string): BubbleEntity[] => {
    if (!bubbleManager) return []

    try {
      return bubbleManager.generateUniqueRoleBubbles(personName)
    } catch (error) {
      console.error('Error generating person role bubbles:', error)
      return []
    }
  }, [bubbleManager])

  // 重複防止処理
  const preventDuplicates = useCallback((bubblesToCheck: BubbleEntity[]): BubbleEntity[] => {
    if (!bubbleManager) return bubblesToCheck

    return bubbleManager.preventDuplicateDisplay(bubblesToCheck)
  }, [bubbleManager])

  // カテゴリ別色分け適用
  const applyCategoryColors = useCallback((bubblesToColor: BubbleEntity[]): BubbleEntity[] => {
    if (!bubbleManager) return bubblesToColor

    return bubbleManager.assignCategoryColors(bubblesToColor)
  }, [bubbleManager])

  // 統計情報の取得
  const stats = useMemo(() => {
    if (!bubbleManager) return null

    return bubbleManager.getRoleBasedStats()
  }, [bubbleManager, bubbles])

  // 凡例アイテムの生成
  const legendItems = useMemo((): LegendItem[] => {
    if (!stats) {
      return [
        { category: 'song', color: CATEGORY_COLORS.song, label: '楽曲', icon: '🎵' },
        { category: 'lyricist', color: CATEGORY_COLORS.lyricist, label: '作詞家', icon: '✍️' },
        { category: 'composer', color: CATEGORY_COLORS.composer, label: '作曲家', icon: '🎼' },
        { category: 'arranger', color: CATEGORY_COLORS.arranger, label: '編曲家', icon: '🎹' },
        { category: 'tag', color: CATEGORY_COLORS.tag, label: 'タグ', icon: '🏷️' }
      ]
    }

    return [
      {
        category: 'song',
        color: CATEGORY_COLORS.song,
        label: '楽曲',
        icon: '🎵',
        count: stats.songBubbles
      },
      {
        category: 'lyricist',
        color: CATEGORY_COLORS.lyricist,
        label: '作詞家',
        icon: '✍️',
        count: stats.lyricistBubbles
      },
      {
        category: 'composer',
        color: CATEGORY_COLORS.composer,
        label: '作曲家',
        icon: '🎼',
        count: stats.composerBubbles
      },
      {
        category: 'arranger',
        color: CATEGORY_COLORS.arranger,
        label: '編曲家',
        icon: '🎹',
        count: stats.arrangerBubbles
      },
      {
        category: 'tag',
        color: CATEGORY_COLORS.tag,
        label: 'タグ',
        icon: '🏷️',
        count: stats.tagBubbles
      }
    ]
  }, [stats])

  // シャボン玉のクリア
  const clearBubbles = useCallback(() => {
    if (bubbleManager) {
      bubbleManager.clearDisplayedBubbles()
      setBubbles([])
    }
  }, [bubbleManager])

  // 設定の更新
  const updateConfig = useCallback((newConfig: Partial<any>) => {
    if (bubbleManager) {
      bubbleManager.updateConfig(newConfig)
    }
  }, [bubbleManager])

  // パフォーマンス統計の取得
  const performanceStats = useMemo(() => {
    if (!bubbleManager) return null

    return bubbleManager.getAnimationPerformanceStats()
  }, [bubbleManager, bubbles])

  return {
    // 状態
    bubbles,
    isInitialized,
    stats,
    legendItems,
    performanceStats,

    // メソッド
    updateFrame,
    handleBubbleClick,
    generatePersonRoleBubbles,
    preventDuplicates,
    applyCategoryColors,
    clearBubbles,
    updateConfig,

    // バブルマネージャーへの直接アクセス（デバッグ用）
    bubbleManager
  }
}

export default useRoleBasedBubbles