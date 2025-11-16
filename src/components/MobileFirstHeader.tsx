import React from 'react'
import styled from 'styled-components'
import { useResponsive } from '@/hooks/useResponsive'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

interface MobileFirstHeaderProps {
  children?: React.ReactNode
}

/**
 * モバイルファーストヘッダーコンポーネント
 * Requirements: 17.1, 17.2 - ヘッダーの簡素化とサイズ縮小
 */
export const MobileFirstHeader: React.FC<MobileFirstHeaderProps> = React.memo(
  ({ children }) => {
    const screenSize = useResponsive()
    const theme = useGlassmorphismTheme()

    // Safari専用の対策
    React.useEffect(() => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isSafari =
        userAgent.includes('safari') && !userAgent.includes('chrome')
      const isIOSSafari =
        /iphone|ipad|ipod/.test(userAgent) && userAgent.includes('safari')

      if ((isSafari || isIOSSafari) && screenSize.isMobile) {
        console.log('🍎 Safari header component - applying emergency fixes')

        const applyEmergencyFix = () => {
          const headerElement = document.querySelector(
            'header[role="banner"]'
          ) as HTMLElement
          if (headerElement) {
            headerElement.style.setProperty('display', 'flex', 'important')
            headerElement.style.setProperty('position', 'fixed', 'important')
            headerElement.style.setProperty('top', '0', 'important')
            headerElement.style.setProperty('left', '0', 'important')
            headerElement.style.setProperty('right', '0', 'important')
            headerElement.style.setProperty('width', '100%', 'important')
            headerElement.style.setProperty(
              'z-index',
              '2147483647',
              'important'
            )
            headerElement.style.setProperty(
              'visibility',
              'visible',
              'important'
            )
            headerElement.style.setProperty('opacity', '1', 'important')
            headerElement.style.setProperty(
              'background',
              'rgba(255, 255, 255, 0.95)',
              'important'
            )
            headerElement.style.setProperty(
              'backdrop-filter',
              'blur(15px)',
              'important'
            )
            headerElement.style.setProperty(
              '-webkit-backdrop-filter',
              'blur(15px)',
              'important'
            )
            headerElement.style.setProperty('min-height', '85px', 'important')
          }
        }

        // 複数回実行で確実に
        applyEmergencyFix()
        setTimeout(applyEmergencyFix, 100)
        setTimeout(applyEmergencyFix, 500)
        setTimeout(applyEmergencyFix, 1000)

        // 定期的にチェック
        const interval = setInterval(applyEmergencyFix, 3000)

        return () => clearInterval(interval)
      }
    }, [screenSize.isMobile])

    return (
      <HeaderContainer $theme={theme}>
        <HeaderContent>
          <LogoSection>
            <LogoIcon>🫧</LogoIcon>
            <LogoText>
              <MainTitle $theme={theme}>
                <span
                  style={{
                    color: '#f8bbd9',
                    textShadow: '0 2px 4px rgba(248, 187, 217, 0.3)',
                  }}
                >
                  栗林みな実
                </span>{' '}
                <span
                  style={{
                    color: '#dda0dd',
                    textShadow: '0 2px 4px rgba(221, 160, 221, 0.3)',
                  }}
                >
                  Maron Bubbles(β)
                </span>
              </MainTitle>
              <SubTitle $theme={theme}>
                {screenSize.isMobile
                  ? '楽曲の新たな魅力を発見・登録してみましょう'
                  : '楽曲の新たな魅力を発見・登録してみましょう'}
              </SubTitle>
              <SubTitle2 $theme={theme}>
                {screenSize.isMobile
                  ? 'シャボン玉をタップすると関連情報が閲覧できます'
                  : 'シャボン玉をクリックして関連情報が閲覧できます'}
              </SubTitle2>
            </LogoText>
          </LogoSection>

          {/* ナビゲーションボタン（PCのみヘッダーに表示） */}
          {children && !screenSize.isMobile && (
            <HeaderActions>{children}</HeaderActions>
          )}
        </HeaderContent>
      </HeaderContainer>
    )
  }
)

