/**
 * useAdvancedAnimation - ランダム消失アニメーションシステムのReactフック
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { useRef, useEffect, useCallback, useState } from 'react'
import { BubbleEntity } from '@/types/bubble'
import { 
  AdvancedAnimationController, 
  type AdvancedAnimationConfig,
  DEFAULT_ADVANCED_CONFIG 
} from '@/services/advancedAnimationController'

/**
 * フック設定インターフェース
 */
interface UseAdvancedAnimationOptions {
  enabled?: boolean
  config?: Partial<AdvancedAnimationConfig>
  onBubbleDisappear?: (bubbleId: string) => void
  onPatternChange?: (pattern: string) => void
}

/**
 * フック戻り値インターフェース
 */
interface UseAdvancedAnimationReturn {
  controller: AdvancedAnimationController | null
  isEnabled: boolean
  config: AdvancedAnimationConfig
  stats: {
    activeBubbles: number
    scheduledDisappearances: number
    activeAnimations: number
    averageDelay: number
    patternDistribution: Record<string, number>
  }
  updateConfig: (newConfig: Partial<AdvancedAnimationConfig>) => void
  applyRandomDisappearance: (bubbles: BubbleEntity[]) => void
  pauseForDialog: () => void
  resumeAfterDialog: () => void
  reset: () => void
}

/**
 * 高度なアニメーション制御フック
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */
export function useAdvancedAnimation(options: UseAdvancedAnimationOptions = {}): UseAdvancedAnimationReturn {
  const {
    enabled = true,
    config: initialConfig = {},
    // onBubbleDisappear,
    onPatternChange
  } = options

  // コントローラーの参照
  const controllerRef = useRef<AdvancedAnimationController | null>(null)
  
  // 状態管理
  const [isEnabled] = useState(enabled)
  const [config, setConfig] = useState<AdvancedAnimationConfig>({
    ...DEFAULT_ADVANCED_CONFIG,
    ...initialConfig
  })
  const [stats, setStats] = useState({
    activeBubbles: 0,
    scheduledDisappearances: 0,
    activeAnimations: 0,
    averageDelay: 0,
    patternDistribution: {} as Record<string, number>
  })

  // アニメーションフレーム用の参照
  const animationFrameRef = useRef<number>()
  // const lastUpdateTimeRef = useRef<number>(0)

  /**
   * コントローラーの初期化
   */
  useEffect(() => {
    if (isEnabled && !controllerRef.current) {
      controllerRef.current = new AdvancedAnimationController(config)
      console.log('AdvancedAnimationController initialized')
    } else if (!isEnabled && controllerRef.current) {
      controllerRef.current.reset()
      controllerRef.current = null
      console.log('AdvancedAnimationController disabled')
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isEnabled])

  /**
   * 設定更新時の処理
   */
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.updateConfiguration(config)
    }
  }, [config])

  /**
   * 統計情報の定期更新
   */
  useEffect(() => {
    if (!isEnabled || !controllerRef.current) return

    const updateStats = () => {
      if (controllerRef.current) {
        const newStats = controllerRef.current.getAnimationStats()
        setStats(newStats)

        // パターン変更の通知
        const currentPattern = Object.keys(newStats.patternDistribution)[0]
        if (currentPattern && onPatternChange) {
          onPatternChange(currentPattern)
        }
      }

      // 次の更新をスケジュール（60FPSで更新）
      animationFrameRef.current = requestAnimationFrame(updateStats)
    }

    animationFrameRef.current = requestAnimationFrame(updateStats)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isEnabled, onPatternChange])

  /**
   * 設定を更新
   * Requirements: 20.4 - 実行時にパラメータを調整できるようにする
   */
  const updateConfig = useCallback((newConfig: Partial<AdvancedAnimationConfig>) => {
    setConfig(prevConfig => ({
      ...prevConfig,
      ...newConfig,
      bubbleLifespan: { ...prevConfig.bubbleLifespan, ...newConfig.bubbleLifespan },
      floatingSpeed: { ...prevConfig.floatingSpeed, ...newConfig.floatingSpeed },
      maxBubbleSize: { ...prevConfig.maxBubbleSize, ...newConfig.maxBubbleSize },
      staggerDisappearance: { 
        ...prevConfig.staggerDisappearance, 
        ...newConfig.staggerDisappearance,
        delayRange: {
          ...prevConfig.staggerDisappearance.delayRange,
          ...newConfig.staggerDisappearance?.delayRange
        }
      },
      appearanceAnimation: { 
        ...prevConfig.appearanceAnimation, 
        ...newConfig.appearanceAnimation 
      }
    }))
  }, [])

  /**
   * ランダム消失アニメーションを適用
   * Requirements: 20.1, 20.2 - ランダムな消失タイミング制御機能
   */
  const applyRandomDisappearance = useCallback((bubbles: BubbleEntity[]) => {
    if (!isEnabled || !controllerRef.current) return

    try {
      controllerRef.current.applyRandomDisappearance(bubbles)
    } catch (error) {
      console.error('Error applying random disappearance:', error)
    }
  }, [isEnabled])

  /**
   * ダイアログ表示時のアニメーション一時停止
   * Requirements: 20.2 - ランダム性を持った間隔を適用する
   */
  const pauseForDialog = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.pauseAnimationsForDialog()
    }
  }, [])

  /**
   * ダイアログ終了後のアニメーション再開
   */
  const resumeAfterDialog = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.resumeAnimationsAfterDialog()
    }
  }, [])

  /**
   * 状態をリセット
   */
  const reset = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.reset()
    }
    setStats({
      activeBubbles: 0,
      scheduledDisappearances: 0,
      activeAnimations: 0,
      averageDelay: 0,
      patternDistribution: {}
    })
  }, [])

  /**
   * モバイル最適化の適用
   */
  const applyMobileOptimization = useCallback(() => {
    if (controllerRef.current) {
      const mobileConfig = controllerRef.current.optimizeForMobile()
      setConfig(mobileConfig)
    }
  }, [])

  /**
   * デバイス検出とモバイル最適化の自動適用
   */
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )

    if (isMobile && isEnabled) {
      applyMobileOptimization()
    }
  }, [isEnabled, applyMobileOptimization])

  /**
   * パフォーマンス監視
   */
  useEffect(() => {
    if (!isEnabled) return

    const performanceMonitor = setInterval(() => {
      if (stats.averageDelay > 3000) { // 3秒以上の遅延
        console.warn('High animation delay detected, consider optimizing')
      }

      if (stats.activeAnimations > 50) { // 50個以上のアクティブアニメーション
        console.warn('High number of active animations, performance may be affected')
      }
    }, 5000) // 5秒ごとにチェック

    return () => clearInterval(performanceMonitor)
  }, [isEnabled, stats])

  return {
    controller: controllerRef.current,
    isEnabled,
    config,
    stats,
    updateConfig,
    applyRandomDisappearance,
    pauseForDialog,
    resumeAfterDialog,
    reset
  }
}

