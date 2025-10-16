// Music data types
export type { Song, Person, MusicDatabase, Bubble, RelatedData } from './music'

// Bubble entity class
export { BubbleEntity } from './bubble'

// Environment configuration types
export type { EnvironmentConfig, EnvironmentDetectionResult } from './environment'

// Enhanced bubble types and visual system
export type { 
  EnhancedBubble, 
  PersonRole, 
  BubbleStyle, 
  VisualTheme, 
  ContentItem as EnhancedContentItem,
  ConsolidatedPerson 
} from './enhancedBubble'
export { IconType, ShapeType } from './enhancedBubble'

// Bubble registry types
export type { 
  ContentItem, 
  DisplayedBubbleInfo, 
  ContentPoolStats, 
  BubbleRegistryConfig,
  WeightedSelectionConfig 
} from './bubbleRegistry'
export { DEFAULT_REGISTRY_CONFIG, DEFAULT_WEIGHTED_CONFIG } from './bubbleRegistry'