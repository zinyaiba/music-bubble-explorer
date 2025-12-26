/**
 * TagInlineEditor コンポーネント
 * タグ一覧画面でのインライン編集UI
 * Requirements: 1.1, 3.1, 3.4
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import './TagInlineEditor.css'

/**
 * TagInlineEditorのプロパティ（設計ドキュメント準拠）
 * Requirements: 1.1 - インライン編集フィールドを表示
 */
export interface TagInlineEditorProps {
  /** 現在のタグ名 */
  tagName: string
  /** 編集中かどうか */
  isEditing: boolean
  /** 保存時のコールバック */
  onSave: (newName: string) => void
  /** キャンセル時のコールバック */
  onCancel: () => void
  /** ローディング状態 */
  isLoading?: boolean
  /** エラーメッセージ */
  error?: string | null
  /** クラス名 */
  className?: string
  /** aria-label */
  'aria-label'?: string
}

/**
 * 旧インターフェース（TagChip互換）
 */
export interface LegacyTagInlineEditorProps {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
  selectAllOnFocus?: boolean
  validateInput?: (value: string) => string | null
  className?: string
  'aria-label'?: string
}

// Styled components
const EditorContainer = styled.div<{
  $theme: any
  $isHighlighted?: boolean
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  max-width: 100%;
  width: 100%;

  ${props =>
    props.$isHighlighted &&
    `
    background: ${props.$theme.colors.glass?.tinted || 'rgba(255, 182, 193, 0.15)'};
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 0 0 2px ${props.$theme.colors.accent || '#ff69b4'};
  `}
`

const EditorInput = styled.input<{
  $theme: any
  $hasError: boolean
  $isLoading: boolean
}>`
  background: ${props =>
    props.$theme.colors?.surface || 'rgba(255, 255, 255, 0.95)'};
  border: 2px solid
    ${props =>
      props.$hasError
        ? props.$theme.colors?.error?.main || '#dc3545'
        : props.$theme.colors?.accent || '#ff69b4'};
  border-radius: 12px;
  padding: 8px 12px;
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography?.fontWeights?.medium || 500};
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  outline: none;
  width: 100%;
  min-width: 80px;
  min-height: 44px; /* Requirements: 4.1 - タッチターゲットサイズ */
  box-sizing: border-box;

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(255, 182, 193, 0.2);

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &::placeholder {
    color: ${props => props.$theme.colors?.text?.light || '#9ca3af'};
  }

  &:focus {
    border-color: ${props => props.$theme.colors?.accent || '#ff69b4'};
    box-shadow:
      0 0 0 3px rgba(255, 105, 180, 0.2),
      0 4px 12px rgba(255, 182, 193, 0.3);
  }

  /* Error state */
  ${props =>
    props.$hasError &&
    `
    border-color: ${props.$theme.colors?.error?.main || '#dc3545'};
    background: rgba(220, 53, 69, 0.05);
  `}

  /* Loading state */
  ${props =>
    props.$isLoading &&
    `
    opacity: 0.7;
    cursor: wait;
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(240, 240, 240, 0.8);
  }

  /* Responsive - prevent zoom on iOS */
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 10px 14px;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
`

const ActionButton = styled.button<{
  $theme: any
  $variant: 'save' | 'cancel'
  $isLoading?: boolean
}>`
  background: ${props => {
    if (props.$isLoading)
      return props.$theme.colors?.neutral?.[200] || '#e5e7eb'
    switch (props.$variant) {
      case 'save':
        return 'linear-gradient(135deg, #98fb98, #90ee90)'
      case 'cancel':
        return props.$theme.colors?.glass?.light || 'rgba(255, 255, 255, 0.8)'
      default:
        return props.$theme.colors?.glass?.medium || 'rgba(255, 255, 255, 0.6)'
    }
  }};

  border: 2px solid
    ${props => {
      switch (props.$variant) {
        case 'save':
          return '#90ee90'
        case 'cancel':
          return props.$theme.colors?.neutral?.[300] || '#d1d5db'
        default:
          return 'transparent'
      }
    }};

  border-radius: 10px;
  min-width: 44px; /* Requirements: 4.1 - タッチターゲットサイズ */
  min-height: 44px; /* Requirements: 4.1 - タッチターゲットサイズ */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => (props.$isLoading ? 'wait' : 'pointer')};
  font-size: 16px;
  color: ${props => {
    switch (props.$variant) {
      case 'save':
        return '#2d5016'
      case 'cancel':
        return props.$theme.colors?.text?.secondary || '#6b7280'
      default:
        return props.$theme.colors?.text?.primary || '#374151'
    }
  }};

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Smooth transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    ${props =>
      props.$variant === 'save' &&
      `
      background: linear-gradient(135deg, #90ee90, #7dd87d);
    `}
    ${props =>
      props.$variant === 'cancel' &&
      `
      background: rgba(255, 182, 193, 0.3);
      border-color: #ffb6c1;
    `}
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid ${props => props.$theme.colors?.accent || '#ff69b4'};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    min-width: 48px;
    min-height: 48px;
    font-size: 18px;
  }
`

const ErrorMessage = styled.div<{
  $theme: any
}>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  padding: 8px 12px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 10px;
  font-size: 13px;
  color: #dc3545;
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  z-index: 10;

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);

  &::before {
    content: '⚠️ ';
  }
`

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 182, 193, 0.3);
  border-top-color: #ff69b4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const KeyboardHints = styled.div<{
  $theme: any
}>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 182, 193, 0.3);
  border-radius: 8px;
  font-size: 11px;
  color: ${props => props.$theme.colors?.text?.secondary || '#6b7280'};
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  white-space: nowrap;
  z-index: 10;

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  .key {
    background: rgba(255, 182, 193, 0.2);
    border: 1px solid rgba(255, 182, 193, 0.4);
    border-radius: 4px;
    padding: 2px 5px;
    margin: 0 2px;
    font-weight: 600;
    font-size: 10px;
  }
`

/**
 * TagInlineEditor コンポーネント
 * タグ一覧画面でのインライン編集UI
 *
 * Requirements:
 * - 1.1: 編集ボタンをクリックした時にインライン編集フィールドを表示
 * - 3.1: ローディングインジケーターを表示
 * - 3.4: 編集中のタグ項目をハイライト表示
 */
export const TagInlineEditor: React.FC<TagInlineEditorProps> = ({
  tagName,
  isEditing,
  onSave,
  onCancel,
  isLoading = false,
  error = null,
  className,
  'aria-label': ariaLabel,
}) => {
  const theme = useGlassmorphismTheme()
  const [editValue, setEditValue] = useState(tagName)
  const [showHints, setShowHints] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // タグ名が変更されたら編集値を更新
  useEffect(() => {
    setEditValue(tagName)
  }, [tagName])

  // 編集開始時にフォーカスと全選択
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  // 入力値の変更処理
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isLoading) return
      setEditValue(e.target.value)
    },
    [isLoading]
  )

  // 保存処理
  const handleSave = useCallback(() => {
    if (isLoading) return
    const trimmedValue = editValue.trim()

    // 空の場合はキャンセル扱い
    if (!trimmedValue) {
      onCancel()
      return
    }

    // 変更がない場合もキャンセル扱い
    if (trimmedValue === tagName) {
      onCancel()
      return
    }

    onSave(trimmedValue)
  }, [editValue, tagName, isLoading, onSave, onCancel])

  // キャンセル処理
  const handleCancel = useCallback(() => {
    if (isLoading) return
    setEditValue(tagName)
    onCancel()
  }, [tagName, isLoading, onCancel])

  // キーボードショートカット処理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isLoading) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          handleSave()
          break
        case 'Escape':
          e.preventDefault()
          handleCancel()
          break
      }
    },
    [isLoading, handleSave, handleCancel]
  )

  // フォーカス時にヒント表示
  const handleInputFocus = useCallback(() => {
    setShowHints(true)
  }, [])

  // ブラー時の処理
  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      // アクションボタンをクリックした場合はブラーを無視
      const relatedTarget = e.relatedTarget as HTMLElement
      if (
        relatedTarget &&
        relatedTarget.closest('.tag-inline-editor-actions')
      ) {
        return
      }
      setShowHints(false)
    },
    []
  )

  // 編集中でない場合は何も表示しない
  if (!isEditing) {
    return null
  }

  const isSaveDisabled =
    isLoading || !editValue.trim() || editValue.trim() === tagName

  return (
    <EditorContainer
      $theme={theme}
      $isHighlighted={true}
      className={`tag-inline-editor ${className || ''}`}
    >
      <EditorInput
        ref={inputRef}
        $theme={theme}
        $hasError={!!error}
        $isLoading={isLoading}
        value={editValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder="タグ名を入力..."
        disabled={isLoading}
        aria-label={ariaLabel || `タグ「${tagName}」を編集`}
        aria-invalid={!!error}
        aria-describedby={error ? 'tag-editor-error' : undefined}
        aria-busy={isLoading}
      />

      <ActionButtons className="tag-inline-editor-actions">
        <ActionButton
          $theme={theme}
          $variant="save"
          $isLoading={isLoading}
          onClick={handleSave}
          disabled={isSaveDisabled}
          title="保存 (Enter)"
          aria-label="保存"
          type="button"
        >
          {isLoading ? <LoadingSpinner /> : '✓'}
        </ActionButton>

        <ActionButton
          $theme={theme}
          $variant="cancel"
          $isLoading={isLoading}
          onClick={handleCancel}
          disabled={isLoading}
          title="キャンセル (Escape)"
          aria-label="キャンセル"
          type="button"
        >
          ×
        </ActionButton>
      </ActionButtons>

      {/* エラーメッセージ - Requirements: 3.2 */}
      {error && (
        <ErrorMessage $theme={theme} id="tag-editor-error" role="alert">
          {error}
        </ErrorMessage>
      )}

      {/* キーボードヒント */}
      {showHints && !error && !isLoading && (
        <KeyboardHints $theme={theme}>
          <span className="key">Enter</span>保存
          <span className="key">Esc</span>キャンセル
        </KeyboardHints>
      )}
    </EditorContainer>
  )
}

