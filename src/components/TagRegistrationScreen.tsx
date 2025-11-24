import React, { useState, useCallback, useEffect } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { Song } from '@/types/music'
import { SongSelectionScreen } from './SongSelectionScreen'
import { TagEditingScreen } from './TagEditingScreen'
import { AnalyticsService } from '@/services/analyticsService'

// Animation keyframes for screen transitions
const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

// Props interface for TagRegistrationScreen
export interface TagRegistrationScreenProps {
  isVisible: boolean
  onClose: () => void
  onTagsRegistered: (songId: string, tags: string[]) => void
}

// Navigation state interface
export interface NavigationState {
  currentScreen: 'song-selection' | 'tag-editing'
  previousScreen: string | null
  history: string[]
  canGoBack: boolean
  transitionDirection: 'forward' | 'backward'
}

// Screen transition configuration
export interface ScreenTransitionConfig {
  from: string
  to: string
  animation: 'slide' | 'fade'
  duration: number
  easing: string
  direction?: 'left' | 'right'
}

// Styled components
const ScreenContainer = styled.div<{
  $isVisible: boolean
  $theme: any
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000; /* z-indexを高く設定 */

  /* Glassmorphism background overlay */
  background: ${props => props.$theme.colors.glass.medium};
  backdrop-filter: ${props => props.$theme.effects.blur.strong};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.strong};

  /* Visibility and animation */
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  visibility: ${props => (props.$isVisible ? 'visible' : 'hidden')};
  pointer-events: ${props => (props.$isVisible ? 'auto' : 'none')};
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Layout */
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Animation when visible */
  ${props =>
    props.$isVisible &&
    css`
      animation: ${fadeIn} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `}
`

const ScreenHeader = styled.div<{
  $theme: any
}>`
  /* Glassmorphism header styling */
  background: ${props => props.$theme.colors.glass.strong};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.medium};
  border-bottom: ${props => props.$theme.effects.borders.glass};

  /* Layout */
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};

  /* Shadow for depth */
  box-shadow: ${props => props.$theme.effects.shadows.subtle};

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 12px 16px;
    min-height: 56px;
  }
`

const HeaderTitle = styled.h1<{
  $theme: any
}>`
  margin: 0;
  font-size: 20px;
  font-weight: ${props => props.$theme.typography.fontWeights.bold};
  color: ${props => props.$theme.colors.text.primary};

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 18px;
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const BackButton = styled.button<{
  $theme: any
  $disabled: boolean
}>`
  /* Glassmorphism button styling */
  background: ${props =>
    props.$disabled
      ? props.$theme.colors.neutral[100]
      : props.$theme.colors.glass.light};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  border: ${props => props.$theme.effects.borders.subtle};
  border-radius: 12px;

  /* Layout */
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props =>
    props.$disabled
      ? props.$theme.colors.neutral[400]
      : props.$theme.colors.text.primary};

  /* Transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Interactive states */
  ${props =>
    !props.$disabled &&
    `
    &:hover {
      background: ${props.$theme.colors.glass.medium};
      transform: translateY(-1px);
      box-shadow: ${props.$theme.effects.shadows.medium};
    }
    
    &:active {
      transform: translateY(0);
      transition: all 0.1s ease;
    }
  `}

  /* Focus styles */
  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }

  /* Disabled state */
  ${props =>
    props.$disabled &&
    `
    opacity: 0.6;
  `}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 13px;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`

const CloseButton = styled.button<{
  $theme: any
}>`
  /* Glassmorphism button styling */
  background: ${props => props.$theme.colors.glass.light};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  border: ${props => props.$theme.effects.borders.subtle};
  border-radius: 50%;

  /* Layout */
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  /* Typography */
  font-size: 18px;
  color: ${props => props.$theme.colors.text.secondary};

  /* Transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Interactive states */
  &:hover {
    background: ${props => props.$theme.colors.primary[200]};
    color: ${props => props.$theme.colors.primary[500]};
    transform: translateY(-1px);
    box-shadow: ${props => props.$theme.effects.shadows.medium};
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  /* Focus styles */
  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.95);
    }
  }
`

