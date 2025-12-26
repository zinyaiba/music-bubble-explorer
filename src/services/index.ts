// Services export
export { MusicDataService } from './musicDataService'
export { BubbleManager, DEFAULT_BUBBLE_CONFIG } from './bubbleManager'
export { TagRenameService } from './tagRenameService'
export type {
  TagNameValidationResult,
  TagRenameResult,
  TagMergeResult,
} from './tagRenameService'

// Re-export types for convenience
export type {
  MusicDatabase,
  Song,
  Person,
  Bubble,
  RelatedData,
} from '@/types/music'
export type { BubbleConfig } from './bubbleManager'
export { BubbleEntity } from '@/types/bubble'
