/**
 * Multi-Role Handler
 * 
 * Handles detection, integration, and special display logic for multi-role persons.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.6
 */

import { ConsolidatedPerson, PersonRole } from '../types/consolidatedPerson';
import { ShapeType, IconType, BubbleStyle } from '../types/enhancedBubble';
import { ColorPalette } from './visualTheme';

/**
 * Multi-role detection and integration logic
 */
export class MultiRoleHandler {
  /**
   * Detect if a person has multiple roles
   * Requirements: 2.1 - Multi-role detection
   */
  isMultiRole(person: ConsolidatedPerson): boolean {
    return person.roles.length > 1;
  }

  /**
   * Get the complexity level of multi-role person
   * Used to determine special shapes and rendering
   */
  getMultiRoleComplexity(roles: PersonRole[]): 'simple' | 'complex' | 'advanced' {
    if (roles.length <= 1) return 'simple';
    if (roles.length === 2) return 'complex';
    return 'advanced'; // 3+ roles
  }

  /**
   * Determine special shape for multi-role person
   * Requirements: 2.2, 5.6 - Special shapes (star, diamond)
   */
  determineMultiRoleShape(roles: PersonRole[]): ShapeType {
    const complexity = this.getMultiRoleComplexity(roles);
    
    switch (complexity) {
      case 'complex':
        return ShapeType.STAR; // 2 roles
      case 'advanced':
        return ShapeType.DIAMOND; // 3+ roles
      default:
        return ShapeType.ROUNDED_SQUARE; // Single role fallback
    }
  }

  /**
   * Create composite gradient colors for multi-role person
   * Requirements: 2.2 - Composite visual style
   */
  createCompositeColors(roles: PersonRole[]): { primary: string; secondary: string; colors: string[] } {
    const roleColors = roles.map(role => {
      switch (role.type) {
        case 'lyricist':
          return ColorPalette.lyricist.primary;
        case 'composer':
          return ColorPalette.composer.primary;
        case 'arranger':
          return ColorPalette.arranger.primary;
        default:
          return ColorPalette.multiRole.primary;
      }
    });

    return {
      primary: roleColors[0],
      secondary: roleColors[roleColors.length - 1],
      colors: roleColors
    };
  }

  /**
   * Generate composite style for multi-role bubble
   * Requirements: 2.2, 2.3 - Composite visual style
   */
  generateCompositeStyle(roles: PersonRole[]): Partial<BubbleStyle> {
    const colors = this.createCompositeColors(roles);
    const shape = this.determineMultiRoleShape(roles);
    
    return {
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      shapeType: shape,
      iconType: IconType.MULTI_ROLE,
      strokeWidth: 3, // Thicker stroke for multi-role
      strokeColor: this.blendColors(colors.colors),
      shadowBlur: 12, // Enhanced shadow for prominence
      shadowColor: `rgba(139, 126, 216, 0.5)` // Multi-role shadow color
    };
  }

  /**
   * Calculate total related count for multi-role person
   * Requirements: 2.4 - Total related songs calculation
   */
  calculateTotalRelatedCount(person: ConsolidatedPerson): number {
    return person.totalRelatedCount;
  }

  /**
   * Get role distribution for display
   * Returns percentage distribution of roles by song count
   */
  getRoleDistribution(roles: PersonRole[]): { [key: string]: number } {
    const total = roles.reduce((sum, role) => sum + role.songCount, 0);
    const distribution: { [key: string]: number } = {};
    
    roles.forEach(role => {
      distribution[role.type] = Math.round((role.songCount / total) * 100);
    });
    
    return distribution;
  }

  /**
   * Get dominant role (role with most songs)
   * Used for fallback scenarios
   */
  getDominantRole(roles: PersonRole[]): PersonRole {
    return roles.reduce((prev, current) => 
      current.songCount > prev.songCount ? current : prev
    );
  }

  /**
   * Check if person has specific role
   */
  hasRole(person: ConsolidatedPerson, roleType: 'lyricist' | 'composer' | 'arranger'): boolean {
    return person.roles.some(role => role.type === roleType);
  }

  /**
   * Get role combinations as string for identification
   */
  getRoleCombination(roles: PersonRole[]): string {
    return roles
      .map(role => role.type)
      .sort()
      .join('+');
  }

  /**
   * Blend multiple colors for stroke/border
   */
  private blendColors(colors: string[]): string {
    if (colors.length === 1) return colors[0];
    
    // Simple color blending - use middle color or create average
    if (colors.length === 2) {
      return colors[0]; // Use first color for simplicity
    }
    
    // For 3+ colors, use a neutral blend
    return '#8B7ED8'; // Multi-role stroke color
  }

  /**
   * Validate multi-role person data
   */
  validateMultiRolePerson(person: ConsolidatedPerson): boolean {
    return (
      person.roles.length > 1 &&
      person.totalRelatedCount > 0 &&
      person.songs.length > 0 &&
      person.roles.every(role => role.songCount > 0)
    );
  }

  /**
   * Create display summary for multi-role person
   */
  createDisplaySummary(person: ConsolidatedPerson): {
    name: string;
    roleCount: number;
    totalSongs: number;
    roleTypes: string[];
    dominantRole: string;
    complexity: string;
  } {
    const dominantRole = this.getDominantRole(person.roles);
    const complexity = this.getMultiRoleComplexity(person.roles);
    
    return {
      name: person.name,
      roleCount: person.roles.length,
      totalSongs: person.totalRelatedCount,
      roleTypes: person.roles.map(role => role.type),
      dominantRole: dominantRole.type,
      complexity
    };
  }
}

/**
 * Default multi-role handler instance
 */
export const multiRoleHandler = new MultiRoleHandler();