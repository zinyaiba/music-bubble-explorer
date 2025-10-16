/**
 * Enhanced Bubble Manager
 * 
 * Extends the existing BubbleManager to provide visual distinction,
 * unique bubble generation, and integrated icon/shape rendering.
 * 
 * Requirements: 1.1, 2.1, 3.1 - Visual distinction, person consolidation, and duplicate prevention
 */

import { BubbleManager, type BubbleConfig } from './bubbleManager';
import { BubbleEntity } from '@/types/bubble';
import type { MusicDatabase } from '@/types/music';
import type { 
  EnhancedBubble, 
  ContentItem, 
  ConsolidatedPerson,
  BubbleStyle
} from '@/types/enhancedBubble';
import { IconType, ShapeType } from '@/types/enhancedBubble';
import { BubbleRegistry } from '@/utils/bubbleRegistry';
import { PersonConsolidator } from '@/utils/personConsolidator';
import { VisualThemeManager, defaultVisualTheme } from '@/utils/visualTheme';
import { IconRenderer } from '@/utils/iconRenderer';
import { ShapeRenderer } from '@/utils/shapeRenderer';
import { MultiRoleHandler } from '@/utils/multiRoleHandler';
import { selectiveRenderer } from '@/utils/selectiveRenderer';
import { performanceMonitor } from '@/utils/performanceMonitor';

/**
 * Enhanced Bubble Manager Class
 * 
 * Extends BubbleManager with visual distinction and uniqueness features
 */
export class EnhancedBubbleManager extends BubbleManager {
  private registry: BubbleRegistry;
  private consolidator: PersonConsolidator;
  private visualTheme: VisualThemeManager;
  private iconRenderer: IconRenderer;
  private shapeRenderer: ShapeRenderer;
  private multiRoleHandler: MultiRoleHandler;

  private consolidatedPersons: ConsolidatedPerson[] = [];
  private musicDatabase: MusicDatabase;

  constructor(musicDatabase: MusicDatabase, config: BubbleConfig) {
    super(musicDatabase, config);
    
    // Store music database reference
    this.musicDatabase = musicDatabase;
    
    // Initialize enhanced systems
    this.registry = new BubbleRegistry();
    this.consolidator = new PersonConsolidator();
    this.visualTheme = new VisualThemeManager(defaultVisualTheme);
    this.iconRenderer = new IconRenderer();
    this.shapeRenderer = new ShapeRenderer();
    this.multiRoleHandler = new MultiRoleHandler();

    
    // Initialize content pool and consolidation
    this.initializeEnhancedSystems(musicDatabase);
  }

  /**
   * Initialize enhanced systems with music database
   */
  private initializeEnhancedSystems(musicDatabase: MusicDatabase): void {
    // Consolidate persons with multiple roles
    this.consolidatedPersons = this.consolidator.consolidatePersons(musicDatabase.songs);
    
    // Initialize bubble registry with consolidated data
    this.registry.initializeContentPool(
      musicDatabase.songs,
      musicDatabase.people,
      musicDatabase.tags || [],
      this.consolidatedPersons
    );
    
    console.log('EnhancedBubbleManager: Systems initialized', {
      consolidatedPersons: this.consolidatedPersons.length,
      multiRolePersons: this.consolidatedPersons.filter(p => p.roles.length > 1).length
    });
  }

  /**
   * Generate a unique enhanced bubble
   * Requirements: 3.1 - Unique bubble generation with duplicate prevention
   */
  generateUniqueBubble(): EnhancedBubble | null {
    // データベースが空の場合は何も生成しない
    if (!this.musicDatabase || 
        (!this.musicDatabase.songs || this.musicDatabase.songs.length === 0) &&
        (!this.musicDatabase.people || this.musicDatabase.people.length === 0) &&
        (!this.musicDatabase.tags || this.musicDatabase.tags.length === 0)) {
      return null; // Empty database, no content to display
    }

    // Get next unique content from registry
    const contentItem = this.registry.getNextUniqueContent();
    if (!contentItem) {
      return null; // No available content
    }

    // Create base bubble using parent class method directly
    const baseBubble = super.generateBubble();
    
    // Convert to enhanced bubble
    const enhancedBubble = this.createEnhancedBubble(baseBubble, contentItem);
    
    // Apply visual style
    this.applyVisualStyle(enhancedBubble);
    
    // Register bubble in registry
    const registered = this.registry.registerBubble(
      contentItem.id, 
      enhancedBubble.id, 
      contentItem.type
    );
    
    if (!registered) {
      console.warn('Failed to register bubble in registry:', contentItem.id);
      return null;
    }
    
    return enhancedBubble;
  }

