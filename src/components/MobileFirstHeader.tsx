import React from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'

interface MobileFirstHeaderProps {
  children?: React.ReactNode
}

/**
 * モバイルファーストヘッダーコンポーネント
 * Requirements: 17.1, 17.2 - ヘッダーの簡素化とサイズ縮小
 */
export const MobileFirstHeader: React.FC<MobileFirstHeaderProps> = React.memo(({
  children
}) => {
  const screenSize = useResponsive()

  return (
    <HeaderContainer 
      role="banner"
      $isMobile={screenSize.isMobile}
      $isTablet={screenSize.isTablet}
      $isLandscape={screenSize.isLandscape}
    >
      <HeaderContent $isMobile={screenSize.isMobile}>
        <LogoSection>
          <LogoIcon aria-hidden="true">🫧</LogoIcon>
          <LogoText $isMobile={screenSize.isMobile}>
            <MainTitle $isMobile={screenSize.isMobile}>
              栗林みな実 Bubble World
            </MainTitle>
            {!screenSize.isMobile && (
              <SubTitle>
                栗林みな実さんの楽曲世界をキュートなシャボン玉で探索しよう💕
              </SubTitle>
            )}
          </LogoText>
        </LogoSection>
        
        {/* デスクトップでのみ追加コンテンツを表示 */}
        {!screenSize.isMobile && children && (
          <HeaderExtra>
            {children}
          </HeaderExtra>
        )}
        
        {/* モバイルでの装飾要素 */}
        {screenSize.isMobile && (
          <MobileDecoration aria-hidden="true">
            ✨💖
          </MobileDecoration>
        )}
      </HeaderContent>
    </HeaderContainer>
  )
})

// スタイル定義
const HeaderContainer = styled.header<{
  $isMobile: boolean
  $isTablet: boolean
  $isLandscape: boolean
}>`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border-bottom: 2px solid var(--border-cute, #ffb6c1);
  box-shadow: 0 4px 20px var(--shadow-light, rgba(255, 105, 180, 0.15));
  position: relative;
  z-index: 100;

  /* モバイルファーストの高さ設定 */
  ${props => props.$isMobile ? `
    /* モバイル: 50px */
    min-height: 50px;
    border-radius: 0;
    border-bottom: 1px solid rgba(255, 182, 193, 0.3);
    
    ${props.$isLandscape ? `
      /* ランドスケープ: さらに縮小 */
      min-height: 45px;
    ` : ''}
  ` : props.$isTablet ? `
    /* タブレット: 60px */
    min-height: 60px;
    border-radius: 0 0 20px 20px;
  ` : `
    /* デスクトップ: 80px */
    min-height: 80px;
    border-radius: 0 0 30px 30px;
  `}
`

const HeaderContent = styled.div<{ $isMobile: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 1rem;

  ${props => props.$isMobile ? `
    /* モバイル: 最小限のパディング */
    padding: 8px 16px;
    min-height: 50px;
  ` : `
    /* デスクトップ/タブレット */
    padding: 12px 24px;
    min-height: 60px;
  `}
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0; /* flexboxでのオーバーフロー防止 */
`

const LogoIcon = styled.span`
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-2px); }
  }

  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const LogoText = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  ${props => props.$isMobile && `
    gap: 0;
  `}
`

const MainTitle = styled.h1<{ $isMobile: boolean }>`
  margin: 0;
  font-weight: 700;
  color: var(--text-primary, #8b4a8c);
  text-shadow: 1px 1px 2px var(--shadow-light, rgba(255, 105, 180, 0.15));
  background: linear-gradient(45deg, var(--bubble-pink, #ff69b4), var(--bubble-rose, #ff1493), var(--bubble-lavender, #dda0dd));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  
  /* レスポンシブフォントサイズ */
  ${props => props.$isMobile ? `
    font-size: clamp(14px, 4vw, 18px);
  ` : `
    font-size: clamp(20px, 4vw, 28px);
  `}

  /* テキストオーバーフロー対応 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    font-size: clamp(12px, 3.5vw, 16px);
  }
`

const SubTitle = styled.p`
  margin: 0;
  font-size: clamp(12px, 2.5vw, 16px);
  color: var(--text-secondary, #b565a7);
  font-weight: 500;
  line-height: 1.2;

  @media (max-width: 1024px) {
    font-size: clamp(11px, 2vw, 14px);
  }
`

const HeaderExtra = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  
  /* デスクトップでのナビゲーション表示を最適化 */
  @media (min-width: 769px) {
    margin-left: auto;
  }
  
  /* モバイルでは非表示 */
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileDecoration = styled.span`
  font-size: 16px;
  animation: twinkle 3s infinite;
  flex-shrink: 0;

  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: rotate(0deg); }
    50% { opacity: 0.7; transform: rotate(10deg); }
  }
`

export default MobileFirstHeader