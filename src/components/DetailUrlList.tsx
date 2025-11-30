import React, { useCallback } from 'react'
import { validateUrl, validateUrlLength } from '@/utils/songFormValidation'
import { DetailPageUrl } from '@/types/music'
import './DetailUrlList.css'

interface DetailUrlListProps {
  urls: DetailPageUrl[]
  onChange: (urls: DetailPageUrl[]) => void
  maxUrls?: number
  disabled?: boolean
}

interface UrlFieldError {
  index: number
  error: string
}

/**
 * DetailUrlList コンポーネント
 * 楽曲詳細ページURLの動的リストを管理
 *
 * 機能:
 * - URL入力フィールドの動的追加・削除
 * - URL形式のバリデーション
 * - 最大数の制限（デフォルト: 10）
 */
export const DetailUrlList: React.FC<DetailUrlListProps> = ({
  urls,
  onChange,
  maxUrls = 10,
  disabled = false,
}) => {
  const [fieldErrors, setFieldErrors] = React.useState<UrlFieldError[]>([])

  // URL変更ハンドラ
  const handleUrlChange = useCallback(
    (index: number, value: string) => {
      const newUrls = [...urls]
      newUrls[index] = { ...newUrls[index], url: value }
      onChange(newUrls)

      // バリデーション
      if (value.trim() !== '') {
        const urlValidation = validateUrl(value)
        const lengthValidation = validateUrlLength(value)

        const newErrors = fieldErrors.filter(e => e.index !== index)

        if (!urlValidation.isValid) {
          newErrors.push({ index, error: urlValidation.error! })
        } else if (!lengthValidation.isValid) {
          newErrors.push({ index, error: lengthValidation.error! })
        }

        setFieldErrors(newErrors)
      } else {
        // 空の場合はエラーをクリア
        setFieldErrors(fieldErrors.filter(e => e.index !== index))
      }
    },
    [urls, onChange, fieldErrors]
  )

  // ラベル変更ハンドラ
  const handleLabelChange = useCallback(
    (index: number, value: string) => {
      const newUrls = [...urls]
      newUrls[index] = { ...newUrls[index], label: value || undefined }
      onChange(newUrls)
    },
    [urls, onChange]
  )

  // URL追加ハンドラ
  const handleAddUrl = useCallback(() => {
    if (urls.length < maxUrls) {
      onChange([...urls, { url: '', label: undefined }])
    }
  }, [urls, onChange, maxUrls])

  // URL削除ハンドラ
  const handleRemoveUrl = useCallback(
    (index: number) => {
      const newUrls = urls.filter((_, i) => i !== index)
      onChange(newUrls)

      // エラーのインデックスを調整
      const newErrors = fieldErrors
        .filter(e => e.index !== index)
        .map(e => ({
          ...e,
          index: e.index > index ? e.index - 1 : e.index,
        }))
      setFieldErrors(newErrors)
    },
    [urls, onChange, fieldErrors]
  )

  // 特定のフィールドのエラーを取得
  const getFieldError = useCallback(
    (index: number): string | undefined => {
      const error = fieldErrors.find(e => e.index === index)
      return error?.error
    },
    [fieldErrors]
  )

  // 初期状態: URLが空の場合は1つのフィールドを表示
  const displayUrls = urls.length === 0 ? [{ url: '', label: undefined }] : urls

  return (
    <div className="detail-url-list">
      <div className="url-fields">
        {displayUrls.map((urlObj, index) => {
          const error = getFieldError(index)
          return (
            <div key={index} className="url-field-group">
              <div className="url-label-row">
                <input
                  type="text"
                  value={urlObj.label || ''}
                  onChange={e => handleLabelChange(index, e.target.value)}
                  placeholder="リンク名（オプション）"
                  className="label-input"
                  disabled={disabled}
                  maxLength={100}
                  aria-label={`リンク名 ${index + 1}`}
                />
              </div>
              <div className="url-field-row">
                <input
                  type="url"
                  value={urlObj.url}
                  onChange={e => handleUrlChange(index, e.target.value)}
                  placeholder="https://example.com/song-details"
                  className={`url-input ${error ? 'error' : ''}`}
                  disabled={disabled}
                  maxLength={500}
                  aria-label={`関連外部サイトURL ${index + 1}`}
                />
                {displayUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(index)}
                    className="remove-url-button"
                    disabled={disabled}
                    aria-label={`URL ${index + 1} を削除`}
                    title="削除"
                  >
                    ✕
                  </button>
                )}
              </div>
              {error && <div className="url-error-message">{error}</div>}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleAddUrl}
        className="add-url-button"
        disabled={disabled || urls.length >= maxUrls}
        aria-label="URLを追加"
      >
        + URLを追加
      </button>

      {urls.length >= maxUrls && (
        <div className="url-limit-message">
          最大{maxUrls}個までURLを登録できます
        </div>
      )}
    </div>
  )
}

export default DetailUrlList
