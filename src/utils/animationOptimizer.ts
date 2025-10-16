/**
 * アニメーション最適化ユーティリティ
 * Requirements: 7.3, 7.4, 7.5 - GPU加速とパフォーマンス最適化
 */

/**
 * GPU加速のためのCSS変換ユーティリティ
 */
export class GPUAccelerationHelper {
  private static isGPUAccelerationSupported: boolean | null = null
  
  /**
   * GPU加速がサポートされているかチェック
   */
  static checkGPUAccelerationSupport(): boolean {
    if (this.isGPUAccelerationSupported !== null) {
      return this.isGPUAccelerationSupported
    }
    
    if (typeof window === 'undefined') {
      this.isGPUAccelerationSupported = false
      return false
    }
    
    // Canvas 2Dコンテキストでのハードウェア加速チェック
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      this.isGPUAccelerationSupported = false
      return false
    }
    
    // WebGL サポートチェック
    const webglCanvas = document.createElement('canvas')
    const webglCtx = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl')
    
    this.isGPUAccelerationSupported = !!webglCtx
    return this.isGPUAccelerationSupported
  }
  
  /**
   * 要素にGPU加速のヒントを適用
   */
  static applyGPUAcceleration(element: HTMLElement): void {
    if (!this.checkGPUAccelerationSupport()) return
    
    const style = element.style
    
    // GPU層を強制作成
    style.transform = style.transform || 'translateZ(0)'
    style.webkitTransform = style.webkitTransform || 'translateZ(0)'
    
    // ブラウザに変更予定を通知
    style.willChange = 'transform'
    
    // 裏面を非表示にして最適化
    style.backfaceVisibility = 'hidden'
    style.webkitBackfaceVisibility = 'hidden'
    
    // 3D変換を有効化
    style.perspective = '1000px'
    style.webkitPerspective = '1000px'
  }
  
  /**
   * Canvas要素の描画パフォーマンスを最適化
   */
  static optimizeCanvasPerformance(canvas: HTMLCanvasElement): void {
    if (!canvas) return
    
    // GPU加速を適用
    this.applyGPUAcceleration(canvas)
    
    // Canvas固有の最適化
    const ctx = canvas.getContext('2d')
    if (ctx) {
      // アンチエイリアシングを無効化してパフォーマンス向上
      ctx.imageSmoothingEnabled = false
      
      // 描画品質を調整
      if ('imageSmoothingQuality' in ctx) {
        (ctx as any).imageSmoothingQuality = 'low'
      }
    }
  }
}

/**
 * アニメーションフレームレート監視クラス
 */
export class FrameRateMonitor {
  private frameCount = 0
  private lastTime = 0
  private fps = 0
  private frameHistory: number[] = []
  private maxHistorySize = 60 // 1秒分のフレーム履歴
  
  /**
   * フレーム開始時に呼び出す
   */
  startFrame(): void {
    const currentTime = performance.now()
    
    if (this.lastTime > 0) {
      const deltaTime = currentTime - this.lastTime
      this.frameHistory.push(deltaTime)
      
      // 履歴サイズを制限
      if (this.frameHistory.length > this.maxHistorySize) {
        this.frameHistory.shift()
      }
      
      // FPS計算
      if (this.frameHistory.length >= 10) {
        const averageDelta = this.frameHistory.reduce((sum, delta) => sum + delta, 0) / this.frameHistory.length
        this.fps = 1000 / averageDelta
      }
    }
    
    this.lastTime = currentTime
    this.frameCount++
  }
  
  /**
   * 現在のFPSを取得
   */
  getCurrentFPS(): number {
    return Math.round(this.fps)
  }
  
  /**
   * フレームドロップ率を取得
   */
  getFrameDropRate(): number {
    if (this.frameHistory.length < 10) return 0
    
    const targetFrameTime = 1000 / 60 // 60FPS
    const droppedFrames = this.frameHistory.filter(delta => delta > targetFrameTime * 1.5).length
    
    return (droppedFrames / this.frameHistory.length) * 100
  }
  
  /**
   * パフォーマンス統計を取得
   */
  getStats(): {
    fps: number
    frameCount: number
    frameDropRate: number
    isOptimal: boolean
  } {
    const fps = this.getCurrentFPS()
    const frameDropRate = this.getFrameDropRate()
    
    return {
      fps,
      frameCount: this.frameCount,
      frameDropRate,
      isOptimal: fps >= 55 && frameDropRate < 10
    }
  }
  
  /**
   * 統計をリセット
   */
  reset(): void {
    this.frameCount = 0
    this.lastTime = 0
    this.fps = 0
    this.frameHistory = []
  }
}

