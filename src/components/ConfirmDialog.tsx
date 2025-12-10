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

// Props interface
export interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

// Styled components
const Overlay = styled.div<{ $isOpen: boolean }>`
  /* Layout */
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

  /* Padding for mobile */
  padding: 20px;
`

const DialogBox = styled.div<{ $theme: any }>`
  /* Layout */
  max-width: 400px;
  width: 100%;
  padding: 24px;
  border-radius: ${props => props.$theme.borderRadius.large};

  /* Background */
  background: ${props => props.$theme.colors.surface || '#ffffff'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  /* Animation */
  animation: ${slideUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive */
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const DialogTitle = styled.h3<{ $theme: any }>`
  /* Typography */
  margin: 0 0 12px 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 18px;
  font-weight: ${props => props.$theme.typography.fontWeights.semiBold};
  color: ${props => props.$theme.colors.text.primary};

  /* Responsive */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const DialogMessage = styled.p<{ $theme: any }>`
  /* Typography */
  margin: 0 0 24px 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  line-height: 1.6;
  color: ${props => props.$theme.colors.text.secondary};
  word-break: break-word;
`

const ButtonGroup = styled.div`
  /* Layout */
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  /* Responsive */
  @media (max-width: 768px) {
    gap: 8px;
  }
`

const Button = styled.button<{
  $theme: any
  $variant: 'primary' | 'secondary' | 'danger'
}>`
  /* Layout */
  padding: 10px 20px;
  border: none;
  border-radius: ${props => props.$theme.borderRadius.medium};
  cursor: pointer;
  min-width: 80px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};

  /* Colors based on variant */
  background: ${props => {
    switch (props.$variant) {
      case 'danger':
        return props.$theme.colors.error?.main || '#dc3545'
      case 'primary':
        return props.$theme.colors.primary.main
      case 'secondary':
        return props.$theme.colors.background.glass || '#f0f0f0'
    }
  }};

  color: ${props => {
    switch (props.$variant) {
      case 'danger':
      case 'primary':
        return props.$theme.colors.primary.contrastText || '#ffffff'
      case 'secondary':
        return props.$theme.colors.text.primary
    }
  }};

  /* Transitions */
  transition: all 0.2s ease;

  /* Hover state */
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    background: ${props => {
      switch (props.$variant) {
        case 'danger':
          return props.$theme.colors.error?.dark || '#c82333'
        case 'primary':
          return props.$theme.colors.primary.dark
        case 'secondary':
          return props.$theme.colors.border.medium || '#e0e0e0'
      }
    }};
  }

  /* Active state */
  &:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 768px) {
    padding: 8px 16px;
    min-width: 70px;
    font-size: 13px;
  }
`

// Main component
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = '確認',
  message,
  confirmText = 'OK',
  cancelText = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'info',
}) => {
  const theme = useGlassmorphismTheme()

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  const handleConfirm = () => {
    onConfirm()
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <Overlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <DialogBox $theme={theme}>
        <DialogTitle $theme={theme}>{title}</DialogTitle>
        <DialogMessage $theme={theme}>{message}</DialogMessage>
        <ButtonGroup>
          <Button $theme={theme} $variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            $theme={theme}
            $variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </ButtonGroup>
      </DialogBox>
    </Overlay>
  )
}
