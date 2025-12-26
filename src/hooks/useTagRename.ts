/**
 * タグ名称変更・統合のUI状態管理フック
 * Requirements: 1.1, 1.4, 2.1, 2.5
 */

import { useState, useCallback, useMemo } from 'react'
import { Song, Tag } from '@/types/music'
import {
  TagRenameService,
  TagRenameResult,
  TagMergeResult,
} from '@/services/tagRenameService'
import { FirebaseService } from '@/services/firebaseService'

/**
 * useTagRenameフックの戻り値の型定義
 */
export interface UseTagRenameReturn {
  // 編集状態
  editingTagId: string | null
  editingValue: string

  // 統合ダイアログ状態
  mergeDialogOpen: boolean
  mergeSourceTag: string | null
  mergeTargetTag: string | null
  sourceSongCount: number
  targetSongCount: number

  // 操作状態
  isLoading: boolean
  error: string | null
  successMessage: string | null

  // アクション
  startEditing: (tagId: string, tagName: string) => void
  cancelEditing: () => void
  setEditingValue: (value: string) => void
  submitRename: (newName: string) => Promise<void>
  confirmMerge: () => Promise<void>
  cancelMerge: () => void
  clearMessages: () => void
}

/**
 * useTagRenameフックのオプション
 */
export interface UseTagRenameOptions {
  songs: Song[]
  tags: Tag[]
  onSuccess?: () => void
  firebaseService?: FirebaseService
}

/**
 * タグ名称変更・統合のUI状態管理カスタムフック
 *
 * @param options - フックのオプション
 * @returns UseTagRenameReturn - フックの戻り値
 */
export const useTagRename = (
  options: UseTagRenameOptions
): UseTagRenameReturn => {
  const { songs, tags, onSuccess, firebaseService } = options

  // 編集状態
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [originalTagName, setOriginalTagName] = useState<string>('')

  // 統合ダイアログ状態
  const [mergeDialogOpen, setMergeDialogOpen] = useState<boolean>(false)
  const [mergeSourceTag, setMergeSourceTag] = useState<string | null>(null)
  const [mergeTargetTag, setMergeTargetTag] = useState<string | null>(null)

  // 操作状態
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // TagRenameServiceのインスタンスを作成・更新
  const tagRenameService = useMemo(() => {
    const service = new TagRenameService(firebaseService)
    service.updateData(songs, tags)
    return service
  }, [songs, tags, firebaseService])

  // 統合元タグの楽曲数を計算
  const sourceSongCount = useMemo(() => {
    if (!mergeSourceTag) return 0
    return tagRenameService.getSongCountByTag(mergeSourceTag)
  }, [mergeSourceTag, tagRenameService])

  // 統合先タグの楽曲数を計算
  const targetSongCount = useMemo(() => {
    if (!mergeTargetTag) return 0
    return tagRenameService.getSongCountByTag(mergeTargetTag)
  }, [mergeTargetTag, tagRenameService])

  /**
   * 編集を開始
   * Requirements: 1.1 - 編集ボタンをクリックした時にインライン編集フィールドを表示
   */
  const startEditing = useCallback((tagId: string, tagName: string) => {
    setEditingTagId(tagId)
    setEditingValue(tagName)
    setOriginalTagName(tagName)
    setError(null)
    setSuccessMessage(null)
  }, [])

  /**
   * 編集をキャンセル
   * Requirements: 1.4 - キャンセル時に変更なしで元のタグ名を復元
   */
  const cancelEditing = useCallback(() => {
    setEditingTagId(null)
    setEditingValue('')
    setOriginalTagName('')
    setError(null)
  }, [])

  /**
   * メッセージをクリア
   */
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  /**
   * タグ名称変更を送信
   * Requirements: 1.2, 1.3, 2.1 - 名称変更の実行と重複時の統合ダイアログ表示
   */
  const submitRename = useCallback(
    async (newName: string): Promise<void> => {
      if (!originalTagName) {
        setError('編集中のタグがありません')
        return
      }

      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      try {
        const result: TagRenameResult = await tagRenameService.renameTag(
          originalTagName,
          newName
        )

        if (result.success) {
          // 成功時
          setSuccessMessage('タグ名を変更しました')
          setEditingTagId(null)
          setEditingValue('')
          setOriginalTagName('')
          onSuccess?.()
        } else if (result.mergeRequired && result.targetTag) {
          // 統合が必要な場合 - Requirements: 2.1
          setMergeSourceTag(originalTagName)
          setMergeTargetTag(result.targetTag)
          setMergeDialogOpen(true)
        } else {
          // エラー時 - Requirements: 1.3
          setError(result.error || 'タグ名の変更に失敗しました')
        }
      } catch (err) {
        console.error('🏷️ useTagRename: 名称変更エラー', err)
        setError('保存に失敗しました。ネットワーク接続を確認してください')
      } finally {
        setIsLoading(false)
      }
    },
    [originalTagName, tagRenameService, onSuccess]
  )

  /**
   * タグ統合を確認
   * Requirements: 2.3, 2.4 - 統合操作の実行
   */
  const confirmMerge = useCallback(async (): Promise<void> => {
    if (!mergeSourceTag || !mergeTargetTag) {
      setError('統合するタグが指定されていません')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result: TagMergeResult = await tagRenameService.mergeTags(
        mergeSourceTag,
        mergeTargetTag
      )

      if (result.success) {
        setSuccessMessage(
          `タグを統合しました（${result.affectedSongCount}曲が移動）`
        )
        setMergeDialogOpen(false)
        setMergeSourceTag(null)
        setMergeTargetTag(null)
        setEditingTagId(null)
        setEditingValue('')
        setOriginalTagName('')
        onSuccess?.()
      } else {
        setError(result.error || 'タグの統合に失敗しました')
      }
    } catch (err) {
      console.error('🏷️ useTagRename: 統合エラー', err)
      setError('保存に失敗しました。ネットワーク接続を確認してください')
    } finally {
      setIsLoading(false)
    }
  }, [mergeSourceTag, mergeTargetTag, tagRenameService, onSuccess])

  /**
   * 統合をキャンセル
   * Requirements: 2.5 - キャンセル時に両方のタグを変更せずにダイアログを閉じる
   */
  const cancelMerge = useCallback(() => {
    setMergeDialogOpen(false)
    setMergeSourceTag(null)
    setMergeTargetTag(null)
    // 編集状態は維持（ユーザーが別の名前を入力できるように）
  }, [])

  return {
    // 編集状態
    editingTagId,
    editingValue,

    // 統合ダイアログ状態
    mergeDialogOpen,
    mergeSourceTag,
    mergeTargetTag,
    sourceSongCount,
    targetSongCount,

    // 操作状態
    isLoading,
    error,
    successMessage,

    // アクション
    startEditing,
    cancelEditing,
    setEditingValue,
    submitRename,
    confirmMerge,
    cancelMerge,
    clearMessages,
  }
}

export default useTagRename
