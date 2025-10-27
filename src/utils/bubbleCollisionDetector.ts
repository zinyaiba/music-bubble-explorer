/**
 * シャボン玉の衝突検出と位置調整ユーティリティ
 * 軽量な実装でパフォーマンスを重視
 */

import { BubbleEntity } from '@/types/bubble'

export interface CollisionDetectorOptions {
  /** 最小間隔（ピクセル） */
  minDistance?: number
  /** 最大調整試行回数 */
  maxAttempts?: number
  /** パフォーマンスモード（簡易計算） */
  performanceMode?: boolean
}

export class BubbleCollisionDetector {
  private options: Required<CollisionDetectorOptions>

  constructor(options: CollisionDetectorOptions = {}) {
    this.options = {
      minDistance: options.minDistance ?? 5,
      maxAttempts: options.maxAttempts ?? 10,
      performanceMode: options.performanceMode ?? false,
    }
  }

  /**
   * 2つのシャボン玉が重なっているかチェック
   */
  private isOverlapping(bubble1: BubbleEntity, bubble2: BubbleEntity): boolean {
    const dx = bubble1.x - bubble2.x
    const dy = bubble1.y - bubble2.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // getDisplaySizeメソッドが存在するかチェックし、なければsizeプロパティを使用
    const radius1 =
      (typeof bubble1.getDisplaySize === 'function'
        ? bubble1.getDisplaySize()
        : bubble1.size) / 2
    const radius2 =
      (typeof bubble2.getDisplaySize === 'function'
        ? bubble2.getDisplaySize()
        : bubble2.size) / 2
    const minDistance = radius1 + radius2 + this.options.minDistance

    return distance < minDistance
  }

  /**
   * シャボン玉の位置を調整して重なりを解消
   */
  private adjustPosition(
    bubble: BubbleEntity,
    otherBubbles: BubbleEntity[],
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    let newX = bubble.x
    let newY = bubble.y
    const radius =
      (typeof bubble.getDisplaySize === 'function'
        ? bubble.getDisplaySize()
        : bubble.size) / 2

    for (let attempt = 0; attempt < this.options.maxAttempts; attempt++) {
      let hasCollision = false

      for (const other of otherBubbles) {
        if (other.id === bubble.id) continue

        // 一時的なバブルオブジェクトを作成（メソッドも含む）
        const tempBubble = bubble.clone()
        tempBubble.setPosition(newX, newY)
        if (this.isOverlapping(tempBubble, other)) {
          hasCollision = true

          // 簡単な位置調整：重なっている方向と逆に移動
          const dx = newX - other.x
          const dy = newY - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0) {
            const otherRadius =
              (typeof other.getDisplaySize === 'function'
                ? other.getDisplaySize()
                : other.size) / 2
            const targetDistance =
              radius + otherRadius + this.options.minDistance
            const moveDistance = targetDistance - distance + 5 // 少し余裕を持たせる

            const moveX = (dx / distance) * moveDistance
            const moveY = (dy / distance) * moveDistance

            newX += moveX
            newY += moveY
          } else {
            // 完全に重なっている場合はランダムに移動
            const angle = Math.random() * Math.PI * 2
            const moveDistance = radius + this.options.minDistance + 10
            newX += Math.cos(angle) * moveDistance
            newY += Math.sin(angle) * moveDistance
          }

          // キャンバス境界内に収める
          newX = Math.max(radius, Math.min(canvasWidth - radius, newX))
          newY = Math.max(radius, Math.min(canvasHeight - radius, newY))
        }
      }

      if (!hasCollision) {
        break
      }
    }

