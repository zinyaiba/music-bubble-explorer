import { Song } from '@/types/music'

export interface SearchFilters {
  searchTerm: string
  selectedTags: string[]
  sortBy: 'title' | 'recent' | 'artist'
  sortOrder: 'asc' | 'desc'
}

export interface SearchResult {
  songs: Song[]
  totalCount: number
  filteredCount: number
  availableTags: string[]
}

/**
 * 楽曲検索・フィルタリングサービス
 * リアルタイム検索、タグフィルタリング、デバウンス処理を提供
 * Requirements: 1.1, 1.4
 */
export class SongSearchService {
  private static instance: SongSearchService
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {}

  public static getInstance(): SongSearchService {
    if (!SongSearchService.instance) {
      SongSearchService.instance = new SongSearchService()
    }
    return SongSearchService.instance
  }

  /**
   * デバウンス処理付きの検索実行
   */
  public searchWithDebounce(
    songs: Song[],
    filters: SearchFilters,
    callback: (result: SearchResult) => void,
    delay: number = 300,
    key: string = 'default'
  ): void {
    // 既存のタイマーをクリア
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 新しいタイマーを設定
    const timer = setTimeout(() => {
      const result = this.search(songs, filters)
      callback(result)
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  /**
   * 即座に検索を実行
   */
  public search(songs: Song[], filters: SearchFilters): SearchResult {
    let filteredSongs = [...songs]
    const totalCount = songs.length

    // テキスト検索フィルタリング
    if (filters.searchTerm.trim()) {
      filteredSongs = this.filterBySearchTerm(filteredSongs, filters.searchTerm)
    }

    // タグフィルタリング
    if (filters.selectedTags.length > 0) {
      filteredSongs = this.filterByTags(filteredSongs, filters.selectedTags)
    }

    // ソート処理
    filteredSongs = this.sortSongs(
      filteredSongs,
      filters.sortBy,
      filters.sortOrder
    )

    // 利用可能なタグを抽出
    const availableTags = this.extractAvailableTags(filteredSongs)

    return {
      songs: filteredSongs,
      totalCount,
      filteredCount: filteredSongs.length,
      availableTags,
    }
  }

  /**
   * 検索語句による楽曲フィルタリング
   */
  private filterBySearchTerm(songs: Song[], searchTerm: string): Song[] {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm)

    if (!normalizedTerm) {
      return songs
    }

    return songs.filter(song => {
      // タイトル検索
      if (this.normalizeSearchTerm(song.title).includes(normalizedTerm)) {
        return true
      }

      // 作詞者検索
      if (
        song.lyricists.some(lyricist =>
          this.normalizeSearchTerm(lyricist).includes(normalizedTerm)
        )
      ) {
        return true
      }

      // 作曲者検索
      if (
        song.composers.some(composer =>
          this.normalizeSearchTerm(composer).includes(normalizedTerm)
        )
      ) {
        return true
      }

      // 編曲者検索
      if (
        song.arrangers.some(arranger =>
          this.normalizeSearchTerm(arranger).includes(normalizedTerm)
        )
      ) {
        return true
      }

      // タグ検索
      if (
        song.tags &&
        song.tags.some(tag =>
          this.normalizeSearchTerm(tag).includes(normalizedTerm)
        )
      ) {
        return true
      }

      // ノート検索
      if (
        song.notes &&
        this.normalizeSearchTerm(song.notes).includes(normalizedTerm)
      ) {
        return true
      }

      return false
    })
  }

  /**
   * タグによる楽曲フィルタリング
   */
  private filterByTags(songs: Song[], selectedTags: string[]): Song[] {
    return songs.filter(song => {
      if (!song.tags || song.tags.length === 0) {
        return false
      }

      // 選択されたタグがすべて含まれている楽曲のみを返す（AND条件）
      return selectedTags.every(selectedTag =>
        song.tags!.some(
          songTag =>
            this.normalizeSearchTerm(songTag) ===
            this.normalizeSearchTerm(selectedTag)
        )
      )
    })
  }

  /**
   * 楽曲のソート処理
   */
  private sortSongs(
    songs: Song[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): Song[] {
    const sorted = [...songs]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title, 'ja', {
            numeric: true,
            sensitivity: 'base',
          })
          break

        case 'recent': {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = dateB - dateA // 新しい順がデフォルト
          break
        }

        case 'artist': {
          const artistA = this.getPrimaryArtist(a)
          const artistB = this.getPrimaryArtist(b)
          comparison = artistA.localeCompare(artistB, 'ja', {
            numeric: true,
            sensitivity: 'base',
          })
          break
        }

        default:
          return 0
      }

      return sortOrder === 'desc' ? -comparison : comparison
    })

