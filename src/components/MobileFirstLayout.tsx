import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'

interface MobileFirstLayoutProps {
  children: ReactNode
  header?: ReactNode
  navigation?: ReactNode
  className?: string
}

/**
 * モバイルファーストレイアウトコンポーネント
 * Requirements: 17.1, 17.2, 17.3 - シャボン玉領域の最大化とモバイルファーストUI
 */
export const MobileFirstLayout: React.FC<MobileFirstLayoutProps> = React.memo(({
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
      {/* ヘッダー（簡素化） */}
      {header && (
        <HeaderSection 
          role="banner"
          $isMobile={screenSize.isMobile}
          $isLandscape={screenSize.isLandscape}
        >
          {header}
        </HeaderSection>
      )}
      
      {/* メインコンテンツエリア（シャボン玉領域を最大化） */}
      <MainSection 
        id="main-content" 
        role="main"
        $isMobile={screenSize.isMobile}
        $isTablet={screenSize.isTablet}
        $isLandscape={screenSize.isLandscape}
        $hasHeader={!!header}
        $hasNavigation={!!navigation}
      >
        {children}
      </MainSection>
      
      {/* ナビゲーション（モバイルでのみボトムに表示、デスクトップではヘッダー内） */}
      {navigation && screenSize.isMobile && (
        <NavigationSection 
          role="navigation" 
          aria-label="メインナビゲーション"
          $isMobile={screenSize.isMobile}
        >
          {navigation}
        </NavigationSection>
      )}
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
  background: var(--background-gradient);
  font-family: 'Comic Sans MS', 'Arial', cursive, sans-serif;
  position: relative;
  overflow-x: hidden;

  /* モバイルファーストのグリッドレイアウト */
  ${props => props.$isMobile ? `
    /* モバイル: ヘッダー + メインエリア（ナビゲーションは固定ボトム） */
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "header"
      "main";
    
    ${props.$isLandscape ? `
      /* ランドスケープ: ヘッダーをさらに縮小 */
      grid-template-rows: auto 1fr;
    ` : ''}
  ` : `
    /* デスクトップ/タブレット: 従来のレイアウト */
    grid-template-rows: auto 1fr;
    grid-template-areas: 
      "header"
      "main";
  `}
`

const HeaderSection = styled.header<{
  $isMobile: boolean
  $isLandscape: boolean
}>`
  grid-area: header;
  z-index: 100;

  /* モバイルファーストの高さ設定 */
  ${props => props.$isMobile ? `
    /* モバイル: 最小限の高さ */
    height: 50px;
    
    ${props.$isLandscape ? `
      /* ランドスケープ: さらに縮小 */
      height: 45px;
    ` : ''}
  ` : `
    /* デスクトップ/タブレット */
    height: auto;
    min-height: 60px;
  `}
`

const MainSection = styled.main<{
  $isMobile: boolean
  $isTablet: boolean
  $isLandscape: boolean
  $hasHeader: boolean
  $hasNavigation: boolean
}>`
  grid-area: main;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;

  /* モバイルファーストのパディングとサイズ設定 */
  ${props => props.$isMobile ? `
    /* モバイル: シャボン玉領域を最大化 */
    padding: 8px 4px;
    gap: 8px;
    
    /* ボトムナビゲーション分の余白を確保 */
    ${props.$hasNavigation ? `
      padding-bottom: calc(60px + 8px);
      min-height: calc(100vh - 50px - 60px);
    ` : `
      min-height: calc(100vh - 50px);
    `}
    
    ${props.$isLandscape ? `
      /* ランドスケープ: さらにパディングを削減 */
      padding: 4px 8px;
      gap: 4px;
      ${props.$hasNavigation ? `
        padding-bottom: calc(60px + 4px);
        min-height: calc(100vh - 45px - 60px);
      ` : `
        min-height: calc(100vh - 45px);
      `}
    ` : ''}
  ` : props.$isTablet ? `
    /* タブレット */
    padding: 12px 8px;
    gap: 12px;
    min-height: calc(100vh - 60px);
  ` : `
    /* デスクトップ */
    padding: 16px 12px;
    gap: 16px;
    min-height: calc(100vh - 80px);
  `}

  /* iPhone X以降の安全領域対応 */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    ${props => props.$isMobile && props.$hasNavigation && `
      padding-bottom: calc(60px + 8px + env(safe-area-inset-bottom));
    `}
  }
`

const NavigationSection = styled.div<{ $isMobile: boolean }>`
  ${props => props.$isMobile ? `
    /* モバイル: ナビゲーションは固定ボトム（MobileFirstNavigationコンポーネント内で制御） */
    position: relative;
  ` : `
    /* デスクトップ: ナビゲーションはヘッダー内（MobileFirstNavigationコンポーネント内で制御） */
    position: relative;
  `}
`

export default MobileFirstLayout