import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'
import { announceToScreenReader } from '@/utils/accessibility'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

interface MobileFirstNavigationProps {
  currentView:
    | 'main'
    | 'registration'
    | 'management'
    | 'tag-list'
    | 'tag-registration'
  onViewChange: (
    view:
      | 'main'
      | 'registration'
      | 'management'
      | 'tag-list'
      | 'tag-registration'
  ) => void
  showRegistrationForm: boolean
  showSongManagement: boolean
  showTagList?: boolean
  showTagRegistration?: boolean
  onToggleRegistrationForm: () => void
  onToggleSongManagement: () => void
  onToggleTagList?: () => void
  onToggleTagRegistration?: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  view:
    | 'main'
    | 'registration'
    | 'management'
    | 'tag-list'
    | 'tag-registration'
    | 'song-list'
  isActive: boolean
  color: string
  onClick: () => void
  disabled?: boolean
}

/**
 * モバイルファーストナビゲーションコンポーネント
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */
export const MobileFirstNavigation: React.FC<MobileFirstNavigationProps> =
  React.memo(
    ({
      currentView,
      onViewChange,
      showRegistrationForm,
      showSongManagement,
      showTagList = false,
      showTagRegistration = false,
      onToggleRegistrationForm,
      onToggleSongManagement,
      onToggleTagList,
      onToggleTagRegistration,
    }) => {
      // handleGoToMainは削除（シャボン玉ボタンを削除したため不要）

      /**
       * 楽曲管理画面を開く（登録と編集を統合）
       */
      const handleOpenSongManagement = useCallback(() => {
        console.log('🎵📝 Opening song management...')

        // 他のダイアログを閉じる
        if (showRegistrationForm) {
          console.log('Closing registration form...')
          onToggleRegistrationForm()
        }
        if (showTagList && onToggleTagList) {
          console.log('Closing tag list...')
          onToggleTagList()
        }
        if (showTagRegistration && onToggleTagRegistration) {
          console.log('Closing tag registration...')
          onToggleTagRegistration()
        }

        // 楽曲管理画面を開く
        console.log('Current showSongManagement:', showSongManagement)
        if (!showSongManagement) {
          console.log('Toggling song management...')
          onToggleSongManagement()
        }

        onViewChange('management')
        announceToScreenReader('楽曲管理画面を開きました')
      }, [
        showRegistrationForm,
        showTagList,
        showTagRegistration,
        showSongManagement,
        onToggleRegistrationForm,
        onToggleTagList,
        onToggleTagRegistration,
        onToggleSongManagement,
        onViewChange,
      ])

      /**
       * タグ一覧画面を開く
       */
      const handleOpenTagList = useCallback(() => {
        if (!onToggleTagList) return

        console.log('🏷️ Opening tag list...')

        // 他のダイアログを閉じる
        if (showRegistrationForm) {
          console.log('Closing registration form...')
          onToggleRegistrationForm()
        }
        if (showSongManagement) {
          console.log('Closing song management...')
          onToggleSongManagement()
        }
        if (showTagRegistration && onToggleTagRegistration) {
          console.log('Closing tag registration...')
          onToggleTagRegistration()
        }

        // タグ一覧画面を開く
        console.log('Current showTagList:', showTagList)
        if (!showTagList) {
          console.log('Toggling tag list...')
          onToggleTagList()
        }

        onViewChange('tag-list')
        announceToScreenReader('タグ一覧画面を開きました')
      }, [
        showRegistrationForm,
        showSongManagement,
        showTagRegistration,
        showTagList,
        onToggleRegistrationForm,
        onToggleSongManagement,
        onToggleTagRegistration,
        onToggleTagList,
        onViewChange,
      ])

      /**
       * タグ登録画面を開く
       */
      const handleOpenTagRegistration = useCallback(() => {
        if (!onToggleTagRegistration) return

        // 他のダイアログを閉じる
        if (showRegistrationForm) {
          onToggleRegistrationForm()
        }
        if (showSongManagement) {
          onToggleSongManagement()
        }
        if (showTagList && onToggleTagList) {
          onToggleTagList()
        }

        // タグ登録画面を開く
        if (!showTagRegistration) {
          onToggleTagRegistration()
        }

        onViewChange('tag-registration')
        announceToScreenReader('タグ登録画面を開きました')
      }, [
        showRegistrationForm,
        showSongManagement,
        showTagList,
        showTagRegistration,
        onToggleRegistrationForm,
        onToggleSongManagement,
        onToggleTagList,
        onToggleTagRegistration,
        onViewChange,
      ])

      // ナビゲーションアイテムの定義（要件4.2に基づく順序）
      // 順序: タグ登録、タグ一覧、楽曲一覧（非活性）、楽曲管理
      const navigationItems: NavigationItem[] = [
        {
          id: 'tag-registration',
          label: 'タグ登録',
          icon: '➕',
          view: 'tag-registration',
          isActive: currentView === 'tag-registration',
          color: '#FFB6C1',
          onClick: handleOpenTagRegistration,
        },
        {
          id: 'tag-list',
          label: 'タグ一覧',
          icon: '🏷️',
          view: 'tag-list',
          isActive: currentView === 'tag-list',
          color: '#98FB98',
          onClick: handleOpenTagList,
        },
        {
          id: 'song-list',
          label: '楽曲一覧',
          icon: '🎵',
          view: 'song-list',
          isActive: false,
          color: '#B6E5D8',
          onClick: () => {}, // 非活性のため空の関数
          disabled: true, // 要件4.3, 4.4: 非活性状態
        },
        {
          id: 'song-management',
          label: '楽曲管理',
          icon: '📝',
          view: 'management',
          isActive:
            currentView === 'management' || currentView === 'registration',
          color: '#DDA0DD',
          onClick: handleOpenSongManagement,
        },
      ]

      const screenSize = useResponsive()
      const theme = useGlassmorphismTheme()

      return (
        <>
          {/* PC用ヘッダーナビゲーション（アイコンのみ） */}
          {!screenSize.isMobile && (
            <HeaderNavigation>
              {navigationItems.map(item => (
                <HeaderNavButton
                  key={item.id}
                  onClick={item.disabled ? undefined : item.onClick}
                  $isActive={item.isActive}
                  $color={item.color}
                  $theme={theme}
                  $disabled={item.disabled || false}
                  title={item.disabled ? `${item.label}（準備中）` : item.label}
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                >
                  {item.icon}
                </HeaderNavButton>
              ))}
            </HeaderNavigation>
          )}

          {/* スマホ用ボトムナビゲーション */}
          {screenSize.isMobile && (
            <MobileNavigation $theme={theme}>
              {navigationItems.map(item => (
                <MobileNavButton
                  key={item.id}
                  onClick={item.disabled ? undefined : item.onClick}
                  $isActive={item.isActive}
                  $color={item.color}
                  $theme={theme}
                  $disabled={item.disabled || false}
                  aria-label={
                    item.disabled ? `${item.label}（準備中）` : item.label
                  }
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                >
                  <MobileButtonIcon
                    $isActive={item.isActive}
                    $disabled={item.disabled || false}
                  >
                    {item.icon}
                  </MobileButtonIcon>
                  <MobileButtonText
                    $isActive={item.isActive}
                    $theme={theme}
                    $disabled={item.disabled || false}
                  >
                    {item.label}
                  </MobileButtonText>
                </MobileNavButton>
              ))}
            </MobileNavigation>
          )}
        </>
      )
    }
  )

