import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { announceToScreenReader } from '@/utils/accessibility'

interface NavigationProps {
  currentView: 'main' | 'registration' | 'management'
  onViewChange: (view: 'main' | 'registration' | 'management') => void
  showRegistrationForm: boolean
  showSongManagement: boolean
  onToggleRegistrationForm: () => void
  onToggleSongManagement: () => void
}

/**
 * ナビゲーションコンポーネント
 * Requirements: 11.1, 12.1 - ナビゲーション機能の追加
 */
export const Navigation: React.FC<NavigationProps> = React.memo(({
  currentView,
  onViewChange,
  showRegistrationForm,
  showSongManagement,
  onToggleRegistrationForm,
  onToggleSongManagement
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  /**
   * メニューの開閉切り替え
   */
  const handleToggleMenu = useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev
      announceToScreenReader(newState ? 'メニューを開きました' : 'メニューを閉じました')
      return newState
    })
  }, [])



  /**
   * 楽曲登録フォームを開く
   */
  const handleOpenRegistration = useCallback(() => {
    if (showSongManagement) {
      onToggleSongManagement()
    }
    if (!showRegistrationForm) {
      onToggleRegistrationForm()
    }
    onViewChange('registration')
    setIsMenuOpen(false)
    announceToScreenReader('楽曲登録フォームを開きました')
  }, [showSongManagement, showRegistrationForm, onToggleSongManagement, onToggleRegistrationForm, onViewChange])

  /**
   * 楽曲管理画面を開く
   */
  const handleOpenManagement = useCallback(() => {
    if (showRegistrationForm) {
      onToggleRegistrationForm()
    }
    if (!showSongManagement) {
      onToggleSongManagement()
    }
    onViewChange('management')
    setIsMenuOpen(false)
    announceToScreenReader('楽曲管理画面を開きました')
  }, [showRegistrationForm, showSongManagement, onToggleRegistrationForm, onToggleSongManagement, onViewChange])

  return (
    <NavigationContainer role="navigation" aria-label="メインナビゲーション">
      {/* モバイル用ハンバーガーメニューボタン */}
      <MobileMenuButton
        onClick={handleToggleMenu}
        aria-expanded={isMenuOpen}
        aria-controls="navigation-menu"
        aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
        className="mobile-only"
      >
        <MenuIcon $isOpen={isMenuOpen}>
          <span></span>
          <span></span>
          <span></span>
        </MenuIcon>
      </MobileMenuButton>

      {/* ナビゲーションメニュー */}
      <NavigationMenu
        id="navigation-menu"
        $isOpen={isMenuOpen}
        role="menubar"
        aria-orientation="horizontal"
      >


        <NavigationItem role="none">
          <NavigationButton
            onClick={handleOpenRegistration}
            $isActive={currentView === 'registration'}
            role="menuitem"
            aria-current={currentView === 'registration' ? 'page' : undefined}
            title="新しい楽曲を登録"
          >
            <ButtonIcon aria-hidden="true">🎵</ButtonIcon>
            <ButtonText>楽曲登録</ButtonText>
          </NavigationButton>
        </NavigationItem>

        <NavigationItem role="none">
          <NavigationButton
            onClick={handleOpenManagement}
            $isActive={currentView === 'management'}
            role="menuitem"
            aria-current={currentView === 'management' ? 'page' : undefined}
            title="楽曲を管理・編集"
          >
            <ButtonIcon aria-hidden="true">📝</ButtonIcon>
            <ButtonText>楽曲管理</ButtonText>
          </NavigationButton>
        </NavigationItem>
      </NavigationMenu>

      {/* モバイル用オーバーレイ */}
      {isMenuOpen && (
        <MobileOverlay
          onClick={handleToggleMenu}
          className="mobile-only"
          aria-hidden="true"
        />
      )}
    </NavigationContainer>
  )
})

// スタイル定義
const NavigationContainer = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    .mobile-only {
      display: block;
    }
  }

  @media (min-width: 769px) {
    .mobile-only {
      display: none;
    }
  }
`

const MobileMenuButton = styled.button`
  display: none;
  background: linear-gradient(135deg, var(--bubble-pink), var(--bubble-rose));
  border: 2px solid white;
  border-radius: 12px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--shadow-medium);
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px var(--shadow-strong);
  }

  &:focus {
    outline: 2px solid var(--bubble-pink);
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`

const MenuIcon = styled.div<{ $isOpen: boolean }>`
  width: 20px;
  height: 16px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.3s ease-in-out;

  span {
    display: block;
    position: absolute;
    height: 2px;
    width: 100%;
    background: white;
    border-radius: 1px;
    opacity: 1;
    left: 0;
    transform: rotate(0deg);
    transition: 0.25s ease-in-out;

    &:nth-child(1) {
      top: ${props => props.$isOpen ? '7px' : '0px'};
      transform: ${props => props.$isOpen ? 'rotate(135deg)' : 'rotate(0deg)'};
    }

    &:nth-child(2) {
      top: 7px;
      opacity: ${props => props.$isOpen ? '0' : '1'};
      left: ${props => props.$isOpen ? '-20px' : '0'};
    }

    &:nth-child(3) {
      top: ${props => props.$isOpen ? '7px' : '14px'};
      transform: ${props => props.$isOpen ? 'rotate(-135deg)' : 'rotate(0deg)'};
    }
  }
`

const NavigationMenu = styled.ul<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 768px) {
    position: fixed;
    top: 80px;
    right: 16px;
    flex-direction: column;
    background: linear-gradient(135deg, rgba(255, 240, 248, 0.98), rgba(255, 228, 240, 0.95));
    backdrop-filter: blur(15px);
    border: 2px solid var(--border-cute);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 12px 40px var(--shadow-strong);
    z-index: 1000;
    min-width: 200px;
    
    transform: ${props => props.$isOpen ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)'};
    opacity: ${props => props.$isOpen ? '1' : '0'};
    visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
    transition: all 0.3s ease;
  }
`

const NavigationItem = styled.li`
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const NavigationButton = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, var(--bubble-rose), #dc143c)'
    : 'linear-gradient(135deg, var(--bubble-pink), var(--bubble-rose))'
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
    ? '0 4px 16px var(--shadow-strong), inset 0 2px 4px rgba(0,0,0,0.1)'
    : '0 4px 12px var(--shadow-medium)'
  };
  text-transform: uppercase;
  letter-spacing: 0.3px;
  min-height: 40px;
  white-space: nowrap;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px var(--shadow-strong);
    background: ${props => props.$isActive 
      ? 'linear-gradient(135deg, #dc143c, #b91c3c)'
      : 'linear-gradient(135deg, var(--bubble-rose), #dc143c)'
    };
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid var(--accent-sparkle);
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
      background: linear-gradient(45deg, var(--accent-sparkle), var(--bubble-pink));
      border-radius: 22px;
      z-index: -1;
      animation: activeGlow 2s ease-in-out infinite alternate;
    }
  `}

  @keyframes activeGlow {
    0% { opacity: 0.5; }
    100% { opacity: 0.8; }
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    padding: 12px 16px;
    font-size: 14px;
    border-radius: 12px;
  }
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

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  backdrop-filter: blur(2px);
`

export default Navigation