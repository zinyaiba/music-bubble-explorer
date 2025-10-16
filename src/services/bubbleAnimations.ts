/**
 * シャボン玉のライフサイクルアニメーション管理
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5 - 改善されたアニメーションシステム
 */

export interface AnimationState {
  type: 'appear' | 'disappear' | 'click' | 'click-return' | 'idle' | 'floating'
  startTime: number
  duration: number
  initialScale: number
  targetScale: number
  initialOpacity: number
  targetOpacity: number
  // 新しいアニメーション用プロパティ
  bezierControlPoints?: { cp1x: number; cp1y: number; cp2x: number; cp2y: number }
  noiseOffset?: number
  rotationSpeed?: number
}

/**
 * 高性能パーリンノイズ生成クラス（改善版）
 * Requirements: 7.5 - パーリンノイズによる微細な揺れの追加
 */
class OptimizedPerlinNoise {
  private permutation: number[]
  private gradients: Array<{ x: number; y: number }>
  private cache = new Map<string, number>()
  private cacheSize = 0
  private maxCacheSize = 1000 // キャッシュサイズ制限
  
  constructor(seed: number = 0) {
    this.permutation = []
    this.gradients = []
    
    // より高品質な疑似ランダム生成
    const random = this.seededRandom(seed)
    
    // 順列テーブルの生成
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i
    }
    
    // Fisher-Yates シャッフル
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]]
    }
    
    // 勾配ベクトルの事前計算
    for (let i = 0; i < 256; i++) {
      const angle = (this.permutation[i] / 256) * Math.PI * 2
      this.gradients[i] = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
    }
  }
  
  /**
   * シード値に基づく疑似ランダム関数
   */
  private seededRandom(seed: number): () => number {
    let state = seed
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
  }
  
  /**
   * 最適化されたノイズ生成（キャッシュ付き）
   */
  noise(x: number, y: number = 0): number {
    // キャッシュキーの生成（精度を制限してキャッシュ効率を向上）
    const precision = 100
    const cacheKey = `${Math.floor(x * precision)},${Math.floor(y * precision)}`
    
    // キャッシュから取得
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    const result = this.calculateNoise(x, y)
    
    // キャッシュサイズ制限
    if (this.cacheSize >= this.maxCacheSize) {
      // 古いエントリを削除（LRU風）
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
        this.cacheSize--
      }
    }
    
    this.cache.set(cacheKey, result)
    this.cacheSize++
    
    return result
  }
  
  /**
   * 実際のノイズ計算
   */
  private calculateNoise(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    
    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    
    const u = this.fade(xf)
    const v = this.fade(yf)
    
    // 勾配ベクトルを使用した最適化された計算
    const grad00 = this.gradients[this.permutation[X] ^ Y]
    const grad10 = this.gradients[this.permutation[(X + 1) & 255] ^ Y]
    const grad01 = this.gradients[this.permutation[X] ^ ((Y + 1) & 255)]
    const grad11 = this.gradients[this.permutation[(X + 1) & 255] ^ ((Y + 1) & 255)]
    
    const dot00 = grad00.x * xf + grad00.y * yf
    const dot10 = grad10.x * (xf - 1) + grad10.y * yf
    const dot01 = grad01.x * xf + grad01.y * (yf - 1)
    const dot11 = grad11.x * (xf - 1) + grad11.y * (yf - 1)
    
    const lerp1 = this.lerp(u, dot00, dot10)
    const lerp2 = this.lerp(u, dot01, dot11)
    
    return this.lerp(v, lerp1, lerp2)
  }
  
  /**
   * オクターブノイズ（複数の周波数を重ね合わせ）
   * Requirements: 7.5 - より複雑で自然な揺れ
   */
  octaveNoise(x: number, y: number, octaves: number = 3, persistence: number = 0.5): number {
    let value = 0
    let amplitude = 1
    let frequency = 1
    let maxValue = 0
    
    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= persistence
      frequency *= 2
    }
    
    return value / maxValue
  }
  
  /**
   * 時間ベースのアニメーションノイズ
   * Requirements: 7.5 - 時間に基づく自然な変化
   */
  timeBasedNoise(x: number, y: number, time: number, speed: number = 1): number {
    return this.octaveNoise(x, y + time * speed, 3, 0.6)
  }
  
  private fade(t: number): number {
    // より滑らかなフェード関数（6t^5 - 15t^4 + 10t^3）
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }
  
  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheSize = 0
  }
  
  /**
   * キャッシュ統計を取得
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cacheSize,
      maxSize: this.maxCacheSize,
      hitRate: 0 // 実装を簡略化
    }
  }
}

/**
 * ベジェ曲線計算ユーティリティ（改善版）
 * Requirements: 7.4 - ベジェ曲線による自然な軌道
 */