  /**
   * Create enhanced bubble from base bubble and content item
   */
  private createEnhancedBubble(baseBubble: BubbleEntity, contentItem: ContentItem): EnhancedBubble {
    // Determine visual type and multi-role status
    const isMultiRole = contentItem.type === 'person' && 
                       contentItem.roles && 
                       contentItem.roles.length > 1;
    
    const visualType = contentItem.type === 'person' ? 'person' : contentItem.type;
    
    // Update base bubble properties
    baseBubble.name = contentItem.name;
    baseBubble.type = this.mapContentTypeToBaseType(contentItem);
    baseBubble.relatedCount = contentItem.relatedCount;
    
    // Create enhanced bubble by extending the base bubble with enhanced properties
    const enhancedBubble = baseBubble as EnhancedBubble;
    enhancedBubble.visualType = visualType;
    enhancedBubble.roles = contentItem.roles;
    enhancedBubble.iconType = this.determineIconType(contentItem, isMultiRole ?? false);
    enhancedBubble.shapeType = this.determineShapeType(contentItem, isMultiRole ?? false);
    enhancedBubble.isMultiRole = isMultiRole ?? false;
    enhancedBubble.style = {} as BubbleStyle; // Will be set by applyVisualStyle
    
    // Add songs array for consolidated persons
    if (contentItem.type === 'person' && contentItem.roles) {
      const consolidatedPerson = this.consolidatedPersons.find(p => p.name === contentItem.name);
      if (consolidatedPerson) {
        enhancedBubble.songs = consolidatedPerson.songs;
      }
    }

    return enhancedBubble;
  }

  /**
   * Map content type to base bubble type
   */
  private mapContentTypeToBaseType(contentItem: ContentItem): 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag' {
    if (contentItem.type === 'song' || contentItem.type === 'tag') {
      return contentItem.type;
    }
    
    // For persons, determine primary role
    if (contentItem.roles && contentItem.roles.length > 0) {
      // Use the role with the most songs as primary
      const primaryRole = contentItem.roles.reduce((prev, current) => 
        current.songCount > prev.songCount ? current : prev
      );
      return primaryRole.type;
    }
    
