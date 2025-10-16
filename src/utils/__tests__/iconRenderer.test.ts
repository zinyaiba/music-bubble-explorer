import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IconRenderer, iconRenderer } from '../iconRenderer';
import { IconType } from '../../types/enhancedBubble';

// Canvas context のモック
const createMockContext = () => {
  const mockContext = {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    roundRect: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    shadowColor: '',
    shadowBlur: 0
  };
  return mockContext as unknown as CanvasRenderingContext2D;
};

describe('IconRenderer', () => {
  let renderer: IconRenderer;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    renderer = new IconRenderer();
    mockCtx = createMockContext();
  });

  describe('音符アイコンの描画', () => {
    it('renderMusicNote should draw music note icon correctly', () => {
      renderer.renderMusicNote(mockCtx, 100, 100, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(100, 100);
      expect(mockCtx.scale).toHaveBeenCalledWith(1, 1); // 24/24 = 1
      expect(mockCtx.ellipse).toHaveBeenCalled(); // 符頭
      expect(mockCtx.moveTo).toHaveBeenCalled(); // 符幹
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled(); // 符尾
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should scale music note icon based on size parameter', () => {
      renderer.renderMusicNote(mockCtx, 0, 0, 48);

      expect(mockCtx.scale).toHaveBeenCalledWith(2, 2); // 48/24 = 2
    });
  });

  describe('ペンアイコンの描画', () => {
    it('renderPen should draw pen icon correctly', () => {
      renderer.renderPen(mockCtx, 50, 50, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(50, 50);
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled(); // インクの線
      expect(mockCtx.fill).toHaveBeenCalled(); // ペン先
      expect(mockCtx.stroke).toHaveBeenCalled(); // 軸とグリップ
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('楽譜アイコンの描画', () => {
    it('renderMusicSheet should draw music sheet icon correctly', () => {
      renderer.renderMusicSheet(mockCtx, 200, 200, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(200, 200);
      expect(mockCtx.roundRect).toHaveBeenCalled(); // 楽譜の背景
      expect(mockCtx.arc).toHaveBeenCalled(); // 音符
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled(); // 五線譜
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should draw staff lines for music sheet', () => {
      renderer.renderMusicSheet(mockCtx, 0, 0, 24);

      // 五線譜の5本線が描画されることを確認
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(5); // 5本の線
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(5); // 5本の線
    });
  });

  describe('ミキサーアイコンの描画', () => {
    it('renderMixer should draw mixer icon correctly', () => {
      renderer.renderMixer(mockCtx, 150, 150, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(150, 150);
      expect(mockCtx.roundRect).toHaveBeenCalled(); // ベースとフェーダーつまみ
      expect(mockCtx.arc).toHaveBeenCalled(); // ノブ
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('ハッシュタグアイコンの描画', () => {
    it('renderHashtag should draw hashtag icon correctly', () => {
      renderer.renderHashtag(mockCtx, 75, 75, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(75, 75);
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(4); // 4本の線
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(4);
      expect(mockCtx.stroke).toHaveBeenCalledTimes(4);
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should set correct line properties for hashtag', () => {
      renderer.renderHashtag(mockCtx, 0, 0, 24);

      expect(mockCtx.lineWidth).toBe(2);
      expect(mockCtx.lineCap).toBe('round');
    });
  });

  describe('複数役割アイコンの描画', () => {
    it('renderMultiRole should draw multi-role icon correctly', () => {
      const spyRenderMusicNote = vi.spyOn(renderer, 'renderMusicNote');
      const spyRenderPen = vi.spyOn(renderer, 'renderPen');
      const spyRenderMusicSheet = vi.spyOn(renderer, 'renderMusicSheet');

      renderer.renderMultiRole(mockCtx, 300, 300, 24);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.translate).toHaveBeenCalledWith(300, 300);
      expect(mockCtx.arc).toHaveBeenCalled(); // 背景円
      expect(spyRenderMusicNote).toHaveBeenCalled();
      expect(spyRenderPen).toHaveBeenCalled();
      expect(spyRenderMusicSheet).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should scale down individual icons in multi-role', () => {
      const spyScale = vi.spyOn(mockCtx, 'scale');
      
      renderer.renderMultiRole(mockCtx, 0, 0, 24);

      // 0.7倍のスケールが適用されることを確認
      expect(spyScale).toHaveBeenCalledWith(0.7, 0.7);
    });
  });

  describe('汎用アイコン描画メソッド', () => {
    it('renderIcon should call correct method for MUSIC_NOTE', () => {
      const spy = vi.spyOn(renderer, 'renderMusicNote');
      
      renderer.renderIcon(mockCtx, IconType.MUSIC_NOTE, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should call correct method for PEN', () => {
      const spy = vi.spyOn(renderer, 'renderPen');
      
      renderer.renderIcon(mockCtx, IconType.PEN, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should call correct method for MUSIC_SHEET', () => {
      const spy = vi.spyOn(renderer, 'renderMusicSheet');
      
      renderer.renderIcon(mockCtx, IconType.MUSIC_SHEET, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should call correct method for MIXER', () => {
      const spy = vi.spyOn(renderer, 'renderMixer');
      
      renderer.renderIcon(mockCtx, IconType.MIXER, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should call correct method for HASHTAG', () => {
      const spy = vi.spyOn(renderer, 'renderHashtag');
      
      renderer.renderIcon(mockCtx, IconType.HASHTAG, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should call correct method for MULTI_ROLE', () => {
      const spy = vi.spyOn(renderer, 'renderMultiRole');
      
      renderer.renderIcon(mockCtx, IconType.MULTI_ROLE, 100, 100, 24);
      
      expect(spy).toHaveBeenCalledWith(mockCtx, 100, 100, 24);
    });

    it('renderIcon should render fallback circle for invalid icon type', () => {
      renderer.renderIcon(mockCtx, 'invalid' as IconType, 100, 100, 24);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, 6, 0, Math.PI * 2); // size/4 = 24/4 = 6
      expect(mockCtx.fill).toHaveBeenCalled();
    });
  });

  describe('シングルトンインスタンス', () => {
    it('should export singleton instance', () => {
      expect(iconRenderer).toBeInstanceOf(IconRenderer);
    });

    it('should be the same instance when imported multiple times', () => {
      // シングルトンパターンのテスト - 同じインスタンスが返されることを確認
      expect(iconRenderer).toBe(iconRenderer);
      
      // 新しいインスタンスを作成しても、エクスポートされたシングルトンは同じ
      const newRenderer = new IconRenderer();
      expect(newRenderer).not.toBe(iconRenderer);
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle canvas context errors gracefully', () => {
      const errorCtx = {
        ...mockCtx,
        save: vi.fn(() => { throw new Error('Canvas error'); })
      } as unknown as CanvasRenderingContext2D;

      expect(() => {
        renderer.renderMusicNote(errorCtx, 0, 0, 24);
      }).toThrow('Canvas error');
    });

    it('should handle invalid parameters gracefully', () => {
      expect(() => {
        renderer.renderMusicNote(mockCtx, NaN, NaN, -1);
      }).not.toThrow();
    });
  });

  describe('パフォーマンステスト', () => {
    it('should render icons efficiently', () => {
      const startTime = performance.now();
      
      // 100個のアイコンを描画
      for (let i = 0; i < 100; i++) {
        renderer.renderMusicNote(mockCtx, i, i, 24);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 100個のアイコン描画が100ms以内に完了することを確認
      expect(duration).toBeLessThan(100);
    });
  });
});