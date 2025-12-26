/**
 * TagEditDialog コンポーネント
 * タグ名編集用のダイアログ
 */

import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

export interface TagEditDialogProps {
  isOpen: boolean
  tagName: string
  onSave: (newName: string) => void
  onCancel: () => void
  isLoading?: boolean
  error?: string | null
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.2s ease;
  padding: 12px;
  box-sizing: border-box;
`

const DialogBox = styled.div<{ $theme: any }>`
  max-width: 320px;
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: ${props =>
    props.$theme.colors?.surface || 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.25s ease;
`

const DialogTitle = styled.h3<{ $theme: any }>`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  display: flex;
  align-items: center;
  gap: 6px;
  &::before {
    content: '✏️';
    font-size: 16px;
  }
`

const InputContainer = styled.div`
  margin-bottom: 12px;
`

const Input = styled.input<{ $theme: any; $hasError: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid
    ${props => (props.$hasError ? '#dc3545' : 'rgba(255, 182, 193, 0.5)')};
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: ${props => (props.$hasError ? '#dc3545' : '#ff69b4')};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$hasError
          ? 'rgba(220, 53, 69, 0.2)'
          : 'rgba(255, 105, 180, 0.2)'};
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  margin-top: 6px;
  padding: 6px 10px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #dc3545;

  &::before {
    content: '⚠️ ';
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button<{
  $theme: any
  $variant: 'primary' | 'secondary'
  $isLoading?: boolean
}>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  cursor: ${props => (props.$isLoading ? 'wait' : 'pointer')};
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;

  background: ${props => {
    if (props.$isLoading) return '#e5e7eb'
    return props.$variant === 'primary'
      ? 'linear-gradient(135deg, #ff69b4, #ff1493)'
      : 'rgba(255, 255, 255, 0.8)'
  }};

  color: ${props => (props.$variant === 'primary' ? '#ffffff' : '#374151')};
  border: ${props =>
    props.$variant === 'secondary' ? '1px solid #d1d5db' : 'none'};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const LoadingSpinner = styled.span`
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

export const TagEditDialog: React.FC<TagEditDialogProps> = ({
  isOpen,
  tagName,
  onSave,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const theme = useGlassmorphismTheme()
  const [editValue, setEditValue] = useState(tagName)
  const inputRef = useRef<HTMLInputElement>(null)

  // ダイアログが開いたときに値をリセットしてフォーカス
  useEffect(() => {
    if (isOpen) {
      setEditValue(tagName)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, tagName])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) onCancel()
  }

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === tagName || isLoading) return
    onSave(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape' && !isLoading) {
      onCancel()
    }
  }

  // ESCキーでキャンセル
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleGlobalKeyDown)
      return () => document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [isOpen, isLoading, onCancel])

  const isSaveDisabled =
    isLoading || !editValue.trim() || editValue.trim() === tagName

  return (
    <Overlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-dialog-title"
    >
      <DialogBox $theme={theme}>
        <DialogTitle $theme={theme} id="edit-dialog-title">
          タグ名を編集
        </DialogTitle>

        <InputContainer>
          <Input
            ref={inputRef}
            $theme={theme}
            $hasError={!!error}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="タグ名を入力..."
            disabled={isLoading}
            aria-invalid={!!error}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputContainer>

        <ButtonGroup>
          <Button
            $theme={theme}
            $variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            type="button"
          >
            キャンセル
          </Button>
          <Button
            $theme={theme}
            $variant="primary"
            $isLoading={isLoading}
            onClick={handleSave}
            disabled={isSaveDisabled}
            type="button"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                保存中
              </>
            ) : (
              '保存'
            )}
          </Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  )
}

export default TagEditDialog
