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
// 要件: 3.2, 5.3 - dvh単位の使用とvhフォールバック、セーフエリア変数の使用
const LayoutContainer = styled.div`
  width: 100%;
  /* dvh非サポートブラウザ用フォールバック */
  min-height: 100vh;
  /* dvhサポートブラウザ用 - 動的ビューポート高さ */
  min-height: var(--safe-viewport-height, 100dvh);
  height: auto; /* 自動高さ調整 */
  display: flex;
  flex-direction: column;
  background: var(--background-gradient);
  font-family:
    'M PLUS Rounded 1c', 'Comic Sans MS', 'Arial', cursive, sans-serif;
  overflow-x: hidden;

  /* PC環境での高さ制限を追加 */
  @media (min-width: 901px) {
    /* dvh非サポートブラウザ用フォールバック */
    height: 100vh;
    max-height: 100vh;
    /* dvhサポートブラウザ用 */
    height: var(--safe-viewport-height, 100dvh);
    max-height: var(--safe-viewport-height, 100dvh);
    overflow: hidden;
  }

  /* スマホでのセーフエリア対応を強化 */
  /* 要件: 3.2, 5.3 - セーフエリア変数を使用 */
  @media (max-width: 900px) {
    /* セーフエリア変数を使用（safe-area-system.cssで定義） */
    padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
    /* dvh非サポートブラウザ用フォールバック */
    min-height: 100vh;
    /* dvhサポートブラウザ用 */
    min-height: var(--safe-viewport-height, 100dvh);
    height: auto;
  }
`

// 要件: 3.3 - 下部ナビゲーションのセーフエリア対応
const NavigationSection = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;

  /* フッタの安定性を確保 */
  transform: translateZ(0);
  backface-visibility: hidden;

  /* セーフエリア対応 - CSS変数を使用（safe-area-system.cssで定義） */
  /* 要件: 3.3 - env(safe-area-inset-bottom)を適用 */
  padding-bottom: var(
    --safe-area-inset-bottom,
    env(safe-area-inset-bottom, 0px)
  );

  /* 横向き時の左右セーフエリア対応 */
  padding-left: var(--safe-area-inset-left, env(safe-area-inset-left, 0px));
  padding-right: var(--safe-area-inset-right, env(safe-area-inset-right, 0px));
`

export default MobileFirstLayout
