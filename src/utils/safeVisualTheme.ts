/**
 * Safe Visual Theme Manager
 * 
 * Enhanced visual theme manager with comprehensive error handling and fallback functionality.
 * Provides safe color application and gradient creation with automatic fallbacks.
 * 
 * Requirements: 1.1 - 色彩適用エラーの処理
 */

import { VisualThemeManager, defaultVisualTheme } from './visualTheme';
import { VisualTheme, BubbleStyle } from '../types/enhancedBubble';
import { errorHandler } from './errorHandler';
import { DebugLogger } from './debugLogger';

const debugLogger = DebugLogger.getInstance();

/**
 * Safe Visual Theme Manager Class
 * 
 * Provides error-safe visual theme operations with automatic fallbacks
 */
export class SafeVisualThemeManager extends VisualThemeManager {

  private colorValidationCache: Map<string, boolean> = new Map();
  private gradientCache: Map<string, CanvasGradient> = new Map();

  constructor(theme: VisualTheme = defaultVisualTheme) {
    super(theme);

  }

  /**
   * Safe style retrieval with error handling
   */
  getStyleForType(type: keyof VisualTheme): BubbleStyle {
    try {
      const style = super.getStyleForType(type);
      return this.validateAndSanitizeStyle(style);
    } catch (error) {
      debugLogger.warn('Style retrieval failed, using fallback', { type, error });
      return this.getFallbackStyle();
    }
  }

