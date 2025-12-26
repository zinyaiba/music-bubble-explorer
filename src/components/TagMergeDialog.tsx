/**
 * TagMergeDialog コンポーネント
 * タグ統合の確認ダイアログ
 * Requirements: 2.1, 2.2, 4.3
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

/**
 * TagMergeDialogのプロパティ（設計ドキュメント準拠）
 * Requirements: 2.1, 2.2 - 統合確認ダイアログの表示
 */
export interface TagMergeDialogProps {
  /** ダイアログが開いているかどうか */
  isOpen: boolean
  /** 統合元タグ名 */
  sourceTag: string
  /** 統合先タグ名 */
  targetTag: string
  /** 統合元タグに紐づく楽曲数 */
  sourceSongCount: number
  /** 統合先タグに紐づく楽曲数 */
  targetSongCount: number
  /** 統合確認時のコールバック */
  onConfirm: () => void
  /** キャンセル時のコールバック */
  onCancel: () => void
  /** ローディング状態 */
  isLoading?: boolean
}

// Styled components
const Overlay = styled.div<{ $isOpen: boolean }>`
  /* Layout - Requirements: 4.3 - 中央配置 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;

  /* Visibility */
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;

  /* Background */
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);

  /* Animation */
  animation: ${fadeIn} 0.2s ease;

  /* Padding for mobile - Requirements: 4.3 - ビューポート内に収まる */
  padding: 20px;
  box-sizing: border-box;
`

const DialogBox = styled.div<{ $theme: any }>`
  /* Layout - Requirements: 4.3 - ビューポート内に収まる */
  max-width: 420px;
  width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 24px;
  border-radius: ${props => props.$theme.borderRadius?.large || '16px'};

  /* Background - Glassmorphism */
  background: ${props =>
    props.$theme.colors?.surface || 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* Animation */
  animation: ${slideUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive */
  @media (max-width: 768px) {
    padding: 20px;
    max-width: calc(100vw - 40px);
  }
`

const DialogTitle = styled.h3<{ $theme: any }>`
  /* Typography */
  margin: 0 0 16px 0;
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  font-size: 18px;
  font-weight: ${props =>
    props.$theme.typography?.fontWeights?.semiBold || 600};
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  display: flex;
  align-items: center;
  gap: 8px;

  /* Icon */
  &::before {
    content: '🔀';
    font-size: 20px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const DialogDescription = styled.p<{ $theme: any }>`
  /* Typography */
  margin: 0 0 20px 0;
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$theme.colors?.text?.secondary || '#6b7280'};
`

const MergeInfoContainer = styled.div<{ $theme: any }>`
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  border-radius: ${props => props.$theme.borderRadius?.medium || '12px'};

  /* Background */
  background: ${props =>
    props.$theme.colors?.glass?.light || 'rgba(255, 182, 193, 0.1)'};
  border: 1px solid
    ${props => props.$theme.colors?.border?.light || 'rgba(255, 182, 193, 0.3)'};
`

const MergeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const MergeArrow = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${props => props.$theme.colors?.accent || '#ff69b4'};
  padding: 8px 0;
`

const TagInfo = styled.div<{ $theme: any; $variant: 'source' | 'target' }>`
  /* Layout */
  flex: 1;
  padding: 12px 16px;
  border-radius: ${props => props.$theme.borderRadius?.medium || '12px'};

  /* Background based on variant */
  background: ${props => {
    switch (props.$variant) {
      case 'source':
        return 'rgba(255, 200, 200, 0.3)'
      case 'target':
        return 'rgba(200, 255, 200, 0.3)'
      default:
        return 'rgba(255, 255, 255, 0.5)'
    }
  }};

  border: 1px solid
    ${props => {
      switch (props.$variant) {
        case 'source':
          return 'rgba(255, 150, 150, 0.5)'
        case 'target':
          return 'rgba(150, 255, 150, 0.5)'
        default:
          return 'rgba(200, 200, 200, 0.5)'
      }
    }};
`

const TagLabel = styled.div<{ $theme: any }>`
  font-size: 11px;
  font-weight: ${props => props.$theme.typography?.fontWeights?.medium || 500};
  color: ${props => props.$theme.colors?.text?.secondary || '#6b7280'};
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const TagName = styled.div<{ $theme: any }>`
  font-size: 16px;
  font-weight: ${props =>
    props.$theme.typography?.fontWeights?.semiBold || 600};
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};
  word-break: break-word;
`

const SongCount = styled.div<{ $theme: any }>`
  font-size: 13px;
  color: ${props => props.$theme.colors?.text?.secondary || '#6b7280'};
  margin-top: 4px;
`

const WarningMessage = styled.div<{ $theme: any }>`
  /* Layout */
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  margin-bottom: 20px;
  border-radius: ${props => props.$theme.borderRadius?.medium || '12px'};

  /* Background */
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);

  /* Typography */
  font-size: 13px;
  line-height: 1.5;
  color: ${props => props.$theme.colors?.text?.primary || '#374151'};

  /* Icon */
  &::before {
    content: '⚠️';
    flex-shrink: 0;
  }
