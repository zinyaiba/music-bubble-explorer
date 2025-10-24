import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'

import TagInput from './TagInput'
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
  tags?: string
  general?: string
}

/**
 * シンプルな楽曲登録フォームコンポーネント
 */
export const SongRegistrationForm: React.FC<SongRegistrationFormProps> = ({
  onSongAdded,
  onClose,
  editingSong
}) => {
  // Form state
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    lyricists: '',
    composers: '',
    arrangers: '',
    tags: []
  })

  const [existingTags, setExistingTags] = useState<string[]>([])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const isEditMode = Boolean(editingSong)

  // 既存タグを読み込み
  useEffect(() => {
    const tags = DataManager.getAllTags()
    setExistingTags(tags)
  }, [])

  // 編集モード時のフォームデータ初期化
  useEffect(() => {
    if (editingSong) {
      setFormData({
        title: editingSong.title,
        lyricists: editingSong.lyricists.join(', '),
        composers: editingSong.composers.join(', '),
        arrangers: editingSong.arrangers.join(', '),
        tags: editingSong.tags || []
      })
    }
  }, [editingSong])

  // フォーカス管理
  useEffect(() => {
    if (titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [])

  const handleInputChange = useCallback((field: keyof Omit<SongFormData, 'tags'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }, [errors])

  const handleTagsChange = useCallback((tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))

    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: undefined
      }))
    }
  }, [errors.tags])

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

    if (formData.tags.length > 10) {
      newErrors.tags = 'タグは10個以内で入力してください'
    }

    const invalidTags = formData.tags.filter(tag => tag.length > 50)
    if (invalidTags.length > 0) {
      newErrors.tags = 'タグは50文字以内で入力してください'
    }

    if (!formData.lyricists.trim() && !formData.composers.trim() && !formData.arrangers.trim()) {
      newErrors.general = '作詞家、作曲家、編曲家のうち少なくとも一つは入力してください'
    }

    return newErrors
  }, [formData])

  const parseCommaSeparatedString = useCallback((str: string): string[] => {
    return str
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      console.log('🎵 Starting song save process...', { isEditMode, formData })
      let songToSave: Song

      if (isEditMode && editingSong) {
        songToSave = {
          ...editingSong,
          title: formData.title.trim(),
          lyricists: parseCommaSeparatedString(formData.lyricists),
          composers: parseCommaSeparatedString(formData.composers),
          arrangers: parseCommaSeparatedString(formData.arrangers),
          tags: formData.tags
        }

        console.log('🎵 Updating existing song:', songToSave)
        const localUpdateSuccess = await DataManager.updateSong(songToSave)
        console.log('🎵 Update result:', localUpdateSuccess)

        if (!localUpdateSuccess) {
          throw new Error('楽曲の更新に失敗しました')
        }
      } else {
        const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        songToSave = {
          id: songId,
          title: formData.title.trim(),
          lyricists: parseCommaSeparatedString(formData.lyricists),
          composers: parseCommaSeparatedString(formData.composers),
          arrangers: parseCommaSeparatedString(formData.arrangers),
          tags: formData.tags
        }

        console.log('🎵 Saving new song:', songToSave)
        const saveSuccess = await DataManager.saveSong(songToSave)
        console.log('🎵 Save result:', saveSuccess)

        if (!saveSuccess) {
          throw new Error('楽曲の保存に失敗しました')
        }
      }

      const musicService = MusicDataService.getInstance()
      musicService.clearCache()

      setIsSuccess(true)
      onSongAdded(songToSave)

      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `楽曲の${isEditMode ? '更新' : '登録'}に失敗しました`
      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, parseCommaSeparatedString, onSongAdded, onClose, isEditMode, editingSong])

  if (isSuccess) {
    return (
      <div className="success-message">
        <div className="success-icon">✨</div>
        <div className="success-text">楽曲が正常に{isEditMode ? '更新' : '登録'}されました！</div>
        <div className="success-subtext">シャボン玉に反映されます</div>
      </div>
    )
  }



  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`song-form ${editingSong ? 'song-form--editing' : 'song-form--registration'}`}
      noValidate>
      <div className="form-group">
        <label htmlFor="title" className="required">
          楽曲名
        </label>
        <input
          ref={titleInputRef}
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
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
          onChange={(e) => handleInputChange('lyricists', e.target.value)}
          placeholder="作詞家名を入力（複数の場合はカンマ区切り）"
          className={errors.lyricists ? 'error' : ''}
          maxLength={200}
        />
        {errors.lyricists && (
          <div className="error-message">{errors.lyricists}</div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="composers">作曲家</label>
        <input
          id="composers"
          type="text"
          value={formData.composers}
          onChange={(e) => handleInputChange('composers', e.target.value)}
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
          onChange={(e) => handleInputChange('arrangers', e.target.value)}
          placeholder="編曲家名を入力（複数の場合はカンマ区切り）"
          className={errors.arrangers ? 'error' : ''}
          maxLength={200}
        />
        {errors.arrangers && (
          <div className="error-message">{errors.arrangers}</div>
        )}
      </div>

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
          ) : (
            isEditMode ? '楽曲を更新' : '楽曲を登録'
          )}
        </button>
      </div>
    </form>
  )
}

export default SongRegistrationForm