    return sorted
  }

  /**
   * 楽曲の主要アーティストを取得
   */
  private getPrimaryArtist(song: Song): string {
    if (song.lyricists.length > 0) {
      return song.lyricists[0]
    }
    if (song.composers.length > 0) {
      return song.composers[0]
    }
    if (song.arrangers.length > 0) {
      return song.arrangers[0]
    }
    return ''
  }

  /**
   * 検索語句の正規化
   */
  private normalizeSearchTerm(term: string): string {
    return (
      term
        .toLowerCase()
        .trim()
        // 全角・半角の統一
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, char => {
          return String.fromCharCode(char.charCodeAt(0) - 0xfee0)
        })
        // ひらがな・カタカナの統一（カタカナに統一）
        .replace(/[ぁ-ん]/g, char => {
          return String.fromCharCode(char.charCodeAt(0) + 0x60)
        })
    )
  }

  /**
   * 利用可能なタグを抽出
   */
  private extractAvailableTags(songs: Song[]): string[] {
    const tagSet = new Set<string>()

    songs.forEach(song => {
      song.tags?.forEach(tag => {
        tagSet.add(tag)
      })
    })

    return Array.from(tagSet).sort((a, b) =>
      a.localeCompare(b, 'ja', { numeric: true, sensitivity: 'base' })
    )
  }

  /**
   * 高度な検索（複数条件の組み合わせ）
   */
  public advancedSearch(
    songs: Song[],
    options: {
      title?: string
      artist?: string
      tags?: string[]
      hasNotes?: boolean
      createdAfter?: Date
      createdBefore?: Date
    }
  ): Song[] {
    return songs.filter(song => {
      // タイトル検索
      if (
        options.title &&
        !this.normalizeSearchTerm(song.title).includes(
          this.normalizeSearchTerm(options.title)
        )
      ) {
        return false
      }

      // アーティスト検索
      if (options.artist) {
        const normalizedArtist = this.normalizeSearchTerm(options.artist)
        const hasArtist = [
          ...song.lyricists,
          ...song.composers,
          ...song.arrangers,
        ].some(artist =>
          this.normalizeSearchTerm(artist).includes(normalizedArtist)
        )
        if (!hasArtist) {
          return false
        }
      }

      // タグ検索
      if (options.tags && options.tags.length > 0) {
        if (!song.tags || song.tags.length === 0) {
          return false
        }
        const hasAllTags = options.tags.every(tag =>
          song.tags!.some(
            songTag =>
              this.normalizeSearchTerm(songTag) ===
              this.normalizeSearchTerm(tag)
          )
        )
        if (!hasAllTags) {
          return false
        }
      }

      // ノートの有無
      if (options.hasNotes !== undefined) {
        const hasNotes = Boolean(song.notes && song.notes.trim())
        if (hasNotes !== options.hasNotes) {
          return false
        }
      }

      // 作成日時の範囲
      if (options.createdAfter || options.createdBefore) {
        if (!song.createdAt) {
          return false
        }
        const createdDate = new Date(song.createdAt)

        if (options.createdAfter && createdDate < options.createdAfter) {
          return false
        }

        if (options.createdBefore && createdDate > options.createdBefore) {
          return false
        }
      }

      return true
    })
  }

  /**
   * 検索候補の生成
   */
  public generateSearchSuggestions(
    songs: Song[],
    partialTerm: string,
    maxSuggestions: number = 10
  ): string[] {
    const normalizedTerm = this.normalizeSearchTerm(partialTerm)
    if (!normalizedTerm) {
      return []
    }

    const suggestions = new Set<string>()

    songs.forEach(song => {
      // タイトルから候補を生成
      if (this.normalizeSearchTerm(song.title).includes(normalizedTerm)) {
        suggestions.add(song.title)
      }

      // アーティストから候補を生成
      [...song.lyricists, ...song.composers, ...song.arrangers].forEach(
        artist => {
          if (this.normalizeSearchTerm(artist).includes(normalizedTerm)) {
            suggestions.add(artist)
          }
        }
      )

      // タグから候補を生成
      song.tags?.forEach(tag => {
        if (this.normalizeSearchTerm(tag).includes(normalizedTerm)) {
          suggestions.add(tag)
        }
      })
    })

    return Array.from(suggestions)
      .sort((a, b) => a.localeCompare(b, 'ja'))
      .slice(0, maxSuggestions)
  }

  /**
   * デバウンスタイマーをクリア
   */
  public clearDebounceTimers(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }

  /**
   * 検索統計の取得
   */
  public getSearchStats(songs: Song[]): {
    totalSongs: number
    songsWithTags: number
    uniqueTags: number
    averageTagsPerSong: number
    mostCommonTags: Array<{ tag: string; count: number }>
  } {
    const totalSongs = songs.length
    const songsWithTags = songs.filter(
      song => song.tags && song.tags.length > 0
    ).length

    const tagCounts = new Map<string, number>()
    let totalTags = 0

    songs.forEach(song => {
      if (song.tags) {
        totalTags += song.tags.length
        song.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      }
    })

    const uniqueTags = tagCounts.size
    const averageTagsPerSong = totalSongs > 0 ? totalTags / totalSongs : 0

    const mostCommonTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalSongs,
      songsWithTags,
      uniqueTags,
      averageTagsPerSong,
      mostCommonTags,
    }
  }
}
