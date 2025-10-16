import { BubbleEntity } from '@/types/bubble'
import type { MusicDatabase, Song, Person } from '@/types/music'
import { BubbleAnimationManager } from './bubbleAnimations'
import { ObjectPool, vector2DPool, calculationCachePool, type Vector2D, type CalculationCache } from '@/utils/ObjectPool'
import { clamp } from '@/utils/PerformanceOptimizer'
import { TagManager } from './tagManager'
import { AnimationOptimizer, BezierOptimizer } from '@/utils/animationOptimizer'
import { BubbleTextRenderer } from '@/utils/textRenderer'

/**
 * シャボン玉の色パレット（ラブリー＆キュートカラー）
 */
const LOVELY_COLORS = [
  '#FF69B4', // ホットピンク
  '#FF1493', // ディープピンク
  '#FFB6C1', // ライトピンク
  '#DDA0DD', // プラム
  '#FF7F50', // コーラル
  '#87CEEB', // スカイブルー
  '#98FB98', // ペールグリーン
  '#FFF8DC', // コーンシルク
  '#FFCCCB', // ライトピンク2
  '#E6E6FA', // ラベンダー
  '#F0E68C', // カーキ
  '#FFE4E1', // ミスティローズ
  '#FFEFD5', // パパイヤホイップ
  '#F5DEB3', // ウィート
  '#FFE4B5'  // モカシン
]

/**
 * タグ専用の色パレット（緑系パステルカラー）
 * Requirements: 6.2 - タグ専用の色やスタイルで区別できるようにする
 */
const TAG_COLORS = [
  '#98FB98', // ペールグリーン
  '#90EE90', // ライトグリーン
  '#AFEEEE', // ペールターコイズ
  '#B0E0E6', // パウダーブルー
  '#E0FFFF', // ライトシアン
  '#F0FFF0', // ハニーデュー
  '#ADFF2F', // グリーンイエロー
  '#7FFFD4', // アクアマリン
  '#40E0D0', // ターコイズ
  '#00CED1', // ダークターコイズ
  '#87CEEB', // スカイブルー
  '#B6E5D8', // ミントグリーン
  '#C7FFED', // ライトミント
  '#A8E6CF', // ソフトグリーン
  '#88D8C0'  // ティールグリーン
]

/**
 * シャボン玉生成設定
 */
interface BubbleConfig {
  canvasWidth: number
  canvasHeight: number
  maxBubbles: number
  minLifespan: number
  maxLifespan: number
  minVelocity: number
  maxVelocity: number
}

/**
 * シャボン玉マネージャー - シャボン玉の生成、更新、削除を管理
 */
export class BubbleManager {
  private bubbles: BubbleEntity[] = []
  private musicDatabase: MusicDatabase
  private config: BubbleConfig
  private lastUpdateTime: number = 0
  private animationManager: BubbleAnimationManager
  private tagManager: TagManager
  private animationOptimizer: AnimationOptimizer
  
  // パフォーマンス最適化: オブジェクトプール
  private bubblePool: ObjectPool<BubbleEntity>
  private velocityCache = new Map<string, Vector2D>()
  private physicsCache = new Map<string, CalculationCache>()

  constructor(musicDatabase: MusicDatabase, config: BubbleConfig) {
    this.musicDatabase = musicDatabase
    this.config = config
    this.animationManager = new BubbleAnimationManager()
    this.tagManager = new TagManager(musicDatabase)
    this.animationOptimizer = new AnimationOptimizer({
      targetFPS: 60,
      maxBubbleCount: config.maxBubbles,
      qualityLevel: 'high'
    })
    
    // オブジェクトプールの初期化
    this.bubblePool = new ObjectPool<BubbleEntity>(
      () => new BubbleEntity({
        type: 'song',
        name: '',
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 40,
        color: '#FFB6C1',
        opacity: 1,
        lifespan: 10000,
        relatedCount: 0
      }),
      (bubble) => {
        // バブルをリセット
        bubble.x = 0
        bubble.y = 0
        bubble.vx = 0
        bubble.vy = 0
        bubble.opacity = 1
        bubble.setAnimationScale(1)
        bubble.setAnimationOpacity(1)
      },
      config.maxBubbles,
      config.maxBubbles * 2
    )
  }

