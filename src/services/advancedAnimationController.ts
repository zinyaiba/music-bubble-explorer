/**
 * AdvancedAnimationController - ランダム消失アニメーションシステム
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { BubbleEntity } from '@/types/bubble'

/**
 * 高度なアニメーション設定インターフェース
 * Requirements: 20.3 - 設定可能なアニメーションパラメータシステム
 */
export interface AdvancedAnimationConfig {
  bubbleLifespan: {
    min: number      // 最小寿命（秒）
    max: number      // 最大寿命（秒）
    variance: number // 寿命のばらつき係数
  }
  floatingSpeed: {
    min: number      // 最小浮遊速度
    max: number      // 最大浮遊速度
    acceleration: number // 加速度係数
  }
  maxBubbleSize: {
    min: number      // 最小最大サイズ
    max: number      // 最大最大サイズ
    scaleFactor: number // サイズスケール係数
  }
  randomnessFactor: number     // ランダム性係数 (0-1)
  staggerDisappearance: {
    enabled: boolean           // まばらな消失の有効化
    delayRange: {
      min: number              // 最小消失遅延（ミリ秒）
      max: number              // 最大消失遅延（ミリ秒）
    }
    pattern: 'random' | 'wave' | 'spiral' | 'cascade' // 消失パターン
  }
  appearanceAnimation: {
    duration: number           // 出現アニメーション時間（ミリ秒）
    easing: string            // イージング関数
    staggerDelay: number      // 出現の時間差（ミリ秒）
  }
}

/**
 * デフォルトのアニメーション設定
 * Requirements: 20.1, 20.2 - ランダムな消失タイミング制御機能
 */
export const DEFAULT_ADVANCED_CONFIG: AdvancedAnimationConfig = {
  bubbleLifespan: {
    min: 5,        // 5秒
    max: 10,       // 10秒
    variance: 0.3  // 30%のばらつき
  },
  floatingSpeed: {
    min: 8,
    max: 35,
    acceleration: 1.2
  },
  maxBubbleSize: {
    min: 40,
    max: 120,
    scaleFactor: 1.0
  },
  randomnessFactor: 0.7,  // 70%のランダム性
  staggerDisappearance: {
    enabled: true,
    delayRange: {
      min: 100,    // 100ms
      max: 2000    // 2秒
    },
    pattern: 'random'
  },
  appearanceAnimation: {
    duration: 800,
    easing: 'easeOutElastic',
    staggerDelay: 150
  }
}

/**
 * アニメーション状態追跡インターフェース
 */
interface BubbleAnimationState {
  bubbleId: string
  disappearanceScheduledTime: number | null
  disappearanceDelay: number
  isDisappearing: boolean
  pattern: string
  staggerIndex: number
}

/**
 * 高度なアニメーションコントローラークラス
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */
export class AdvancedAnimationController {
  private config: AdvancedAnimationConfig
  private naturalAnimationManager: any // Lazy loaded to avoid circular dependency
  private bubbleStates = new Map<string, BubbleAnimationState>()
  private activeAnimations = new Map<string, Animation>()
  private staggerCounter = 0
  private isDialogOpen = false
  private lastUpdateTime = 0

  constructor(config: AdvancedAnimationConfig = DEFAULT_ADVANCED_CONFIG) {
    this.config = { ...config }
    // Lazy load to avoid circular dependency
    this.naturalAnimationManager = null as any
  }

  /**
   * ダイアログ状態を取得
   */
  getDialogState(): boolean {
    return this.isDialogOpen
  }

  /**
   * 最終更新時刻を取得
   */
  getLastUpdateTime(): number {
    return this.lastUpdateTime
  }

  /**
   * アニメーション設定を更新
   * Requirements: 20.4 - 実行時にパラメータを調整できるようにする
   */
  updateConfiguration(newConfig: Partial<AdvancedAnimationConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      bubbleLifespan: { ...this.config.bubbleLifespan, ...newConfig.bubbleLifespan },
      floatingSpeed: { ...this.config.floatingSpeed, ...newConfig.floatingSpeed },
      maxBubbleSize: { ...this.config.maxBubbleSize, ...newConfig.maxBubbleSize },
      staggerDisappearance: { 
        ...this.config.staggerDisappearance, 
        ...newConfig.staggerDisappearance,
        delayRange: {
          ...this.config.staggerDisappearance.delayRange,
          ...newConfig.staggerDisappearance?.delayRange
        }
      },
      appearanceAnimation: { 
        ...this.config.appearanceAnimation, 
        ...newConfig.appearanceAnimation 
      }
    }

    // NaturalAnimationManagerの設定も更新
    if (this.naturalAnimationManager) {
      this.naturalAnimationManager.updateConfig(this.config)
    }

