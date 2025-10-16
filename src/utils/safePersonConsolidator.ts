/**
 * Safe Person Consolidator
 * 
 * Enhanced person consolidator with comprehensive error handling and fallback functionality.
 * Provides safe person consolidation operations with automatic fallbacks.
 * 
 * Requirements: 2.1 - 人物統合エラーの処理
 */

import { PersonConsolidator } from './personConsolidator';
import { Song } from '../types/music';
import { ConsolidatedPerson, PersonRole } from '../types/consolidatedPerson';
import { errorHandler } from './errorHandler';
import { DebugLogger } from './debugLogger';

const debugLogger = DebugLogger.getInstance();

/**
 * Safe Person Consolidator Class
 * 
 * Provides error-safe person consolidation operations with automatic fallbacks
 */
export class SafePersonConsolidator extends PersonConsolidator {

  private consolidationCache: Map<string, ConsolidatedPerson[]> = new Map();
  private roleCache: Map<string, PersonRole[]> = new Map();

  constructor() {
    super();

  }

  /**
   * Safe person consolidation with error handling
   */
  consolidatePersons(songs: Song[]): ConsolidatedPerson[] {
    const cacheKey = this.generateCacheKey(songs);
    
    // Check cache first
    const cached = this.consolidationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Validate input
      this.validateSongsInput(songs);

      // Attempt consolidation
      const result = super.consolidatePersons(songs);
      
      // Validate result
      const validatedResult = this.validateConsolidationResult(result);
      
      // Cache successful result
      this.consolidationCache.set(cacheKey, validatedResult);
      
      return validatedResult;
    } catch (error) {
      const fallbackResult = errorHandler.handlePersonConsolidationError(error as Error, {
        personName: 'multiple',
        operation: 'consolidate',
        inputData: { songCount: songs?.length || 0 }
      });

      if (fallbackResult) {
        return Array.isArray(fallbackResult) ? fallbackResult : [fallbackResult];
      }

      // Ultimate fallback - create basic consolidated persons
      return this.createFallbackConsolidatedPersons(songs);
    }
  }

  /**
   * Safe person roles retrieval with error handling
   */
  getPersonRoles(personName: string, songs: Song[]): PersonRole[] {
    const cacheKey = `${personName}-${this.generateCacheKey(songs)}`;
    
    // Check cache first
    const cached = this.roleCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Validate input
      this.validatePersonName(personName);
      this.validateSongsInput(songs);

      // Attempt to get roles
      const result = super.getPersonRoles(personName, songs);
      
      // Validate result
      const validatedResult = this.validateRolesResult(result);
      
      // Cache successful result
      this.roleCache.set(cacheKey, validatedResult);
      
      return validatedResult;
    } catch (error) {
      const fallbackResult = errorHandler.handlePersonConsolidationError(error as Error, {
        personName,
        operation: 'getRoles',
        inputData: { songCount: songs?.length || 0 }
      });

      if (fallbackResult && Array.isArray(fallbackResult)) {
        return fallbackResult;
      }

      // Ultimate fallback - return default role
      return [{ type: 'lyricist', songCount: 1 }];
    }
  }

  /**
   * Safe total count calculation with error handling
   */
  calculateTotalRelatedCount(person: ConsolidatedPerson): number {
    try {
      // Validate input
      this.validateConsolidatedPerson(person);

      // Attempt calculation
      const result = super.calculateTotalRelatedCount(person);
      
      // Validate result
      if (!Number.isFinite(result) || result < 0) {
        throw new Error(`Invalid count result: ${result}`);
      }
      
      return result;
    } catch (error) {
      const fallbackResult = errorHandler.handlePersonConsolidationError(error as Error, {
        personName: person?.name || 'unknown',
        operation: 'calculateCount',
        inputData: person
      });

      if (typeof fallbackResult === 'number' && fallbackResult > 0) {
        return fallbackResult;
      }

      // Ultimate fallback - calculate from available data
      return this.calculateFallbackCount(person);
    }
  }

  /**
   * Safe multi-role detection with error handling
   */
  isMultiRole(person: ConsolidatedPerson): boolean {
    try {
      this.validateConsolidatedPerson(person);
      return super.isMultiRole(person);
    } catch (error) {
      debugLogger.warn('Multi-role detection failed, using fallback', { person, error });
      
      // Fallback - check roles array length
      return person?.roles?.length > 1 || false;
    }
  }

  /**
   * Safe persons by role retrieval
   */
  getPersonsByRole(
    consolidatedPersons: ConsolidatedPerson[],
    roleType: 'lyricist' | 'composer' | 'arranger'
  ): ConsolidatedPerson[] {
    try {
      this.validateConsolidatedPersonsArray(consolidatedPersons);
      this.validateRoleType(roleType);
      
      return super.getPersonsByRole(consolidatedPersons, roleType);
    } catch (error) {
      debugLogger.warn('Persons by role retrieval failed, using fallback', { roleType, error });
      
      // Fallback - manual filtering with error handling
      return this.safeFilterPersonsByRole(consolidatedPersons, roleType);
    }
  }

  /**
   * Safe multi-role persons retrieval
   */
  getMultiRolePersons(consolidatedPersons: ConsolidatedPerson[]): ConsolidatedPerson[] {
    try {
      this.validateConsolidatedPersonsArray(consolidatedPersons);
      return super.getMultiRolePersons(consolidatedPersons);
    } catch (error) {
      debugLogger.warn('Multi-role persons retrieval failed, using fallback', { error });
      
      // Fallback - manual filtering with error handling
      return this.safeFilterMultiRolePersons(consolidatedPersons);
    }
  }

  /**
   * Validate songs input
   */
  private validateSongsInput(songs: Song[]): void {
    if (!songs) {
      throw new Error('Songs array is null or undefined');
    }

    if (!Array.isArray(songs)) {
      throw new Error('Songs input is not an array');
    }

    if (songs.length === 0) {
      throw new Error('Songs array is empty');
    }

    // Validate each song has required properties
    songs.forEach((song, index) => {
      if (!song || typeof song !== 'object') {
        throw new Error(`Invalid song at index ${index}`);
      }

      if (!song.id || typeof song.id !== 'string') {
        throw new Error(`Invalid song ID at index ${index}`);
      }

      // Ensure arrays exist (even if empty)
      if (!Array.isArray(song.lyricists)) {
        song.lyricists = [];
      }
      if (!Array.isArray(song.composers)) {
        song.composers = [];
      }
      if (!Array.isArray(song.arrangers)) {
        song.arrangers = [];
      }
    });
  }

  /**
   * Validate person name
   */
  private validatePersonName(personName: string): void {
    if (!personName || typeof personName !== 'string') {
      throw new Error('Invalid person name');
    }

    if (personName.trim().length === 0) {
      throw new Error('Person name is empty');
    }
  }

  /**
   * Validate consolidated person object
   */
  private validateConsolidatedPerson(person: ConsolidatedPerson): void {
    if (!person || typeof person !== 'object') {
      throw new Error('Invalid consolidated person object');
    }

    if (!person.name || typeof person.name !== 'string') {
      throw new Error('Invalid person name in consolidated person');
    }

    if (!Array.isArray(person.roles)) {
      throw new Error('Invalid roles array in consolidated person');
    }

    if (!Number.isFinite(person.totalRelatedCount) || person.totalRelatedCount < 0) {
      throw new Error('Invalid totalRelatedCount in consolidated person');
    }

    if (!Array.isArray(person.songs)) {
      throw new Error('Invalid songs array in consolidated person');
    }
  }

  /**
   * Validate consolidated persons array
   */
  private validateConsolidatedPersonsArray(persons: ConsolidatedPerson[]): void {
    if (!persons || !Array.isArray(persons)) {
      throw new Error('Invalid consolidated persons array');
    }

    persons.forEach((person, index) => {
      try {
        this.validateConsolidatedPerson(person);
      } catch (error) {
        throw new Error(`Invalid person at index ${index}: ${error}`);
      }
    });
  }

  /**
   * Validate role type
   */
  private validateRoleType(roleType: string): void {
    const validRoles = ['lyricist', 'composer', 'arranger'];
    if (!validRoles.includes(roleType)) {
      throw new Error(`Invalid role type: ${roleType}`);
    }
  }

  /**
   * Validate consolidation result
   */
  private validateConsolidationResult(result: ConsolidatedPerson[]): ConsolidatedPerson[] {
    if (!Array.isArray(result)) {
      throw new Error('Consolidation result is not an array');
    }

    // Filter out invalid persons and fix valid ones
    const validatedResult: ConsolidatedPerson[] = [];

    result.forEach((person, index) => {
      try {
        this.validateConsolidatedPerson(person);
        validatedResult.push(person);
      } catch (error) {
        debugLogger.warn(`Invalid consolidated person at index ${index}, attempting to fix`, { person, error });
        
        // Try to fix the person object
        const fixedPerson = this.fixConsolidatedPerson(person);
        if (fixedPerson) {
          validatedResult.push(fixedPerson);
        }
      }
    });

    return validatedResult;
  }

  /**
   * Validate roles result
   */
  private validateRolesResult(result: PersonRole[]): PersonRole[] {
    if (!Array.isArray(result)) {
      return [{ type: 'lyricist', songCount: 1 }];
    }

    // Filter and fix invalid roles
    const validatedRoles: PersonRole[] = [];

    result.forEach(role => {
      if (role && typeof role === 'object' && role.type && Number.isFinite(role.songCount)) {
        const validRoles = ['lyricist', 'composer', 'arranger'];
        if (validRoles.includes(role.type) && role.songCount >= 0) {
          validatedRoles.push(role);
        }
      }
    });

    // Ensure at least one role exists
    if (validatedRoles.length === 0) {
      validatedRoles.push({ type: 'lyricist', songCount: 1 });
    }

    return validatedRoles;
  }

  /**
   * Fix consolidated person object
   */
  private fixConsolidatedPerson(person: any): ConsolidatedPerson | null {
    try {
      if (!person || typeof person !== 'object') {
        return null;
      }

      const fixedPerson: ConsolidatedPerson = {
        name: person.name || 'Unknown Person',
        roles: Array.isArray(person.roles) ? person.roles : [{ type: 'lyricist', songCount: 1 }],
        totalRelatedCount: Number.isFinite(person.totalRelatedCount) ? person.totalRelatedCount : 1,
        songs: Array.isArray(person.songs) ? person.songs : []
      };

      // Validate fixed person
      this.validateConsolidatedPerson(fixedPerson);
      return fixedPerson;
    } catch (error) {
      debugLogger.warn('Failed to fix consolidated person', { person, error });
      return null;
    }
  }

  /**
   * Create fallback consolidated persons
   */
  private createFallbackConsolidatedPersons(songs: Song[]): ConsolidatedPerson[] {
    const fallbackPersons: ConsolidatedPerson[] = [];

    try {
      if (!songs || !Array.isArray(songs)) {
        return fallbackPersons;
      }

      // Extract unique person names safely
      const personNames = new Set<string>();

      songs.forEach(song => {
        if (song && typeof song === 'object') {
          // Safely extract lyricists
          if (Array.isArray(song.lyricists)) {
            song.lyricists.forEach(name => {
              if (name && typeof name === 'string') {
                personNames.add(name);
              }
            });
          }

          // Safely extract composers
          if (Array.isArray(song.composers)) {
            song.composers.forEach(name => {
              if (name && typeof name === 'string') {
                personNames.add(name);
              }
            });
          }

          // Safely extract arrangers
          if (Array.isArray(song.arrangers)) {
            song.arrangers.forEach(name => {
              if (name && typeof name === 'string') {
                personNames.add(name);
              }
            });
          }
        }
      });

      // Create basic consolidated persons
      personNames.forEach(name => {
        fallbackPersons.push({
          name,
          roles: [{ type: 'lyricist', songCount: 1 }],
          totalRelatedCount: 1,
          songs: []
        });
      });

    } catch (error) {
      debugLogger.error('Failed to create fallback consolidated persons', { error });
    }

    return fallbackPersons;
  }

  /**
   * Calculate fallback count
   */
  private calculateFallbackCount(person: ConsolidatedPerson): number {
    try {
      if (person?.roles && Array.isArray(person.roles)) {
        return person.roles.reduce((total, role) => {
          return total + (Number.isFinite(role.songCount) ? role.songCount : 1);
        }, 0);
      }

      if (person?.songs && Array.isArray(person.songs)) {
        return person.songs.length;
      }

      return 1; // Minimum fallback
    } catch (error) {
      debugLogger.warn('Fallback count calculation failed', { person, error });
      return 1;
    }
  }

  /**
   * Safe filter persons by role
   */
  private safeFilterPersonsByRole(
    persons: ConsolidatedPerson[],
    roleType: 'lyricist' | 'composer' | 'arranger'
  ): ConsolidatedPerson[] {
    const result: ConsolidatedPerson[] = [];

    if (!Array.isArray(persons)) {
      return result;
    }

    persons.forEach(person => {
      try {
        if (person && person.roles && Array.isArray(person.roles)) {
          const hasRole = person.roles.some(role => 
            role && role.type === roleType
          );
          
          if (hasRole) {
            result.push(person);
          }
        }
      } catch (error) {
        debugLogger.warn('Error filtering person by role', { person, roleType, error });
      }
    });

    return result;
  }

  /**
   * Safe filter multi-role persons
   */
  private safeFilterMultiRolePersons(persons: ConsolidatedPerson[]): ConsolidatedPerson[] {
    const result: ConsolidatedPerson[] = [];

    if (!Array.isArray(persons)) {
      return result;
    }

    persons.forEach(person => {
      try {
        if (person && person.roles && Array.isArray(person.roles) && person.roles.length > 1) {
          result.push(person);
        }
      } catch (error) {
        debugLogger.warn('Error filtering multi-role person', { person, error });
      }
    });

    return result;
  }

  /**
   * Generate cache key for songs array
   */
  private generateCacheKey(songs: Song[]): string {
    try {
      if (!songs || !Array.isArray(songs)) {
        return 'empty';
      }

      // Create a simple hash based on song IDs
      const ids = songs.map(song => song?.id || '').filter(Boolean).sort();
      return ids.join('-');
    } catch (error) {
      return `error-${Date.now()}`;
    }
  }

  /**
   * Clear caches
   */
  clearCaches(): void {
    this.consolidationCache.clear();
    this.roleCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    consolidationCacheSize: number;
    roleCacheSize: number;
  } {
    return {
      consolidationCacheSize: this.consolidationCache.size,
      roleCacheSize: this.roleCache.size
    };
  }
}

// Export singleton instance
export const safePersonConsolidator = new SafePersonConsolidator();