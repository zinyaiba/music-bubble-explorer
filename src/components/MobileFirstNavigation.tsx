import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'
import { announceToScreenReader } from '@/utils/accessibility'

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
  view: 'main' | 'registration' | 'management' | 'tag-list' | 'tag-registration'
  isActive: boolean
  color: string
  onClick: () => void
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
       * 楽曲登録フォームを開く
       */
      const handleOpenRegistration = useCallback(() => {
        console.log('🎵 Opening registration form...')

        // 他のダイアログを閉じる
        if (showSongManagement) {
          console.log('Closing song management...')
          onToggleSongManagement()
        }
        if (showTagList && onToggleTagList) {
          console.log('Closing tag list...')
          onToggleTagList()
        }
        if (showTagRegistration && onToggleTagRegistration) {
          console.log('Closing tag registration...')
          onToggleTagRegistration()
        }

        // 楽曲登録フォームを開く
        console.log('Current showRegistrationForm:', showRegistrationForm)
        if (!showRegistrationForm) {
          console.log('Toggling registration form...')
          onToggleRegistrationForm()
        }

        onViewChange('registration')
        announceToScreenReader('楽曲登録フォームを開きました')
      }, [
        showSongManagement,
        showTagList,
        showTagRegistration,
        showRegistrationForm,
        onToggleSongManagement,
        onToggleTagList,
        onToggleTagRegistration,
        onToggleRegistrationForm,
        onViewChange,
      ])

      /**
       * 楽曲編集画面を開く
       */
      const handleOpenManagement = useCallback(() => {
        console.log('📝 Opening song management...')

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

        // 楽曲編集画面を開く
        console.log('Current showSongManagement:', showSongManagement)
        if (!showSongManagement) {
          console.log('Toggling song management...')
          onToggleSongManagement()
        }

        onViewChange('management')
        announceToScreenReader('楽曲編集画面を開きました')
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

        console.log('🏷️➕ Opening tag registration...')

        // 他のダイアログを閉じる
        if (showRegistrationForm) {
          console.log('Closing registration form...')
          onToggleRegistrationForm()
        }
        if (showSongManagement) {
          console.log('Closing song management...')
          onToggleSongManagement()
        }
        if (showTagList && onToggleTagList) {
          console.log('Closing tag list...')
          onToggleTagList()
        }

        // タグ登録画面を開く
        console.log('Current showTagRegistration:', showTagRegistration)
        if (!showTagRegistration) {
          console.log('Toggling tag registration...')
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

      // ナビゲーションアイテムの定義（使用頻度順に最適化）
      // Priority 1: タグ登録, Priority 2: タグ一覧, Priority 3: 楽曲編集, Priority 4: 楽曲登録
      const navigationItems: NavigationItem[] = [
        {
          id: 'tag-registration',
          label: 'タグ登録',
          icon: '🏷️➕',
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
          id: 'manage-songs',
          label: '楽曲編集',
          icon: '📝',
          view: 'management',
          isActive: currentView === 'management',
          color: '#DDA0DD',
          onClick: handleOpenManagement,
        },
        {
          id: 'add-song',
          label: '楽曲登録',
          icon: '➕',
          view: 'registration',
          isActive: currentView === 'registration',
          color: '#B6E5D8',
          onClick: handleOpenRegistration,
        },
      ]

      const screenSize = useResponsive()

      return (
        <>
          {/* PC用ヘッダーナビゲーション（アイコンのみ） */}
          {!screenSize.isMobile && (
            <HeaderNavigation>
              {navigationItems.map(item => (
                <HeaderNavButton
                  key={item.id}
                  onClick={item.onClick}
                  $isActive={item.isActive}
                  $color={item.color}
                  title={item.label}
                >
                  {item.icon}
                </HeaderNavButton>
              ))}
            </HeaderNavigation>
          )}

          {/* スマホ用ボトムナビゲーション */}
          {screenSize.isMobile && (
            <MobileNavigation>
              {navigationItems.map(item => (
                <MobileNavButton
                  key={item.id}
                  onClick={item.onClick}
                  $isActive={item.isActive}
                  $color={item.color}
                  aria-label={item.label}
                >
                  <MobileButtonIcon $isActive={item.isActive}>
                    {item.icon}
                  </MobileButtonIcon>
                  <MobileButtonText $isActive={item.isActive}>
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

// シンプルな統一ナビゲーション
const HeaderNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const HeaderNavButton = styled.button<{ $isActive: boolean; $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid
    ${props => (props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.8)')};
  background: ${props =>
    props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => (props.$isActive ? 'white' : '#666')};
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
  }
`

const MobileNavigation = styled.div`
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100vw !important;
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.98),
    rgba(255, 105, 180, 0.98)
  ) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-top: 3px solid rgba(255, 105, 180, 0.6) !important;
  padding: 16px 20px 20px !important;
  z-index: 9999 !important;
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  min-height: 80px !important;

  /* 浮いた効果を強化 */
  box-shadow:
    0 -8px 30px rgba(255, 105, 180, 0.4),
    0 -4px 15px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;

  /* スクロール時も固定 */
  transform: translateZ(0) !important;
  will-change: transform !important;

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom)) !important;
    min-height: calc(80px + env(safe-area-inset-bottom)) !important;
  }
`

const MobileNavButton = styled.button<{ $isActive: boolean; $color: string }>`
  background: ${props =>
    props.$isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
  border: 2px solid
    ${props => (props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.8)')};
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-height: 60px;
  min-width: 60px;
  border-radius: 16px;
  flex: 1;
  max-width: 80px;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }
`

const MobileButtonIcon = styled.span<{ $isActive: boolean }>`
  font-size: ${props => (props.$isActive ? '21px' : '21px')};
  transition: all 0.3s ease;
`

const MobileButtonText = styled.span<{ $isActive: boolean }>`
  font-size: ${props => (props.$isActive ? '12px' : '11px')};
  font-weight: ${props => (props.$isActive ? '700' : '600')};
  color: ${props => (props.$isActive ? '#333' : '#555')};
  text-align: center;
  line-height: 1.1;
`

export default MobileFirstNavigation
