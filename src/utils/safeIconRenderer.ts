/**
 * Safe Icon Renderer
 * 
 * Enhanced icon renderer with comprehensive error handling and fallback functionality.
 * Wraps the original IconRenderer with safety mechanisms.
 * 
 * Requirements: 1.1 - アイコン描画失敗時のフォールバック
 */

import { IconRenderer } from './iconRenderer';
import { IconType } from '../types/enhancedBubble';
import { errorHandler } from './errorHandler';


/**
 * Safe Icon Renderer Class
 * 
 * Provides error-safe icon rendering with automatic fallbacks
 */
export class SafeIconRenderer extends IconRenderer {

  private fallbackAttempts: Map<string, number> = new Map();

  constructor() {
    super();

  }

  /**
   * Safe icon rendering with error handling
   */
  renderIcon(
    ctx: CanvasRenderingContext2D,
    iconType: IconType,
    x: number,
    y: number,
    size: number,
    color: string = 'rgba(255, 255, 255, 0.9)'
  ): void {
    const operationKey = `icon-${iconType}-${x}-${y}-${size}`;

    try {
      // Validate canvas context
      if (!this.validateCanvasContext(ctx)) {
        throw new Error('Invalid canvas context');
      }

      // Validate parameters
      this.validateRenderParameters(x, y, size);

      // Attempt to render icon
      super.renderIcon(ctx, iconType, x, y, size, color);
      
      // Reset fallback attempts on success
      this.fallbackAttempts.delete(operationKey);

    } catch (error) {
      const success = errorHandler.handleIconRenderingError(error as Error, {
        iconType,
        x,
        y,
        size,
        ctx
      });

      if (!success) {
        // If fallback also failed, try alternative approach
        this.renderUltimateFallback(ctx, x, y, size, color);
      }

      // Track fallback attempts
      const attempts = this.fallbackAttempts.get(operationKey) || 0;
      this.fallbackAttempts.set(operationKey, attempts + 1);
    }
  }

  /**
   * Safe music note rendering
   */
  renderMusicNote(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderMusicNote(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.MUSIC_NOTE,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe pen rendering
   */
  renderPen(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderPen(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.PEN,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe music sheet rendering
   */
  renderMusicSheet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderMusicSheet(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.MUSIC_SHEET,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe mixer rendering
   */
  renderMixer(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderMixer(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.MIXER,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe hashtag rendering
   */
  renderHashtag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderHashtag(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.HASHTAG,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe multi-role rendering
   */
  renderMultiRole(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    try {
      this.validateRenderParameters(x, y, size);
      super.renderMultiRole(ctx, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.MULTI_ROLE,
        x, y, size, ctx
      });
    }
  }

  /**
   * Safe composite icon rendering
   */
  renderCompositeIcon(
    ctx: CanvasRenderingContext2D,
    roles: string[],
    x: number,
    y: number,
    size: number
  ): void {
    try {
      this.validateRenderParameters(x, y, size);
      
      if (!roles || roles.length === 0) {
        throw new Error('Invalid roles array');
      }

      super.renderCompositeIcon(ctx, roles, x, y, size);
    } catch (error) {
      errorHandler.handleIconRenderingError(error as Error, {
        iconType: IconType.MULTI_ROLE,
        x, y, size, ctx
      });
    }
  }

  /**
   * Validate canvas context
   */
  private validateCanvasContext(ctx: CanvasRenderingContext2D): boolean {
    if (!ctx) {
      return false;
    }

    try {
      // Test basic canvas operations
      ctx.save();
      ctx.restore();
      return true;
    } catch (error) {
      console.error('Canvas context validation failed', { error });
      return false;
    }
  }

  /**
   * Validate render parameters
   */
  private validateRenderParameters(x: number, y: number, size: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Invalid coordinates: x=${x}, y=${y}`);
    }

    if (!Number.isFinite(size) || size <= 0) {
      throw new Error(`Invalid size: ${size}`);
    }

    if (size > 1000) {
      throw new Error(`Size too large: ${size}`);
    }
  }

  /**
   * Ultimate fallback rendering - simplest possible icon
   */
  private renderUltimateFallback(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ): void {
    try {
      ctx.save();
      
      // Draw simple filled circle
      ctx.beginPath();
      ctx.arc(x, y, Math.max(size / 6, 2), 0, Math.PI * 2);
      ctx.fillStyle = color || '#888888';
      ctx.fill();
      
      // Draw simple border
      ctx.strokeStyle = color || '#666666';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.restore();

      console.log('Ultimate fallback icon rendered', { x, y, size });
    } catch (error) {
      console.error('Ultimate fallback rendering failed', { error, x, y, size });
    }
  }

  /**
   * Clear cache safely
   */
  clearCache(): void {
    try {
      super.clearCache();
      this.fallbackAttempts.clear();
    } catch (error) {
      console.warn('Cache clearing failed', { error });
    }
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats(): {
    totalFallbacks: number;
    fallbacksByOperation: Record<string, number>;
  } {
    const fallbacksByOperation: Record<string, number> = {};
    let totalFallbacks = 0;

    for (const [operation, count] of this.fallbackAttempts.entries()) {
      fallbacksByOperation[operation] = count;
      totalFallbacks += count;
    }

    return {
      totalFallbacks,
      fallbacksByOperation
    };
  }

  /**
   * Reset fallback statistics
   */
  resetFallbackStats(): void {
    this.fallbackAttempts.clear();
  }
}

// Export singleton instance
export const safeIconRenderer = new SafeIconRenderer();