/**
 * Bubble Style Resolver
 * 
 * This module provides utilities to resolve the appropriate visual style
 * for different types of content based on the requirements.
 */

import { BubbleStyle, PersonRole, IconType, ShapeType } from '../types/enhancedBubble';
import { VisualThemeManager, defaultVisualTheme } from './visualTheme';

/**
 * Content type for style resolution
 */
export interface ContentForStyling {
  type: 'song' | 'person' | 'tag';
  roles?: PersonRole[];
  name?: string;
}

/**
 * Bubble Style Resolver
 * 
 * Resolves appropriate visual styles for different content types
 */
export class BubbleStyleResolver {
  private themeManager: VisualThemeManager;
  
  constructor(themeManager?: VisualThemeManager) {
    this.themeManager = themeManager || new VisualThemeManager(defaultVisualTheme);
  }
  
  /**
   * Resolve style for content
   * 
   * Requirements 1.1-1.6: Different visual styles for each content type
   */
  resolveStyle(content: ContentForStyling): BubbleStyle {
    switch (content.type) {
      case 'song':
        return this.themeManager.getStyleForType('song');
        
      case 'tag':
        return this.themeManager.getStyleForType('tag');
        
      case 'person':
        return this.resolvePersonStyle(content.roles || []);
        
      default:
        return this.themeManager.getStyleForType('song');
    }
  }
  
  /**
   * Resolve style for person based on roles
   * 
   * Requirements 2.1-2.4: Multi-role person consolidation
   */
  private resolvePersonStyle(roles: PersonRole[]): BubbleStyle {
    if (roles.length === 0) {
      return this.themeManager.getStyleForType('lyricist');
    }
    
    if (roles.length === 1) {
      const roleType = roles[0].type;
      return this.themeManager.getStyleForType(roleType);
    }
    
    // Multiple roles - use multi-role style
    const roleTypes = roles.map(role => role.type);
    return this.themeManager.getMultiRoleStyle(roleTypes);
  }
  
  /**
   * Determine if content has multiple roles
   */
  isMultiRole(content: ContentForStyling): boolean {
    return content.type === 'person' && (content.roles?.length || 0) > 1;
  }
  
  /**
   * Get icon type for content
   */
  getIconType(content: ContentForStyling): IconType {
    const style = this.resolveStyle(content);
    return style.iconType;
  }
  
  /**
   * Get shape type for content
   */
  getShapeType(content: ContentForStyling): ShapeType {
    const style = this.resolveStyle(content);
    return style.shapeType;
  }
  
  /**
   * Get visual type classification
   */
  getVisualType(content: ContentForStyling): 'song' | 'person' | 'tag' {
    return content.type;
  }
  
  /**
   * Create enhanced bubble properties from content
   */
  createEnhancedProperties(content: ContentForStyling) {
    const style = this.resolveStyle(content);
    
    return {
      visualType: this.getVisualType(content),
      roles: content.roles,
      iconType: style.iconType,
      shapeType: style.shapeType,
      isMultiRole: this.isMultiRole(content),
      style
    };
  }
}