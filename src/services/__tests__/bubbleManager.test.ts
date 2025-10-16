import { BubbleManager, BubbleConfig } from '../bubbleManager'
import { BubbleEntity } from '@/types/bubble'
import type { MusicDatabase } from '@/types/music'

/**
 * シンプルなテストフレームワーク（再利用）
 */
class SimpleTest {
  private testCount = 0
  private passCount = 0
  private failCount = 0

  test(name: string, testFn: () => void): void {
    this.testCount++
    try {
      testFn()
      this.passCount++
      console.log(`✅ ${name}`)
    } catch (error) {
      this.failCount++
      console.error(`❌ ${name}:`, error)
    }
  }

  expect(actual: any): {
    toBe: (expected: any) => void
    toEqual: (expected: any) => void
    toBeTruthy: () => void
    toBeFalsy: () => void
    toContain: (expected: any) => void
    toHaveLength: (expected: number) => void
    toThrow: () => void
    toBeGreaterThan: (expected: number) => void
    toBeLessThan: (expected: number) => void
    toBeGreaterThanOrEqual: (expected: number) => void
    toBeLessThanOrEqual: (expected: number) => void
  } {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`)
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`)
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`)
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`)
        }
      },
      toContain: (expected: any) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`)
        }
      },
      toHaveLength: (expected: number) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${actual.length} to be ${expected}`)
        }
      },
      toThrow: () => {
        let threw = false
        try {
          if (typeof actual === 'function') {
            actual()
          }
        } catch {
          threw = true
        }
        if (!threw) {
          throw new Error('Expected function to throw an error')
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`)
        }
      },
      toBeLessThan: (expected: number) => {
        if (actual >= expected) {
          throw new Error(`Expected ${actual} to be less than ${expected}`)
        }
      },
      toBeGreaterThanOrEqual: (expected: number) => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`)
        }
      },
      toBeLessThanOrEqual: (expected: number) => {
        if (actual > expected) {
          throw new Error(`Expected ${actual} to be less than or equal to ${expected}`)
        }
      }
    }
  }

  summary(): void {
    console.log(`\n📊 テスト結果: ${this.passCount}/${this.testCount} 成功`)
    if (this.failCount > 0) {
      console.log(`❌ ${this.failCount} 件のテストが失敗しました`)
    } else {
      console.log('🎉 すべてのテストが成功しました！')
    }
  }
}

/**
 * テスト用のサンプルデータベース
 */
const createTestDatabase = (): MusicDatabase => ({
  songs: [
    {
      id: 'song_001',
      title: 'テスト楽曲1',
      lyricists: ['作詞家A', '作詞家B'],
      composers: ['作曲家A'],
      arrangers: ['編曲家A', '編曲家B', '編曲家C'],
      tags: ['テスト', 'バラード']
    },
    {
      id: 'song_002',
      title: 'テスト楽曲2',
      lyricists: ['作詞家A'],
      composers: ['作曲家B', '作曲家C'],
      arrangers: [],
      tags: ['テスト', 'ロック']
    },
    {
      id: 'song_003',
      title: 'テスト楽曲3',
      lyricists: ['作詞家C'],
      composers: ['作曲家A'],
      arrangers: ['編曲家A'],
      tags: ['バラード']
    }
  ],
  people: [
    {
      id: 'person_001',
      name: '作詞家A',
      type: 'lyricist',
      songs: ['song_001', 'song_002']
    },
    {
      id: 'person_002',
      name: '作詞家B',
      type: 'lyricist',
      songs: ['song_001']
    },
    {
      id: 'person_003',
      name: '作詞家C',
      type: 'lyricist',
      songs: ['song_003']
    },
    {
      id: 'person_004',
      name: '作曲家A',
      type: 'composer',
      songs: ['song_001', 'song_003']
    },
    {
      id: 'person_005',
      name: '作曲家B',
      type: 'composer',
      songs: ['song_002']
    },
    {
      id: 'person_006',
      name: '作曲家C',
      type: 'composer',
      songs: ['song_002']
    },
    {
      id: 'person_007',
      name: '編曲家A',
      type: 'arranger',
      songs: ['song_001', 'song_003']
    },
    {
      id: 'person_008',
      name: '編曲家B',
      type: 'arranger',
      songs: ['song_001']
    },
    {
      id: 'person_009',
      name: '編曲家C',
      type: 'arranger',
      songs: ['song_001']
    }
  ],
  tags: [
    {
      id: 'tag-テスト',
      name: 'テスト',
      songs: ['song_001', 'song_002']
    },
    {
      id: 'tag-バラード',
      name: 'バラード',
      songs: ['song_001', 'song_003']
    },
    {
      id: 'tag-ロック',
      name: 'ロック',
      songs: ['song_002']
    }
  ]
})

