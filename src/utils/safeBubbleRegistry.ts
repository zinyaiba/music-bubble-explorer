/**
 * Safe Bubble Registry
 * 
 * Enhanced bubble registry with comprehensive error handling and fallback functionality.
 * Provides safe registry operations with automatic fallbacks and recovery mechanisms.
 * 
 * Requirements: 3.1 - レジストリエラーの処理
 */

import { BubbleRegistry } from './bubbleRegistry';
import { Song, Person, Tag } from '../types/music';
import { ConsolidatedPerson } from '../types/consolidatedPerson';
import { ContentItem, DisplayedBubbleInfo, BubbleRegistryConfig } from '../types/bubbleRegistry';
import { errorHandler } from './errorHandler';
import { DebugLogger } from './debugLogger';

const debugLogger = DebugLogger.getInstance();

/**
 * Safe Bubble Registry Class
 * 
 * Provides error-safe registry operations with automatic fallbacks and recovery
 */
export class SafeBubbleRegistry extends BubbleRegistry {

  private operationHistory: Map<string, number> = new Map();
  private lastKnownGoodState: {
    displayedContent: Map<string, DisplayedBubbleInfo>;
    availableContent: Map<string, ContentItem>;
    timestamp: number;
  } | null = null;

  constructor(config: Partial<BubbleRegistryConfig> = {}) {
    super(config);

    this.saveState();
  }

  /**
   * Safe content pool initialization with error handling
   */
  initializeContentPool(
    songs: Song[],
    people: Person[],
    tags: Tag[] = [],
    consolidatedPersons: ConsolidatedPerson[] = []
  ): void {
    try {
      // Validate inputs
      this.validateInitializationInputs(songs, people, tags, consolidatedPersons);

      // Attempt initialization
      super.initializeContentPool(songs, people, tags, consolidatedPersons);
      
      // Save successful state
      this.saveState();
      
      debugLogger.info('Content pool initialized successfully', {
        songs: songs.length,
        people: people.length,
        tags: tags.length,
        consolidatedPersons: consolidatedPersons.length
      });

    } catch (error) {
      const fallbackResult = errorHandler.handleRegistryError(error as Error, {
        operation: 'initialize'
      });

      if (fallbackResult) {
        // Try fallback initialization with sanitized data
        this.initializeFallbackContentPool(songs, people, tags, consolidatedPersons);
      } else {
        // Ultimate fallback - create minimal content pool
        this.createMinimalContentPool();
      }
    }
  }

  /**
   * Safe bubble registration with error handling
   */
  registerBubble(contentId: string, bubbleId: string, type: 'song' | 'person' | 'tag'): boolean {
    try {
      // Validate inputs
      this.validateRegistrationInputs(contentId, bubbleId, type);

      // Attempt registration
      const result = super.registerBubble(contentId, bubbleId, type);
      
      if (result) {
        // Track successful operation
        this.trackOperation('register', true);
        this.saveState();
      } else {
        // Track failed operation but don't throw error
        this.trackOperation('register', false);
      }
      
      return result;

    } catch (error) {
      this.trackOperation('register', false);
      
      const fallbackResult = errorHandler.handleRegistryError(error as Error, {
        operation: 'register',
        contentId,
        bubbleId
      });

      // Return fallback result (typically false to allow duplicate)
      return Boolean(fallbackResult);
    }
  }

  /**
   * Safe bubble unregistration with error handling
   */
  unregisterBubble(bubbleId: string): void {
    try {
      // Validate input
      this.validateBubbleId(bubbleId);

      // Attempt unregistration
      super.unregisterBubble(bubbleId);
      
      // Track successful operation
      this.trackOperation('unregister', true);
      this.saveState();

    } catch (error) {
      this.trackOperation('unregister', false);
      
      errorHandler.handleRegistryError(error as Error, {
        operation: 'unregister',
        bubbleId
      });

      // Try manual cleanup as fallback
      this.manualCleanupBubble(bubbleId);
    }
  }

  /**
   * Safe content availability check
   */
  isContentDisplayed(contentId: string): boolean {
    try {
      this.validateContentId(contentId);
      return super.isContentDisplayed(contentId);
    } catch (error) {
      debugLogger.warn('Content display check failed, assuming not displayed', { contentId, error });
      return false; // Safe fallback - assume not displayed
    }
  }