  /**
   * Safe multi-role style with error handling
   */
  getMultiRoleStyle(roles: string[]): BubbleStyle {
    try {
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        throw new Error('Invalid roles array');
      }

      const style = super.getMultiRoleStyle(roles);
      return this.validateAndSanitizeStyle(style);
    } catch (error) {
      debugLogger.warn('Multi-role style retrieval failed, using fallback', { roles, error });
      return this.getFallbackStyle();
    }
  }

  /**
   * Safe gradient creation with error handling
   */
  createGradient(
    ctx: CanvasRenderingContext2D,
    style: BubbleStyle,
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    const cacheKey = `${style.primaryColor}-${style.secondaryColor}-${x}-${y}-${radius}`;
    
    // Check cache first
    const cachedGradient = this.gradientCache.get(cacheKey);
    if (cachedGradient) {
      return cachedGradient;
    }

    try {
      // Validate parameters
      this.validateGradientParameters(ctx, x, y, radius);
      
      // Validate colors
      const primaryColor = this.validateColor(style.primaryColor);
      const secondaryColor = this.validateColor(style.secondaryColor);

      // Create gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(1, secondaryColor);

      // Cache the gradient
      this.gradientCache.set(cacheKey, gradient);
      
      return gradient;
    } catch (error) {
      const fallbackColor = errorHandler.handleColorApplicationError(error as Error, {
        originalColor: `${style.primaryColor} -> ${style.secondaryColor}`,
        ctx,
        element: 'gradient'
      });

      return this.createFallbackGradient(ctx, fallbackColor, x, y, radius);
    }
  }

  /**
   * Safe composite gradient creation
   */
  createCompositeGradient(
    ctx: CanvasRenderingContext2D,
    roles: string[],
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    try {
      // Validate parameters
      this.validateGradientParameters(ctx, x, y, radius);
      
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        throw new Error('Invalid roles array for composite gradient');
      }

      return super.createCompositeGradient(ctx, roles, x, y, radius);
    } catch (error) {
      debugLogger.warn('Composite gradient creation failed, using fallback', { roles, error });
      
      const fallbackColor = errorHandler.handleColorApplicationError(error as Error, {
        originalColor: `composite-${roles.join(',')}`,
        ctx,
        element: 'gradient'
      });

      return this.createFallbackGradient(ctx, fallbackColor, x, y, radius);
    }
  }

  /**
   * Safe shadow application with error handling
   */
  applyShadow(ctx: CanvasRenderingContext2D, style: BubbleStyle): void {
    try {
      // Validate shadow properties
      const shadowColor = this.validateColor(style.shadowColor);
      const shadowBlur = this.validateNumber(style.shadowBlur, 0, 50);

      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } catch (error) {
      const fallbackColor = errorHandler.handleColorApplicationError(error as Error, {
        originalColor: style.shadowColor,
        ctx,
        element: 'fill'
      });

      // Apply fallback shadow
      ctx.shadowColor = fallbackColor;
      ctx.shadowBlur = 5; // Safe default
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      debugLogger.warn('Shadow application fallback applied', { 
        originalShadow: style.shadowColor,
        fallbackColor 
      });
    }
  }

  /**
   * Safe shadow clearing
   */
  clearShadow(ctx: CanvasRenderingContext2D): void {
    try {
      super.clearShadow(ctx);
    } catch (error) {
      // Fallback shadow clearing
      try {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } catch (fallbackError) {
        debugLogger.error('Shadow clearing failed completely', { error, fallbackError });
      }
    }
  }

  /**
   * Safe theme update
   */
  updateTheme(newTheme: Partial<VisualTheme>): void {
    try {
      // Validate new theme properties
      const validatedTheme = this.validateTheme(newTheme);
      super.updateTheme(validatedTheme);
      
      // Clear caches after theme update
      this.clearCaches();
    } catch (error) {
      debugLogger.error('Theme update failed', { error, newTheme });
    }
  }

  /**
   * Validate and sanitize bubble style
   */
  private validateAndSanitizeStyle(style: BubbleStyle): BubbleStyle {
    return {
      primaryColor: this.validateColor(style.primaryColor),
      secondaryColor: this.validateColor(style.secondaryColor),
      gradientDirection: this.validateNumber(style.gradientDirection, 0, 360),
      iconType: style.iconType, // Enum validation handled elsewhere
      shapeType: style.shapeType, // Enum validation handled elsewhere
      strokeWidth: this.validateNumber(style.strokeWidth, 0, 10),
      strokeColor: this.validateColor(style.strokeColor),
      shadowColor: this.validateColor(style.shadowColor),
      shadowBlur: this.validateNumber(style.shadowBlur, 0, 50)
    };
  }

  /**
   * Validate color string
   */
  private validateColor(color: string): string {
    if (!color || typeof color !== 'string') {
      return '#888888'; // Default gray
    }

    // Check cache first
    const cached = this.colorValidationCache.get(color);
    if (cached !== undefined) {
      return cached ? color : '#888888';
    }

    try {
      // Test color validity by creating a temporary element
      const testElement = document.createElement('div');
      testElement.style.color = color;
      
      // If the browser accepts the color, it should be set
      const isValid = testElement.style.color !== '';
      
      this.colorValidationCache.set(color, isValid);
      return isValid ? color : '#888888';
    } catch (error) {
      this.colorValidationCache.set(color, false);
      return '#888888';
    }
  }

  /**
   * Validate numeric value with bounds
   */
  private validateNumber(value: number, min: number, max: number): number {
    if (!Number.isFinite(value)) {
      return (min + max) / 2; // Return middle value as default
    }
    
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Validate gradient parameters
   */
  private validateGradientParameters(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    if (!ctx) {
      throw new Error('Invalid canvas context');
    }

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Invalid gradient coordinates: x=${x}, y=${y}`);
    }

    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error(`Invalid gradient radius: ${radius}`);
    }

    if (radius > 10000) {
      throw new Error(`Gradient radius too large: ${radius}`);
    }
  }

  /**
   * Create fallback gradient
   */
  private createFallbackGradient(
    ctx: CanvasRenderingContext2D,
    color: string,
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    try {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color);
      return gradient;
    } catch (error) {
      // Ultimate fallback - create a simple gradient
      const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
      gradient.addColorStop(0, '#CCCCCC');
      gradient.addColorStop(1, '#888888');
      return gradient;
    }
  }

  /**
   * Get fallback style
   */
  private getFallbackStyle(): BubbleStyle {
    return {
      primaryColor: '#888888',
      secondaryColor: '#CCCCCC',
      gradientDirection: 135,
      iconType: defaultVisualTheme.song.iconType,
      shapeType: defaultVisualTheme.song.shapeType,
      strokeWidth: 2,
      strokeColor: '#666666',
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 5
    };
  }

  /**
   * Validate theme object
   */
  private validateTheme(theme: Partial<VisualTheme>): Partial<VisualTheme> {
    const validatedTheme: Partial<VisualTheme> = {};

    for (const [key, style] of Object.entries(theme)) {
      if (style && typeof style === 'object') {
        try {
          validatedTheme[key as keyof VisualTheme] = this.validateAndSanitizeStyle(style as BubbleStyle);
        } catch (error) {
          debugLogger.warn(`Invalid style for ${key}, skipping`, { error });
        }
      }
    }

    return validatedTheme;
  }

  /**
   * Clear all caches
   */
  private clearCaches(): void {
    this.colorValidationCache.clear();
    this.gradientCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    colorCacheSize: number;
    gradientCacheSize: number;
    colorValidationHitRate: number;
  } {
    const colorCacheSize = this.colorValidationCache.size;
    const gradientCacheSize = this.gradientCache.size;
    
    // Calculate hit rate (simplified)
    const validColors = Array.from(this.colorValidationCache.values()).filter(Boolean).length;
    const colorValidationHitRate = colorCacheSize > 0 ? validColors / colorCacheSize : 0;

    return {
      colorCacheSize,
      gradientCacheSize,
      colorValidationHitRate
    };
  }

  /**
   * Clear caches manually
   */
  clearAllCaches(): void {
    this.clearCaches();
  }
}

// Export singleton instance
export const safeVisualThemeManager = new SafeVisualThemeManager();