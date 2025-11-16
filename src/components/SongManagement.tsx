import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { SongRegistrationForm } from './SongRegistrationForm'
import { StandardLayout } from './StandardLayout'
import { UnifiedDialogLayout } from './UnifiedDialogLayout'
import './SongManagement.css'

interface SongManagementProps {
  onClose: () => void
  isVisible: boolean
  onSongUpdated?: (song: Song) => void
  onSongDeleted?: (songId: string) => void
}

interface DeleteConfirmationState {
  isOpen: boolean
  song: Song | null
}

/**
 * シンプルな楽曲管理コンポーネント
 * Updated to use StandardLayout template for full-screen consistency
 */
export const SongManagement: React.FC<SongManagementProps> = ({
  onClose,
  isVisible,
  onSongUpdated,
  onSongDeleted,
}) => {
  // デバッグログ追加
  // console.log('🎵 SongManagement rendered', {
  //     timestamp: new Date().toISOString(),
  //     viewport: {
  //         width: window.innerWidth,
  //         height: window.innerHeight
  //     }
  // })
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmationState>({
      isOpen: false,
      song: null,
    })
  const [isDeleting, setIsDeleting] = useState(false)

  const loadSongs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let loadedSongs: Song[] = []

      // Firebaseの読み込みを非同期で実行し、タイムアウトを設定
      const loadWithTimeout = async () => {
        const timeoutPromise = new Promise<Song[]>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000)
        })

        const loadPromise = (async () => {
          try {
            const { FirebaseService } = await import(
              '@/services/firebaseService'
            )
            const firebaseService = FirebaseService.getInstance()

            const isConnected = await firebaseService.checkConnection()
            if (isConnected) {
              return await firebaseService.getAllSongs()
            } else {
              return DataManager.loadSongs()
            }
          } catch (firebaseError) {
            return DataManager.loadSongs()
          }
        })()

        return Promise.race([loadPromise, timeoutPromise])
      }

      try {
        loadedSongs = await loadWithTimeout()
      } catch (timeoutError) {
        // タイムアウトした場合はローカルストレージから読み込み
        console.warn('Firebase load timeout, falling back to local storage')
        loadedSongs = DataManager.loadSongs()
      }

      setSongs(loadedSongs)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : '楽曲データの読み込みに失敗しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSongs()
  }, [loadSongs])

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) {
      return songs
    }

    const query = searchQuery.toLowerCase()
    return songs.filter(
      song =>
        song.title.toLowerCase().includes(query) ||
        song.lyricists.some(lyricist =>
          lyricist.toLowerCase().includes(query)
        ) ||
        song.composers.some(composer =>
          composer.toLowerCase().includes(query)
        ) ||
        song.arrangers.some(arranger =>
          arranger.toLowerCase().includes(query)
        ) ||
        (song.tags && song.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [songs, searchQuery])

  const handleAddNewSong = useCallback(() => {
    console.log('➕➕➕ ADD NEW SONG BUTTON CLICKED ➕➕➕')
    console.log('Current state:', { showEditForm, editingSong })
    setEditingSong(null) // 新規登録の場合はnull
    setShowEditForm(true)
    console.log('After setState - showEditForm should be true')
  }, [showEditForm, editingSong])

  const handleEditSong = useCallback((song: Song) => {
    console.log('✏️ Opening edit form for song:', {
      songId: song.id,
      songTitle: song.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    })
    setEditingSong(song)
    setShowEditForm(true)
  }, [])

  const handleCloseEditForm = useCallback(() => {
    console.log('🔙 Closing edit form and parent song management')
    setEditingSong(null)
    setShowEditForm(false)
    // 編集フォームを閉じる時に、楽曲編集画面も閉じてトップ画面に戻る
    onClose()
  }, [onClose])

  const handleSongUpdated = useCallback(
    async (updatedSong: Song) => {
      try {
        console.log('🔄 handleSongUpdated called:', {
          updatedSongId: updatedSong.id,
          updatedSongTitle: updatedSong.title,
        })

        // キャッシュをクリアして最新データを再読み込み
        const musicService = MusicDataService.getInstance()
        musicService.clearCache()

        // Firebaseから最新のデータを再読み込み
        await loadSongs()

        onSongUpdated?.(updatedSong)
        handleCloseEditForm()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '楽曲の更新に失敗しました'
        setError(errorMessage)
      }
    },
    [loadSongs, onSongUpdated, handleCloseEditForm]
  )

  const handleDeleteSong = useCallback((song: Song) => {
    setDeleteConfirmation({
      isOpen: true,
      song,
    })
  }, [])

  const handleCloseDeleteConfirmation = useCallback(() => {
    setDeleteConfirmation({
      isOpen: false,
      song: null,
    })
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmation.song) return

    setIsDeleting(true)
    const songToDelete = deleteConfirmation.song

    try {
      const localDeleteSuccess = await DataManager.deleteSong(songToDelete.id)

      if (!localDeleteSuccess) {
        // 具体的なエラーメッセージの実装（34.5対応）
        const detailedError = DataManager.getDetailedErrorMessage(
          new Error('Delete operation failed')
        )
        throw new Error(`楽曲の削除に失敗しました: ${detailedError}`)
      }

      setSongs(prevSongs =>
        prevSongs.filter(song => song.id !== songToDelete.id)
      )

      const musicService = MusicDataService.getInstance()
      musicService.clearCache()

      onSongDeleted?.(songToDelete.id)
      handleCloseDeleteConfirmation()
    } catch (err) {
      // 削除操作失敗時の適切なエラー表示（34.5対応）
      let errorMessage = '楽曲の削除に失敗しました'

      if (err instanceof Error) {
        const detailedError = DataManager.getDetailedErrorMessage(err)
        errorMessage = detailedError
      }

      // ネットワーク状態もチェック
      const networkStatus = DataManager.monitorNetworkStatus()
      if (!networkStatus.isOnline) {
        errorMessage += '\n\nインターネット接続を確認してください。'
      }

      setError(errorMessage)
      console.error('🗑️ Delete operation failed:', err, {
        songId: songToDelete.id,
        songTitle: songToDelete.title,
        networkStatus,
      })
    } finally {
      setIsDeleting(false)
    }
  }, [deleteConfirmation.song, onSongDeleted, handleCloseDeleteConfirmation])

  return (
    <StandardLayout
      isVisible={isVisible}
      onClose={onClose}
      title="📝 楽曲編集"
      size="large"
      mobileOptimized={true}
      className={showEditForm ? 'hide-header-on-mobile' : ''}
    >
      <div className="song-management-content">
        {isLoading && (
          <div className="song-management-loading">
            <div className="loading-spinner"></div>
            <p>楽曲データを読み込んでいます...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {error && (
              <div className="error-message enhanced-error">
                <div className="error-header">
                  <span className="error-icon">⚠️</span>
                  <span className="error-title">操作エラー</span>
                  <button
                    className="error-close"
                    onClick={() => setError(null)}
                    aria-label="エラーメッセージを閉じる"
                  >
                    ×
                  </button>
                </div>
                <div className="error-content">
                  <p className="error-text">{error}</p>
                  <div className="error-actions">
                    <button
                      onClick={() => setError(null)}
                      className="error-action-button"
                    >
                      了解
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="error-action-button secondary"
                    >
                      ページを再読み込み
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="search-container">
              <input
                type="text"
                placeholder="楽曲名、作詞家、作曲家、編曲家、タグで検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="楽曲検索"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="stats-container">
              <div className="stats">
                <span className="stat-item">
                  <span className="stat-label">総楽曲数:</span>
                  <span className="stat-value">{songs.length}曲</span>
                </span>
                <span className="stat-item">
                  <span className="stat-label">検索結果:</span>
                  <span className="stat-value">{filteredSongs.length}曲</span>
                </span>
              </div>
              <button
                onClick={handleAddNewSong}
                className="add-song-button"
                aria-label="新しい楽曲を登録"
                title="新しい楽曲を登録"
              >
                <span className="add-icon">➕</span>
                <span className="add-text">新規登録</span>
              </button>
            </div>

            <div className="song-list">
              {filteredSongs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎵</div>
                  <div className="empty-text">
                    {searchQuery
                      ? '検索条件に一致する楽曲が見つかりません'
                      : '登録された楽曲がありません'}
                  </div>
                </div>
              ) : (
                filteredSongs.map(song => (
                  <div key={song.id} className="song-item">
                    <div className="song-info">
                      <h3 className="song-title">{song.title}</h3>
                      <div className="song-details">
                        {song.lyricists.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">作詞:</span>
                            <span className="detail-value">
                              {song.lyricists.join(', ')}
                            </span>
                          </div>
                        )}
                        {song.composers.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">作曲:</span>
                            <span className="detail-value">
                              {song.composers.join(', ')}
                            </span>
                          </div>
                        )}
                        {song.arrangers.length > 0 && (
                          <div className="detail-item">
                            <span className="detail-label">編曲:</span>
                            <span className="detail-value">
                              {song.arrangers.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="song-actions">
                      <button
                        onClick={() => handleEditSong(song)}
                        className="edit-button"
                        aria-label={`${song.title}を編集`}
                        title="楽曲を編集"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSong(song)}
                        className="delete-button"
                        aria-label={`${song.title}を削除`}
                        title="楽曲を削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {showEditForm && (
              <SongRegistrationForm
                isVisible={showEditForm}
                onClose={handleCloseEditForm}
                onSongAdded={handleSongUpdated}
                editingSong={editingSong}
              />
            )}

            {deleteConfirmation.isOpen && deleteConfirmation.song && (
              <UnifiedDialogLayout
                isVisible={deleteConfirmation.isOpen}
                onClose={handleCloseDeleteConfirmation}
                title="🗑️ 楽曲の削除確認"
                size="compact"
                mobileOptimized={true}
              >
                <div className="delete-confirmation-content">
                  <p>以下の楽曲を削除してもよろしいですか？</p>
                  <div className="delete-song-info">
                    <div className="delete-song-title">
                      「{deleteConfirmation.song.title}」
                    </div>
                    <div className="delete-song-details">
                      この操作は取り消すことができません。
                    </div>
                  </div>
                  <div className="delete-confirmation-actions">
                    <button
                      onClick={handleCloseDeleteConfirmation}
                      disabled={isDeleting}
                      className="cancel-button"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="confirm-delete-button"
                    >
                      {isDeleting ? (
                        <>
                          <span className="loading-spinner"></span>
                          削除中...
                        </>
                      ) : (
                        '削除する'
                      )}
                    </button>
                  </div>
                </div>
              </UnifiedDialogLayout>
            )}
          </>
        )}
      </div>
    </StandardLayout>
  )
}

export default SongManagement
