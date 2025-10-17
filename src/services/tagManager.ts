import { Tag, Song, MusicDatabase } from '@/types/music'

/**
 * タグシステムを管理するクラス
 * タグの抽出、人気度計算、関連楽曲の取得などを行う
 */
export class TagManager {
  private tags: Tag[] = []
  private musicDatabase: MusicDatabase

  constructor(musicDatabase: MusicDatabase) {
    this.musicDatabase = musicDatabase
    // タグ配列が存在しない場合は初期化
    if (!this.musicDatabase.tags) {
      this.musicDatabase.tags = []
    }
    this.extractTagsFromSongs()
  }

  /**
   * 楽曲データからタグを抽出してTag配列を生成
   */
  extractTagsFromSongs(): Tag[] {
    const tagMap = new Map<string, Set<string>>()

    // 全楽曲からタグを収集
    this.musicDatabase.songs.forEach(song => {
      if (song.tags && song.tags.length > 0) {
        song.tags.forEach(tagName => {
          if (!tagMap.has(tagName)) {
            tagMap.set(tagName, new Set())
          }
          tagMap.get(tagName)!.add(song.id)
        })
      }
    })

    // TagMapからTag配列を生成
    this.tags = Array.from(tagMap.entries()).map(([tagName, songIds]) => ({
      id: `tag-${tagName}`,
      name: tagName,
      songs: Array.from(songIds)
    }))

    // データベースのタグも更新
    if (!this.musicDatabase.tags) {
      this.musicDatabase.tags = []
    }
    this.musicDatabase.tags = this.tags

    console.log(`Extracted ${this.tags.length} tags from ${this.musicDatabase.songs.length} songs`)
    return this.tags
  }

  /**
   * 指定されたタグが付けられた楽曲一覧を取得
   */
  getTaggedSongs(tagName: string): Song[] {
    const tag = this.tags.find(t => t.name === tagName)
    if (!tag) return []

    return tag.songs
      .map(songId => this.musicDatabase.songs.find(song => song.id === songId))
      .filter((song): song is Song => song !== undefined)
  }

  /**
   * タグの人気度を計算（そのタグが付けられた楽曲数）
   */
  calculateTagPopularity(tagName: string): number {
    const tag = this.tags.find(t => t.name === tagName)
    return tag ? tag.songs.length : 0
  }

  /**
   * タグの人気度に基づいてシャボン玉のサイズを計算
   * Requirements: 6.4 - タグのシャボン玉のサイズがそのタグが付けられた楽曲数に比例する
   * BubbleManagerの設定に合わせて統一
   */
  calculateTagBubbleSize(tagName: string): number {
    const popularity = this.calculateTagPopularity(tagName)
    
    // BubbleManagerの設定を取得（getCurrentBubbleSettings）
    const { getCurrentBubbleSettings } = require('@/config/bubbleSettings')
    const settings = getCurrentBubbleSettings()
    
    console.log(`🏷️ Tag bubble size calculation for "${tagName}":`, {
      popularity,
      minSize: settings.minSize,
      maxSize: settings.maxSize,
      isFixedSize: settings.minSize === settings.maxSize
    })
    
    // 最小・最大サイズが同じ場合は固定サイズを返す（BubbleManagerと同じロジック）
    if (settings.minSize === settings.maxSize) {
      console.log(`🏷️ Fixed size mode for tag: returning ${settings.minSize}px`)
      return settings.minSize
    }
    
    // 通常の比例計算（BubbleManagerと同じロジック）
    const normalizedCount = Math.min(popularity / 20, 1) // 20件で最大サイズ
    const calculatedSize = settings.minSize + (settings.maxSize - settings.minSize) * normalizedCount
    
    // 最大サイズ制限を厳密に適用
    const finalSize = Math.min(calculatedSize, settings.maxSize)
    
    console.log(`🏷️ Tag size calculation: popularity=${popularity}, normalized=${normalizedCount.toFixed(2)}, calculated=${calculatedSize.toFixed(1)}, final=${finalSize.toFixed(1)}`)
    
    return Math.round(finalSize)
  }

  /**
   * 全タグ一覧を取得
   */
  getAllTags(): Tag[] {
    return [...this.tags]
  }

  /**
   * タグIDからタグデータを取得
   */
  getTagById(id: string): Tag | undefined {
    return this.tags.find(tag => tag.id === id)
  }

  /**
   * タグ名からタグデータを取得
   */
  getTagByName(name: string): Tag | undefined {
    return this.tags.find(tag => tag.name === name)
  }

  /**
   * 人気度順にソートされたタグ一覧を取得
   */
  getTagsByPopularity(): Tag[] {
    return [...this.tags].sort((a, b) => b.songs.length - a.songs.length)
  }

  /**
   * 指定された楽曲に関連するタグ一覧を取得
   */
  getTagsForSong(songId: string): Tag[] {
    return this.tags.filter(tag => tag.songs.includes(songId))
  }

