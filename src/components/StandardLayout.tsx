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
    // console.log('🖼️ StandardLayout: Not visible, returning null', { title })
    return null
  }

  // console.log('🖼️ StandardLayout: Rendering', { title, isVisible })

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
          {/* ヘッダー */}
          <div className="standard-layout-header">
            <div className="standard-layout-header-content">
              <h2 id="standard-layout-title" className="standard-layout-title">
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

          {/* コンテンツエリア */}
          <div className="standard-layout-content">{children}</div>

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
