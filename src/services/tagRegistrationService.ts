import { Song } from '@/types/music'
import { DataManager } from './dataManager'
import { MusicDataService } from './musicDataService'
import { ErrorType, safeExecute } from '@/utils/errorHandler'

/**
 * タグ登録エラーの種類
 */
export enum TagRegistrationError {
  SONG_NOT_FOUND = 'SONG_NOT_FOUND',
  TAG_LIMIT_EXCEEDED = 'TAG_LIMIT_EXCEEDED',
  INVALID_TAG_FORMAT = 'INVALID_TAG_FORMAT',
  SAVE_FAILED = 'SAVE_FAILED',
  DUPLICATE_TAG = 'DUPLICATE_TAG',
  EMPTY_TAG = 'EMPTY_TAG',
  TAG_TOO_LONG = 'TAG_TOO_LONG',
}

/**
 * タグ登録結果の型
 */
export interface TagRegistrationResult {
  success: boolean
  updatedSong?: Song
  addedTags?: string[]
  removedTags?: string[]
  errors?: TagRegistrationError[]
  errorMessages?: string[]
}

/**
 * タグ検証結果の型
 */
export interface TagValidationResult {
  isValid: boolean
  errors: TagRegistrationError[]
  errorMessages: string[]
}

/**
 * タグ制限検証結果の型
 */
export interface TagLimitValidation {
  isValid: boolean
  currentCount: number
  maxCount: number
  warningMessage?: string
  errorMessage?: string
  isNearLimit: boolean
}

/**
 * タグ統計情報の型
 */
export interface TagStatistics {
  totalTags: number
  mostUsedTags: Array<{ tag: string; count: number }>
  recentlyAddedTags: string[]
  tagUsageByMonth: Array<{ month: string; count: number }>
}

/**
 * タグ登録データ処理サービス
 * 楽曲へのタグ追加・削除処理、データベース更新処理、エラーハンドリングと検証を提供
 * Requirements: 1.2, 1.3, 1.5
 */
export class TagRegistrationService {
  private static instance: TagRegistrationService
  private static readonly MAX_TAGS_PER_SONG = 100
  private static readonly WARNING_THRESHOLD = 80
  private static readonly MAX_TAG_LENGTH = 50
  private static readonly MIN_TAG_LENGTH = 1

