import { BubbleEntity } from '../bubble'

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
    toBeCloseTo: (expected: number, precision?: number) => void
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
      },
      toBeCloseTo: (expected: number, precision: number = 2) => {
        const diff = Math.abs(actual - expected)
        const tolerance = Math.pow(10, -precision)
        if (diff > tolerance) {
          throw new Error(`Expected ${actual} to be close to ${expected} (within ${tolerance})`)
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
 * BubbleEntityのユニットテスト
 */
export function runBubbleEntityTests(): void {
  console.log('=== BubbleEntity ユニットテスト開始 ===')
  const test = new SimpleTest()

  // BubbleEntityの初期化テスト
  test.test('BubbleEntityの初期化 - 基本的なプロパティ', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 200,
      vx: 10,
      vy: -5,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.type).toBe('song')
    test.expect(bubble.name).toBe('テスト楽曲')
    test.expect(bubble.x).toBe(100)
    test.expect(bubble.y).toBe(200)
    test.expect(bubble.vx).toBe(10)
    test.expect(bubble.vy).toBe(-5)
    test.expect(bubble.size).toBe(50)
    test.expect(bubble.color).toBe('#FFB6C1')
    test.expect(bubble.opacity).toBe(1)
    test.expect(bubble.lifespan).toBe(10000)
    test.expect(bubble.relatedCount).toBe(5)
    test.expect(bubble.id).toBeTruthy()
  })

  test.test('BubbleEntityの初期化 - カスタムID', () => {
    const customId = 'custom_bubble_id'
    const bubble = new BubbleEntity({
      id: customId,
      type: 'lyricist',
      name: '作詞家A',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 40,
      color: '#B6E5D8',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 3
    })

    test.expect(bubble.id).toBe(customId)
  })

  test.test('BubbleEntityの初期化 - 自動ID生成', () => {
    const bubble1 = new BubbleEntity({
      type: 'composer',
      name: '作曲家A',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#DDA0DD',
      opacity: 1,
      lifespan: 8000,
      relatedCount: 7
    })

    const bubble2 = new BubbleEntity({
      type: 'arranger',
      name: '編曲家A',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 70,
      color: '#F0E68C',
      opacity: 1,
      lifespan: 12000,
      relatedCount: 2
    })

    test.expect(bubble1.id).toBeTruthy()
    test.expect(bubble2.id).toBeTruthy()
    test.expect(bubble1.id !== bubble2.id).toBeTruthy() // 異なるIDが生成される
  })

  // 物理更新テスト
  test.test('物理更新 - 位置の更新', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 20,
      vy: 30,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    const deltaTime = 0.1 // 0.1秒
    bubble.update(deltaTime)

    test.expect(bubble.x).toBe(102) // 100 + 20 * 0.1
    test.expect(bubble.y).toBe(103) // 100 + 30 * 0.1
  })

  test.test('物理更新 - 年齢とライフスパンの更新', () => {
    const initialLifespan = 10000
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
      lifespan: initialLifespan,
      relatedCount: 5
    })

    const deltaTime = 1 // 1秒
    bubble.update(deltaTime)

    test.expect(bubble.getAge()).toBe(1)
    test.expect(bubble.lifespan).toBe(initialLifespan - 1)
  })

  test.test('物理更新 - 透明度のフェードアウト', () => {
    const initialLifespan = 10
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
      lifespan: initialLifespan,
      relatedCount: 5
    })

    // 寿命の80%まで進める（8秒）
    bubble.update(8)
    test.expect(bubble.opacity).toBe(1) // まだフェードアウトしない

    // 寿命の90%まで進める（9秒）
    bubble.update(1)
    test.expect(bubble.opacity).toBeLessThan(1) // フェードアウト開始
    test.expect(bubble.opacity).toBeGreaterThan(0)

    // 寿命の100%まで進める（10秒）
    bubble.update(1)
    test.expect(bubble.opacity).toBe(0) // 完全にフェードアウト
  })

  // 生存状態テスト
  test.test('生存状態チェック - 生きている状態', () => {
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

    test.expect(bubble.isAlive()).toBeTruthy()
  })

  test.test('生存状態チェック - 寿命切れ', () => {
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
      lifespan: 0, // 寿命切れ
      relatedCount: 5
    })

    test.expect(bubble.isAlive()).toBeFalsy()
  })

  test.test('生存状態チェック - 透明度0', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 0, // 透明
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.isAlive()).toBeFalsy()
  })

  // 境界チェックテスト
  test.test('境界チェック - 画面内', () => {
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

    test.expect(bubble.isInBounds(800, 600)).toBeTruthy()
  })

  test.test('境界チェック - 画面外（左）', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: -100, // 画面外
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.isInBounds(800, 600)).toBeFalsy()
  })

  test.test('境界チェック - 画面外（右）', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 900, // 画面外
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.isInBounds(800, 600)).toBeFalsy()
  })

  test.test('境界チェック - マージン考慮', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: -40, // サイズ分のマージン内
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.isInBounds(800, 600)).toBeTruthy() // マージン内なので境界内
  })

  // 点の包含テスト（クリック判定）
  test.test('点の包含テスト - 中心点', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50, // 半径25
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.containsPoint(100, 100)).toBeTruthy() // 中心点
  })

  test.test('点の包含テスト - 境界内', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50, // 半径25
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.containsPoint(120, 100)).toBeTruthy() // 半径内
    test.expect(bubble.containsPoint(100, 120)).toBeTruthy() // 半径内
  })

  test.test('点の包含テスト - 境界外', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50, // 半径25
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.containsPoint(130, 100)).toBeFalsy() // 半径外
    test.expect(bubble.containsPoint(100, 130)).toBeFalsy() // 半径外
    test.expect(bubble.containsPoint(200, 200)).toBeFalsy() // 遠い点
  })

  test.test('点の包含テスト - 境界ちょうど', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50, // 半径25
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    test.expect(bubble.containsPoint(125, 100)).toBeTruthy() // 境界ちょうど
  })

  // 速度設定テスト
  test.test('速度設定', () => {
    const bubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 10,
      vy: 20,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })

    bubble.setVelocity(30, 40)
    test.expect(bubble.vx).toBe(30)
    test.expect(bubble.vy).toBe(40)
  })

  // 位置設定テスト
  test.test('位置設定', () => {
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

    bubble.setPosition(200, 300)
    test.expect(bubble.x).toBe(200)
    test.expect(bubble.y).toBe(300)
  })

  // アニメーション状態テスト
  test.test('アニメーション状態の設定と取得', () => {
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

    test.expect(bubble.getIsAnimating()).toBeFalsy() // 初期状態

    bubble.setAnimating(true)
    test.expect(bubble.getIsAnimating()).toBeTruthy()

    bubble.setAnimating(false)
    test.expect(bubble.getIsAnimating()).toBeFalsy()
  })

  // クローンテスト
  test.test('シャボン玉のクローン - 基本プロパティ', () => {
    const original = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 200,
      vx: 10,
      vy: 20,
      size: 50,
      color: '#FFB6C1',
      opacity: 0.8,
      lifespan: 5000,
      relatedCount: 3
    })

    const cloned = original.clone()

    test.expect(cloned.type).toBe(original.type)
    test.expect(cloned.name).toBe(original.name)
    test.expect(cloned.x).toBe(original.x)
    test.expect(cloned.y).toBe(original.y)
    test.expect(cloned.vx).toBe(original.vx)
    test.expect(cloned.vy).toBe(original.vy)
    test.expect(cloned.size).toBe(original.size)
    test.expect(cloned.color).toBe(original.color)
    test.expect(cloned.opacity).toBe(original.opacity)
    test.expect(cloned.lifespan).toBe(original.lifespan)
    test.expect(cloned.relatedCount).toBe(original.relatedCount)
  })

  test.test('シャボン玉のクローン - 内部状態', () => {
    const original = new BubbleEntity({
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

    // 内部状態を変更
    original.update(5) // 年齢を5秒に
    original.setAnimating(true)

    const cloned = original.clone()

    test.expect(cloned.getAge()).toBe(original.getAge())
    test.expect(cloned.getIsAnimating()).toBe(original.getIsAnimating())
  })

  test.test('シャボン玉のクローン - 独立性', () => {
    const original = new BubbleEntity({
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

    const cloned = original.clone()

    // オリジナルを変更
    original.setPosition(200, 200)
    original.setVelocity(50, 60)

    // クローンは影響を受けない
    test.expect(cloned.x).toBe(100)
    test.expect(cloned.y).toBe(100)
    test.expect(cloned.vx).toBe(0)
    test.expect(cloned.vy).toBe(0)
  })

  test.summary()
  console.log('=== BubbleEntity ユニットテスト終了 ===\n')
}

// テスト関数をエクスポート（必要に応じて直接実行可能）
// runBubbleEntityTests()