    return { x: newX, y: newY }
  }

  /**
   * 全てのシャボン玉の位置を調整して重なりを解消
   * パフォーマンス重視の軽量実装
   */
  adjustBubblePositions(
    bubbles: BubbleEntity[],
    canvasWidth: number,
    canvasHeight: number
  ): BubbleEntity[] {
    if (bubbles.length === 0) return bubbles

    const adjustedBubbles = [...bubbles]

    // パフォーマンスモードでは処理をさらに最適化
    if (this.options.performanceMode) {
      // バッチ処理：一度に複数のシャボン玉をチェック
      const batchSize = Math.min(10, Math.ceil(bubbles.length / 5))

      for (let i = 0; i < adjustedBubbles.length; i += batchSize) {
        const batch = adjustedBubbles.slice(i, i + batchSize)

        batch.forEach((bubble, batchIndex) => {
          const globalIndex = i + batchIndex
          const otherBubbles = adjustedBubbles.slice(0, globalIndex)

          const newPosition = this.adjustPosition(
            bubble,
            otherBubbles,
            canvasWidth,
            canvasHeight
          )

          // 位置を更新（BubbleEntityのクローンを作成）
          if (newPosition.x !== bubble.x || newPosition.y !== bubble.y) {
            const clonedBubble = bubble.clone()
            clonedBubble.setPosition(newPosition.x, newPosition.y)
            adjustedBubbles[globalIndex] = clonedBubble
          }
        })
      }
    } else {
      // 通常モード：全てのシャボン玉を順次調整
      for (let i = 0; i < adjustedBubbles.length; i++) {
        const bubble = adjustedBubbles[i]
        const otherBubbles = adjustedBubbles.slice(0, i)

        const newPosition = this.adjustPosition(
          bubble,
          otherBubbles,
          canvasWidth,
          canvasHeight
        )

        if (newPosition.x !== bubble.x || newPosition.y !== bubble.y) {
          const clonedBubble = bubble.clone()
          clonedBubble.setPosition(newPosition.x, newPosition.y)
          adjustedBubbles[i] = clonedBubble
        }
      }
    }

    return adjustedBubbles
  }

  /**
   * 新しいシャボン玉の配置位置を計算（重なりを避ける）
   */
  findNonOverlappingPosition(
    newBubble: BubbleEntity,
    existingBubbles: BubbleEntity[],
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; y: number } {
    const radius =
      (typeof newBubble.getDisplaySize === 'function'
        ? newBubble.getDisplaySize()
        : newBubble.size) / 2
    let bestPosition = { x: newBubble.x, y: newBubble.y }
    let minOverlaps = Infinity

    // グリッドベースの配置を試行（軽量）
    const gridSize = Math.max(50, radius * 2)
    const cols = Math.floor(canvasWidth / gridSize)
    const rows = Math.floor(canvasHeight / gridSize)

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * gridSize + gridSize / 2
        const y = row * gridSize + gridSize / 2

        // キャンバス境界チェック
        if (
          x - radius < 0 ||
          x + radius > canvasWidth ||
          y - radius < 0 ||
          y + radius > canvasHeight
        ) {
          continue
        }

        // 重なりの数をカウント（BubbleEntityのクローンを使用）
        const tempBubble = newBubble.clone()
        tempBubble.setPosition(x, y)
        let overlapCount = 0

        for (const existing of existingBubbles) {
          if (this.isOverlapping(tempBubble, existing)) {
            overlapCount++
          }
        }

        // より良い位置が見つかった場合
        if (overlapCount < minOverlaps) {
          minOverlaps = overlapCount
          bestPosition = { x, y }

          // 重なりがない位置が見つかったら終了
          if (overlapCount === 0) {
            return bestPosition
          }
        }
      }
    }

    return bestPosition
  }
}

// デフォルトインスタンス
export const defaultCollisionDetector = new BubbleCollisionDetector({
  minDistance: 5,
  maxAttempts: 8,
  performanceMode: true, // デフォルトでパフォーマンス重視
})

// モバイル向け軽量インスタンス
export const mobileCollisionDetector = new BubbleCollisionDetector({
  minDistance: 2, // より小さい間隔で許可（タッチ操作に適した密度）
  maxAttempts: 4, // 試行回数を減らしてレスポンス向上
  performanceMode: true,
})
