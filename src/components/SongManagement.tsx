import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { SongRegistrationForm } from './SongRegistrationForm'
import { SongDetailView } from './SongDetailView'
import { StandardLayout } from './StandardLayout'
import { UnifiedDialogLayout } from './UnifiedDialogLayout'
import { sortSongs, SongSortType } from '@/utils/songSorting'
import { useTapSequenceDetector } from '@/hooks/useTapSequenceDetector'
import { useChristmasTheme } from '@/contexts/ChristmasThemeContext'
import './SongManagement.css'

interface SongManagementProps {
  onClose: () => void
  isVisible: boolean
  onSongUpdated?: (song: Song) => void
  onSongDeleted?: (songId: string) => void
  onRequestReopen?: () => void // 再度開くリクエスト用
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
  onRequestReopen,
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
  const [searchTitleOnly, setSearchTitleOnly] = useState(false) // 楽曲名のみ検索オプション
  const [sortBy, setSortBy] = useState<SongSortType>('newest')
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmationState>({
      isOpen: false,
      song: null,
    })
  const [isDeleting, setIsDeleting] = useState(false)
  const [displayLimit, setDisplayLimit] = useState(50) // 初期表示数を50に制限
  const [isCompactView, setIsCompactView] = useState(false) // コンパクト表示モード

  // クリスマスモード切替時の視覚的フィードバック状態
  // Requirements: 1.2
  const [showChristmasFeedback, setShowChristmasFeedback] = useState(false)

  // クリスマステーマコンテキストからモード切替関数を取得
  // Requirements: 1.1, 1.4
  const { isChristmasMode, toggleChristmasMode } = useChristmasTheme()

  // タップシーケンス検出フック
  // Requirements: 1.1, 1.3, 1.4
  const { handleTap, tapCount } = useTapSequenceDetector({
    requiredTaps: 13,
    timeWindowMs: 3000,
    onSequenceComplete: () => {
      console.log('🎄 Christmas mode triggered!')
      // モード切替時の視覚的フィードバックを表示
      setShowChristmasFeedback(true)
      toggleChristmasMode()

      // フィードバックを一定時間後に非表示
      setTimeout(() => {
        setShowChristmasFeedback(false)
      }, 1500)
    },
  })

  // タップハンドラー（デバッグログ付き）
  const handleContentClick = useCallback(
    (e: React.MouseEvent) => {
      // ボタンや入力欄などのインタラクティブ要素のクリックは無視
      const target = e.target as HTMLElement
      const isInteractive =
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('a') ||
        target.closest('.song-item')

      if (!isInteractive) {
        console.log('🎅 Tap detected! Count:', tapCount + 1)
        handleTap()
      }
    },
    [handleTap, tapCount]
  )

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