/**
 * アニメーション最適化設定
 */
export interface AnimationOptimizationConfig {
  targetFPS: number
  enableGPUAcceleration: boolean
  enableFrameSkipping: boolean
  maxBubbleCount: number
  qualityLevel: 'low' | 'medium' | 'high'
}

/**
 * アニメーション最適化マネージャー
 */
export class AnimationOptimizer {
  private config: AnimationOptimizationConfig
  private frameRateMonitor = new FrameRateMonitor()
  private lastOptimizationTime = 0
  private optimizationInterval = 2000 // 2秒ごとに最適化チェック
  
  constructor(config: Partial<AnimationOptimizationConfig> = {}) {
    this.config = {
      targetFPS: 60,
      enableGPUAcceleration: true,
      enableFrameSkipping: false,
      maxBubbleCount: 30,
      qualityLevel: 'high',
      ...config
    }
  }
  
  /**
   * フレーム開始時の処理
   */
  startFrame(): void {
    this.frameRateMonitor.startFrame()
    
    // 定期的な最適化チェック
    const currentTime = performance.now()
    if (currentTime - this.lastOptimizationTime > this.optimizationInterval) {
      this.optimizePerformance()
      this.lastOptimizationTime = currentTime
    }
  }
  
  /**
   * パフォーマンスに基づく自動最適化
   */
  private optimizePerformance(): void {
    const stats = this.frameRateMonitor.getStats()
    
    // FPSが低い場合の最適化
    if (stats.fps < this.config.targetFPS * 0.8) {
      this.degradeQuality()
    }
    // FPSが十分高い場合の品質向上
    else if (stats.fps > this.config.targetFPS * 0.95 && stats.frameDropRate < 5) {
      this.improveQuality()
    }
  }
  
  /**
   * 品質を下げてパフォーマンスを向上
   */
  private degradeQuality(): void {
    switch (this.config.qualityLevel) {
      case 'high':
        this.config.qualityLevel = 'medium'
        this.config.maxBubbleCount = Math.max(15, this.config.maxBubbleCount - 5)
        break
      case 'medium':
        this.config.qualityLevel = 'low'
        this.config.maxBubbleCount = Math.max(10, this.config.maxBubbleCount - 5)
        this.config.enableFrameSkipping = true
        break
    }
    
    console.log(`Performance optimization: Quality degraded to ${this.config.qualityLevel}`)
  }
  
  /**
   * 品質を向上
   */
  private improveQuality(): void {
    switch (this.config.qualityLevel) {
      case 'low':
        this.config.qualityLevel = 'medium'
        this.config.maxBubbleCount = Math.min(25, this.config.maxBubbleCount + 3)
        this.config.enableFrameSkipping = false
        break
      case 'medium':
        this.config.qualityLevel = 'high'
        this.config.maxBubbleCount = Math.min(30, this.config.maxBubbleCount + 3)
        break
    }
    
    console.log(`Performance optimization: Quality improved to ${this.config.qualityLevel}`)
  }
  
  /**
   * 現在の設定を取得
   */
  getConfig(): AnimationOptimizationConfig {
    return { ...this.config }
  }
  
  /**
   * パフォーマンス統計を取得
   */
  getStats() {
    return this.frameRateMonitor.getStats()
  }
  
  /**
   * フレームをスキップすべきかチェック
   */
  shouldSkipFrame(): boolean {
    if (!this.config.enableFrameSkipping) return false
    
    const stats = this.frameRateMonitor.getStats()
    return stats.fps < this.config.targetFPS * 0.7
  }
  
  /**
   * 統計をリセット
   */
  reset(): void {
    this.frameRateMonitor.reset()
  }
}

/**
 * ベジェ曲線最適化ユーティリティ
 */
export class BezierOptimizer {
  private static cache = new Map<string, number>()
  private static maxCacheSize = 1000
  
  /**
   * キャッシュ付きベジェ曲線計算
   */
  static cachedCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    // 精度を制限してキャッシュ効率を向上
    const precision = 100
    const key = `${Math.floor(t * precision)},${p0},${p1},${p2},${p3}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }
    
    const result = this.calculateCubicBezier(t, p0, p1, p2, p3)
    
    // キャッシュサイズ制限
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, result)
    return result
  }
  
  /**
   * 実際のベジェ曲線計算
   */
  private static calculateCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t
    const tt = t * t
    const uu = u * u
    const uuu = uu * u
    const ttt = tt * t
    
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3
  }
  
  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.cache.clear()
  }
}