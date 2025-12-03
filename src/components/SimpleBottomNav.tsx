import React from 'react'
import styled from 'styled-components'

interface SimpleBottomNavProps {
  currentView: string
  onRegistrationClick: () => void
  onManagementClick: () => void
  onTagListClick: () => void
}

export const SimpleBottomNav: React.FC<SimpleBottomNavProps> = ({
  currentView,
  onRegistrationClick,
  onManagementClick,
  onTagListClick,
}) => {
  const handleRegistrationClick = () => {
    console.log('🎵 SimpleBottomNav: Registration button clicked!')
    console.log('Current view:', currentView)
    onRegistrationClick()
  }

  const handleManagementClick = () => {
    console.log('📝 SimpleBottomNav: Management button clicked!')
    console.log('Current view:', currentView)
    onManagementClick()
  }

  const handleTagListClick = () => {
    console.log('🏷️ SimpleBottomNav: Tag list button clicked!')
    console.log('Current view:', currentView)
    onTagListClick()
  }

  return (
    <BottomNavContainer>
      <NavButton
        onClick={handleRegistrationClick}
        $isActive={currentView === 'registration'}
      >
        <Icon>➕</Icon>
        <Label>楽曲登録</Label>
      </NavButton>

      <NavButton
        onClick={handleManagementClick}
        $isActive={currentView === 'management'}
      >
        <Icon>📝</Icon>
        <Label>楽曲一覧</Label>
      </NavButton>

      <NavButton
        onClick={handleTagListClick}
        $isActive={currentView === 'tag-list'}
      >
        <Icon>🏷️</Icon>
        <Label>タグ一覧</Label>
      </NavButton>
    </BottomNavContainer>
  )
}

const BottomNavContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 182, 193, 0.95),
    rgba(255, 105, 180, 0.95)
  );
  backdrop-filter: blur(15px);
  border-top: 3px solid rgba(255, 105, 180, 0.5);
  padding: 16px 20px 20px;
  z-index: 1000;
  box-shadow: 0 -8px 30px rgba(255, 105, 180, 0.3);
  display: flex;
  justify-content: space-around;
  align-items: center;

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
    0%,
    100% {
      opacity: 0.8;
    }
    50% {
      opacity: 1;
    }
  }

  /* iPhone X以降の安全領域対応 */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }
`

const NavButton = styled.button<{ $isActive: boolean }>`
  background: ${props =>
    props.$isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)'};
  border: 2px solid
    ${props => (props.$isActive ? '#ff69b4' : 'rgba(255, 255, 255, 0.9)')};
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
  box-shadow: ${props =>
    props.$isActive
      ? '0 4px 15px rgba(255, 105, 180, 0.4)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 105, 180, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  ${props =>
    props.$isActive &&
    `
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 4px;
      background: #ff69b4;
      border-radius: 2px;
      animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      0% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `}
`

const Icon = styled.span`
  font-size: 24px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #555;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
`