// ガラスモーフィズム統一ナビゲーション
const HeaderNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* 余白とレイアウトの最適化 */
  padding: 4px 0;
`

const HeaderNavButton = styled.button<{
  $isActive: boolean
  $color: string
  $theme: any
  $disabled?: boolean
}>`
  width: 48px;
  height: 48px;
  border-radius: 50%;

  /* ガラスモーフィズム効果 */
  background: ${props =>
    props.$disabled
      ? props.$theme.colors.glass.light
      : props.$isActive
        ? props.$theme.colors.glass.strong
        : props.$theme.colors.glass.medium};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.medium};

  /* 境界線 */
  border: ${props =>
    props.$disabled
      ? props.$theme.effects.borders.glass
      : props.$isActive
        ? props.$theme.effects.borders.accent
        : props.$theme.effects.borders.glass};

  /* テキスト色 */
  color: ${props =>
    props.$disabled
      ? props.$theme.colors.text.disabled
      : props.$isActive
        ? props.$theme.colors.accent
        : props.$theme.colors.text.onGlass};

  font-size: 20px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.$disabled ? '0.5' : '1')};

  /* パフォーマンス最適化 */
  will-change: transform, box-shadow, background;
  transform: translateZ(0);

  /* アクティブ状態の視覚的強調 */
  ${props =>
    props.$isActive &&
    !props.$disabled &&
    `
    box-shadow: ${props.$theme.effects.shadows.colored};
    font-weight: bold;
  `}

  /* ホバー・タップエフェクトの改善 */
  &:hover {
    ${props =>
      !props.$disabled &&
      `
      transform: translateY(-3px) translateZ(0);
      box-shadow: ${props.$theme.effects.shadows.strong};
      background: ${props.$theme.colors.glass.strong};
      border: ${props.$theme.effects.borders.accent};
    `}
  }

  &:active {
    ${props =>
      !props.$disabled &&
      `
      transform: translateY(-1px) translateZ(0);
      transition: all 0.1s ease;
    `}
  }

  /* フォーカス状態 */
  &:focus {
    ${props =>
      !props.$disabled &&
      `
      outline: 2px solid ${props.$theme.colors.accent};
      outline-offset: 2px;
    `}
  }

  /* モバイル対応 */
  @media (max-width: 900px) {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`

const MobileNavigation = styled.div<{ $theme: any }>`
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100vw !important;

  /* ガラスモーフィズム効果 */
  background: ${props => props.$theme.colors.glass.strong} !important;
  backdrop-filter: ${props => props.$theme.effects.blur.strong} !important;
  -webkit-backdrop-filter: ${props =>
    props.$theme.effects.blur.strong} !important;

  /* 境界線とシャドウ */
  border-top: ${props => props.$theme.effects.borders.accent} !important;
  box-shadow: ${props => props.$theme.effects.shadows.strong} !important;

  padding: 16px 20px 20px !important; /* パディングを調整 */
  z-index: 100 !important;
  display: flex !important;
  justify-content: space-around !important; /* space-betweenからspace-aroundに変更 */
  align-items: center !important;
  min-height: 88px !important;
  gap: 4px !important; /* ギャップを狭める */

  /* パフォーマンス最適化 */
  transform: translateZ(0) !important;
  will-change: backdrop-filter !important;

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom)) !important;
    min-height: calc(88px + env(safe-area-inset-bottom)) !important;
  }

  /* 高コントラストモード対応 */
  @media (prefers-contrast: high) {
    background: ${props => props.$theme.colors.surface} !important;
    border-top: 2px solid ${props => props.$theme.colors.neutral[400]} !important;
  }

  /* 小さな画面での追加調整 */
  @media (max-width: 360px) {
    padding: 12px 16px 16px !important;
    gap: 2px !important;
  }