  /**
   * 新しいシャボン玉を生成（オブジェクトプール最適化版）
   */
  generateBubble(): BubbleEntity {
    // データベースが空の場合は例外を投げる
    if (!this.musicDatabase.songs || this.musicDatabase.songs.length === 0) {
      throw new Error('Cannot generate bubble: No songs available in database')
    }

    // オブジェクトプールから取得
    const bubble = this.bubblePool.acquire()
    
    // ランダムにエンティティタイプを選択（タグを含む）
    const entityTypes = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const
    const selectedType = entityTypes[Math.floor(Math.random() * entityTypes.length)]
    
    let name: string
    let relatedCount: number

    if (selectedType === 'song') {
      // ランダムに楽曲を選択
      const song = this.getRandomSong()
      if (!song) {
        throw new Error('Cannot generate bubble: No songs available')
      }
      name = song.title
      relatedCount = song.lyricists.length + song.composers.length + song.arrangers.length
    } else if (selectedType === 'tag') {
      // ランダムにタグを選択（重み付きランダム選択を使用）
      const tag = this.tagManager.getWeightedRandomTag()
      if (!tag) {
        // タグがない場合は楽曲にフォールバック
        const song = this.getRandomSong()
        if (!song) {
          throw new Error('Cannot generate bubble: No songs or tags available')
        }
        name = song.title
        relatedCount = song.lyricists.length + song.composers.length + song.arrangers.length
      } else {
        name = tag.name
        relatedCount = tag.songs.length
      }
    } else {
      // ランダムに人物を選択
      const person = this.getRandomPerson(selectedType)
      if (!person) {
        throw new Error(`Cannot generate bubble: No ${selectedType} available`)
      }
      name = person.name
      relatedCount = person.songs.length
    }

    // シャボン玉のサイズを計算（タグの場合は専用の計算を使用）
    const size = selectedType === 'tag' 
      ? this.tagManager.calculateTagBubbleSize(name)
      : this.calculateBubbleSize(relatedCount)
    
    // より自然な初期位置と速度を設定
    const margin = size / 2
    const x = margin + Math.random() * (this.config.canvasWidth - size)
    const y = margin + Math.random() * (this.config.canvasHeight - size)
    
    // 初期速度は小さめに設定（浮遊感を重視）
    const initialSpeed = this.config.maxVelocity * 0.3
    const angle = Math.random() * Math.PI * 2
    const vx = Math.cos(angle) * initialSpeed * (Math.random() * 0.5 + 0.5)
    const vy = Math.sin(angle) * initialSpeed * (Math.random() * 0.5 + 0.5) - 5 // 少し上向きに
    
    // タイプに応じた色を選択
    const color = selectedType === 'tag' 
      ? TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
      : LOVELY_COLORS[Math.floor(Math.random() * LOVELY_COLORS.length)]
    
    // ライフスパンを設定
    const lifespan = this.config.minLifespan + 
      Math.random() * (this.config.maxLifespan - this.config.minLifespan)

    // バブルのプロパティを設定
    bubble.type = selectedType
    bubble.name = name
    bubble.x = x
    bubble.y = y
    bubble.vx = vx
    bubble.vy = vy
    bubble.size = size
    bubble.color = color
    bubble.opacity = 1
    bubble.lifespan = lifespan
    bubble.relatedCount = relatedCount

    return bubble
  }

  /**
   * シャボン玉のサイズを関連データ数に基づいて計算
   */
  calculateBubbleSize(relatedCount: number): number {
    const minSize = 40
    const maxSize = 120
    const normalizedCount = Math.min(relatedCount / 20, 1) // 20件で最大サイズ
    return minSize + (maxSize - minSize) * normalizedCount
  }

