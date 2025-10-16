/**
 * Selective Renderer System
 * 選択的レンダリングの実装 - 変更された要素のみを再描画
 */

import { EnhancedBubble } from '../types/enhancedBubble';

export interface RenderRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BubbleRenderState {
  bubble: EnhancedBubble;
  lastPosition: { x: number; y: number };
  lastSize: number;
  lastVisualHash: string;
  isDirty: boolean;
  region: RenderRegion;
}

export class SelectiveRenderer {
  private renderStates = new Map<string, BubbleRenderState>();
  private dirtyRegions: RenderRegion[] = [];
  private canvasWidth = 0;
  private canvasHeight = 0;


  /**
   * キャンバスサイズの設定
   */
  setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * バブルの状態を追跡
   */
  trackBubble(bubble: EnhancedBubble): void {
    const visualHash = this.generateVisualHash(bubble);
    const existingState = this.renderStates.get(bubble.id);

    if (!existingState) {
      // 新しいバブル
      const region = this.calculateBubbleRegion(bubble);
      this.renderStates.set(bubble.id, {
        bubble,
        lastPosition: { x: bubble.x, y: bubble.y },
        lastSize: bubble.size,
        lastVisualHash: visualHash,
        isDirty: true,
        region
      });
      this.addDirtyRegion(region);
    } else {
      // 既存バブルの変更チェック
      const hasPositionChanged = 
        existingState.lastPosition.x !== bubble.x || 
        existingState.lastPosition.y !== bubble.y;
      const hasSizeChanged = existingState.lastSize !== bubble.size;
      const hasVisualChanged = existingState.lastVisualHash !== visualHash;

      if (hasPositionChanged || hasSizeChanged || hasVisualChanged) {
        // 古い領域をダーティに追加
        this.addDirtyRegion(existingState.region);

        // 新しい領域を計算
        const newRegion = this.calculateBubbleRegion(bubble);
        this.addDirtyRegion(newRegion);

        // 状態更新
        existingState.bubble = bubble;
        existingState.lastPosition = { x: bubble.x, y: bubble.y };
        existingState.lastSize = bubble.size;
        existingState.lastVisualHash = visualHash;
        existingState.isDirty = true;
        existingState.region = newRegion;
      }
    }
  }

  /**
   * バブルの追跡を停止
   */
  untrackBubble(bubbleId: string): void {
    const state = this.renderStates.get(bubbleId);
    if (state) {
      this.addDirtyRegion(state.region);
      this.renderStates.delete(bubbleId);
    }
  }

  /**
   * ダーティ領域の取得
   */
  getDirtyRegions(): RenderRegion[] {
    return [...this.dirtyRegions];
  }

  /**
   * 選択的レンダリングが必要かチェック
   */
  needsRerender(): boolean {
    return this.dirtyRegions.length > 0 || 
           Array.from(this.renderStates.values()).some(state => state.isDirty);
  }

  /**
   * レンダリング完了の通知
   */
  markRenderComplete(): void {
    this.dirtyRegions = [];
    for (const state of this.renderStates.values()) {
      state.isDirty = false;
    }
  }

  /**
   * 最適化されたクリア領域の計算
   */
  getOptimizedClearRegions(): RenderRegion[] {
    if (this.dirtyRegions.length === 0) {
      return [];
    }

    // 重複する領域をマージ
    const mergedRegions = this.mergeDirtyRegions();
    
    // 全画面クリアが効率的かチェック
    const totalDirtyArea = mergedRegions.reduce(
      (sum, region) => sum + (region.width * region.height), 0
    );
    const totalCanvasArea = this.canvasWidth * this.canvasHeight;

    // ダーティ領域が全体の50%を超える場合は全画面クリア
    if (totalDirtyArea > totalCanvasArea * 0.5) {
      return [{
        x: 0,
        y: 0,
        width: this.canvasWidth,
        height: this.canvasHeight
      }];
    }

    return mergedRegions;
  }

  /**
   * レンダリング統計の取得
   */
  getRenderStats() {
    const totalBubbles = this.renderStates.size;
    const dirtyBubbles = Array.from(this.renderStates.values())
      .filter(state => state.isDirty).length;
    const dirtyRegionCount = this.dirtyRegions.length;

    return {
      totalBubbles,
      dirtyBubbles,
      dirtyRegionCount,
      renderEfficiency: totalBubbles > 0 ? 
        (totalBubbles - dirtyBubbles) / totalBubbles : 1
    };
  }

  /**
   * キャッシュのクリア
   */
  clearCache(): void {
    this.renderStates.clear();
    this.dirtyRegions = [];
  }

  private generateVisualHash(bubble: EnhancedBubble): string {
    return `${bubble.visualType}_${bubble.iconType}_${bubble.shapeType}_${bubble.isMultiRole}_${JSON.stringify(bubble.roles || [])}`;
  }

  private calculateBubbleRegion(bubble: EnhancedBubble): RenderRegion {
    const padding = 10; // 影やエフェクトのための余白
    const size = bubble.size + padding * 2;
    
    return {
      x: Math.max(0, bubble.x - size / 2),
      y: Math.max(0, bubble.y - size / 2),
      width: Math.min(size, this.canvasWidth - (bubble.x - size / 2)),
      height: Math.min(size, this.canvasHeight - (bubble.y - size / 2))
    };
  }

  private addDirtyRegion(region: RenderRegion): void {
    this.dirtyRegions.push(region);
  }

  private mergeDirtyRegions(): RenderRegion[] {
    if (this.dirtyRegions.length <= 1) {
      return [...this.dirtyRegions];
    }

    const merged: RenderRegion[] = [];
    const sorted = [...this.dirtyRegions].sort((a, b) => a.x - b.x);

    for (const region of sorted) {
      const lastMerged = merged[merged.length - 1];
      
      if (lastMerged && this.regionsOverlap(lastMerged, region)) {
        // 重複する領域をマージ
        const minX = Math.min(lastMerged.x, region.x);
        const minY = Math.min(lastMerged.y, region.y);
        const maxX = Math.max(
          lastMerged.x + lastMerged.width, 
          region.x + region.width
        );
        const maxY = Math.max(
          lastMerged.y + lastMerged.height, 
          region.y + region.height
        );

        lastMerged.x = minX;
        lastMerged.y = minY;
        lastMerged.width = maxX - minX;
        lastMerged.height = maxY - minY;
      } else {
        merged.push({ ...region });
      }
    }

    return merged;
  }

  private regionsOverlap(a: RenderRegion, b: RenderRegion): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
}

// シングルトンインスタンス
export const selectiveRenderer = new SelectiveRenderer();