      console.log('🎵 Loaded songs:', {
        count: loadedSongs.length,
        firstSong: loadedSongs[0],
        songsWithReleaseDate: loadedSongs.filter(s => s.releaseDate).length,
      })

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
    if (isVisible) {
      loadSongs()
    }
  }, [loadSongs, isVisible])

  const filteredAndSortedSongs = useMemo(() => {
    // フィルタリング
    let filtered = songs
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      if (searchTitleOnly) {
        // 楽曲名のみで検索
        filtered = songs.filter(song =>
          song.title.toLowerCase().includes(query)
        )
      } else {
        // 全フィールドで検索（従来の動作）
        filtered = songs.filter(
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
            (song.tags &&
              song.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }
    }

    // 共通の並び替え関数を使用
    return sortSongs(filtered, sortBy)
  }, [songs, searchQuery, searchTitleOnly, sortBy])

  // 表示用の制限されたリスト（パフォーマンス最適化）
  const displayedSongs = useMemo(() => {
    return filteredAndSortedSongs.slice(0, displayLimit)
  }, [filteredAndSortedSongs, displayLimit])

  // もっと読み込むハンドラ
  const handleLoadMore = useCallback(() => {
    setDisplayLimit(prev => prev + 50)
  }, [])

  // 検索クエリが変更されたら表示数をリセット
  useEffect(() => {
    setDisplayLimit(50)
  }, [searchQuery])

  const handleAddNewSong = useCallback(() => {
    console.log('➕➕➕ ADD NEW SONG BUTTON CLICKED ➕➕➕')
    console.log('Current state:', { showEditForm, editingSong })
    setEditingSong(null) // 新規登録の場合はnull
    setShowEditForm(true)
    console.log('After setState - showEditForm should be true')
  }, [showEditForm, editingSong])

  // Requirement 1.1: 楽曲アイテムをタップして楽曲詳細画面へ遷移
  const handleSongClick = useCallback((song: Song) => {
    console.log('🎵 Opening detail view for song:', {
      songId: song.id,
      songTitle: song.title,
    })
    // ローディング表示を即座に開始
    setIsLoadingDetail(true)
    setEditingSong(song) // 選択された楽曲を保存
    setSelectedSongId(song.id)

    // 次のフレームで詳細画面を表示（ローディングアニメーションが見えるように）
    requestAnimationFrame(() => {
      setShowDetailView(true)
      // 少し遅延してローディングを終了（アニメーションが見えるように）
      setTimeout(() => {
        setIsLoadingDetail(false)
      }, 100)
    })
  }, [])

  const handleEditSong = useCallback((song: Song) => {
    console.log('✏️ Opening edit form for song:', {
      songId: song.id,
      songTitle: song.title,
      releaseDate: song.releaseDate,
      releaseYear: song.releaseYear,
      fullSong: song,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    })
    setEditingSong(song)
    setShowEditForm(true)
  }, [])

  const handleCloseDetailView = useCallback(() => {
    // 詳細画面を閉じる
    setShowDetailView(false)
    setIsLoadingDetail(false)
    setSelectedSongId(null)
    setEditingSong(null)

    // 楽曲管理画面を一度閉じてから再度開く
    onClose()

    // 次のフレームで再度開くリクエストを送る
    requestAnimationFrame(() => {
      onRequestReopen?.()
    })
  }, [onClose, onRequestReopen])

  const handleCloseEditForm = useCallback(() => {
    console.log('🔙 Closing edit form and parent song management')
    // シンプルに2つのダイアログを閉じる
    setEditingSong(null)
    setShowEditForm(false)
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
      title="🎵 楽曲一覧"
      description="曲をタップすると詳細情報も見れるよ"
      size="large"
      mobileOptimized={true}
      className={showEditForm || showDetailView ? 'hide-header-on-mobile' : ''}
    >
      <div
        className="song-management-content"
        onClick={handleContentClick}
        role="region"
        aria-label="楽曲管理コンテンツエリア"
      >
        {/* クリスマスモード切替時の視覚的フィードバック */}
        {/* Requirements: 1.2 */}
        {showChristmasFeedback && (
          <div className="christmas-feedback-overlay" aria-live="polite">
            <div className="christmas-feedback-content">
              {isChristmasMode
                ? '🎄 クリスマスモード ON! 🎄'
                : '✨ 通常モードに戻りました ✨'}
            </div>
          </div>
        )}
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

            <div className="compact-controls">
              {/* 1行目: 検索欄と登録ボタン */}
              <div className="search-add-row">
                <form
                  className="search-container"
                  onSubmit={e => {
                    e.preventDefault()
                    // Enterキーでの送信を防止（Android対応）
                  }}
                >
                  <input
                    type="text"
                    placeholder={
                      searchTitleOnly
                        ? '楽曲名で検索'
                        : '検索はこちら（例：サブスク）'
                    }
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      // Android対応: キーボード表示時にbodyのfixed解除
                      if (window.innerWidth <= 768) {
                        document.body.style.position = ''
                      }
                    }}
                    onBlur={() => {
                      // Android対応: キーボード非表示時にbodyのfixed復元
                      if (window.innerWidth <= 768) {
                        document.body.style.position = 'fixed'
                      }
                    }}
                    className="search-input"
                    aria-label="楽曲検索"
                    autoComplete="off"
                    inputMode="text"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="search-clear-button"
                      onClick={() => setSearchQuery('')}
                      aria-label="検索をクリア"
                      title="検索をクリア"
                    >
                      ✕
                    </button>
                  )}
                  <span className="search-icon">🔍</span>
                </form>

                <button
                  type="button"
                  onClick={handleAddNewSong}
                  className="add-song-button-icon"
                  aria-label="新しい楽曲を登録"
                  title="新しい楽曲を登録"
                >
                  ➕
                </button>
              </div>

              {/* 2行目: 統計情報と検索オプション */}
              <div className="stats-row">
                <span className="stat-compact">
                  全{songs.length}曲 / 表示{filteredAndSortedSongs.length}曲
                </span>
                <label className="search-option-toggle-inline">
                  <input
                    type="checkbox"
                    checked={searchTitleOnly}
                    onChange={e => setSearchTitleOnly(e.target.checked)}
                  />
                  <span className="toggle-slider-small"></span>
                  <span className="toggle-label-small">曲名のみ</span>
                </label>
              </div>

              {/* 3行目: 並び替えと表示切替 */}
              <div className="sort-row">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as SongSortType)}
                  className="sort-select-full"
                  aria-label="楽曲の並び順を選択"
                >
                  <option value="newest">新曲順</option>
                  <option value="oldest">古い曲順</option>
                  <option value="updated">更新順</option>
                  <option value="alphabetical">五十音順</option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsCompactView(!isCompactView)}
                  className={`view-toggle-button ${isCompactView ? 'active' : ''}`}
                  aria-label={
                    isCompactView
                      ? '詳細表示に切り替え'
                      : 'コンパクト表示に切り替え'
                  }
                  title={isCompactView ? '詳細表示' : 'コンパクト表示'}
                >
                  {isCompactView ? '☰' : '▤'}
                </button>
              </div>
            </div>

            <div className={`song-list ${isCompactView ? 'compact-view' : ''}`}>
              {filteredAndSortedSongs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎵</div>
                  <div className="empty-text">
                    {searchQuery
                      ? '検索条件に一致する楽曲が見つかりません'
                      : '登録された楽曲がありません'}
                  </div>
                </div>
              ) : (
                <>
                  {displayedSongs.map(song => (
                    <div
                      key={song.id}
                      className={`song-item ${isCompactView ? 'compact' : ''}`}
                    >
                      <div
                        className="song-info clickable"
                        onClick={() => handleSongClick(song)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSongClick(song)
                          }
                        }}
                        aria-label={`${song.title}の詳細を表示`}
                      >
                        <h3 className="song-title">{song.title}</h3>
                        {!isCompactView && (
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
                        )}
                      </div>
                      <div className="song-actions">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleEditSong(song)
                          }}
                          className="edit-button"
                          aria-label={`${song.title}を編集`}
                          title="楽曲を編集"
                        >
                          ✏️
                        </button>
                        {!isCompactView && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handleDeleteSong(song)
                            }}
                            className="delete-button"
                            aria-label={`${song.title}を削除`}
                            title="楽曲を削除"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {displayedSongs.length < filteredAndSortedSongs.length && (
                    <div className="load-more-container">
                      <button
                        onClick={handleLoadMore}
                        className="load-more-button"
                        aria-label="さらに楽曲を読み込む"
                      >
                        <span className="load-more-icon">⬇️</span>
                        <span className="load-more-text">
                          さらに表示 ({displayedSongs.length} /{' '}
                          {filteredAndSortedSongs.length})
                        </span>
                      </button>
                    </div>
                  )}
                </>
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

            {isLoadingDetail && (
              <div className="detail-loading-overlay">
                <div className="detail-loading-spinner"></div>
                <p className="detail-loading-text">読み込み中...</p>
              </div>
            )}

            {showDetailView && selectedSongId && editingSong && (
              <SongDetailView
                songId={selectedSongId}
                song={editingSong}
                isVisible={showDetailView}
                onClose={handleCloseDetailView}
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
