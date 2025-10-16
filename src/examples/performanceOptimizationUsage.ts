/**
 * Performance Optimization Usage Examples
 * 
 * Demonstrates how to use the performance optimization system
 * for enhanced bubble rendering with caching and selective rendering.
 */

import { performanceCache, IconCacheKey, GradientCacheKey } from '../utils/performanceCache';
import { selectiveRenderer } from '../utils/selectiveRenderer';
import { performanceMonitor } from '../utils/performanceMonitor';
import { iconRenderer } from '../utils/iconRenderer';
import { shapeRenderer } from '../utils/shapeRenderer';
import { EnhancedBubble, IconType, ShapeType } from '../types/enhancedBubble';

/**
 * Example 1: Basic Performance Cache Usage
 */
export function demonstratePerformanceCache() {
  console.log('=== Performance Cache Demo ===');
  
  // Icon caching example
  const iconKey: IconCacheKey = {
    type: IconType.MUSIC_NOTE,
    size: 24,
    color: '#FF6B9D'
  };
  
  // Create a canvas for icon generation
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d')!;
  
  // Generate icon and cache it
  iconRenderer.renderIcon(ctx, IconType.MUSIC_NOTE, 12, 12, 24, '#FF6B9D');
  const imageData = ctx.getImageData(0, 0, 24, 24);
  performanceCache.cacheIcon(iconKey, imageData);
  
  // Retrieve from cache
  const cachedIcon = performanceCache.getCachedIcon(iconKey);
  console.log('Icon cached successfully:', cachedIcon !== null);
  
  // Gradient caching example
  const gradientKey: GradientCacheKey = {
    colors: ['#FF6B9D', '#FFB3D1'],
    direction: 0,
    width: 50,
    height: 50
  };
  
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
  gradient.addColorStop(0, '#FF6B9D');
  gradient.addColorStop(1, '#FFB3D1');
  performanceCache.cacheGradient(gradientKey, gradient);
  
  const cachedGradient = performanceCache.getCachedGradient(gradientKey);
  console.log('Gradient cached successfully:', cachedGradient !== null);
  
  // Cache statistics
  const stats = performanceCache.getCacheStats();
  console.log('Cache Statistics:', stats);
}

/**
 * Example 2: Selective Rendering Usage
 */
export function demonstrateSelectiveRendering() {
  console.log('=== Selective Rendering Demo ===');
  
  // Set canvas size
  selectiveRenderer.setCanvasSize(800, 600);
  
  // Create sample bubbles
  const bubbles: EnhancedBubble[] = [
    {
      id: 'bubble1',
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
    } as EnhancedBubble,
    {
      id: 'bubble2',
      x: 200,
      y: 150,
      size: 60,
      visualType: 'person',
      iconType: IconType.PEN,
      shapeType: ShapeType.ROUNDED_SQUARE,
      isMultiRole: false,
      style: {
        primaryColor: '#4ECDC4',
        secondaryColor: '#A7E6E1',
        gradientDirection: 45,
        strokeWidth: 2,
        strokeColor: '#4ECDC4',
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 5
      }
    } as EnhancedBubble
  ];
  
  // Track bubbles
  bubbles.forEach(bubble => selectiveRenderer.trackBubble(bubble));
  
  console.log('Needs rerender:', selectiveRenderer.needsRerender());
  
  // Simulate bubble movement
  bubbles[0].x = 110;
  bubbles[0].y = 105;
  selectiveRenderer.trackBubble(bubbles[0]);
  
  console.log('After movement - Needs rerender:', selectiveRenderer.needsRerender());
  
  // Get dirty regions
  const dirtyRegions = selectiveRenderer.getDirtyRegions();
  console.log('Dirty regions:', dirtyRegions.length);
  
  // Get render statistics
  const renderStats = selectiveRenderer.getRenderStats();
  console.log('Render Statistics:', renderStats);
  
  // Mark render complete
  selectiveRenderer.markRenderComplete();
  console.log('After render complete - Needs rerender:', selectiveRenderer.needsRerender());
}

/**
 * Example 3: Performance Monitoring Usage
 */
