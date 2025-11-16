import React, { useEffect, useCallback } from 'react'
import './StandardLayout.css'
import { useAnimationControl } from '../hooks/useAnimationControl'

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
  // アニメーション制御フックを使用
  const { setDialogOpen } = useAnimationControl()

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
   * アニメーション制御の統合
   * コンポーネントのマウント時にアニメーションを停止し、アンマウント時に再開
   */
  useEffect(() => {
    if (isVisible) {
      setDialogOpen(true)
    }
    return () => {
      setDialogOpen(false)
    }
  }, [isVisible, setDialogOpen])

  /**
   * キーボードイベントリスナーの設定とブラウザUIバー対応
   */
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)

      // スマホ実機のヘッダー固定対応
      const updatePadding = () => {
        const overlay = document.querySelector(
          '.standard-layout-overlay'
        ) as HTMLElement
        const header = document.querySelector(
          '.standard-layout-integrated-header'
        ) as HTMLElement
        const contentWrapper = document.querySelector(
          '.standard-layout-content-wrapper'
        ) as HTMLElement

        if (header && contentWrapper && window.innerWidth <= 768) {
          // 編集中ダイアログ（song-editing-mode）の場合は100px、それ以外はヘッダーの高さ
          const isEditingMode = overlay?.classList.contains('song-editing-mode')
          const paddingTop = isEditingMode
            ? '100px'
            : `${header.offsetHeight}px`

          contentWrapper.style.paddingTop = paddingTop
          contentWrapper.style.setProperty(
            'padding-top',
            paddingTop,
            'important'
          )
        }
      }

      // 初回実行（requestAnimationFrameで次のフレームで実行）
      const rafId = requestAnimationFrame(() => {
        updatePadding()
      })

      // リサイズ時にも更新
      window.addEventListener('resize', updatePadding)
      window.addEventListener('orientationchange', updatePadding)

      return () => {
        cancelAnimationFrame(rafId)
        document.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('resize', updatePadding)
        window.removeEventListener('orientationchange', updatePadding)
      }
    }
  }, [isVisible, handleKeyDown])

  // 表示状態でない場合は何も表示しない
  if (!isVisible) {
    return null
  }

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
              {/* 統合ヘッダー（統合ヘッダーが有効の場合のみ表示） - メインコンテンツ内に移動 */}
              {integratedHeader && (
                <div className="standard-layout-integrated-header">
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
                  paddingTop: '100px',
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