  /**
   * すべてのシャボン玉の物理状態を更新（改善版）
   * Requirements: 7.1, 7.4, 7.5 - 改善されたアニメーションシステム
   */
  updateBubblePhysics(bubbles: BubbleEntity[]): BubbleEntity[] {
    const currentTime = performance.now()
    const deltaTime = this.lastUpdateTime ? (currentTime - this.lastUpdateTime) / 1000 : 0
    this.lastUpdateTime = currentTime

    // パフォーマンス最適化: deltaTimeが異常に大きい場合は制限（60FPS対応）
    const clampedDeltaTime = Math.min(deltaTime, 0.0167) // 60fps相当を上限

    // アニメーションフレーム更新（60FPS最適化）
    this.animationManager.updateFrame(currentTime)

    // アニメーション状態を更新
    this.updateAnimations(bubbles, currentTime)

    // パフォーマンス最適化: 配列の事前フィルタリング
    const aliveBubbles = bubbles.filter(bubble => 
      bubble.isAlive() && 
      !bubble.isMarkedForDeletion()
    )

    return aliveBubbles.map(bubble => {
      const updatedBubble = bubble.clone()
      
      // 基本的な物理更新
      updatedBubble.update(clampedDeltaTime)
      
      // 改善されたライフサイクル管理（Requirements: 7.1）
      const shouldDisappear = this.animationManager.shouldStartDisappearAnimation(
        updatedBubble.getAge(), 
        updatedBubble.lifespan + updatedBubble.getAge()
      )
      const currentAnimation = this.animationManager.getAnimationState(updatedBubble.id)
      
      if (shouldDisappear && (!currentAnimation || currentAnimation.type !== 'disappear')) {
        this.animationManager.startDisappearAnimation(updatedBubble.id)
      }
      
      // 改善された浮遊物理（パーリンノイズ、ベジェ曲線）
      this.applyImprovedFloatingPhysics(updatedBubble, clampedDeltaTime, currentTime)
      
      // 画面端での反射
      this.handleBoundaryCollision(updatedBubble)
      
      return updatedBubble
    }).filter(bubble => 
      bubble.isInBounds(this.config.canvasWidth, this.config.canvasHeight)
    )
  }

  /**
   * 改善されたシャボン玉の浮遊物理（Requirements: 7.4, 7.5）
   */
  private applyImprovedFloatingPhysics(bubble: BubbleEntity, deltaTime: number, currentTime: number): void {
    // キャッシュから物理計算結果を取得または作成
    let cache = this.physicsCache.get(bubble.id)
    if (!cache) {
      cache = calculationCachePool.acquire()
      cache.timestamp = currentTime
      this.physicsCache.set(bubble.id, cache)
    }
    
    // パフォーマンス最適化: 計算の事前キャッシュ
    const sizeRatio = 60 / bubble.size
    const timeOffset = bubble.id.charCodeAt(0) * 0.1
    const timeInSeconds = currentTime * 0.001 + timeOffset
    
    // パーリンノイズによる位置オフセット（Requirements: 7.5）
    const noiseOffset = this.animationManager.getNoiseOffset(bubble.id, currentTime)
    
    // 改善された浮力計算（サイズと密度を考慮）
    const buoyancyBase = 15 * sizeRatio * deltaTime
    const densityFactor = 0.8 + (bubble.size / 200) // 大きいシャボン玉ほど重い
    const buoyancy = buoyancyBase / densityFactor
    bubble.vy -= buoyancy
    
    // 改善された空気抵抗（レイノルズ数を模擬）
    const airResistance = 0.988 - (bubble.size / 1000) // サイズに応じた抵抗
    bubble.vx *= airResistance
    bubble.vy *= airResistance
    
    // 改善されたベジェ曲線による自然な軌道（Requirements: 7.4）
    const lifeProgress = bubble.getAge() / (bubble.getAge() + bubble.lifespan)
    const trajectoryAmplitude = 8 * sizeRatio * (1 - lifeProgress * 0.3) // 年齢とともに動きが穏やかに
    
    // 複数のベジェ曲線軌道を組み合わせ
    const naturalTrajectory = this.calculateNaturalTrajectory(timeInSeconds, trajectoryAmplitude, bubble.size)
    const buoyancyTrajectory = this.calculateBuoyancyTrajectory(timeInSeconds, bubble.size)
    const windTrajectory = this.calculateWindTrajectory(timeInSeconds, sizeRatio)
    
    // 軌道を合成
    bubble.vx += (naturalTrajectory.x + buoyancyTrajectory.x + windTrajectory.x) * deltaTime
    bubble.vy += (naturalTrajectory.y + buoyancyTrajectory.y + windTrajectory.y) * deltaTime
    
    // パーリンノイズによる微細な揺れを位置に直接適用（改善版）
    const noiseIntensity = 12 * sizeRatio // サイズに応じた揺れの強度
    bubble.x += noiseOffset.x * deltaTime * noiseIntensity
    bubble.y += noiseOffset.y * deltaTime * noiseIntensity
    
    // 改善された透明度変化（呼吸効果 + ライフサイクル）
    const currentAnimation = this.animationManager.getAnimationState(bubble.id)
    if (!currentAnimation || currentAnimation.type === 'floating') {
      const breathingFrequency = 0.8 + (bubble.size / 300)
      const breathingAmplitude = 0.06 + (sizeRatio * 0.02)
      const totalLifespan = bubble.getAge() + bubble.lifespan
      const ageRatio = bubble.getAge() / totalLifespan
      
      // ライフサイクルに基づく基本透明度
      const baseOpacity = Math.max(0.7, 1 - ageRatio * 0.3)
      
      // 呼吸効果
      const breathingEffect = Math.sin(timeInSeconds * breathingFrequency) * breathingAmplitude
      
      bubble.opacity = baseOpacity + breathingEffect
      bubble.opacity = clamp(bubble.opacity, 0.3, 1)
    }
    
    // 改善された風の効果（確率的ではなく連続的）
    const windInfluence = Math.sin(timeInSeconds * 0.1) * 0.3 + 0.7 // 0.4-1.0の範囲
    const windStrength = 8 * sizeRatio * windInfluence
    bubble.vx += Math.sin(timeInSeconds * 0.15) * windStrength * deltaTime
    bubble.vy += Math.cos(timeInSeconds * 0.12) * windStrength * 0.3 * deltaTime
    
    // 改善された速度制限（物理的により正確）
    const terminalVelocity = 30 + (bubble.size / 4) // 終端速度
    const currentSpeedSquared = bubble.vx * bubble.vx + bubble.vy * bubble.vy
    const terminalSpeedSquared = terminalVelocity * terminalVelocity
    
    if (currentSpeedSquared > terminalSpeedSquared) {
      const scale = terminalVelocity / Math.sqrt(currentSpeedSquared)
      bubble.vx *= scale
      bubble.vy *= scale
    }
    
    // キャッシュを更新
    cache.speed = Math.sqrt(currentSpeedSquared)
    cache.timestamp = currentTime
  }

