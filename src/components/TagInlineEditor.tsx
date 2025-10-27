import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

// Props interface for TagInlineEditor component
export interface TagInlineEditorProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
  selectAllOnFocus?: boolean
  validateInput?: (value: string) => string | null // Returns error message or null
  className?: string
  'aria-label'?: string
}

// Styled components
const EditorContainer = styled.div<{
  $theme: any
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  max-width: 300px;
`

const EditorInput = styled.input<{
  $theme: any
  $hasError: boolean
}>`
  background: ${props => props.$theme.colors.surface};
  border: 2px solid
    ${props =>
      props.$hasError
        ? props.$theme.colors.primary[400]
        : props.$theme.colors.accent};
  border-radius: 12px;
  padding: 6px 12px;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props => props.$theme.colors.text.onGlass};
  outline: none;
  width: 100%;
  min-width: 80px;

  /* Glassmorphism effect */
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  box-shadow: ${props => props.$theme.effects.shadows.medium};

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &::placeholder {
    color: ${props => props.$theme.colors.neutral[400]};
  }

  &:focus {
    border-color: ${props => props.$theme.colors.accent};
    box-shadow: ${props => props.$theme.effects.shadows.strong};
    transform: scale(1.02);
  }

  /* Error state */
  ${props =>
    props.$hasError &&
    `
    border-color: ${props.$theme.colors.primary[400]};
    background: ${props.$theme.colors.primary[50]};
  `}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */

    &:focus {
      transform: none;
    }
  }
`

const ActionButtons = styled.div<{
  $theme: any
}>`
  display: flex;
  gap: 4px;
  align-items: center;
`

const ActionButton = styled.button<{
  $theme: any
  $variant: 'save' | 'cancel'
}>`
  background: ${props => {
    switch (props.$variant) {
      case 'save':
        return props.$theme.colors.glass.tinted
      case 'cancel':
        return props.$theme.colors.glass.light
      default:
        return props.$theme.colors.glass.medium
    }
  }};

  border: 1px solid
    ${props => {
      switch (props.$variant) {
        case 'save':
          return props.$theme.colors.accent
        case 'cancel':
          return props.$theme.colors.neutral[300]
        default:
          return props.$theme.effects.borders.glass
      }
    }};

  border-radius: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  color: ${props => props.$theme.colors.text.onGlass};

  /* Glassmorphism effect */
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover {
    transform: scale(1.1);
    background: ${props => {
      switch (props.$variant) {
        case 'save':
          return props.$theme.colors.glass.strong
        case 'cancel':
          return props.$theme.colors.glass.medium
        default:
          return props.$theme.colors.glass.strong
      }
    }};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 1px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;

    &:hover {
      transform: none;
    }
  }
`

const ErrorMessage = styled.div<{
  $theme: any
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 4px 8px;
  background: ${props => props.$theme.colors.primary[100]};
  border: 1px solid ${props => props.$theme.colors.primary[300]};
  border-radius: 8px;
  font-size: 12px;
  color: ${props => props.$theme.colors.primary[500]};
  font-family: ${props => props.$theme.typography.fontFamily};
  z-index: 10;

  /* Glassmorphism effect */
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  box-shadow: ${props => props.$theme.effects.shadows.subtle};
`

const KeyboardHints = styled.div<{
  $theme: any
}>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  padding: 2px 6px;
  background: ${props => props.$theme.colors.glass.light};
  border: 1px solid ${props => props.$theme.colors.neutral[200]};
  border-radius: 6px;
  font-size: 10px;
  color: ${props => props.$theme.colors.text.secondary};
  font-family: ${props => props.$theme.typography.fontFamily};
  white-space: nowrap;
  z-index: 10;

  /* Glassmorphism effect */
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};

  .key {
    background: ${props => props.$theme.colors.neutral[100]};
    border: 1px solid ${props => props.$theme.colors.neutral[300]};
    border-radius: 3px;
    padding: 1px 3px;
    margin: 0 1px;
    font-weight: ${props => props.$theme.typography.fontWeights.medium};
  }
