import React, { useEffect, useCallback } from 'react'
import './SimpleDialog.css'

interface SimpleDialogProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

/**
 * シンプルなダイアログコンポーネント
 * PCとモバイルで統一されたレイアウト
 * 安定した表示を保証
 */
export const SimpleDialog: React.FC<SimpleDialogProps> = ({
  isVisible,
  onClose,
  title,
  children,
  className = ''
}) => {
  /**
   * バックドロップクリックハンドラー
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  /**
   * ESCキーでダイアログを閉じる
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  /**
   * キーボードイベントリスナーの設定
   */
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
      // モバイルでのスクロール問題を防ぐため、bodyのスクロールは制御しない
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isVisible, handleKeyDown])

  // 表示状態でない場合は何も表示しない
  if (!isVisible) {
    return null
  }

  return (
    <div 
      className="simple-dialog-overlay" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className={`simple-dialog ${className}`}>
        <div className="simple-dialog-header">
          <h2 id="dialog-title" className="simple-dialog-title">{title}</h2>
          <button 
            className="simple-dialog-close"
            onClick={onClose}
            aria-label="ダイアログを閉じる"
            type="button"
          >
            ×
          </button>
        </div>
        <div className="simple-dialog-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SimpleDialog