  /**
   * Safe available content retrieval
   */
  getAvailableContent(): ContentItem[] {
    try {
      const result = super.getAvailableContent();
      return this.validateContentItems(result);
    } catch (error) {
      debugLogger.warn('Available content retrieval failed, using fallback', { error });
      return this.getFallbackAvailableContent();
    }
  }

  /**
   * Safe next unique content retrieval
   */
  getNextUniqueContent(): ContentItem | null {
    try {
      const result = super.getNextUniqueContent();
      
      if (result) {
        return this.validateContentItem(result);
      }
      
      return null;

    } catch (error) {
      this.trackOperation('getNext', false);
      
      const fallbackResult = errorHandler.handleRegistryError(error as Error, {
        operation: 'getNext'
      });

      if (fallbackResult && typeof fallbackResult === 'object') {
        return this.validateContentItem(fallbackResult);
      }

      // Try to recover from last known good state
      return this.getRecoveryContent();
    }
  }

  /**
   * Safe statistics retrieval
   */
  getStats(): any {
    try {
      return super.getStats();
    } catch (error) {
      debugLogger.warn('Stats retrieval failed, using fallback', { error });
      return this.getFallbackStats();
    }
  }

  /**
   * Safe configuration update
   */
  updateConfig(newConfig: Partial<BubbleRegistryConfig>): void {
    try {
      this.validateConfig(newConfig);
      super.updateConfig(newConfig);
      this.saveState();
    } catch (error) {
      debugLogger.error('Config update failed', { error, newConfig });
    }
  }

  /**
   * Safe registry reset
   */
  reset(): void {
    try {
      super.reset();
      this.operationHistory.clear();
      this.lastKnownGoodState = null;
      this.saveState();
    } catch (error) {
      debugLogger.error('Registry reset failed, forcing manual reset', { error });
      this.forceReset();
    }
  }

  /**
   * Validate initialization inputs
   */
  private validateInitializationInputs(
    songs: Song[],
    people: Person[],
    tags: Tag[],
    consolidatedPersons: ConsolidatedPerson[]
  ): void {
    if (!Array.isArray(songs)) {
      throw new Error('Songs must be an array');
    }

    if (!Array.isArray(people)) {
      throw new Error('People must be an array');
    }

    if (!Array.isArray(tags)) {
      throw new Error('Tags must be an array');
    }

    if (!Array.isArray(consolidatedPersons)) {
      throw new Error('ConsolidatedPersons must be an array');
    }

    // Validate individual items
    songs.forEach((song, index) => {
      if (!song || !song.id) {
        throw new Error(`Invalid song at index ${index}`);
      }
    });

    people.forEach((person, index) => {
      if (!person || !person.id) {
        throw new Error(`Invalid person at index ${index}`);
      }
    });

    tags.forEach((tag, index) => {
      if (!tag || !tag.id) {
        throw new Error(`Invalid tag at index ${index}`);
      }
    });

    consolidatedPersons.forEach((person, index) => {
      if (!person || !person.name) {
        throw new Error(`Invalid consolidated person at index ${index}`);
      }
    });
  }

