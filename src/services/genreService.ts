import { MusicDataService } from './musicDataService'
import { BubbleEntity } from '@/types/bubble'

/**
 * ジャンル抽出・管理サービス
 * Requirements: 4.1, 4.2 - ジャンル情報の取得と管理
 */
export class GenreService {
  private static instance: GenreService
  private musicDataService: MusicDataService

  private constructor() {
    this.musicDataService = MusicDataService.getInstance()
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): GenreService {
    if (!GenreService.instance) {
      GenreService.instance = new GenreService()
    }
    return GenreService.instance
  }

  /**
   * 利用可能な全ジャンルを取得
   * タグをジャンルとして扱う
   */
  public getAvailableGenres(): string[] {
    const tags = this.musicDataService.getAllTags()
    return tags
      .map(tag => tag.name)
      .filter(name => name && name.trim().length > 0)
      .sort()
  }

  /**
   * シャボン玉のジャンルを取得
   * Requirements: 4.2 - ジャンルベースのシャボン玉表示制御
   */
  public getBubbleGenres(bubble: BubbleEntity): string[] {
    switch (bubble.type) {
      case 'song':
        return this.getSongGenres(bubble.name)
      case 'tag':
        // タグ自体がジャンルとして扱われる
        return [bubble.name]
      case 'lyricist':
      case 'composer':
      case 'arranger':
        return this.getPersonGenres(bubble.name, bubble.type)
      default:
        return []
    }
  }

  /**
   * 楽曲のジャンルを取得（楽曲に関連するタグから）
   */
  private getSongGenres(songTitle: string): string[] {
    const songs = this.musicDataService.getAllSongs()
    const song = songs.find(s => s.title === songTitle)

    if (!song || !song.tags) {
      return []
    }

    return song.tags.filter(tag => tag && tag.trim().length > 0)
  }

  /**
   * 人物のジャンルを取得（関連楽曲のタグから）
   */
  private getPersonGenres(
    personName: string,
    personType: 'lyricist' | 'composer' | 'arranger'
  ): string[] {
    const people = this.musicDataService.getPeopleByName(personName)
    const person = people.find(p => p.type === personType)

    if (!person) {
      return []
    }

    const relatedSongs = this.musicDataService.getSongsForPerson(person.id)
    const genres = new Set<string>()

    relatedSongs.forEach(song => {
      if (song.tags) {
        song.tags.forEach(tag => {
          if (tag && tag.trim().length > 0) {
            genres.add(tag)
          }
        })
      }
    })

    return Array.from(genres)
  }

  /**
   * 指定されたジャンルに属するシャボン玉をフィルタリング
   * Requirements: 4.2, 4.4 - ジャンルベースのシャボン玉表示制御とフィルタリング状態の管理
   */
  public filterBubblesByGenres(
    bubbles: BubbleEntity[],
    selectedGenres: string[]
  ): BubbleEntity[] {
    if (selectedGenres.length === 0) {
      return bubbles
    }

    return bubbles.filter(bubble => {
      const bubbleGenres = this.getBubbleGenres(bubble)
      return bubbleGenres.some(genre => selectedGenres.includes(genre))
    })
  }

  /**
   * ジャンル別のシャボン玉数を取得
   */
  public getGenreStats(bubbles: BubbleEntity[]): Map<string, number> {
    const stats = new Map<string, number>()
    const availableGenres = this.getAvailableGenres()

    // 全ジャンルを0で初期化
    availableGenres.forEach(genre => {
      stats.set(genre, 0)
    })

    // 各シャボン玉のジャンルをカウント
    bubbles.forEach(bubble => {
      const bubbleGenres = this.getBubbleGenres(bubble)
      bubbleGenres.forEach(genre => {
        const currentCount = stats.get(genre) || 0
        stats.set(genre, currentCount + 1)
      })
    })

    return stats
  }

  /**
   * ジャンルが有効かチェック
   */
  public isValidGenre(genre: string): boolean {
    const availableGenres = this.getAvailableGenres()
    return availableGenres.includes(genre)
  }

  /**
   * 複数ジャンルの有効性をチェック
   */
  public validateGenres(genres: string[]): {
    valid: string[]
    invalid: string[]
  } {
    const availableGenres = this.getAvailableGenres()
    const valid: string[] = []
    const invalid: string[] = []

    genres.forEach(genre => {
      if (availableGenres.includes(genre)) {
        valid.push(genre)
      } else {
        invalid.push(genre)
      }
    })

    return { valid, invalid }
  }

