import React, { useState, useEffect } from 'react'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { StandardLayout } from './StandardLayout'
import { JacketImage } from './JacketImage'
import './SongDetailView.css'

interface SongDetailViewProps {
  songId: string
  song?: Song // 楽曲データを直接受け取るオプション
  isVisible: boolean
  onClose: () => void
}

/**
 * SongDetailView コンポーネント
 *
 * 個別の楽曲の詳細情報を表示する全画面ビュー
 * Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.4, 4.1-4.3, 5.1-5.3, 6.1-6.2, 7.1-7.2, 8.1-8.4
 */
export const SongDetailView: React.FC<SongDetailViewProps> = ({
  songId,
  song: propSong,
  isVisible,
  onClose,
}) => {
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 楽曲データの取得
  useEffect(() => {
    if (!isVisible || !songId) {
      return
    }

    // 親コンポーネントから楽曲データが渡されている場合は即座に使用
    if (propSong && propSong.id === songId) {
      setSong(propSong)
      setIsLoading(false)
      setError(null)
      return
    }

    // それ以外の場合はDataManagerから取得
    setIsLoading(true)
    setError(null)

    try {
      const loadedSong = DataManager.getSong(songId)

      if (!loadedSong) {
        setError('楽曲が見つかりません')
        setSong(null)
      } else {
        setSong(loadedSong)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '楽曲データの読み込みに失敗しました'
      setError(errorMessage)
      setSong(null)
    } finally {
      setIsLoading(false)
    }
  }, [songId, propSong, isVisible])

  // クリエイター情報の表示用ヘルパー関数
  // Requirement 3.1, 3.2, 3.3: 作詞者・作曲者・編曲者をカンマ区切りで表示
  const renderCreatorInfo = (label: string, creators: string[]) => {
    if (!creators || creators.length === 0) {
      return null
    }

    return (
      <div className="detail-row">
        <span className="detail-label">{label}:</span>
        <span className="detail-value">{creators.join(', ')}</span>
      </div>
    )
  }

  // アーティスト情報の表示
  // Requirement 4.1, 4.3: アーティスト名をカンマ区切りで表示
  const renderArtistInfo = () => {
    if (!song?.artists || song.artists.length === 0) {
      return null
    }

    return (
      <div className="detail-row">
        <span className="detail-label">アーティスト:</span>
        <span className="detail-value">{song.artists.join(', ')}</span>
      </div>
    )
  }

  // 発売年の表示
  // Requirement 5.1: 発売年を4桁の数値形式で表示
  const renderReleaseYear = () => {
    if (!song?.releaseYear) {
      return null
    }

    return (
      <div className="detail-row">
        <span className="detail-label">発売年:</span>
        <span className="detail-value">{song.releaseYear}年</span>
      </div>
    )
  }

  // 収録作品情報の表示
  // Requirement 6.1, 7.1: 収録シングル名・収録アルバム名を表示
  const renderAlbumInfo = () => {
    const hasSingle = song?.singleName
    const hasAlbum = song?.albumName

    if (!hasSingle && !hasAlbum) {
      return null
    }

    return (
      <div className="album-info-section">
        {hasSingle && (
          <div className="detail-row">
            <span className="detail-label">収録シングル:</span>
            <span className="detail-value">{song.singleName}</span>
          </div>
        )}
        {hasAlbum && (
          <div className="detail-row">
            <span className="detail-label">収録アルバム:</span>
            <span className="detail-value">{song.albumName}</span>
          </div>
        )}
      </div>
    )
  }

  // 関連外部サイトURLリストの表示
  // Requirement 8.1, 8.4: 全ての登録されたURLをリスト形式で登録順に表示
  const renderDetailUrls = () => {
    if (!song?.detailPageUrls || song.detailPageUrls.length === 0) {
      return null
    }

    return (
      <div className="detail-urls-section">
        <h3 className="section-title">外部サイトリンク</h3>
        <ul className="detail-urls-list">
          {song.detailPageUrls.map((urlObj, index) => {
            // 文字列の場合は後方互換性のため対応
            const url = typeof urlObj === 'string' ? urlObj : urlObj.url
            const label = typeof urlObj === 'string' ? undefined : urlObj.label
            const displayText = label || url

            return (
              <li key={index} className="detail-url-item">
                {/* Requirement 8.2: URLをタップして新しいタブで開く */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-url-link"
                  aria-label={label || `楽曲詳細ページ ${index + 1}`}
                  title={label ? url : undefined}
                >
                  <span className="url-icon">🔗</span>
                  <span className="url-text">{displayText}</span>
                  <span className="external-icon">↗</span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  // タグ情報の表示
  const renderTags = () => {
    if (!song?.tags || song.tags.length === 0) {
      return null
    }

    return (
      <div className="tags-section">
        <h3 className="section-title">タグ</h3>
        <div className="tags-list">
          {song.tags.map((tag, index) => (
            <span key={index} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // ノート情報の表示
  const renderNotes = () => {
    if (!song?.notes) {
      return null
    }

    return (
      <div className="notes-section">
        <h3 className="section-title">メモ</h3>
        <p className="notes-text">{song.notes}</p>
      </div>
    )
  }

  return (
    <StandardLayout
      isVisible={isVisible}
      onClose={onClose}
      title={song?.title || '楽曲詳細'}
      size="large"
      mobileOptimized={true}
    >
      <div className="song-detail-content">
        {isLoading && (
          <div className="song-detail-loading">
            <div className="loading-spinner"></div>
            <p>楽曲データを読み込んでいます...</p>
          </div>
        )}

        {error && (
          <div className="song-detail-error">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={onClose} className="back-button">
              楽曲管理画面に戻る
            </button>
          </div>
        )}

        {!isLoading && !error && song && (
          <>
            {/* ジャケット画像 */}
            {/* Requirement 2.1-2.5: ジャケット画像の表示 */}
            <div className="jacket-section">
              <JacketImage
                imageUrl={song.jacketImageUrl}
                alt={`${song.title}のジャケット画像`}
                size="large"
              />
            </div>

            {/* 基本情報 */}
            <div className="basic-info-section">
              <h2 className="song-title">{song.title}</h2>

              {renderArtistInfo()}
              {renderReleaseYear()}
            </div>

            {/* クリエイター情報 */}
            <div className="creator-info-section">
              <h3 className="section-title">クリエイター情報</h3>
              {renderCreatorInfo('作詞', song.lyricists)}
              {renderCreatorInfo('作曲', song.composers)}
              {renderCreatorInfo('編曲', song.arrangers)}
            </div>

            {/* 収録作品情報 */}
            {renderAlbumInfo()}

            {/* 関連外部サイトURL */}
            {renderDetailUrls()}

            {/* タグ */}
            {renderTags()}

            {/* メモ */}
            {renderNotes()}
          </>
        )}
      </div>
    </StandardLayout>
  )
}

export default SongDetailView
