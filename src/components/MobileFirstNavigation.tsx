import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'
import { announceToScreenReader } from '@/utils/accessibility'

interface MobileFirstNavigationProps {
  currentView: 'main' | 'registration' | 'management' | 'tag-list'
  onViewChange: (view: 'main' | 'registration' | 'management' | 'tag-list') => void
  showRegistrationForm: boolean
  showSongManagement: boolean
  showTagList?: boolean
  onToggleRegistrationForm: () => void
  onToggleSongManagement: () => void
  onToggleTagList?: () => void
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  view: 'main' | 'registration' | 'management' | 'tag-list'
  isActive: boolean
  color: string
  onClick: () => void
}

/**
 * モバイルファーストナビゲーションコンポーネント
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */
export const MobileFirstNavigation: React.FC<MobileFirstNavigationProps> = React.memo(({
  currentView,
  onViewChange,
  showRegistrationForm,
  showSongManagement,
  showTagList = false,
  onToggleRegistrationForm,
  onToggleSongManagement,
  onToggleTagList
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
    
    // 楽曲登録フォームを開く
    console.log('Current showRegistrationForm:', showRegistrationForm)
    if (!showRegistrationForm) {
      console.log('Toggling registration form...')
      onToggleRegistrationForm()
    }
    
    onViewChange('registration')
    announceToScreenReader('楽曲登録フォームを開きました')
  }, [
    showSongManagement, showTagList, showRegistrationForm,
    onToggleSongManagement, onToggleTagList, onToggleRegistrationForm,
    onViewChange
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
    
    // 楽曲編集画面を開く
    console.log('Current showSongManagement:', showSongManagement)
    if (!showSongManagement) {
      console.log('Toggling song management...')
      onToggleSongManagement()
    }
    
    onViewChange('management')
    announceToScreenReader('楽曲編集画面を開きました')
  }, [
    showRegistrationForm, showTagList, showSongManagement,
    onToggleRegistrationForm, onToggleTagList, onToggleSongManagement,
    onViewChange
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
    
    // タグ一覧画面を開く
    console.log('Current showTagList:', showTagList)
    if (!showTagList) {
      console.log('Toggling tag list...')
      onToggleTagList()
    }
    
    onViewChange('tag-list')
    announceToScreenReader('タグ一覧画面を開きました')
  }, [
    showRegistrationForm, showSongManagement, showTagList,
    onToggleRegistrationForm, onToggleSongManagement, onToggleTagList,
    onViewChange
  ])



  // ナビゲーションアイテムの定義（シャボン玉ボタンを削除）
  const navigationItems: NavigationItem[] = [
    {
      id: 'add-song',
      label: '楽曲登録',
      icon: '➕',
      view: 'registration',
      isActive: currentView === 'registration',
      color: '#B6E5D8',
      onClick: handleOpenRegistration
    },
    {
      id: 'manage-songs',
      label: '楽曲編集',
      icon: '📝',
      view: 'management',
      isActive: currentView === 'management',
      color: '#DDA0DD',
      onClick: handleOpenManagement
    },
    {
      id: 'tag-list',
      label: 'タグ一覧',
      icon: '🏷️',
      view: 'tag-list',
      isActive: currentView === 'tag-list',
      color: '#98FB98',
      onClick: handleOpenTagList
    }
  ]



  const screenSize = useResponsive()

  return (
    <>
      {/* PC用ヘッダーナビゲーション（アイコンのみ） */}
      {!screenSize.isMobile && (
        <HeaderNavigation>
          {navigationItems.map((item) => (
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
          {navigationItems.map((item) => (
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
})

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
  border: 2px solid ${props => props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.8)'};
  background: ${props => props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.$isActive ? 'white' : '#666'};
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
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.98), rgba(255, 105, 180, 0.98));
  backdrop-filter: blur(20px);
  border-top: 3px solid rgba(255, 105, 180, 0.6);
  padding: 16px 20px 20px;
  z-index: 9999;
  display: flex;
  justify-content: space-around;
  align-items: center;
  min-height: 80px;

  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
`

const MobileNavButton = styled.button<{ $isActive: boolean; $color: string }>`
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
  border: 2px solid ${props => props.$isActive ? props.$color : 'rgba(255, 255, 255, 0.8)'};
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
  font-size: ${props => props.$isActive ? '28px' : '24px'};
  transition: all 0.3s ease;
`

const MobileButtonText = styled.span<{ $isActive: boolean }>`
  font-size: ${props => props.$isActive ? '12px' : '11px'};
  font-weight: ${props => props.$isActive ? '700' : '600'};
  color: ${props => props.$isActive ? '#333' : '#555'};
  text-align: center;
  line-height: 1.1;
`

export default MobileFirstNavigation