/**
 * LegacyTagInlineEditor コンポーネント
 * TagChip互換の旧インターフェース
 */
export const LegacyTagInlineEditor: React.FC<LegacyTagInlineEditorProps> = ({
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
          if (!e.shiftKey) {
            e.preventDefault()
            handleSave()
          }
          break
      }
    },
    [handleSave, handleCancel]
  )

  const handleInputFocus = useCallback(() => {
    setShowHints(true)
  }, [])

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      if (relatedTarget && relatedTarget.closest('.action-buttons')) {
        return
      }
      setShowHints(false)
      if (!error) {
        handleSave()
      }
    },
    [error, handleSave]
  )

  const isSaveDisabled =
    !!error || !editValue.trim() || editValue.trim() === value

  return (
    <EditorContainer $theme={theme} className={className}>
      <EditorInput
        ref={inputRef}
        $theme={theme}
        $hasError={!!error}
        $isLoading={false}
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

      <ActionButtons className="action-buttons">
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

      {error && (
        <ErrorMessage $theme={theme} id="tag-editor-error" role="alert">
          {error}
        </ErrorMessage>
      )}

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

  const startEditing = useCallback((index: number) => {
    setEditingIndex(index)
    setIsAddingNew(false)
  }, [])

  const startAddingNew = useCallback(() => {
    setIsAddingNew(true)
    setEditingIndex(null)
  }, [])

  const saveTag = useCallback((index: number, newValue: string) => {
    setTags(prev => {
      const newTags = [...prev]
      newTags[index] = newValue
      return newTags
    })
    setEditingIndex(null)
  }, [])

  const saveNewTag = useCallback(
    (newValue: string) => {
      if (newValue.trim() && !tags.includes(newValue.trim())) {
        setTags(prev => [...prev, newValue.trim()])
      }
      setIsAddingNew(false)
    },
    [tags]
  )

  const removeTag = useCallback(
    (index: number) => {
      setTags(prev => prev.filter((_, i) => i !== index))
      if (editingIndex === index) {
        setEditingIndex(null)
      }
    },
    [editingIndex]
  )

  const cancelEditing = useCallback(() => {
    setEditingIndex(null)
    setIsAddingNew(false)
  }, [])

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
    const target = e.target as HTMLElement
    const isInInput =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable

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

export default TagInlineEditor