export class BezierCurve {
  static cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
    const u = 1 - t
    const tt = t * t
    const uu = u * u
    const uuu = uu * u
    const ttt = tt * t
    
    return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3
  }
  
  static easeInOutCubic(t: number): number {
    return BezierCurve.cubicBezier(t, 0, 0.25, 0.75, 1)
  }
  
  static easeOutElastic(t: number): number {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
  }
  
  static naturalFloat(t: number): number {
    // 自然な浮遊感のためのカスタムベジェ曲線
    return BezierCurve.cubicBezier(t, 0, 0.42, 0.58, 1)
  }

  /**
   * 改善された自然な軌道計算（Requirements: 7.4）
   * 複数のベジェ曲線を組み合わせてより複雑で自然な動きを生成
   */
  static naturalTrajectory(t: number, amplitude: number = 1, frequency: number = 1): { x: number; y: number } {
    // 主軌道: 緩やかなS字カーブ
    const mainX = BezierCurve.cubicBezier(t, 0, 0.2, 0.8, 1) * amplitude
    const mainY = BezierCurve.cubicBezier(t, 0, 0.6, 0.4, 1) * amplitude * 0.7
    
    // 副軌道: 微細な波動
    const subX = Math.sin(t * Math.PI * 2 * frequency) * amplitude * 0.15
    const subY = Math.cos(t * Math.PI * 1.5 * frequency) * amplitude * 0.1
    
    // 三次軌道: パーリンノイズ風の不規則性
    const noiseX = Math.sin(t * Math.PI * 4.7) * Math.cos(t * Math.PI * 3.1) * amplitude * 0.08
    const noiseY = Math.cos(t * Math.PI * 5.3) * Math.sin(t * Math.PI * 2.7) * amplitude * 0.06
    
    return {
      x: mainX + subX + noiseX,
      y: mainY + subY + noiseY
    }
  }

  /**
   * 浮力に基づく自然な上昇軌道（Requirements: 7.4）
   */
  static buoyancyTrajectory(t: number, bubbleSize: number): { x: number; y: number } {
    // サイズに基づく浮力係数（小さいシャボン玉ほど軽やか）
    const buoyancyFactor = Math.max(0.3, 1 - (bubbleSize / 120))
    
    // 上昇軌道: 初期は急上昇、後半は緩やか
    const riseY = BezierCurve.cubicBezier(t, 0, 0.8, 0.3, 1) * buoyancyFactor
    
    // 横揺れ: サイズに反比例した揺れ
    const swayX = Math.sin(t * Math.PI * 3) * buoyancyFactor * 0.5
    
    return { x: swayX, y: -riseY } // Y軸は上向きが負
  }

  /**
   * 風の影響を受けた軌道（Requirements: 7.4）
   */
  static windInfluencedTrajectory(t: number, windStrength: number = 0.3): { x: number; y: number } {
    // 風の基本方向（右上向き）
    const windX = BezierCurve.cubicBezier(t, 0, 0.3, 0.7, 1) * windStrength
    const windY = BezierCurve.cubicBezier(t, 0, 0.1, 0.4, 0.6) * windStrength * 0.3
    
    // 風の乱流効果
    const turbulenceX = Math.sin(t * Math.PI * 6) * windStrength * 0.2
    const turbulenceY = Math.cos(t * Math.PI * 4.5) * windStrength * 0.15
    
    return {
      x: windX + turbulenceX,
      y: windY + turbulenceY
    }
  }
}

