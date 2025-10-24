import { useState, useEffect, useCallback, useMemo } from 'react'
import { Song } from '@/types/music'
import {
  SongSearchService,
  SearchFilters,
  SearchResult,
} from '@/services/songSearchService'

export interface UseSongSearchOptions {
  debounceDelay?: number
  initialFilters?: Partial<SearchFilters>
  autoSearch?: boolean
}

export interface UseSongSearchReturn {
  // 検索結果
  searchResult: SearchResult
  isSearching: boolean

  // フィルター状態
  filters: SearchFilters
  setSearchTerm: (term: string) => void
  setSelectedTags: (tags: string[]) => void
  setSortBy: (sortBy: 'title' | 'recent' | 'artist') => void
  setSortOrder: (order: 'asc' | 'desc') => void

  // 検索実行
  executeSearch: () => void
  clearSearch: () => void

  // タグ操作
  toggleTag: (tag: string) => void
  clearTags: () => void

  // 検索候補
  searchSuggestions: string[]

  // 統計情報
  searchStats: {
    totalSongs: number
    songsWithTags: number
    uniqueTags: number
    averageTagsPerSong: number
    mostCommonTags: Array<{ tag: string; count: number }>
  } | null
}

/**
 * 楽曲検索・フィルタリング用のReactフック
 * デバウンス処理、リアルタイム検索、タグフィルタリングを提供
 * Requirements: 1.1, 1.4
 */
export const useSongSearch = (
  songs: Song[],
  options: UseSongSearchOptions = {}
): UseSongSearchReturn => {
  const {
    debounceDelay = 300,
    initialFilters = {},
    autoSearch = true,
  } = options

  const searchService = useMemo(() => SongSearchService.getInstance(), [])

  // フィルター状態
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    selectedTags: [],
    sortBy: 'title',
    sortOrder: 'asc',
    ...initialFilters,
  })

  // 検索結果状態
  const [searchResult, setSearchResult] = useState<SearchResult>({
    songs: songs,
    totalCount: songs.length,
    filteredCount: songs.length,
    availableTags: [],
  })

  const [isSearching, setIsSearching] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])

  // 検索統計の計算
  const searchStats = useMemo(() => {
    if (songs.length === 0) return null
    return searchService.getSearchStats(songs)
  }, [songs, searchService])

  // 検索実行
  const executeSearch = useCallback(() => {
    if (songs.length === 0) {
      setSearchResult({
        songs: [],
        totalCount: 0,
        filteredCount: 0,
        availableTags: [],
      })
      return
    }

    setIsSearching(true)

    if (autoSearch) {
      // デバウンス付きで検索実行
      searchService.searchWithDebounce(
        songs,
        filters,
        result => {
          setSearchResult(result)
          setIsSearching(false)
        },
        debounceDelay,
        'song-search'
      )
    } else {
      // 即座に検索実行
      const result = searchService.search(songs, filters)
      setSearchResult(result)
      setIsSearching(false)
    }
  }, [songs, filters, searchService, autoSearch, debounceDelay])

  // 検索語句変更
  const setSearchTerm = useCallback(
    (term: string) => {
      setFilters(prev => ({ ...prev, searchTerm: term }))

      // 検索候補の生成
      if (term.trim()) {
        const suggestions = searchService.generateSearchSuggestions(
          songs,
          term,
          5
        )
        setSearchSuggestions(suggestions)
      } else {
        setSearchSuggestions([])
      }
    },
    [songs, searchService]
  )

  // 選択タグ変更
  const setSelectedTags = useCallback((tags: string[]) => {
    setFilters(prev => ({ ...prev, selectedTags: tags }))
  }, [])

  // ソート方法変更
  const setSortBy = useCallback((sortBy: 'title' | 'recent' | 'artist') => {
    setFilters(prev => ({ ...prev, sortBy }))
  }, [])

  // ソート順変更
  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortOrder: order }))
  }, [])

  // タグの切り替え
  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }))
  }, [])

  // タグクリア
  const clearTags = useCallback(() => {
    setFilters(prev => ({ ...prev, selectedTags: [] }))
  }, [])

  // 検索クリア
  const clearSearch = useCallback(() => {
    setFilters({
      searchTerm: '',
      selectedTags: [],
      sortBy: 'title',
      sortOrder: 'asc',
    })
    setSearchSuggestions([])
  }, [])

  // 楽曲データまたはフィルターが変更された時に検索実行
  useEffect(() => {
    executeSearch()
  }, [executeSearch])

  // 初期検索結果の設定
  useEffect(() => {
    if (
      songs.length > 0 &&
      searchResult.songs.length === 0 &&
      !filters.searchTerm &&
      filters.selectedTags.length === 0
    ) {
      const initialResult = searchService.search(songs, filters)
      setSearchResult(initialResult)
    }
  }, [songs, searchService, filters, searchResult.songs.length])

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      searchService.clearDebounceTimers()
    }
  }, [searchService])

  return {
    searchResult,
    isSearching,
    filters,
    setSearchTerm,
    setSelectedTags,
    setSortBy,
    setSortOrder,
    executeSearch,
    clearSearch,
    toggleTag,
    clearTags,
    searchSuggestions,
    searchStats,
  }
}
