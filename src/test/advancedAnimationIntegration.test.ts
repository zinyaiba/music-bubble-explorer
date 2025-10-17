/**
 * AdvancedAnimation統合テスト - シンプル版
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BubbleEntity } from '@/types/bubble'
import { 
  AdvancedAnimationController, 
  DEFAULT_ADVANCED_CONFIG 
} from '@/services/advancedAnimationController'
import { NaturalAnimationManager } from '@/services/naturalAnimationManager'

describe('AdvancedAnimation統合テスト', () => {
  let controller: AdvancedAnimationController
  let mockBubbles: BubbleEntity[]

  beforeEach(() => {
    controller = new AdvancedAnimationController()
    
    mockBubbles = [
      new BubbleEntity({
        type: 'song',
        name: 'Test Song',
        x: 100,
        y: 100,
        vx: 5,
        vy: -2,
        size: 60,
        color: '#FFB6C1',
        opacity: 1,
        lifespan: 8000,
        relatedCount: 3
      })
    ]
  })

  describe('基本機能', () => {
    it('AdvancedAnimationControllerが正しく初期化される', () => {
      expect(controller).toBeInstanceOf(AdvancedAnimationController)
      expect(controller.getConfiguration()).toEqual(DEFAULT_ADVANCED_CONFIG)
    })

    it('設定が正しく更新される', () => {
      const newConfig = { randomnessFactor: 0.8 }
      controller.updateConfiguration(newConfig)
      
      const config = controller.getConfiguration()
      expect(config.randomnessFactor).toBe(0.8)
    })

    it('ランダム消失アニメーションが適用される', () => {
      expect(() => {
        controller.applyRandomDisappearance(mockBubbles)
      }).not.toThrow()
    })

    it('まばらな消失タイミングが計算される', () => {
      const delays = controller.calculateStaggeredTiming(5)
      expect(delays).toHaveLength(5)
      expect(delays.every(delay => delay >= 0)).toBe(true)
    })

    it('統計情報が取得される', () => {
      const stats = controller.getAnimationStats()
      expect(stats).toHaveProperty('activeBubbles')
      expect(stats).toHaveProperty('scheduledDisappearances')
      expect(stats).toHaveProperty('activeAnimations')
      expect(stats).toHaveProperty('averageDelay')
      expect(stats).toHaveProperty('patternDistribution')
    })
  })

  describe('NaturalAnimationManager', () => {
    it('正しく初期化される', () => {
      const manager = new NaturalAnimationManager(DEFAULT_ADVANCED_CONFIG)
      expect(manager).toBeInstanceOf(NaturalAnimationManager)
    })

    it('消失パターンが生成される', () => {
      const manager = new NaturalAnimationManager(DEFAULT_ADVANCED_CONFIG)
      const patterns = manager.generateDisappearancePatterns(mockBubbles)
      
      expect(patterns).toHaveLength(mockBubbles.length)
      expect(patterns[0]).toHaveProperty('bubbleId')
      expect(patterns[0]).toHaveProperty('type')
      expect(patterns[0]).toHaveProperty('delay')
      expect(patterns[0]).toHaveProperty('duration')
    })
  })

  describe('エラーハンドリング', () => {
    it('空の配列でも正常に動作する', () => {
      expect(() => {
        controller.applyRandomDisappearance([])
      }).not.toThrow()
    })

    it('リセット機能が動作する', () => {
      controller.applyRandomDisappearance(mockBubbles)
      controller.reset()
      
      const stats = controller.getAnimationStats()
      expect(stats.activeBubbles).toBe(0)
    })
  })

  describe('パターン生成', () => {
    it('異なるパターンで異なる結果が生成される', () => {
      const randomDelays = controller.calculateStaggeredTiming(10)
      
      controller.updateConfiguration({
        staggerDisappearance: { pattern: 'wave' }
      })
      const waveDelays = controller.calculateStaggeredTiming(10)
      
      // 完全に同じ値になる可能性は低い
      expect(randomDelays).not.toEqual(waveDelays)
    })

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
  })
})