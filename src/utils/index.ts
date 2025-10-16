// Data utilities export
export { DataValidator } from './dataValidation'
export { DataParser } from './dataParser'
export { RelationshipCalculator } from './relationshipCalculator'

// Environment detection utilities
export { 
  EnvironmentDetector, 
  getEnvironmentConfig, 
  shouldShowDebugUI, 
  shouldLogToConsole, 
  detectEnvironment 
} from './environmentDetector'

// Bubble registry utilities
export { BubbleRegistry } from './bubbleRegistry'

// Content tracking utilities
export { ContentTracker } from './contentTracker'

// Visual theme utilities
export { VisualThemeManager, defaultVisualTheme, ColorPalette } from './visualTheme'
export { BubbleStyleResolver } from './bubbleStyleResolver'

// Icon rendering utilities
export { IconRenderer, iconRenderer } from './iconRenderer'

// Shape rendering utilities
export { ShapeRenderer, shapeRenderer } from './shapeRenderer'

// Multi-role handling utilities
export { MultiRoleHandler, multiRoleHandler } from './multiRoleHandler'

// Performance optimization utilities
export { 
  PerformanceCache, 
  performanceCache,
  type IconCacheKey,
  type GradientCacheKey,
  type CacheEntry
} from './performanceCache'
export { 
  SelectiveRenderer, 
  selectiveRenderer,
  type RenderRegion,
  type BubbleRenderState
} from './selectiveRenderer'
export { 
  PerformanceMonitor, 
  performanceMonitor,
  type PerformanceMetrics,
  type PerformanceThresholds
} from './performanceMonitor'

// Error handling utilities
export { 
  ErrorHandler, 
  errorHandler,
  ErrorType,
  ErrorSeverity,
  DEFAULT_FALLBACK_CONFIG,
  type ErrorInfo,
  type FallbackConfig
} from './errorHandler'
export { SafeIconRenderer, safeIconRenderer } from './safeIconRenderer'
export { SafeVisualThemeManager, safeVisualThemeManager } from './safeVisualTheme'
export { SafePersonConsolidator, safePersonConsolidator } from './safePersonConsolidator'
export { SafeBubbleRegistry, safeBubbleRegistry } from './safeBubbleRegistry'
export { 
  ErrorHandlingIntegration, 
  errorHandlingIntegration,
  DEFAULT_SYSTEM_ERROR_CONFIG,
  type SystemErrorConfig,
  type SystemHealth
} from './errorHandlingIntegration'

// Re-export types for convenience
export type { MusicDatabase, Song, Person, Bubble, RelatedData } from '@/types/music'
export type { EnvironmentConfig, EnvironmentDetectionResult } from '@/types/environment'
export type { 
  ContentItem, 
  DisplayedBubbleInfo, 
  ContentPoolStats, 
  BubbleRegistryConfig 
} from '@/types/bubbleRegistry'
export type { 
  EnhancedBubble, 
  PersonRole, 
  BubbleStyle, 
  VisualTheme 
} from '@/types/enhancedBubble'
export { IconType, ShapeType } from '@/types/enhancedBubble'