  /**
   * 自然な軌道計算（改善版ベジェ曲線）
   * Requirements: 7.4 - ベジェ曲線による自然な軌道
   */
  private calculateNaturalTrajectory(time: number, amplitude: number, bubbleSize: number): { x: number; y: number } {
    const frequency = 0.4 + (bubbleSize / 400) // サイズに応じた周波数
    const t = (time * frequency) % 1
    
    // 複数のベジェ曲線を組み合わせた複雑な軌道
    const primaryX = this.calculateBezierMovement(t, amplitude)
    const primaryY = this.calculateBezierMovement(t + 0.33, amplitude * 0.6)
    
    // 二次軌道（より細かい動き）
    const secondaryX = this.calculateBezierMovement(t * 2.3, amplitude * 0.3)
    const secondaryY = this.calculateBezierMovement(t * 1.7 + 0.5, amplitude * 0.2)
    
    return {
      x: primaryX + secondaryX,
      y: primaryY + secondaryY
    }
  }

  /**
   * 浮力に基づく軌道計算
   * Requirements: 7.4 - 物理的に正確な浮力効果
   */
  private calculateBuoyancyTrajectory(time: number, bubbleSize: number): { x: number; y: number } {
    const buoyancyFactor = Math.max(0.2, 1 - (bubbleSize / 150))
    const t = (time * 0.2) % 1
    
    // 上昇軌道: 初期は急上昇、後半は緩やか
    const riseY = this.calculateBezierMovement(t, -buoyancyFactor * 10)
    
    // 横揺れ: 浮力による不安定性
    const swayX = Math.sin(time * 0.8) * buoyancyFactor * 3
    
    return { x: swayX, y: riseY }
  }

  /**
   * 風の影響による軌道計算
   * Requirements: 7.4 - 環境要因を考慮した動き
   */
  private calculateWindTrajectory(time: number, sizeRatio: number): { x: number; y: number } {
    const windStrength = 5 * sizeRatio
    
    // 風の基本方向（時間とともに変化）
    const windDirection = Math.sin(time * 0.05) * Math.PI * 0.3 // ±54度の範囲
    const windX = Math.cos(windDirection) * windStrength
    const windY = Math.sin(windDirection) * windStrength * 0.3
    
    // 乱流効果
    const turbulenceX = Math.sin(time * 1.2) * windStrength * 0.4
    const turbulenceY = Math.cos(time * 0.9) * windStrength * 0.2
    
    return {
      x: windX + turbulenceX,
      y: windY + turbulenceY
    }
  }

