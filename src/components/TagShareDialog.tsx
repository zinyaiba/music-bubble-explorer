/**
 * TagShareDialog コンポーネント
 * タグ共有テキスト編集用のダイアログ
 * TagEditDialogと同じパターンで実装
 */

import React, { useState, useEffect, useCallback } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { tagShareService } from '@/services/tagShareService'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

export interface TagShareDialogProps {
  isOpen: boolean
  tagName: string
  onClose: () => void
  onShareSuccess?: () => void
  onShareError?: (error: string) => void
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
  max-width: 360px;
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
    content: '🔗';
    font-size: 16px;
  }
`

const TextareaContainer = styled.div`
  margin-bottom: 8px;
`

const Textarea = styled.textarea<{ $theme: any; $hasError: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 2px solid
    ${props => (props.$hasError ? '#dc3545' : 'rgba(29, 161, 242, 0.3)')};
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  background: rgba(255, 255, 255, 0.9);
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: ${props => (props.$hasError ? '#dc3545' : '#1da1f2')};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$hasError ? 'rgba(220, 53, 69, 0.2)' : 'rgba(29, 161, 242, 0.2)'};
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const CharCount = styled.span<{ $isOver: boolean }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => (props.$isOver ? '#dc3545' : '#6b7280')};
`

const ResetButton = styled.button`
  padding: 4px 10px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #374151;
  }

  &:active {
    background: rgba(0, 0, 0, 0.15);
  }
`

const SuccessMessage = styled.div`
  margin-bottom: 12px;
  padding: 10px 12px;
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.15),
    rgba(69, 160, 73, 0.15)
  );
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2e7d32;
  text-align: center;

  &::before {
    content: '✓ ';
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
  $isSuccess?: boolean
}>`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  cursor: ${props => (props.$isLoading ? 'wait' : 'pointer')};
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;

  background: ${props => {
    if (props.$isLoading) return '#e5e7eb'
    if (props.$isSuccess) return 'linear-gradient(135deg, #4caf50, #45a049)'
    return props.$variant === 'primary'
      ? 'linear-gradient(135deg, #1da1f2, #0d8bd9)'
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

export const TagShareDialog: React.FC<TagShareDialogProps> = ({
  isOpen,
  tagName,
  onClose,
  onShareSuccess,
  onShareError,
}) => {
  const theme = useGlassmorphismTheme()
  const [shareText, setShareText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // ダイアログが開いたときにテキストを生成
  useEffect(() => {
    if (isOpen && tagName) {
      const generatedText = tagShareService.generateShareText({ tagName })
      setShareText(generatedText)
      setCopySuccess(false)
    }
  }, [isOpen, tagName])

  // ESCキーでキャンセル
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose()
    }
  }

  const handleReset = useCallback(() => {
    const generatedText = tagShareService.generateShareText({ tagName })
    setShareText(generatedText)
    setCopySuccess(false)
  }, [tagName])

  const handleCopy = useCallback(async () => {
    if (isLoading || !shareText.trim()) return

    setIsLoading(true)
    setCopySuccess(false)

    try {
      const result = await tagShareService.copyToClipboard(shareText)

      if (result.success) {
        tagShareService.triggerHapticFeedback()
        setCopySuccess(true)
        onShareSuccess?.()

        // 1.5秒後にダイアログを閉じる
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        onShareError?.(result.message)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'コピーに失敗しました'
      onShareError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [shareText, isLoading, onClose, onShareSuccess, onShareError])

  // X用の文字数カウント（URLは23文字固定）
  const charCount = tagShareService.countTweetLength(shareText)
  const isOverLimit = charCount > 140

  return (
    <Overlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <DialogBox $theme={theme}>
        <DialogTitle $theme={theme} id="share-dialog-title">
          Xで共有(コピーしてね)
        </DialogTitle>

        <TextareaContainer>
          <Textarea
            $theme={theme}
            $hasError={isOverLimit}
            value={shareText}
            onChange={e => {
              setShareText(e.target.value)
              setCopySuccess(false)
            }}
            placeholder="共有テキストを入力..."
            disabled={isLoading}
            aria-invalid={isOverLimit}
          />
        </TextareaContainer>

        <InfoRow>
          <CharCount $isOver={isOverLimit}>
            {charCount}/140文字{isOverLimit && ' ⚠️'}
          </CharCount>
          <ResetButton onClick={handleReset} type="button">
            🔄 リセット
          </ResetButton>
        </InfoRow>

        {copySuccess && (
          <SuccessMessage>コピーしました！Xに貼り付けてね</SuccessMessage>
        )}

        <ButtonGroup>
          <Button
            $theme={theme}
            $variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            キャンセル
          </Button>
          <Button
            $theme={theme}
            $variant="primary"
            $isLoading={isLoading}
            $isSuccess={copySuccess}
            onClick={handleCopy}
            disabled={isLoading || !shareText.trim()}
            type="button"
          >
            {isLoading
              ? 'コピー中...'
              : copySuccess
                ? '✓ コピー完了'
                : '📋 コピー'}
          </Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  )
}

export default TagShareDialog
