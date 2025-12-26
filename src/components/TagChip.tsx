import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { LegacyTagInlineEditor } from './TagInlineEditor'

// Props interface for TagChip component
export interface TagChipProps {
  tag: string
  variant?: 'default' | 'selected' | 'editable' | 'removable'
  size?: 'small' | 'medium' | 'large'
  isEditing?: boolean
  onEdit?: (newTag: string) => void
  onRemove?: () => void
  onSelect?: () => void
  maxLength?: number
  showFullText?: boolean
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

// Styled component for the tag chip
const StyledTagChip = styled.div<{
  $variant: 'default' | 'selected' | 'editable' | 'removable'
  $size: 'small' | 'medium' | 'large'
  $isEditing: boolean
  $showFullText: boolean
  $disabled: boolean
  $theme: any
}>`
  /* Base glassmorphism styles */
  background: ${props => {
    if (props.$disabled) return props.$theme.colors.neutral[100]

    switch (props.$variant) {
      case 'selected':
        return props.$theme.colors.glass.tinted
      case 'editable':
        return props.$theme.colors.glass.medium
      case 'removable':
        return props.$theme.colors.glass.strong
      default:
        return props.$theme.colors.glass.light
    }
  }};

  /* Backdrop filter for blur effect */
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};

  /* Border styling */
  border: ${props => {
    if (props.$disabled) return `1px solid ${props.$theme.colors.neutral[200]}`

    switch (props.$variant) {
      case 'selected':
        return props.$theme.effects.borders.accent
      case 'editable':
        return props.$theme.effects.borders.glass
      default:
        return props.$theme.effects.borders.subtle
    }
  }};

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
  gap: 6px;
  position: relative;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props =>
    props.$disabled
      ? props.$theme.colors.neutral[400]
      : props.$theme.colors.text.onGlass};

  /* Text handling */
  white-space: ${props =>
    props.$showFullText || props.$isEditing ? 'nowrap' : 'nowrap'};
  overflow: ${props =>
    props.$showFullText || props.$isEditing ? 'visible' : 'hidden'};
  text-overflow: ${props =>
    props.$showFullText || props.$isEditing ? 'clip' : 'ellipsis'};
  max-width: ${props =>
    props.$showFullText || props.$isEditing ? 'none' : '120px'};

  /* Box shadow for depth */
  box-shadow: ${props => {
    if (props.$disabled) return 'none'

    switch (props.$variant) {
      case 'selected':
        return props.$theme.effects.shadows.colored
      case 'editable':
        return props.$theme.effects.shadows.medium
      default:
        return props.$theme.effects.shadows.subtle
    }
  }};

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Interactive states */
  ${props =>
    !props.$disabled &&
    (props.onClick || props.$variant === 'editable') &&
    `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: ${props.$theme.effects.shadows.medium};
      background: ${
        props.$variant === 'selected'
          ? props.$theme.colors.glass.strong
          : props.$theme.colors.glass.medium
      };
    }
    
    &:active {
      transform: translateY(0);
      transition: all 0.1s ease;
    }
  `}

  /* Focus styles for accessibility */
  &:focus-within {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }

  /* Editing state styles */
  ${props =>
    props.$isEditing &&
    `
    background: ${props.$theme.colors.surface};
    border: 2px solid ${props.$theme.colors.accent};
    box-shadow: ${props.$theme.effects.shadows.strong};
    min-width: 80px;
    max-width: none;
  `}

  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    cursor: not-allowed;
    opacity: 0.6;
  `}
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${props =>
      props.$size === 'large' &&
      `
      padding: 6px 12px;
      font-size: 14px;
      border-radius: 16px;
      min-height: 32px;
    `}

    &:hover {
      transform: none; /* Disable hover transform on mobile */
    }

    &:active {
      transform: scale(0.95);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid ${props => props.$theme.colors.neutral[400]};
    background: ${props => props.$theme.colors.surface};
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`

const ChipInput = styled.input<{
  $theme: any
}>`
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
  width: 100%;
  min-width: 60px;

  &::placeholder {
    color: ${props => props.$theme.colors.neutral[400]};
  }
`

const RemoveButton = styled.button<{
  $theme: any
  $size: 'small' | 'medium' | 'large'
}>`
  background: ${props => props.$theme.colors.glass.light};
  border: 1px solid ${props => props.$theme.colors.neutral[300]};
  border-radius: 50%;
  color: ${props => props.$theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          width: 16px;
          height: 16px;
          font-size: 10px;
        `
      case 'large':
        return `
          width: 24px;
          height: 24px;
          font-size: 14px;
        `
      default: // medium
        return `
          width: 20px;
          height: 20px;
          font-size: 12px;
        `
    }
  }}

  &:hover {
    background: ${props => props.$theme.colors.primary[200]};
    color: ${props => props.$theme.colors.primary[500]};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 1px;
  }
`

/**
 * TagChip component
 * A glassmorphism-styled chip component for displaying and editing tags
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export const TagChip: React.FC<TagChipProps> = ({
  tag,
  variant = 'default',
  size = 'medium',
  isEditing = false,
  onEdit,
  onRemove,
  onSelect,
  maxLength = 50,
  showFullText = false,
  className,
  disabled = false,
  'aria-label': ariaLabel,
  ...props
}) => {
  const theme = useGlassmorphismTheme()
  const [editValue, setEditValue] = useState(tag)
  const [isInternalEditing, setIsInternalEditing] = useState(isEditing)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isInternalEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isInternalEditing])

  // Update edit value when tag prop changes
  useEffect(() => {
    setEditValue(tag)
  }, [tag])

  // Update internal editing state when prop changes
  useEffect(() => {
    setIsInternalEditing(isEditing)
  }, [isEditing])

  // Handle chip click for selection or editing
  const handleChipClick = useCallback(() => {
    if (disabled) return

    if (variant === 'editable' && onEdit && !isInternalEditing) {
      setIsInternalEditing(true)
    } else if (onSelect) {
      onSelect()
    }
  }, [disabled, variant, onEdit, onSelect, isInternalEditing])

  // Handle input change during editing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (maxLength && value.length > maxLength) return
      setEditValue(value)
    },
    [maxLength]
  )

  // Handle edit completion
  const handleEditComplete = useCallback(() => {
    const trimmedValue = editValue.trim()
    if (trimmedValue && trimmedValue !== tag && onEdit) {
      onEdit(trimmedValue)
    } else {
      setEditValue(tag) // Reset to original value if no change or empty
    }
    setIsInternalEditing(false)
  }, [editValue, tag, onEdit])

  // Handle edit cancellation
  const handleEditCancel = useCallback(() => {
    setEditValue(tag)
    setIsInternalEditing(false)
  }, [tag])

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isInternalEditing) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault()
            handleEditComplete()
            break
          case 'Escape':
            e.preventDefault()
            handleEditCancel()
            break
        }
      } else {
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault()
            handleChipClick()
            break
          case 'Delete':
          case 'Backspace':
            if (onRemove && variant === 'removable') {
              e.preventDefault()
              onRemove()
            }
            break
        }
      }
    },
    [
      isInternalEditing,
      handleEditComplete,
      handleEditCancel,
      handleChipClick,
      onRemove,
      variant,
    ]
  )

  // Handle input blur (finish editing)
  const handleInputBlur = useCallback(() => {
    handleEditComplete()
  }, [handleEditComplete])

  // Handle remove button click
  const handleRemoveClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (onRemove) {
        onRemove()
      }
    },
    [onRemove]
  )

  // Determine display text
  const displayText = isInternalEditing ? editValue : tag
  const shouldShowFullText = showFullText || isInternalEditing

  // If editing with advanced inline editor
  if (isInternalEditing && variant === 'editable') {
    return (
      <LegacyTagInlineEditor
        value={editValue}
        onSave={handleEditComplete}
        onCancel={handleEditCancel}
        maxLength={maxLength}
        placeholder="タグを入力..."
        className={className}
        aria-label={ariaLabel || `タグ「${tag}」を編集`}
      />
    )
  }

  return (
    <StyledTagChip
      $variant={variant}
      $size={size}
      $isEditing={isInternalEditing}
      $showFullText={shouldShowFullText}
      $disabled={disabled}
      $theme={theme}
      className={className}
      onClick={handleChipClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      role={variant === 'editable' ? 'textbox' : 'button'}
      aria-label={
        ariaLabel ||
        `タグ: ${tag}${variant === 'removable' ? ', 削除可能' : ''}${variant === 'editable' ? ', 編集可能' : ''}`
      }
      aria-expanded={isInternalEditing}
      {...props}
    >
      {isInternalEditing ? (
        <ChipInput
          ref={inputRef}
          $theme={theme}
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="タグを入力..."
          maxLength={maxLength}
          aria-label="タグを編集"
        />
      ) : (
        <span title={shouldShowFullText ? undefined : tag}>{displayText}</span>
      )}

      {variant === 'removable' && onRemove && !isInternalEditing && (
        <RemoveButton
          $theme={theme}
          $size={size}
          onClick={handleRemoveClick}
          aria-label={`タグ「${tag}」を削除`}
          type="button"
        >
          ×
        </RemoveButton>
      )}
    </StyledTagChip>
  )
}

// Preset variants for common use cases
export const TagChipDefault: React.FC<
  Omit<TagChipProps, 'variant'>
> = props => <TagChip variant="default" {...props} />

export const TagChipSelected: React.FC<
  Omit<TagChipProps, 'variant'>
> = props => <TagChip variant="selected" {...props} />

export const TagChipEditable: React.FC<
  Omit<TagChipProps, 'variant'>
> = props => <TagChip variant="editable" {...props} />

export const TagChipRemovable: React.FC<
  Omit<TagChipProps, 'variant'>
> = props => <TagChip variant="removable" {...props} />
