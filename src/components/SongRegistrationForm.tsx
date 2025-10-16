import React, { useState, useCallback, useRef, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { SharedDataService } from '@/services/sharedDataService'
// ErrorHandler import removed - using simple error handling
import TagInput from './TagInput'

interface SongRegistrationFormProps {
  onSongAdded: (song: Song) => void
  onClose: () => void
  isVisible: boolean
  id?: string
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
 * 楽曲登録フォームコンポーネント
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const SongRegistrationForm: React.FC<SongRegistrationFormProps> = React.memo(({
  onSongAdded,
  onClose,
  isVisible,
  id,
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

  // 既存タグの取得
  const [existingTags, setExistingTags] = useState<string[]>([])

  // 既存タグを読み込み
  useEffect(() => {
    const loadExistingTags = () => {
      const tags = DataManager.getAllTags()
      setExistingTags(tags)
    }
    
    loadExistingTags()
  }, [])

  // 編集モードかどうかを判定
  const isEditMode = Boolean(editingSong)

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Refs for form elements
  const formRef = useRef<HTMLFormElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  /**
   * フォームデータの更新
   */
  const handleInputChange = useCallback((field: keyof Omit<SongFormData, 'tags'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }, [errors])

  /**
   * タグの更新
   */
  const handleTagsChange = useCallback((tags: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags
    }))

    // Clear tags error when user changes tags
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: undefined
      }))
    }
  }, [errors.tags])

  /**
   * フォームバリデーション
   */
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    // 楽曲名の検証
    if (!formData.title.trim()) {
      newErrors.title = '楽曲名は必須です'
    } else if (formData.title.trim().length < 1) {
      newErrors.title = '楽曲名を入力してください'
    } else if (formData.title.trim().length > 100) {
      newErrors.title = '楽曲名は100文字以内で入力してください'
    }

    // 作詞家の検証（任意だが、入力された場合は検証）
    if (formData.lyricists.trim() && formData.lyricists.trim().length > 200) {
      newErrors.lyricists = '作詞家は200文字以内で入力してください'
    }

    // 作曲家の検証（任意だが、入力された場合は検証）
    if (formData.composers.trim() && formData.composers.trim().length > 200) {
      newErrors.composers = '作曲家は200文字以内で入力してください'
    }

    // 編曲家の検証（任意だが、入力された場合は検証）
    if (formData.arrangers.trim() && formData.arrangers.trim().length > 200) {
      newErrors.arrangers = '編曲家は200文字以内で入力してください'
    }

    // タグの検証（任意だが、入力された場合は検証）
    if (formData.tags.length > 10) {
      newErrors.tags = 'タグは10個以内で入力してください'
    }
    
    // 各タグの長さをチェック
    const invalidTags = formData.tags.filter(tag => tag.length > 50)
    if (invalidTags.length > 0) {
      newErrors.tags = 'タグは50文字以内で入力してください'
    }

    // 少なくとも一つの人物情報が必要
    if (!formData.lyricists.trim() && !formData.composers.trim() && !formData.arrangers.trim()) {
      newErrors.general = '作詞家、作曲家、編曲家のうち少なくとも一つは入力してください'
    }

    return newErrors
  }, [formData])

  /**
   * カンマ区切り文字列を配列に変換（空文字列を除去）
   */
  const parseCommaSeparatedString = useCallback((str: string): string[] => {
    return str
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0)
  }, [])

  /**
   * フォーム送信処理
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション実行
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      let songToSave: Song

      if (isEditMode && editingSong) {
        // 編集モード: 既存の楽曲を更新
        songToSave = {
          ...editingSong,
          title: formData.title.trim(),
          lyricists: parseCommaSeparatedString(formData.lyricists),
          composers: parseCommaSeparatedString(formData.composers),
          arrangers: parseCommaSeparatedString(formData.arrangers),
          tags: formData.tags
        }

        // Firebaseで更新を試行
        console.log('🔄 Updating song in Firebase:', songToSave.title)
        try {
          const { FirebaseService } = await import('@/services/firebaseService')
          const firebaseService = FirebaseService.getInstance()
          
          const isConnected = await firebaseService.checkConnection()
          if (isConnected) {
            const updateSuccess = await firebaseService.updateSong(songToSave.id, songToSave)
            if (!updateSuccess) {
              console.warn('⚠️ Firebase update failed, falling back to local storage')
            } else {
              console.log('🔥 Song updated in Firebase successfully')
            }
          }
        } catch (firebaseError) {
          console.warn('⚠️ Firebase update error:', firebaseError)
        }

        // ローカルストレージも更新（バックアップとして）
        const localUpdateSuccess = DataManager.updateSong(songToSave)
        
        if (!localUpdateSuccess) {
          throw new Error('楽曲の更新に失敗しました')
        }
      } else {
        // 新規作成モード: 新しい楽曲を作成
        const songId = `song-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        songToSave = {
          id: songId,
          title: formData.title.trim(),
          lyricists: parseCommaSeparatedString(formData.lyricists),
          composers: parseCommaSeparatedString(formData.composers),
          arrangers: parseCommaSeparatedString(formData.arrangers),
          tags: formData.tags
        }

        // Firebaseに保存
        console.log('🔥 Attempting to save song to Firebase:', songToSave)
        try {
          const { FirebaseService } = await import('@/services/firebaseService')
          const firebaseService = FirebaseService.getInstance()
          
          // 接続チェック
          const isConnected = await firebaseService.checkConnection()
          console.log('🔥 Firebase connection status:', isConnected)
          
          if (!isConnected) {
            throw new Error('Firebase connection failed')
          }
          
          const firebaseId = await firebaseService.addSong(songToSave)
          
          if (firebaseId) {
            console.log('🔥 Song saved to Firebase with ID:', firebaseId)
            // Firebase IDで楽曲を更新
            songToSave.id = firebaseId
          } else {
            console.warn('⚠️ Firebase save returned null, falling back to local storage')
            throw new Error('Firebase save returned null')
          }
        } catch (firebaseError) {
          console.error('⚠️ Firebase save error, falling back to local storage:', firebaseError)
        }

        // ローカルデータにも保存（バックアップとして）
        const saveSuccess = DataManager.saveSong(songToSave)
        
        if (!saveSuccess) {
          throw new Error('楽曲の保存に失敗しました')
        }

        // 共有データサービスにも保存
        try {
          const sharedDataService = SharedDataService.getInstance()
          await sharedDataService.addSongToShared(songToSave)
          console.log('✅ Song also saved to shared database')
        } catch (sharedError) {
          console.warn('⚠️ Failed to save to shared database:', sharedError)
          // 共有保存の失敗はエラーとしない（ローカル保存は成功している）
        }
      }

      // MusicDataServiceを更新（キャッシュクリア）
      const musicService = MusicDataService.getInstance()
      musicService.clearCache()

      // 成功状態を表示
      setIsSuccess(true)

      // 親コンポーネントに通知
      onSongAdded(songToSave)

      // フォームをリセット
      setTimeout(() => {
        resetForm()
        setIsSuccess(false)
        onClose()
      }, 2000)

      console.log(`Song ${isEditMode ? 'updated' : 'registered'} successfully:`, songToSave)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `楽曲の${isEditMode ? '更新' : '登録'}に失敗しました`
      setErrors({ general: errorMessage })
      
      console.error('Song registration error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateForm, parseCommaSeparatedString, onSongAdded, onClose, isEditMode, editingSong])

  /**
   * フォームリセット
   */
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      lyricists: '',
      composers: '',
      arrangers: '',
      tags: []
    })
    setErrors({})
    setIsSuccess(false)
  }, [])

  /**
   * フォームを閉じる
   */
  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  /**
   * 背景クリックでフォームを閉じる
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  /**
   * キーボードナビゲーション
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleClose])

  /**
   * 編集モード時のフォームデータ初期化
   */
  useEffect(() => {
    if (isVisible && editingSong) {
      setFormData({
        title: editingSong.title,
        lyricists: editingSong.lyricists.join(', '),
        composers: editingSong.composers.join(', '),
        arrangers: editingSong.arrangers.join(', '),
        tags: editingSong.tags || []
      })
    } else if (isVisible && !editingSong) {
      // 新規作成モードの場合はフォームをリセット
      setFormData({
        title: '',
        lyricists: '',
        composers: '',
        arrangers: '',
        tags: []
      })
    }
  }, [isVisible, editingSong])

  /**
   * フォーカス管理
   */
  useEffect(() => {
    if (isVisible && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 100)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <FormOverlay 
      id={id}
      $isVisible={isVisible} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <FormContainer $isVisible={isVisible}>
        <FormHeader>
          <FormTitle id="form-title">🎵 {isEditMode ? '楽曲編集' : '楽曲登録'}</FormTitle>
          <CloseButton 
            type="button"
            onClick={handleClose}
            aria-label="フォームを閉じる"
            title="フォームを閉じる (ESCキー)"
          >
            ×
          </CloseButton>
        </FormHeader>

        <FormBody>
          {isSuccess ? (
            <SuccessMessage>
              <SuccessIcon>✨</SuccessIcon>
              <SuccessText>楽曲が正常に{isEditMode ? '更新' : '登録'}されました！</SuccessText>
              <SuccessSubText>シャボン玉に反映されます</SuccessSubText>
            </SuccessMessage>
          ) : (
            <StyledForm ref={formRef} onSubmit={handleSubmit} noValidate>
              {/* 楽曲名 */}
              <FormGroup>
                <Label htmlFor="title" $required>
                  楽曲名
                </Label>
                <Input
                  ref={titleInputRef}
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="楽曲名を入力してください"
                  $hasError={!!errors.title}
                  maxLength={100}
                  required
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {errors.title && (
                  <ErrorMessage id="title-error" role="alert">
                    {errors.title}
                  </ErrorMessage>
                )}
              </FormGroup>

              {/* 作詞家 */}
              <FormGroup>
                <Label htmlFor="lyricists">
                  作詞家
                </Label>
                <Input
                  id="lyricists"
                  type="text"
                  value={formData.lyricists}
                  onChange={(e) => handleInputChange('lyricists', e.target.value)}
                  placeholder="作詞家名を入力（複数の場合はカンマ区切り）"
                  $hasError={!!errors.lyricists}
                  maxLength={200}
                  aria-describedby={errors.lyricists ? 'lyricists-error' : undefined}
                />
                {errors.lyricists && (
                  <ErrorMessage id="lyricists-error" role="alert">
                    {errors.lyricists}
                  </ErrorMessage>
                )}
              </FormGroup>

              {/* 作曲家 */}
              <FormGroup>
                <Label htmlFor="composers">
                  作曲家
                </Label>
                <Input
                  id="composers"
                  type="text"
                  value={formData.composers}
                  onChange={(e) => handleInputChange('composers', e.target.value)}
                  placeholder="作曲家名を入力（複数の場合はカンマ区切り）"
                  $hasError={!!errors.composers}
                  maxLength={200}
                  aria-describedby={errors.composers ? 'composers-error' : undefined}
                />
                {errors.composers && (
                  <ErrorMessage id="composers-error" role="alert">
                    {errors.composers}
                  </ErrorMessage>
                )}
              </FormGroup>

              {/* 編曲家 */}
              <FormGroup>
                <Label htmlFor="arrangers">
                  編曲家
                </Label>
                <Input
                  id="arrangers"
                  type="text"
                  value={formData.arrangers}
                  onChange={(e) => handleInputChange('arrangers', e.target.value)}
                  placeholder="編曲家名を入力（複数の場合はカンマ区切り）"
                  $hasError={!!errors.arrangers}
                  maxLength={200}
                  aria-describedby={errors.arrangers ? 'arrangers-error' : undefined}
                />
                {errors.arrangers && (
                  <ErrorMessage id="arrangers-error" role="alert">
                    {errors.arrangers}
                  </ErrorMessage>
                )}
              </FormGroup>

              {/* タグ */}
              <FormGroup>
                <Label htmlFor="tags">
                  タグ
                </Label>
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
                  <ErrorMessage id="tags-error" role="alert">
                    {errors.tags}
                  </ErrorMessage>
                )}
                <HelpText>
                  ジャンルやテーマを個別に入力してください。既存のタグは候補として表示されます。
                </HelpText>
              </FormGroup>

              {/* 全般エラー */}
              {errors.general && (
                <GeneralError role="alert">
                  {errors.general}
                </GeneralError>
              )}

              {/* ボタン */}
              <ButtonGroup>
                <CancelButton 
                  type="button" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  キャンセル
                </CancelButton>
                <SubmitButton 
                  type="submit" 
                  disabled={isSubmitting}
                  aria-describedby={isSubmitting ? 'submitting-status' : undefined}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      {isEditMode ? '更新中...' : '登録中...'}
                    </>
                  ) : (
                    isEditMode ? '楽曲を更新' : '楽曲を登録'
                  )}
                </SubmitButton>
              </ButtonGroup>

              {isSubmitting && (
                <span id="submitting-status" className="sr-only">
                  楽曲を{isEditMode ? '更新' : '登録'}しています。しばらくお待ちください。
                </span>
              )}
            </StyledForm>
          )}
        </FormBody>
      </FormContainer>
    </FormOverlay>
  )
})

