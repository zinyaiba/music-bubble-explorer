import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { StandardLayout } from './StandardLayout'
import { AnalyticsService } from '@/services/analyticsService'

// import TagInput from './TagInput' // タグ編集は専用画面からのみ
import './SongRegistrationForm.css'

interface SongRegistrationFormProps {
  onSongAdded: (song: Song) => void
  onClose: () => void
  isVisible: boolean
  editingSong?: Song | null
}

interface SongFormData {
  title: string
  lyricists: string
  composers: string
  arrangers: string
  tags: string[]
}

interface FormErrors {
  title?: string
  lyricists?: string
  composers?: string
  arrangers?: string
  // tags?: string // タグエラーは専用画面で処理
  general?: string
}

/**
 * シンプルな楽曲登録フォームコンポーネント
 * Updated to use StandardLayout template for full-screen consistency
 */
export const SongRegistrationForm: React.FC<SongRegistrationFormProps> = ({
  onSongAdded,
  onClose,
  isVisible,
  editingSong,
}) => {
  // Form state
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    lyricists: '',
    composers: '',
    arrangers: '',
    tags: [], // タグは専用画面からのみ編集
  })

  // const [existingTags, setExistingTags] = useState<string[]>([]) // タグ編集は専用画面からのみ
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(editingSong)

  // 既存タグの読み込みは専用画面で実施
  // useEffect(() => {
  //   const tags = DataManager.getAllTags()
  //   setExistingTags(tags)
  // }, [])

  // 編集モード時のフォームデータ初期化
  useEffect(() => {
    if (editingSong) {
      setFormData({
        title: editingSong.title,
        lyricists: editingSong.lyricists.join(', '),
        composers: editingSong.composers.join(', '),
        arrangers: editingSong.arrangers.join(', '),
        tags: [], // タグは専用画面からのみ編集
      })
    }
  }, [editingSong])

  // フォーカス管理
  useEffect(() => {
    if (isVisible && titleInputRef.current) {
      // requestAnimationFrameを使用して次のフレームでフォーカス
      const rafId = requestAnimationFrame(() => {
        titleInputRef.current?.focus()
      })
      return () => cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  const handleInputChange = useCallback(
    (field: keyof Omit<SongFormData, 'tags'>, value: string) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))

      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: undefined,
        }))
      }
    },
    [errors]
  )

  // タグ変更ハンドラーは専用画面で実施
  // const handleTagsChange = useCallback((tags: string[]) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     tags
  //   }))

  //   if (errors.tags) {
  //     setErrors(prev => ({
  //       ...prev,
  //       tags: undefined
  //     }))
  //   }
  // }, [errors.tags])

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = '楽曲名は必須です'
    } else if (formData.title.trim().length > 100) {
      newErrors.title = '楽曲名は100文字以内で入力してください'
    }

    if (formData.lyricists.trim() && formData.lyricists.trim().length > 200) {
      newErrors.lyricists = '作詞家は200文字以内で入力してください'
    }

    if (formData.composers.trim() && formData.composers.trim().length > 200) {
      newErrors.composers = '作曲家は200文字以内で入力してください'
    }

    if (formData.arrangers.trim() && formData.arrangers.trim().length > 200) {
      newErrors.arrangers = '編曲家は200文字以内で入力してください'
    }

    // タグのバリデーションは専用画面で実施

    if (
      !formData.lyricists.trim() &&
      !formData.composers.trim() &&
      !formData.arrangers.trim()
    ) {
      newErrors.general =
        '作詞家、作曲家、編曲家のうち少なくとも一つは入力してください'
    }

    return newErrors
  }, [formData])

  const parseCommaSeparatedString = useCallback((str: string): string[] => {
    return str
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const validationErrors = validateForm()
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      setIsSubmitting(true)
      setErrors({})

      try {
        console.log('🎵 Starting song save process...', {
          isEditMode,
          formData,
        })
        let songToSave: Song

        if (isEditMode && editingSong) {
          songToSave = {
            ...editingSong,
            title: formData.title.trim(),
            lyricists: parseCommaSeparatedString(formData.lyricists),
            composers: parseCommaSeparatedString(formData.composers),
            arrangers: parseCommaSeparatedString(formData.arrangers),
            tags: editingSong.tags || [], // 既存のタグを保持、編集は専用画面からのみ
          }

          console.log('🎵 Updating existing song:', songToSave)
          const localUpdateSuccess = await DataManager.updateSong(songToSave)
          console.log('🎵 Update result:', localUpdateSuccess)

          if (!localUpdateSuccess) {
            throw new Error('楽曲の更新に失敗しました')
          }
        } else {
          const tempId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          songToSave = {
            id: tempId,
            title: formData.title.trim(),
            lyricists: parseCommaSeparatedString(formData.lyricists),
            composers: parseCommaSeparatedString(formData.composers),
            arrangers: parseCommaSeparatedString(formData.arrangers),
            tags: [], // 新規楽曲のタグは空、専用画面からのみ追加可能
          }

          console.log('🎵 Saving new song:', songToSave)
          const firebaseId = await DataManager.saveSong(songToSave)
          console.log('🎵 Save result - Firebase ID:', firebaseId)

          if (!firebaseId) {
            throw new Error('楽曲の保存に失敗しました')
          }

          // FirebaseのIDを使用して楽曲オブジェクトを更新
          songToSave = {
            ...songToSave,
            id: firebaseId,
          }
          console.log('🎵 Updated song with Firebase ID:', songToSave)
        }

        const musicService = MusicDataService.getInstance()
        musicService.clearCache()

        // Analytics tracking
        const analyticsService = AnalyticsService.getInstance()
        analyticsService.logSongRegistration(
          songToSave.title,
          (songToSave.tags?.length ?? 0) > 0
        )

        setIsSuccess(true)
        onSongAdded(songToSave)

        setTimeout(() => {
          setIsSuccess(false)
          onClose()
        }, 2000)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `楽曲の${isEditMode ? '更新' : '登録'}に失敗しました`
        setErrors({ general: errorMessage })
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      formData,
      validateForm,
      parseCommaSeparatedString,
      onSongAdded,
      onClose,
      isEditMode,
      editingSong,
    ]
  )

  return (
    <StandardLayout
      isVisible={isVisible}
      onClose={onClose}
      title={isEditMode ? '編集中' : '🎵 楽曲登録'}
      size="standard"
      mobileOptimized={true}
    >
      {isSuccess ? (
        <div className="success-message">
          <div className="success-icon">✨</div>
          <div className="success-text">
            楽曲が正常に{isEditMode ? '更新' : '登録'}されました！
          </div>
          <div className="success-subtext">シャボン玉に反映されます</div>
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`song-form ${editingSong ? 'song-form--editing' : 'song-form--registration'}`}
          noValidate
        >
          <div className="form-group">
            <label htmlFor="title" className="required">
              楽曲名
            </label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="楽曲名を入力してください"
              className={errors.title ? 'error' : ''}
              maxLength={100}
              required
            />
            {errors.title && (
              <div className="error-message">{errors.title}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lyricists">作詞家</label>
            <input
              id="lyricists"
              type="text"
              value={formData.lyricists}
              onChange={e => handleInputChange('lyricists', e.target.value)}
              placeholder="作詞家名を入力（複数の場合はカンマ区切り）"
              className={errors.lyricists ? 'error' : ''}
              maxLength={200}
            />
            {errors.lyricists && (
              <div className="error-message">{errors.lyricists}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="composers">作曲</label>
            <input
              id="composers"
              type="text"
              value={formData.composers}
              onChange={e => handleInputChange('composers', e.target.value)}
              placeholder="作曲家名を入力（複数の場合はカンマ区切り）"
              className={errors.composers ? 'error' : ''}
              maxLength={200}
            />
            {errors.composers && (
              <div className="error-message">{errors.composers}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="arrangers">編曲家</label>
            <input
              id="arrangers"
              type="text"
              value={formData.arrangers}
              onChange={e => handleInputChange('arrangers', e.target.value)}
              placeholder="編曲家名を入力（複数の場合はカンマ区切り）"
              className={errors.arrangers ? 'error' : ''}
              maxLength={200}
            />
            {errors.arrangers && (
              <div className="error-message">{errors.arrangers}</div>
            )}
          </div>

          {/* タグ入力機能は専用のタグ登録画面からのみ利用可能 */}
          {/* 
      <div className="form-group">
        <label htmlFor="tags">タグ</label>
        <TagInput
          id="tags"
          tags={formData.tags}
          onTagsChange={handleTagsChange}
          existingTags={existingTags}
          maxTags={10}
          placeholder="タグを入力してください（例: バラード, アニメ, 感動）"
          disabled={isSubmitting}
        />
        {errors.tags && (
          <div className="error-message">{errors.tags}</div>
        )}
        <div className="help-text">
          ジャンルやテーマを個別に入力してください。既存のタグは候補として表示されます。
        </div>
      </div>
      */}

          {errors.general && (
            <div className="general-error">{errors.general}</div>
          )}

          <div className="button-group">
            <button
              type="submit"
              disabled={isSubmitting}
              className="primary-button"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  {isEditMode ? '更新中...' : '登録中...'}
                </>
              ) : isEditMode ? (
                '楽曲を更新'
              ) : (
                '楽曲を登録'
              )}
            </button>
          </div>
        </form>
      )}
    </StandardLayout>
  )
}

export default SongRegistrationForm
