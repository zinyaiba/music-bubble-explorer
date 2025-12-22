import React, { useEffect, useCallback } from 'react'
import './UnifiedDialogLayout.css'
import { useAnimationControl } from '../hooks/useAnimationControl'
// import { useGlassmorphismTheme } from './GlassmorphismThemeProvider' // TODO: Use for dynamic theming

interface UnifiedDialogLayoutProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: 'compact' | 'standard' | 'large'
  mobileOptimized?: boolean
  showFooter?: boolean
  footerContent?: React.ReactNode
  integratedHeader?: boolean // ヘッダーをボディ内に統合するかどうか
}

/**
 * 統一ダイアログレイアウトコンポーネント
 * モバイルファーストでコンパクト表示に最適化
 * 縦スクロールを最小化し、統一されたヘッダー・フッタースタイルを提供
 */
export const UnifiedDialogLayout: React.FC<UnifiedDialogLayoutProps> = ({
  isVisible,
  onClose,
  title,
  children,
  className = '',
  size = 'standard',
  mobileOptimized = true,
  showFooter = false,
  footerContent,
  integratedHeader = true, // デフォルトで統合ヘッダーを使用
}) => {
  // const theme = useGlassmorphismTheme() // TODO: Use theme for dynamic styling
  const { setDialogOpen } = useAnimationControl()

  /**
   * ダイアログの表示状態をアニメーション制御に通知
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
   * バックドロップクリックハンドラー
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  /**
   * 閉じるボタンのクリックハンドラー（即座に反応）
   */
  const handleCloseClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('🔙 Close button clicked (UnifiedDialog)')
      onClose()
    },
    [onClose]
  )

  /**
   * ESCキーでダイアログを閉じる
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  /**
   * ダイアログ表示時に背景のスクロールを抑止
   */
  useEffect(() => {
    if (isVisible) {
      // .App要素にdialog-openクラスを追加してスクロールを抑止
      const appElement = document.querySelector('.App')
      if (appElement) {
        appElement.classList.add('dialog-open')
      }

      return () => {
        // dialog-openクラスを削除してスクロールを復元
        const appElement = document.querySelector('.App')
        if (appElement) {
          appElement.classList.remove('dialog-open')
        }
      }
    }
  }, [isVisible])

  /**
   * キーボードイベントリスナーの設定とモバイル位置調整
   */
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)

      // スマホ実機のヘッダー固定対応
      const updatePadding = () => {
        const header = document.querySelector(
          '.unified-dialog-integrated-header'
        ) as HTMLElement
        const contentWrapper = document.querySelector(
          '.unified-dialog-content-wrapper'
        ) as HTMLElement

        if (header && contentWrapper && window.innerWidth <= 768) {
          // ヘッダーの高さを取得してコンテンツにpadding-topを追加
          const headerHeight = header.offsetHeight
          contentWrapper.style.paddingTop = `${headerHeight}px`
          contentWrapper.style.setProperty(
            'padding-top',
            `${headerHeight}px`,
            'important'
          )
        }
      }

      // モバイルでの強制位置調整
      const isMobile = window.innerWidth <= 768
      if (isMobile) {
        const overlay = document.querySelector(
          '.unified-dialog-overlay'
        ) as HTMLElement
        const dialog = document.querySelector('.unified-dialog') as HTMLElement

        if (overlay) {
          overlay.style.paddingBottom = '120px'
          overlay.style.alignItems = 'flex-start'
          overlay.style.paddingTop = '20px'
          overlay.style.boxSizing = 'border-box'
        }

        if (dialog) {
          const maxHeight = `${window.innerHeight - 140}px`
          dialog.style.maxHeight = maxHeight
          dialog.style.margin = '0 auto'
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

  const dialogClasses = [
    'unified-dialog',
    `unified-dialog--${size}`,
    mobileOptimized ? 'unified-dialog--mobile-optimized' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <div
        className="unified-dialog-overlay"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unified-dialog-title"
      >
        <div className={dialogClasses}>
          {/* 従来のヘッダー（統合ヘッダーが無効の場合のみ表示） */}
          {!integratedHeader && (
            <div className="unified-dialog-header">
              <h2 id="unified-dialog-title" className="unified-dialog-title">
                {title}
              </h2>
              <button
                className="unified-dialog-close"
                onClick={handleCloseClick}
                aria-label="ダイアログを閉じる"
                type="button"
              >
                ×
              </button>
            </div>
          )}

          {/* コンテンツエリア */}
          <div className="unified-dialog-content">
            {/* 統合ヘッダー（統合ヘッダーが有効の場合のみ表示） */}
            {integratedHeader && (
              <div
                className="unified-dialog-integrated-header"
                style={{
                  display: 'block',
                  background: '#fef7f7',
                  borderBottom: '1px solid rgba(224, 102, 102, 0.2)',
                  padding: '0',
                  position: 'relative',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    width: '100%',
                    boxSizing: 'border-box',
                    minHeight: '48px',
                  }}
                >
                  <h2
                    id="unified-dialog-title"
                    className="unified-dialog-integrated-title"
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
                  <button
                    className="unified-dialog-integrated-close"
                    onClick={handleCloseClick}
                    aria-label="ダイアログを閉じる"
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
            )}

            {/* メインコンテンツ */}
            <div
              className="unified-dialog-main-content"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'auto',
                padding: 0,
              }}
            >
              <div
                className="unified-dialog-content-wrapper"
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

          {/* フッター（オプション） */}
          {showFooter && footerContent && (
            <div className="unified-dialog-footer">{footerContent}</div>
          )}
        </div>
      </div>
    </>
  )
}

export default UnifiedDialogLayout
