import { useState, useCallback, useEffect, useMemo } from 'react'
import { BubbleEntity } from '@/types/bubble'
import { GenreService } from '@/services/genreService'

/**
 * ジャンルフィルターの状態管理フック
 * Requirements: 4.4, 4.5 - フィルター状態管理とフィルタークリア機能
 */
export interface UseGenreFilterReturn {
  // フィルター状態
  selectedGenres: string[]
  isFilterActive: boolean
  availableGenres: string[]

  // フィルタリング結果
  filteredBubbles: BubbleEntity[]
  filterStats: {
    totalBubbles: number
    filteredBubbles: number
    hiddenBubbles: number
  }

  // フィルター操作
  toggleGenre: (genre: string) => void
  setSelectedGenres: (genres: string[]) => void
  clearFilter: () => void
  applyFilter: (genres: string[]) => void

  // ダイアログ状態
  isDialogVisible: boolean
  showDialog: () => void
  hideDialog: () => void

  // ユーティリティ
  getGenreStats: () => Map<string, number>
  isGenreSelected: (genre: string) => boolean
}

/**
 * ジャンルフィルターフック
 */
export const useGenreFilter = (
  bubbles: BubbleEntity[]
): UseGenreFilterReturn => {
  const [selectedGenres, setSelectedGenresState] = useState<string[]>([])
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const genreService = useMemo(() => GenreService.getInstance(), [])

  // 利用可能なジャンルを取得
  const availableGenres = useMemo(() => {
    return genreService.getAvailableGenres()
  }, [genreService])

  // フィルターがアクティブかどうか
  const isFilterActive = selectedGenres.length > 0

  // フィルタリングされたシャボン玉
  const filteredBubbles = useMemo(() => {
    return genreService.filterBubblesByGenres(bubbles, selectedGenres)
  }, [bubbles, selectedGenres, genreService])

  // フィルター統計
  const filterStats = useMemo(() => {
    const totalBubbles = bubbles.length
    const filteredCount = filteredBubbles.length
    const hiddenCount = totalBubbles - filteredCount

    return {
      totalBubbles,
      filteredBubbles: filteredCount,
      hiddenBubbles: hiddenCount,
    }
  }, [bubbles.length, filteredBubbles.length])

  /**
   * 初期化時に保存された設定を読み込み
   */
  useEffect(() => {
    const savedGenres = genreService.loadFilterSettings()
    if (savedGenres.length > 0) {
      setSelectedGenresState(savedGenres)
    }
  }, [genreService])

  /**
   * ジャンルの選択/解除を切り替え
   */
  const toggleGenre = useCallback(
    (genre: string) => {
      setSelectedGenresState(prev => {
        const isSelected = prev.includes(genre)
        const newSelection = isSelected
          ? prev.filter(g => g !== genre)
          : [...prev, genre]

        // 設定を保存
        genreService.saveFilterSettings(newSelection)
        return newSelection
      })
    },
    [genreService]
  )

  /**
   * 選択されたジャンルを設定
   */
  const setSelectedGenres = useCallback(
    (genres: string[]) => {
      // 有効なジャンルのみをフィルタリング
      const { valid } = genreService.validateGenres(genres)
      setSelectedGenresState(valid)
      genreService.saveFilterSettings(valid)
    },
    [genreService]
  )

  /**
   * フィルターをクリア
   */
  const clearFilter = useCallback(() => {
    setSelectedGenresState([])
    genreService.clearFilterSettings()
  }, [genreService])

  /**
   * フィルターを適用
   */
  const applyFilter = useCallback(
    (genres: string[]) => {
      setSelectedGenres(genres)
    },
    [setSelectedGenres]
  )

  /**
   * ダイアログを表示
   */
  const showDialog = useCallback(() => {
    setIsDialogVisible(true)
  }, [])

  /**
   * ダイアログを非表示
   */
  const hideDialog = useCallback(() => {
    setIsDialogVisible(false)
  }, [])

  /**
   * ジャンル統計を取得
   */
  const getGenreStats = useCallback(() => {
    return genreService.getGenreStats(bubbles)
  }, [genreService, bubbles])

  /**
   * ジャンルが選択されているかチェック
   */
  const isGenreSelected = useCallback(
    (genre: string) => {
      return selectedGenres.includes(genre)
    },
    [selectedGenres]
  )

  return {
    // フィルター状態
    selectedGenres,
    isFilterActive,
    availableGenres,

    // フィルタリング結果
    filteredBubbles,
    filterStats,

    // フィルター操作
    toggleGenre,
    setSelectedGenres,
    clearFilter,
    applyFilter,

    // ダイアログ状態
    isDialogVisible,
    showDialog,
    hideDialog,

    // ユーティリティ
    getGenreStats,
    isGenreSelected,
  }
}

export default useGenreFilter