  /**
   * ベジェ曲線による自然な動きを計算（改善版 - Requirements: 7.4）
   */
  private calculateBezierMovement(t: number, amplitude: number): number {
    // キャッシュ付きベジェ曲線計算でパフォーマンス向上
    const p0 = 0
    const p1 = amplitude * 0.3
    const p2 = amplitude * 0.7
    const p3 = 0
    
    return BezierOptimizer.cachedCubicBezier(t, p0, p1, p2, p3)
  }



  /**
   * 画面端での衝突処理（シャボン玉らしい柔らかい反射）
   */
  private handleBoundaryCollision(bubble: BubbleEntity): void {
    const radius = bubble.size / 2
    const dampening = 0.6 // シャボン玉らしい柔らかい反射
    
    // 左右の壁
    if (bubble.x - radius <= 0) {
      bubble.vx = Math.abs(bubble.vx) * dampening // 右向きに反射
      bubble.x = radius
    } else if (bubble.x + radius >= this.config.canvasWidth) {
      bubble.vx = -Math.abs(bubble.vx) * dampening // 左向きに反射
      bubble.x = this.config.canvasWidth - radius
    }
    
    // 上下の壁
    if (bubble.y - radius <= 0) {
      bubble.vy = Math.abs(bubble.vy) * dampening // 下向きに反射
      bubble.y = radius
    } else if (bubble.y + radius >= this.config.canvasHeight) {
      bubble.vy = -Math.abs(bubble.vy) * dampening // 上向きに反射
      bubble.y = this.config.canvasHeight - radius
    }
  }

  /**
   * 指定されたIDのシャボン玉を削除（オブジェクトプール最適化版）
   */
  removeBubble(id: string): void {
    const bubbleIndex = this.bubbles.findIndex(bubble => bubble.id === id)
    if (bubbleIndex > -1) {
      const bubble = this.bubbles[bubbleIndex]
      
      // オブジェクトプールに返却
      this.bubblePool.release(bubble)
      
      // キャッシュをクリーンアップ
      const velocityCache = this.velocityCache.get(id)
      if (velocityCache) {
        vector2DPool.release(velocityCache)
        this.velocityCache.delete(id)
      }
      
      const physicsCache = this.physicsCache.get(id)
      if (physicsCache) {
        calculationCachePool.release(physicsCache)
        this.physicsCache.delete(id)
      }
      
      // 配列から削除
      this.bubbles.splice(bubbleIndex, 1)
    }
  }

  /**
   * 現在のシャボン玉一覧を取得
   */
  getBubbles(): BubbleEntity[] {
    return [...this.bubbles]
  }

  /**
   * シャボン玉を追加
   */
  addBubble(bubble: BubbleEntity): void {
    if (this.bubbles.length < this.config.maxBubbles) {
      this.bubbles.push(bubble)
      // 出現アニメーションを開始
      this.animationManager.startAppearAnimation(bubble.id)
    }
  }

  /**
   * 必要に応じて新しいシャボン玉を生成
   */
  maintainBubbleCount(): void {
    while (this.bubbles.length < this.config.maxBubbles) {
      try {
        const newBubble = this.generateBubble()
        this.addBubble(newBubble)
      } catch (error) {
        // データベースが空の場合はシャボン玉生成を停止
        console.log('Cannot generate more bubbles: Database is empty')
        break
      }
    }
  }

