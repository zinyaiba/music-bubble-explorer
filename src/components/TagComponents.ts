// Tag Chip Components Export
// This file exports all tag-related components for easy importing

// Core components
export {
  TagChip,
  TagChipDefault,
  TagChipSelected,
  TagChipEditable,
  TagChipRemovable,
} from './TagChip'
export type { TagChipProps } from './TagChip'

export {
  TagChipGroup,
  TagChipGroupDisplay,
  TagChipGroupEditable,
  TagChipGroupSelectable,
} from './TagChipGroup'
export type { TagChipGroupProps } from './TagChipGroup'

export {
  TagInlineEditor,
  useTagInlineEditor,
  createKeyboardShortcuts,
} from './TagInlineEditor'
export type { TagInlineEditorProps } from './TagInlineEditor'

// Re-export glassmorphism theme for convenience
export { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
export type { GlassmorphismTheme } from './GlassmorphismThemeProvider'
