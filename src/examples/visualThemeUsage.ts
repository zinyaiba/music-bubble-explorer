/**
 * Visual Theme System Usage Example
 * 
 * This example demonstrates how to use the visual theme system
 * for enhanced bubble styling and visual distinction.
 */

import { 
  VisualThemeManager, 
  BubbleStyleResolver, 
  defaultVisualTheme,
  ColorPalette 
} from '../utils';

/**
 * Example: Basic visual theme usage
 */
export function basicVisualThemeExample() {
  console.log('=== Visual Theme System Example ===');
  
  // Create theme manager
  const themeManager = new VisualThemeManager(defaultVisualTheme);
  
  // Get styles for different content types
  const songStyle = themeManager.getStyleForType('song');
  const lyricistStyle = themeManager.getStyleForType('lyricist');
  const tagStyle = themeManager.getStyleForType('tag');
  
  console.log('Song style:', {
    colors: `${songStyle.primaryColor} → ${songStyle.secondaryColor}`,
    icon: songStyle.iconType,
    shape: songStyle.shapeType
  });
  
  console.log('Lyricist style:', {
    colors: `${lyricistStyle.primaryColor} → ${lyricistStyle.secondaryColor}`,
    icon: lyricistStyle.iconType,
    shape: lyricistStyle.shapeType
  });
  
  console.log('Tag style:', {
    colors: `${tagStyle.primaryColor} → ${tagStyle.secondaryColor}`,
    icon: tagStyle.iconType,
    shape: tagStyle.shapeType
  });
}

/**
 * Example: Multi-role person styling
 */
export function multiRolePersonExample() {
  console.log('\n=== Multi-Role Person Example ===');
  
  const themeManager = new VisualThemeManager();
  
  // Create multi-role person
  const multiRoleStyle = themeManager.getMultiRoleStyle(['lyricist', 'composer']);
  
  console.log('Multi-role person style:', {
    colors: `${multiRoleStyle.primaryColor} → ${multiRoleStyle.secondaryColor}`,
    icon: multiRoleStyle.iconType,
    shape: multiRoleStyle.shapeType,
    strokeWidth: multiRoleStyle.strokeWidth
  });
}

/**
 * Example: Style resolver usage
 */
export function styleResolverExample() {
  console.log('\n=== Style Resolver Example ===');
  
  const resolver = new BubbleStyleResolver();
  
  // Resolve style for different content types
  const songContent = { type: 'song' as const };
  const tagContent = { type: 'tag' as const };
  const singleRolePerson = { 
    type: 'person' as const, 
    roles: [{ type: 'lyricist' as const, songCount: 5 }] 
  };
  const multiRolePerson = { 
    type: 'person' as const, 
    roles: [
      { type: 'lyricist' as const, songCount: 3 },
      { type: 'composer' as const, songCount: 2 }
    ] 
  };
  
  console.log('Song content properties:', resolver.createEnhancedProperties(songContent));
  console.log('Tag content properties:', resolver.createEnhancedProperties(tagContent));
  console.log('Single role person properties:', resolver.createEnhancedProperties(singleRolePerson));
  console.log('Multi-role person properties:', resolver.createEnhancedProperties(multiRolePerson));
}

/**
 * Example: Canvas gradient creation
 */
export function canvasGradientExample() {
  console.log('\n=== Canvas Gradient Example ===');
  
  // This would be used in actual canvas rendering
  const themeManager = new VisualThemeManager();
  
  // Mock canvas context for demonstration
  const mockCanvas = document.createElement('canvas');
  const ctx = mockCanvas.getContext('2d')!;
  
  const songStyle = themeManager.getStyleForType('song');
  
  // Create gradient (in real usage)
  themeManager.createGradient(ctx, songStyle, 100, 100, 50);
  
  console.log('Gradient created for song style');
  console.log('Primary color:', songStyle.primaryColor);
  console.log('Secondary color:', songStyle.secondaryColor);
  
  // Apply shadow
  themeManager.applyShadow(ctx, songStyle);
  console.log('Shadow applied:', {
    color: songStyle.shadowColor,
    blur: songStyle.shadowBlur
  });
  
  // Clear shadow
  themeManager.clearShadow(ctx);
  console.log('Shadow cleared');
}

/**
 * Example: Color palette access
 */
export function colorPaletteExample() {
  console.log('\n=== Color Palette Example ===');
  
  console.log('Available color palettes:');
  Object.entries(ColorPalette).forEach(([type, colors]) => {
    console.log(`${type}:`, {
      primary: colors.primary,
      secondary: colors.secondary,
      stroke: colors.stroke
    });
  });
}

/**
 * Run all examples
 */
export function runVisualThemeExamples() {
  basicVisualThemeExample();
  multiRolePersonExample();
  styleResolverExample();
  canvasGradientExample();
  colorPaletteExample();
}

// Export for testing
export const visualThemeExamples = {
  basicVisualThemeExample,
  multiRolePersonExample,
  styleResolverExample,
  canvasGradientExample,
  colorPaletteExample,
  runVisualThemeExamples
};