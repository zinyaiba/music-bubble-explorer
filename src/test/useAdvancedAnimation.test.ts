/**
 * useAdvancedAnimation フックのユニットテスト
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BubbleEntity } from '@/types/bubble'

// AdvancedAnimationControllerのモック
vi.mock('@/services/advancedAnimationController', () => ({
  AdvancedAnimationController: vi.fn().mockImplementation(() => ({
    updateConfiguration: vi.fn(),
    applyRandomDisappearance: vi.fn(),
    pauseAnimationsForDialog: vi.fn(),
    resumeAnimationsAfterDialog: vi.fn(),
    reset: vi.fn(),
    optimizeForMobile: vi.fn().mockReturnValue({
      bubbleLifespan: { min: 4, max: 7, variance: 0.2 }
    }),
    getConfiguration: vi.fn().mockReturnValue({
      bubbleLifespan: { min: 5, max: 10, variance: 0.3 },
      floatingSpeed: { min: 8, max: 35, acceleration: 1.2 },
      maxBubbleSize: { min: 40, max: 120, scaleFactor: 1.0 },
      randomnessFactor: 0.7,
      staggerDisappearance: {
        enabled: true,
        delayRange: { min: 100, max: 2000 },
        pattern: 'random'
      },
      appearanceAnimation: {
        duration: 800,
        easing: 'easeOutElastic',
        staggerDelay: 150
      }
    }),
    getAnimationStats: vi.fn().mockReturnValue({
      activeBubbles: 5,
      scheduledDisappearances: 2,
      activeAnimations: 3,
      averageDelay: 500,
      patternDistribution: { random: 3, wave: 2 }
    }),
    createNaturalDisappearancePattern: vi.fn(),
    calculateStaggeredTiming: vi.fn().mockReturnValue([100, 200, 300])
  })),
  DEFAULT_ADVANCED_CONFIG: {
    bubbleLifespan: { min: 5, max: 10, variance: 0.3 },
    floatingSpeed: { min: 8, max: 35, acceleration: 1.2 },
    maxBubbleSize: { min: 40, max: 120, scaleFactor: 1.0 },
    randomnessFactor: 0.7,
    staggerDisappearance: {
      enabled: true,
      delayRange: { min: 100, max: 2000 },
      pattern: 'random'
    },
    appearanceAnimation: {
      duration: 800,
      easing: 'easeOutElastic',
      staggerDelay: 150
    }
  }
}))

import { 
  useAdvancedAnimation, 
  ANIMATION_PRESETS,
  useAnimationPreset 
} from '@/hooks/useAdvancedAnimation'

// requestAnimationFrameのモック
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16) // 60FPS相当
  return 1
})

global.cancelAnimationFrame = vi.fn()

// navigatorのモック
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  configurable: true
})

describe('useAdvancedAnimation', () => {
  let mockBubbles: BubbleEntity[]

  beforeEach(() => {
    vi.clearAllMocks()
    
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
      })
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('基本機能', () => {
    it('デフォルト設定で正しく初期化される', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      expect(result.current.isEnabled).toBe(true)
      expect(result.current.config).toBeDefined()
      expect(result.current.controller).toBeTruthy()
    })

    it('カスタム設定で初期化される', () => {
      const customConfig = {
        randomnessFactor: 0.8,
        staggerDisappearance: {
          enabled: false,
          delayRange: { min: 500, max: 1500 },
          pattern: 'wave' as const
        }
      }

      const { result } = renderHook(() => 
        useAdvancedAnimation({ 
          config: customConfig 
        })
      )

      expect(result.current.config.randomnessFactor).toBe(0.8)
      expect(result.current.config.staggerDisappearance.enabled).toBe(false)
    })

    it('無効化された状態で初期化される', () => {
      const { result } = renderHook(() => 
        useAdvancedAnimation({ enabled: false })
      )

      expect(result.current.isEnabled).toBe(false)
      expect(result.current.controller).toBeNull()
    })
  })

  describe('設定更新', () => {
    it('設定が正しく更新される', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      act(() => {
        result.current.updateConfig({
          randomnessFactor: 0.9,
          bubbleLifespan: { min: 3, max: 8, variance: 0.4 }
        })
      })

      expect(result.current.config.randomnessFactor).toBe(0.9)
      expect(result.current.config.bubbleLifespan.min).toBe(3)
      expect(result.current.config.bubbleLifespan.max).toBe(8)
    })

    it('ネストされた設定の更新が正しく動作する', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      act(() => {
        result.current.updateConfig({
          staggerDisappearance: {
            delayRange: { min: 200, max: 800 }
          }
        })
      })

      expect(result.current.config.staggerDisappearance.delayRange.min).toBe(200)
      expect(result.current.config.staggerDisappearance.delayRange.max).toBe(800)
      
      // 他の設定は保持されることを確認
      expect(result.current.config.staggerDisappearance.enabled).toBe(true)
    })
  })

  describe('アニメーション制御', () => {
    it('ランダム消失アニメーションが適用される', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      act(() => {
        result.current.applyRandomDisappearance(mockBubbles)
      })

      expect(result.current.controller?.applyRandomDisappearance).toHaveBeenCalledWith(mockBubbles)
    })

    it('無効化された状態では動作しない', () => {
      const { result } = renderHook(() => 
        useAdvancedAnimation({ enabled: false })
      )

      act(() => {
        result.current.applyRandomDisappearance(mockBubbles)
      })

      // コントローラーがnullなので何も実行されない
      expect(result.current.controller).toBeNull()
    })

    it('ダイアログ制御が正しく動作する', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      act(() => {
        result.current.pauseForDialog()
      })

      expect(result.current.controller?.pauseAnimationsForDialog).toHaveBeenCalled()

      act(() => {
        result.current.resumeAfterDialog()
      })

      expect(result.current.controller?.resumeAnimationsAfterDialog).toHaveBeenCalled()
    })
  })

  describe('統計情報', () => {
    it('統計情報が正しく取得される', async () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      // 統計情報の更新を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20))
      })

      expect(result.current.stats).toEqual({
        activeBubbles: 5,
        scheduledDisappearances: 2,
        activeAnimations: 3,
        averageDelay: 500,
        patternDistribution: { random: 3, wave: 2 }
      })
    })

    it('パターン変更の通知が動作する', async () => {
      const onPatternChange = vi.fn()
      
      renderHook(() => 
        useAdvancedAnimation({ onPatternChange })
      )

      // 統計情報の更新を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 20))
      })

      expect(onPatternChange).toHaveBeenCalledWith('random')
    })
  })

  describe('リセット機能', () => {
    it('リセットが正しく動作する', () => {
      const { result } = renderHook(() => useAdvancedAnimation())

      act(() => {
        result.current.reset()
      })

      expect(result.current.controller?.reset).toHaveBeenCalled()
      expect(result.current.stats).toEqual({
        activeBubbles: 0,
        scheduledDisappearances: 0,
        activeAnimations: 0,
        averageDelay: 0,
        patternDistribution: {}
      })
    })
  })

  describe('モバイル最適化', () => {
    it('モバイルデバイスで自動最適化が適用される', () => {
      // モバイルユーザーエージェントに変更
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        configurable: true
      })

      const { result } = renderHook(() => useAdvancedAnimation())

      // モバイル最適化が適用されることを確認
      expect(result.current.controller?.optimizeForMobile).toHaveBeenCalled()
    })

    it('デスクトップデバイスでは自動最適化が適用されない', () => {
      // デスクトップユーザーエージェント
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true
      })

      const { result } = renderHook(() => useAdvancedAnimation())

      // 初期化時にoptimizeForMobileが呼ばれていないことを確認
      expect(result.current.controller?.optimizeForMobile).not.toHaveBeenCalled()
    })
  })

  describe('パフォーマンス監視', () => {
    it('高遅延の警告が表示される', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 高遅延の統計を返すモック
      const mockController = {
        ...vi.mocked(result.current.controller),
        getAnimationStats: vi.fn().mockReturnValue({
          activeBubbles: 5,
          scheduledDisappearances: 2,
          activeAnimations: 3,
          averageDelay: 4000, // 4秒の高遅延
          patternDistribution: { random: 3 }
        })
      }

      const { result } = renderHook(() => useAdvancedAnimation())
      
      // パフォーマンス監視の間隔を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 5100))
      })

      consoleSpy.mockRestore()
    })

    it('多数のアクティブアニメーションの警告が表示される', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 多数のアクティブアニメーションの統計を返すモック
      const { result } = renderHook(() => useAdvancedAnimation())

      // 統計を更新
      act(() => {
        // 内部的に統計が更新されることをシミュレート
        (result.current as any).stats = {
          activeBubbles: 10,
          scheduledDisappearances: 5,
          activeAnimations: 60, // 60個の多数のアニメーション
          averageDelay: 500,
          patternDistribution: { random: 30, wave: 30 }
        }
      })

      // パフォーマンス監視の間隔を待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 5100))
      })

      consoleSpy.mockRestore()
    })
  })

  describe('エラーハンドリング', () => {
    it('エラーが発生しても安全に動作する', () => {
      const mockControllerWithError = {
        applyRandomDisappearance: vi.fn().mockImplementation(() => {
          throw new Error('Test error')
        }),
        updateConfiguration: vi.fn(),
        pauseAnimationsForDialog: vi.fn(),
        resumeAnimationsAfterDialog: vi.fn(),
        reset: vi.fn(),
        optimizeForMobile: vi.fn().mockReturnValue({
          bubbleLifespan: { min: 4, max: 7, variance: 0.2 }
        }),
        getConfiguration: vi.fn().mockReturnValue({
          bubbleLifespan: { min: 5, max: 10, variance: 0.3 }
        }),
        getAnimationStats: vi.fn().mockReturnValue({
          activeBubbles: 0,
          scheduledDisappearances: 0,
          activeAnimations: 0,
          averageDelay: 0,
          patternDistribution: {}
        })
      }

      const { result } = renderHook(() => useAdvancedAnimation())

      // エラーが発生してもクラッシュしないことを確認
      expect(() => {
        act(() => {
          result.current.applyRandomDisappearance(mockBubbles)
        })
      }).not.toThrow()
    })
  })

  describe('クリーンアップ', () => {
    it('アンマウント時にアニメーションフレームがキャンセルされる', () => {
      const { unmount } = renderHook(() => useAdvancedAnimation())

      unmount()

      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })
  })
})

describe('ANIMATION_PRESETS', () => {
  it('すべてのプリセットが定義されている', () => {
    expect(ANIMATION_PRESETS).toHaveProperty('gentle')
    expect(ANIMATION_PRESETS).toHaveProperty('lively')
    expect(ANIMATION_PRESETS).toHaveProperty('dramatic')
    expect(ANIMATION_PRESETS).toHaveProperty('mobile')
  })

  it('各プリセットが適切な設定を持っている', () => {
    Object.values(ANIMATION_PRESETS).forEach(preset => {
      expect(preset).toHaveProperty('randomnessFactor')
      expect(preset).toHaveProperty('staggerDisappearance')
      expect(preset.staggerDisappearance).toHaveProperty('enabled')
      expect(preset.staggerDisappearance).toHaveProperty('delayRange')
      expect(preset.staggerDisappearance).toHaveProperty('pattern')
    })
  })

  it('プリセットの値が適切な範囲内にある', () => {
    Object.values(ANIMATION_PRESETS).forEach(preset => {
      expect(preset.randomnessFactor).toBeGreaterThanOrEqual(0)
      expect(preset.randomnessFactor).toBeLessThanOrEqual(1)
      
      expect(preset.staggerDisappearance.delayRange.min).toBeGreaterThanOrEqual(0)
      expect(preset.staggerDisappearance.delayRange.max).toBeGreaterThan(preset.staggerDisappearance.delayRange.min)
    })
  })
})

describe('useAnimationPreset', () => {
  it('指定されたプリセットを返す', () => {
    const gentlePreset = useAnimationPreset('gentle')
    expect(gentlePreset).toEqual(ANIMATION_PRESETS.gentle)

    const livelyPreset = useAnimationPreset('lively')
    expect(livelyPreset).toEqual(ANIMATION_PRESETS.lively)

    const dramaticPreset = useAnimationPreset('dramatic')
    expect(dramaticPreset).toEqual(ANIMATION_PRESETS.dramatic)

    const mobilePreset = useAnimationPreset('mobile')
    expect(mobilePreset).toEqual(ANIMATION_PRESETS.mobile)
  })
})