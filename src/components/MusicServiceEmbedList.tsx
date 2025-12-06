import React, { useState } from 'react'
import './MusicServiceEmbedList.css'

interface MusicServiceEmbedListProps {
  embeds: string[]
  onChange: (embeds: string[]) => void
  maxEmbeds?: number
  disabled?: boolean
}

/**
 * 音楽サービス埋め込みコードのリスト管理コンポーネント
 * 複数の埋め込みコード（Spotify、Apple Music、YouTube等）を管理
 */
export const MusicServiceEmbedList: React.FC<MusicServiceEmbedListProps> = ({
  embeds,
  onChange,
  maxEmbeds = 5,
  disabled = false,
}) => {
  const [currentEmbed, setCurrentEmbed] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validateEmbed = (embedCode: string): string | null => {
    if (!embedCode.trim()) {
      return '埋め込みコードを入力してください'
    }

    const hasIframe = embedCode.includes('<iframe')
    const hasValidService =
      embedCode.includes('open.spotify.com/embed') ||
      embedCode.includes('embed.music.apple.com') ||
      embedCode.includes('youtube.com/embed')

    if (!hasIframe) {
      return 'iframe形式の埋め込みコードを入力してください'
    }

    if (!hasValidService) {
      return 'サブスクサービスの埋め込みコードを入力してください'
    }

    if (embedCode.length > 2000) {
      return '埋め込みコードが長すぎます（2000文字以内）'
    }

    return null
  }

  const detectService = (embedCode: string): string => {
    if (embedCode.includes('open.spotify.com/embed')) return 'Spotify'
    if (embedCode.includes('embed.music.apple.com')) return 'Apple Music'
    if (embedCode.includes('youtube.com/embed')) return 'YouTube'
    return '不明'
  }

  const handleAdd = () => {
    const validationError = validateEmbed(currentEmbed)
    if (validationError) {
      setError(validationError)
      return
    }

    if (embeds.length >= maxEmbeds) {
      setError(`埋め込みコードは最大${maxEmbeds}個まで登録できます`)
      return
    }

    onChange([...embeds, currentEmbed.trim()])
    setCurrentEmbed('')
    setError(null)
  }

  const handleRemove = (index: number) => {
    const newEmbeds = embeds.filter((_, i) => i !== index)
    onChange(newEmbeds)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="music-service-embed-list">
      {/* 登録済み埋め込みコードリスト */}
      {embeds.length > 0 && (
        <div className="embed-list">
          {embeds.map((embed, index) => (
            <div key={index} className="embed-item">
              <div className="embed-preview">
                <div className="embed-service-label">
                  {detectService(embed)}
                </div>
                <div
                  className="embed-iframe-container"
                  dangerouslySetInnerHTML={{ __html: embed }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="remove-button"
                aria-label={`埋め込みコード ${index + 1} を削除`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 新規追加フォーム */}
      {embeds.length < maxEmbeds && (
        <div className="embed-add-form">
          <label htmlFor="new-embed">
            音楽サービス埋め込みコードを追加
            {embeds.length > 0 && ` (${embeds.length}/${maxEmbeds})`}
          </label>
          <textarea
            id="new-embed"
            value={currentEmbed}
            onChange={e => {
              setCurrentEmbed(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder='Spotify: <iframe src="https://open.spotify.com/embed/track/..." ...></iframe>&#10;Apple Music: <iframe src="https://embed.music.apple.com/..." ...></iframe>&#10;YouTube: <iframe src="https://www.youtube.com/embed/..." ...></iframe>'
            disabled={disabled}
            className={error ? 'error' : ''}
            maxLength={2000}
            rows={4}
            style={{ fontFamily: 'monospace', fontSize: '0.9em' }}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="help-text">
            サブスクサービスの埋め込みコードを入力してください
            <br />
            •「共有」→「埋め込みコード」※PC用サイトのみ
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !currentEmbed.trim()}
            className="add-button"
          >
            追加 (Ctrl+Enter)
          </button>

          {/* プレビュー */}
          {currentEmbed.trim() && !error && (
            <div className="embed-preview-new">
              <label>プレビュー</label>
              <div dangerouslySetInnerHTML={{ __html: currentEmbed }} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MusicServiceEmbedList