  /**
   * タグの統計情報を取得
   */
  getTagStats(): {
    totalTags: number
    averageSongsPerTag: number
    mostPopularTag: { name: string; songCount: number } | null
    leastPopularTag: { name: string; songCount: number } | null
  } {
    if (this.tags.length === 0) {
      return {
        totalTags: 0,
        averageSongsPerTag: 0,
        mostPopularTag: null,
        leastPopularTag: null
      }
    }

    const songCounts = this.tags.map(tag => tag.songs.length)
    const maxSongCount = Math.max(...songCounts)
    const minSongCount = Math.min(...songCounts)
    
    const mostPopularTag = this.tags.find(tag => tag.songs.length === maxSongCount)
    const leastPopularTag = this.tags.find(tag => tag.songs.length === minSongCount)

    return {
      totalTags: this.tags.length,
      averageSongsPerTag: songCounts.reduce((a, b) => a + b, 0) / this.tags.length,
      mostPopularTag: mostPopularTag ? {
        name: mostPopularTag.name,
        songCount: mostPopularTag.songs.length
      } : null,
      leastPopularTag: leastPopularTag ? {
        name: leastPopularTag.name,
        songCount: leastPopularTag.songs.length
      } : null
    }
  }

  /**
   * 楽曲データベースが更新された時にタグを再抽出
   */
  updateMusicDatabase(newMusicDatabase: MusicDatabase): void {
    this.musicDatabase = newMusicDatabase
    // タグ配列が存在しない場合は初期化
    if (!this.musicDatabase.tags) {
      this.musicDatabase.tags = []
    }
    this.extractTagsFromSongs()
  }

  /**
   * 新しいタグを追加（楽曲登録時に使用）
   */
  addTagsFromSong(song: Song): void {
    if (!song.tags || song.tags.length === 0) return

    let hasNewTags = false

    song.tags.forEach(tagName => {
      const existingTag = this.tags.find(t => t.name === tagName)
      
      if (existingTag) {
        // 既存のタグに楽曲を追加
        if (!existingTag.songs.includes(song.id)) {
          existingTag.songs.push(song.id)
          hasNewTags = true
        }
      } else {
        // 新しいタグを作成
        this.tags.push({
          id: `tag-${tagName}`,
          name: tagName,
          songs: [song.id]
        })
        hasNewTags = true
      }
    })

    if (hasNewTags) {
      // データベースのタグも更新
      if (!this.musicDatabase.tags) {
        this.musicDatabase.tags = []
      }
      this.musicDatabase.tags = this.tags
      console.log(`Updated tags for song "${song.title}"`)
    }
  }

  /**
   * 楽曲削除時にタグから楽曲IDを削除
   */
  removeSongFromTags(songId: string): void {
    let hasChanges = false

    this.tags.forEach(tag => {
      const songIndex = tag.songs.indexOf(songId)
      if (songIndex > -1) {
        tag.songs.splice(songIndex, 1)
        hasChanges = true
      }
    })

    // 楽曲が0件になったタグを削除
    this.tags = this.tags.filter(tag => tag.songs.length > 0)

    if (hasChanges) {
      // データベースのタグも更新
      if (!this.musicDatabase.tags) {
        this.musicDatabase.tags = []
      }
      this.musicDatabase.tags = this.tags
      console.log(`Removed song ${songId} from tags`)
    }
  }

  /**
   * タグ検索（部分一致）
   */
  searchTags(query: string): Tag[] {
    const lowerQuery = query.toLowerCase()
    return this.tags.filter(tag => 
      tag.name.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 関連タグを取得（同じ楽曲に付けられているタグ）
   */
  getRelatedTags(tagName: string): Tag[] {
    const targetTag = this.getTagByName(tagName)
    if (!targetTag) return []

    const relatedTagNames = new Set<string>()

    // 対象タグが付けられた楽曲を取得
    targetTag.songs.forEach(songId => {
      const song = this.musicDatabase.songs.find(s => s.id === songId)
      if (song && song.tags) {
        song.tags.forEach(otherTagName => {
          if (otherTagName !== tagName) {
            relatedTagNames.add(otherTagName)
          }
        })
      }
    })

    return Array.from(relatedTagNames)
      .map(tagName => this.getTagByName(tagName))
      .filter((tag): tag is Tag => tag !== undefined)
      .sort((a, b) => b.songs.length - a.songs.length) // 人気度順
  }

  /**
   * タグの共起度を計算（2つのタグが同じ楽曲に付けられている回数）
   */
  calculateTagCooccurrence(tagName1: string, tagName2: string): number {
    const tag1 = this.getTagByName(tagName1)
    const tag2 = this.getTagByName(tagName2)
    
    if (!tag1 || !tag2) return 0

    const commonSongs = tag1.songs.filter(songId => tag2.songs.includes(songId))
    return commonSongs.length
  }

  /**
   * ランダムなタグを取得（シャボン玉生成用）
   */
  getRandomTag(): Tag | null {
    if (this.tags.length === 0) return null
    return this.tags[Math.floor(Math.random() * this.tags.length)]
  }

  /**
   * 人気度に基づいた重み付きランダムタグ取得
   */
  getWeightedRandomTag(): Tag | null {
    if (this.tags.length === 0) return null

    // 人気度の合計を計算
    const totalPopularity = this.tags.reduce((sum, tag) => sum + tag.songs.length, 0)
    
    if (totalPopularity === 0) return this.getRandomTag()

    // 重み付きランダム選択
    let randomValue = Math.random() * totalPopularity
    
    for (const tag of this.tags) {
      randomValue -= tag.songs.length
      if (randomValue <= 0) {
        return tag
      }
    }

    // フォールバック
    return this.tags[this.tags.length - 1]
  }
}