/**
 * Visual Theme System
 * 
 * This module provides the visual theme configuration for different bubble types,
 * including colors, gradients, icons, and shapes for visual distinction.
 */

import { VisualTheme, BubbleStyle, IconType, ShapeType } from '../types/enhancedBubble';

/**
 * Color palette for different content types
 */
export const ColorPalette = {
  // 楽曲 - 音符のイメージ
  song: {
    primary: '#FF6B9D',
    secondary: '#FFB3D1',
    stroke: '#E55A8A',
    shadow: 'rgba(255, 107, 157, 0.3)'
  },
  
  // 作詞家 - ペンのイメージ
  lyricist: {
    primary: '#4ECDC4',
    secondary: '#A7E6E1',
    stroke: '#45B7B8',
    shadow: 'rgba(78, 205, 196, 0.3)'
  },
  
  // 作曲家 - 楽譜のイメージ
  composer: {
    primary: '#A8E6CF',
    secondary: '#D4F1E4',
    stroke: '#95D5B2',
    shadow: 'rgba(168, 230, 207, 0.3)'
  },
  
  // 編曲家 - ミキサーのイメージ
  arranger: {
    primary: '#FFD93D',
    secondary: '#FFEB99',
    stroke: '#E6C235',
    shadow: 'rgba(255, 217, 61, 0.3)'
  },
  
  // タグ - ハッシュタグのイメージ
  tag: {
    primary: '#B8A9FF',
    secondary: '#D6CCFF',
    stroke: '#A594E6',
    shadow: 'rgba(184, 169, 255, 0.3)'
  },
  
  // 複数役割 - 虹色のイメージ
  multiRole: {
    primary: '#FF6B9D',
    secondary: '#B8A9FF',
    stroke: '#8B7ED8',
    shadow: 'rgba(139, 126, 216, 0.4)'
  }
} as const;

/**
 * Default visual theme configuration
 */
export const defaultVisualTheme: VisualTheme = {
  song: {
    primaryColor: ColorPalette.song.primary,
    secondaryColor: ColorPalette.song.secondary,
    gradientDirection: 135,
    iconType: IconType.MUSIC_NOTE,
    shapeType: ShapeType.CIRCLE,
    strokeWidth: 2,
    strokeColor: ColorPalette.song.stroke,
    shadowColor: ColorPalette.song.shadow,
    shadowBlur: 8
  },
  
  lyricist: {
    primaryColor: ColorPalette.lyricist.primary,
    secondaryColor: ColorPalette.lyricist.secondary,
    gradientDirection: 135,
    iconType: IconType.PEN,
    shapeType: ShapeType.ROUNDED_SQUARE,
    strokeWidth: 2,
    strokeColor: ColorPalette.lyricist.stroke,
    shadowColor: ColorPalette.lyricist.shadow,
    shadowBlur: 8
  },
  
  composer: {
    primaryColor: ColorPalette.composer.primary,
    secondaryColor: ColorPalette.composer.secondary,
    gradientDirection: 135,
    iconType: IconType.MUSIC_SHEET,
    shapeType: ShapeType.ROUNDED_SQUARE,
    strokeWidth: 2,
    strokeColor: ColorPalette.composer.stroke,
    shadowColor: ColorPalette.composer.shadow,
    shadowBlur: 8
  },
  
  arranger: {
    primaryColor: ColorPalette.arranger.primary,
    secondaryColor: ColorPalette.arranger.secondary,
    gradientDirection: 135,
    iconType: IconType.MIXER,
    shapeType: ShapeType.ROUNDED_SQUARE,
    strokeWidth: 2,
    strokeColor: ColorPalette.arranger.stroke,
    shadowColor: ColorPalette.arranger.shadow,
    shadowBlur: 8
  },
  
  tag: {
    primaryColor: ColorPalette.tag.primary,
    secondaryColor: ColorPalette.tag.secondary,
    gradientDirection: 135,
    iconType: IconType.HASHTAG,
    shapeType: ShapeType.HEXAGON,
    strokeWidth: 2,
    strokeColor: ColorPalette.tag.stroke,
    shadowColor: ColorPalette.tag.shadow,
    shadowBlur: 8
  },
  
  multiRole: {
    primaryColor: ColorPalette.multiRole.primary,
    secondaryColor: ColorPalette.multiRole.secondary,
    gradientDirection: 135,
    iconType: IconType.MULTI_ROLE,
    shapeType: ShapeType.STAR,
    strokeWidth: 3,
    strokeColor: ColorPalette.multiRole.stroke,
    shadowColor: ColorPalette.multiRole.shadow,
    shadowBlur: 10
  }
};