export function demonstratePerformanceMonitoring() {
  console.log('=== Performance Monitoring Demo ===');
  
  // Set performance thresholds
  performanceMonitor.setThresholds({
    minFrameRate: 30,
    maxRenderTime: 16.67,
    maxMemoryUsage: 100 * 1024 * 1024,
    minCacheHitRate: 0.7
  });
  
  // Simulate rendering frames
  for (let i = 0; i < 10; i++) {
    performanceMonitor.startFrame();
    
    // Simulate some work
    const startTime = performance.now();
    
    // Simulate rendering work (sleep equivalent)
    while (performance.now() - startTime < Math.random() * 20) {
      // Busy wait to simulate work
    }
    
    performanceMonitor.endFrame(
      Math.floor(Math.random() * 50) + 10, // bubbleCount
      Math.random() * 0.5 + 0.5, // cacheHitRate
      Math.floor(Math.random() * 5), // dirtyRegionCount
      Math.random() * 0.3 + 0.7 // renderEfficiency
    );
  }
  
  // Get current metrics
  const currentMetrics = performanceMonitor.getCurrentMetrics();
  console.log('Current Metrics:', currentMetrics);
  
  // Get average metrics
  const averageMetrics = performanceMonitor.getAverageMetrics();
  console.log('Average Metrics:', averageMetrics);
  
  // Check for warnings
  const warnings = performanceMonitor.checkPerformanceWarnings();
  console.log('Performance Warnings:', warnings);
  
  // Get optimization suggestions
  const suggestions = performanceMonitor.getOptimizationSuggestions();
  console.log('Optimization Suggestions:', suggestions);
  
  // Export full stats
  const fullStats = performanceMonitor.exportStats();
  console.log('Full Performance Stats:', fullStats);
}

/**
 * Example 4: Integrated Performance Optimization
 */
export function demonstrateIntegratedOptimization() {
  console.log('=== Integrated Performance Optimization Demo ===');
  
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d')!;
  
  // Create sample enhanced bubble
  const bubble: EnhancedBubble = {
    id: 'optimized-bubble',
    x: 400,
    y: 300,
    size: 80,
    visualType: 'person',
    iconType: IconType.MULTI_ROLE,
    shapeType: ShapeType.STAR,
    isMultiRole: true,
    roles: [
      { type: 'lyricist', songCount: 5 },
      { type: 'composer', songCount: 3 }
    ],
    style: {
      primaryColor: '#FF6B9D',
      secondaryColor: '#4ECDC4',
      gradientDirection: 135,
      strokeWidth: 3,
      strokeColor: '#333',
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 8
    }
  } as EnhancedBubble;
  
  // Performance optimized rendering
  performanceMonitor.startFrame();
  selectiveRenderer.setCanvasSize(800, 600);
  selectiveRenderer.trackBubble(bubble);
  
  // Render with optimized shape renderer
  shapeRenderer.renderShapeOptimized(ctx, bubble);
  
  // Render with cached icon
  const iconSize = bubble.size * 0.4;
  if (bubble.isMultiRole && bubble.roles) {
    const roleTypes = bubble.roles.map(role => role.type);
    iconRenderer.renderCompositeIcon(ctx, roleTypes, bubble.x, bubble.y, iconSize);
  }
  
  selectiveRenderer.markRenderComplete();
  
  performanceMonitor.endFrame(
    1, // bubbleCount
    0.9, // cacheHitRate (simulated)
    1, // dirtyRegionCount
    1.0 // renderEfficiency
  );
  
  console.log('Optimized rendering completed');
  console.log('Performance stats:', performanceMonitor.getCurrentMetrics());
}

/**
 * Example 5: Cache Management and Cleanup
 */
export function demonstrateCacheManagement() {
  console.log('=== Cache Management Demo ===');
  
  // Fill cache with some data
  for (let i = 0; i < 10; i++) {
    const iconKey: IconCacheKey = {
      type: IconType.MUSIC_NOTE,
      size: 20 + i * 2,
      color: `hsl(${i * 36}, 70%, 50%)`
    };
    
    // Create dummy image data
    const canvas = document.createElement('canvas');
    canvas.width = iconKey.size;
    canvas.height = iconKey.size;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, iconKey.size, iconKey.size);
    
    performanceCache.cacheIcon(iconKey, imageData);
  }
  
  console.log('Cache stats after filling:', performanceCache.getCacheStats());
  
  // Cleanup old entries
  performanceCache.cleanup();
  console.log('Cache stats after cleanup:', performanceCache.getCacheStats());
  
  // Clear all caches
  performanceCache.clearAll();
  selectiveRenderer.clearCache();
  performanceMonitor.clearHistory();
  
  console.log('All caches cleared');
  console.log('Final cache stats:', performanceCache.getCacheStats());
}

/**
 * Run all performance optimization examples
 */
export function runAllPerformanceExamples() {
  console.log('Running Performance Optimization Examples...\n');
  
  demonstratePerformanceCache();
  console.log('\n');
  
  demonstrateSelectiveRendering();
  console.log('\n');
  
  demonstratePerformanceMonitoring();
  console.log('\n');
  
  demonstrateIntegratedOptimization();
  console.log('\n');
  
  demonstrateCacheManagement();
  console.log('\nAll performance optimization examples completed!');
}

// Export for use in other modules
export {
  performanceCache,
  selectiveRenderer,
  performanceMonitor,
  iconRenderer,
  shapeRenderer
};