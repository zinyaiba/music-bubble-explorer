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
   * キーボードイベントリスナーの設定
   */
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
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
              {/* デバッグ情報を画面に表示 */}
              <div
                style={{
                  background: '#ff00ff',
                  color: '#ffffff',
                  padding: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  border: '5px solid #000000',
                  zIndex: 99999,
                  position: 'relative',
                }}
              >
                DEBUG INFO:
                <br />
                integratedHeader: {String(integratedHeader)}
                <br />
                title: {title}
                <br />
                isVisible: {String(isVisible)}
                <br />
              </div>

              {/* 統合ヘッダー（統合ヘッダーが有効の場合のみ表示） - メインコンテンツ内に移動 */}
              {integratedHeader && (
                <div
                  className="standard-layout-integrated-header"
                  style={{
                    background: '#ffff00',
                    border: '5px solid #ff0000',
                    padding: '20px',
                    minHeight: '80px',
                  }}
                >
                  <h2
                    id="standard-layout-title"
                    className="standard-layout-integrated-title"
                    style={{
                      color: '#000000',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      background: '#00ff00',
                      padding: '10px',
                    }}
                  >
                    TEST HEADER: {title}
                  </h2>

                  {/* ヘッダーアクション */}
                  <div className="standard-layout-integrated-header-actions">
                    {showBackButton && onBack && (
                      <button
                        className="standard-layout-integrated-back-button"
                        onClick={onBack}
                        aria-label="前の画面に戻る"
                        type="button"
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
                        background: '#0000ff',
                        color: '#ffffff',
                        fontSize: '32px',
                        padding: '10px',
                        border: '3px solid #ffffff',
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* integratedHeaderがfalseの場合の表示 */}
              {!integratedHeader && (
                <div
                  style={{
                    background: '#ff0000',
                    color: '#ffffff',
                    padding: '20px',
                    fontSize: '20px',
                  }}
                >
                  integratedHeader is FALSE!
                </div>
              )}

              {children}
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