/**
 * プリセット設定
 */
export const ANIMATION_PRESETS = {
  /**
   * 穏やかなアニメーション（デフォルト）
   */
  gentle: {
    randomnessFactor: 0.5,
    staggerDisappearance: {
      enabled: true,
      delayRange: { min: 200, max: 1000 },
      pattern: 'random' as const
    }
  } as Partial<AdvancedAnimationConfig>,

  /**
   * 活発なアニメーション
   */
  lively: {
    randomnessFactor: 0.8,
    staggerDisappearance: {
      enabled: true,
      delayRange: { min: 50, max: 800 },
      pattern: 'wave' as const
    }
  } as Partial<AdvancedAnimationConfig>,

  /**
   * 劇的なアニメーション
   */
  dramatic: {
    randomnessFactor: 1.0,
    staggerDisappearance: {
      enabled: true,
      delayRange: { min: 100, max: 2000 },
      pattern: 'spiral' as const
    }
  } as Partial<AdvancedAnimationConfig>,

  /**
   * モバイル最適化
   */
  mobile: {
    randomnessFactor: 0.4,
    bubbleLifespan: { min: 4, max: 7, variance: 0.2 },
    staggerDisappearance: {
      enabled: true,
      delayRange: { min: 300, max: 1200 },
      pattern: 'random' as const
    }
  } as Partial<AdvancedAnimationConfig>
}

/**
 * プリセット適用ヘルパー
 */
export function useAnimationPreset(presetName: keyof typeof ANIMATION_PRESETS) {
  return ANIMATION_PRESETS[presetName]
}