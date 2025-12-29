/**
 * タグ共有ボタンコンポーネント
 * X（旧Twitter）への共有テキストをクリップボードにコピーする
 *
 * Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.4, 6.2, 6.3
 */

import React, { useState, useCallback } from 'react'
import { TagShareDialog } from './TagShareDialog'
import './TagShareButton.css'

export interface TagShareButtonProps {
  tagName: string
  onShareSuccess?: () => void
  onShareError?: (error: string, shareText?: string) => void
  /** グローバル通知を使用する場合はtrue（親コンポーネントで通知を管理） */
  useGlobalNotification?: boolean
}

/**
 * タグ共有ボタンコンポーネント
 * Requirements: 1.1, 1.2, 1.3
 */
export const TagShareButton: React.FC<TagShareButtonProps> = ({
  tagName,
  onShareSuccess,
  onShareError,
  useGlobalNotification = false,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  /**
   * 通知を表示し、3秒後に自動非表示
   * Requirements: 3.2, 3.4
   */
  const showNotification = useCallback(
    (type: 'success' | 'error', message: string) => {
      setNotification({ type, message })

      // 3秒後に自動非表示 - Requirements: 3.4
      setTimeout(() => {
        setNotification(null)
      }, 3000)
    },
    []
  )

  /**
   * 共有ボタンクリックハンドラー - ダイアログを開く
   */
  const handleShareClick = useCallback((e: React.MouseEvent) => {
    // タグ詳細クリックイベントを防止 - Requirements: 1.3
    e.stopPropagation()
    setIsDialogOpen(true)
  }, [])

  /**
   * ダイアログを閉じる
   */
  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  /**
   * 共有成功時のハンドラー
   */
  const handleShareSuccess = useCallback(() => {
    if (!useGlobalNotification) {
      showNotification('success', 'コピーしました！Xに貼り付けてね')
    }
    onShareSuccess?.()
  }, [useGlobalNotification, showNotification, onShareSuccess])

  /**
   * 共有エラー時のハンドラー
   */
  const handleShareError = useCallback(
    (error: string) => {
      if (!useGlobalNotification) {
        showNotification('error', error)
      }
      onShareError?.(error)
    },
    [useGlobalNotification, showNotification, onShareError]
  )

  /**
   * キーボードアクセシビリティ
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleShareClick(e as unknown as React.MouseEvent)
      }
    },
    [handleShareClick]
  )

  return (
    <>
      {/* 共有ボタン - Requirements: 1.1, 1.2 */}
      <button
        className="tag-share-button"
        onClick={handleShareClick}
        onKeyDown={handleKeyDown}
        aria-label={`タグ「${tagName}」をXで共有`}
        title="Xで共有"
        type="button"
      >
        <span className="share-button-icon" aria-hidden="true">
          🔗
        </span>
      </button>

      {/* 共有ダイアログ */}
      <TagShareDialog
        isOpen={isDialogOpen}
        tagName={tagName}
        onClose={handleDialogClose}
        onShareSuccess={handleShareSuccess}
        onShareError={handleShareError}
      />

      {/* 通知表示（ローカル通知モードの場合のみ）- Requirements: 3.2, 3.4 */}
      {!useGlobalNotification && notification && (
        <div
          className={`tag-share-notification ${notification.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : '⚠️'}
          </span>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
    </>
  )
}

export default TagShareButton
