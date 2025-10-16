import type { Bubble as IBubble } from './music'

/**
 * シャボン玉クラス - シャボン玉の状態と動作を管理
 */
export class BubbleEntity implements IBubble {
  id: string
  type: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'
  name: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  lifespan: number
  relatedCount: number
  
  // 内部状態管理用
  private age: number = 0
  private maxLifespan: number
  private isAnimating: boolean = false
  
  // アニメーション関連
  private animationScale: number = 1
  private animationOpacity: number = 1
  private animationRotation: number = 0 // 新機能: 回転角度（度数法）
  private markedForDeletion: boolean = false

  constructor(config: Omit<IBubble, 'id'> & { id?: string }) {
    this.id = config.id || this.generateId()
    this.type = config.type
    this.name = config.name
    this.x = config.x
    this.y = config.y
    this.vx = config.vx
    this.vy = config.vy
    this.size = config.size
    this.color = config.color
    this.opacity = config.opacity
    this.lifespan = config.lifespan
    this.relatedCount = config.relatedCount
    this.maxLifespan = config.lifespan
    
    // 出現アニメーション用の初期設定
    this.animationScale = 0 // 初期スケールは0（出現アニメーション用）
    this.animationOpacity = 0 // 初期透明度は0（出現アニメーション用）
  }

  /**
   * ユニークIDを生成
   */
  private generateId(): string {
    return `bubble_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * シャボン玉の物理状態を更新
   */
  update(deltaTime: number): void {
    // 年齢を更新
    this.age += deltaTime
    
    // 位置を更新
    this.x += this.vx * deltaTime
    this.y += this.vy * deltaTime
    
    // ライフスパンに基づいて透明度を調整
    const lifeRatio = this.age / this.maxLifespan
    if (lifeRatio > 0.8) {
      // 寿命の80%を過ぎたら徐々にフェードアウト
      this.opacity = Math.max(0, 1 - (lifeRatio - 0.8) / 0.2)
    }
    
    // ライフスパンを減らす
    this.lifespan = Math.max(0, this.maxLifespan - this.age)
  }

  /**
   * シャボン玉が生きているかチェック
   */
  isAlive(): boolean {
    return this.lifespan > 0 && this.opacity > 0
  }

  /**
   * シャボン玉が画面内にあるかチェック
   */
  isInBounds(width: number, height: number): boolean {
    const margin = this.size
    return this.x > -margin && 
           this.x < width + margin && 
           this.y > -margin && 
           this.y < height + margin
  }

  /**
   * 点がシャボン玉内にあるかチェック（クリック判定用）
   */
  containsPoint(x: number, y: number): boolean {
    const dx = x - this.x
    const dy = y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    return distance <= this.size / 2
  }

  /**
   * シャボン玉の速度を設定
   */
  setVelocity(vx: number, vy: number): void {
    this.vx = vx
    this.vy = vy
  }

  /**
   * シャボン玉の位置を設定
   */
  setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  /**
   * アニメーション状態を設定
   */
  setAnimating(animating: boolean): void {
    this.isAnimating = animating
  }

  /**
   * アニメーション中かチェック
   */
  getIsAnimating(): boolean {
    return this.isAnimating
  }

  /**
   * アニメーション用のスケールを設定
   */
  setAnimationScale(scale: number): void {
    this.animationScale = scale
  }

  /**
   * アニメーション用のスケールを取得
   */
  getAnimationScale(): number {
    return this.animationScale
  }

  /**
   * アニメーション用の透明度を設定
   */
  setAnimationOpacity(opacity: number): void {
    this.animationOpacity = opacity
  }

  /**
   * アニメーション用の透明度を取得
   */
  getAnimationOpacity(): number {
    return this.animationOpacity
  }

  /**
   * 削除マークを設定
   */
  markForDeletion(): void {
    this.markedForDeletion = true
  }

  /**
   * 削除マークされているかチェック
   */
  isMarkedForDeletion(): boolean {
    return this.markedForDeletion
  }

  /**
   * 描画用のサイズを取得（アニメーションスケールを適用）
   */
  getDisplaySize(): number {
    return this.size * this.animationScale
  }

  /**
   * 描画用の透明度を取得（アニメーション透明度を適用）
   */
  getDisplayOpacity(): number {
    return Math.min(this.opacity, this.animationOpacity)
  }

  /**
   * アニメーション用の回転角度を設定（新機能）
   */
  setRotation(rotation: number): void {
    this.animationRotation = rotation
  }

  /**
   * 描画用の回転角度を取得（新機能）
   */
  getRotation(): number {
    return this.animationRotation
  }

  /**
   * シャボン玉の年齢を取得
   */
  getAge(): number {
    return this.age
  }

  /**
   * シャボン玉をクローン
   */
  clone(): BubbleEntity {
    const cloned = new BubbleEntity({
      type: this.type,
      name: this.name,
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      size: this.size,
      color: this.color,
      opacity: this.opacity,
      lifespan: this.lifespan,
      relatedCount: this.relatedCount
    })
    cloned.age = this.age
    cloned.maxLifespan = this.maxLifespan
    cloned.isAnimating = this.isAnimating
    cloned.animationScale = this.animationScale
    cloned.animationOpacity = this.animationOpacity
    cloned.animationRotation = this.animationRotation
    cloned.markedForDeletion = this.markedForDeletion
    return cloned
  }
}