  /**
   * すべてのシャボン玉をクリア（オブジェクトプール最適化版）
   */
  clearAllBubbles(): void {
    // すべてのバブルをプールに返却
    this.bubbles.forEach(bubble => {
      this.bubblePool.release(bubble)
    })
    
    // キャッシュをクリーンアップ
    this.velocityCache.forEach(cache => vector2DPool.release(cache))
    this.physicsCache.forEach(cache => calculationCachePool.release(cache))
    
    this.bubbles = []
    this.velocityCache.clear()
    this.physicsCache.clear()
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<BubbleConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * ランダムな楽曲を取得
   */
  private getRandomSong(): Song | null {
    const songs = this.musicDatabase.songs
    if (!songs || songs.length === 0) {
      return null
    }
    return songs[Math.floor(Math.random() * songs.length)]
  }

  /**
   * 指定されたタイプのランダムな人物を取得
   */
  private getRandomPerson(type: 'lyricist' | 'composer' | 'arranger'): Person | null {
    const people = this.musicDatabase.people.filter(person => person.type === type)
    if (people.length === 0) {
      // フォールバック: タイプに関係なく人物を選択
      const allPeople = this.musicDatabase.people
      if (!allPeople || allPeople.length === 0) {
        return null
      }
      return allPeople[Math.floor(Math.random() * allPeople.length)]
    }
    return people[Math.floor(Math.random() * people.length)]
  }



  /**
   * アニメーション状態を更新（改善版）
   * Requirements: 7.3, 7.4, 7.5 - 改善されたアニメーション効果
   */
  private updateAnimations(bubbles: BubbleEntity[], currentTime: number): void {
    bubbles.forEach(bubble => {
      // アニメーションスケールと透明度を更新
      const scale = this.animationManager.getCurrentScale(bubble.id, currentTime)
      const opacity = this.animationManager.getCurrentOpacity(bubble.id, currentTime, bubble.opacity)
      
      bubble.setAnimationScale(scale)
      bubble.setAnimationOpacity(opacity)
      
      // パーリンノイズによる位置調整は applyImprovedFloatingPhysics で処理
      
      // 新機能: 回転効果（消失時のみ）（Requirements: 7.3）
      const rotation = this.animationManager.getCurrentRotation(bubble.id, currentTime)
      if (rotation !== 0) {
        // 回転情報をバブルに設定（描画時に使用）
        bubble.setRotation(rotation)
      }
    })

    // 完了したアニメーションをクリーンアップ
    const completedDisappearAnimations = this.animationManager.cleanupCompletedAnimations(currentTime)
    
    // 消失アニメーションが完了したシャボン玉を削除マーク
    completedDisappearAnimations.forEach(bubbleId => {
      const bubble = bubbles.find(b => b.id === bubbleId)
      if (bubble) {
        bubble.markForDeletion()
      }
    })
  }

  /**
   * シャボン玉のクリックアニメーションを開始
   */
  triggerClickAnimation(bubbleId: string): void {
    this.animationManager.startClickAnimation(bubbleId)
  }

  /**
   * 座標からシャボン玉を検索
   */
  findBubbleAtPosition(x: number, y: number): BubbleEntity | null {
    // 後ろから検索（上に描画されたものを優先）
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      if (this.bubbles[i].containsPoint(x, y)) {
        return this.bubbles[i]
      }
    }
    return null
  }

  /**
   * アニメーションフレーム用の統合更新メソッド（改善版）
   * 物理更新、ライフサイクル管理、新規生成を一括で行う
   * Requirements: 7.4, 7.5 - 60FPS最適化とパフォーマンス監視
   */
  updateFrame(): BubbleEntity[] {
    // パフォーマンス監視開始
    this.animationOptimizer.startFrame()
    
    // フレームスキップチェック（低FPS時の最適化）
    if (this.animationOptimizer.shouldSkipFrame()) {
      return [...this.bubbles] // 現在の状態を返してフレームをスキップ
    }
    
    // 動的な最大シャボン玉数の調整
    const optimizerConfig = this.animationOptimizer.getConfig()
    if (optimizerConfig.maxBubbleCount !== this.config.maxBubbles) {
      this.config.maxBubbles = optimizerConfig.maxBubbleCount
    }
    
    // 物理状態を更新
    this.bubbles = this.updateBubblePhysics(this.bubbles)
    
    // 必要に応じて新しいシャボン玉を生成
    this.maintainBubbleCount()
    
    return [...this.bubbles]
  }

  /**
   * 音楽データベースを更新（新しい楽曲が追加された時に呼び出される）
   */
  updateMusicDatabase(newMusicDatabase: MusicDatabase): void {
    this.musicDatabase = newMusicDatabase
    
    // TagManagerも更新
    this.tagManager.updateMusicDatabase(newMusicDatabase)
    
    // 既存のシャボン玉をクリア（新しいデータで再生成するため）
    this.bubbles.forEach(bubble => {
      this.animationManager.stopAnimation(bubble.id)
    })
    this.bubbles = []
    
    // 物理計算キャッシュをクリア
    this.physicsCache.clear()
    
    console.log('Music database updated:', {
      songs: newMusicDatabase.songs.length,
      people: newMusicDatabase.people.length,
      tags: newMusicDatabase.tags?.length || 0
    })
  }

