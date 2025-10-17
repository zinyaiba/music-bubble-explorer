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
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <LogoIcon>🫧</LogoIcon>
          <LogoText>
            <MainTitle>
              栗林みな実 Malon Bubbles
            </MainTitle>
            {!screenSize.isMobile && (
              <SubTitle>
                栗林みな実さんの楽曲にタグをつけて魅力を伝えよう🌰
              </SubTitle>
            )}
          </LogoText>
        </LogoSection>
        
        {/* ナビゲーションボタン（PCのみヘッダーに表示） */}
        {children && !screenSize.isMobile && (
          <HeaderActions>
            {children}
          </HeaderActions>
        )}
      </HeaderContent>
    </HeaderContainer>
  )
})

// シンプルな統一ヘッダー
const HeaderContainer = styled.header`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-bottom: 2px solid var(--border-cute, #ffb6c1);
  box-shadow: 0 4px 20px var(--shadow-light, rgba(255, 105, 180, 0.15));
`

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  gap: 1rem;

  @media (max-width: 768px) {
    padding: 8px 16px;
    /* スマホではロゴを中央寄せ */
    justify-content: center;
  }
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
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

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MainTitle = styled.h1`
  margin: 0;
  font-weight: 700;
  line-height: 1.1;
  background: linear-gradient(45deg, var(--bubble-pink, #ff69b4), var(--bubble-rose, #ff1493), var(--bubble-lavender, #dda0dd));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: clamp(16px, 4vw, 24px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @supports not (-webkit-background-clip: text) {
    color: var(--bubble-pink, #ff69b4);
    background: none;
  }
`

const SubTitle = styled.p`
  margin: 0;
  font-size: clamp(11px, 2vw, 14px);
  color: var(--text-secondary, #b565a7);
  font-weight: 500;
  line-height: 1.2;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  
  /* PC: 中央寄りに配置 */
  @media (min-width: 769px) {
    margin-right: 20%;
  }
`

export default MobileFirstHeader