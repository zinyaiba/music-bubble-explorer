/**
 * Visual Theme System Tests
 * 
 * Tests for the visual theme system including theme manager,
 * style resolver, and color palette functionality.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VisualThemeManager, defaultVisualTheme, ColorPalette } from '../visualTheme';
import { BubbleStyleResolver } from '../bubbleStyleResolver';
import { IconType, ShapeType } from '../../types/enhancedBubble';

describe('VisualThemeManager', () => {
  let themeManager: VisualThemeManager;

  beforeEach(() => {
    themeManager = new VisualThemeManager(defaultVisualTheme);
  });

  describe('getStyleForType', () => {
    it('should return correct style for song type', () => {
      const style = themeManager.getStyleForType('song');
      
      expect(style.iconType).toBe(IconType.MUSIC_NOTE);
      expect(style.shapeType).toBe(ShapeType.CIRCLE);
      expect(style.primaryColor).toBe(ColorPalette.song.primary);
      expect(style.secondaryColor).toBe(ColorPalette.song.secondary);
    });

    it('should return correct style for lyricist type', () => {
      const style = themeManager.getStyleForType('lyricist');
      
      expect(style.iconType).toBe(IconType.PEN);
      expect(style.shapeType).toBe(ShapeType.ROUNDED_SQUARE);
      expect(style.primaryColor).toBe(ColorPalette.lyricist.primary);
    });

    it('should return correct style for composer type', () => {
      const style = themeManager.getStyleForType('composer');
      
      expect(style.iconType).toBe(IconType.MUSIC_SHEET);
      expect(style.shapeType).toBe(ShapeType.ROUNDED_SQUARE);
      expect(style.primaryColor).toBe(ColorPalette.composer.primary);
    });

    it('should return correct style for arranger type', () => {
      const style = themeManager.getStyleForType('arranger');
      
      expect(style.iconType).toBe(IconType.MIXER);
      expect(style.shapeType).toBe(ShapeType.ROUNDED_SQUARE);
      expect(style.primaryColor).toBe(ColorPalette.arranger.primary);
    });

    it('should return correct style for tag type', () => {
      const style = themeManager.getStyleForType('tag');
      
      expect(style.iconType).toBe(IconType.HASHTAG);
      expect(style.shapeType).toBe(ShapeType.HEXAGON);
      expect(style.primaryColor).toBe(ColorPalette.tag.primary);
    });

    it('should return correct style for multi-role type', () => {
      const style = themeManager.getStyleForType('multiRole');
      
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.STAR);
      expect(style.strokeWidth).toBe(3);
      expect(style.shadowBlur).toBe(10);
    });
  });

  describe('getMultiRoleStyle', () => {
    it('should return multi-role style for single role', () => {
      const style = themeManager.getMultiRoleStyle(['lyricist']);
      
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.STAR);
    });

    it('should create composite gradient for multiple roles', () => {
      const style = themeManager.getMultiRoleStyle(['lyricist', 'composer']);
      
      expect(style.primaryColor).toBe(ColorPalette.lyricist.primary);
      expect(style.secondaryColor).toBe(ColorPalette.composer.primary);
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
    });

    it('should handle three roles correctly', () => {
      const style = themeManager.getMultiRoleStyle(['lyricist', 'composer', 'arranger']);
      
      expect(style.primaryColor).toBe(ColorPalette.lyricist.primary);
      expect(style.secondaryColor).toBe(ColorPalette.arranger.primary);
    });
  });

  describe('canvas utilities', () => {
    let mockCanvas: HTMLCanvasElement;
    let mockCtx: CanvasRenderingContext2D | null;

    beforeEach(() => {
      mockCanvas = document.createElement('canvas');
      mockCtx = mockCanvas.getContext('2d');
    });

    it.skipIf(!mockCtx)('should create gradient correctly', () => {
      if (!mockCtx) return;
      
      const style = themeManager.getStyleForType('song');
      const gradient = themeManager.createGradient(mockCtx, style, 100, 100, 50);
      
      expect(gradient).toBeInstanceOf(CanvasGradient);
    });

    it.skipIf(!mockCtx)('should apply shadow correctly', () => {
      if (!mockCtx) return;
      
      const style = themeManager.getStyleForType('song');
      themeManager.applyShadow(mockCtx, style);
      
      expect(mockCtx.shadowColor).toBe(style.shadowColor);
      expect(mockCtx.shadowBlur).toBe(style.shadowBlur);
      expect(mockCtx.shadowOffsetX).toBe(2);
      expect(mockCtx.shadowOffsetY).toBe(2);
    });

    it.skipIf(!mockCtx)('should clear shadow correctly', () => {
      if (!mockCtx) return;
      
      themeManager.clearShadow(mockCtx);
      
      expect(mockCtx.shadowColor).toBe('transparent');
      expect(mockCtx.shadowBlur).toBe(0);
      expect(mockCtx.shadowOffsetX).toBe(0);
      expect(mockCtx.shadowOffsetY).toBe(0);
    });
  });
});

describe('BubbleStyleResolver', () => {
  let resolver: BubbleStyleResolver;

  beforeEach(() => {
    resolver = new BubbleStyleResolver();
  });

  describe('resolveStyle', () => {
    it('should resolve song content correctly', () => {
      const content = { type: 'song' as const };
      const style = resolver.resolveStyle(content);
      
      expect(style.iconType).toBe(IconType.MUSIC_NOTE);
      expect(style.shapeType).toBe(ShapeType.CIRCLE);
    });

    it('should resolve tag content correctly', () => {
      const content = { type: 'tag' as const };
      const style = resolver.resolveStyle(content);
      
      expect(style.iconType).toBe(IconType.HASHTAG);
      expect(style.shapeType).toBe(ShapeType.HEXAGON);
    });

    it('should resolve single role person correctly', () => {
      const content = { 
        type: 'person' as const, 
        roles: [{ type: 'lyricist' as const, songCount: 5 }] 
      };
      const style = resolver.resolveStyle(content);
      
      expect(style.iconType).toBe(IconType.PEN);
      expect(style.shapeType).toBe(ShapeType.ROUNDED_SQUARE);
    });

    it('should resolve multi-role person correctly', () => {
      const content = { 
        type: 'person' as const, 
        roles: [
          { type: 'lyricist' as const, songCount: 3 },
          { type: 'composer' as const, songCount: 2 }
        ] 
      };
      const style = resolver.resolveStyle(content);
      
      expect(style.iconType).toBe(IconType.MULTI_ROLE);
      expect(style.shapeType).toBe(ShapeType.STAR);
    });

    it('should handle person with no roles', () => {
      const content = { type: 'person' as const, roles: [] };
      const style = resolver.resolveStyle(content);
      
      expect(style.iconType).toBe(IconType.PEN); // defaults to lyricist
      expect(style.shapeType).toBe(ShapeType.ROUNDED_SQUARE);
    });
  });

  describe('isMultiRole', () => {
    it('should return false for song content', () => {
      const content = { type: 'song' as const };
      expect(resolver.isMultiRole(content)).toBe(false);
    });

    it('should return false for single role person', () => {
      const content = { 
        type: 'person' as const, 
        roles: [{ type: 'lyricist' as const, songCount: 5 }] 
      };
      expect(resolver.isMultiRole(content)).toBe(false);
    });

    it('should return true for multi-role person', () => {
      const content = { 
        type: 'person' as const, 
        roles: [
          { type: 'lyricist' as const, songCount: 3 },
          { type: 'composer' as const, songCount: 2 }
        ] 
      };
      expect(resolver.isMultiRole(content)).toBe(true);
    });
  });

  describe('createEnhancedProperties', () => {
    it('should create correct properties for song', () => {
      const content = { type: 'song' as const };
      const props = resolver.createEnhancedProperties(content);
      
      expect(props.visualType).toBe('song');
      expect(props.iconType).toBe(IconType.MUSIC_NOTE);
      expect(props.shapeType).toBe(ShapeType.CIRCLE);
      expect(props.isMultiRole).toBe(false);
      expect(props.style).toBeDefined();
    });

    it('should create correct properties for multi-role person', () => {
      const content = { 
        type: 'person' as const, 
        roles: [
          { type: 'lyricist' as const, songCount: 3 },
          { type: 'composer' as const, songCount: 2 }
        ] 
      };
      const props = resolver.createEnhancedProperties(content);
      
      expect(props.visualType).toBe('person');
      expect(props.iconType).toBe(IconType.MULTI_ROLE);
      expect(props.shapeType).toBe(ShapeType.STAR);
      expect(props.isMultiRole).toBe(true);
      expect(props.roles).toEqual(content.roles);
    });
  });
});

describe('ColorPalette', () => {
  it('should have all required color types', () => {
    expect(ColorPalette.song).toBeDefined();
    expect(ColorPalette.lyricist).toBeDefined();
    expect(ColorPalette.composer).toBeDefined();
    expect(ColorPalette.arranger).toBeDefined();
    expect(ColorPalette.tag).toBeDefined();
    expect(ColorPalette.multiRole).toBeDefined();
  });

  it('should have consistent color structure', () => {
    Object.values(ColorPalette).forEach(colorSet => {
      expect(colorSet.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colorSet.secondary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colorSet.stroke).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colorSet.shadow).toMatch(/^rgba\(/);
    });
  });
});

describe('defaultVisualTheme', () => {
  it('should have all required theme types', () => {
    expect(defaultVisualTheme.song).toBeDefined();
    expect(defaultVisualTheme.lyricist).toBeDefined();
    expect(defaultVisualTheme.composer).toBeDefined();
    expect(defaultVisualTheme.arranger).toBeDefined();
    expect(defaultVisualTheme.tag).toBeDefined();
    expect(defaultVisualTheme.multiRole).toBeDefined();
  });

  it('should have consistent style structure', () => {
    Object.values(defaultVisualTheme).forEach(style => {
      expect(style.primaryColor).toBeDefined();
      expect(style.secondaryColor).toBeDefined();
      expect(style.iconType).toBeDefined();
      expect(style.shapeType).toBeDefined();
      expect(style.strokeWidth).toBeGreaterThan(0);
      expect(style.shadowBlur).toBeGreaterThan(0);
    });
  });
});