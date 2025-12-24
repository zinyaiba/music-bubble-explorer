import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { christmasTheme } from '../utils/christmasTheme'

/**
 * クリスマスモードのローカルストレージキー
 * Requirements: 3.1, 3.2, 3.3
 */
const CHRISTMAS_MODE_KEY = 'music-bubble-christmas-mode'

/**
 * ローカルストレージに保存するデータ構造
 */
export interface ChristmasModeStorage {
  isEnabled: boolean
  lastToggled: string // ISO日付文字列
}

/**
 * クリスマステーマコンテキストの値
 * Requirements: 3.1, 3.2, 3.3
 */
export interface ChristmasThemeContextValue {
  isChristmasMode: boolean
  toggleChristmasMode: () => void
}

/**
 * クリスマステーマコンテキスト
 */
const ChristmasThemeContext = createContext<
  ChristmasThemeContextValue | undefined
>(undefined)

/**
 * ローカルストレージからクリスマスモード状態を読み込む
 * Requirements: 3.2
 */
export const loadChristmasModeFromStorage = (): boolean => {
  try {
    const stored = localStorage.getItem(CHRISTMAS_MODE_KEY)
    if (stored) {
      const data: ChristmasModeStorage = JSON.parse(stored)
      return data.isEnabled
    }
  } catch (error) {
    console.warn('Failed to load Christmas mode from storage:', error)
  }
  return false
}

/**
 * ローカルストレージにクリスマスモード状態を保存する
 * Requirements: 3.1, 3.3
 */
export const saveChristmasModeToStorage = (isEnabled: boolean): void => {
  try {
    const data: ChristmasModeStorage = {
      isEnabled,
      lastToggled: new Date().toISOString(),
    }
    localStorage.setItem(CHRISTMAS_MODE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save Christmas mode to storage:', error)
  }
}

/**
 * CSS変数をドキュメントルートに適用する
 * Requirements: 4.1, 4.2
 * christmasThemeユーティリティを使用
 */
const applyChristmasTheme = (isEnabled: boolean): void => {
  christmasTheme.setMode(isEnabled)
}

/**
 * クリスマステーマプロバイダーのプロパティ
 */
export interface ChristmasThemeProviderProps {
  children: React.ReactNode
}

/**
 * クリスマステーマプロバイダー
 * Requirements: 3.1, 3.2, 3.3
 */
export const ChristmasThemeProvider: React.FC<ChristmasThemeProviderProps> = ({
  children,
}) => {
  // 初期状態をローカルストレージから読み込む
  const [isChristmasMode, setIsChristmasMode] = useState<boolean>(() => {
    return loadChristmasModeFromStorage()
  })

  /**
   * クリスマスモードを切り替える
   * Requirements: 3.1, 3.3
   */
  const toggleChristmasMode = useCallback(() => {
    setIsChristmasMode(prev => {
      const newValue = !prev
      saveChristmasModeToStorage(newValue)
      return newValue
    })
  }, [])

  /**
   * 状態変更時にCSS変数を適用
   * Requirements: 4.1, 4.2
   */
  useEffect(() => {
    applyChristmasTheme(isChristmasMode)
  }, [isChristmasMode])

  /**
   * 初期化時にCSS変数を適用
   */
  useEffect(() => {
    applyChristmasTheme(isChristmasMode)
  }, [])

  const contextValue = useMemo<ChristmasThemeContextValue>(
    () => ({
      isChristmasMode,
      toggleChristmasMode,
    }),
    [isChristmasMode, toggleChristmasMode]
  )

  return (
    <ChristmasThemeContext.Provider value={contextValue}>
      {children}
    </ChristmasThemeContext.Provider>
  )
}

/**
 * クリスマステーマコンテキストを使用するフック
 */
export const useChristmasTheme = (): ChristmasThemeContextValue => {
  const context = useContext(ChristmasThemeContext)
  if (!context) {
    throw new Error(
      'useChristmasTheme must be used within a ChristmasThemeProvider'
    )
  }
  return context
}

/**
 * ローカルストレージキーをエクスポート（テスト用）
 */
export { CHRISTMAS_MODE_KEY }

export default ChristmasThemeContext
