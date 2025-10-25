import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react'
import { BubbleEntity } from '@/types/bubble'
import { GenreService } from '@/services/genreService'

/**
 * ジャンルフィルターの状態
 * Requirements: 4.4, 4.5 - フィルター状態管理とフィルタークリア機能
 */
export interface GenreFilterState {
  selectedGenres: string[]
  availableGenres: string[]
  isFilterActive: boolean
  isDialogVisible: boolean
  filterStats: {
    totalBubbles: number
    filteredBubbles: number
    hiddenBubbles: number
  }
  filterHistory: Array<{
    genres: string[]
    timestamp: number
    resultCount: number
  }>
}

/**
 * ジャンルフィルターのアクション
 */
export type GenreFilterAction =
  | { type: 'SET_SELECTED_GENRES'; payload: string[] }
  | { type: 'TOGGLE_GENRE'; payload: string }
  | { type: 'CLEAR_FILTER' }
  | { type: 'SET_AVAILABLE_GENRES'; payload: string[] }
  | { type: 'SHOW_DIALOG' }
  | { type: 'HIDE_DIALOG' }
  | {
      type: 'UPDATE_STATS'
      payload: { totalBubbles: number; filteredBubbles: number }
    }
  | {
      type: 'ADD_TO_HISTORY'
      payload: { genres: string[]; resultCount: number }
    }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<GenreFilterState> }

/**
 * ジャンルフィルターのコンテキスト値
 */
export interface GenreFilterContextValue {
  state: GenreFilterState
  actions: {
    setSelectedGenres: (genres: string[]) => void
    toggleGenre: (genre: string) => void
    clearFilter: () => void
    showDialog: () => void
    hideDialog: () => void
    updateStats: (totalBubbles: number, filteredBubbles: number) => void
    applyFilter: (genres: string[]) => void
  }
}

/**
 * 初期状態
 */
const initialState: GenreFilterState = {
  selectedGenres: [],
  availableGenres: [],
  isFilterActive: false,
  isDialogVisible: false,
  filterStats: {
    totalBubbles: 0,
    filteredBubbles: 0,
    hiddenBubbles: 0,
  },
  filterHistory: [],
}

/**
 * リデューサー関数
 */
const genreFilterReducer = (
  state: GenreFilterState,
  action: GenreFilterAction
): GenreFilterState => {
  switch (action.type) {
    case 'SET_SELECTED_GENRES':
      return {
        ...state,
        selectedGenres: action.payload,
        isFilterActive: action.payload.length > 0,
      }

    case 'TOGGLE_GENRE': {
      const isSelected = state.selectedGenres.includes(action.payload)
      const newSelectedGenres = isSelected
        ? state.selectedGenres.filter(g => g !== action.payload)
        : [...state.selectedGenres, action.payload]

      return {
        ...state,
        selectedGenres: newSelectedGenres,
        isFilterActive: newSelectedGenres.length > 0,
      }
    }

    case 'CLEAR_FILTER':
      return {
        ...state,
        selectedGenres: [],
        isFilterActive: false,
        filterStats: {
          ...state.filterStats,
          filteredBubbles: state.filterStats.totalBubbles,
          hiddenBubbles: 0,
        },
      }

    case 'SET_AVAILABLE_GENRES':
      return {
        ...state,
        availableGenres: action.payload,
      }

    case 'SHOW_DIALOG':
      return {
        ...state,
        isDialogVisible: true,
      }

    case 'HIDE_DIALOG':
      return {
        ...state,
        isDialogVisible: false,
      }

    case 'UPDATE_STATS': {
      const hiddenBubbles =
        action.payload.totalBubbles - action.payload.filteredBubbles
      return {
        ...state,
        filterStats: {
          totalBubbles: action.payload.totalBubbles,
          filteredBubbles: action.payload.filteredBubbles,
          hiddenBubbles,
        },
      }
    }

    case 'ADD_TO_HISTORY': {
      const newHistoryItem = {
        genres: action.payload.genres,
        timestamp: Date.now(),
        resultCount: action.payload.resultCount,
      }

      return {
        ...state,
        filterHistory: [newHistoryItem, ...state.filterHistory.slice(0, 9)], // 最新10件を保持
      }
    }

    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload,
      }

    default:
      return state
  }
}

/**
 * ジャンルフィルターコンテキスト
 */
const GenreFilterContext = createContext<GenreFilterContextValue | undefined>(
  undefined
)

/**
 * ジャンルフィルタープロバイダーのプロパティ
 */
export interface GenreFilterProviderProps {
  children: React.ReactNode
  bubbles?: BubbleEntity[]
}

/**
 * ジャンルフィルタープロバイダー
 * Requirements: 4.4, 4.5 - フィルター状態管理とフィルタークリア機能
 */