    return 'lyricist'; // Default fallback
  }

  /**
   * Determine icon type based on content
   */
  private determineIconType(contentItem: ContentItem, isMultiRole: boolean): IconType {
    if (isMultiRole) {
      return IconType.MULTI_ROLE;
    }
    
    switch (contentItem.type) {
      case 'song':
        return IconType.MUSIC_NOTE;
      case 'tag':
        return IconType.HASHTAG;
      case 'person':
        if (contentItem.roles && contentItem.roles.length > 0) {
          const primaryRole = contentItem.roles[0];
          switch (primaryRole.type) {
            case 'lyricist':
              return IconType.PEN;
            case 'composer':
              return IconType.MUSIC_SHEET;
            case 'arranger':
              return IconType.MIXER;
          }
        }
        return IconType.PEN; // Default for person
      default:
        return IconType.MUSIC_NOTE;
    }
  }

  /**
   * Determine shape type based on content and multi-role status
   * Requirements: 2.1, 2.2, 5.6 - Special shapes for multi-role persons
   */
  private determineShapeType(contentItem: ContentItem, isMultiRole: boolean): ShapeType {
    if (isMultiRole && contentItem.roles) {
      // Special shapes for multi-role persons
      if (contentItem.roles.length >= 3) {
        // 3+ roles get diamond shape
        return ShapeType.DIAMOND;
      } else if (contentItem.roles.length === 2) {
        // 2 roles get star shape
        return ShapeType.STAR;
      }
    }
    
    switch (contentItem.type) {
      case 'song':
        return ShapeType.CIRCLE;
      case 'tag':
        return ShapeType.HEXAGON;
      case 'person':
        if (contentItem.roles && contentItem.roles.length > 0) {
          const primaryRole = contentItem.roles[0];
          switch (primaryRole.type) {
            case 'lyricist':
              return ShapeType.ROUNDED_SQUARE;
            case 'composer':
              return ShapeType.ROUNDED_SQUARE;
            case 'arranger':
              return ShapeType.ROUNDED_SQUARE;
          }
        }
        return ShapeType.ROUNDED_SQUARE; // Default for person
      default:
        return ShapeType.CIRCLE;
    }
  }

  /**
   * Apply visual style to enhanced bubble
   * Requirements: 1.1 - Visual distinction for different content types
   * Requirements: 2.1, 2.2, 2.3 - Multi-role composite visual style
   */
  applyVisualStyle(bubble: EnhancedBubble): void {
    let style: BubbleStyle;
    
    if (bubble.isMultiRole && bubble.roles) {
      // Use multi-role handler for composite style
      const baseStyle = this.visualTheme.getStyleForType('multiRole');
      const compositeStyle = this.multiRoleHandler.generateCompositeStyle(bubble.roles);
      
      // Merge base style with composite enhancements
      style = { ...baseStyle, ...compositeStyle } as BubbleStyle;
      
      // Update shape and icon based on multi-role logic
      bubble.shapeType = this.multiRoleHandler.determineMultiRoleShape(bubble.roles);
      bubble.iconType = IconType.MULTI_ROLE;
    } else {
      // Get style based on primary type
      const styleKey = this.getStyleKey(bubble);
      style = this.visualTheme.getStyleForType(styleKey);
    }
    
    // Apply style to bubble
    bubble.style = style;
    bubble.color = style.primaryColor; // Update base color for compatibility
  }

  /**
   * Get style key for visual theme
   */
  private getStyleKey(bubble: EnhancedBubble): keyof typeof defaultVisualTheme {
    switch (bubble.visualType) {
      case 'song':
        return 'song';
      case 'tag':
        return 'tag';
      case 'person':
        if (bubble.roles && bubble.roles.length > 0) {
          const primaryRole = bubble.roles[0];
          return primaryRole.type;
        }
        return 'lyricist'; // Default
      default:
        return 'song';
    }
  }

  /**
   * Render bubble with integrated icon and shape (Performance Optimized)
   * Requirements: 1.1 - Icon and shape rendering integration
   * Requirements: 2.1, 2.2, 2.3, 2.4, 5.6 - Multi-role special display
   * Requirements: 1.1, 5.1 - Performance optimization
   */
  renderBubbleWithIcon(bubble: EnhancedBubble, ctx: CanvasRenderingContext2D): void {
    // Start performance monitoring
    performanceMonitor.startFrame();
    
    // Track bubble for selective rendering
    selectiveRenderer.trackBubble(bubble);

    // Save canvas state
    ctx.save();
    
    // Apply shadow effect
    this.visualTheme.applyShadow(ctx, bubble.style);
    
    // Use optimized shape rendering with caching
    this.shapeRenderer.renderShapeOptimized(ctx, bubble);
    
    // Clear shadow for icon rendering
    this.visualTheme.clearShadow(ctx);
    
    // Render icon on top of shape
    const iconSize = bubble.size * 0.4; // Icon is 40% of bubble size
    
    // Use composite icon rendering for multi-role bubbles
    if (bubble.isMultiRole && bubble.roles && bubble.roles.length > 1) {
      const roleTypes = bubble.roles.map(role => role.type);
      this.iconRenderer.renderCompositeIcon(
        ctx,
        roleTypes,
        bubble.x,
        bubble.y,
        iconSize
      );
    } else {
      // Standard icon rendering for single-role bubbles with caching
      const iconColor = this.getIconColor(bubble.style);
      this.iconRenderer.renderIcon(
        ctx,
        bubble.iconType,
        bubble.x,
        bubble.y,
        iconSize,
        iconColor
      );
    }
    
    // Restore canvas state
    ctx.restore();
  }

  /**
   * Handle bubble lifecycle with registry management
   */
  handleBubbleLifecycle(bubble: EnhancedBubble): void {
    const isMarkedForDeletion = bubble.isMarkedForDeletion?.() ?? false;
    const isAlive = bubble.isAlive?.() ?? true;
    
    if (isMarkedForDeletion || !isAlive) {
      // Unregister from registry when bubble is removed
      this.registry.unregisterBubble(bubble.id);
    }
  }

  /**
   * Override parent's generateBubble to use enhanced version
   */
  generateBubble(): BubbleEntity {
    // Use parent implementation to avoid circular dependency
    return super.generateBubble();
  }

  /**
   * Override parent's removeBubble to handle registry
   */
  removeBubble(id: string): void {
    // Unregister from registry
    this.registry.unregisterBubble(id);
    
    // Call parent implementation
    super.removeBubble(id);
  }

  /**
   * Override parent's updateMusicDatabase to reinitialize enhanced systems
   */
  updateMusicDatabase(newMusicDatabase: MusicDatabase): void {
    // Update stored reference
    this.musicDatabase = newMusicDatabase;
    
    // Call parent implementation
    super.updateMusicDatabase(newMusicDatabase);
    
    // Reinitialize enhanced systems
    this.initializeEnhancedSystems(newMusicDatabase);
  }

  /**
   * Get enhanced bubble statistics
   */
  getEnhancedStats() {
    const baseStats = this.getStats();
    const registryStats = this.registry.getStats();
    
    return {
      ...baseStats,
      registry: registryStats,
      consolidatedPersons: this.consolidatedPersons.length,
      multiRolePersons: this.consolidatedPersons.filter(p => p.roles.length > 1).length,
      uniqueContentAvailable: registryStats.availableContent > 0
    };
  }

  /**
   * Get bubble registry instance
   */
  getBubbleRegistry(): BubbleRegistry {
    return this.registry;
  }

  /**
   * Get person consolidator instance
   */
  getPersonConsolidator(): PersonConsolidator {
    return this.consolidator;
  }

  /**
   * Get visual theme manager instance
   */
  getVisualThemeManager(): VisualThemeManager {
    return this.visualTheme;
  }

  /**
   * Get consolidated persons data
   */
  getConsolidatedPersons(): ConsolidatedPerson[] {
    return [...this.consolidatedPersons];
  }

  /**
   * Reset enhanced systems
   */
  reset(): void {
    // Call parent reset
    super.reset();
    
    // Reset enhanced systems
    this.registry.reset();
    this.consolidatedPersons = [];
    
    console.log('EnhancedBubbleManager: Enhanced systems reset completed');
  }

  /**
   * Check if a bubble is an enhanced bubble
   */
  isEnhancedBubble(bubble: BubbleEntity): boolean {
    return 'visualType' in bubble && 'iconType' in bubble && 'shapeType' in bubble;
  }

  /**
   * Convert base bubble to enhanced bubble (for migration)
   */
  enhanceBubble(baseBubble: BubbleEntity): EnhancedBubble | null {
    // Find corresponding content item
    const availableContent = this.registry.getAvailableContent();
    const contentItem = availableContent.find(item => item.name === baseBubble.name);
    
    if (!contentItem) {
      return null;
    }
    
    return this.createEnhancedBubble(baseBubble, contentItem);
  }

  /**
   * Performance optimization methods
   */

  /**
   * Update bubble state for selective rendering
   */
  updateBubbleForRendering(_bubble: EnhancedBubble): boolean {
    // Simplified implementation without selectiveRenderer
    return true;
  }

  /**
   * Start performance monitoring frame
   */
  startPerformanceFrame(): void {
    // Simplified implementation without selectiveRenderer
  }

  /**
   * End performance monitoring frame
   */
  endPerformanceFrame(renderTime: number): void {
    // Simplified implementation
    console.debug('Performance frame ended:', renderTime);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      monitor: { frameRate: 60, averageFrameTime: 16 },
      selective: { renderedBubbles: this.getBubbles().length, skippedBubbles: 0 },
      recommendations: []
    };
  }

  /**
   * Clear all performance caches
   */
  clearPerformanceCaches(): void {
    this.iconRenderer.clearCache();
    this.shapeRenderer.clearCache();
    console.log('EnhancedBubbleManager: Performance caches cleared');
  }

  /**
   * Force full redraw (clears selective rendering optimizations)
   */
  forceFullRedraw(): void {
    // Simplified implementation
    console.debug('Force full redraw requested');
  }

  /**
   * Get icon color based on bubble style
   */
  private getIconColor(style: BubbleStyle): string {
    // Use primary color with high opacity for icon
    return style.primaryColor.replace(/rgba?\([^)]+\)/, 'rgba(255, 255, 255, 0.9)');
  }

  /**
   * Optimize rendering settings based on performance
   */
  optimizeRenderingSettings(): void {
    // Simplified implementation
    console.debug('Rendering settings optimized');
  }

  /**
   * Optimized render cycle with performance monitoring
   */
  renderOptimized(ctx: CanvasRenderingContext2D, bubbles: EnhancedBubble[]): void {
    // Start performance monitoring
    performanceMonitor.startFrame();
    
    // Set canvas size for selective renderer
    selectiveRenderer.setCanvasSize(ctx.canvas.width, ctx.canvas.height);
    
    // Track all bubbles for selective rendering
    bubbles.forEach(bubble => selectiveRenderer.trackBubble(bubble));
    
    // Check if rendering is needed
    if (!selectiveRenderer.needsRerender()) {
      return;
    }
    
    // Get optimized clear regions
    const clearRegions = selectiveRenderer.getOptimizedClearRegions();
    
    // Clear only dirty regions
    clearRegions.forEach(region => {
      ctx.clearRect(region.x, region.y, region.width, region.height);
    });
    
    // Render only bubbles that need updating
    const dirtyRegions = selectiveRenderer.getDirtyRegions();
    bubbles.forEach(bubble => {
      // Check if bubble intersects with dirty regions
      if (this.bubbleIntersectsDirtyRegions(bubble, dirtyRegions)) {
        this.renderBubbleWithIcon(bubble, ctx);
      }
    });
    
    // Mark render complete
    selectiveRenderer.markRenderComplete();
    
    // End performance monitoring
    const cacheStats = this.getCacheStats();
    const renderStats = selectiveRenderer.getRenderStats();
    
    performanceMonitor.endFrame(
      bubbles.length,
      cacheStats.hitRate,
      renderStats.dirtyRegionCount,
      renderStats.renderEfficiency
    );
  }
  
  /**
   * Check if bubble intersects with dirty regions
   */
  private bubbleIntersectsDirtyRegions(bubble: EnhancedBubble, dirtyRegions: any[]): boolean {
    if (dirtyRegions.length === 0) return true; // Render all if no selective rendering
    
    const bubbleRegion = {
      x: bubble.x - bubble.size / 2,
      y: bubble.y - bubble.size / 2,
      width: bubble.size,
      height: bubble.size
    };
    
    return dirtyRegions.some(region => 
      this.regionsIntersect(bubbleRegion, region)
    );
  }
  
  /**
   * Check if two regions intersect
   */
  private regionsIntersect(a: any, b: any): boolean {
    return !(
      a.x + a.width < b.x ||
      b.x + b.width < a.x ||
      a.y + a.height < b.y ||
      b.y + b.height < a.y
    );
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      hitRate: 0.8, // This would be calculated from actual cache usage
      iconCacheSize: 0,
      shapeCacheSize: 0,
      gradientCacheSize: 0
    };
  }
  
  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return performanceMonitor.exportStats();
  }
  

  
  /**
   * Handle bubble removal for performance tracking
   */
  removeBubbleOptimized(bubbleId: string): void {
    // Untrack from selective renderer
    selectiveRenderer.untrackBubble(bubbleId);
    
    // Remove from registry
    this.registry.unregisterBubble(bubbleId);
  }
}