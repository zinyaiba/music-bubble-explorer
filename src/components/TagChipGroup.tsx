import React, { useState, useCallback, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { TagChip, TagChipProps } from './TagChip'

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-10px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
`

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(10px) scale(0.8);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

// Props interface for TagChipGroup component
export interface TagChipGroupProps {
  tags: string[]
  variant?: 'display' | 'editable' | 'selectable'
  size?: 'small' | 'medium' | 'large'
  layout?: 'wrap' | 'scroll'
  maxTags?: number
  showFullText?: boolean
  selectedTags?: string[]
  onTagEdit?: (index: number, newTag: string) => void
  onTagRemove?: (index: number) => void
  onTagAdd?: (tag: string) => void
  onTagSelect?: (tag: string, selected: boolean) => void
  addButtonText?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

// Styled components
const StyledTagChipGroup = styled.div<{
  $layout: 'wrap' | 'scroll'
  $theme: any
}>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`

const TagContainer = styled.div<{
  $layout: 'wrap' | 'scroll'
  $theme: any
}>`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  ${props =>
    props.$layout === 'wrap'
      ? `
    flex-wrap: wrap;
  `
      : `
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      height: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: ${props.$theme.colors.glass.light};
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${props.$theme.colors.glass.medium};
      border-radius: 3px;
      
      &:hover {
        background: ${props.$theme.colors.glass.strong};
      }
    }
  `}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    gap: 6px;
  }
`

const AnimatedTagWrapper = styled.div<{
  $isRemoving: boolean
  $isNew: boolean
}>`
  display: inline-flex;
  animation: ${props => {
      if (props.$isRemoving) return slideOut
      if (props.$isNew) return slideIn
      return fadeIn
    }}
    0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  ${props =>
    props.$isRemoving &&
    `
    pointer-events: none;
  `}
`

