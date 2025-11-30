import { MusicDatabase, Song, Person, Tag } from '@/types/music'

/**
 * 楽曲データの整合性を検証するユーティリティ
 */
export class DataValidator {
  /**
   * URL形式のバリデーション
   */
  static validateUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false
    const urlPattern = /^https?:\/\/.+/
    return urlPattern.test(url)
  }

  /**
   * テキストの文字数制限バリデーション
   */
  static validateTextLength(text: string, maxLength: number): boolean {
    if (typeof text !== 'string') return false
    return text.length <= maxLength
  }

  /**
   * 発売年のバリデーション（1000-9999の範囲）
   */
  static validateReleaseYear(year: number): boolean {
    if (typeof year !== 'number') return false
    return year >= 1000 && year <= 9999
  }

  /**
   * 楽曲データの基本的な検証
   */
  static validateSong(song: Song): boolean {
    const basicValidation =
      typeof song.id === 'string' &&
      song.id.length > 0 &&
      typeof song.title === 'string' &&
      song.title.length > 0 &&
      Array.isArray(song.lyricists) &&
      Array.isArray(song.composers) &&
      Array.isArray(song.arrangers)

    if (!basicValidation) return false

    // 拡張フィールドのバリデーション
    if (song.artists !== undefined && !Array.isArray(song.artists)) return false
    if (
      song.releaseYear !== undefined &&
      !this.validateReleaseYear(song.releaseYear)
    )
      return false
    if (
      song.singleName !== undefined &&
      !this.validateTextLength(song.singleName, 200)
    )
      return false
    if (
      song.albumName !== undefined &&
      !this.validateTextLength(song.albumName, 200)
    )
      return false
    if (
      song.spotifyEmbed !== undefined &&
      !this.validateTextLength(song.spotifyEmbed, 2000)
    )
      return false
    if (song.detailPageUrls !== undefined) {
      if (!Array.isArray(song.detailPageUrls)) return false
      if (song.detailPageUrls.length > 10) return false
      for (const urlObj of song.detailPageUrls) {
        if (!this.validateUrl(urlObj.url)) return false
        if (!this.validateTextLength(urlObj.url, 500)) return false
      }
    }

    return true
  }

  /**
   * 人物データの基本的な検証
   */
  static validatePerson(person: Person): boolean {
    const validTypes = ['lyricist', 'composer', 'arranger']
    return (
      typeof person.id === 'string' &&
      person.id.length > 0 &&
      typeof person.name === 'string' &&
      person.name.length > 0 &&
      validTypes.includes(person.type) &&
      Array.isArray(person.songs)
    )
  }

  /**
   * タグデータの基本的な検証
   */
  static validateTag(tag: Tag): boolean {
    return (
      typeof tag.id === 'string' &&
      tag.id.length > 0 &&
      typeof tag.name === 'string' &&
      tag.name.length > 0 &&
      Array.isArray(tag.songs)
    )
  }

  /**
   * 音楽データベース全体の検証
   */
  static validateMusicDatabase(database: MusicDatabase): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 基本構造の検証
    if (!Array.isArray(database.songs)) {
      errors.push('songs must be an array')
    }
    if (!Array.isArray(database.people)) {
      errors.push('people must be an array')
    }
    if (!Array.isArray(database.tags)) {
      errors.push('tags must be an array')
    }

    // 各楽曲の検証
    database.songs?.forEach((song, index) => {
      if (!this.validateSong(song)) {
        errors.push(`Invalid song at index ${index}: ${song.id || 'unknown'}`)
      }
    })

    // 各人物の検証
    database.people?.forEach((person, index) => {
      if (!this.validatePerson(person)) {
        errors.push(
          `Invalid person at index ${index}: ${person.id || 'unknown'}`
        )
      }
    })

    // 各タグの検証
    database.tags?.forEach((tag, index) => {
      if (!this.validateTag(tag)) {
        errors.push(`Invalid tag at index ${index}: ${tag.id || 'unknown'}`)
      }
    })

    // 関連性の検証
    const songIds = new Set(database.songs?.map(song => song.id) || [])
    database.people?.forEach(person => {
      person.songs.forEach(songId => {
        if (!songIds.has(songId)) {
          errors.push(
            `Person ${person.name} references non-existent song: ${songId}`
          )
        }
      })
    })

    // タグの関連性検証
    database.tags?.forEach(tag => {
      tag.songs.forEach(songId => {
        if (!songIds.has(songId)) {
          errors.push(`Tag ${tag.name} references non-existent song: ${songId}`)
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * データベースの統計情報を取得
   */
  static getDatabaseStats(database: MusicDatabase): {
    songCount: number
    personCount: number
    lyricistCount: number
    composerCount: number
    arrangerCount: number
    tagCount: number
  } {
    const people = database.people || []

    return {
      songCount: database.songs?.length || 0,
      personCount: people.length,
      lyricistCount: people.filter(p => p.type === 'lyricist').length,
      composerCount: people.filter(p => p.type === 'composer').length,
      arrangerCount: people.filter(p => p.type === 'arranger').length,
      tagCount: database.tags?.length || 0,
    }
  }
}
