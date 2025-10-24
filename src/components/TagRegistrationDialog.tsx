import React, { useState, useCallback, useEffect } from 'react'
import { Song } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'
import { DataManager } from '@/services/dataManager'
import TagInput from './TagInput'
import './TagRegistrationDialog.css'

interface TagRegistrationDialogProps {
  isVisible: boolean
  onClose: () => void
  onTagsRegistered: (songId: string, tags: string[]) => void
}

interface TagRegistrationState {
  selectedSong: Song | null
  availableTags: string[]
  selectedTags: string[]
  newTags: string[]
  searchTerm: string
  step: 'song-selection' | 'tag-registration'
}

/**
 * タグ登録ダイアログコンポーネント
 * 楽曲選択とタグ登録の2段階フローを提供
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
export const TagRegistrationDialog: React.FC<TagRegistrationDialogProps> = ({
  isVisible,
  onClose,
  onTagsRegistered,
}) => {
  const [state, setState] = useState<TagRegistrationState>({
    selectedSong: null,
    availableTags: [],
    selectedTags: [],
    newTags: [],
    searchTerm: '',
    step: 'song-selection',
  })

  const [songs, setSongs] = useState<Song[]>([])
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 楽曲データとタグデータを読み込み
  useEffect(() => {
    if (isVisible) {
      const musicService = MusicDataService.getInstance()
      const allSongs = musicService.getAllSongs()
      const allTags = DataManager.getAllTags()

      setSongs(allSongs)
      setFilteredSongs(allSongs)
      setState(prev => ({
        ...prev,
        availableTags: allTags,
        step: 'song-selection',
        selectedSong: null,
        selectedTags: [],
        newTags: [],
        searchTerm: '',
      }))
    }
  }, [isVisible])

  // 楽曲検索フィルタリング
  useEffect(() => {
    if (!state.searchTerm.trim()) {
      setFilteredSongs(songs)
    } else {
      const filtered = songs.filter(
        song =>
          song.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          song.lyricists.some(lyricist =>
            lyricist.toLowerCase().includes(state.searchTerm.toLowerCase())
          ) ||
          song.composers.some(composer =>
            composer.toLowerCase().includes(state.searchTerm.toLowerCase())
          ) ||
          song.arrangers.some(arranger =>
            arranger.toLowerCase().includes(state.searchTerm.toLowerCase())
          ) ||
          (song.tags &&
            song.tags.some(tag =>
              tag.toLowerCase().includes(state.searchTerm.toLowerCase())
            ))
      )
      setFilteredSongs(filtered)
    }
  }, [state.searchTerm, songs])

  // 楽曲選択ハンドラー
  const handleSongSelect = useCallback((song: Song) => {
    setState(prev => ({
      ...prev,
      selectedSong: song,
      selectedTags: song.tags || [],
      step: 'tag-registration',
    }))
  }, [])

  // 検索語句変更ハンドラー
  const handleSearchChange = useCallback((searchTerm: string) => {
    setState(prev => ({
      ...prev,
      searchTerm,
    }))
  }, [])

  // タグ変更ハンドラー
  const handleTagsChange = useCallback((tags: string[]) => {
    setState(prev => ({
      ...prev,
      selectedTags: tags,
    }))
  }, [])

  // 戻るボタンハンドラー
  const handleBack = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'song-selection',
      selectedSong: null,
      selectedTags: [],
    }))
  }, [])

  // タグ登録ハンドラー
  const handleRegisterTags = useCallback(async () => {
    if (!state.selectedSong) return

    setIsLoading(true)
    setError(null)

    try {
      const updatedSong: Song = {
        ...state.selectedSong,
        tags: state.selectedTags,
      }

      const success = await DataManager.updateSong(updatedSong)

      if (success) {
        // MusicDataServiceのキャッシュをクリア
        const musicService = MusicDataService.getInstance()
        musicService.clearCache()

        onTagsRegistered(state.selectedSong.id, state.selectedTags)
        onClose()
      } else {
        throw new Error('タグの登録に失敗しました')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'タグの登録に失敗しました'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [state.selectedSong, state.selectedTags, onTagsRegistered, onClose])

  if (!isVisible) return null

  return (
    <div className="tag-registration-dialog">
      {state.step === 'song-selection' && (
        <SongSelectionView
          songs={filteredSongs}
          searchTerm={state.searchTerm}
          onSongSelect={handleSongSelect}
          onSearchChange={handleSearchChange}
        />
      )}

      {state.step === 'tag-registration' && state.selectedSong && (
        <TagRegistrationView
          song={state.selectedSong}
          selectedTags={state.selectedTags}
          availableTags={state.availableTags}
          onTagsChange={handleTagsChange}
          onBack={handleBack}
          onRegister={handleRegisterTags}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  )
}

/**
 * 楽曲選択ビューコンポーネント
 * Requirements: 1.1, 1.4
 */
