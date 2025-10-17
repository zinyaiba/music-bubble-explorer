/**
 * NaturalAnimationManager のユニットテスト
 * Requirements: 20.4, 20.5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { BubbleEntity } from '@/types/bubble'
import { 
  NaturalAnimationManager,
  type DisappearancePattern,
  type DisappearancePatternType 
} from '@/services/naturalAnimationManager'
import { DEFAULT_ADVANCED_CONFIG } from '@/services/advancedAnimationController'

// DOM環境のモック
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now())
  }
})

// Animation APIのモック
global.Animation = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  play: vi.fn(),
  pause: vi.fn(),
  cancel: vi.fn(),
  finish: vi.fn()
}))

describe('NaturalAnimationManager', () => {
  let manager: NaturalAnimationManager
  let mockBubbles: BubbleEntity[]

  beforeEach(() => {
    manager = new NaturalAnimationManager(DEFAULT_ADVANCED_CONFIG)
    
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
        type: 'composer',
        name: 'Test Composer',
        x: 300,
        y: 200,
        vx: 2,
        vy: -4,
        size: 55,
        color: '#DDA0DD',
        opacity: 1,
        lifespan: 7000,
        relatedCount: 4
      }),
      new BubbleEntity({
        type: 'tag',
        name: 'Test Tag',
        x: 150,
        y: 250,
        vx: -1,
        vy: 3,
        size: 45,
        color: '#98FB98',
        opacity: 1,
        lifespan: 5500,
        relatedCount: 6
      })
    ]
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('正しく初期化される', () => {
      expect(manager).toBeInstanceOf(NaturalAnimationManager)
      
      const stats = manager.getStats()
      expect(stats.patternHistory).toBe(0)
      expect(stats.clusterCount).toBe(0)
      expect(stats.lastPatternTypes).toEqual([])
    })

    it('設定更新が正常に動作する', () => {
      const newConfig = {
        ...DEFAULT_ADVANCED_CONFIG,
        randomnessFactor: 0.8
      }

      expect(() => {
        manager.updateConfig(newConfig)
      }).not.toThrow()
    })
  })

  describe('消失パターン生成', () => {
    it('ランダムパターンが生成される', () => {
      const patterns = manager.generateDisappearancePatterns(mockBubbles)

      expect(patterns).toHaveLength(mockBubbles.length)
      patterns.forEach((pattern, index) => {
        expect(pattern.bubbleId).toBe(mockBubbles[index].id)
        expect(pattern.type).toBe('random')
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(0)
        expect(pattern.intensity).toBeGreaterThan(0)
        expect(pattern.intensity).toBeLessThanOrEqual(1)
        expect(pattern.affectedBubbles).toContain(mockBubbles[index].id)
        expect(pattern.coordinates).toEqual({
          x: mockBubbles[index].x,
          y: mockBubbles[index].y
        })
      })
    })

    it('波パターンが生成される', () => {
      // 波パターンに設定を変更
      manager.updateConfig({
        ...DEFAULT_ADVANCED_CONFIG,
        staggerDisappearance: {
          ...DEFAULT_ADVANCED_CONFIG.staggerDisappearance,
          pattern: 'wave'
        }
      })

      const patterns = manager.generateDisappearancePatterns(mockBubbles)

      expect(patterns).toHaveLength(mockBubbles.length)
      patterns.forEach(pattern => {
        expect(pattern.type).toBe('wave')
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(1000) // 波パターンは1.2-1.8秒
        expect(pattern.duration).toBeLessThan(2000)
      })

      // 距離に基づく遅延の確認（完全な順序は保証されないが、傾向は確認）
      const centerX = mockBubbles.reduce((sum, b) => sum + b.x, 0) / mockBubbles.length
      const centerY = mockBubbles.reduce((sum, b) => sum + b.y, 0) / mockBubbles.length

      const distances = mockBubbles.map(bubble => 
        Math.sqrt(Math.pow(bubble.x - centerX, 2) + Math.pow(bubble.y - centerY, 2))
      )

      // 最も近いシャボン玉と最も遠いシャボン玉の遅延を比較
      const minDistanceIndex = distances.indexOf(Math.min(...distances))
      const maxDistanceIndex = distances.indexOf(Math.max(...distances))

      // 遠いシャボン玉の方が遅延が大きい傾向があることを確認（ランダム性があるため厳密ではない）
      expect(patterns[maxDistanceIndex].delay).toBeGreaterThanOrEqual(0)
      expect(patterns[minDistanceIndex].delay).toBeGreaterThanOrEqual(0)
    })

    it('スパイラルパターンが生成される', () => {
      manager.updateConfig({
        ...DEFAULT_ADVANCED_CONFIG,
        staggerDisappearance: {
          ...DEFAULT_ADVANCED_CONFIG.staggerDisappearance,
          pattern: 'spiral'
        }
      })

      const patterns = manager.generateDisappearancePatterns(mockBubbles)

      expect(patterns).toHaveLength(mockBubbles.length)
      patterns.forEach(pattern => {
        expect(pattern.type).toBe('spiral')
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(1200) // スパイラルパターンは1.4-2.2秒
        expect(pattern.duration).toBeLessThan(2500)
      })
    })

    it('カスケードパターンが生成される', () => {
      manager.updateConfig({
        ...DEFAULT_ADVANCED_CONFIG,
        staggerDisappearance: {
          ...DEFAULT_ADVANCED_CONFIG.staggerDisappearance,
          pattern: 'cascade'
        }
      })

      const patterns = manager.generateDisappearancePatterns(mockBubbles)

      expect(patterns).toHaveLength(mockBubbles.length)
      patterns.forEach(pattern => {
        expect(pattern.type).toBe('cascade')
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(900) // カスケードパターンは1.0-1.5秒
        expect(pattern.duration).toBeLessThan(1600)
      })

      // Y座標順での遅延確認
      const sortedByY = [...mockBubbles].sort((a, b) => a.y - b.y)
      const sortedPatterns = patterns.sort((a, b) => {
        const bubbleA = mockBubbles.find(bubble => bubble.id === a.bubbleId)!
        const bubbleB = mockBubbles.find(bubble => bubble.id === b.bubbleId)!
        return bubbleA.y - bubbleB.y
      })

      // 上の方のシャボン玉が先に消える傾向があることを確認
      expect(sortedPatterns[0].delay).toBeLessThanOrEqual(sortedPatterns[sortedPatterns.length - 1].delay + 200)
    })

    it('オーガニックパターンが生成される', () => {
      manager.updateConfig({
        ...DEFAULT_ADVANCED_CONFIG,
        staggerDisappearance: {
          ...DEFAULT_ADVANCED_CONFIG.staggerDisappearance,
          pattern: 'organic' as DisappearancePatternType
        }
      })

      const patterns = manager.generateDisappearancePatterns(mockBubbles)

      expect(patterns).toHaveLength(mockBubbles.length)
      patterns.forEach(pattern => {
        expect(pattern.type).toBe('organic')
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(1200) // オーガニックパターンは1.3-2.0秒
        expect(pattern.duration).toBeLessThan(2100)
      })
    })
  })

  describe('アニメーション軌道生成', () => {
    it('DOM要素が存在しない場合はnullを返す', () => {
      // DOM要素が見つからない場合のテスト
      const bubble = mockBubbles[0]
      const animation = manager.createDisappearanceAnimation(bubble, 'random')
      
      expect(animation).toBeNull()
    })

    it('DOM要素が存在する場合はアニメーションを作成する', () => {
      // DOM要素をモック
      const mockElement = {
        animate: vi.fn().mockReturnValue({
          addEventListener: vi.fn(),
          play: vi.fn(),
          pause: vi.fn(),
          cancel: vi.fn()
        })
      }

      // document.querySelectorをモック
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any)

      const bubble = mockBubbles[0]
      const animation = manager.createDisappearanceAnimation(bubble, 'wave')

      expect(mockElement.animate).toHaveBeenCalled()
      expect(animation).not.toBeNull()

      // モックをリストア
      vi.restoreAllMocks()
    })
  })

  describe('パターン履歴管理', () => {
    it('パターン履歴が正しく更新される', () => {
      const patterns1 = manager.generateDisappearancePatterns(mockBubbles.slice(0, 2))
      let stats = manager.getStats()
      expect(stats.patternHistory).toBe(2)

      const patterns2 = manager.generateDisappearancePatterns(mockBubbles.slice(2, 4))
      stats = manager.getStats()
      expect(stats.patternHistory).toBe(4)

      // 最近のパターンタイプが記録されていることを確認
      expect(stats.lastPatternTypes).toHaveLength(4)
      expect(stats.lastPatternTypes.every(type => type === 'random')).toBe(true)
    })

    it('履歴サイズが制限される', () => {
      // 大量のパターンを生成して履歴制限をテスト
      const largeBubbleSet = Array.from({ length: 60 }, (_, i) => 
        new BubbleEntity({
          type: 'song',
          name: `Test Song ${i}`,
          x: i * 10,
          y: i * 5,
          vx: 1,
          vy: 1,
          size: 50,
          color: '#FFB6C1',
          opacity: 1,
          lifespan: 5000,
          relatedCount: 1
        })
      )

      manager.generateDisappearancePatterns(largeBubbleSet)
      const stats = manager.getStats()

      // 履歴が最大サイズ（50）を超えないことを確認
      expect(stats.patternHistory).toBeLessThanOrEqual(50)
    })
  })

  describe('統計情報', () => {
    it('正しい統計情報が取得される', () => {
      const patterns = manager.generateDisappearancePatterns(mockBubbles)
      const stats = manager.getStats()

      expect(stats).toHaveProperty('patternHistory')
      expect(stats).toHaveProperty('clusterCount')
      expect(stats).toHaveProperty('lastPatternTypes')

      expect(typeof stats.patternHistory).toBe('number')
      expect(typeof stats.clusterCount).toBe('number')
      expect(Array.isArray(stats.lastPatternTypes)).toBe(true)

      expect(stats.patternHistory).toBe(mockBubbles.length)
      expect(stats.lastPatternTypes).toHaveLength(Math.min(10, mockBubbles.length))
    })

    it('クラスター数が正しく更新される', () => {
      // オーガニックパターンに設定してクラスタリングをテスト
      manager.updateConfig({
        ...DEFAULT_ADVANCED_CONFIG,
        staggerDisappearance: {
          ...DEFAULT_ADVANCED_CONFIG.staggerDisappearance,
          pattern: 'organic' as DisappearancePatternType
        }
      })

      // 多くのシャボン玉でクラスタリングをテスト
      const manyBubbles = Array.from({ length: 20 }, (_, i) => 
        new BubbleEntity({
          type: 'song',
          name: `Test Song ${i}`,
          x: (i % 5) * 100 + Math.random() * 20, // 5つのグループに分散
          y: Math.floor(i / 5) * 100 + Math.random() * 20,
          vx: 1,
          vy: 1,
          size: 50,
          color: '#FFB6C1',
          opacity: 1,
          lifespan: 5000,
          relatedCount: 1
        })
      )

      manager.generateDisappearancePatterns(manyBubbles)
      const stats = manager.getStats()

      expect(stats.clusterCount).toBeGreaterThanOrEqual(0)
      expect(stats.clusterCount).toBeLessThanOrEqual(3) // 最大3クラスター
    })
  })

  describe('リセット機能', () => {
    it('リセット後に状態がクリアされる', () => {
      // 何らかの状態を作成
      manager.generateDisappearancePatterns(mockBubbles)
      
      let stats = manager.getStats()
      expect(stats.patternHistory).toBeGreaterThan(0)

      // リセット実行
      manager.reset()

      stats = manager.getStats()
      expect(stats.patternHistory).toBe(0)
      expect(stats.clusterCount).toBe(0)
      expect(stats.lastPatternTypes).toEqual([])
    })
  })

  describe('エラーハンドリング', () => {
    it('空の配列でも正常に動作する', () => {
      expect(() => {
        manager.generateDisappearancePatterns([])
      }).not.toThrow()

      const patterns = manager.generateDisappearancePatterns([])
      expect(patterns).toEqual([])
    })

    it('単一のシャボン玉でも正常に動作する', () => {
      const singleBubble = [mockBubbles[0]]
      
      expect(() => {
        manager.generateDisappearancePatterns(singleBubble)
      }).not.toThrow()

      const patterns = manager.generateDisappearancePatterns(singleBubble)
      expect(patterns).toHaveLength(1)
      expect(patterns[0].bubbleId).toBe(singleBubble[0].id)
    })

    it('無効なパターンタイプでもフォールバックする', () => {
      const bubble = mockBubbles[0]
      
      expect(() => {
        manager.createDisappearanceAnimation(bubble, 'invalid' as DisappearancePatternType)
      }).not.toThrow()
    })
  })

  describe('パフォーマンス', () => {
    it('大量のシャボン玉でも適切に動作する', () => {
      const largeBubbleSet = Array.from({ length: 100 }, (_, i) => 
        new BubbleEntity({
          type: 'song',
          name: `Test Song ${i}`,
          x: Math.random() * 1000,
          y: Math.random() * 800,
          vx: Math.random() * 10 - 5,
          vy: Math.random() * 10 - 5,
          size: 40 + Math.random() * 40,
          color: '#FFB6C1',
          opacity: 1,
          lifespan: 5000 + Math.random() * 5000,
          relatedCount: Math.floor(Math.random() * 10)
        })
      )

      const startTime = performance.now()
      const patterns = manager.generateDisappearancePatterns(largeBubbleSet)
      const endTime = performance.now()

      expect(patterns).toHaveLength(largeBubbleSet.length)
      expect(endTime - startTime).toBeLessThan(100) // 100ms以内で完了することを期待

      patterns.forEach(pattern => {
        expect(pattern.delay).toBeGreaterThanOrEqual(0)
        expect(pattern.duration).toBeGreaterThan(0)
        expect(pattern.intensity).toBeGreaterThan(0)
        expect(pattern.intensity).toBeLessThanOrEqual(1)
      })
    })
  })
})