import React, { ReactNode, useEffect } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'
import { initSafariHeaderFix } from '@/utils/safariHeaderFix'
// import { getLayoutManager } from '@/utils/ResponsiveLayoutManager' // 一時的に無効化
import ScrollableMainSection from './ScrollableMainSection'
// import '@/styles/layout-stability.css' // 一時的に無効化

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

    // Safari対応の初期化
    useEffect(() => {
      // Safari専用のヘッダー修正
      initSafariHeaderFix()

      console.log('🍎 Safari header fix initialized')
    }, [])

    return (
      <LayoutContainer className={className}>
        {/* スクロール可能なメインセクション（ヘッダー + コンテンツ） */}
        <ScrollableMainSection header={header}>
          {children}
        </ScrollableMainSection>

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
  font-family:
    'M PLUS Rounded 1c', 'Comic Sans MS', 'Arial', cursive, sans-serif;
  overflow-x: hidden;

  /* PC環境での高さ制限を追加 */
  @media (min-width: 901px) {
    height: 100vh;
    max-height: 100vh;
    overflow: hidden;
  }

  /* スマホでのセーフエリア対応を強化 */
  @media (max-width: 900px) {
    padding-top: max(env(safe-area-inset-top), 0px);
    min-height: 100vh;
    height: auto;
  }
`

const NavigationSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  /* フッタの安定性を確保 */
  transform: translateZ(0);
  backface-visibility: hidden;

  /* セーフエリア対応 */
  padding-bottom: env(safe-area-inset-bottom, 0px);
`

export default MobileFirstLayout