  private constructor() {}

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): TagRegistrationService {
    if (!TagRegistrationService.instance) {
      TagRegistrationService.instance = new TagRegistrationService()
    }
    return TagRegistrationService.instance
  }

  /**
   * 楽曲にタグを追加
   * Requirements: 1.2, 1.3, 1.5
   */
  public async addTagsToSong(
    songId: string,
    tagsToAdd: string[]
  ): Promise<TagRegistrationResult> {
    return (
      safeExecute(
        async () => {
          // 楽曲の存在確認
          const song = DataManager.getSong(songId)
          if (!song) {
            return {
              success: false,
              errors: [TagRegistrationError.SONG_NOT_FOUND],
              errorMessages: ['指定された楽曲が見つかりません'],
            }
          }

          // 現在のタグを取得
          const currentTags = song.tags || []

          // 重複チェックと新しいタグのフィルタリング
          const newTags = tagsToAdd.filter(tag => {
            const normalizedTag = this.normalizeTag(tag)
            return !currentTags.some(
              existingTag => this.normalizeTag(existingTag) === normalizedTag
            )
          })

          // 拡張されたタグ検証（制限チェック含む）
          const validationResult = this.validateTagsWithLimit(
            currentTags,
            newTags
          )
          if (!validationResult.isValid) {
            return {
              success: false,
              errors: validationResult.errors,
              errorMessages: validationResult.errorMessages,
            }
          }

          // 新しいタグがない場合
          if (newTags.length === 0) {
            return {
              success: true,
              updatedSong: song,
              addedTags: [],
              removedTags: [],
            }
          }

          // タグを追加して楽曲を更新
          const updatedSong: Song = {
            ...song,
            tags: [...currentTags, ...newTags],
          }

          // データベースに保存
          const saveSuccess = await DataManager.updateSong(updatedSong)
          if (!saveSuccess) {
            return {
              success: false,
              errors: [TagRegistrationError.SAVE_FAILED],
              errorMessages: ['タグの保存に失敗しました'],
            }
          }

          // MusicDataServiceのキャッシュをクリア
          const musicService = MusicDataService.getInstance()
          musicService.clearCache()

          return {
            success: true,
            updatedSong,
            addedTags: newTags,
            removedTags: [],
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'TagRegistrationService.addTagsToSong',
          songId,
          tagsCount: tagsToAdd.length,
        }
      ) || {
        success: false,
        errors: [TagRegistrationError.SAVE_FAILED],
        errorMessages: ['予期しないエラーが発生しました'],
      }
    )
  }

  /**
   * 楽曲からタグを削除
   * Requirements: 1.2, 1.3, 1.5
   */
  public async removeTagsFromSong(
    songId: string,
    tagsToRemove: string[]
  ): Promise<TagRegistrationResult> {
    return (
      safeExecute(
        async () => {
          // 楽曲の存在確認
          const song = DataManager.getSong(songId)
          if (!song) {
            return {
              success: false,
              errors: [TagRegistrationError.SONG_NOT_FOUND],
              errorMessages: ['指定された楽曲が見つかりません'],
            }
          }

          // 現在のタグを取得
          const currentTags = song.tags || []

          // 削除するタグをフィルタリング
          const normalizedTagsToRemove = tagsToRemove.map(tag =>
            this.normalizeTag(tag)
          )
          const remainingTags = currentTags.filter(
            tag => !normalizedTagsToRemove.includes(this.normalizeTag(tag))
          )

          // 実際に削除されたタグを特定
          const actuallyRemovedTags = currentTags.filter(tag =>
            normalizedTagsToRemove.includes(this.normalizeTag(tag))
          )

          // 変更がない場合
          if (actuallyRemovedTags.length === 0) {
            return {
              success: true,
              updatedSong: song,
              addedTags: [],
              removedTags: [],
            }
          }

          // タグを削除して楽曲を更新
          const updatedSong: Song = {
            ...song,
            tags: remainingTags,
          }

          // データベースに保存
          const saveSuccess = await DataManager.updateSong(updatedSong)
          if (!saveSuccess) {
            return {
              success: false,
              errors: [TagRegistrationError.SAVE_FAILED],
              errorMessages: ['タグの削除に失敗しました'],
            }
          }

          // MusicDataServiceのキャッシュをクリア
          const musicService = MusicDataService.getInstance()
          musicService.clearCache()

          return {
            success: true,
            updatedSong,
            addedTags: [],
            removedTags: actuallyRemovedTags,
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'TagRegistrationService.removeTagsFromSong',
          songId,
          tagsCount: tagsToRemove.length,
        }
      ) || {
        success: false,
        errors: [TagRegistrationError.SAVE_FAILED],
        errorMessages: ['予期しないエラーが発生しました'],
      }
    )
  }

  /**
   * 楽曲のタグを完全に置き換え
   * Requirements: 1.2, 1.3, 1.5
   */
  public async replaceTagsForSong(
    songId: string,
    newTags: string[]
  ): Promise<TagRegistrationResult> {
    return (
      safeExecute(
        async () => {
          // 楽曲の存在確認（MusicDataServiceとDataManagerの両方をチェック）
          let song = DataManager.getSong(songId)

          if (!song) {
            // DataManagerで見つからない場合、MusicDataServiceからも検索
            const { MusicDataService } = await import('./musicDataService')
            const musicService = MusicDataService.getInstance()
            const allSongs = musicService.getAllSongs()
            song = allSongs.find(s => s.id === songId) || null

            console.log('🔍 Song search results:', {
              searchedId: songId,
              foundInDataManager: false,
              foundInMusicService: !!song,
              dataManagerSongs: DataManager.loadSongs().map(s => ({
                id: s.id,
                title: s.title,
              })),
              musicServiceSongs: allSongs.map(s => ({
                id: s.id,
                title: s.title,
              })),
            })
          }

          if (!song) {
            console.error('🚨 Song not found in both sources:', {
              searchedId: songId,
            })
            return {
              success: false,
              errors: [TagRegistrationError.SONG_NOT_FOUND],
              errorMessages: [`指定された楽曲が見つかりません (ID: ${songId})`],
            }
          }

          // 重複を除去して正規化
          const uniqueTags = Array.from(
            new Set(
              newTags.map(tag => tag.trim()).filter(tag => tag.length > 0)
            )
          )

          // 拡張されたタグ検証（制限チェック含む）
          const validationResult = this.validateTagsWithLimit([], uniqueTags)
          if (!validationResult.isValid) {
            return {
              success: false,
              errors: validationResult.errors,
              errorMessages: validationResult.errorMessages,
            }
          }

          // 現在のタグと比較
          const currentTags = song.tags || []
          const addedTags = uniqueTags.filter(tag => !currentTags.includes(tag))
          const removedTags = currentTags.filter(
            tag => !uniqueTags.includes(tag)
          )

          // 楽曲を更新
          const updatedSong: Song = {
            ...song,
            tags: uniqueTags,
          }

          // データベースに保存（両方のサービスに保存）
          const dataManagerSuccess = await DataManager.updateSong(updatedSong)

          // MusicDataServiceにも保存を試行
          let musicServiceSuccess = true
          try {
            const { MusicDataService } = await import('./musicDataService')
            const musicService = MusicDataService.getInstance()

            // MusicDataServiceのデータを更新
            const allSongs = musicService.getAllSongs()
            const songIndex = allSongs.findIndex(s => s.id === songId)
            if (songIndex >= 0) {
              allSongs[songIndex] = updatedSong
              console.log('🎵 Updated song in MusicDataService')
            }

            musicService.clearCache()
          } catch (error) {
            console.warn('⚠️ Failed to update MusicDataService:', error)
            musicServiceSuccess = false
          }

          if (!dataManagerSuccess && !musicServiceSuccess) {
            return {
              success: false,
              errors: [TagRegistrationError.SAVE_FAILED],
              errorMessages: ['タグの保存に失敗しました'],
            }
          }

          return {
            success: true,
            updatedSong,
            addedTags,
            removedTags,
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'TagRegistrationService.replaceTagsForSong',
          songId,
          tagsCount: newTags.length,
        }
      ) || {
        success: false,
        errors: [TagRegistrationError.SAVE_FAILED],
        errorMessages: ['予期しないエラーが発生しました'],
      }
    )
  }

  /**
   * タグの検証
   * Requirements: 1.3, 1.5
   */
  public validateTags(tags: string[]): TagValidationResult {
    const errors: TagRegistrationError[] = []
    const errorMessages: string[] = []

    for (const tag of tags) {
      // 空のタグチェック
      if (!tag || tag.trim().length === 0) {
        errors.push(TagRegistrationError.EMPTY_TAG)
        errorMessages.push('空のタグは追加できません')
        continue
      }

      const trimmedTag = tag.trim()

      // 長さチェック
      if (trimmedTag.length < TagRegistrationService.MIN_TAG_LENGTH) {
        errors.push(TagRegistrationError.INVALID_TAG_FORMAT)
        errorMessages.push(
          `タグは${TagRegistrationService.MIN_TAG_LENGTH}文字以上である必要があります`
        )
        continue
      }

      if (trimmedTag.length > TagRegistrationService.MAX_TAG_LENGTH) {
        errors.push(TagRegistrationError.TAG_TOO_LONG)
        errorMessages.push(
          `タグは${TagRegistrationService.MAX_TAG_LENGTH}文字以下である必要があります`
        )
        continue
      }

      // 不正な文字チェック
      if (this.containsInvalidCharacters(trimmedTag)) {
        errors.push(TagRegistrationError.INVALID_TAG_FORMAT)
        errorMessages.push(
          `タグに使用できない文字が含まれています: "${trimmedTag}"`
        )
        continue
      }
    }

    return {
      isValid: errors.length === 0,
      errors: Array.from(new Set(errors)), // 重複を除去
      errorMessages: Array.from(new Set(errorMessages)), // 重複を除去
    }
  }

  /**
   * タグ制限の検証（拡張版）
   * Requirements: 1.1, 1.4
   */
  public validateTagLimit(
    currentTags: string[],
    newTags: string[]
  ): TagLimitValidation {
    const currentCount = currentTags.length
    const totalCount = currentCount + newTags.length
    const maxCount = TagRegistrationService.MAX_TAGS_PER_SONG
    const warningThreshold = TagRegistrationService.WARNING_THRESHOLD

    const isValid = totalCount <= maxCount
    const isNearLimit = totalCount >= warningThreshold && totalCount < maxCount

    let warningMessage: string | undefined
    let errorMessage: string | undefined

    if (!isValid) {
      errorMessage = `楽曲あたりのタグ数は最大${maxCount}個までです。現在${currentCount}個、追加しようとしているタグ${newTags.length}個で合計${totalCount}個になります。`
    } else if (isNearLimit) {
      warningMessage = `タグ数が制限に近づいています（${totalCount}/${maxCount}個）。`
    }

    return {
      isValid,
      currentCount,
      maxCount,
      warningMessage,
      errorMessage,
      isNearLimit,
    }
  }

  /**
   * 拡張されたタグ検証（制限チェック含む）
   * Requirements: 1.1, 1.4
   */
  public validateTagsWithLimit(
    currentTags: string[],
    newTags: string[]
  ): TagValidationResult & { limitValidation: TagLimitValidation } {
    // 基本的なタグ検証
    const basicValidation = this.validateTags(newTags)

    // タグ制限検証
    const limitValidation = this.validateTagLimit(currentTags, newTags)

    // 制限エラーを基本検証に追加
    const errors = [...basicValidation.errors]
    const errorMessages = [...basicValidation.errorMessages]

    if (!limitValidation.isValid && limitValidation.errorMessage) {
      errors.push(TagRegistrationError.TAG_LIMIT_EXCEEDED)
      errorMessages.push(limitValidation.errorMessage)
    }

    return {
      isValid: basicValidation.isValid && limitValidation.isValid,
      errors,
      errorMessages,
      limitValidation,
    }
  }

  /**
   * タグの正規化
   */
  private normalizeTag(tag: string): string {
    return tag.trim().toLowerCase()
  }

  /**
   * 不正な文字が含まれているかチェック
   */
  private containsInvalidCharacters(tag: string): boolean {
    // 制御文字や特殊文字をチェック
    // eslint-disable-next-line no-control-regex
    const invalidChars = /[\x00-\x1F\x7F-\x9F<>"/\\|?*]/
    return invalidChars.test(tag)
  }

  /**
   * 全楽曲のタグ統計を取得
   * Requirements: 1.2
   */
  public getTagStatistics(): TagStatistics {
    return (
      safeExecute(
        () => {
          const songs = DataManager.loadSongs()
          const tagCounts = new Map<string, number>()
          const recentTags = new Set<string>()

          // タグの使用回数を集計
          songs.forEach(song => {
            if (song.tags && song.tags.length > 0) {
              song.tags.forEach(tag => {
                const normalizedTag = this.normalizeTag(tag)
                tagCounts.set(
                  normalizedTag,
                  (tagCounts.get(normalizedTag) || 0) + 1
                )
                recentTags.add(tag)
              })
            }
          })

          // 最も使用されているタグを取得
          const mostUsedTags = Array.from(tagCounts.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20)

          // 最近追加されたタグ（簡易実装）
          const recentlyAddedTags = Array.from(recentTags).slice(-10)

          // 月別使用統計（簡易実装）
          const tagUsageByMonth = this.calculateMonthlyTagUsage(songs)

          return {
            totalTags: tagCounts.size,
            mostUsedTags,
            recentlyAddedTags,
            tagUsageByMonth,
          }
        },
        ErrorType.DATA_LOADING,
        { source: 'TagRegistrationService.getTagStatistics' }
      ) || {
        totalTags: 0,
        mostUsedTags: [],
        recentlyAddedTags: [],
        tagUsageByMonth: [],
      }
    )
  }

  /**
   * 月別タグ使用統計を計算（簡易実装）
   */
  private calculateMonthlyTagUsage(
    songs: Song[]
  ): Array<{ month: string; count: number }> {
    const monthlyStats = new Map<string, number>()
    const now = new Date()

    // 過去12ヶ月のデータを初期化
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyStats.set(monthKey, 0)
    }

    // 楽曲のタグ数を月別に集計（作成日がない場合は現在月に計上）
    songs.forEach(song => {
      if (song.tags && song.tags.length > 0) {
        // 実際の実装では楽曲の作成日を使用する
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const currentCount = monthlyStats.get(currentMonth) || 0
        monthlyStats.set(currentMonth, currentCount + song.tags.length)
      }
    })

    return Array.from(monthlyStats.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  /**
   * タグの候補を取得
   * Requirements: 1.2, 1.4
   */
  public getTagSuggestions(query: string, limit: number = 10): string[] {
    return (
      safeExecute(
        () => {
          const allTags = DataManager.getAllTags()

          if (!query.trim()) {
            // クエリが空の場合は人気のタグを返す
            const stats = this.getTagStatistics()
            return stats.mostUsedTags.slice(0, limit).map(item => item.tag)
          }

          const normalizedQuery = this.normalizeTag(query)

          // クエリに一致するタグをフィルタリング
          const matchingTags = allTags.filter(tag =>
            this.normalizeTag(tag).includes(normalizedQuery)
          )

          // 完全一致を優先してソート
          return matchingTags
            .sort((a, b) => {
              const aNormalized = this.normalizeTag(a)
              const bNormalized = this.normalizeTag(b)

              // 完全一致を最優先
              if (aNormalized === normalizedQuery) return -1
              if (bNormalized === normalizedQuery) return 1

              // 前方一致を次に優先
              if (
                aNormalized.startsWith(normalizedQuery) &&
                !bNormalized.startsWith(normalizedQuery)
              )
                return -1
              if (
                bNormalized.startsWith(normalizedQuery) &&
                !aNormalized.startsWith(normalizedQuery)
              )
                return 1

              // アルファベット順
              return a.localeCompare(b)
            })
            .slice(0, limit)
        },
        ErrorType.DATA_LOADING,
        {
          source: 'TagRegistrationService.getTagSuggestions',
          query,
          limit,
        }
      ) || []
    )
  }

  /**
   * エラーメッセージを取得
   */
  public getErrorMessage(error: TagRegistrationError): string {
    switch (error) {
      case TagRegistrationError.SONG_NOT_FOUND:
        return '指定された楽曲が見つかりません'
      case TagRegistrationError.TAG_LIMIT_EXCEEDED:
        return `楽曲あたりのタグ数は最大${TagRegistrationService.MAX_TAGS_PER_SONG}個までです`
      case TagRegistrationError.INVALID_TAG_FORMAT:
        return 'タグの形式が正しくありません'
      case TagRegistrationError.SAVE_FAILED:
        return 'タグの保存に失敗しました'
      case TagRegistrationError.DUPLICATE_TAG:
        return 'このタグは既に追加されています'
      case TagRegistrationError.EMPTY_TAG:
        return '空のタグは追加できません'
      case TagRegistrationError.TAG_TOO_LONG:
        return `タグは${TagRegistrationService.MAX_TAG_LENGTH}文字以下である必要があります`
      default:
        return '予期しないエラーが発生しました'
    }
  }

  /**
   * 複数のエラーメッセージを統合
   */
  public getErrorMessages(errors: TagRegistrationError[]): string[] {
    return Array.from(new Set(errors.map(error => this.getErrorMessage(error))))
  }

  /**
   * タグ登録の制限情報を取得
   */
  public getTagLimits(): {
    maxTagsPerSong: number
    warningThreshold: number
    maxTagLength: number
    minTagLength: number
  } {
    return {
      maxTagsPerSong: TagRegistrationService.MAX_TAGS_PER_SONG,
      warningThreshold: TagRegistrationService.WARNING_THRESHOLD,
      maxTagLength: TagRegistrationService.MAX_TAG_LENGTH,
      minTagLength: TagRegistrationService.MIN_TAG_LENGTH,
    }
  }
}

export default TagRegistrationService
