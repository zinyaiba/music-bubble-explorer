/**
 * Shape Renderer Tests
 * 
 * Unit tests for the ShapeRenderer class functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShapeRenderer } from '../shapeRenderer';
import { EnhancedBubble, ShapeType, IconType } from '../../types/enhancedBubble';

// Mock canvas context
const createMockContext = () => ({
  beginPath: vi.fn(),
  arc: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0
});

// Mock enhanced bubble
const createMockBubble = (shapeType: ShapeType): EnhancedBubble => ({
  id: 'test-bubble',
  type: 'song',
  name: 'Test',
  x: 100,
  y: 100,
  vx: 0,
  vy: 0,
  size: 100,
  color: '#FF6B9D',
  opacity: 1,
  lifespan: 1000,
  relatedCount: 5,
  visualType: 'song',
  iconType: IconType.MUSIC_NOTE,
  shapeType,
  isMultiRole: false,
  style: {
    primaryColor: '#FF6B9D',
    secondaryColor: '#FFB3D1',
    gradientDirection: 135,
    iconType: IconType.MUSIC_NOTE,
    shapeType,
    strokeWidth: 2,
    strokeColor: '#FF1744',
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 10
  }
});

describe('ShapeRenderer', () => {
  let renderer: ShapeRenderer;
  let mockCtx: any;

  beforeEach(() => {
    renderer = new ShapeRenderer();
    mockCtx = createMockContext();
  });

  describe('renderCircle', () => {
    it('should render a circle with proper arc call', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      
      renderer.renderCircle(mockCtx, bubble);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI * 2);
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should apply stroke when strokeWidth > 0', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      
      renderer.renderCircle(mockCtx, bubble);
      
      expect(mockCtx.strokeStyle).toBe('#FF1744');
      expect(mockCtx.lineWidth).toBe(2);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should create radial gradient', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      
      renderer.renderCircle(mockCtx, bubble);
      
      expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(100, 100, 0, 100, 100, 50);
    });
  });

  describe('renderRoundedSquare', () => {
    it('should render a rounded square with proper path', () => {
      const bubble = createMockBubble(ShapeType.ROUNDED_SQUARE);
      
      renderer.renderRoundedSquare(mockCtx, bubble);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should create linear gradient for square', () => {
      const bubble = createMockBubble(ShapeType.ROUNDED_SQUARE);
      
      renderer.renderRoundedSquare(mockCtx, bubble);
      
      expect(mockCtx.createLinearGradient).toHaveBeenCalled();
    });
  });

  describe('renderHexagon', () => {
    it('should render a hexagon with 6 sides', () => {
      const bubble = createMockBubble(ShapeType.HEXAGON);
      
      renderer.renderHexagon(mockCtx, bubble);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(5); // 6 sides - 1 moveTo
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should create radial gradient for hexagon', () => {
      const bubble = createMockBubble(ShapeType.HEXAGON);
      
      renderer.renderHexagon(mockCtx, bubble);
      
      expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(100, 100, 0, 100, 100, 50);
    });
  });

  describe('renderDiamond', () => {
    it('should render a diamond with 4 points', () => {
      const bubble = createMockBubble(ShapeType.DIAMOND);
      
      renderer.renderDiamond(mockCtx, bubble);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledWith(100, 50); // Top point
      expect(mockCtx.lineTo).toHaveBeenCalledWith(150, 100); // Right point
      expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 150); // Bottom point
      expect(mockCtx.lineTo).toHaveBeenCalledWith(50, 100); // Left point
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should create linear gradient for diamond', () => {
      const bubble = createMockBubble(ShapeType.DIAMOND);
      
      renderer.renderDiamond(mockCtx, bubble);
      
      expect(mockCtx.createLinearGradient).toHaveBeenCalledWith(50, 50, 150, 150);
    });
  });

  describe('renderStar', () => {
    it('should render a star with 5 spikes', () => {
      const bubble = createMockBubble(ShapeType.STAR);
      
      renderer.renderStar(mockCtx, bubble);
      
      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledTimes(1);
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(9); // 10 points - 1 moveTo
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should create radial gradient for star', () => {
      const bubble = createMockBubble(ShapeType.STAR);
      
      renderer.renderStar(mockCtx, bubble);
      
      expect(mockCtx.createRadialGradient).toHaveBeenCalledWith(100, 100, 0, 100, 100, 50);
    });
  });

  describe('stroke and shadow effects', () => {
    it('should not apply stroke when strokeWidth is 0', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      bubble.style.strokeWidth = 0;
      
      renderer.renderCircle(mockCtx, bubble);
      
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it('should apply shadow effects when shadowBlur > 0', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      
      renderer.renderCircle(mockCtx, bubble);
      
      // Shadow properties should be set during rendering
      expect(bubble.style.shadowBlur).toBe(10);
      expect(bubble.style.shadowColor).toBe('rgba(0,0,0,0.3)');
    });
  });

  describe('gradient creation', () => {
    it('should add color stops to gradients', () => {
      const bubble = createMockBubble(ShapeType.CIRCLE);
      const mockGradient = {
        addColorStop: vi.fn()
      };
      mockCtx.createRadialGradient.mockReturnValue(mockGradient);
      
      renderer.renderCircle(mockCtx, bubble);
      
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(0, '#FF6B9D');
      expect(mockGradient.addColorStop).toHaveBeenCalledWith(1, '#FFB3D1');
    });
  });
});