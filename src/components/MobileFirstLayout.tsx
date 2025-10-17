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
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-gradient);
  font-family: 'Comic Sans MS', 'Arial', cursive, sans-serif;
  overflow: hidden;

  /* スマホでのセーフエリア対応を強化 */
  @media (max-width: 768px) {
    padding-top: max(env(safe-area-inset-top), 20px);
    height: calc(100vh - max(env(safe-area-inset-top), 20px));
  }
`

const HeaderSection = styled.header`
  flex-shrink: 0;
  height: 60px;
  width: 100%;
  z-index: 1000;

  @media (max-width: 768px) {
    height: 50px;
  }
`

const MainSection = styled.main`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;

  /* PC: 中央寄せ、横幅制限 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;

  /* スマホでの調整 */
  @media (max-width: 768px) {
    padding: 4px;
    padding-bottom: 100px;
    gap: 2px;
    max-width: 100%;
    margin: 0;
    /* シャボン玉領域をもっと縦に長く */
    min-height: calc(100vh - 70px - 100px);
  }

  /* スクロールバー */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 105, 180, 0.3);
    border-radius: 2px;
  }
`

const NavigationSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
`

export default MobileFirstLayout