// アニメーション定義
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`

const slideIn = keyframes`
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`

const slideOut = keyframes`
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`

// スタイル定義
const FormOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.ui.modalOverlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  animation: ${({ $isVisible }) => $isVisible ? fadeIn : fadeOut} 
             ${({ theme }) => theme.animations.duration.normal} 
             ${({ theme }) => theme.animations.easing.easeInOut};
`

const FormContainer = styled.div<{ $isVisible: boolean }>`
  background: linear-gradient(135deg, #fff0f8 0%, #ffe8f0 100%);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(255, 105, 180, 0.3), 0 0 0 3px rgba(255, 182, 193, 0.5);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  backdrop-filter: blur(15px);
  border: 3px solid #ffb6c1;
  position: relative;
  
  animation: ${({ $isVisible }) => $isVisible ? slideIn : slideOut} 
             ${({ theme }) => theme.animations.duration.normal} 
             ${({ theme }) => theme.animations.easing.easeOut};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin: 16px;
    max-height: 95vh;
    border-radius: 12px;
  }

  @media (max-width: 480px) {
    margin: 12px;
    max-height: 98vh;
    border-radius: 10px;
  }
`

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 2px solid #ffb6c1;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%);
  position: relative;

  &::before {
    content: '💖';
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 1.2rem;
    animation: pulse 2s infinite;
  }

  &::after {
    content: '✨';
    position: absolute;
    top: 10px;
    right: 60px;
    font-size: 1rem;
    animation: twinkle 3s infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 1; transform: rotate(0deg); }
    50% { opacity: 0.5; transform: rotate(180deg); }
  }
