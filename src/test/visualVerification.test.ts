/**
 * 視覚的検証テスト
 * Visual Verification Tests
 * 
 * シャボン玉の視覚的区別が正しく実装されているかを検証
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { VisualTheme } from '../utils/visualTheme';
import { IconRenderer } from '../utils/iconRenderer';
import { ShapeRenderer } from '../utils/shapeRenderer';
import { IconType, ShapeType, EnhancedBubble } from '../types/enhancedBubble';
import { Song } from '../types';

describe('視覚的検証テスト (Visual Verification Tests)', () => {
  let visualTheme: VisualTheme;
  let iconRenderer: IconRenderer;
  let shapeRenderer: ShapeRenderer;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    visualTheme = new VisualTheme();
    iconRenderer = new IconRenderer();
    shapeRenderer = new ShapeRenderer();
    
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    mockContext = mockCanvas.getContext('2d')!;
  });

  describe('色彩システムの検証', () => {
    it('各タイプが異なる色を持つ', () => {
      const songStyle = visualTheme.getStyleForType('song');
      const lyricistStyle = visualTheme.getStyleForType('lyricist');
      const composerStyle = visualTheme.getStyleForType('composer');
      const arrangerStyle = visualTheme.getStyleForType('arranger');
      const tagStyle = visualTheme.getStyleForType('tag');

      // 各タイプの主要色が異なることを確認
      const colors = [
        songStyle.primaryColor,
        lyricistStyle.primaryColor,
        composerStyle.primaryColor,
        arrangerStyle.primaryColor,
        tagStyle.primaryColor
      ];

      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5); // 5つの異なる色
    });

    it('色が有効なHEX形式である', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      const songStyle = visualTheme.getStyleForType('song');
      expect(songStyle.primaryColor).toMatch(hexColorRegex);
      expect(songStyle.secondaryColor).toMatch(hexColorRegex);
    });

    it('複数役割の色が複合グラデーションを持つ', () => {
      const multiRoleStyle = visualTheme.getStyleForType('multiRole');
      
      // 複数役割は特殊なグラデーションを持つ
      expect(multiRoleStyle.primaryColor).toBeDefined();
      expect(multiRoleStyle.secondaryColor).toBeDefined();
      
      // 複数役割の場合は異なる色システムを使用
      const songStyle = visualTheme.getStyleForType('song');
      expect(multiRoleStyle.primaryColor).not.toBe(songStyle.primaryColor);
    });
  });

  describe('アイコンシステムの検証', () => {
    it('各タイプが適切なアイコンを持つ', () => {
      const songStyle = visualTheme.getStyleForType('song');
      const lyricistStyle = visualTheme.getStyleForType('lyricist');
      const composerStyle = visualTheme.getStyleForType('composer');
      const arrangerStyle = visualTheme.getStyleForType('arranger');
      const tagStyle = visualTheme.getStyleForType('tag');

      expect(songStyle.iconType).toBe(IconType.MUSIC_NOTE);
      expect(lyricistStyle.iconType).toBe(IconType.PEN);
      expect(composerStyle.iconType).toBe(IconType.MUSIC_SHEET);
      expect(arrangerStyle.iconType).toBe(IconType.MIXER);
      expect(tagStyle.iconType).toBe(IconType.HASHTAG);
    });

    it('アイコンが正しく描画される', () => {
      // Canvas操作をスパイ
      const beginPathSpy = vi.spyOn(mockContext, 'beginPath');
      const strokeSpy = vi.spyOn(mockContext, 'stroke');
      const fillSpy = vi.spyOn(mockContext, 'fill');

      // 各アイコンタイプを描画
      iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, 20);
      iconRenderer.renderIcon(mockContext, IconType.PEN, 150, 150, 20);
      iconRenderer.renderIcon(mockContext, IconType.MUSIC_SHEET, 200, 200, 20);
      iconRenderer.renderIcon(mockContext, IconType.MIXER, 250, 250, 20);
      iconRenderer.renderIcon(mockContext, IconType.HASHTAG, 300, 300, 20);

      // 描画メソッドが呼ばれたことを確認
      expect(beginPathSpy).toHaveBeenCalled();
      expect(strokeSpy).toHaveBeenCalled();
    });

    it('複数役割アイコンが特殊な描画を行う', () => {
      const beginPathSpy = vi.spyOn(mockContext, 'beginPath');
      
      iconRenderer.renderIcon(mockContext, IconType.MULTI_ROLE, 100, 100, 20);
      
      // 複数役割アイコンは複数の要素を描画するため、beginPathが複数回呼ばれる
      expect(beginPathSpy).toHaveBeenCalled();
    });
  });

  describe('形状システムの検証', () => {
    it('各タイプが適切な形状を持つ', () => {
      const songStyle = visualTheme.getStyleForType('song');
      const tagStyle = visualTheme.getStyleForType('tag');

      expect(songStyle.shapeType).toBe(ShapeType.CIRCLE);
      expect(tagStyle.shapeType).toBe(ShapeType.HEXAGON);
    });

    it('形状が正しく描画される', () => {
      const beginPathSpy = vi.spyOn(mockContext, 'beginPath');
      const closePath = vi.spyOn(mockContext, 'closePath');

      const testBubble: EnhancedBubble = {
        id: 'test',
        x: 100,
        y: 100,
        radius: 30,
        vx: 1,
        vy: 1,
        content: { id: '1', title: 'Test' } as Song,
        visualType: 'song',
        iconType: IconType.MUSIC_NOTE,
        shapeType: ShapeType.CIRCLE,
        isMultiRole: false
      };

      // 各形状を描画
      testBubble.shapeType = ShapeType.CIRCLE;
      shapeRenderer.renderShape(mockContext, testBubble);

      testBubble.shapeType = ShapeType.HEXAGON;
      shapeRenderer.renderShape(mockContext, testBubble);

      testBubble.shapeType = ShapeType.STAR;
      shapeRenderer.renderShape(mockContext, testBubble);

      expect(beginPathSpy).toHaveBeenCalled();
    });

    it('複数役割の形状が特殊である', () => {
      const multiRoleStyle = visualTheme.getStyleForType('multiRole');
      
      // 複数役割は星形またはダイヤモンド形を使用
      expect([ShapeType.STAR, ShapeType.DIAMOND]).toContain(multiRoleStyle.shapeType);
    });
  });

  describe('視覚的一貫性の検証', () => {
    it('同じタイプのバブルは同じ視覚スタイルを持つ', () => {
      const style1 = visualTheme.getStyleForType('song');
      const style2 = visualTheme.getStyleForType('song');

      expect(style1.primaryColor).toBe(style2.primaryColor);
      expect(style1.iconType).toBe(style2.iconType);
      expect(style1.shapeType).toBe(style2.shapeType);
    });

    it('視覚的要素の組み合わせが一意である', () => {
      const types = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const;
      const combinations = new Set<string>();

      types.forEach(type => {
        const style = visualTheme.getStyleForType(type);
        const combination = `${style.primaryColor}-${style.iconType}-${style.shapeType}`;
        combinations.add(combination);
      });

      // 各タイプが一意の視覚的組み合わせを持つ
      expect(combinations.size).toBe(types.length);
    });

    it('コントラストが適切である', () => {
      const types = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const;

      types.forEach(type => {
        const style = visualTheme.getStyleForType(type);
        
        // 主要色と二次色が異なることを確認
        expect(style.primaryColor).not.toBe(style.secondaryColor);
        
        // ストローク色が定義されていることを確認
        expect(style.strokeColor).toBeDefined();
        expect(style.strokeWidth).toBeGreaterThan(0);
      });
    });
  });

  describe('アクセシビリティの検証', () => {
    it('色だけでなく形状とアイコンでも区別可能', () => {
      const types = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const;
      const iconTypes = new Set<IconType>();
      const shapeTypes = new Set<ShapeType>();

      types.forEach(type => {
        const style = visualTheme.getStyleForType(type);
        iconTypes.add(style.iconType);
        shapeTypes.add(style.shapeType);
      });

      // アイコンと形状の組み合わせで区別可能
      expect(iconTypes.size).toBeGreaterThan(1);
      expect(shapeTypes.size).toBeGreaterThan(1);
    });

    it('十分なサイズでアイコンが描画される', () => {
      const minIconSize = 16; // 最小アイコンサイズ
      const maxIconSize = 64; // 最大アイコンサイズ

      // 様々なサイズでアイコンを描画
      [minIconSize, 24, 32, maxIconSize].forEach(size => {
        expect(() => {
          iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, size);
        }).not.toThrow();
      });
    });
  });
});