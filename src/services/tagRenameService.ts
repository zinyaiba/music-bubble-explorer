/**
 * タグ名称変更・統合サービス
 * タグの名称変更と統合のビジネスロジックを管理
 */

import { FirebaseService } from './firebaseService'
import { Song, Tag } from '@/types/music'

/**
 * タグ名バリデーション結果
 */
export interface TagNameValidationResult {
  valid: boolean
  error?: string
}

/**
 * タグ名称変更結果
 */
export interface TagRenameResult {
  success: boolean
  error?: string
  mergeRequired?: boolean
  targetTag?: string
}

/**
 * タグ統合結果
 */
export interface TagMergeResult {
  success: boolean
  error?: string
  affectedSongCount: number
}

/**
 * タグ名称変更・統合サービスクラス
 */
export class TagRenameService {
  private firebaseService: FirebaseService
  private songs: Song[] = []
  private tags: Tag[] = []

  constructor(firebaseService?: FirebaseService) {
    this.firebaseService = firebaseService || FirebaseService.getInstance()
  }

  /**
   * 楽曲データとタグデータを更新
   */
  public updateData(songs: Song[], tags: Tag[]): void {
    this.songs = songs
    this.tags = tags
  }

  /**
   * タグ名の検証
   * Requirements: 1.3 - 空または空白のみのタグ名を拒否
   */
  public validateTagName(name: string): TagNameValidationResult {
    // null/undefinedチェック
    if (name === null || name === undefined) {
      return {
        valid: false,
        error: 'タグ名を入力してください',
      }
    }

    // 空白文字のみで構成されているかチェック（空文字、スペース、タブ、改行など）
    const trimmedName = name.trim()
    if (trimmedName.length === 0) {
      return {
        valid: false,
        error: 'タグ名を入力してください',
      }
    }

    return { valid: true }
  }

  /**
   * 既存タグとの重複チェック
   * Requirements: 2.1 - 既存のタグ名と一致する場合を検出
   */
  public checkDuplicate(tagName: string, excludeTagName?: string): boolean {
    const normalizedName = tagName.trim()
    return this.tags.some(tag => {
      // 除外するタグ名がある場合（自分自身との比較を除外）
      if (excludeTagName && tag.name === excludeTagName) {
        return false
      }
      return tag.name === normalizedName
    })
  }

  /**
   * タグ名からタグを取得
   */
  public getTagByName(tagName: string): Tag | undefined {
    return this.tags.find(tag => tag.name === tagName)
  }

  /**
   * タグに紐づく楽曲数を取得
   */
  public getSongCountByTag(tagName: string): number {
    return this.songs.filter(song => song.tags && song.tags.includes(tagName))
      .length
  }

  /**
   * タグ名称変更（重複チェック含む）
   * Requirements: 1.2, 1.5 - タグ名を更新してFirebaseに保存
   */
  public async renameTag(
    oldName: string,
    newName: string
  ): Promise<TagRenameResult> {
    // バリデーション
    const validation = this.validateTagName(newName)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    const trimmedNewName = newName.trim()

    // 元のタグ名と同じ場合は変更なしで成功
    if (oldName === trimmedNewName) {
      return { success: true }
    }

    // 重複チェック（自分自身を除外）
    if (this.checkDuplicate(trimmedNewName, oldName)) {
      return {
        success: false,
        mergeRequired: true,
        targetTag: trimmedNewName,
      }
    }

    // 関連する楽曲のタグを更新
    const affectedSongs = this.songs.filter(
      song => song.tags && song.tags.includes(oldName)
    )

    try {
      // 各楽曲のタグを更新
      for (const song of affectedSongs) {
        const updatedTags = song.tags!.map(tag =>
          tag === oldName ? trimmedNewName : tag
        )

        const updateSuccess = await this.firebaseService.updateSong(song.id, {
          tags: updatedTags,
        })

        if (!updateSuccess) {
          return {
            success: false,
            error: '一部の楽曲の更新に失敗しました',
          }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('🏷️ TagRenameService: タグ名称変更エラー', error)
      return {
        success: false,
        error: '保存に失敗しました。ネットワーク接続を確認してください',
      }
    }
  }

  /**
   * タグ統合
   * Requirements: 2.3, 2.4 - 統合元タグの楽曲を統合先タグに移動し、統合元タグを削除
   */
  public async mergeTags(
    sourceTag: string,
    targetTag: string
  ): Promise<TagMergeResult> {
    // バリデーション
    const sourceValidation = this.validateTagName(sourceTag)
    const targetValidation = this.validateTagName(targetTag)

    if (!sourceValidation.valid || !targetValidation.valid) {
      return {
        success: false,
        error: 'タグ名が無効です',
        affectedSongCount: 0,
      }
    }

    // 統合先タグが存在するかチェック
    if (!this.checkDuplicate(targetTag)) {
      return {
        success: false,
        error: '統合先タグが見つかりません',
        affectedSongCount: 0,
      }
    }

    // 統合元タグに紐づく楽曲を取得
    const sourceSongs = this.songs.filter(
      song => song.tags && song.tags.includes(sourceTag)
    )

    if (sourceSongs.length === 0) {
      return {
        success: true,
        affectedSongCount: 0,
      }
    }

    try {
      let affectedCount = 0

      for (const song of sourceSongs) {
        // 統合元タグを削除し、統合先タグを追加（重複を避ける）
        const currentTags = song.tags || []
        const updatedTags = currentTags.filter(tag => tag !== sourceTag) // 統合元タグを削除

        // 統合先タグがまだない場合のみ追加
        if (!updatedTags.includes(targetTag)) {
          updatedTags.push(targetTag)
        }

        const updateSuccess = await this.firebaseService.updateSong(song.id, {
          tags: updatedTags,
        })

        if (!updateSuccess) {
          return {
            success: false,
            error: '一部の楽曲の更新に失敗しました',
            affectedSongCount: affectedCount,
          }
        }

        affectedCount++
      }

      return {
        success: true,
        affectedSongCount: affectedCount,
      }
    } catch (error) {
      console.error('🏷️ TagRenameService: タグ統合エラー', error)
      return {
        success: false,
        error: '保存に失敗しました。ネットワーク接続を確認してください',
        affectedSongCount: 0,
      }
    }
  }
}
