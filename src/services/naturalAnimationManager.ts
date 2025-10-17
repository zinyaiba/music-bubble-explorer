/**
 * NaturalAnimationManager - 自然な消失パターンの管理
 * Requirements: 20.4, 20.5 - NaturalAnimationManagerによる自然な消失パターン
 */

import { BubbleEntity } from '@/types/bubble'
import type { AdvancedAnimationConfig } from './advancedAnimationController'

/**
 * 消失パターンの種類
 */
export type DisappearancePatternType = 'random' | 'wave' | 'spiral' | 'cascade' | 'organic' | 'cluster'

/**
 * 消失パターンインターフェース
 */
export interface DisappearancePattern {
  bubbleId: string
  type: DisappearancePatternType
  delay: number
  duration: number
  intensity: number
  affectedBubbles: string[]
  coordinates?: { x: number; y: number }
}

/**
 * アニメーション軌道の定義
 */
interface AnimationTrajectory {
  keyframes: Array<{
    offset: number
    transform: string
    opacity: number
    filter?: string
  }>
  options: KeyframeAnimationOptions
}

/**
 * 自然なアニメーション管理クラス
 * Requirements: 20.4, 20.5 - より自然な出現・消失パターンを提供する
 */
export class NaturalAnimationManager {
  private config: AdvancedAnimationConfig
  private patternHistory: DisappearancePattern[] = []
  private maxHistorySize = 50
  private clusterCenters: Array<{ x: number; y: number; radius: number }> = []

  constructor(config: AdvancedAnimationConfig) {
    this.config = config
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: AdvancedAnimationConfig): void {
    this.config = newConfig
  }

  /**
   * 複数のシャボン玉に対する消失パターンを生成
   * Requirements: 20.4 - より自然な出現・消失パターンを提供する
   */
  generateDisappearancePatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    const patterns: DisappearancePattern[] = []
    const patternType = this.config.staggerDisappearance.pattern as DisappearancePatternType

    switch (patternType) {
      case 'random':
        patterns.push(...this.createRandomPatterns(bubbles))
        break
      case 'wave':
        patterns.push(...this.createWavePatterns(bubbles))
        break
      case 'spiral':
        patterns.push(...this.createSpiralPatterns(bubbles))
        break
      case 'cascade':
        patterns.push(...this.createCascadePatterns(bubbles))
        break
      default:
        patterns.push(...this.createOrganicPatterns(bubbles))
        break
    }

    // パターン履歴を更新
    this.updatePatternHistory(patterns)