interface SongSelectionViewProps {
  songs: Song[]
  searchTerm: string
  onSongSelect: (song: Song) => void
  onSearchChange: (term: string) => void
}

const SongSelectionView: React.FC<SongSelectionViewProps> = ({
  songs,
  searchTerm,
  onSongSelect,
  onSearchChange,
}) => {
  return (
    <div className="song-selection-view">
      <div className="search-section">
        <input
          type="text"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="楽曲名、アーティスト、タグで検索..."
          className="search-input"
        />
      </div>

      <div className="songs-list">
        {songs.length === 0 ? (
          <div className="no-songs">
            {searchTerm
              ? '検索条件に一致する楽曲が見つかりません'
              : '楽曲が登録されていません'}
          </div>
        ) : (
          songs.map(song => (
            <div
              key={song.id}
              className="song-item"
              onClick={() => onSongSelect(song)}
            >
              <div className="song-title">{song.title}</div>
              <div className="song-details">
                {song.lyricists.length > 0 && (
                  <span className="song-credit">
                    作詞: {song.lyricists.join(', ')}
                  </span>
                )}
                {song.composers.length > 0 && (
                  <span className="song-credit">
                    作曲: {song.composers.join(', ')}
                  </span>
                )}
                {song.arrangers.length > 0 && (
                  <span className="song-credit">
                    編曲: {song.arrangers.join(', ')}
                  </span>
                )}
              </div>
              {song.tags && song.tags.length > 0 && (
                <div className="song-tags">
                  {song.tags.map((tag, index) => (
                    <span key={index} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/**
 * タグ登録ビューコンポーネント
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
interface TagRegistrationViewProps {
  song: Song
  selectedTags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  onBack: () => void
  onRegister: () => void
  isLoading: boolean
  error: string | null
}

const TagRegistrationView: React.FC<TagRegistrationViewProps> = ({
  song,
  selectedTags,
  availableTags,
  onTagsChange,
  onBack,
  onRegister,
  isLoading,
  error,
}) => {
  return (
    <div className="tag-registration-view">
      <div className="selected-song-info">
        <h3 className="song-title">{song.title}</h3>
        <div className="song-credits">
          {song.lyricists.length > 0 && (
            <div>作詞: {song.lyricists.join(', ')}</div>
          )}
          {song.composers.length > 0 && (
            <div>作曲: {song.composers.join(', ')}</div>
          )}
          {song.arrangers.length > 0 && (
            <div>編曲: {song.arrangers.join(', ')}</div>
          )}
        </div>
      </div>

      <div className="tag-input-section">
        <label htmlFor="tag-input">タグ</label>
        <TagInput
          id="tag-input"
          tags={selectedTags}
          onTagsChange={onTagsChange}
          existingTags={availableTags}
          maxTags={10}
          placeholder="タグを入力してください（例: バラード, アニメ, 感動）"
          disabled={isLoading}
        />
        <div className="help-text">
          ジャンルやテーマを個別に入力してください。既存のタグは候補として表示されます。
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="button-group">
        <button
          type="button"
          onClick={onBack}
          className="secondary-button"
          disabled={isLoading}
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="primary-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              登録中...
            </>
          ) : (
            'タグを登録'
          )}
        </button>
      </div>
    </div>
  )
}

export default TagRegistrationDialog