/**
 * BubbleManagerのユニットテスト
 */
export function runBubbleManagerTests(): void {
  console.log('=== BubbleManager ユニットテスト開始 ===')
  const test = new SimpleTest()

  // テスト用のデータベースと設定
  const testDatabase = createTestDatabase()
  const testConfig: BubbleConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    maxBubbles: 10,
    minLifespan: 5000,
    maxLifespan: 15000,
    minVelocity: 10,
    maxVelocity: 50
  }

  // BubbleManagerの初期化テスト
  test.test('BubbleManagerの初期化', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    test.expect(manager).toBeTruthy()
    test.expect(manager.getBubbles()).toHaveLength(0)
  })

  // サイズ計算アルゴリズムのテスト
  test.test('サイズ計算アルゴリズム - 最小サイズ（関連数0）', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const size = manager.calculateBubbleSize(0)
    test.expect(size).toBe(40) // 最小サイズ
  })

  test.test('サイズ計算アルゴリズム - 最大サイズ（関連数20以上）', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const size = manager.calculateBubbleSize(25)
    test.expect(size).toBe(120) // 最大サイズ
  })

  test.test('サイズ計算アルゴリズム - 中間サイズ（関連数10）', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const size = manager.calculateBubbleSize(10)
    const expectedSize = 40 + (120 - 40) * (10 / 20) // 80
    test.expect(size).toBe(expectedSize)
  })

  test.test('サイズ計算アルゴリズム - 境界値テスト（関連数1）', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const size = manager.calculateBubbleSize(1)
    const expectedSize = 40 + (120 - 40) * (1 / 20) // 44
    test.expect(size).toBe(expectedSize)
  })

  // シャボン玉生成テスト
  test.test('シャボン玉生成 - 基本的な生成', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    test.expect(bubble).toBeTruthy()
    test.expect(bubble.id).toBeTruthy()
    test.expect(['song', 'lyricist', 'composer', 'arranger']).toContain(bubble.type)
    test.expect(bubble.name).toBeTruthy()
    test.expect(bubble.size).toBeGreaterThanOrEqual(40)
    test.expect(bubble.size).toBeLessThanOrEqual(120)
    test.expect(bubble.opacity).toBe(1)
    test.expect(bubble.lifespan).toBeGreaterThanOrEqual(testConfig.minLifespan)
    test.expect(bubble.lifespan).toBeLessThanOrEqual(testConfig.maxLifespan)
  })

  test.test('シャボン玉生成 - 位置の範囲チェック', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    test.expect(bubble.x).toBeGreaterThanOrEqual(bubble.size / 2)
    test.expect(bubble.x).toBeLessThanOrEqual(testConfig.canvasWidth - bubble.size / 2)
    test.expect(bubble.y).toBeGreaterThanOrEqual(bubble.size / 2)
    test.expect(bubble.y).toBeLessThanOrEqual(testConfig.canvasHeight - bubble.size / 2)
  })

  test.test('シャボン玉生成 - 速度の範囲チェック', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    test.expect(Math.abs(bubble.vx)).toBeLessThanOrEqual(testConfig.maxVelocity)
    test.expect(Math.abs(bubble.vy)).toBeLessThanOrEqual(testConfig.maxVelocity)
  })

  // シャボン玉追加・削除テスト
  test.test('シャボン玉の追加', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    manager.addBubble(bubble)
    test.expect(manager.getBubbles()).toHaveLength(1)
    test.expect(manager.getBubbles()[0].id).toBe(bubble.id)
  })

  test.test('シャボン玉の削除', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    manager.addBubble(bubble)
    test.expect(manager.getBubbles()).toHaveLength(1)
    
    manager.removeBubble(bubble.id)
    test.expect(manager.getBubbles()).toHaveLength(0)
  })

  test.test('存在しないシャボン玉の削除', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = manager.generateBubble()
    
    manager.addBubble(bubble)
    test.expect(manager.getBubbles()).toHaveLength(1)
    
    manager.removeBubble('non-existent-id')
    test.expect(manager.getBubbles()).toHaveLength(1) // 変化なし
  })

  // 最大シャボン玉数の制限テスト
  test.test('最大シャボン玉数の制限', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    // 最大数を超えて追加を試行
    for (let i = 0; i < testConfig.maxBubbles + 5; i++) {
      const bubble = manager.generateBubble()
      manager.addBubble(bubble)
    }
    
    test.expect(manager.getBubbles()).toHaveLength(testConfig.maxBubbles)
  })

  // シャボン玉の物理更新テスト
  test.test('シャボン玉の物理更新 - 基本的な移動', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 10,
      vy: 10,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })
    
    const updatedBubbles = manager.updateBubblePhysics([bubble])
    test.expect(updatedBubbles).toHaveLength(1)
    
    const updatedBubble = updatedBubbles[0]
    // 位置が更新されていることを確認（deltaTimeが0でない場合）
    test.expect(updatedBubble.x).toBeGreaterThanOrEqual(bubble.x)
    test.expect(updatedBubble.y).toBeGreaterThanOrEqual(bubble.y)
  })

  test.test('シャボン玉の物理更新 - 死んだシャボン玉の除去', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const deadBubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 0, // 死んだ状態
      lifespan: 0, // 寿命切れ
      relatedCount: 5
    })
    
    const updatedBubbles = manager.updateBubblePhysics([deadBubble])
    test.expect(updatedBubbles).toHaveLength(0) // 死んだシャボン玉は除去される
  })

  // 座標からシャボン玉を検索するテスト
  test.test('座標からシャボン玉を検索 - ヒット', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })
    
    manager.addBubble(bubble)
    const found = manager.findBubbleAtPosition(100, 100) // 中心をクリック
    test.expect(found).toBeTruthy()
    test.expect(found?.id).toBe(bubble.id)
  })

  test.test('座標からシャボン玉を検索 - ミス', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })
    
    manager.addBubble(bubble)
    const found = manager.findBubbleAtPosition(200, 200) // 遠い位置をクリック
    test.expect(found).toBeFalsy()
  })

  // シャボン玉数の維持テスト
  test.test('シャボン玉数の維持', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    // 初期状態では0個
    test.expect(manager.getBubbles()).toHaveLength(0)
    
    // 維持機能を実行
    manager.maintainBubbleCount()
    
    // 最大数まで生成される
    test.expect(manager.getBubbles()).toHaveLength(testConfig.maxBubbles)
  })

  // 全シャボン玉のクリアテスト
  test.test('全シャボン玉のクリア', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    // いくつかシャボン玉を追加
    manager.maintainBubbleCount()
    test.expect(manager.getBubbles().length).toBeGreaterThan(0)
    
    // 全クリア
    manager.clearAllBubbles()
    test.expect(manager.getBubbles()).toHaveLength(0)
  })

  // 設定更新テスト
  test.test('設定の更新', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    const newConfig = { maxBubbles: 5 }
    manager.updateConfig(newConfig)
    
    // 新しい設定で動作することを確認
    manager.maintainBubbleCount()
    test.expect(manager.getBubbles()).toHaveLength(5)
  })

  // 統計情報テスト
  test.test('統計情報の取得', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    // いくつかシャボン玉を追加
    manager.maintainBubbleCount()
    
    const stats = manager.getStats()
    test.expect(stats.totalBubbles).toBe(testConfig.maxBubbles)
    test.expect(stats.songBubbles).toBeGreaterThanOrEqual(0)
    test.expect(stats.lyricistBubbles).toBeGreaterThanOrEqual(0)
    test.expect(stats.composerBubbles).toBeGreaterThanOrEqual(0)
    test.expect(stats.arrangerBubbles).toBeGreaterThanOrEqual(0)
    test.expect(stats.averageSize).toBeGreaterThan(0)
    test.expect(stats.averageLifespan).toBeGreaterThan(0)
  })

  test.test('空のシャボン玉リストの統計情報', () => {
    const manager = new BubbleManager(testDatabase, testConfig)
    
    const stats = manager.getStats()
    test.expect(stats.totalBubbles).toBe(0)
    test.expect(stats.songBubbles).toBe(0)
    test.expect(stats.lyricistBubbles).toBe(0)
    test.expect(stats.composerBubbles).toBe(0)
    test.expect(stats.arrangerBubbles).toBe(0)
    test.expect(stats.averageSize).toBe(0)
    test.expect(stats.averageLifespan).toBe(0)
  })

  test.summary()
  console.log('=== BubbleManager ユニットテスト終了 ===\n')
}

// テスト関数をエクスポート（必要に応じて直接実行可能）
// runBubbleManagerTests()