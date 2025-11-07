import React, { useEffect, useCallback } from 'react'
import './StandardLayout.css'

interface StandardLayoutProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: 'compact' | 'standard' | 'large'
  mobileOptimized?: boolean
  showBackButton?: boolean
  onBack?: () => void
  showActions?: boolean
  actionContent?: React.ReactNode
  integratedHeader?: boolean // ヘッダーをボディ内に統合するかどうか
}

/**
 * 標準レイアウトテンプレートコンポーネント
 * タグ登録画面と同様のデザインシステムを適用した統一レイアウト
 * Requirements: 4.1, 4.2, 4.3
 */
export const StandardLayout: React.FC<StandardLayoutProps> = ({
  isVisible,
  onClose,
  title,
  children,
  className = '',
  size = 'standard',
  mobileOptimized = true,
  showBackButton = false,
  onBack,
  showActions = false,
  actionContent,
  integratedHeader = true, // デフォルトで統合ヘッダーを使用
}) => {
  /**
   * バックドロップクリックハンドラー（全画面表示では無効）
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    // 全画面表示ではバックドロップクリックで閉じない
    e.stopPropagation()
  }, [])

  /**
   * ESCキーでダイアログを閉じる
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBackButton && onBack) {
          onBack()
        } else {
          onClose()
        }
      }
    },
    [onClose, showBackButton, onBack]
  )

  /**
   * キーボードイベントリスナーの設定とブラウザUIバー対応
   */
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)

      // スマホ実機のブラウザUIバー対応
      const updatePadding = () => {
        const overlay = document.querySelector(
          '.standard-layout-overlay'
        ) as HTMLElement
        if (overlay && window.innerWidth <= 768) {
          // ブラウザUIバーの高さを計算
          const browserUIHeight = window.screen.height - window.innerHeight
          const paddingTop = Math.max(0, browserUIHeight)

          console.log('🔧 Browser UI Height:', browserUIHeight)
          console.log('🔧 Applying padding-top:', paddingTop)
          console.log('🔧 Overlay element:', overlay)

          overlay.style.paddingTop = `${paddingTop}px`
          overlay.style.setProperty(
            'padding-top',
            `${paddingTop}px`,
            'important'
          )
        }
      }

      // 初回実行（DOMレンダリング後に実行）
      setTimeout(updatePadding, 0)
      setTimeout(updatePadding, 100)
      setTimeout(updatePadding, 300)

      // リサイズ時にも更新
      window.addEventListener('resize', updatePadding)
      window.addEventListener('orientationchange', updatePadding)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', updatePadding)
        window.removeEventListener('orientationchange', updatePadding)
      }
    }
  }, [isVisible, handleKeyDown])

  // 表示状態でない場合は何も表示しない
  if (!isVisible) {
    console.log('🖼️ StandardLayout: Not visible, returning null', { title })
    return null
  }

  console.log('🖼️ StandardLayout: Rendering', {
    title,
    isVisible,
    integratedHeader,
    showBackButton,
    children: !!children,
  })

  const layoutClasses = [
    'standard-layout',
    `standard-layout--${size}`,
    mobileOptimized ? 'standard-layout--mobile-optimized' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const overlayClasses = ['standard-layout-overlay', className]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div
        className={overlayClasses}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="standard-layout-title"
        style={{
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        {/* デバッグ情報：画面右上に表示 */}
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'lime',
            padding: '8px',
            fontSize: '11px',
            zIndex: 99999,
            maxWidth: '200px',
            lineHeight: '1.4',
          }}
        >
          <strong>DEBUG INFO</strong>
          <br />
          Window: {typeof window !== 'undefined' ? window.innerWidth : 0} x{' '}
          {typeof window !== 'undefined' ? window.innerHeight : 0}
          <br />
          Screen: {typeof window !== 'undefined'
            ? window.screen.width
            : 0} x {typeof window !== 'undefined' ? window.screen.height : 0}
          <br />
          Viewport:{' '}
          {typeof window !== 'undefined'
            ? document.documentElement.clientWidth
            : 0}{' '}
          x{' '}
          {typeof window !== 'undefined'
            ? document.documentElement.clientHeight
            : 0}
          <br />
          <strong style={{ color: 'yellow' }}>
            UI Bar:{' '}
            {typeof window !== 'undefined'
              ? window.screen.height - window.innerHeight
              : 0}
            px
          </strong>
          <br />
          UserAgent:{' '}
          {typeof window !== 'undefined'
            ? navigator.userAgent.includes('Safari')
              ? 'Safari'
              : navigator.userAgent.includes('Chrome')
                ? 'Chrome'
                : 'Other'
            : 'N/A'}
        </div>
        <div className={layoutClasses}>
          {/* 従来のヘッダー（統合ヘッダーが無効の場合のみ表示） */}
          {!integratedHeader && (
            <div className="standard-layout-header">
              <div className="standard-layout-header-content">
                <h2
                  id="standard-layout-title"
                  className="standard-layout-title"
                >
                  {title}
                </h2>

                {/* ヘッダーアクション */}
                <div className="standard-layout-header-actions">
                  {showBackButton && onBack && (
                    <button
                      className="standard-layout-back-button"
                      onClick={onBack}
                      aria-label="前の画面に戻る"
                      type="button"
                    >
                      ← 戻る
                    </button>
                  )}

                  <button
                    className="standard-layout-close"
                    onClick={onClose}
                    aria-label="画面を閉じる"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* コンテンツエリア */}
          <div className="standard-layout-content">
            {/* メインコンテンツ */}
            <div className="standard-layout-main-content">
              {/* 統合ヘッダー（統合ヘッダーが有効の場合のみ表示） - メインコンテンツ内に移動 */}
              {integratedHeader && (
                <div
                  className="standard-layout-integrated-header"
                  style={{
                    display: 'block',
                    background: '#ff0000', // デバッグ用：赤色背景
                    borderBottom: '1px solid rgba(224, 102, 102, 0.2)',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* デバッグ情報表示 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      fontSize: '10px',
                      zIndex: 9999,
                      pointerEvents: 'none',
                    }}
                  >
                    safe-top:{' '}
                    {typeof window !== 'undefined'
                      ? getComputedStyle(
                          document.documentElement
                        ).getPropertyValue('--safe-area-inset-top') || '0px'
                      : '0px'}
                    <br />
                    innerHeight:{' '}
                    {typeof window !== 'undefined' ? window.innerHeight : 0}px
                    <br />
                    screenHeight:{' '}
                    {typeof window !== 'undefined' ? window.screen.height : 0}px
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      boxSizing: 'border-box',
                      minHeight: '48px',
                    }}
                  >
                    <h2
                      id="standard-layout-title"
                      className="standard-layout-integrated-title"
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#e06666',
                        flex: '1 1 auto',
                        minWidth: 0,
                        paddingRight: '12px',
                        lineHeight: '1.2',
                      }}
                    >
                      {title}
                    </h2>

                    {/* ヘッダーアクション */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {showBackButton && onBack && (
                        <button
                          className="standard-layout-integrated-back-button"
                          onClick={onBack}
                          aria-label="前の画面に戻る"
                          type="button"
                          style={{
                            background: 'rgba(255, 255, 255, 0.5)',
                            border: '1px solid rgba(224, 102, 102, 0.2)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          ← 戻る
                        </button>
                      )}

                      <button
                        className="standard-layout-integrated-close"
                        onClick={onClose}
                        aria-label="画面を閉じる"
                        type="button"
                        style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          border: '1px solid rgba(224, 102, 102, 0.2)',
                          borderRadius: '50%',
                          fontSize: '20px',
                          color: '#666',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                          padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="standard-layout-content-wrapper"
                style={{
                  padding: '16px',
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                {children}
              </div>
            </div>
          </div>

          {/* アクション（オプション） */}
          {showActions && actionContent && (
            <div className="standard-layout-actions">{actionContent}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default StandardLayout
