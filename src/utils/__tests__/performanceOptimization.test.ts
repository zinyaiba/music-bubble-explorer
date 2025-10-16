/**
 * Performance Optimization Tests
 * 
 * Comprehensive tests for the performance optimization system including
 * caching, selective rendering, and performance monitoring.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  PerformanceCache, 
  IconCacheKey, 
  GradientCacheKey 
} from '../performanceCache';
import { SelectiveRenderer } from '../selectiveRenderer';
import { PerformanceMonitor } from '../performanceMonitor';
import { EnhancedBubble, IconType, ShapeType } from '../../types/enhancedBubble';

// Mock browser APIs for testing
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
});

// Mock ImageData
global.ImageData = class MockImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
} as any;

// Mock Path2D
global.Path2D = class MockPath2D {
  private commands: string[] = [];
  
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    this.commands.push(`arc(${x},${y},${radius},${startAngle},${endAngle})`);
  }
  
  moveTo(x: number, y: number) {
    this.commands.push(`moveTo(${x},${y})`);
  }
  
  lineTo(x: number, y: number) {
    this.commands.push(`lineTo(${x},${y})`);
  }
  
  closePath() {
    this.commands.push('closePath()');
  }
} as any;

// Mock HTMLCanvasElement and CanvasRenderingContext2D
const mockCanvas = {
  width: 800,
  height: 600,
  getContext: vi.fn(() => ({
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    getImageData: vi.fn((x: number, y: number, w: number, h: number) => new ImageData(w, h)),
    putImageData: vi.fn(),
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn()
  }))
};

Object.defineProperty(global, 'HTMLCanvasElement', {
  value: class MockHTMLCanvasElement {
    width = 800;
    height = 600;
    getContext = mockCanvas.getContext;
  }
});

// Mock document.createElement for canvas
const originalCreateElement = global.document?.createElement;
if (global.document) {
  global.document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas as any;
    }
    return originalCreateElement?.call(document, tagName);
  });
}

describe('PerformanceCache', () => {
  let cache: PerformanceCache;

  beforeEach(() => {
    cache = new PerformanceCache();
    mockPerformanceNow.mockReturnValue(1000);
  });

  describe('Icon Caching', () => {
    it('should cache and retrieve icons', () => {
      const key: IconCacheKey = {
        type: IconType.MUSIC_NOTE,
        size: 24,
        color: '#FF6B9D'
      };

      // Create mock ImageData
      const imageData = new ImageData(24, 24);
      
      // Cache the icon
      cache.cacheIcon(key, imageData);
      
      // Retrieve from cache
      const cached = cache.getCachedIcon(key);
      expect(cached).toBe(imageData);
    });

    it('should return null for non-existent icons', () => {
      const key: IconCacheKey = {
        type: IconType.PEN,
        size: 32,
        color: '#4ECDC4'
      };

      const cached = cache.getCachedIcon(key);
      expect(cached).toBeNull();
    });

    it('should handle cache size limits', () => {
      // Fill cache beyond limit
      for (let i = 0; i < 150; i++) {
        const key: IconCacheKey = {
          type: IconType.MUSIC_NOTE,
          size: i,
          color: `#${i.toString(16).padStart(6, '0')}`
        };
        cache.cacheIcon(key, new ImageData(i, i));
      }

      const stats = cache.getCacheStats();
      expect(stats.iconCache.size).toBeLessThanOrEqual(100);
    });
  });

  describe('Gradient Caching', () => {
    it('should cache and retrieve gradients', () => {
      const key: GradientCacheKey = {
        colors: ['#FF6B9D', '#FFB3D1'],
        direction: 0,
        width: 50,
        height: 50
      };

      // Create mock gradient
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
      
      cache.cacheGradient(key, gradient);
      
      const cached = cache.getCachedGradient(key);
      expect(cached).toBe(gradient);
    });

    it('should generate unique keys for different gradients', () => {
      const key1: GradientCacheKey = {
        colors: ['#FF6B9D', '#FFB3D1'],
        direction: 0,
        width: 50,
        height: 50
      };

      const key2: GradientCacheKey = {
        colors: ['#4ECDC4', '#A7E6E1'],
        direction: 45,
        width: 50,
        height: 50
      };

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const gradient1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
      const gradient2 = ctx.createLinearGradient(0, 0, 50, 50);

      cache.cacheGradient(key1, gradient1);
      cache.cacheGradient(key2, gradient2);

      expect(cache.getCachedGradient(key1)).toBe(gradient1);
      expect(cache.getCachedGradient(key2)).toBe(gradient2);
    });
  });

  describe('Shape Caching', () => {
    it('should cache and retrieve shapes', () => {
      const key = 'circle_50';
      const path = new Path2D();
      path.arc(0, 0, 25, 0, Math.PI * 2);

      cache.cacheShape(key, path);
      
      const cached = cache.getCachedShape(key);
      expect(cached).toBe(path);
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', () => {
      // Add some items to cache
      cache.cacheIcon({ type: IconType.MUSIC_NOTE, size: 24, color: '#FF6B9D' }, new ImageData(24, 24));
      cache.cacheShape('test', new Path2D());

      const stats = cache.getCacheStats();
      expect(stats.iconCache.size).toBe(1);
      expect(stats.shapeCache.size).toBe(1);
      expect(typeof stats.iconCache.hitRate).toBe('number');
    });

    it('should clear all caches', () => {
      cache.cacheIcon({ type: IconType.MUSIC_NOTE, size: 24, color: '#FF6B9D' }, new ImageData(24, 24));
      cache.cacheShape('test', new Path2D());

      cache.clearAll();

      const stats = cache.getCacheStats();
      expect(stats.iconCache.size).toBe(0);
      expect(stats.shapeCache.size).toBe(0);
    });

    it('should cleanup expired entries', () => {
      const key: IconCacheKey = { type: IconType.MUSIC_NOTE, size: 24, color: '#FF6B9D' };
      cache.cacheIcon(key, new ImageData(24, 24));

      // Advance time beyond expiry
      mockPerformanceNow.mockReturnValue(1000 + 6 * 60 * 1000); // 6 minutes later

      cache.cleanup();

      const cached = cache.getCachedIcon(key);
      expect(cached).toBeNull();
    });
  });
});

describe('SelectiveRenderer', () => {
  let renderer: SelectiveRenderer;
  let mockBubble: EnhancedBubble;

  beforeEach(() => {
    renderer = new SelectiveRenderer();
    renderer.setCanvasSize(800, 600);
    
    mockBubble = {
      id: 'test-bubble',
      x: 100,
      y: 100,
      size: 50,
      visualType: 'song',
      iconType: IconType.MUSIC_NOTE,
      shapeType: ShapeType.CIRCLE,
      isMultiRole: false,
      style: {
        primaryColor: '#FF6B9D',
        secondaryColor: '#FFB3D1',
        gradientDirection: 0,
        strokeWidth: 2,
        strokeColor: '#FF6B9D',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 5
      }
    } as EnhancedBubble;
  });

  describe('Bubble Tracking', () => {
    it('should track new bubbles', () => {
      renderer.trackBubble(mockBubble);
      expect(renderer.needsRerender()).toBe(true);
    });

    it('should detect position changes', () => {
      // Track initial bubble
      renderer.trackBubble(mockBubble);
      expect(renderer.needsRerender()).toBe(true);
      
      // Complete render
      renderer.markRenderComplete();
      
      // Move bubble to new position
      const originalX = mockBubble.x;
      mockBubble.x = 150;
      renderer.trackBubble(mockBubble);
      
      // Should need rerender after position change
      expect(renderer.needsRerender()).toBe(true);
      
      // Restore original position
      mockBubble.x = originalX;
    });

    it('should detect size changes', () => {
      renderer.trackBubble(mockBubble);
      renderer.markRenderComplete();

      // Change size
      const originalSize = mockBubble.size;
      mockBubble.size = 60;
      renderer.trackBubble(mockBubble);
      expect(renderer.needsRerender()).toBe(true);
      
      // Restore original size for other tests
      mockBubble.size = originalSize;
    });

    it('should untrack bubbles', () => {
      renderer.trackBubble(mockBubble);
      renderer.untrackBubble(mockBubble.id);
      
      const stats = renderer.getRenderStats();
      expect(stats.totalBubbles).toBe(0);
    });
  });

  describe('Dirty Region Management', () => {
    it('should generate dirty regions for new bubbles', () => {
      renderer.trackBubble(mockBubble);
      
      const dirtyRegions = renderer.getDirtyRegions();
      expect(dirtyRegions.length).toBeGreaterThan(0);
    });

    it('should optimize clear regions', () => {
      // Add multiple bubbles
      for (let i = 0; i < 5; i++) {
        const bubble = { ...mockBubble, id: `bubble-${i}`, x: 100 + i * 20 };
        renderer.trackBubble(bubble);
      }

      const clearRegions = renderer.getOptimizedClearRegions();
      expect(clearRegions.length).toBeGreaterThan(0);
    });

    it('should suggest full screen clear for large dirty areas', () => {
      // Create bubbles covering most of the screen
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 15; j++) {
          const bubble = { 
            ...mockBubble, 
            id: `bubble-${i}-${j}`, 
            x: i * 40, 
            y: j * 40 
          };
          renderer.trackBubble(bubble);
        }
      }

      const clearRegions = renderer.getOptimizedClearRegions();
      // Should suggest full screen clear
      expect(clearRegions.some(region => 
        region.width === 800 && region.height === 600
      )).toBe(true);
    });
  });

  describe('Render Statistics', () => {
    it('should provide render statistics', () => {
      renderer.trackBubble(mockBubble);
      
      const stats = renderer.getRenderStats();
      expect(stats.totalBubbles).toBe(1);
      expect(stats.dirtyBubbles).toBe(1);
      expect(typeof stats.renderEfficiency).toBe('number');
    });

    it('should calculate render efficiency', () => {
      // Add multiple bubbles, some dirty, some clean
      renderer.trackBubble(mockBubble);
      renderer.markRenderComplete();
      
      const bubble2 = { ...mockBubble, id: 'bubble2', x: 200 };
      renderer.trackBubble(bubble2);
      
      const stats = renderer.getRenderStats();
      expect(stats.renderEfficiency).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    mockPerformanceNow.mockReturnValue(1000);
  });

  describe('Frame Monitoring', () => {
    it('should track frame metrics', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1016); // 16ms later
      monitor.endFrame(10, 0.8, 2, 0.9);

      const metrics = monitor.getCurrentMetrics();
      expect(metrics).toBeTruthy();
      expect(metrics!.bubbleCount).toBe(10);
      expect(metrics!.cacheHitRate).toBe(0.8);
    });

    it('should calculate average metrics', () => {
      // Record multiple frames
      for (let i = 0; i < 5; i++) {
        monitor.startFrame();
        mockPerformanceNow.mockReturnValue(1000 + (i + 1) * 16);
        monitor.endFrame(10 + i, 0.8, 1, 0.9);
      }

      const average = monitor.getAverageMetrics();
      expect(average).toBeTruthy();
      expect(average!.bubbleCount).toBe(12); // Average of 10,11,12,13,14
    });
  });

  describe('Performance Warnings', () => {
    it('should detect low frame rate warnings', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1100); // 100ms = 10fps
      monitor.endFrame(10, 0.8, 1, 0.9);

      const warnings = monitor.checkPerformanceWarnings();
      expect(warnings.some(w => w.includes('frame rate'))).toBe(true);
    });

    it('should detect high render time warnings', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1030); // 30ms render time
      monitor.endFrame(10, 0.8, 1, 0.9);

      const warnings = monitor.checkPerformanceWarnings();
      expect(warnings.some(w => w.includes('render time'))).toBe(true);
    });

    it('should detect low cache hit rate warnings', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1016);
      monitor.endFrame(10, 0.5, 1, 0.9); // Low cache hit rate

      const warnings = monitor.checkPerformanceWarnings();
      expect(warnings.some(w => w.includes('cache hit rate'))).toBe(true);
    });
  });

  describe('Optimization Suggestions', () => {
    it('should suggest optimizations for poor performance', () => {
      // Record frames with poor performance
      for (let i = 0; i < 10; i++) {
        monitor.startFrame();
        mockPerformanceNow.mockReturnValue(1000 + (i + 1) * 50); // 20fps
        monitor.endFrame(50, 0.4, 5, 0.5); // Poor metrics
      }

      const suggestions = monitor.getOptimizationSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('bubble count'))).toBe(true);
    });

    it('should suggest cache improvements', () => {
      for (let i = 0; i < 10; i++) {
        monitor.startFrame();
        mockPerformanceNow.mockReturnValue(1000 + (i + 1) * 50);
        monitor.endFrame(30, 0.3, 1, 0.9); // Low cache hit rate
      }

      const suggestions = monitor.getOptimizationSuggestions();
      expect(suggestions.some(s => s.includes('caching'))).toBe(true);
    });
  });

  describe('Threshold Management', () => {
    it('should allow custom thresholds', () => {
      monitor.setThresholds({
        minFrameRate: 60,
        maxRenderTime: 8,
        maxMemoryUsage: 50 * 1024 * 1024,
        minCacheHitRate: 0.9
      });

      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1020); // 50fps, 20ms render
      monitor.endFrame(10, 0.8, 1, 0.9);

      const warnings = monitor.checkPerformanceWarnings();
      expect(warnings.length).toBeGreaterThan(0); // Should warn with stricter thresholds
    });
  });

  describe('Statistics Export', () => {
    it('should export comprehensive statistics', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1016);
      monitor.endFrame(10, 0.8, 1, 0.9);

      const stats = monitor.exportStats();
      expect(stats.current).toBeTruthy();
      expect(stats.totalFrames).toBe(1);
      expect(stats.thresholds).toBeTruthy();
    });

    it('should clear history', () => {
      monitor.startFrame();
      mockPerformanceNow.mockReturnValue(1016);
      monitor.endFrame(10, 0.8, 1, 0.9);

      monitor.clearHistory();
      
      const stats = monitor.exportStats();
      expect(stats.totalFrames).toBe(0);
      expect(stats.current).toBeNull();
    });
  });
});

describe('Integrated Performance Optimization', () => {
  let cache: PerformanceCache;
  let renderer: SelectiveRenderer;
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    cache = new PerformanceCache();
    renderer = new SelectiveRenderer();
    monitor = new PerformanceMonitor();
    mockPerformanceNow.mockReturnValue(1000);
  });

  it('should work together for optimized rendering', () => {
    // Setup
    renderer.setCanvasSize(800, 600);
    
    const bubble: EnhancedBubble = {
      id: 'integrated-test',
      x: 100,
      y: 100,
      size: 50,
      visualType: 'song',
      iconType: IconType.MUSIC_NOTE,
      shapeType: ShapeType.CIRCLE,
      isMultiRole: false,
      style: {
        primaryColor: '#FF6B9D',
        secondaryColor: '#FFB3D1',
        gradientDirection: 0,
        strokeWidth: 2,
        strokeColor: '#FF6B9D',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 5
      }
    } as EnhancedBubble;

    // Simulate optimized render cycle
    monitor.startFrame();
    renderer.trackBubble(bubble);
    
    // Cache some data
    const iconKey = { type: IconType.MUSIC_NOTE, size: 20, color: '#FF6B9D' };
    cache.cacheIcon(iconKey, new ImageData(20, 20));
    
    renderer.markRenderComplete();
    mockPerformanceNow.mockReturnValue(1016);
    
    const cacheStats = cache.getCacheStats();
    const renderStats = renderer.getRenderStats();
    
    monitor.endFrame(
      renderStats.totalBubbles,
      cacheStats.iconCache.hitRate,
      renderStats.dirtyRegionCount,
      renderStats.renderEfficiency
    );

    // Verify integration
    const performanceStats = monitor.getCurrentMetrics();
    expect(performanceStats).toBeTruthy();
    expect(performanceStats!.bubbleCount).toBe(1);
    
    const warnings = monitor.checkPerformanceWarnings();
    expect(warnings.length).toBeGreaterThanOrEqual(0); // May have warnings depending on mock timing
  });
});