`

const ButtonGroup = styled.div`
  /* Layout */
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  /* Responsive */
  @media (max-width: 768px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`

const Button = styled.button<{
  $theme: any
  $variant: 'primary' | 'secondary'
  $isLoading?: boolean
}>`
  /* Layout */
  padding: 12px 24px;
  border: none;
  border-radius: ${props => props.$theme.borderRadius?.medium || '12px'};
  cursor: ${props => (props.$isLoading ? 'wait' : 'pointer')};
  min-width: 100px;
  min-height: 44px; /* Touch target size */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  /* Typography */
  font-family: ${props => props.$theme.typography?.fontFamily || 'inherit'};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography?.fontWeights?.medium || 500};

  /* Colors based on variant */
  background: ${props => {
    if (props.$isLoading)
      return props.$theme.colors?.neutral?.[200] || '#e5e7eb'
    switch (props.$variant) {
      case 'primary':
        return 'linear-gradient(135deg, #ff69b4, #ff1493)'
      case 'secondary':
        return props.$theme.colors?.glass?.light || 'rgba(255, 255, 255, 0.8)'
    }
  }};

  color: ${props => {
    switch (props.$variant) {
      case 'primary':
        return '#ffffff'
      case 'secondary':
        return props.$theme.colors?.text?.primary || '#374151'
    }
  }};

  border: ${props => {
    switch (props.$variant) {
      case 'primary':
        return 'none'
      case 'secondary':
        return `1px solid ${props.$theme.colors?.border?.medium || '#d1d5db'}`
    }
  }};

  /* Glassmorphism effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  /* Transitions */
  transition: all 0.2s ease;

  /* Hover state */
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    ${props =>
      props.$variant === 'primary' &&
      `
      background: linear-gradient(135deg, #ff1493, #dc1480);
    `}
    ${props =>
      props.$variant === 'secondary' &&
      `
      background: rgba(255, 182, 193, 0.2);
      border-color: #ffb6c1;
    `}
  }

  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Focus state */
  &:focus {
    outline: 2px solid ${props => props.$theme.colors?.accent || '#ff69b4'};
    outline-offset: 2px;
  }

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* Responsive */
  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 24px;
  }
`

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

/**
 * TagMergeDialog コンポーネント
 * タグ統合の確認ダイアログ
 *
 * Requirements:
 * - 2.1: 既存のタグ名と一致する場合に統合確認ダイアログを表示
 * - 2.2: 統合元タグ名、統合先タグ名、影響を受ける楽曲数を表示
 * - 4.3: モバイルデバイスで中央配置されビューポート内に収まる
 */
export const TagMergeDialog: React.FC<TagMergeDialogProps> = ({
  isOpen,
  sourceTag,
  targetTag,
  sourceSongCount,
  targetSongCount,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const theme = useGlassmorphismTheme()

  // オーバーレイクリックでキャンセル（ローディング中は無効）
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel()
    }
  }

  // 確認ボタンクリック
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm()
    }
  }

  // キャンセルボタンクリック
  const handleCancel = () => {
    if (!isLoading) {
      onCancel()
    }
  }

  // ESCキーでキャンセル
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isLoading, onCancel])

  // 統合後の合計楽曲数
  const totalSongCount = sourceSongCount + targetSongCount

  return (
    <Overlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="merge-dialog-title"
      aria-describedby="merge-dialog-description"
    >
      <DialogBox $theme={theme}>
        <DialogTitle $theme={theme} id="merge-dialog-title">
          タグを統合しますか？
        </DialogTitle>

        <DialogDescription $theme={theme} id="merge-dialog-description">
          「{sourceTag}」を「{targetTag}」に統合します。
          この操作は取り消せません。
        </DialogDescription>

        {/* Requirements: 2.2 - 統合元・統合先タグ名と影響楽曲数の表示 */}
        <MergeInfoContainer $theme={theme}>
          <MergeRow>
            <TagInfo $theme={theme} $variant="source">
              <TagLabel $theme={theme}>統合元（削除されます）</TagLabel>
              <TagName $theme={theme}>{sourceTag}</TagName>
              <SongCount $theme={theme}>{sourceSongCount}曲</SongCount>
            </TagInfo>
          </MergeRow>

          <MergeArrow $theme={theme}>↓</MergeArrow>

          <MergeRow>
            <TagInfo $theme={theme} $variant="target">
              <TagLabel $theme={theme}>統合先</TagLabel>
              <TagName $theme={theme}>{targetTag}</TagName>
              <SongCount $theme={theme}>
                {targetSongCount}曲 → {totalSongCount}曲
              </SongCount>
            </TagInfo>
          </MergeRow>
        </MergeInfoContainer>

        <WarningMessage $theme={theme}>
          「{sourceTag}」タグは削除され、紐づいていた{sourceSongCount}曲が 「
          {targetTag}」タグに移動します。
        </WarningMessage>

        <ButtonGroup>
          <Button
            $theme={theme}
            $variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            type="button"
          >
            キャンセル
          </Button>
          <Button
            $theme={theme}
            $variant="primary"
            $isLoading={isLoading}
            onClick={handleConfirm}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                統合中...
              </>
            ) : (
              '統合する'
            )}
          </Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  )
}

export default TagMergeDialog