    return patterns
  }

  /**
   * 個別のシャボン玉に対する消失アニメーションを作成
   * Requirements: 20.5 - まばらな消失アニメーションの実装
   */
  createDisappearanceAnimation(bubble: BubbleEntity, patternType: DisappearancePatternType): Animation | null {
    const element = this.findBubbleElement(bubble.id)
    if (!element) return null

    const trajectory = this.generateAnimationTrajectory(bubble, patternType)
    
    try {
      const animation = element.animate(trajectory.keyframes, trajectory.options)
      
      // アニメーション完了時の処理
      animation.addEventListener('finish', () => {
        this.onAnimationComplete(bubble.id)
      })

      return animation
    } catch (error) {
      console.warn(`Failed to create animation for bubble ${bubble.id}:`, error)
      return null
    }
  }

  /**
   * ランダムパターンの生成
   * Requirements: 20.1 - ランダムな消失タイミング制御機能
   */
  private createRandomPatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    return bubbles.map(bubble => ({
      bubbleId: bubble.id,
      type: 'random',
      delay: this.calculateRandomDelay(),
      duration: 1000 + Math.random() * 1000, // 1-2秒
      intensity: 0.5 + Math.random() * 0.5,  // 0.5-1.0
      affectedBubbles: [bubble.id],
      coordinates: { x: bubble.x, y: bubble.y }
    }))
  }

  /**
   * 波状パターンの生成
   * Requirements: 20.2 - ランダム性を持った間隔を適用する
   */
  private createWavePatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    const patterns: DisappearancePattern[] = []
    const waveCenter = this.findWaveCenter(bubbles)
    
    bubbles.forEach((bubble) => {
      const distance = Math.sqrt(
        Math.pow(bubble.x - waveCenter.x, 2) + 
        Math.pow(bubble.y - waveCenter.y, 2)
      )
      
      // 距離に基づく遅延（波の伝播）
      const baseDelay = distance * 2 // 距離に比例した遅延
      const randomVariation = (Math.random() - 0.5) * 200 // ±100ms のランダム性
      
      patterns.push({
        bubbleId: bubble.id,
        type: 'wave',
        delay: Math.max(0, baseDelay + randomVariation),
        duration: 1200 + Math.random() * 600, // 1.2-1.8秒
        intensity: 0.7 + Math.random() * 0.3,
        affectedBubbles: [bubble.id],
        coordinates: { x: bubble.x, y: bubble.y }
      })
    })

    return patterns
  }

  /**
   * スパイラルパターンの生成
   * Requirements: 20.5 - まばらな消失アニメーションの実装
   */
  private createSpiralPatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    const patterns: DisappearancePattern[] = []
    const spiralCenter = this.findSpiralCenter(bubbles)
    
    bubbles.forEach((bubble) => {
      const dx = bubble.x - spiralCenter.x
      const dy = bubble.y - spiralCenter.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)
      
      // スパイラル順序に基づく遅延
      const spiralOrder = (angle + Math.PI) / (2 * Math.PI) + distance / 200
      const baseDelay = spiralOrder * 300 // 螺旋順序に基づく遅延
      const randomVariation = (Math.random() - 0.5) * 150
      
      patterns.push({
        bubbleId: bubble.id,
        type: 'spiral',
        delay: Math.max(0, baseDelay + randomVariation),
        duration: 1400 + Math.random() * 800, // 1.4-2.2秒
        intensity: 0.6 + Math.random() * 0.4,
        affectedBubbles: [bubble.id],
        coordinates: { x: bubble.x, y: bubble.y }
      })
    })

    return patterns
  }

  /**
   * カスケードパターンの生成
   * Requirements: 20.4 - より自然な出現・消失パターンを提供する
   */
  private createCascadePatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    const patterns: DisappearancePattern[] = []
    
    // Y座標でソートしてカスケード効果を作成
    const sortedBubbles = [...bubbles].sort((a, b) => a.y - b.y)
    
    sortedBubbles.forEach((bubble, index) => {
      const cascadeLevel = Math.floor(index / 3) // 3つずつグループ化
      const baseDelay = cascadeLevel * 200 // レベルごとに200ms遅延
      const groupRandomness = Math.random() * 100 // グループ内のランダム性
      
      patterns.push({
        bubbleId: bubble.id,
        type: 'cascade',
        delay: baseDelay + groupRandomness,
        duration: 1000 + Math.random() * 500, // 1.0-1.5秒
        intensity: 0.8 + Math.random() * 0.2,
        affectedBubbles: [bubble.id],
        coordinates: { x: bubble.x, y: bubble.y }
      })
    })

    return patterns
  }

  /**
   * オーガニック（有機的）パターンの生成
   * Requirements: 20.4, 20.5 - より自然で複雑な消失パターン
   */
  private createOrganicPatterns(bubbles: BubbleEntity[]): DisappearancePattern[] {
    const patterns: DisappearancePattern[] = []
    
    // クラスター中心を更新
    this.updateClusterCenters(bubbles)
    
    bubbles.forEach(bubble => {
      const nearestCluster = this.findNearestCluster(bubble)
      const clusterDistance = nearestCluster ? 
        Math.sqrt(
          Math.pow(bubble.x - nearestCluster.x, 2) + 
          Math.pow(bubble.y - nearestCluster.y, 2)
        ) : 100
      
      // クラスター内での有機的な遅延
      const organicDelay = this.calculateOrganicDelay(bubble, clusterDistance)
      
      patterns.push({
        bubbleId: bubble.id,
        type: 'organic',
        delay: organicDelay,
        duration: 1300 + Math.random() * 700, // 1.3-2.0秒
        intensity: 0.5 + Math.random() * 0.5,
        affectedBubbles: [bubble.id],
        coordinates: { x: bubble.x, y: bubble.y }
      })
    })

    return patterns
  }

  /**
   * アニメーション軌道を生成
   * Requirements: 20.5 - まばらな消失アニメーションの実装
   */
  private generateAnimationTrajectory(_bubble: BubbleEntity, patternType: DisappearancePatternType): AnimationTrajectory {
    const baseKeyframes = [
      { 
        offset: 0, 
        transform: 'scale(1) rotate(0deg)', 
        opacity: 1 
      }
    ]

    let finalKeyframes: any[]
    let duration = 1500

    switch (patternType) {
      case 'wave':
        finalKeyframes = [
          ...baseKeyframes,
          { 
            offset: 0.3, 
            transform: 'scale(1.1) rotate(5deg)', 
            opacity: 0.9,
            filter: 'blur(0px)'
          },
          { 
            offset: 0.7, 
            transform: 'scale(0.8) rotate(15deg)', 
            opacity: 0.5,
            filter: 'blur(1px)'
          },
          { 
            offset: 1, 
            transform: 'scale(0.2) rotate(30deg)', 
            opacity: 0,
            filter: 'blur(3px)'
          }
        ]
        duration = 1200
        break

      case 'spiral':
        finalKeyframes = [
          ...baseKeyframes,
          { 
            offset: 0.25, 
            transform: 'scale(1.05) rotate(90deg)', 
            opacity: 0.8 
          },
          { 
            offset: 0.5, 
            transform: 'scale(0.9) rotate(180deg)', 
            opacity: 0.6 
          },
          { 
            offset: 0.75, 
            transform: 'scale(0.6) rotate(270deg)', 
            opacity: 0.3 
          },
          { 
            offset: 1, 
            transform: 'scale(0.1) rotate(360deg)', 
            opacity: 0 
          }
        ]
        duration = 1800
        break

      case 'cascade':
        finalKeyframes = [
          ...baseKeyframes,
          { 
            offset: 0.4, 
            transform: 'scale(1.2) translateY(-10px)', 
            opacity: 0.9 
          },
          { 
            offset: 0.8, 
            transform: 'scale(0.7) translateY(20px)', 
            opacity: 0.4 
          },
          { 
            offset: 1, 
            transform: 'scale(0.1) translateY(50px)', 
            opacity: 0 
          }
        ]
        duration = 1000
        break

      case 'organic':
        // 有機的な動き：不規則な軌道
        const organicPath = this.generateOrganicPath()
        finalKeyframes = [
          ...baseKeyframes,
          { 
            offset: 0.2, 
            transform: `scale(1.1) translate(${organicPath[0].x}px, ${organicPath[0].y}px) rotate(${organicPath[0].rotation}deg)`, 
            opacity: 0.9 
          },
          { 
            offset: 0.5, 
            transform: `scale(0.9) translate(${organicPath[1].x}px, ${organicPath[1].y}px) rotate(${organicPath[1].rotation}deg)`, 
            opacity: 0.6 
          },
          { 
            offset: 0.8, 
            transform: `scale(0.5) translate(${organicPath[2].x}px, ${organicPath[2].y}px) rotate(${organicPath[2].rotation}deg)`, 
            opacity: 0.2 
          },
          { 
            offset: 1, 
            transform: `scale(0.1) translate(${organicPath[3].x}px, ${organicPath[3].y}px) rotate(${organicPath[3].rotation}deg)`, 
            opacity: 0 
          }
        ]
        duration = 1600
        break

      default: // random
        finalKeyframes = [
          ...baseKeyframes,
          { 
            offset: 0.5, 
            transform: 'scale(0.8) rotate(10deg)', 
            opacity: 0.6 
          },
          { 
            offset: 1, 
            transform: 'scale(0.1) rotate(25deg)', 
            opacity: 0 
          }
        ]
        duration = 1200
        break
    }

    return {
      keyframes: finalKeyframes,
      options: {
        duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // easeOutQuad
        fill: 'forwards'
      }
    }
  }

  /**
   * 有機的な軌道を生成
   */
  private generateOrganicPath(): Array<{ x: number; y: number; rotation: number }> {
    const path = []
    let x = 0, y = 0, rotation = 0

    for (let i = 0; i < 4; i++) {
      // パーリンノイズ風の不規則な動き
      x += (Math.random() - 0.5) * 20
      y += (Math.random() - 0.5) * 15 + i * 5 // 徐々に下に移動
      rotation += (Math.random() - 0.5) * 60

      path.push({ x, y, rotation })
    }

    return path
  }

  /**
   * 波の中心を見つける
   */
  private findWaveCenter(bubbles: BubbleEntity[]): { x: number; y: number } {
    if (bubbles.length === 0) return { x: 0, y: 0 }

    // 重心を計算
    const centerX = bubbles.reduce((sum, bubble) => sum + bubble.x, 0) / bubbles.length
    const centerY = bubbles.reduce((sum, bubble) => sum + bubble.y, 0) / bubbles.length

    return { x: centerX, y: centerY }
  }

  /**
   * スパイラルの中心を見つける
   */
  private findSpiralCenter(bubbles: BubbleEntity[]): { x: number; y: number } {
    // 最も多くのシャボン玉に囲まれた点を見つける
    let bestCenter = { x: 0, y: 0 }
    let maxNearbyCount = 0

    bubbles.forEach(candidate => {
      const nearbyCount = bubbles.filter(bubble => {
        const distance = Math.sqrt(
          Math.pow(bubble.x - candidate.x, 2) + 
          Math.pow(bubble.y - candidate.y, 2)
        )
        return distance < 100 // 100px以内
      }).length

      if (nearbyCount > maxNearbyCount) {
        maxNearbyCount = nearbyCount
        bestCenter = { x: candidate.x, y: candidate.y }
      }
    })

    return bestCenter
  }

  /**
   * クラスター中心を更新
   */
  private updateClusterCenters(bubbles: BubbleEntity[]): void {
    // K-means風のクラスタリング（簡易版）
    const k = Math.min(3, Math.ceil(bubbles.length / 8)) // 最大3クラスター
    this.clusterCenters = []

    if (bubbles.length === 0) return

    // 初期中心をランダムに選択
    for (let i = 0; i < k; i++) {
      const randomBubble = bubbles[Math.floor(Math.random() * bubbles.length)]
      this.clusterCenters.push({
        x: randomBubble.x,
        y: randomBubble.y,
        radius: 80 + Math.random() * 40 // 80-120px
      })
    }
  }

  /**
   * 最も近いクラスターを見つける
   */
  private findNearestCluster(bubble: BubbleEntity): { x: number; y: number; radius: number } | null {
    if (this.clusterCenters.length === 0) return null

    let nearestCluster = this.clusterCenters[0]
    let minDistance = Infinity

    this.clusterCenters.forEach(cluster => {
      const distance = Math.sqrt(
        Math.pow(bubble.x - cluster.x, 2) + 
        Math.pow(bubble.y - cluster.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestCluster = cluster
      }
    })

    return nearestCluster
  }

  /**
   * 有機的な遅延を計算
   */
  private calculateOrganicDelay(bubble: BubbleEntity, clusterDistance: number): number {
    // クラスター内での位置に基づく遅延
    const baseDelay = clusterDistance * 3 // 距離に比例
    
    // 有機的なランダム性（ガウス分布風）
    const organicRandomness = this.gaussianRandom() * 300
    
    // シャボン玉のサイズに基づく調整（大きいものは遅く消える）
    const sizeDelay = (bubble.size - 40) * 2
    
    return Math.max(0, baseDelay + organicRandomness + sizeDelay)
  }

  /**
   * ガウス分布風のランダム値を生成
   */
  private gaussianRandom(): number {
    // Box-Muller変換の簡易版
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  /**
   * ランダムな遅延時間を計算
   */
  private calculateRandomDelay(): number {
    const { min, max } = this.config.staggerDisappearance.delayRange
    return min + Math.random() * (max - min)
  }

  /**
   * シャボン玉のDOM要素を見つける
   */
  private findBubbleElement(bubbleId: string): Element | null {
    if (typeof document === 'undefined') return null
    return document.querySelector(`[data-bubble-id="${bubbleId}"]`)
  }

  /**
   * アニメーション完了時の処理
   */
  private onAnimationComplete(bubbleId: string): void {
    console.log(`Natural animation completed for bubble ${bubbleId}`)
  }

  /**
   * パターン履歴を更新
   */
  private updatePatternHistory(patterns: DisappearancePattern[]): void {
    this.patternHistory.push(...patterns)
    
    // 履歴サイズを制限
    if (this.patternHistory.length > this.maxHistorySize) {
      this.patternHistory = this.patternHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this.patternHistory = []
    this.clusterCenters = []
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    patternHistory: number
    clusterCount: number
    lastPatternTypes: string[]
  } {
    const recentPatterns = this.patternHistory.slice(-10)
    const patternTypes = recentPatterns.map(p => p.type)

    return {
      patternHistory: this.patternHistory.length,
      clusterCount: this.clusterCenters.length,
      lastPatternTypes: patternTypes
    }
  }
}