import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Song, DetailPageUrl } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { StandardLayout } from './StandardLayout'
import { AnalyticsService } from '@/services/analyticsService'
import { DetailUrlList } from './DetailUrlList'
import {
  validateTextLength,
  validateReleaseYear,
  validateReleaseDate,
  validateArtists,
  validateDetailPageUrls,
  parseCommaSeparated,
  formatCommaSeparated,
} from '@/utils/songFormValidation'

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
  // 拡張フィールド
  artists: string // カンマ区切り文字列
  releaseYear: string // 入力時は文字列、保存時に数値に変換
  releaseDate: string // 発売日（月日、MMDD形式、例: 0315）
  singleName: string
  albumName: string
  musicServiceEmbed: string // 音楽サービス埋め込みコード（Spotify、Apple Music、YouTube等のiframe）
  detailPageUrls: DetailPageUrl[] // URL配列（ラベル付き）
}

interface FormErrors {
  title?: string
  lyricists?: string
  composers?: string
  arrangers?: string
  // tags?: string // タグエラーは専用画面で処理
  artists?: string
  releaseYear?: string
  releaseDate?: string
  singleName?: string
  albumName?: string
  musicServiceEmbed?: string
  detailPageUrls?: string
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
    // 拡張フィールド
    artists: '',
    releaseYear: '',
    releaseDate: '',
    singleName: '',
    albumName: '',
    musicServiceEmbed: '',
    detailPageUrls: [],
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
  // Requirement 15.1: 編集画面での既存データ表示
  useEffect(() => {
    if (editingSong) {
      // detailPageUrlsの後方互換性対応: 文字列配列の場合はDetailPageUrl型に変換
      const detailPageUrls = editingSong.detailPageUrls
        ? editingSong.detailPageUrls.map(urlItem =>
            typeof urlItem === 'string'
              ? { url: urlItem, label: undefined }
              : urlItem
          )
        : []

      console.log('📝 Loading song for editing:', {
        songId: editingSong.id,
        releaseDate: editingSong.releaseDate,
      })

      setFormData({
        title: editingSong.title,
        lyricists: editingSong.lyricists.join(', '),
        composers: editingSong.composers.join(', '),
        arrangers: editingSong.arrangers.join(', '),
        tags: [], // タグは専用画面からのみ編集
        // 拡張フィールド
        artists: formatCommaSeparated(editingSong.artists || []),
        releaseYear: editingSong.releaseYear?.toString() || '',
        releaseDate: editingSong.releaseDate || '',
        singleName: editingSong.singleName || '',
        albumName: editingSong.albumName || '',
        musicServiceEmbed: editingSong.musicServiceEmbed || '',
        detailPageUrls,
      })

      console.log('📝 Form data set:', {
        releaseDate: editingSong.releaseDate || '',
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

  // Requirement 15.2: 入力変更の受け付け
  const handleInputChange = useCallback(
    (
      field: keyof Omit<SongFormData, 'tags' | 'detailPageUrls'>,
      value: string
    ) => {
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

  // DetailUrlList用の変更ハンドラ
  const handleDetailUrlsChange = useCallback(
    (urls: DetailPageUrl[]) => {
      setFormData(prev => ({
        ...prev,
        detailPageUrls: urls,
      }))

      if (errors.detailPageUrls) {
        setErrors(prev => ({
          ...prev,
          detailPageUrls: undefined,
        }))
      }
    },
    [errors.detailPageUrls]
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

    // 拡張フィールドのバリデーション
    // Requirement 9.3: アーティスト名の文字数制限
    const artistsValidation = validateArtists(formData.artists)
    if (!artistsValidation.isValid) {
      newErrors.artists = artistsValidation.error
    }

    // Requirement 10.3, 10.4: 発売年のバリデーション
    const releaseYearValidation = validateReleaseYear(formData.releaseYear)
    if (!releaseYearValidation.isValid) {
      newErrors.releaseYear = releaseYearValidation.error
    }

    // 発売日（月日）のバリデーション
    const releaseDateValidation = validateReleaseDate(formData.releaseDate)
    if (!releaseDateValidation.isValid) {
      newErrors.releaseDate = releaseDateValidation.error
    }

    // Requirement 11.3: 収録シングル名の文字数制限
    const singleNameValidation = validateTextLength(formData.singleName, 200)
    if (!singleNameValidation.isValid) {
      newErrors.singleName = singleNameValidation.error
    }

    // Requirement 12.3: 収録アルバム名の文字数制限
    const albumNameValidation = validateTextLength(formData.albumName, 200)
    if (!albumNameValidation.isValid) {
      newErrors.albumName = albumNameValidation.error
    }

    // 音楽サービス埋め込みコードのバリデーション
    if (formData.musicServiceEmbed.trim()) {
      const hasIframe = formData.musicServiceEmbed.includes('<iframe')
      const hasValidService =
        formData.musicServiceEmbed.includes('open.spotify.com/embed') ||
        formData.musicServiceEmbed.includes('embed.music.apple.com') ||
        formData.musicServiceEmbed.includes('youtube.com/embed')

      if (!hasIframe) {
        newErrors.musicServiceEmbed =
          'iframe形式の埋め込みコードを入力してください'
      } else if (!hasValidService) {
        newErrors.musicServiceEmbed =
          'サブスクサービスの埋め込みコードを入力してください'
      } else if (formData.musicServiceEmbed.length > 2000) {
        newErrors.musicServiceEmbed =
          '埋め込みコードが長すぎます（2000文字以内）'
      }
    }

    // Requirement 14.4, 14.7: 関連外部サイトURLのバリデーション
    const detailUrlsValidation = validateDetailPageUrls(formData.detailPageUrls)
    if (!detailUrlsValidation.isValid) {
      newErrors.detailPageUrls = detailUrlsValidation.error
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

        // Requirement 9.4: カンマ区切り入力から配列への変換
        const artistsArray = parseCommaSeparated(formData.artists)
        const releaseYearNum = formData.releaseYear.trim()
          ? parseInt(formData.releaseYear, 10)
          : undefined
        // MMDD形式でDB保存（ハイフンなし）
        const releaseDateStr = formData.releaseDate.trim() || undefined

        // 楽曲詳細ページURLから空の値を除外し、undefinedフィールドをクリーンアップ
        const detailPageUrlsFiltered = formData.detailPageUrls
          .filter(urlObj => urlObj.url.trim() !== '')
          .map(urlObj => {
            // labelがundefinedの場合は除外
            const cleaned: any = { url: urlObj.url }
            if (urlObj.label && urlObj.label.trim() !== '') {
              cleaned.label = urlObj.label.trim()
            }
            return cleaned
          })

        if (isEditMode && editingSong) {
          songToSave = {
            ...editingSong,
            title: formData.title.trim(),
            lyricists: parseCommaSeparatedString(formData.lyricists),
            composers: parseCommaSeparatedString(formData.composers),
            arrangers: parseCommaSeparatedString(formData.arrangers),
            tags: editingSong.tags || [], // 既存のタグを保持、編集は専用画面からのみ
            // 拡張フィールド
            artists: artistsArray.length > 0 ? artistsArray : undefined,
            releaseYear: releaseYearNum,
            releaseDate: releaseDateStr,
            singleName: formData.singleName.trim() || undefined,
            albumName: formData.albumName.trim() || undefined,
            // 空文字列の場合は明示的にundefinedを設定（Firebaseから削除）
            musicServiceEmbed: formData.musicServiceEmbed.trim()
              ? formData.musicServiceEmbed.trim()
              : undefined,
            detailPageUrls:
              detailPageUrlsFiltered.length > 0
                ? detailPageUrlsFiltered
                : undefined,
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
            // 拡張フィールド
            artists: artistsArray.length > 0 ? artistsArray : undefined,
            releaseYear: releaseYearNum,
            releaseDate: releaseDateStr,
            singleName: formData.singleName.trim() || undefined,
            albumName: formData.albumName.trim() || undefined,
            // 空文字列の場合は明示的にundefinedを設定
            musicServiceEmbed: formData.musicServiceEmbed.trim()
              ? formData.musicServiceEmbed.trim()
              : undefined,
            detailPageUrls:
              detailPageUrlsFiltered.length > 0
                ? detailPageUrlsFiltered
                : undefined,
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
        analyticsService.logSongRegistration(songToSave.title, {
          artist: songToSave.artists?.join(', '),
          composer: songToSave.composers?.join(', '),
          lyricist: songToSave.lyricists?.join(', '),
          arranger: songToSave.arrangers?.join(', '),
          tags: songToSave.tags,
          category: songToSave.releaseYear
            ? `${songToSave.releaseYear}年代`
            : undefined,
        })

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

          {/* 拡張フィールド */}
          {/* Requirement 9.1-9.4: アーティスト名入力 */}
          <div className="form-group">
            <label htmlFor="artists">アーティスト</label>
            <input
              id="artists"
              type="text"
              value={formData.artists}
              onChange={e => handleInputChange('artists', e.target.value)}
              placeholder="アーティスト名を入力（複数の場合はカンマ区切り）"
              className={errors.artists ? 'error' : ''}
              maxLength={200}
            />
            {errors.artists && (
              <div className="error-message">{errors.artists}</div>
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

          {/* Requirement 10.1-10.4: 発売年入力 */}
          <div className="form-group">
            <label htmlFor="releaseYear">発売年</label>
            <input
              id="releaseYear"
              type="number"
              value={formData.releaseYear}
              onChange={e => handleInputChange('releaseYear', e.target.value)}
              placeholder="例: 2024"
              className={errors.releaseYear ? 'error' : ''}
              min={1000}
              max={9999}
            />
            {errors.releaseYear && (
              <div className="error-message">{errors.releaseYear}</div>
            )}
          </div>

          {/* 発売日（月日）入力 */}
          <div className="form-group">
            <label htmlFor="releaseDate">発売日（月日）</label>
            <input
              id="releaseDate"
              type="text"
              value={formData.releaseDate}
              onChange={e => handleInputChange('releaseDate', e.target.value)}
              placeholder="例: 0315"
              className={errors.releaseDate ? 'error' : ''}
              maxLength={4}
              inputMode="numeric"
            />
            {errors.releaseDate && (
              <div className="error-message">{errors.releaseDate}</div>
            )}
            <div className="help-text">
              MMDD形式で入力してください（例: 0315は3月15日）
            </div>
          </div>

          {/* Requirement 11.1-11.3: 収録シングル名入力 */}
          <div className="form-group">
            <label htmlFor="singleName">収録シングル</label>
            <input
              id="singleName"
              type="text"
              value={formData.singleName}
              onChange={e => handleInputChange('singleName', e.target.value)}
              placeholder="収録シングル名を入力"
              className={errors.singleName ? 'error' : ''}
              maxLength={200}
            />
            {errors.singleName && (
              <div className="error-message">{errors.singleName}</div>
            )}
          </div>

          {/* Requirement 12.1-12.3: 収録アルバム名入力 */}
          <div className="form-group">
            <label htmlFor="albumName">収録アルバム</label>
            <input
              id="albumName"
              type="text"
              value={formData.albumName}
              onChange={e => handleInputChange('albumName', e.target.value)}
              placeholder="収録アルバム名を入力"
              className={errors.albumName ? 'error' : ''}
              maxLength={200}
            />
            {errors.albumName && (
              <div className="error-message">{errors.albumName}</div>
            )}
          </div>

          {/* 音楽サービス埋め込みコード入力とプレビュー */}
          <div className="form-group">
            <label htmlFor="musicServiceEmbed">
              音楽サービス埋め込みコード
            </label>
            <textarea
              id="musicServiceEmbed"
              value={formData.musicServiceEmbed}
              onChange={e =>
                handleInputChange('musicServiceEmbed', e.target.value)
              }
              placeholder='Spotify: <iframe src="https://open.spotify.com/embed/track/..." ...></iframe>&#10;Apple Music: <iframe src="https://embed.music.apple.com/..." ...></iframe>&#10;YouTube: <iframe src="https://www.youtube.com/embed/..." ...></iframe>'
              className={errors.musicServiceEmbed ? 'error' : ''}
              maxLength={2000}
              rows={4}
              style={{ fontFamily: 'monospace', fontSize: '0.9em' }}
            />
            {errors.musicServiceEmbed && (
              <div className="error-message">{errors.musicServiceEmbed}</div>
            )}
            <div className="help-text">
              サブスクサービスの埋め込みコードを入力してください
              <br />
              •「共有」→「埋め込みコード」
            </div>
          </div>

          {/* 音楽サービス埋め込みプレビュー */}
          {formData.musicServiceEmbed.trim() && !errors.musicServiceEmbed && (
            <div className="form-group">
              <label>プレビュー</label>
              <div
                style={{ flex: 1 }}
                dangerouslySetInnerHTML={{ __html: formData.musicServiceEmbed }}
              />
            </div>
          )}

          {/* Requirement 14.1-14.7: 関連外部サイトURL入力リスト */}
          <div
            className="form-group detail-urls-group"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: '2rem',
            }}
          >
            <label htmlFor="detailPageUrls">関連外部サイトURL</label>
            <DetailUrlList
              urls={formData.detailPageUrls}
              onChange={handleDetailUrlsChange}
              maxUrls={10}
              disabled={isSubmitting}
            />
            {errors.detailPageUrls && (
              <div className="error-message">{errors.detailPageUrls}</div>
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
