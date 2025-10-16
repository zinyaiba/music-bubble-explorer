/**
 * オブジェクトプールパターンの実装
 * 頻繁に作成・削除されるオブジェクトのメモリ使用量を最適化
 */
export class ObjectPool<T> {
  private pool: T[] = []
  private createFn: () => T
  private resetFn: (obj: T) => void
  private maxSize: number

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 10,
    maxSize: number = 100
  ) {
    this.createFn = createFn
    this.resetFn = resetFn
    this.maxSize = maxSize

    // 初期プールを作成
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn())
    }
  }

  /**
   * プールからオブジェクトを取得
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.createFn()
  }

  /**
   * オブジェクトをプールに返却
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj)
      this.pool.push(obj)
    }
  }

  /**
   * プールのサイズを取得
   */
  getPoolSize(): number {
    return this.pool.length
  }

  /**
   * プールをクリア
   */
  clear(): void {
    this.pool.length = 0
  }
}

/**
 * 2Dベクトル用のオブジェクトプール
 */
export interface Vector2D {
  x: number
  y: number
}

export const vector2DPool = new ObjectPool<Vector2D>(
  () => ({ x: 0, y: 0 }),
  (vec) => {
    vec.x = 0
    vec.y = 0
  },
  20,
  100
)

/**
 * 計算結果キャッシュ用のオブジェクトプール
 */
export interface CalculationCache {
  distance: number
  angle: number
  speed: number
  timestamp: number
}

export const calculationCachePool = new ObjectPool<CalculationCache>(
  () => ({ distance: 0, angle: 0, speed: 0, timestamp: 0 }),
  (cache) => {
    cache.distance = 0
    cache.angle = 0
    cache.speed = 0
    cache.timestamp = 0
  },
  10,
  50
)