  /**
   * 関連ジャンルを取得（同じ楽曲を共有するジャンル）
   */
  public getRelatedGenres(targetGenre: string): string[] {
    if (!this.isValidGenre(targetGenre)) {
      return []
    }

    const targetTag = this.musicDataService.getTagByName(targetGenre)
    if (!targetTag) {
      return []
    }

    const relatedGenres = new Set<string>()
    const allTags = this.musicDataService.getAllTags()

    // 同じ楽曲を共有するタグを探す
    allTags.forEach(tag => {
      if (tag.name === targetGenre) return

      const hasCommonSongs = tag.songs.some(songId =>
        targetTag.songs.includes(songId)
      )

      if (hasCommonSongs) {
        relatedGenres.add(tag.name)
      }
    })

    return Array.from(relatedGenres).sort()
  }

  /**
   * 人気ジャンルを取得（楽曲数順）
   */
  public getPopularGenres(
    limit: number = 10
  ): Array<{ genre: string; count: number }> {
    const tags = this.musicDataService.getAllTags()

    return tags
      .map(tag => ({
        genre: tag.name,
        count: tag.songs.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  /**
   * ジャンルフィルターの推奨設定を取得
   */
  public getRecommendedGenres(
    bubbles: BubbleEntity[],
    maxGenres: number = 5
  ): string[] {
    const genreStats = this.getGenreStats(bubbles)

    return Array.from(genreStats.entries())
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxGenres)
      .map(([genre]) => genre)
  }

  /**
   * ジャンルフィルターの結果プレビューを取得
   */
  public getFilterPreview(
    bubbles: BubbleEntity[],
    selectedGenres: string[]
  ): {
    totalBubbles: number
    filteredBubbles: number
    hiddenBubbles: number
    genreBreakdown: Map<string, number>
  } {
    const totalBubbles = bubbles.length
    const filteredBubbles = this.filterBubblesByGenres(bubbles, selectedGenres)
    const filteredCount = filteredBubbles.length
    const hiddenCount = totalBubbles - filteredCount

    const genreBreakdown = this.getGenreStats(filteredBubbles)

    return {
      totalBubbles,
      filteredBubbles: filteredCount,
      hiddenBubbles: hiddenCount,
      genreBreakdown,
    }
  }

  /**
   * ジャンルフィルターの設定を保存
   */
  public saveFilterSettings(selectedGenres: string[]): void {
    try {
      const settings = {
        selectedGenres,
        timestamp: Date.now(),
      }
      localStorage.setItem('genreFilterSettings', JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save genre filter settings:', error)
    }
  }

  /**
   * 保存されたジャンルフィルターの設定を読み込み
   */
  public loadFilterSettings(): string[] {
    try {
      const saved = localStorage.getItem('genreFilterSettings')
      if (saved) {
        const settings = JSON.parse(saved)
        const { valid } = this.validateGenres(settings.selectedGenres || [])
        return valid
      }
    } catch (error) {
      console.warn('Failed to load genre filter settings:', error)
    }
    return []
  }

  /**
   * ジャンルフィルターの設定をクリア
   */
  public clearFilterSettings(): void {
    try {
      localStorage.removeItem('genreFilterSettings')
    } catch (error) {
      console.warn('Failed to clear genre filter settings:', error)
    }
  }

  /**
   * シャボン玉から動的にジャンルを抽出
   * Requirements: 5.2 - 利用可能なジャンル情報の取得と表示
   */
  public extractGenresFromBubbles(bubbles: BubbleEntity[]): string[] {
    const genres = new Set<string>()

    bubbles.forEach(bubble => {
      const bubbleGenres = this.getBubbleGenres(bubble)
      bubbleGenres.forEach(genre => {
        if (genre && genre.trim().length > 0) {
          genres.add(genre)
        }
      })
    })

    return Array.from(genres).sort()
  }

  /**
   * カテゴリ別にシャボン玉をフィルタリング
   * Requirements: 5.1 - 凡例アイコンをクリック可能に変更
   */
  public filterBubblesByCategory(
    bubbles: BubbleEntity[],
    category: string
  ): BubbleEntity[] {
    if (!category) {
      return bubbles
    }

    return bubbles.filter(bubble => bubble.type === category)
  }

  /**
   * 利用可能なカテゴリを取得
   */
  public getAvailableCategories(): Array<{
    category: string
    label: string
    count: number
  }> {
    const songs = this.musicDataService.getAllSongs()
    const people = this.musicDataService.getAllPeople()
    const tags = this.musicDataService.getAllTags()

    return [
      { category: 'song', label: '楽曲', count: songs.length },
      {
        category: 'lyricist',
        label: '作詞家',
        count: people.filter(p => p.type === 'lyricist').length,
      },
      {
        category: 'composer',
        label: '作曲家',
        count: people.filter(p => p.type === 'composer').length,
      },
      {
        category: 'arranger',
        label: '編曲家',
        count: people.filter(p => p.type === 'arranger').length,
      },
      { category: 'tag', label: 'タグ', count: tags.length },
    ]
  }
}

export default GenreService
