import React, { useState, useCallback, useEffect } from 'react'
import { Song } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'
import { DataManager } from '@/services/dataManager'
import { TagRegistrationService } from '@/services/tagRegistrationService'

import TagSelectionView from './TagSelectionView'
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
      const loadData = async () => {
        const musicService = MusicDataService.getInstance()

        // Firebaseからデータを読み込み
        await musicService.loadFromFirebase()

        const allSongs = musicService.getAllSongs()

        // 複数のソースからデータを取得
        const loadedSongs = DataManager.loadSongs()
        const musicDatabase = DataManager.loadMusicDatabase()
        const serviceTags = musicService.getAllTags()

        console.log('🎵 Loading song data from multiple sources:', {
          musicServiceSongs: allSongs.length,
          dataManagerSongs: loadedSongs.length,
          musicServiceTags: serviceTags.length,
          dataManagerTags: musicDatabase.tags.length,
        })

        // より多くのデータがある方を使用
        const finalSongs =
          allSongs.length > loadedSongs.length ? allSongs : loadedSongs
        const finalTags =
          serviceTags.length > musicDatabase.tags.length
            ? serviceTags
            : musicDatabase.tags

        console.log('🎵 Selected data source:', {
          finalSongs: finalSongs.length,
          sampleSongs: finalSongs
            .slice(0, 3)
            .map(s => ({ id: s.id, title: s.title })),
        })

        // タグデータを抽出
        let availableTags: string[] = []

        if (finalTags.length > 0) {
          // Tag配列からタグ名を抽出
          availableTags = finalTags.map(tag => tag.name)
        } else {
          // 手動でタグを抽出
          const manualTags = new Set<string>()
          finalSongs.forEach(song => {
            if (song.tags && song.tags.length > 0) {
              song.tags.forEach(tag => manualTags.add(tag))
            }
          })
          availableTags = Array.from(manualTags)
        }

        setSongs(finalSongs)
        setFilteredSongs(finalSongs)
        setState(prev => ({
          ...prev,
          availableTags: availableTags,
          step: 'song-selection',
          selectedSong: null,
          selectedTags: [],
          newTags: [],
          searchTerm: '',
        }))
      }

      loadData()
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
    console.log('🎵 Selected song:', {
      id: song.id,
      title: song.title,
      hasId: !!song.id,
      idType: typeof song.id,
    })
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

    console.log('🏷️ Registering tags for song:', {
      songId: state.selectedSong.id,
      songTitle: state.selectedSong.title,
      selectedTags: state.selectedTags,
      hasId: !!state.selectedSong.id,
      idType: typeof state.selectedSong.id,
    })

    setIsLoading(true)
    setError(null)

    try {
      const tagService = TagRegistrationService.getInstance()
      const result = await tagService.replaceTagsForSong(
        state.selectedSong.id,
        state.selectedTags
      )

      if (result.success && result.updatedSong) {
        onTagsRegistered(state.selectedSong.id, state.selectedTags)
        onClose()
      } else {
        const errorMessage =
          result.errorMessages?.join(', ') || 'タグの登録に失敗しました'
        throw new Error(errorMessage)
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
        <TagSelectionView
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

export default TagRegistrationDialog