const AddTagButton = styled.button<{
  $theme: any
  $size: 'small' | 'medium' | 'large'
}>`
  /* Base glassmorphism styles */
  background: ${props => props.$theme.colors.glass.light};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  border: 2px dashed ${props => props.$theme.colors.neutral[300]};
  color: ${props => props.$theme.colors.text.secondary};

  /* Size-based styling */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 12px;
          min-height: 24px;
        `
      case 'large':
        return `
          padding: 8px 16px;
          font-size: 16px;
          border-radius: 20px;
          min-height: 40px;
        `
      default: // medium
        return `
          padding: 6px 12px;
          font-size: 14px;
          border-radius: 16px;
          min-height: 32px;
        `
    }
  }}

  /* Layout and positioning */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-weight: ${props => props.$theme.typography.fontWeights.medium};

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Interactive states */
  &:hover {
    background: ${props => props.$theme.colors.glass.medium};
    border-color: ${props => props.$theme.colors.accent};
    color: ${props => props.$theme.colors.accent};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      transform: none;
      background: ${props => props.$theme.colors.glass.light};
      border-color: ${props => props.$theme.colors.neutral[300]};
      color: ${props => props.$theme.colors.text.secondary};
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`

const TagStats = styled.div<{
  $theme: any
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${props => props.$theme.colors.text.secondary};
  font-family: ${props => props.$theme.typography.fontFamily};

  .tag-count {
    font-weight: ${props => props.$theme.typography.fontWeights.medium};
  }

  .max-tags-warning {
    color: ${props => props.$theme.colors.primary[400]};
  }
`

/**
 * TagChipGroup component
 * A container for managing multiple TagChip components with animations and interactions
 *
 * Requirements: 5.1, 5.4, 5.5
 */
export const TagChipGroup: React.FC<TagChipGroupProps> = ({
  tags,
  variant = 'display',
  size = 'medium',
  layout = 'wrap',
  maxTags,
  showFullText = false,
  selectedTags = [],
  onTagEdit,
  onTagRemove,
  onTagAdd,
  onTagSelect,
  addButtonText = '+ タグを追加',
  placeholder = 'タグがありません',
  className,
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const theme = useGlassmorphismTheme()
  const [removingTags, setRemovingTags] = useState<Set<number>>(new Set())
  const [newTags, setNewTags] = useState<Set<number>>(new Set())

  // Handle tag removal with animation
  const handleTagRemove = useCallback(
    (index: number) => {
      if (disabled || !onTagRemove) return

      // Start removal animation
      setRemovingTags(prev => new Set(prev).add(index))

      // Remove tag after animation completes
      setTimeout(() => {
        onTagRemove(index)
        setRemovingTags(prev => {
          const newSet = new Set(prev)
          newSet.delete(index)
          return newSet
        })
      }, 200)
    },
    [disabled, onTagRemove]
  )

  // Handle tag edit
  const handleTagEdit = useCallback(
    (index: number, newTag: string) => {
      if (disabled || !onTagEdit) return
      onTagEdit(index, newTag)
    },
    [disabled, onTagEdit]
  )

  // Handle tag selection
  const handleTagSelect = useCallback(
    (tag: string) => {
      if (disabled || !onTagSelect) return
      const isSelected = selectedTags.includes(tag)
      onTagSelect(tag, !isSelected)
    },
    [disabled, onTagSelect, selectedTags]
  )

  // Handle add tag
  const handleAddTag = useCallback(() => {
    if (disabled || !onTagAdd || (maxTags && tags.length >= maxTags)) return

    // For now, we'll trigger with an empty string - the parent should handle the UI for input
    onTagAdd('')
  }, [disabled, onTagAdd, maxTags, tags.length])

  // Mark new tags for animation (currently unused but available for future enhancement)
  const markAsNew = useCallback((index: number) => {
    setNewTags(prev => new Set(prev).add(index))
    setTimeout(() => {
      setNewTags(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }, 200)
  }, [])

  // Suppress unused variable warning - this function is available for future use
  void markAsNew

  // Determine chip variant for each tag
  const getChipVariant = useCallback(
    (tag: string): TagChipProps['variant'] => {
      switch (variant) {
        case 'editable':
          return 'editable'
        case 'selectable':
          return selectedTags.includes(tag) ? 'selected' : 'default'
        default:
          return 'default'
      }
    },
    [variant, selectedTags]
  )

  // Check if we can add more tags
  const canAddTags = useMemo(() => {
    return !maxTags || tags.length < maxTags
  }, [maxTags, tags.length])

  // Generate tag stats text
  const tagStatsText = useMemo(() => {
    if (maxTags) {
      const remaining = maxTags - tags.length
      return (
        <TagStats $theme={theme}>
          <span className="tag-count">
            {tags.length}/{maxTags} タグ
          </span>
          {remaining <= 2 && remaining > 0 && (
            <span className="max-tags-warning">あと{remaining}個まで</span>
          )}
        </TagStats>
      )
    }
    return (
      <TagStats $theme={theme}>
        <span className="tag-count">{tags.length} タグ</span>
      </TagStats>
    )
  }, [tags.length, maxTags, theme])

  return (
    <StyledTagChipGroup
      $layout={layout}
      $theme={theme}
      className={className}
      role="group"
      aria-label={ariaLabel || `タググループ: ${tags.length}個のタグ`}
      {...props}
    >
      <TagContainer $layout={layout} $theme={theme}>
        {tags.length === 0 ? (
          <div
            style={{
              color: theme.colors.text.secondary,
              fontStyle: 'italic',
              padding: '8px 0',
            }}
          >
            {placeholder}
          </div>
        ) : (
          tags.map((tag, index) => (
            <AnimatedTagWrapper
              key={`${tag}-${index}`}
              $isRemoving={removingTags.has(index)}
              $isNew={newTags.has(index)}
            >
              <TagChip
                tag={tag}
                variant={
                  variant === 'editable' ? 'removable' : getChipVariant(tag)
                }
                size={size}
                showFullText={showFullText}
                onEdit={
                  onTagEdit ? newTag => handleTagEdit(index, newTag) : undefined
                }
                onRemove={
                  onTagRemove ? () => handleTagRemove(index) : undefined
                }
                onSelect={onTagSelect ? () => handleTagSelect(tag) : undefined}
                disabled={disabled}
                aria-label={`タグ ${index + 1}: ${tag}`}
              />
            </AnimatedTagWrapper>
          ))
        )}

        {/* Add tag button or inline editor for editable variant */}
        {variant === 'editable' && onTagAdd && canAddTags && (
          <AddTagButton
            $theme={theme}
            $size={size}
            onClick={handleAddTag}
            disabled={disabled}
            aria-label="新しいタグを追加"
            type="button"
          >
            {addButtonText}
          </AddTagButton>
        )}
      </TagContainer>

      {/* Tag statistics */}
      {(maxTags || tags.length > 0) && tagStatsText}
    </StyledTagChipGroup>
  )
}

// Preset variants for common use cases
export const TagChipGroupDisplay: React.FC<
  Omit<TagChipGroupProps, 'variant'>
> = props => <TagChipGroup variant="display" {...props} />

export const TagChipGroupEditable: React.FC<
  Omit<TagChipGroupProps, 'variant'>
> = props => <TagChipGroup variant="editable" {...props} />

export const TagChipGroupSelectable: React.FC<
  Omit<TagChipGroupProps, 'variant'>
> = props => <TagChipGroup variant="selectable" {...props} />