/**
 * Visual Theme Manager
 * 
 * Manages visual themes and provides utilities for style application
 */
export class VisualThemeManager {
  private theme: VisualTheme;
  
  constructor(theme: VisualTheme = defaultVisualTheme) {
    this.theme = theme;
  }
  
  /**
   * Get style for a specific content type
   */
  getStyleForType(type: keyof VisualTheme): BubbleStyle {
    return { ...this.theme[type] };
  }
  
  /**
   * Get style for multi-role person with composite gradient
   */
  getMultiRoleStyle(roles: string[]): BubbleStyle {
    const baseStyle = this.getStyleForType('multiRole');
    
    // Create composite gradient for multiple roles
    if (roles.length > 1) {
      const colors = roles.map(role => {
        switch (role) {
          case 'lyricist': return ColorPalette.lyricist.primary;
          case 'composer': return ColorPalette.composer.primary;
          case 'arranger': return ColorPalette.arranger.primary;
          default: return ColorPalette.multiRole.primary;
        }
      });
      
      // Use first and last colors for gradient
      baseStyle.primaryColor = colors[0];
      baseStyle.secondaryColor = colors[colors.length - 1];
      
      // For 3+ roles, use special shape
      if (roles.length >= 3) {
        baseStyle.shapeType = ShapeType.DIAMOND;
      } else {
        baseStyle.shapeType = ShapeType.STAR;
      }
    }
    
    return baseStyle;
  }

  /**
   * Create composite gradient for multi-role bubbles
   */
  createCompositeGradient(
    ctx: CanvasRenderingContext2D,
    roles: string[],
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    if (roles.length <= 1) {
      // Fallback to regular gradient
      const style = this.getStyleForType('multiRole');
      return this.createGradient(ctx, style, x, y, radius);
    }

    // Create multi-stop gradient for multiple roles
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    
    const colors = roles.map(role => {
      switch (role) {
        case 'lyricist': return ColorPalette.lyricist.primary;
        case 'composer': return ColorPalette.composer.primary;
        case 'arranger': return ColorPalette.arranger.primary;
        default: return ColorPalette.multiRole.primary;
      }
    });

    // Distribute colors evenly across the gradient
    colors.forEach((color, index) => {
      const stop = index / (colors.length - 1);
      gradient.addColorStop(Math.min(stop, 1), color);
    });

    // Add final color stop for smooth transition
    if (colors.length > 2) {
      gradient.addColorStop(1, colors[colors.length - 1]);
    }

    return gradient;
  }
  
  /**
   * Create gradient string for canvas
   */
  createGradient(
    ctx: CanvasRenderingContext2D,
    style: BubbleStyle,
    x: number,
    y: number,
    radius: number
  ): CanvasGradient {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, style.primaryColor);
    gradient.addColorStop(1, style.secondaryColor);
    return gradient;
  }
  
  /**
   * Apply shadow to canvas context
   */
  applyShadow(ctx: CanvasRenderingContext2D, style: BubbleStyle): void {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }
  
  /**
   * Clear shadow from canvas context
   */
  clearShadow(ctx: CanvasRenderingContext2D): void {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  /**
   * Update theme configuration
   */
  updateTheme(newTheme: Partial<VisualTheme>): void {
    this.theme = { ...this.theme, ...newTheme };
  }
  
  /**
   * Get current theme
   */
  getTheme(): VisualTheme {
    return { ...this.theme };
  }
}