const ScreenContent = styled.div<{
  $currentScreen: string
  $transitionDirection: 'forward' | 'backward'
  $isTransitioning: boolean
  $theme: any
}>`
  /* Layout */
  flex: 1;
  overflow: hidden;
  position: relative;

  /* Transition container */
  & > * {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    /* Animation based on transition direction */
    ${props => {
      if (!props.$isTransitioning) return ''

      const animation =
        props.$transitionDirection === 'forward'
          ? slideInFromRight
          : slideInFromLeft

      return css`
        animation: ${animation} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      `
    }}
  }
`

const LoadingOverlay = styled.div<{
  $isVisible: boolean
  $theme: any
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;

  /* Glassmorphism overlay */
  background: ${props => props.$theme.colors.glass.strong};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.medium};

  /* Layout */
  display: ${props => (props.$isVisible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  color: ${props => props.$theme.colors.text.primary};

  /* Animation */
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.2s ease;
`

const TransitionIndicator = styled.div<{
  $isVisible: boolean
  $theme: any
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 5;

  /* Progress bar background */
  background: ${props => props.$theme.colors.glass.light};

  /* Progress bar fill */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: linear-gradient(
      90deg,
      ${props => props.$theme.colors.primary.main},
      ${props => props.$theme.colors.accent}
    );

    /* Animation */
    width: ${props => (props.$isVisible ? '100%' : '0%')};
    transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  /* Visibility */
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transition: opacity 0.2s ease;
`

const LoadingSpinner = styled.div<{
  $theme: any
}>`
  width: 32px;
  height: 32px;
  border: 3px solid ${props => props.$theme.colors.neutral[200]};
  border-top: 3px solid ${props => props.$theme.colors.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

/**
 * TagRegistrationScreen component
 * A full-screen dedicated tag registration interface with smooth transitions
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const TagRegistrationScreen: React.FC<TagRegistrationScreenProps> = ({
  isVisible,
  onClose,
  onTagsRegistered,
}) => {
  const theme = useGlassmorphismTheme()

  // Navigation state management
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentScreen: 'song-selection',
    previousScreen: null,
    history: ['song-selection'],
    canGoBack: false,
    transitionDirection: 'forward',
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Selected song state
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  // Reset state when screen becomes visible
  useEffect(() => {
    if (isVisible) {
      setNavigationState({
        currentScreen: 'song-selection',
        previousScreen: null,
        history: ['song-selection'],
        canGoBack: false,
        transitionDirection: 'forward',
      })
      setSelectedSong(null)
      setIsLoading(false)
      setLoadingMessage('')
    }
  }, [isVisible])

  // Handle screen navigation
  const navigateToScreen = useCallback(
    (
      screen: 'song-selection' | 'tag-editing',
      direction: 'forward' | 'backward' = 'forward'
    ) => {
      // Start transition
      setIsTransitioning(true)

      // Update navigation state
      setNavigationState(prev => {
        const newHistory =
          direction === 'forward'
            ? [...prev.history, screen]
            : prev.history.slice(0, -1)

        return {
          currentScreen: screen,
          previousScreen: prev.currentScreen,
          history: newHistory,
          canGoBack: newHistory.length > 1,
          transitionDirection: direction,
        }
      })

      // End transition after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400) // Match animation duration
    },
    []
  )

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (navigationState.canGoBack && navigationState.history.length > 1) {
      const previousScreen =
        navigationState.history[navigationState.history.length - 2]
      navigateToScreen(
        previousScreen as 'song-selection' | 'tag-editing',
        'backward'
      )
    }
  }, [navigationState, navigateToScreen])

  // Handle song selection
  const handleSongSelect = useCallback(
    (song: Song) => {
      setSelectedSong(song)
      navigateToScreen('tag-editing', 'forward')
    },
    [navigateToScreen]
  )

  // Handle tags registration completion - don't close screen for continuous editing
  const handleTagsRegistered = useCallback(
    (songId: string, tags: string[]) => {
      onTagsRegistered(songId, tags)

      // Analytics tracking
      const analyticsService = AnalyticsService.getInstance()
      tags.forEach(tag => {
        analyticsService.logTagRegistration(tag, 1)
      })

      // Don't close the screen to allow continuous tag editing
    },
    [onTagsRegistered]
  )

  // Generate breadcrumb navigation (currently disabled)
  // const generateBreadcrumbs = useCallback(() => {
  //   const breadcrumbs: React.ReactNode[] = []
  //
  //   navigationState.history.forEach((screen, index) => {
  //     const isActive = index === navigationState.history.length - 1
  //     const screenName = screen === 'song-selection' ? '楽曲選択' : 'タグ編集'
  //
  //     breadcrumbs.push(
  //       <BreadcrumbItem key={screen} $isActive={isActive} $theme={theme}>
  //         {screenName}
  //       </BreadcrumbItem>
  //     )
  //
  //     if (index < navigationState.history.length - 1) {
  //       breadcrumbs.push(
  //         <BreadcrumbSeparator key={`sep-${index}`} $theme={theme}>
  //           →
  //         </BreadcrumbSeparator>
  //       )
  //     }
  //   })
  //
  //   return breadcrumbs
  // }, [navigationState.history, theme])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Disable keyboard navigation during transitions or loading
      if (isTransitioning || isLoading) {
        return
      }

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          if (navigationState.canGoBack) {
            handleBack()
          } else {
            onClose()
          }
          break
        case 'Backspace':
          if (event.altKey && navigationState.canGoBack) {
            event.preventDefault()
            handleBack()
          }
          break
      }
    },
    [navigationState.canGoBack, handleBack, onClose, isTransitioning, isLoading]
  )

  // Don't render if not visible
  if (!isVisible) {
    return null
  }

  return (
    <ScreenContainer
      $isVisible={isVisible}
      $theme={theme}
      className="tag-registration-screen"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-registration-title"
    >
      {/* Transition Indicator */}
      <TransitionIndicator $isVisible={isTransitioning} $theme={theme} />

      {/* Screen Header */}
      <ScreenHeader $theme={theme}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <HeaderTitle id="tag-registration-title" $theme={theme}>
            {navigationState.currentScreen === 'tag-editing' && selectedSong
              ? `タグ編集: ${selectedSong.title}`
              : 'タグ登録'}
          </HeaderTitle>

          {/* Breadcrumb Navigation - Completely hidden */}
        </div>

        {/* Header Actions */}
        <HeaderActions>
          {navigationState.canGoBack && (
            <BackButton
              $theme={theme}
              $disabled={isTransitioning || isLoading}
              onClick={handleBack}
              aria-label="前の画面に戻る"
              type="button"
              disabled={isTransitioning || isLoading}
            >
              ← 戻る
            </BackButton>
          )}

          <CloseButton
            $theme={theme}
            onClick={onClose}
            aria-label="タグ登録画面を閉じる"
            type="button"
            disabled={isTransitioning || isLoading}
            style={{
              opacity: isTransitioning || isLoading ? 0.6 : 1,
              cursor: isTransitioning || isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            ×
          </CloseButton>
        </HeaderActions>
      </ScreenHeader>

      {/* Screen Content */}
      <ScreenContent
        $currentScreen={navigationState.currentScreen}
        $transitionDirection={navigationState.transitionDirection}
        $isTransitioning={isTransitioning}
        $theme={theme}
      >
        {/* Content will be rendered by child components */}
        {navigationState.currentScreen === 'song-selection' && (
          <SongSelectionScreen onSongSelect={handleSongSelect} />
        )}

        {navigationState.currentScreen === 'tag-editing' && selectedSong && (
          <TagEditingScreen
            song={selectedSong}
            selectedTags={selectedSong.tags || []}
            onTagsChange={() => {}} // Optional callback for real-time updates
            onSave={handleTagsRegistered}
            showHeader={false}
          />
        )}
      </ScreenContent>

      {/* Loading Overlay */}
      <LoadingOverlay $isVisible={isLoading} $theme={theme}>
        <LoadingSpinner $theme={theme} />
        <div>{loadingMessage || '処理中...'}</div>
      </LoadingOverlay>
    </ScreenContainer>
  )
}

export default TagRegistrationScreen
