import React, { useCallback } from 'react'
import styled from 'styled-components'
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



  return (
    <>
      {/* デスクトップ用ヘッダーナビゲーション */}
      <DesktopNavigation role="navigation" aria-label="メインナビゲーション">
        {navigationItems.map((item) => (
          <DesktopNavItem key={item.id}>
            <DesktopNavButton
              onClick={item.onClick}
              $isActive={item.isActive}
              $color={item.color}
              role="button"
              aria-current={item.isActive ? 'page' : undefined}
              title={item.label}
            >
              <ButtonIcon aria-hidden="true">{item.icon}</ButtonIcon>
              <ButtonText>{item.label}</ButtonText>
            </DesktopNavButton>
          </DesktopNavItem>
        ))}
      </DesktopNavigation>

      {/* モバイル用ボトムナビゲーション */}
      <MobileNavigation role="navigation" aria-label="メインナビゲーション">
        {navigationItems.map((item) => (
          <MobileNavItem key={item.id}>
            <MobileNavButton
              onClick={item.onClick}
              $isActive={item.isActive}
              $color={item.color}
              role="button"
              aria-current={item.isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <MobileButtonIcon $isActive={item.isActive} aria-hidden="true">
                {item.icon}
              </MobileButtonIcon>
              <MobileButtonText $isActive={item.isActive}>
                {item.label}
              </MobileButtonText>
            </MobileNavButton>
          </MobileNavItem>
        ))}
      </MobileNavigation>
    </>
  )
})

// スタイル定義

// デスクトップ用ナビゲーション（ヘッダー内に表示）
const DesktopNavigation = styled.ul`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 768px) {
    display: none !important;
  }
`

const DesktopNavItem = styled.li`
  margin: 0;
  padding: 0;
`

const DesktopNavButton = styled.button<{ $isActive: boolean; $color: string }>`
  background: ${props => props.$isActive 
    ? `linear-gradient(135deg, ${props.$color}, ${adjustColor(props.$color, -20)})`
    : `linear-gradient(135deg, ${props.$color}, ${adjustColor(props.$color, -10)})`
  };
  border: 2px solid white;
  border-radius: 20px;
  padding: 10px 16px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: ${props => props.$isActive 
    ? '0 4px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(0,0,0,0.1)'
    : '0 4px 12px rgba(0,0,0,0.15)'
  };
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-height: 40px;
  white-space: nowrap;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    background: ${props => `linear-gradient(135deg, ${adjustColor(props.$color, -10)}, ${adjustColor(props.$color, -30)})`};
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid var(--accent-sparkle, #ffd700);
    outline-offset: 2px;
  }

  ${props => props.$isActive && `
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, var(--accent-sparkle, #ffd700), ${props.$color});
      border-radius: 22px;
      z-index: -1;
      animation: activeGlow 2s ease-in-out infinite alternate;
    }
  `}

  @keyframes activeGlow {
    0% { opacity: 0.5; }
    100% { opacity: 0.8; }
  }
`

// モバイル用ボトムナビゲーション（モバイルのみ表示）
const MobileNavigation = styled.ul`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.95), rgba(255, 105, 180, 0.95));
  backdrop-filter: blur(15px);
  border-top: 3px solid rgba(255, 105, 180, 0.5);
  padding: 16px 20px 20px;
  margin: 0;
  list-style: none;
  z-index: 1000;
  box-shadow: 0 -8px 30px rgba(255, 105, 180, 0.3);
  display: none;

  /* モバイルでのみ表示 */
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  
  /* PCでは完全に非表示 */
  @media (min-width: 769px) {
    display: none !important;
  }

  /* 視認性向上のためのアニメーション */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 5px;
    background: linear-gradient(90deg, #ffd700, #ff69b4, #ff1493);
    border-radius: 3px;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }

  /* iPhone X以降の安全領域対応 */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
`

const MobileNavItem = styled.li`
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  justify-content: center;
`

const MobileNavButton = styled.button<{ $isActive: boolean; $color: string }>`
  background: ${props => props.$isActive 
    ? 'rgba(255, 255, 255, 0.9)' 
    : 'rgba(255, 255, 255, 0.6)'
  };
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
  position: relative;
  box-shadow: ${props => props.$isActive 
    ? `0 4px 15px ${props.$color}40` 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 3px solid ${props => props.$color};
    outline-offset: 2px;
  }

  ${props => props.$isActive && `
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 4px;
      background: ${props.$color};
      border-radius: 2px;
      animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `}
`

const MobileButtonIcon = styled.span<{ $isActive: boolean }>`
  font-size: ${props => props.$isActive ? '28px' : '24px'};
  transition: all 0.3s ease;
  transform: ${props => props.$isActive ? 'scale(1.2)' : 'scale(1)'};
  filter: ${props => props.$isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'};
`

const MobileButtonText = styled.span<{ $isActive: boolean }>`
  font-size: ${props => props.$isActive ? '12px' : '11px'};
  font-weight: ${props => props.$isActive ? '700' : '600'};
  color: ${props => props.$isActive ? '#333' : '#555'};
  transition: all 0.3s ease;
  text-align: center;
  line-height: 1.1;
  text-shadow: ${props => props.$isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'};
`

const ButtonIcon = styled.span`
  font-size: 16px;
  animation: ${props => props.children === '🫧' ? 'float 3s ease-in-out infinite' : 'none'};

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-3px); }
  }
`

const ButtonText = styled.span`
  font-size: inherit;
`

// 色調整ヘルパー関数
function adjustColor(color: string, amount: number): string {
  // 簡単な色調整（実際の実装では色変換ライブラリを使用することを推奨）
  const colorMap: { [key: string]: string } = {
    '#FFB6C1': amount < 0 ? '#FF69B4' : '#FFC0CB',
    '#B6E5D8': amount < 0 ? '#20B2AA' : '#AFEEEE',
    '#DDA0DD': amount < 0 ? '#BA55D3' : '#E6E6FA',
    '#98FB98': amount < 0 ? '#32CD32' : '#F0FFF0',
    '#FF7F50': amount < 0 ? '#FF4500' : '#FFA07A'
  }
  
  return colorMap[color] || color
}

export default MobileFirstNavigation