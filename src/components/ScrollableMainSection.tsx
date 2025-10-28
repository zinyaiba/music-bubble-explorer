import React, { ReactNode, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'

interface ScrollableMainSectionProps {
  children: ReactNode
  header?: ReactNode
  className?: string
}

/**
 * スクロール可能なメインセクションコンポーネント
 * ヘッダー、シャボン玉領域、ヘルプメッセージを含む統一スクロール領域を実装
 * レスポンシブ対応とパフォーマンス最適化を含む
 */
export const ScrollableMainSection: React.FC<ScrollableMainSectionProps> =
  React.memo(({ children, header, className }) => {
    const screenSize = useResponsive()
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // パフォーマンス最適化のためのスクロール制御
    useEffect(() => {
      const scrollContainer = scrollContainerRef.current
      if (!scrollContainer) return

      // スクロール性能の最適化
      let ticking = false
      const handleScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            // スクロール位置の監視やパフォーマンス調整をここで実行
            ticking = false
          })
          ticking = true
        }
      }

      scrollContainer.addEventListener('scroll', handleScroll, {
        passive: true,
      })

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }, [])

    return (
      <ScrollableContainer
        ref={scrollContainerRef}
        className={className}
        $isMobile={screenSize.isMobile}
      >
        {/* ヘッダーセクション（スクロール対象） */}
        {header && (
          <HeaderWrapper $isMobile={screenSize.isMobile}>
            {header}
          </HeaderWrapper>
        )}

        {/* メインコンテンツ（シャボン玉領域 + ヘルプメッセージ） */}
        <ContentWrapper $isMobile={screenSize.isMobile}>
          {children}
        </ContentWrapper>
      </ScrollableContainer>
    )
  })

const ScrollableContainer = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  /* パフォーマンス最適化 */
  will-change: scroll-position;
  transform: translateZ(0);
  backface-visibility: hidden;

  /* スクロール動作の最適化 */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  overscroll-behavior: contain;

  /* PC向けスタイル */
  ${props =>
    !props.$isMobile &&
    `
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px;
    gap: 12px;
    align-items: center;
    justify-content: flex-start;
    min-height: 100vh;
    max-height: 100vh;
  `}

  /* モバイル向けスタイル */
  ${props =>
    props.$isMobile &&
    `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: calc(88px + env(safe-area-inset-bottom, 0px));
    padding: 0;
    margin: 0;
    max-width: 100%;
    align-items: stretch;
    
    /* Safari対応 */
    height: calc(
      100vh - 88px - env(safe-area-inset-bottom, 0px)
    );
    
    /* レイアウト安定化との競合を防ぐ */
    z-index: 1;
  `}

  /* ガラスモーフィズムスクロールバー */
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 182, 193, 0.45);
    border-radius: 999px;
    border: none;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
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

const HeaderWrapper = styled.div<{ $isMobile: boolean }>`
  flex-shrink: 0;
  width: 100%;

  /* PC向けスタイル */
  ${props =>
    !props.$isMobile &&
    `
    height: 120px;
    z-index: 1000;
  `}

  /* モバイル向けスタイル */
  ${props =>
    props.$isMobile &&
    `
    height: 85px;
    min-height: calc(85px + env(safe-area-inset-top, 0px));
    padding-top: env(safe-area-inset-top, 0px);
    
    /* パフォーマンス最適化 */
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  `}

  /* Safari専用の追加対応 */
  @supports (-webkit-touch-callout: none) {
    ${props =>
      props.$isMobile &&
      `
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    `}
  }
`

const ContentWrapper = styled.div<{ $isMobile: boolean }>`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;

  /* PC向けスタイル */
  ${props =>
    !props.$isMobile &&
    `
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 0 16px;
    min-height: calc(100vh - 120px);
  `}

  /* モバイル向けスタイル */
  ${props =>
    props.$isMobile &&
    `
    align-items: stretch;
    gap: 6px;
    padding: 8px;
    padding-bottom: 20px;
    
    /* パフォーマンス最適化 */
    contain: layout style paint;
  `}
`

export default ScrollableMainSection
