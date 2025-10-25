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
                  Malon Bubbles
                </span>
              </MainTitle>
              <SubTitle $theme={theme}>
                {screenSize.isMobile
                  ? '「タグ登録」から楽曲にタグを付けてみよう'
                  : '栗林みな実さんの楽曲にタグをつけて魅力を伝えよう🌰'}
              </SubTitle>
              <SubTitle2 $theme={theme}>
                {screenSize.isMobile
                  ? 'シャボン玉をタップすると関連情報が見れるよ'
                  : 'シャボン玉をクリックして楽曲の詳細情報を確認できます'}
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
  justify-content: space-between;
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
  flex: 1;
  min-width: 0;

  /* タイトルロゴの強調 */
  padding: 8px 0;

  @media (max-width: 900px) {
    gap: 8px;
    padding: 4px 0;
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

  /* 余白とレイアウトの最適化 */
  padding: 4px 0;

  /* PC: 中央寄りに配置 */
  @media (min-width: 769px) {
    margin-right: 15%;
  }

  @media (max-width: 900px) {
    gap: 12px;
  }
`

export default MobileFirstHeader
