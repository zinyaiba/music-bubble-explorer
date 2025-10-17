/**
 * AdvancedAnimationController のユニットテスト
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { BubbleEntity } from '@/types/bubble'
import { 
  AdvancedAnimationController, 
  DEFAULT_ADVANCED_CONFIG,
  type AdvancedAnimationConfig 
} from '@/services/advancedAnimationController'

// モックの設定
vi.mock('@/services/naturalAnimationManager', () => ({
  NaturalAnimationManager: vi.fn().mockImplementation(() => ({
    updateConfig: vi.fn(),
    generateDisappearancePatterns: vi.fn().mockReturnValue([]),
    createDisappearanceAnimation: vi.fn().mockReturnValue(null),
    reset: vi.fn()
  }))
}))

describe('AdvancedAnimationController', () => {
  let controller: AdvancedAnimationController
  let mockBubbles: BubbleEntity[]

  beforeEach(() => {
    controller = new AdvancedAnimationController()
    
    // テスト用のシャボン玉を作成
    mockBubbles = [
      new BubbleEntity({
        type: 'song',
        name: 'Test Song 1',
        x: 100,
        y: 100,
        vx: 5,
        vy: -2,
        size: 60,
        color: '#FFB6C1',
        opacity: 1,
        lifespan: 8000,
        relatedCount: 3
      }),
      new BubbleEntity({
        type: 'lyricist',
        name: 'Test Lyricist',
        x: 200,
        y: 150,
        vx: -3,
        vy: 1,
        size: 50,
        color: '#B6E5D8',
        opacity: 1,
        lifespan: 6000,
        relatedCount: 2
      }),
      new BubbleEntity({
        type: 'tag',
        name: 'Test Tag',
        x: 300,
        y: 200,
        vx: 2,
        vy: -4,
        size: 45,
        color: '#98FB98',
        opacity: 1,
        lifespan: 7000,
        relatedCount: 5
      })
    ]

    // 各シャボン玉の年齢を設定（消失判定のため）
    mockBubbles.forEach((bubble, index) => {
      // 年齢を設定するためのプライベートプロパティアクセス
      ;(bubble as any).createdAt = performance.now() - (5000 + index * 1000)
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('デフォルト設定で正しく初期化される', () => {
      const config = controller.getConfiguration()
      expect(config).toEqual(DEFAULT_ADVANCED_CONFIG)
    })

    it('カスタム設定で初期化される', () => {
      const customConfig: Partial<AdvancedAnimationConfig> = {
        randomnessFactor: 0.8,
        staggerDisappearance: {
          enabled: false,
          delayRange: { min: 500, max: 1500 },
          pattern: 'wave'
        }
      }

      const customController = new AdvancedAnimationController({
        ...DEFAULT_ADVANCED_CONFIG,
        ...customConfig
      })

      const config = customController.getConfiguration()
      expect(config.randomnessFactor).toBe(0.8)
      expect(config.staggerDisappearance.enabled).toBe(false)
      expect(config.staggerDisappearance.pattern).toBe('wave')
    })
  })

  describe('設定更新', () => {
    it('部分的な設定更新が正しく動作する', () => {
      const newConfig: Partial<AdvancedAnimationConfig> = {
        randomnessFactor: 0.9,
        bubbleLifespan: {
          min: 3,
          max: 8,
          variance: 0.4
        }
      }

      controller.updateConfiguration(newConfig)
      const config = controller.getConfiguration()

      expect(config.randomnessFactor).toBe(0.9)
      expect(config.bubbleLifespan.min).toBe(3)
      expect(config.bubbleLifespan.max).toBe(8)
      expect(config.bubbleLifespan.variance).toBe(0.4)
      
      // 他の設定は変更されていないことを確認
      expect(config.floatingSpeed).toEqual(DEFAULT_ADVANCED_CONFIG.floatingSpeed)
    })

    it('ネストされた設定の更新が正しく動作する', () => {
      const newConfig: Partial<AdvancedAnimationConfig> = {
        staggerDisappearance: {
          delayRange: { min: 200, max: 800 }
        }
      }

      controller.updateConfiguration(newConfig)
      const config = controller.getConfiguration()

      expect(config.staggerDisappearance.delayRange.min).toBe(200)
      expect(config.staggerDisappearance.delayRange.max).toBe(800)
      
      // 他のstaggerDisappearance設定は保持されることを確認
      expect(config.staggerDisappearance.enabled).toBe(DEFAULT_ADVANCED_CONFIG.staggerDisappearance.enabled)
      expect(config.staggerDisappearance.pattern).toBe(DEFAULT_ADVANCED_CONFIG.staggerDisappearance.pattern)
    })
  })

  describe('ランダム消失アニメーション', () => {
    it('シャボン玉にランダム消失を適用する', () => {
      // performance.nowをモック
      const mockNow = vi.spyOn(performance, 'now').mockReturnValue(10000)

      controller.applyRandomDisappearance(mockBubbles)
      const stats = controller.getAnimationStats()

      expect(stats.activeBubbles).toBe(mockBubbles.length)
      expect(stats.scheduledDisappearances).toBeGreaterThanOrEqual(0)

      mockNow.mockRestore()
    })

    it('消失タイミングがランダムである', () => {
      const delays1 = controller.calculateStaggeredTiming(5)
      const delays2 = controller.calculateStaggeredTiming(5)

      // 完全に同じ値になる可能性は低い
      expect(delays1).not.toEqual(delays2)
      expect(delays1).toHaveLength(5)
      expect(delays2).toHaveLength(5)
    })

    it('異なるパターンで異なる遅延が生成される', () => {
      // ランダムパターン
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'random' }
      })
      const randomDelays = controller.calculateStaggeredTiming(10)

      // 波パターン
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'wave' }
      })
      const waveDelays = controller.calculateStaggeredTiming(10)

      // スパイラルパターン
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'spiral' }
      })
      const spiralDelays = controller.calculateStaggeredTiming(10)

      // 各パターンで異なる結果が得られることを確認
      expect(randomDelays).not.toEqual(waveDelays)
      expect(waveDelays).not.toEqual(spiralDelays)
      expect(randomDelays).not.toEqual(spiralDelays)
    })
  })

  describe('まばらな消失タイミング', () => {
    it('指定された範囲内で遅延が生成される', () => {
      const minDelay = 100
      const maxDelay = 1000

      controller.updateConfiguration({
        staggerDisappearance: {
          delayRange: { min: minDelay, max: maxDelay }
        }
      })

      const delays = controller.calculateStaggeredTiming(20)

      delays.forEach(delay => {
        expect(delay).toBeGreaterThanOrEqual(minDelay)
        expect(delay).toBeLessThanOrEqual(maxDelay)
      })
    })

    it('カスケードパターンで段階的な遅延が生成される', () => {
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'cascade' }
      })

      const delays = controller.calculateStaggeredTiming(9) // 3グループに分かれる

      // カスケードパターンでは段階的な増加が期待される
      // 完全に順序通りではないが、大まかな傾向は確認できる
      const sortedDelays = [...delays].sort((a, b) => a - b)
      expect(sortedDelays[0]).toBeLessThan(sortedDelays[sortedDelays.length - 1])
    })
  })

  describe('ダイアログ制御', () => {
    it('ダイアログ表示時にアニメーションが一時停止される', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      controller.pauseAnimationsForDialog()

      expect(consoleSpy).toHaveBeenCalledWith('Animations paused for dialog')

      consoleSpy.mockRestore()
    })

    it('ダイアログ終了後にアニメーションが再開される', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      controller.resumeAnimationsAfterDialog()

      expect(consoleSpy).toHaveBeenCalledWith('Animations resumed after dialog')

      consoleSpy.mockRestore()
    })
  })

  describe('モバイル最適化', () => {
    it('モバイル向け設定が生成される', () => {
      const mobileConfig = controller.optimizeForMobile()

      // モバイル向けの最適化が適用されていることを確認
      expect(mobileConfig.bubbleLifespan.min).toBeLessThan(DEFAULT_ADVANCED_CONFIG.bubbleLifespan.min)
      expect(mobileConfig.bubbleLifespan.max).toBeLessThan(DEFAULT_ADVANCED_CONFIG.bubbleLifespan.max)
      expect(mobileConfig.floatingSpeed.max).toBeLessThan(DEFAULT_ADVANCED_CONFIG.floatingSpeed.max)
      expect(mobileConfig.randomnessFactor).toBeLessThan(DEFAULT_ADVANCED_CONFIG.randomnessFactor)
    })

    it('モバイル最適化設定が適用される', () => {
      const originalConfig = controller.getConfiguration()
      const mobileConfig = controller.optimizeForMobile()
      
      controller.updateConfiguration(mobileConfig)
      const updatedConfig = controller.getConfiguration()

      expect(updatedConfig.bubbleLifespan.min).not.toBe(originalConfig.bubbleLifespan.min)
      expect(updatedConfig.floatingSpeed.max).not.toBe(originalConfig.floatingSpeed.max)
    })
  })

  describe('統計情報', () => {
    it('正しい統計情報が取得される', () => {
      controller.applyRandomDisappearance(mockBubbles)
      const stats = controller.getAnimationStats()

      expect(stats).toHaveProperty('activeBubbles')
      expect(stats).toHaveProperty('scheduledDisappearances')
      expect(stats).toHaveProperty('activeAnimations')
      expect(stats).toHaveProperty('averageDelay')
      expect(stats).toHaveProperty('patternDistribution')

      expect(typeof stats.activeBubbles).toBe('number')
      expect(typeof stats.averageDelay).toBe('number')
      expect(typeof stats.patternDistribution).toBe('object')
    })

    it('パターン分布が正しく計算される', () => {
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'wave' }
      })

      controller.applyRandomDisappearance(mockBubbles)
      const stats = controller.getAnimationStats()

      // パターン分布にwaveが含まれることを確認
      expect(stats.patternDistribution).toHaveProperty('wave')
    })
  })

  describe('リセット機能', () => {
    it('リセット後に状態がクリアされる', () => {
      // 何らかの状態を作成
      controller.applyRandomDisappearance(mockBubbles)
      
      let stats = controller.getAnimationStats()
      expect(stats.activeBubbles).toBeGreaterThan(0)

      // リセット実行
      controller.reset()

      stats = controller.getAnimationStats()
      expect(stats.activeBubbles).toBe(0)
      expect(stats.scheduledDisappearances).toBe(0)
      expect(stats.activeAnimations).toBe(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('空の配列でも正常に動作する', () => {
      expect(() => {
        controller.applyRandomDisappearance([])
      }).not.toThrow()

      const delays = controller.calculateStaggeredTiming(0)
      expect(delays).toEqual([])
    })

    it('無効な設定でも安全に動作する', () => {
      expect(() => {
        controller.updateConfiguration({
          randomnessFactor: -1, // 無効な値
          staggerDisappearance: {
            delayRange: { min: 1000, max: 100 } // min > max
          }
        } as any)
      }).not.toThrow()
    })
  })

  describe('自然な消失パターン', () => {
    it('自然な消失パターンが作成される', () => {
      expect(() => {
        controller.createNaturalDisappearancePattern(mockBubbles)
      }).not.toThrow()
    })

    it('異なるシャボン玉数で適切に動作する', () => {
      const smallBubbleSet = mockBubbles.slice(0, 1)
      const largeBubbleSet = [...mockBubbles, ...mockBubbles, ...mockBubbles]

      expect(() => {
        controller.createNaturalDisappearancePattern(smallBubbleSet)
        controller.createNaturalDisappearancePattern(largeBubbleSet)
      }).not.toThrow()

      const smallDelays = controller.calculateStaggeredTiming(smallBubbleSet.length)
      const largeDelays = controller.calculateStaggeredTiming(largeBubbleSet.length)

      expect(smallDelays).toHaveLength(smallBubbleSet.length)
      expect(largeDelays).toHaveLength(largeBubbleSet.length)
    })
  })
})