`

/**
 * TagInlineEditor component
 * Provides inline editing functionality with glassmorphism styling and keyboard shortcuts
 *
 * Requirements: 5.2, 5.3, 5.5
 */
export const TagInlineEditor: React.FC<TagInlineEditorProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = 'タグを入力...',
  maxLength = 50,
  autoFocus = true,
  selectAllOnFocus = true,
  validateInput,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const theme = useGlassmorphismTheme()
  const [editValue, setEditValue] = useState(value)
  const [error, setError] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus and select text on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
      if (selectAllOnFocus) {
        inputRef.current.select()
      }
    }
  }, [autoFocus, selectAllOnFocus])

  // Validate input when value changes
  useEffect(() => {
    if (validateInput) {
      const errorMessage = validateInput(editValue.trim())
      setError(errorMessage)
    } else {
      setError(null)
    }
  }, [editValue, validateInput])

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (maxLength && newValue.length > maxLength) return
      setEditValue(newValue)
    },
    [maxLength]
  )

  // Handle save action
  const handleSave = useCallback(() => {
    const trimmedValue = editValue.trim()

    // Validate before saving
    if (validateInput) {
      const errorMessage = validateInput(trimmedValue)
      if (errorMessage) {
        setError(errorMessage)
        return
      }
    }

    // Don't save if empty or unchanged
    if (!trimmedValue || trimmedValue === value) {
      onCancel()
      return
    }

    onSave(trimmedValue)
  }, [editValue, value, validateInput, onSave, onCancel])

  // Handle cancel action
  const handleCancel = useCallback(() => {
    setEditValue(value)
    setError(null)
    onCancel()
  }, [value, onCancel])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          handleSave()
          break
        case 'Escape':
          e.preventDefault()
          handleCancel()
          break
        case 'Tab':
          // Allow tab to save and move to next element
          if (!e.shiftKey) {
            e.preventDefault()
            handleSave()
          }
          break
      }
    },
    [handleSave, handleCancel]
  )

  // Handle input focus/blur for hints
  const handleInputFocus = useCallback(() => {
    setShowHints(true)
  }, [])

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // Don't blur if clicking on action buttons
      const relatedTarget = e.relatedTarget as HTMLElement
      if (relatedTarget && relatedTarget.closest('.action-buttons')) {
        return
      }

      setShowHints(false)
      // Auto-save on blur if no error
      if (!error) {
        handleSave()
      }
    },
    [error, handleSave]
  )

  // Check if save is disabled
  const isSaveDisabled =
    !!error || !editValue.trim() || editValue.trim() === value

  return (
    <EditorContainer $theme={theme} className={className} {...props}>
      <EditorInput
        ref={inputRef}
        $theme={theme}
        $hasError={!!error}
        value={editValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={ariaLabel || 'タグを編集'}
        aria-invalid={!!error}
        aria-describedby={error ? 'tag-editor-error' : undefined}
      />

      <ActionButtons $theme={theme} className="action-buttons">
        <ActionButton
          $theme={theme}
          $variant="save"
          onClick={handleSave}
          disabled={isSaveDisabled}
          title="保存 (Enter)"
          aria-label="保存"
          type="button"
        >
          ✓
        </ActionButton>

        <ActionButton
          $theme={theme}
          $variant="cancel"
          onClick={handleCancel}
          title="キャンセル (Escape)"
          aria-label="キャンセル"
          type="button"
        >
          ×
        </ActionButton>
      </ActionButtons>

      {/* Error message */}
      {error && (
        <ErrorMessage $theme={theme} id="tag-editor-error" role="alert">
          {error}
        </ErrorMessage>
      )}

      {/* Keyboard hints */}
      {showHints && !error && (
        <KeyboardHints $theme={theme}>
          <span className="key">Enter</span>保存
          <span className="key">Esc</span>キャンセル
        </KeyboardHints>
      )}
    </EditorContainer>
  )
}

// Hook for managing inline editing state
export const useTagInlineEditor = (initialTags: string[] = []) => {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Start editing existing tag
  const startEditing = useCallback((index: number) => {
    setEditingIndex(index)
    setIsAddingNew(false)
  }, [])

  // Start adding new tag
  const startAddingNew = useCallback(() => {
    setIsAddingNew(true)
    setEditingIndex(null)
  }, [])

  // Save edited tag
  const saveTag = useCallback((index: number, newValue: string) => {
    setTags(prev => {
      const newTags = [...prev]
      newTags[index] = newValue
      return newTags
    })
    setEditingIndex(null)
  }, [])

  // Save new tag
  const saveNewTag = useCallback(
    (newValue: string) => {
      if (newValue.trim() && !tags.includes(newValue.trim())) {
        setTags(prev => [...prev, newValue.trim()])
      }
      setIsAddingNew(false)
    },
    [tags]
  )

  // Remove tag
  const removeTag = useCallback(
    (index: number) => {
      setTags(prev => prev.filter((_, i) => i !== index))
      if (editingIndex === index) {
        setEditingIndex(null)
      }
    },
    [editingIndex]
  )

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingIndex(null)
    setIsAddingNew(false)
  }, [])

  // Validation function for tags
  const validateTag = useCallback(
    (value: string): string | null => {
      const trimmed = value.trim()

      if (!trimmed) {
        return 'タグは空にできません'
      }

      if (trimmed.length > 50) {
        return 'タグは50文字以内で入力してください'
      }

      if (
        tags.includes(trimmed) &&
        editingIndex !== null &&
        tags[editingIndex] !== trimmed
      ) {
        return 'このタグは既に存在します'
      }

      if (
        !/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\s\-_]+$/.test(
          trimmed
        )
      ) {
        return '使用できない文字が含まれています'
      }

      return null
    },
    [tags, editingIndex]
  )

  return {
    tags,
    setTags,
    editingIndex,
    isAddingNew,
    startEditing,
    startAddingNew,
    saveTag,
    saveNewTag,
    removeTag,
    cancelEditing,
    validateTag,
  }
}

// Utility function to create keyboard shortcut handlers
export const createKeyboardShortcuts = (
  onSave: () => void,
  onCancel: () => void,
  onEdit?: () => void
) => {
  return (e: KeyboardEvent) => {
    // Check if we're in an input field
    const target = e.target as HTMLElement
    const isInInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

    // Global shortcuts (work outside of inputs)
    if (!isInInput) {
      switch (e.key) {
        case 'e':
        case 'E':
          if (onEdit && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault()
            onEdit()
          }
          break
        case 'Escape':
          e.preventDefault()
          onCancel()
          break
      }
    }

    // Input-specific shortcuts
    if (isInInput) {
      switch (e.key) {
        case 'Enter':
          if (!e.shiftKey) {
            e.preventDefault()
            onSave()
          }
          break
        case 'Escape':
          e.preventDefault()
          onCancel()
          break
      }
    }
  }
}
