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
 * 統一レイアウトコンポーネント（スマホベース）
 * PC・スマホ共通のシンプルなレイアウト
 */
export const MobileFirstLayout: React.FC<MobileFirstLayoutProps> = React.memo(
  ({ children, header, navigation, className }) => {
    const screenSize = useResponsive()

    return (
      <LayoutContainer className={className}>
        {/* ヘッダー（PC・スマホ共通） */}
        {header && <HeaderSection>{header}</HeaderSection>}

        {/* メインコンテンツエリア */}
        <MainSection>{children}</MainSection>

        {/* ボトムナビゲーション（スマホのみ） */}
        {navigation && screenSize.isMobile && (
          <NavigationSection>{navigation}</NavigationSection>
        )}
      </LayoutContainer>
    )
  }
)

// シンプルな統一レイアウト
const LayoutContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  height: auto; /* 自動高さ調整 */
  display: flex;
  flex-direction: column;
  background: var(--background-gradient);
  font-family: 'Comic Sans MS', 'Arial', cursive, sans-serif;
  overflow-x: hidden;

  /* スマホでのセーフエリア対応を強化 */
  @media (max-width: 900px) {
    padding-top: max(env(safe-area-inset-top), 0px);
    min-height: 100vh;
    height: auto;
  }
`

const HeaderSection = styled.header`
  flex-shrink: 0;
  height: 120px; /* PCでヘッダー領域をさらに拡大 */
  width: 100%;
  z-index: 1000;

  @media (max-width: 900px) {
    height: 70px; /* モバイルでも適切なサイズに */
  }
`

const MainSection = styled.main`
  flex: 1;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto; /* 縦スクロールを有効化 */
  padding: 16px; /* パディングを適度に設定 */

  /* PC: 中央寄せ、横幅制限 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 12px; /* 間隔を狭める */
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 120px); /* ヘッダー高さに合わせて調整 */

  /* スマホでの調整 */
  @media (max-width: 900px) {
    padding: 8px;
    padding-bottom: 20px; /* フッターメニューとの余白を最小限に */
    gap: 6px; /* モバイルでは更に間隔を狭める */
    max-width: 100%;
    margin: 0;
    /* フッターメニューを考慮した高さ制限 - より確実な設定 */
    position: fixed;
    top: 70px; /* ヘッダー高さ */
    left: 0;
    right: 0;
    bottom: 88px; /* フッターメニュー高さ */
    height: auto;
    max-height: none;
    min-height: auto;
    /* スクロール動作を滑らかにする */
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    /* Flexboxの子要素が適切にスクロールできるように */
    align-items: stretch;
    /* スクロールを強制的に有効にする */
    overflow-y: scroll !important;
    overflow-x: hidden !important;
  }

  /* 今風のガラスモーフィズムスクロールバー */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent; /* トラックは透明 */
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 182, 193, 0.45);
    border-radius: 999px;
    border: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35); /* ガラス感の内側白線 */
    transition: all 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 182, 193, 0.65);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
  }

  /* Firefox用のスクロールバー */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 182, 193, 0.45) transparent;
`

const NavigationSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
`

export default MobileFirstLayout
