/**
 * Shape Renderer System (Performance Optimized)
 * 
 * This module provides shape rendering functionality for enhanced bubbles,
 * supporting various geometric shapes with proper styling and visual effects.
 * Includes caching for Path2D objects to optimize repeated shape rendering.
 */

import { EnhancedBubble, ShapeType } from '../types/enhancedBubble';
import { performanceCache, GradientCacheKey } from './performanceCache';

/**
 * Shape renderer class for drawing different geometric shapes with performance caching
 */
export class ShapeRenderer {
  /**
   * Render a circular bubble
   */
  renderCircle(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, style } = bubble;
    const radius = size / 2;
    
    // Create gradient
    const gradient = this.createRadialGradient(ctx, x, y, radius, style);
    
    // Draw circle with gradient fill
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
    
    // Add shadow effect
    this.applyShadow(ctx, style);
  }

  /**
   * Render a rounded square bubble
   */
  renderRoundedSquare(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, style } = bubble;
    const radius = size / 2;
    const squareSize = radius * 1.6; // Make square slightly larger than circle
    const cornerRadius = radius * 0.3; // 30% of radius for rounded corners
    
    // Create gradient
    const gradient = this.createLinearGradient(ctx, x - squareSize/2, y - squareSize/2, x + squareSize/2, y + squareSize/2, style);
    
    // Draw rounded rectangle
    ctx.beginPath();
    this.roundedRect(ctx, x - squareSize/2, y - squareSize/2, squareSize, squareSize, cornerRadius);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
    
    // Add shadow effect
    this.applyShadow(ctx, style);
  }

  /**
   * Render a hexagonal bubble
   */
  renderHexagon(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, style } = bubble;
    const radius = size / 2;
    
    // Create gradient
    const gradient = this.createRadialGradient(ctx, x, y, radius, style);
    
    // Draw hexagon
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + radius * Math.cos(angle);
      const py = y + radius * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
    
    // Add shadow effect
    this.applyShadow(ctx, style);
  }

  /**
   * Render a diamond-shaped bubble
   */
  renderDiamond(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, style } = bubble;
    const radius = size / 2;
    
    // Create gradient (use composite if multi-role)
    const gradient = bubble.isMultiRole && bubble.roles 
      ? this.createCompositeGradient(ctx, bubble.roles, x, y, radius)
      : this.createLinearGradient(ctx, x - radius, y - radius, x + radius, y + radius, style);
    
    // Draw diamond (rotated square)
    ctx.beginPath();
    ctx.moveTo(x, y - radius);      // Top
    ctx.lineTo(x + radius, y);      // Right
    ctx.lineTo(x, y + radius);      // Bottom
    ctx.lineTo(x - radius, y);      // Left
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
    
    // Add shadow effect
    this.applyShadow(ctx, style);
  }

  /**
   * Render a star-shaped bubble
   */
  renderStar(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, style } = bubble;
    const radius = size / 2;
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    // Create gradient (use composite if multi-role)
    const gradient = bubble.isMultiRole && bubble.roles 
      ? this.createCompositeGradient(ctx, bubble.roles, x, y, radius)
      : this.createRadialGradient(ctx, x, y, radius, style);
    
    // Draw star
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + currentRadius * Math.cos(angle - Math.PI / 2);
      const py = y + currentRadius * Math.sin(angle - Math.PI / 2);
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke();
    }
    
    // Add shadow effect
    this.applyShadow(ctx, style);
  }

  /**
   * Optimized shape rendering with caching
   */
  renderShapeOptimized(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    const { x, y, size, shapeType } = bubble;
    const radius = size / 2;

    // Create cache key for shape
    const shapeKey = `${shapeType}_${Math.round(size)}`;

    // Try to get cached path
    const cachedPath = performanceCache.getCachedShape(shapeKey);
    if (cachedPath) {
      this.renderWithCachedPath(ctx, bubble, cachedPath, x, y);
      return;
    }

    // Create new path and cache it
    const path = this.createShapePath(shapeType, 0, 0, radius); // Create at origin for reusability
    if (path) {
      performanceCache.cacheShape(shapeKey, path);
      this.renderWithCachedPath(ctx, bubble, path, x, y);
    } else {
      // Fallback to direct rendering
      this.renderShapeDirect(ctx, bubble);
    }
  }

  /**
   * Create Path2D object for shape caching (centered at origin for reusability)
   */
  private createShapePath(shapeType: ShapeType, x: number, y: number, radius: number): Path2D | null {
    const path = new Path2D();

    switch (shapeType) {
      case ShapeType.CIRCLE:
        path.arc(x, y, radius, 0, Math.PI * 2);
        break;

      case ShapeType.ROUNDED_SQUARE:
        const squareSize = radius * 1.6;
        const cornerRadius = radius * 0.3;
        this.addRoundedRectToPath(path, x - squareSize/2, y - squareSize/2, squareSize, squareSize, cornerRadius);
        break;

      case ShapeType.HEXAGON:
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const px = x + radius * Math.cos(angle);
          const py = y + radius * Math.sin(angle);
          if (i === 0) {
            path.moveTo(px, py);
          } else {
            path.lineTo(px, py);
          }
        }
        path.closePath();
        break;

      case ShapeType.DIAMOND:
        path.moveTo(x, y - radius);
        path.lineTo(x + radius, y);
        path.lineTo(x, y + radius);
        path.lineTo(x - radius, y);
        path.closePath();
        break;

      case ShapeType.STAR:
        const spikes = 5;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
          const angle = (i * Math.PI) / spikes;
          const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
          const px = x + currentRadius * Math.cos(angle - Math.PI / 2);
          const py = y + currentRadius * Math.sin(angle - Math.PI / 2);
          if (i === 0) {
            path.moveTo(px, py);
          } else {
            path.lineTo(px, py);
          }
        }
        path.closePath();
        break;

      default:
        return null;
    }

    return path;
  }

  /**
   * Render using cached path
   */
  private renderWithCachedPath(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble, path: Path2D, x: number, y: number): void {
    const { size, style } = bubble;
    const radius = size / 2;

    ctx.save();
    ctx.translate(x, y);

    // Get or create gradient
    const gradient = this.getOptimizedGradient(ctx, bubble, 0, 0, radius);

    // Fill the path
    ctx.fillStyle = gradient;
    ctx.fill(path);

    // Add stroke if specified
    if (style.strokeWidth > 0) {
      ctx.strokeStyle = style.strokeColor;
      ctx.lineWidth = style.strokeWidth;
      ctx.stroke(path);
    }

    ctx.restore();
  }

  /**
   * Get optimized gradient with caching
   */
  private getOptimizedGradient(
    ctx: CanvasRenderingContext2D,
    bubble: EnhancedBubble,
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    const { style, isMultiRole, roles } = bubble;
    
    if (isMultiRole && roles) {
      const colors = roles.map(role => this.getRoleColor(role.type));
      const gradientKey: GradientCacheKey = {
        colors,
        direction: 0,
        width: radius * 2,
        height: radius * 2
      };
      
      const cachedGradient = performanceCache.getCachedGradient(gradientKey);
      if (cachedGradient) {
        return cachedGradient;
      }

      const gradient = this.createCompositeGradient(ctx, roles, x, y, radius);
      performanceCache.cacheGradient(gradientKey, gradient);
      return gradient;
    }

    // Standard gradient
    const colors = [style.primaryColor, style.secondaryColor];
    const gradientKey: GradientCacheKey = {
      colors,
      direction: style.gradientDirection || 0,
      width: radius * 2,
      height: radius * 2
    };
    
    const cachedGradient = performanceCache.getCachedGradient(gradientKey);
    if (cachedGradient) {
      return cachedGradient;
    }

    const gradient = this.createRadialGradient(ctx, x, y, radius, style);
    performanceCache.cacheGradient(gradientKey, gradient);
    return gradient;
  }

  /**
   * Direct shape rendering (fallback)
   */
  private renderShapeDirect(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void {
    switch (bubble.shapeType) {
      case ShapeType.CIRCLE:
        this.renderCircle(ctx, bubble);
        break;
      case ShapeType.ROUNDED_SQUARE:
        this.renderRoundedSquare(ctx, bubble);
        break;
      case ShapeType.HEXAGON:
        this.renderHexagon(ctx, bubble);
        break;
      case ShapeType.DIAMOND:
        this.renderDiamond(ctx, bubble);
        break;
      case ShapeType.STAR:
        this.renderStar(ctx, bubble);
        break;
      default:
        this.renderCircle(ctx, bubble);
    }
  }

  /**
   * Add rounded rectangle to Path2D
   */
  private addRoundedRectToPath(
    path: Path2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    path.moveTo(x + radius, y);
    path.lineTo(x + width - radius, y);
    path.quadraticCurveTo(x + width, y, x + width, y + radius);
    path.lineTo(x + width, y + height - radius);
    path.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    path.lineTo(x + radius, y + height);
    path.quadraticCurveTo(x, y + height, x, y + height - radius);
    path.lineTo(x, y + radius);
    path.quadraticCurveTo(x, y, x + radius, y);
  }

  /**
   * Get role-specific color
   */
  private getRoleColor(roleType: string): string {
    const roleColors = {
      lyricist: '#4ECDC4',
      composer: '#A8E6CF', 
      arranger: '#FFD93D'
    };
    return roleColors[roleType as keyof typeof roleColors] || '#FF6B9D';
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    performanceCache.clearAll();
  }

  /**
   * Create a radial gradient for circular shapes
   */
  private createRadialGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    style: any
  ): CanvasGradient {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, style.primaryColor);
    gradient.addColorStop(1, style.secondaryColor);
    return gradient;
  }

  /**
   * Create a linear gradient for angular shapes
   */
  private createLinearGradient(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    style: any
  ): CanvasGradient {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, style.primaryColor);
    gradient.addColorStop(1, style.secondaryColor);
    return gradient;
  }

  /**
   * Helper method to draw rounded rectangle
   */
  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  /**
   * Create composite gradient for multi-role bubbles
   */
  private createCompositeGradient(
    ctx: CanvasRenderingContext2D,
    roles: any[],
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    // Color mapping for roles
    const roleColors = {
      lyricist: '#4ECDC4',
      composer: '#A8E6CF', 
      arranger: '#FFD93D'
    };

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    if (roles.length === 1) {
      const color = roleColors[roles[0].type as keyof typeof roleColors] || '#FF6B9D';
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, color + '80'); // Add transparency
      return gradient;
    }

    // Create multi-stop gradient for multiple roles
    const colors = roles.map(role => 
      roleColors[role.type as keyof typeof roleColors] || '#FF6B9D'
    );

    // Distribute colors evenly
    colors.forEach((color, index) => {
      const stop = index / Math.max(colors.length - 1, 1);
      gradient.addColorStop(Math.min(stop, 1), color);
    });

    // Add final transparency
    gradient.addColorStop(1, colors[colors.length - 1] + '60');

    return gradient;
  }

  /**
   * Apply shadow effect to the current path
   */
  private applyShadow(ctx: CanvasRenderingContext2D, style: any): void {
    if (style.shadowBlur > 0) {
      const originalShadowColor = ctx.shadowColor;
      const originalShadowBlur = ctx.shadowBlur;
      const originalShadowOffsetX = ctx.shadowOffsetX;
      const originalShadowOffsetY = ctx.shadowOffsetY;
      
      ctx.shadowColor = style.shadowColor;
      ctx.shadowBlur = style.shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Restore original shadow settings
      ctx.shadowColor = originalShadowColor;
      ctx.shadowBlur = originalShadowBlur;
      ctx.shadowOffsetX = originalShadowOffsetX;
      ctx.shadowOffsetY = originalShadowOffsetY;
    }
  }
}

/**
 * Default shape renderer instance
 */
export const shapeRenderer = new ShapeRenderer();