export const GenreFilterProvider: React.FC<GenreFilterProviderProps> = ({
  children,
  bubbles = [],
}) => {
  const [state, dispatch] = useReducer(genreFilterReducer, initialState)
  const genreService = React.useMemo(() => GenreService.getInstance(), [])

  /**
   * 利用可能なジャンルを更新
   */
  useEffect(() => {
    const availableGenres = genreService.getAvailableGenres()
    dispatch({ type: 'SET_AVAILABLE_GENRES', payload: availableGenres })
  }, [genreService])

  /**
   * シャボン玉データが変更された時に統計を更新
   */
  useEffect(() => {
    const totalBubbles = bubbles.length
    const filteredBubbles = state.isFilterActive
      ? genreService.filterBubblesByGenres(bubbles, state.selectedGenres).length
      : totalBubbles

    dispatch({
      type: 'UPDATE_STATS',
      payload: { totalBubbles, filteredBubbles },
    })
  }, [bubbles, state.selectedGenres, state.isFilterActive, genreService])

  /**
   * 初期化時に保存された状態を読み込み
   */
  useEffect(() => {
    const savedGenres = genreService.loadFilterSettings()
    if (savedGenres.length > 0) {
      dispatch({ type: 'SET_SELECTED_GENRES', payload: savedGenres })
    }

    // フィルター履歴を読み込み
    try {
      const savedHistory = localStorage.getItem('genreFilterHistory')
      if (savedHistory) {
        const history = JSON.parse(savedHistory)
        dispatch({
          type: 'LOAD_SAVED_STATE',
          payload: { filterHistory: history },
        })
      }
    } catch (error) {
      console.warn('Failed to load filter history:', error)
    }
  }, [genreService])

  /**
   * フィルター履歴を保存
   */
  const saveFilterHistory = useCallback(
    (history: GenreFilterState['filterHistory']) => {
      try {
        localStorage.setItem('genreFilterHistory', JSON.stringify(history))
      } catch (error) {
        console.warn('Failed to save filter history:', error)
      }
    },
    []
  )

  /**
   * 選択されたジャンルを設定
   */
  const setSelectedGenres = useCallback(
    (genres: string[]) => {
      const { valid } = genreService.validateGenres(genres)
      dispatch({ type: 'SET_SELECTED_GENRES', payload: valid })
      genreService.saveFilterSettings(valid)

      // 履歴に追加
      if (valid.length > 0) {
        const filteredCount = genreService.filterBubblesByGenres(
          bubbles,
          valid
        ).length
        dispatch({
          type: 'ADD_TO_HISTORY',
          payload: { genres: valid, resultCount: filteredCount },
        })
      }
    },
    [genreService, bubbles]
  )

  /**
   * ジャンルの選択/解除を切り替え
   */
  const toggleGenre = useCallback(
    (genre: string) => {
      dispatch({ type: 'TOGGLE_GENRE', payload: genre })

      // 更新された状態を保存（次のレンダリング後に実行）
      setTimeout(() => {
        const currentGenres = state.selectedGenres.includes(genre)
          ? state.selectedGenres.filter(g => g !== genre)
          : [...state.selectedGenres, genre]

        genreService.saveFilterSettings(currentGenres)

        if (currentGenres.length > 0) {
          const filteredCount = genreService.filterBubblesByGenres(
            bubbles,
            currentGenres
          ).length
          dispatch({
            type: 'ADD_TO_HISTORY',
            payload: { genres: currentGenres, resultCount: filteredCount },
          })
        }
      }, 0)
    },
    [state.selectedGenres, genreService, bubbles]
  )

  /**
   * フィルターをクリア
   */
  const clearFilter = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTER' })
    genreService.clearFilterSettings()
  }, [genreService])

  /**
   * ダイアログを表示
   */
  const showDialog = useCallback(() => {
    dispatch({ type: 'SHOW_DIALOG' })
  }, [])

  /**
   * ダイアログを非表示
   */
  const hideDialog = useCallback(() => {
    dispatch({ type: 'HIDE_DIALOG' })
  }, [])

  /**
   * 統計を更新
   */
  const updateStats = useCallback(
    (totalBubbles: number, filteredBubbles: number) => {
      dispatch({
        type: 'UPDATE_STATS',
        payload: { totalBubbles, filteredBubbles },
      })
    },
    []
  )

  /**
   * フィルターを適用
   */
  const applyFilter = useCallback(
    (genres: string[]) => {
      setSelectedGenres(genres)
      hideDialog()
    },
    [setSelectedGenres, hideDialog]
  )

  /**
   * フィルター履歴が変更された時に保存
   */
  useEffect(() => {
    if (state.filterHistory.length > 0) {
      saveFilterHistory(state.filterHistory)
    }
  }, [state.filterHistory, saveFilterHistory])

  const contextValue: GenreFilterContextValue = {
    state,
    actions: {
      setSelectedGenres,
      toggleGenre,
      clearFilter,
      showDialog,
      hideDialog,
      updateStats,
      applyFilter,
    },
  }

  return (
    <GenreFilterContext.Provider value={contextValue}>
      {children}
    </GenreFilterContext.Provider>
  )
}

/**
 * ジャンルフィルターコンテキストを使用するフック
 */
export const useGenreFilterContext = (): GenreFilterContextValue => {
  const context = useContext(GenreFilterContext)
  if (!context) {
    throw new Error(
      'useGenreFilterContext must be used within a GenreFilterProvider'
    )
  }
  return context
}

/**
 * ジャンルフィルターの視覚的フィードバック用フック
 */
export const useGenreFilterFeedback = () => {
  const { state } = useGenreFilterContext()

  return {
    isFilterActive: state.isFilterActive,
    selectedCount: state.selectedGenres.length,
    totalGenres: state.availableGenres.length,
    filterRatio:
      state.filterStats.totalBubbles > 0
        ? state.filterStats.filteredBubbles / state.filterStats.totalBubbles
        : 1,
    getFilterStatusText: () => {
      if (!state.isFilterActive) {
        return 'フィルターなし'
      }

      const { filteredBubbles, totalBubbles } = state.filterStats
      return `${filteredBubbles}/${totalBubbles} 個表示中`
    },
    getFilterSummary: () => {
      if (!state.isFilterActive) {
        return null
      }

      return {
        selectedGenres: state.selectedGenres,
        resultCount: state.filterStats.filteredBubbles,
        hiddenCount: state.filterStats.hiddenBubbles,
      }
    },
  }
}

export default GenreFilterContext
