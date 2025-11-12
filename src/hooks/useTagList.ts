import { useState, useEffect, useMemo, useCallback } from 'react'
import { Tag, Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'

/**
 * タグ一覧表示用のアイテム型
 */
export interface TagListItem {
  id: string
  name: string
  displayName: string // #付きの表示名
  songCount: number
  color: string
  lastUsed: Date
  popularity: number // 使用頻度スコア
}

/**
 * ソート方法の型定義
 */
export type TagSortBy = 'alphabetical' | 'frequency' | 'recent'

/**
 * タグ一覧管理のカスタムフック
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 */
export const useTagList = () => {
  // State management
  const [songs, setSongs] = useState<Song[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🏷️ Loading tag data...')

      // Firebase接続状態を確認
      const firebaseConnection = await DataManager.checkFirebaseConnection()
      // console.log('🔥 Firebase connection status:', firebaseConnection)

      // MusicDataServiceからもデータを取得してみる
      const musicService = MusicDataService.getInstance()

      // キャッシュをクリアして最新データを取得
      musicService.clearCache()

      // Firebaseから最新データを読み込み
      try {
        const firebaseLoaded = await musicService.loadFromFirebase()
        console.log('🔥 Firebase data reloaded:', firebaseLoaded)
      } catch (firebaseError) {
        console.warn('🔥 Firebase load failed:', firebaseError)
      }

      // データベースから楽曲とタグデータを取得
      const loadedSongs = DataManager.loadSongs()
      const musicDatabase = DataManager.loadMusicDatabase()

      // MusicDataServiceからも取得
      const serviceSongs = musicService.getAllSongs()
      const serviceTags = musicService.getAllTags()

      console.log('🏷️ Data comparison:', {
        dataManagerSongs: loadedSongs.length,
        dataManagerTags: musicDatabase.tags.length,
        serviceSongs: serviceSongs.length,
        serviceTags: serviceTags.length,
      })

      // console.log('🏷️ Loaded data:', {
      //   songsCount: loadedSongs.length,
      //   tagsCount: musicDatabase.tags.length,
      //   firebaseConnected: firebaseConnection.isConnected,
      //   songs: loadedSongs.slice(0, 3).map(s => ({ title: s.title, tags: s.tags })),
      //   tags: musicDatabase.tags.slice(0, 5).map(t => ({ name: t.name, songCount: t.songs.length }))
      // })

      // より多くのデータがある方を使用
      const finalSongs =
        serviceSongs.length > loadedSongs.length ? serviceSongs : loadedSongs
      const finalTags =
        serviceTags.length > musicDatabase.tags.length
          ? serviceTags
          : musicDatabase.tags

      setSongs(finalSongs)
      setTags(finalTags)

      // データが空の場合の詳細ログ
      if (finalTags.length === 0) {
        console.warn('🏷️ No tags found in database')
        if (finalSongs.length === 0) {
          if (!firebaseConnection.isConnected) {
            setError(
              'Firebaseに接続できません。ネットワーク接続を確認してください。'
            )
          } else {
            setError(
              '楽曲データが登録されていません。まず楽曲を登録してください。'
            )
          }
        } else {
          const songsWithTags = finalSongs.filter(
            song => song.tags && song.tags.length > 0
          )
          console.log('🏷️ Songs with tags:', {
            totalSongs: loadedSongs.length,
            songsWithTags: songsWithTags.length,
            songsWithTagsDetails: songsWithTags.map(s => ({
              title: s.title,
              tags: s.tags,
            })),
          })

          if (songsWithTags.length === 0) {
            setError(
              'タグが設定された楽曲がありません。楽曲にタグを追加してください。'
            )
          } else {
            // 手動でタグを抽出してみる
            const manualTags = new Set<string>()
            songsWithTags.forEach(song => {
              if (song.tags) {
                song.tags.forEach(tag => manualTags.add(tag))
              }
            })

            console.log('🏷️ Manual tag extraction:', {
              uniqueTags: Array.from(manualTags),
              tagCount: manualTags.size,
            })

            if (manualTags.size > 0) {
              // 手動で抽出したタグからTag配列を作成
              const manualTagArray = Array.from(manualTags).map(tagName => ({
                id: `tag-${tagName}`,
                name: tagName,
                songs: finalSongs
                  .filter(song => song.tags && song.tags.includes(tagName))
                  .map(song => song.id),
              }))

              console.log('🏷️ Using manually extracted tags:', manualTagArray)
              setTags(manualTagArray)
            } else {
              setError(
                'タグデータの処理中にエラーが発生しました。楽曲にタグは設定されていますが、タグ一覧の生成に失敗しました。'
              )
            }
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'タグデータの読み込みに失敗しました'
      setError(`タグ情報の取得に失敗しました: ${errorMessage}`)
      console.error('🏷️ Failed to load tag data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Convert tags to TagListItems with enhanced information (Requirements: 21.1, 21.2)
  const tagListItems = useMemo((): TagListItem[] => {
    if (!Array.isArray(songs) || !Array.isArray(tags)) {
      return []
    }

    return tags
      .map(tag => {
        const tagSongs = songs.filter(
          song => song.tags && song.tags.includes(tag.name)
        )

        // Calculate popularity based on song count and recency
        const totalSongs = songs.length
        const popularity = totalSongs > 0 ? tagSongs.length / totalSongs : 0

        // Find most recent usage
        const songDates = tagSongs
          .map(song => (song.createdAt ? new Date(song.createdAt) : new Date()))
          .sort((a, b) => b.getTime() - a.getTime())

        const lastUsed = songDates.length > 0 ? songDates[0] : new Date()

        return {
          id: tag.id,
          name: tag.name,
          displayName: `#${tag.name}`, // Requirements: 6.3 - ハッシュタグ表示
          songCount: tagSongs.length,
          color: '#98FB98', // Light green for tags
          lastUsed,
          popularity,
        }
      })
      .filter(item => item.songCount > 0) // Only show tags that have songs
  }, [tags, songs])

  // Get songs for a specific tag (Requirements: 21.4)
  const getSongsForTag = useCallback(
    (tagName: string): Song[] => {
      if (!Array.isArray(songs)) {
        return []
      }
      return songs.filter(song => song.tags && song.tags.includes(tagName))
    },
    [songs]
  )

  // Filter and sort tags (Requirements: 21.3)
  const filterAndSortTags = useCallback(
    (
      searchTerm: string = '',
      sortBy: TagSortBy = 'frequency'
    ): TagListItem[] => {
      let filtered = tagListItems

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(
          tag =>
            tag.name.toLowerCase().includes(searchLower) ||
            tag.displayName.toLowerCase().includes(searchLower)
        )
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            return a.name.localeCompare(b.name, 'ja')
          case 'frequency':
            return b.songCount - a.songCount
          case 'recent':
            return b.lastUsed.getTime() - a.lastUsed.getTime()
          default:
            return 0
        }
      })

      return filtered
    },
    [tagListItems]
  )

  // Get tag statistics
  const getTagStatistics = useCallback(() => {
    const totalTags = tagListItems.length
    const totalSongs = Array.isArray(songs) ? songs.length : 0
    const averageTagsPerSong =
      totalSongs > 0 && Array.isArray(songs)
        ? songs.reduce((sum, song) => sum + (song.tags?.length || 0), 0) /
          totalSongs
        : 0

    const mostPopularTag = tagListItems.reduce(
      (prev, current) => (prev.songCount > current.songCount ? prev : current),
      tagListItems[0]
    )

    return {
      totalTags,
      totalSongs,
      averageTagsPerSong: Math.round(averageTagsPerSong * 10) / 10,
      mostPopularTag: mostPopularTag || null,
    }
  }, [tagListItems, songs])

  // Refresh data
  const refreshData = useCallback(() => {
    loadData()
  }, [loadData])

  return {
    // Data
    tagListItems,
    songs,
    tags,

    // State
    isLoading,
    error,

    // Functions
    getSongsForTag,
    filterAndSortTags,
    getTagStatistics,
    refreshData,

    // Computed values
    hasData: tagListItems.length > 0,
    isEmpty: tagListItems.length === 0 && !isLoading,
  }
}

export default useTagList