// ガラスモーフィズム統一ヘッダー
const HeaderContainer = styled.header<{ $theme: any }>`
  width: 100%;
  height: 100%;

  /* ガラスモーフィズム効果 */
  background: ${props => props.$theme.colors.glass.medium};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.medium};

  /* 境界線とシャドウ */
  border-bottom: ${props => props.$theme.effects.borders.accent};
  box-shadow: ${props => props.$theme.effects.shadows.colored};

  /* パフォーマンス最適化 */
  will-change: backdrop-filter;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);

  /* スムーズな遷移 */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* レスポンシブ対応 */
  @media (max-width: 900px) {
    backdrop-filter: ${props => props.$theme.effects.blur.light};
    -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};

    /* Safari専用の位置固定強化 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 0;
    transform: translate3d(0, 0, 0);
    -webkit-transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;

    /* Safari専用のセーフエリア対応 */
    padding-top: env(safe-area-inset-top, 0px);
    min-height: calc(85px + env(safe-area-inset-top, 0px));
  }

  /* Safari専用の追加対応 */
  @supports (-webkit-touch-callout: none) {
    @media (max-width: 900px) {
      /* Safari検出時の追加スタイル */
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;

      /* Safari専用のビューポート対応 */
      height: calc(85px + env(safe-area-inset-top, 0px));
      min-height: calc(85px + env(safe-area-inset-top, 0px));
    }
  }

  /* 高コントラストモード対応 */
  @media (prefers-contrast: high) {
    background: ${props => props.$theme.colors.surface};
    border-bottom: 2px solid ${props => props.$theme.colors.neutral[400]};
  }

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const HeaderContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center; /* 中央寄せに変更 */
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 32px; /* パディングを適度に設定 */
  gap: 1.5rem;

  /* 余白設計の最適化 */
  min-height: 80px; /* ヘッダーコンテンツの高さを調整 */

  @media (max-width: 900px) {
    padding: 12px 20px;
    min-height: 50px; /* モバイルでの高さを調整 */
    gap: 1rem;
    /* スマホではロゴを中央寄せ */
    justify-content: center;
  }

  @media (max-width: 480px) {
    padding: 10px 16px;
    min-height: 45px;
  }
`

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  /* タイトルロゴの強調 */
  padding: 8px 0;

  /* 絵文字の幅を考慮してテキスト部分を中央に配置 */
  /* PCでは右側のアイコンとのバランスを考慮してさらに左に */
  margin-left: -80px;

  @media (max-width: 900px) {
    gap: 8px;
    padding: 4px 0;
    margin-left: -16px;
  }

  @media (max-width: 480px) {
    margin-left: -14px;
  }
`

const LogoIcon = styled.span`
  font-size: 32px;
  animation: float 3s ease-in-out infinite;
  flex-shrink: 0;

  /* ロゴアイコンの強調 */
  filter: drop-shadow(0 2px 4px rgba(224, 102, 102, 0.2));

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  @media (max-width: 900px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }

  /* モーション軽減対応 */
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;

  /* タイトルテキストの余白強化 */
  padding: 2px 0;

  @media (max-width: 900px) {
    gap: 1px;
    padding: 0;
  }
`

const MainTitle = styled.h1<{ $theme: any }>`
  margin: 0;
  font-family: 'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif;
  font-weight: 500;
  line-height: 1.2;

  /* タイトルロゴの視覚的強調 */
  font-size: clamp(20px, 5vw, 28px);
  letter-spacing: 0.02em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 900px) {
    font-size: clamp(16px, 4vw, 22px);
  }

  @media (max-width: 480px) {
    font-size: clamp(14px, 4vw, 18px);
  }
`

const SubTitle = styled.p<{ $theme: any }>`
  margin: 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: clamp(12px, 2.5vw, 16px);
  color: ${props => props.$theme.colors.text.secondary};
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  line-height: 1.3;
  letter-spacing: 0.01em;

  /* サブタイトルの視覚的改善 */
  opacity: 0.9;

  @media (max-width: 900px) {
    font-size: clamp(10px, 2vw, 13px);
  }
`

const SubTitle2 = styled.p<{ $theme: any }>`
  margin: 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: clamp(10px, 2vw, 14px);
  color: ${props => props.$theme.colors.text.secondary};
  font-weight: ${props => props.$theme.typography.fontWeights.normal};
  line-height: 1.2;
  letter-spacing: 0.01em;

  /* 2行目の説明文はより控えめに */
  opacity: 0.8;
  margin-top: 2px;

  @media (max-width: 900px) {
    font-size: clamp(10px, 1.8vw, 11px);
    margin-top: 1px;
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  position: absolute;
  right: 32px;

  /* 余白とレイアウトの最適化 */
  padding: 4px 0;

  @media (max-width: 900px) {
    gap: 12px;
    right: 20px;
  }

  @media (max-width: 480px) {
    right: 16px;
  }
`

export default MobileFirstHeader