  /**
   * シャボン玉の統計情報を取得
   */
  getStats() {
    const tagStats = this.tagManager.getTagStats()
    return {
      totalBubbles: this.bubbles.length,
      songBubbles: this.bubbles.filter(b => b.type === 'song').length,
      lyricistBubbles: this.bubbles.filter(b => b.type === 'lyricist').length,
      composerBubbles: this.bubbles.filter(b => b.type === 'composer').length,
      arrangerBubbles: this.bubbles.filter(b => b.type === 'arranger').length,
      tagBubbles: this.bubbles.filter(b => b.type === 'tag').length,
      averageSize: this.bubbles.reduce((sum, b) => sum + b.size, 0) / this.bubbles.length || 0,
      averageLifespan: this.bubbles.reduce((sum, b) => sum + b.lifespan, 0) / this.bubbles.length || 0,
      tagStats: tagStats
    }
  }

  /**
   * TagManagerインスタンスを取得
   */
  getTagManager(): TagManager {
    return this.tagManager
  }

  /**
   * シャボン玉の表示テキストをフォーマット
   * Requirements: 6.3 - タグ名の先頭に#を付けてハッシュタグとして表示する
   */
  formatBubbleText(bubble: BubbleEntity): string {
    if (bubble.type === 'tag') {
      // タグの場合は#プレフィックスを追加
      return `#${bubble.name}`
    }
    // その他のタイプはそのまま表示
    return bubble.name
  }

  /**
   * 動的フォントサイズを計算（改善版）
   * Requirements: 10.5 - 文言が必ず見えるように適切なフォントサイズと色コントラストを確保する
   */
  calculateOptimalFontSize(text: string, bubbleSize: number): number {
    // 新しいテキストレンダリングシステムを使用
    return BubbleTextRenderer.calculateOptimalFontSize(text, bubbleSize, {
      minFontSize: 8,
      maxFontSize: 18
    })
  }

  /**
   * アニメーションパフォーマンス統計を取得（改善版）
   * Requirements: 7.4, 7.5 - パフォーマンス監視
   */
  getAnimationPerformanceStats() {
    const animationStats = this.animationManager.getPerformanceStats()
    const bubbleStats = this.getStats()
    const optimizerStats = this.animationOptimizer.getStats()
    const optimizerConfig = this.animationOptimizer.getConfig()
    
    return {
      ...animationStats,
      ...bubbleStats,
      ...optimizerStats,
      targetFPS: optimizerConfig.targetFPS,
      qualityLevel: optimizerConfig.qualityLevel,
      gpuAcceleration: optimizerConfig.enableGPUAcceleration,
      frameSkipping: optimizerConfig.enableFrameSkipping,
      isOptimal: optimizerStats.isOptimal && animationStats.isOptimal
    }
  }

  /**
   * パフォーマンス統計をリセット
   */
  resetPerformanceStats(): void {
    this.animationManager.resetPerformanceStats()
    this.animationOptimizer.reset()
  }

  /**
   * シャボン玉マネージャーの状態を完全にリセット
   * デバッグ用途で使用
   */
  reset(): void {
    // 全てのシャボン玉を削除
    this.bubbles.forEach(bubble => {
      this.animationManager.stopAnimation(bubble.id)
    })
    this.bubbles = []

    // アニメーション関連をリセット
    this.animationManager.resetPerformanceStats()
    this.animationOptimizer.reset()

    // オブジェクトプールをクリア
    vector2DPool.clear()
    calculationCachePool.clear()

    // タグマネージャーをリセット
    if (this.tagManager) {
      // タグマネージャーにリセットメソッドがあれば呼び出し
      // this.tagManager.reset()
    }

    console.log('BubbleManager reset completed')
  }
}

/**
 * 改善されたシャボン玉設定（Requirements: 7.1, 7.4, 7.5）
 */
export const DEFAULT_BUBBLE_CONFIG: BubbleConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  maxBubbles: 25, // 60FPS維持のため最適化
  minLifespan: 5000, // 5秒（Requirements: 7.1 - 5-10秒のライフサイクル）
  maxLifespan: 10000, // 10秒（Requirements: 7.1 - 5-10秒のライフサイクル）
  minVelocity: 8, // より自然な動き（Requirements: 7.4）
  maxVelocity: 35 // GPU加速を考慮した最適化（Requirements: 7.3）
}

export type { BubbleConfig }