/**
 * イージング関数
 */
export const easing = {
  easeOut: (t: number): number => 1 - Math.pow(1 - t, 3),
  easeIn: (t: number): number => t * t * t,
  easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  elastic: (t: number): number => {
    if (t === 0 || t === 1) return t
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1
  }
}

/**
 * 改善されたアニメーション設定
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export const ANIMATION_CONFIG = {
  appear: {
    duration: 800, // 0.8秒 - より滑らかな出現アニメーション
    initialScale: 0,
    targetScale: 1,
    initialOpacity: 0,
    targetOpacity: 1,
    easing: BezierCurve.easeOutElastic // エラスティック効果
  },
  disappear: {
    duration: 1500, // 1.5秒 - ゆっくりとした消失アニメーション
    initialScale: 1,
    targetScale: 0.2, // 完全に0にせず、少し残す
    initialOpacity: 1,
    targetOpacity: 0,
    easing: BezierCurve.easeInOutCubic,
    rotationSpeed: 0.5 // 消失時の回転効果
  },
  click: {
    duration: 300, // 0.3秒 - より自然なクリック反応
    initialScale: 1,
    targetScale: 1.3, // 少し控えめな拡大
    initialOpacity: 1,
    targetOpacity: 0.9,
    easing: BezierCurve.easeOutElastic
  },
  floating: {
    duration: Infinity, // 継続的な浮遊アニメーション
    initialScale: 1,
    targetScale: 1,
    initialOpacity: 1,
    targetOpacity: 1,
    easing: BezierCurve.naturalFloat
  }
} as const

/**
 * ライフサイクル設定（Requirements: 7.1）
 */
export const LIFECYCLE_CONFIG = {
  minLifespan: 5000, // 5秒
  maxLifespan: 10000, // 10秒
  fadeStartRatio: 0.7, // ライフスパンの70%で消失開始
  spawnInterval: 200, // 200ms間隔で新しいシャボン玉生成チェック
  maxConcurrentBubbles: 30 // 同時表示最大数
}