`

const FormTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 2px solid #fff;
  font-size: 18px;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  font-weight: bold;

  &:hover {
    background: linear-gradient(135deg, #ff1493, #dc143c);
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 105, 180, 0.6);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (hover: none) and (pointer: coarse) {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
`

const FormBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
  -webkit-overflow-scrolling: touch;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 20px;
    max-height: calc(95vh - 90px);
  }

  @media (max-width: 480px) {
    padding: 16px;
    max-height: calc(98vh - 80px);
  }
`

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label<{ $required?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 4px;

  ${({ $required }) => $required && `
    &::after {
      content: '*';
      color: #ff69b4;
      font-weight: bold;
    }
  `}
`

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${({ $hasError, theme }) => 
    $hasError ? '#ff69b4' : theme.colors.ui.borderLight};
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all ${({ theme }) => theme.animations.duration.fast};

  &:focus {
    outline: none;
    border-color: #ff69b4;
    box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
    background: rgba(255, 255, 255, 0.95);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }

  &:disabled {
    background: rgba(240, 240, 240, 0.8);
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
`

const ErrorMessage = styled.div`
  color: #ff69b4;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '⚠️';
    font-size: 10px;
  }
`

const HelpText = styled.div`
  color: ${({ theme }) => theme.colors.text.light};
  font-size: 12px;
  font-style: italic;
`

const GeneralError = styled.div`
  background: rgba(255, 105, 180, 0.1);
  border: 1px solid #ff69b4;
  border-radius: 8px;
  padding: 12px 16px;
  color: #ff69b4;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '❌';
    font-size: 16px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 8px;
  }
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 480px) {
    padding: 14px 24px;
    font-size: 16px;
  }
`

const CancelButton = styled(Button)`
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid ${({ theme }) => theme.colors.ui.borderLight};
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.95);
    border-color: ${({ theme }) => theme.colors.text.light};
  }
`

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 2px solid #ff69b4;
  color: white;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff1493, #dc143c);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const SuccessMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const SuccessIcon = styled.div`
  font-size: 48px;
  animation: ${bounce} 1s ease-in-out;
`

const SuccessText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`

const SuccessSubText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export default SongRegistrationForm