    console.log('AdvancedAnimationController configuration updated:', this.config)
  }

  /**
   * ランダムな消失タイミングを適用
   * Requirements: 20.1, 20.2 - ランダムな消失タイミング制御機能
   */
  applyRandomDisappearance(bubbles: BubbleEntity[]): void {
    const currentTime = performance.now()

    bubbles.forEach(bubble => {
      let state = this.bubbleStates.get(bubble.id)
      
      if (!state) {
        // 新しいシャボン玉の状態を初期化
        state = {
          bubbleId: bubble.id,
          disappearanceScheduledTime: null,
          disappearanceDelay: this.calculateRandomDelay(),
          isDisappearing: false,
          pattern: this.config.staggerDisappearance.pattern,
          staggerIndex: this.staggerCounter++
        }
        this.bubbleStates.set(bubble.id, state)
      }

      // 消失タイミングをチェック
      if (!state.isDisappearing && this.shouldScheduleDisappearance(bubble, currentTime)) {
        this.scheduleDisappearance(bubble, state, currentTime)
      }

      // スケジュールされた消失を実行
      if (state.disappearanceScheduledTime && 
          currentTime >= state.disappearanceScheduledTime && 
          !state.isDisappearing) {
        this.executeDisappearance(bubble, state)
      }
    })

    // 削除されたシャボン玉の状態をクリーンアップ
    this.cleanupRemovedBubbles(bubbles)
  }

  /**
   * まばらな消失パターンを計算
   * Requirements: 20.5 - まばらな消失アニメーションの実装
   */
  calculateStaggeredTiming(bubbleCount: number): number[] {
    if (!this.config.staggerDisappearance.enabled) {
      return new Array(bubbleCount).fill(0)
    }

    const delays: number[] = []
    const { min, max } = this.config.staggerDisappearance.delayRange
    const pattern = this.config.staggerDisappearance.pattern

    for (let i = 0; i < bubbleCount; i++) {
      let delay: number

      switch (pattern) {
        case 'wave':
          // 波状パターン: サイン波に基づく遅延
          delay = min + (max - min) * (Math.sin(i * 0.5) * 0.5 + 0.5)
          break

        case 'spiral':
          // スパイラルパターン: 螺旋状の遅延
          const angle = i * 0.618 * Math.PI * 2 // 黄金角
          delay = min + (max - min) * ((Math.sin(angle) * 0.5 + 0.5) * (i / bubbleCount))
          break

        case 'cascade':
          // カスケードパターン: 段階的な遅延
          const cascadeStep = Math.floor(i / 3) // 3つずつグループ化
          delay = min + cascadeStep * ((max - min) / Math.ceil(bubbleCount / 3))
          break

        case 'random':
        default:
          // ランダムパターン
          delay = min + Math.random() * (max - min)
          break
      }

      // ランダム性係数を適用
      const randomVariation = (Math.random() - 0.5) * 2 * this.config.randomnessFactor
      delay *= (1 + randomVariation * 0.3)

      delays.push(Math.max(min, Math.min(max, delay)))
    }

    return delays
  }

  /**
   * 自然な消失パターンを作成
   * Requirements: 20.4 - NaturalAnimationManagerによる自然な消失パターン
   */
  createNaturalDisappearancePattern(bubbles: BubbleEntity[]): void {
    // Lazy load NaturalAnimationManager to avoid circular dependency
    if (!this.naturalAnimationManager) {
      const { NaturalAnimationManager } = require('./naturalAnimationManager')
      this.naturalAnimationManager = new NaturalAnimationManager(this.config)
    }
    
    const patterns = this.naturalAnimationManager.generateDisappearancePatterns(bubbles)
    
    patterns.forEach((pattern: any) => {
      const bubble = bubbles.find(b => b.id === pattern.bubbleId)
      if (bubble) {
        const state = this.bubbleStates.get(bubble.id)
        if (state) {
          state.disappearanceDelay = pattern.delay
          state.pattern = pattern.type
          this.bubbleStates.set(bubble.id, state)
        }
      }
    })
  }

  /**
   * モバイル向け最適化設定を取得
   * Requirements: 20.3 - 設定可能なアニメーションパラメータシステム
   */
  optimizeForMobile(): AdvancedAnimationConfig {
    return {
      ...this.config,
      bubbleLifespan: {
        min: 4,        // モバイルでは少し短く
        max: 8,
        variance: 0.2  // ばらつきを抑制
      },
      floatingSpeed: {
        min: 6,        // 速度を抑制
        max: 25,
        acceleration: 1.0
      },
      maxBubbleSize: {
        min: 35,       // サイズを少し小さく
        max: 100,
        scaleFactor: 0.9
      },
      randomnessFactor: 0.5,  // ランダム性を抑制
      staggerDisappearance: {
        enabled: true,
        delayRange: {
          min: 200,    // 遅延を少し長く
          max: 1500
        },
        pattern: 'random' // シンプルなパターン
      },
      appearanceAnimation: {
        duration: 600,  // 短縮
        easing: 'easeOut',
        staggerDelay: 100
      }
    }
  }

  /**
   * ダイアログ表示中のアニメーション制御
   * Requirements: 20.2 - ランダム性を持った間隔を適用する
   */
  pauseAnimationsForDialog(): void {
    this.isDialogOpen = true
    
    // アクティブなアニメーションを一時停止
    this.activeAnimations.forEach((animation) => {
      if (animation.playState === 'running') {
        animation.pause()
      }
    })

    console.log('Animations paused for dialog')
  }

  /**
   * ダイアログ終了後のアニメーション再開
   */
  resumeAnimationsAfterDialog(): void {
    this.isDialogOpen = false
    
    // 一時停止されたアニメーションを再開
    this.activeAnimations.forEach((animation) => {
      if (animation.playState === 'paused') {
        animation.play()
      }
    })

    console.log('Animations resumed after dialog')
  }

  /**
   * 現在の設定を取得
   */
  getConfiguration(): AdvancedAnimationConfig {
    return { ...this.config }
  }

  /**
   * アニメーション統計を取得
   */
  getAnimationStats(): {
    activeBubbles: number
    scheduledDisappearances: number
    activeAnimations: number
    averageDelay: number
    patternDistribution: Record<string, number>
  } {
    const scheduledCount = Array.from(this.bubbleStates.values())
      .filter(state => state.disappearanceScheduledTime !== null).length

    const patternCounts: Record<string, number> = {}
    this.bubbleStates.forEach(state => {
      patternCounts[state.pattern] = (patternCounts[state.pattern] || 0) + 1
    })

    const totalDelay = Array.from(this.bubbleStates.values())
      .reduce((sum, state) => sum + state.disappearanceDelay, 0)
    const averageDelay = this.bubbleStates.size > 0 ? totalDelay / this.bubbleStates.size : 0

    return {
      activeBubbles: this.bubbleStates.size,
      scheduledDisappearances: scheduledCount,
      activeAnimations: this.activeAnimations.size,
      averageDelay,
      patternDistribution: patternCounts
    }
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this.bubbleStates.clear()
    this.activeAnimations.clear()
    this.staggerCounter = 0
    this.lastUpdateTime = 0
    this.isDialogOpen = false
    if (this.naturalAnimationManager) {
      this.naturalAnimationManager.reset()
    }
  }

  // プライベートメソッド

  /**
   * ランダムな遅延時間を計算
   */
  private calculateRandomDelay(): number {
    const { min, max } = this.config.staggerDisappearance.delayRange
    const baseDelay = min + Math.random() * (max - min)
    
    // ランダム性係数を適用
    const randomVariation = (Math.random() - 0.5) * 2 * this.config.randomnessFactor
    return Math.max(min, baseDelay * (1 + randomVariation * 0.5))
  }

  /**
   * 消失をスケジュールするかどうかを判定
   */
  private shouldScheduleDisappearance(bubble: BubbleEntity, _currentTime: number): boolean {
    const age = bubble.getAge()
    const lifespan = bubble.lifespan
    const ageRatio = age / lifespan

    // ライフスパンの60-80%でランダムにスケジュール
    const scheduleThreshold = 0.6 + Math.random() * 0.2
    return ageRatio >= scheduleThreshold
  }

  /**
   * 消失をスケジュール
   */
  private scheduleDisappearance(bubble: BubbleEntity, state: BubbleAnimationState, currentTime: number): void {
    state.disappearanceScheduledTime = currentTime + state.disappearanceDelay
    this.bubbleStates.set(bubble.id, state)
    
    // デバッグログを削除（大量出力を防ぐため）
    // console.log(`Scheduled disappearance for bubble ${bubble.id} in ${state.disappearanceDelay}ms`)
  }

  /**
   * 消失アニメーションを実行
   */
  private executeDisappearance(bubble: BubbleEntity, state: BubbleAnimationState): void {
    state.isDisappearing = true
    
    // 自然な消失アニメーションを作成
    if (this.naturalAnimationManager) {
      const animation = this.naturalAnimationManager.createDisappearanceAnimation(
        bubble, 
        state.pattern as any
      )
      
      if (animation) {
        this.activeAnimations.set(bubble.id, animation)
        
        // アニメーション完了時のクリーンアップ
        animation.addEventListener('finish', () => {
          this.activeAnimations.delete(bubble.id)
          this.bubbleStates.delete(bubble.id)
          bubble.markForDeletion()
        })
      }
    }
    
    console.log(`Executing disappearance animation for bubble ${bubble.id} with pattern ${state.pattern}`)
  }

  /**
   * 削除されたシャボン玉の状態をクリーンアップ
   */
  private cleanupRemovedBubbles(activeBubbles: BubbleEntity[]): void {
    const activeBubbleIds = new Set(activeBubbles.map(b => b.id))
    
    // アクティブでないシャボン玉の状態を削除
    for (const bubbleId of this.bubbleStates.keys()) {
      if (!activeBubbleIds.has(bubbleId)) {
        this.bubbleStates.delete(bubbleId)
        
        // 関連するアニメーションも停止・削除
        const animation = this.activeAnimations.get(bubbleId)
        if (animation) {
          animation.cancel()
          this.activeAnimations.delete(bubbleId)
        }
      }
    }
  }
}