/**
 * 改善されたシャボン玉アニメーション管理クラス
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export class BubbleAnimationManager {
  private animations = new Map<string, AnimationState>()
  private perlinNoise: OptimizedPerlinNoise
  private frameCount: number = 0
  private lastFrameTime: number = 0
  private readonly targetFPS: number = 60
  private frameInterval: number = 1000 / 60 // 16.67ms for 60FPS
  private performanceStats = {
    frameCount: 0,
    droppedFrames: 0,
    averageFrameTime: 0,
    lastFrameTime: 0
  }
  
  constructor() {
    this.perlinNoise = new OptimizedPerlinNoise(Date.now())
  }

  /**
   * 出現アニメーションを開始（改善版）
   * Requirements: 7.2, 7.3
   */
  startAppearAnimation(bubbleId: string): void {
    const config = ANIMATION_CONFIG.appear
    this.animations.set(bubbleId, {
      type: 'appear',
      startTime: performance.now(),
      duration: config.duration,
      initialScale: config.initialScale,
      targetScale: config.targetScale,
      initialOpacity: config.initialOpacity,
      targetOpacity: config.targetOpacity,
      noiseOffset: Math.random() * 1000, // パーリンノイズ用オフセット
      rotationSpeed: 0
    })
  }

  /**
   * 消失アニメーションを開始（改善版）
   * Requirements: 7.2, 7.3
   */
  startDisappearAnimation(bubbleId: string): void {
    const config = ANIMATION_CONFIG.disappear
    const currentAnimation = this.animations.get(bubbleId)
    
    // 現在のスケールと透明度を取得
    const currentScale = currentAnimation ? 
      this.getCurrentScale(bubbleId, performance.now()) : 1
    const currentOpacity = currentAnimation ? 
      this.getCurrentOpacity(bubbleId, performance.now()) : 1
    
    this.animations.set(bubbleId, {
      type: 'disappear',
      startTime: performance.now(),
      duration: config.duration,
      initialScale: currentScale,
      targetScale: config.targetScale,
      initialOpacity: currentOpacity,
      targetOpacity: config.targetOpacity,
      noiseOffset: currentAnimation?.noiseOffset || Math.random() * 1000,
      rotationSpeed: config.rotationSpeed || 0.5
    })
  }

  /**
   * クリック時拡大アニメーションを開始（改善版）
   * Requirements: 7.3, 7.4
   */
  startClickAnimation(bubbleId: string): void {
    const config = ANIMATION_CONFIG.click
    const currentAnimation = this.animations.get(bubbleId)
    
    // 既存のアニメーションがある場合は、現在の状態から開始
    const currentScale = currentAnimation ? 
      this.getCurrentScale(bubbleId, performance.now()) : 1
    const currentOpacity = currentAnimation ? 
      this.getCurrentOpacity(bubbleId, performance.now()) : 1
    
    this.animations.set(bubbleId, {
      type: 'click',
      startTime: performance.now(),
      duration: config.duration,
      initialScale: currentScale,
      targetScale: config.targetScale,
      initialOpacity: currentOpacity,
      targetOpacity: config.targetOpacity,
      noiseOffset: currentAnimation?.noiseOffset || Math.random() * 1000,
      rotationSpeed: 0
    })
  }

  /**
   * 浮遊アニメーションを開始（新機能）
   * Requirements: 7.4, 7.5 - 自然な浮遊効果
   */
  startFloatingAnimation(bubbleId: string): void {
    const config = ANIMATION_CONFIG.floating
    this.animations.set(bubbleId, {
      type: 'floating',
      startTime: performance.now(),
      duration: config.duration,
      initialScale: config.initialScale,
      targetScale: config.targetScale,
      initialOpacity: config.initialOpacity,
      targetOpacity: config.targetOpacity,
      noiseOffset: Math.random() * 1000,
      rotationSpeed: 0
    })
  }

  /**
   * アニメーションを停止してアイドル状態に戻す
   */
  stopAnimation(bubbleId: string): void {
    this.animations.delete(bubbleId)
  }

  /**
   * 指定されたシャボン玉のアニメーション状態を取得
   */
  getAnimationState(bubbleId: string): AnimationState | null {
    return this.animations.get(bubbleId) || null
  }

  /**
   * アニメーション進行度を計算（0-1）
   */
  getAnimationProgress(bubbleId: string, currentTime: number): number {
    const animation = this.animations.get(bubbleId)
    if (!animation) return 1

    const elapsed = currentTime - animation.startTime
    const progress = Math.min(elapsed / animation.duration, 1)
    
    return progress
  }

  /**
   * アニメーションが完了しているかチェック
   */
  isAnimationComplete(bubbleId: string, currentTime: number): boolean {
    const progress = this.getAnimationProgress(bubbleId, currentTime)
    return progress >= 1
  }

  /**
   * 現在のスケール値を計算（改善版）
   * Requirements: 7.4, 7.5 - パーリンノイズによる微細な変化
   */
  getCurrentScale(bubbleId: string, currentTime: number): number {
    const animation = this.animations.get(bubbleId)
    if (!animation) return 1

    const progress = this.getAnimationProgress(bubbleId, currentTime)
    const easedProgress = this.applyEasing(animation.type, progress)
    
    let baseScale = animation.initialScale + (animation.targetScale - animation.initialScale) * easedProgress
    
    // 浮遊アニメーション時にパーリンノイズによる微細な変化を追加
    if (animation.type === 'floating' || animation.type === 'appear') {
      const noiseTime = (currentTime * 0.001) + (animation.noiseOffset || 0)
      const noiseValue = this.perlinNoise.noise(noiseTime * 0.5, bubbleId.charCodeAt(0) * 0.1)
      const scaleVariation = noiseValue * 0.05 // 5%の変化
      baseScale *= (1 + scaleVariation)
    }
    
    return Math.max(0, baseScale)
  }

  /**
   * 現在の透明度を計算（改善版）
   * Requirements: 7.4, 7.5 - 呼吸するような透明度変化
   */
  getCurrentOpacity(bubbleId: string, currentTime: number, baseOpacity: number = 1): number {
    const animation = this.animations.get(bubbleId)
    if (!animation) return baseOpacity

    const progress = this.getAnimationProgress(bubbleId, currentTime)
    const easedProgress = this.applyEasing(animation.type, progress)
    
    let animatedOpacity = animation.initialOpacity + (animation.targetOpacity - animation.initialOpacity) * easedProgress
    
    // 浮遊アニメーション時に呼吸するような透明度変化を追加
    if (animation.type === 'floating' || animation.type === 'appear') {
      const noiseTime = (currentTime * 0.001) + (animation.noiseOffset || 0)
      const breathingEffect = Math.sin(noiseTime * 2) * 0.1 // 10%の変化
      animatedOpacity *= (1 + breathingEffect)
    }
    
    // ベース透明度と組み合わせる
    return Math.max(0, Math.min(baseOpacity, animatedOpacity))
  }

  /**
   * パーリンノイズによる位置オフセットを計算（改善版）
   * Requirements: 7.5 - 微細な揺れの追加
   */
  getNoiseOffset(bubbleId: string, currentTime: number): { x: number; y: number } {
    const animation = this.animations.get(bubbleId)
    if (!animation || animation.type === 'disappear') {
      return { x: 0, y: 0 }
    }

    const noiseTime = (currentTime * 0.001) + (animation.noiseOffset || 0)
    const bubbleHash = bubbleId.charCodeAt(0) * 0.1
    
    // オクターブノイズを使用してより自然な揺れを生成
    const noiseX = this.perlinNoise.octaveNoise(noiseTime * 0.2, bubbleHash, 3, 0.5)
    const noiseY = this.perlinNoise.octaveNoise(noiseTime * 0.15, bubbleHash + 100, 3, 0.6)
    
    // 時間ベースの変化を追加
    const timeNoiseX = this.perlinNoise.timeBasedNoise(bubbleHash, 0, noiseTime, 0.3)
    const timeNoiseY = this.perlinNoise.timeBasedNoise(bubbleHash + 50, 0, noiseTime, 0.25)
    
    // 複数のノイズレイヤーを組み合わせ
    const combinedX = (noiseX * 0.7 + timeNoiseX * 0.3) * 6 // 最大6ピクセル
    const combinedY = (noiseY * 0.7 + timeNoiseY * 0.3) * 4 // Y軸は少し控えめに
    
    // アニメーションタイプに応じて強度を調整
    let intensityMultiplier = 1
    switch (animation.type) {
      case 'appear':
        intensityMultiplier = 0.3 // 出現時は控えめ
        break
      case 'click':
        intensityMultiplier = 1.5 // クリック時は強調
        break
      case 'floating':
        intensityMultiplier = 1.0 // 通常の強度
        break
      default:
        intensityMultiplier = 0.8
    }
    
    return {
      x: combinedX * intensityMultiplier,
      y: combinedY * intensityMultiplier
    }
  }

  /**
   * 回転角度を計算（新機能）
   * Requirements: 7.3 - 消失時の回転効果
   */
  getCurrentRotation(bubbleId: string, currentTime: number): number {
    const animation = this.animations.get(bubbleId)
    if (!animation || !animation.rotationSpeed) return 0

    const progress = this.getAnimationProgress(bubbleId, currentTime)
    return progress * 360 * animation.rotationSpeed // 度数法
  }

  /**
   * アニメーションタイプに応じたイージングを適用（改善版）
   * Requirements: 7.4 - ベジェ曲線による自然な軌道
   */
  private applyEasing(animationType: AnimationState['type'], progress: number): number {
    switch (animationType) {
      case 'appear':
        return ANIMATION_CONFIG.appear.easing(progress)
      case 'disappear':
        return ANIMATION_CONFIG.disappear.easing(progress)
      case 'click':
        return ANIMATION_CONFIG.click.easing(progress)
      case 'click-return':
        return BezierCurve.easeInOutCubic(progress)
      case 'floating':
        return ANIMATION_CONFIG.floating.easing(progress)
      default:
        return BezierCurve.naturalFloat(progress)
    }
  }

  /**
   * フレーム更新（60FPS最適化）
   * Requirements: 7.4 - 60FPSスムーズアニメーション
   */
  updateFrame(currentTime: number): void {
    // 高精度フレームレート制御
    const deltaTime = currentTime - this.lastFrameTime
    
    // フレームレート制御 - 60FPS維持
    if (deltaTime < this.frameInterval) {
      return
    }
    
    // パフォーマンス統計の更新
    this.updatePerformanceStats(currentTime, deltaTime)
    
    this.frameCount++
    this.lastFrameTime = currentTime
    
    // GPU加速のためのrequestAnimationFrame最適化
    // ブラウザの垂直同期に合わせてフレーム更新
    if (typeof window !== 'undefined') {
      // 次のフレームでの更新をスケジュール
      this.scheduleNextFrame()
    }
    
    // アニメーション状態の更新（バッチ処理で最適化）
    this.batchUpdateAnimations(currentTime)
  }

  /**
   * パフォーマンス統計の更新
   */
  private updatePerformanceStats(_currentTime: number, deltaTime: number): void {
    this.performanceStats.frameCount++
    this.performanceStats.lastFrameTime = deltaTime
    
    // 移動平均でフレーム時間を計算
    const alpha = 0.1 // 平滑化係数
    this.performanceStats.averageFrameTime = 
      this.performanceStats.averageFrameTime * (1 - alpha) + deltaTime * alpha
    
    // フレームドロップの検出（targetFPSの1.5倍以上の遅延）
    const targetFrameTime = 1000 / this.targetFPS
    if (deltaTime > targetFrameTime * 1.5) {
      this.performanceStats.droppedFrames++
    }
  }

  /**
   * 次のフレームをスケジュール（GPU加速最適化）
   */
  private scheduleNextFrame(): void {
    // GPU加速のためのtransform3dヒント
    if (typeof document !== 'undefined') {
      const style = document.documentElement.style
      if (!style.transform) {
        style.transform = 'translateZ(0)' // GPU加速を有効化
      }
    }
  }

  /**
   * アニメーションのバッチ更新（パフォーマンス最適化）
   */
  private batchUpdateAnimations(currentTime: number): void {
    const animationsToComplete: Array<[string, AnimationState]> = []
    
    // 一度のループですべてのアニメーションを処理
    for (const [bubbleId, animation] of this.animations.entries()) {
      if (animation.type === 'floating') {
        // 浮遊アニメーションは継続的に更新
        continue
      }
      
      // 完了したアニメーションを収集
      if (this.isAnimationComplete(bubbleId, currentTime)) {
        animationsToComplete.push([bubbleId, animation])
      }
    }
    
    // バッチで完了処理を実行
    animationsToComplete.forEach(([bubbleId, animation]) => {
      this.handleAnimationCompletion(bubbleId, animation)
    })
  }

  /**
   * アニメーション完了時の処理
   */
  private handleAnimationCompletion(bubbleId: string, animation: AnimationState): void {
    switch (animation.type) {
      case 'appear':
        // 出現完了後は浮遊アニメーションに移行
        this.startFloatingAnimation(bubbleId)
        break
      case 'click':
        // クリック完了後は縮小アニメーション
        this.startClickReturnAnimation(bubbleId)
        break
      case 'click-return':
        // 縮小完了後は浮遊アニメーションに戻る
        this.startFloatingAnimation(bubbleId)
        break
      case 'disappear':
        // 消失完了 - 削除対象
        this.animations.delete(bubbleId)
        break
    }
  }

  /**
   * 完了したアニメーションをクリーンアップ（改善版）
   * Requirements: 7.1, 7.2, 7.3
   */
  cleanupCompletedAnimations(currentTime: number): string[] {
    const completedAnimations: string[] = []
    
    for (const [bubbleId, animation] of this.animations.entries()) {
      if (this.isAnimationComplete(bubbleId, currentTime)) {
        // 消失アニメーションが完了した場合は、そのシャボン玉を削除対象とする
        if (animation.type === 'disappear') {
          completedAnimations.push(bubbleId)
          this.animations.delete(bubbleId)
        }
        
        // その他のアニメーション完了処理は handleAnimationCompletion で処理
        else {
          this.handleAnimationCompletion(bubbleId, animation)
        }
      }
    }
    
    return completedAnimations
  }

  /**
   * ライフサイクル管理（新機能）
   * Requirements: 7.1 - 5-10秒のライフサイクル管理
   */
  shouldStartDisappearAnimation(bubbleAge: number, bubbleLifespan: number): boolean {
    const totalLifespan = bubbleLifespan
    const ageRatio = bubbleAge / totalLifespan
    
    // ライフスパンの70%を過ぎたら消失アニメーション開始
    return ageRatio >= LIFECYCLE_CONFIG.fadeStartRatio
  }

  /**
   * パフォーマンス統計を取得
   * Requirements: 7.5 - パフォーマンス最適化
   */
  getPerformanceStats(): {
    activeAnimations: number
    frameCount: number
    averageFPS: number
    droppedFrames: number
    frameDropRate: number
    averageFrameTime: number
    isOptimal: boolean
  } {
    const averageFPS = this.performanceStats.averageFrameTime > 0 
      ? 1000 / this.performanceStats.averageFrameTime 
      : 0
    
    const frameDropRate = this.performanceStats.frameCount > 0 
      ? (this.performanceStats.droppedFrames / this.performanceStats.frameCount) * 100 
      : 0
    
    return {
      activeAnimations: this.animations.size,
      frameCount: this.performanceStats.frameCount,
      averageFPS: Math.min(60, averageFPS),
      droppedFrames: this.performanceStats.droppedFrames,
      frameDropRate: frameDropRate,
      averageFrameTime: this.performanceStats.averageFrameTime,
      isOptimal: averageFPS >= 55 && frameDropRate < 5 // 55FPS以上かつフレームドロップ5%未満で最適
    }
  }

  /**
   * パフォーマンス統計をリセット
   */
  resetPerformanceStats(): void {
    this.performanceStats = {
      frameCount: 0,
      droppedFrames: 0,
      averageFrameTime: 0,
      lastFrameTime: 0
    }
  }

  /**
   * クリック後の縮小アニメーションを開始（改善版）
   */
  private startClickReturnAnimation(bubbleId: string): void {
    const currentAnimation = this.animations.get(bubbleId)
    const currentScale = this.getCurrentScale(bubbleId, performance.now())
    const currentOpacity = this.getCurrentOpacity(bubbleId, performance.now())
    
    this.animations.set(bubbleId, {
      type: 'click-return',
      startTime: performance.now(),
      duration: 300, // 0.3秒で元のサイズに戻る
      initialScale: currentScale,
      targetScale: 1,
      initialOpacity: currentOpacity,
      targetOpacity: 1,
      noiseOffset: currentAnimation?.noiseOffset || Math.random() * 1000,
      rotationSpeed: 0
    })
  }

  /**
   * すべてのアニメーションをクリア
   */
  clearAllAnimations(): void {
    this.animations.clear()
  }

  /**
   * アクティブなアニメーション数を取得
   */
  getActiveAnimationCount(): number {
    return this.animations.size
  }

  /**
   * デバッグ用：アニメーション状態を取得
   */
  getDebugInfo(): Array<{ bubbleId: string; animation: AnimationState; progress: number }> {
    const currentTime = performance.now()
    return Array.from(this.animations.entries()).map(([bubbleId, animation]) => ({
      bubbleId,
      animation,
      progress: this.getAnimationProgress(bubbleId, currentTime)
    }))
  }
}