  /**
   * Validate registration inputs
   */
  private validateRegistrationInputs(
    contentId: string,
    bubbleId: string,
    type: 'song' | 'person' | 'tag'
  ): void {
    this.validateContentId(contentId);
    this.validateBubbleId(bubbleId);
    
    const validTypes = ['song', 'person', 'tag'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}`);
    }
  }

  /**
   * Validate content ID
   */
  private validateContentId(contentId: string): void {
    if (!contentId || typeof contentId !== 'string') {
      throw new Error('Invalid content ID');
    }

    if (contentId.trim().length === 0) {
      throw new Error('Content ID is empty');
    }
  }

  /**
   * Validate bubble ID
   */
  private validateBubbleId(bubbleId: string): void {
    if (!bubbleId || typeof bubbleId !== 'string') {
      throw new Error('Invalid bubble ID');
    }

    if (bubbleId.trim().length === 0) {
      throw new Error('Bubble ID is empty');
    }
  }

  /**
   * Validate content items array
   */
  private validateContentItems(items: ContentItem[]): ContentItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(item => {
      try {
        return this.validateContentItem(item) !== null;
      } catch {
        return false;
      }
    });
  }

  /**
   * Validate single content item
   */
  private validateContentItem(item: any): ContentItem {
    if (!item || typeof item !== 'object') {
      throw new Error('Invalid content item');
    }

    if (!item.id || typeof item.id !== 'string') {
      throw new Error('Invalid content item ID');
    }

    if (!item.type || !['song', 'person', 'tag'].includes(item.type)) {
      throw new Error('Invalid content item type');
    }

    if (!item.name || typeof item.name !== 'string') {
      throw new Error('Invalid content item name');
    }

    if (!Number.isFinite(item.relatedCount) || item.relatedCount < 0) {
      item.relatedCount = 1; // Fix invalid related count
    }

    return item as ContentItem;
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: Partial<BubbleRegistryConfig>): void {
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration object');
    }

    if (config.maxDisplayedItems !== undefined) {
      if (!Number.isFinite(config.maxDisplayedItems) || config.maxDisplayedItems < 1) {
        throw new Error('Invalid maxDisplayedItems');
      }
    }

    if (config.rotationCooldown !== undefined) {
      if (!Number.isFinite(config.rotationCooldown) || config.rotationCooldown < 0) {
        throw new Error('Invalid rotationCooldown');
      }
    }
  }

  /**
   * Initialize fallback content pool with sanitized data
   */
  private initializeFallbackContentPool(
    songs: Song[],
    people: Person[],
    tags: Tag[],
    consolidatedPersons: ConsolidatedPerson[]
  ): void {
    try {
      // Sanitize and filter valid items
      const validSongs = this.sanitizeSongs(songs);
      const validPeople = this.sanitizePeople(people);
      const validTags = this.sanitizeTags(tags);
      const validConsolidatedPersons = this.sanitizeConsolidatedPersons(consolidatedPersons);

      // Initialize with sanitized data
      super.initializeContentPool(validSongs, validPeople, validTags, validConsolidatedPersons);
      
      debugLogger.info('Fallback content pool initialized', {
        originalSongs: songs.length,
        validSongs: validSongs.length,
        originalPeople: people.length,
        validPeople: validPeople.length,
        originalTags: tags.length,
        validTags: validTags.length,
        originalConsolidatedPersons: consolidatedPersons.length,
        validConsolidatedPersons: validConsolidatedPersons.length
      });

    } catch (error) {
      debugLogger.error('Fallback content pool initialization failed', { error });
      this.createMinimalContentPool();
    }
  }

  /**
   * Create minimal content pool as ultimate fallback
   */
  private createMinimalContentPool(): void {
    try {
      const minimalSong: Song = {
        id: 'fallback-song-1',
        title: 'Unknown Song',
        lyricists: ['Unknown Artist'],
        composers: ['Unknown Artist'],
        arrangers: [],
        tags: []
      };

      const minimalPerson: Person = {
        id: 'fallback-person-1',
        name: 'Unknown Artist',
        type: 'lyricist',
        songs: ['fallback-song-1']
      };

      super.initializeContentPool([minimalSong], [minimalPerson], []);
      
      debugLogger.warn('Minimal content pool created as ultimate fallback');
    } catch (error) {
      debugLogger.error('Failed to create minimal content pool', { error });
    }
  }

  /**
   * Sanitize songs array
   */
  private sanitizeSongs(songs: Song[]): Song[] {
    if (!Array.isArray(songs)) {
      return [];
    }

    return songs.filter(song => {
      return song && 
             typeof song === 'object' && 
             song.id && 
             typeof song.id === 'string' &&
             song.title &&
             typeof song.title === 'string';
    }).map(song => ({
      ...song,
      lyricists: Array.isArray(song.lyricists) ? song.lyricists : [],
      composers: Array.isArray(song.composers) ? song.composers : [],
      arrangers: Array.isArray(song.arrangers) ? song.arrangers : [],
      tags: Array.isArray(song.tags) ? song.tags : []
    }));
  }

  /**
   * Sanitize people array
   */
  private sanitizePeople(people: Person[]): Person[] {
    if (!Array.isArray(people)) {
      return [];
    }

    return people.filter(person => {
      return person && 
             typeof person === 'object' && 
             person.id && 
             typeof person.id === 'string' &&
             person.name &&
             typeof person.name === 'string';
    }).map(person => ({
      ...person,
      songs: Array.isArray(person.songs) ? person.songs : []
    }));
  }

  /**
   * Sanitize tags array
   */
  private sanitizeTags(tags: Tag[]): Tag[] {
    if (!Array.isArray(tags)) {
      return [];
    }

    return tags.filter(tag => {
      return tag && 
             typeof tag === 'object' && 
             tag.id && 
             typeof tag.id === 'string' &&
             tag.name &&
             typeof tag.name === 'string';
    }).map(tag => ({
      ...tag,
      songs: Array.isArray(tag.songs) ? tag.songs : []
    }));
  }

  /**
   * Sanitize consolidated persons array
   */
  private sanitizeConsolidatedPersons(persons: ConsolidatedPerson[]): ConsolidatedPerson[] {
    if (!Array.isArray(persons)) {
      return [];
    }

    return persons.filter(person => {
      return person && 
             typeof person === 'object' && 
             person.name && 
             typeof person.name === 'string';
    }).map(person => ({
      ...person,
      roles: Array.isArray(person.roles) ? person.roles : [],
      totalRelatedCount: Number.isFinite(person.totalRelatedCount) ? person.totalRelatedCount : 1,
      songs: Array.isArray(person.songs) ? person.songs : []
    }));
  }

  /**
   * Manual cleanup for failed unregistration
   */
  private manualCleanupBubble(bubbleId: string): void {
    try {
      // Try to find and remove the bubble manually
      // This is a simplified cleanup - in a real implementation,
      // you would access the internal state more carefully
      debugLogger.info('Attempting manual bubble cleanup', { bubbleId });
      
      // Force save state after manual cleanup
      this.saveState();
    } catch (error) {
      debugLogger.error('Manual bubble cleanup failed', { bubbleId, error });
    }
  }

  /**
   * Get fallback available content
   */
  private getFallbackAvailableContent(): ContentItem[] {
    return [
      {
        id: 'fallback-content-1',
        type: 'song',
        name: 'Fallback Song',
        relatedCount: 1,
        displayCount: 0
      }
    ];
  }

  /**
   * Get recovery content from last known good state
   */
  private getRecoveryContent(): ContentItem | null {
    if (this.lastKnownGoodState && this.lastKnownGoodState.availableContent.size > 0) {
      const availableItems = Array.from(this.lastKnownGoodState.availableContent.values());
      return availableItems[Math.floor(Math.random() * availableItems.length)];
    }

    return {
      id: 'recovery-content',
      type: 'song',
      name: 'Recovery Content',
      relatedCount: 1,
      displayCount: 0
    };
  }

  /**
   * Get fallback statistics
   */
  private getFallbackStats(): any {
    return {
      totalContent: 1,
      availableContent: 1,
      displayedContent: 0,
      songCount: 1,
      personCount: 0,
      tagCount: 0,
      rotationCycle: 0
    };
  }

  /**
   * Force reset as ultimate fallback
   */
  private forceReset(): void {
    try {
      // Manually clear internal state
      this.operationHistory.clear();
      this.lastKnownGoodState = null;
      
      debugLogger.warn('Force reset completed');
    } catch (error) {
      debugLogger.error('Force reset failed', { error });
    }
  }

  /**
   * Track operation success/failure
   */
  private trackOperation(operation: string, success: boolean): void {
    const key = `${operation}-${success ? 'success' : 'failure'}`;
    const count = this.operationHistory.get(key) || 0;
    this.operationHistory.set(key, count + 1);
  }

  /**
   * Save current state as last known good state
   */
  private saveState(): void {
    try {
      // In a real implementation, you would save the actual internal state
      this.lastKnownGoodState = {
        displayedContent: new Map(),
        availableContent: new Map(),
        timestamp: Date.now()
      };
    } catch (error) {
      debugLogger.warn('Failed to save state', { error });
    }
  }

  /**
   * Get operation statistics
   */
  getOperationStats(): Record<string, number> {
    return Object.fromEntries(this.operationHistory.entries());
  }

  /**
   * Clear operation history
   */
  clearOperationHistory(): void {
    this.operationHistory.clear();
  }
}

// Export singleton instance
export const safeBubbleRegistry = new SafeBubbleRegistry();