`

const MobileNavButton = styled.button<{
  $isActive: boolean
  $color: string
  $theme: any
  $disabled?: boolean
}>`
  /* ガラスモーフィズム効果 */
  background: ${props =>
    props.$disabled
      ? props.$theme.colors.glass.light
      : props.$isActive
        ? props.$theme.colors.glass.strong
        : props.$theme.colors.glass.medium};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};

  /* 境界線 */
  border: ${props =>
    props.$disabled
      ? props.$theme.effects.borders.glass
      : props.$isActive
        ? props.$theme.effects.borders.accent
        : props.$theme.effects.borders.glass};

  padding: 12px 6px; /* パディングを調整 */
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px; /* アイコンとテキストの間隔を狭める */
  min-height: 68px;
  min-width: 64px; /* 最小幅を少し狭める */
  border-radius: 20px;
  flex: 1;
  max-width: 80px; /* 最大幅を狭める */
  opacity: ${props => (props.$disabled ? '0.5' : '1')};

  /* パフォーマンス最適化 */
  will-change: transform, background, box-shadow;
  transform: translateZ(0);

  /* テキストオーバーフロー対応 */
  overflow: hidden;

  /* アクティブ状態の視覚的強調 */
  ${props =>
    props.$isActive &&
    !props.$disabled &&
    `
    box-shadow: ${props.$theme.effects.shadows.colored};
  `}

  /* ホバー・タップエフェクトの改善 */
  &:hover {
    ${props =>
      !props.$disabled &&
      `
      background: ${props.$theme.colors.glass.strong};
      transform: translateY(-3px) translateZ(0);
      box-shadow: ${props.$theme.effects.shadows.medium};
      border: ${props.$theme.effects.borders.accent};
    `}
  }

  &:active {
    ${props =>
      !props.$disabled &&
      `
      transform: scale(0.95) translateZ(0);
      transition: all 0.1s ease;
    `}
  }

  /* フォーカス状態 */
  &:focus {
    ${props =>
      !props.$disabled &&
      `
      outline: 2px solid ${props.$theme.colors.accent};
      outline-offset: 2px;
    `}
  }

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }

    &:active {
      transform: none;
    }
  }
`

const MobileButtonIcon = styled.span<{
  $isActive: boolean
  $disabled?: boolean
}>`
  font-size: ${props => (props.$isActive ? '20px' : '19px')};
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* アイコンの視覚的強調 */
  filter: ${props =>
    props.$disabled
      ? 'grayscale(100%)'
      : props.$isActive
        ? 'drop-shadow(0 2px 4px rgba(224, 102, 102, 0.3))'
        : 'none'};

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const MobileButtonText = styled.span<{
  $isActive: boolean
  $theme: any
  $disabled?: boolean
}>`
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: ${props => (props.$isActive ? '11px' : '10px')};
  font-weight: ${props =>
    props.$isActive
      ? props.$theme.typography.fontWeights.bold
      : props.$theme.typography.fontWeights.medium};
  color: ${props =>
    props.$disabled
      ? props.$theme.colors.text.disabled
      : props.$isActive
        ? props.$theme.colors.text.primary
        : props.$theme.colors.text.secondary};
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.02em; /* 文字間隔を狭める */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* 改行防止 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  /* Android対応：より確実な改行防止 */
  word-break: keep-all;
  word-wrap: normal;
  hyphens: none;

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

export default MobileFirstNavigation
