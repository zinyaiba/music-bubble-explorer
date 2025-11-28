import React, { useState, useCallback } from 'react'
import './JacketImage.css'

export interface JacketImageProps {
  imageUrl?: string
  alt: string
  size?: 'small' | 'medium' | 'large'
  onImageClick?: () => void
  fallbackIcon?: string
}

/**
 * JacketImage コンポーネント
 *
 * 外部URLからジャケット画像を読み込んで表示するコンポーネント
 * Requirements: 2.1-2.5
 *
 * @param imageUrl - ジャケット画像のURL
 * @param alt - 画像の代替テキスト
 * @param size - 画像サイズ ('small' | 'medium' | 'large')
 * @param onImageClick - 画像クリック時のコールバック
 * @param fallbackIcon - フォールバック時に表示するアイコン（デフォルト: 🎵）
 */
export const JacketImage: React.FC<JacketImageProps> = ({
  imageUrl,
  alt,
  size = 'medium',
  onImageClick,
  fallbackIcon = '🎵',
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 画像読み込みエラーハンドラ
  // Requirement 2.2: 読み込みエラー時のフォールバック処理
  const handleImageError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
    console.warn('Failed to load jacket image:', imageUrl)
  }, [imageUrl])

  // 画像読み込み成功ハンドラ
  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
    setImageError(false)
  }, [])

  // 画像クリックハンドラ
  // Requirement 2.5: 画像クリック時の拡大表示機能
  const handleClick = useCallback(() => {
    if (onImageClick) {
      onImageClick()
    } else if (imageUrl && !imageError) {
      // デフォルト動作: 新しいタブで画像を開く
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
    }
  }, [onImageClick, imageUrl, imageError])

  // 画像URLが無効または未定義の場合はフォールバック表示
  // Requirement 2.3: ジャケット画像URLが登録されていない場合の処理
  const shouldShowFallback = !imageUrl || imageError

  return (
    <div
      className={`jacket-image-container jacket-image-${size} ${shouldShowFallback ? 'fallback' : ''} ${onImageClick || imageUrl ? 'clickable' : ''}`}
      onClick={handleClick}
      role={onImageClick || imageUrl ? 'button' : 'img'}
      tabIndex={onImageClick || imageUrl ? 0 : undefined}
      onKeyDown={
        onImageClick || imageUrl
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick()
              }
            }
          : undefined
      }
      aria-label={
        shouldShowFallback
          ? `${alt} (画像なし)`
          : onImageClick || imageUrl
            ? `${alt} (クリックして拡大)`
            : alt
      }
    >
      {shouldShowFallback ? (
        // Requirement 2.2, 2.3: フォールバック表示
        <div className="jacket-image-fallback">
          <span className="fallback-icon" aria-hidden="true">
            {fallbackIcon}
          </span>
          <span className="fallback-text">No Image</span>
        </div>
      ) : (
        <>
          {/* Requirement 2.1: 画像URLからサムネイルを読み込んで表示 */}
          {/* Requirement 2.4: 適切なサイズでサムネイル表示 */}
          <img
            src={imageUrl}
            alt={alt}
            className={`jacket-image ${isLoading ? 'loading' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {isLoading && (
            <div className="jacket-image-loading">
              <span className="loading-spinner" aria-hidden="true">
                ⏳
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default JacketImage
