import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'

interface LayoutProps {
  children: ReactNode
  header?: ReactNode
  navigation?: ReactNode
  className?: string
}

/**
 * レイアウトコンポーネント
 * Requirements: 11.1, 12.1 - レスポンシブデザインの調整とUI統合
 */
export const Layout: React.FC<LayoutProps> = React.memo(({
  children,
  header,
  navigation,
  className
}) => {
  const screenSize = useResponsive()

  return (
    <LayoutContainer 
      className={className}
      $isMobile={screenSize.isMobile}
      $isTablet={screenSize.isTablet}
      $isLandscape={screenSize.isLandscape}
    >
      {header && (
        <HeaderSection role="banner">
          <HeaderContent>
            <HeaderMain>
              {header}
            </HeaderMain>
            {navigation && (
              <NavigationSection role="navigation" aria-label="メインナビゲーション">
                {navigation}
              </NavigationSection>
            )}
          </HeaderContent>
        </HeaderSection>
      )}
      
      <MainSection 
        id="main-content" 
        role="main"
        $hasHeader={!!header}
      >
        {children}
      </MainSection>
    </LayoutContainer>
  )
})

// スタイル定義
const LayoutContainer = styled.div<{
  $isMobile: boolean
  $isTablet: boolean
  $isLandscape: boolean
}>`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-areas: 
    "header"
    "main";
  background: var(--background-gradient);
  font-family: 'Comic Sans MS', 'Arial', cursive, sans-serif;
  position: relative;
  overflow-x: hidden;

  /* レスポンシブ調整 */
  ${props => props.$isMobile && `
    grid-template-rows: auto 1fr;
    
    ${props.$isLandscape && `
      grid-template-rows: auto 1fr;
      min-height: 100vh;
    `}
  `}

  ${props => props.$isTablet && `
    grid-template-rows: auto 1fr;
  `}
`

const HeaderSection = styled.header`
  grid-area: header;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  border-bottom: 2px solid var(--border-cute);
  border-radius: 0 0 30px 30px;
  box-shadow: 0 4px 20px var(--shadow-light);
  position: relative;
  z-index: 100;

  @media (max-width: 768px) {
    border-radius: 0 0 20px 20px;
  }
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.75rem 0.75rem;
    gap: 0.75rem;
  }
`

const HeaderMain = styled.div`
  flex: 1;
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
    width: 100%;
  }
`

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`

const MainSection = styled.main<{ $hasHeader: boolean }>`
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 2rem 1rem;
  gap: 1.5rem;
  min-height: ${props => props.$hasHeader ? 'auto' : '100vh'};

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    gap: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
    gap: 1rem;
  }

  /* ランドスケープモードでの調整 */
  @media (max-width: 767px) and (orientation: landscape) {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }
`

export default Layout