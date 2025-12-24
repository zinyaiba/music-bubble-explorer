/**
 * クリスマステーマユーティリティ
 * CSS変数の適用・解除を行うユーティリティ関数
 *
 * Requirements: 4.1, 4.2
 */

/**
 * クリスマスモードのCSSクラス名
 */
const CHRISTMAS_MODE_CLASS = 'christmas-mode'

/**
 * クリスマステーマで使用するCSS変数のリスト
 * モード解除時の復元確認に使用
 */
export const CHRISTMAS_CSS_VARIABLES = [
  '--background-gradient',
  '--background-light',
  '--background-soft',
  '--text-primary',
  '--text-secondary',
  '--text-light',
  '--modal-background',
  '--modal-overlay',
  '--border-light',
  '--shadow-soft',
  '--hover-overlay',
  '--active-overlay',
  '--glass-background',
  '--glass-text-primary',
  '--glass-text-secondary',
  '--glass-surface',
  '--glass-surface-hover',
  '--glass-border-glass',
  '--bubble-pink',
  '--bubble-blue',
  '--bubble-purple',
  '--bubble-yellow',
  '--bubble-green',
  '--bubble-orange',
  '--bubble-lavender',
  '--bubble-peach',
  '--bubble-mint',
  '--bubble-coral',
] as const

/**
 * クリスマステーマをドキュメントルートに適用する
 * Requirements: 4.1, 4.2
 */
const apply = (): void => {
  const root = document.documentElement
  if (!root.classList.contains(CHRISTMAS_MODE_CLASS)) {
    root.classList.add(CHRISTMAS_MODE_CLASS)
  }
}

/**
 * クリスマステーマをドキュメントルートから解除する
 * Requirements: 4.2
 */
const remove = (): void => {
  const root = document.documentElement
  root.classList.remove(CHRISTMAS_MODE_CLASS)
}

/**
 * クリスマステーマが適用されているかどうかを確認する
 * @returns クリスマスモードが有効な場合はtrue
 */
const isApplied = (): boolean => {
  const root = document.documentElement
  return root.classList.contains(CHRISTMAS_MODE_CLASS)
}

/**
 * クリスマスモードを切り替える
 * @returns 切り替え後の状態（true: 有効、false: 無効）
 */
const toggle = (): boolean => {
  if (isApplied()) {
    remove()
    return false
  } else {
    apply()
    return true
  }
}

/**
 * 指定された状態に基づいてテーマを設定する
 * @param enabled - trueの場合はクリスマスモードを有効化、falseの場合は無効化
 */
const setMode = (enabled: boolean): void => {
  if (enabled) {
    apply()
  } else {
    remove()
  }
}

/**
 * クリスマステーマユーティリティオブジェクト
 * Requirements: 4.1, 4.2
 */
export const christmasTheme = {
  apply,
  remove,
  isApplied,
  toggle,
  setMode,
  CHRISTMAS_MODE_CLASS,
}

export default christmasTheme
