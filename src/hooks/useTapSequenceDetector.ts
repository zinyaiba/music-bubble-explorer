import { useState, useCallback, useRef } from 'react'

export interface TapSequenceConfig {
  requiredTaps: number // 必要なタップ回数（デフォルト: 13）
  timeWindowMs: number // 時間枠（デフォルト: 3000ms）
  onSequenceComplete: () => void // シーケンス完了時のコールバック
}

export interface TapSequenceResult {
  handleTap: () => void // タップハンドラー
  tapCount: number // 現在のタップ回数
  resetSequence: () => void // シーケンスをリセット
}

/**
 * タップシーケンス検出用のカスタムフック
 * 指定された時間枠内に指定回数のタップを検出し、コールバックを発火します。
 *
 * Requirements: 1.1, 1.3, 1.4
 * - 時間枠内のタップ回数をカウント
 * - 指定回数達成時にコールバックを発火
 * - タイムアウト時にリセット
 */
export function useTapSequenceDetector(
  config: TapSequenceConfig
): TapSequenceResult {
  const { requiredTaps, timeWindowMs, onSequenceComplete } = config

  const [tapCount, setTapCount] = useState(0)
  const timeoutRef = useRef<number | null>(null)
  const lastTapTimeRef = useRef<number | null>(null)

  // シーケンスをリセット
  const resetSequence = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setTapCount(0)
    lastTapTimeRef.current = null
  }, [])

  // タップハンドラー
  const handleTap = useCallback(() => {
    const now = Date.now()

    // 前回のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // 時間枠を超えていた場合はリセットして1からカウント
    if (
      lastTapTimeRef.current !== null &&
      now - lastTapTimeRef.current > timeWindowMs
    ) {
      setTapCount(1)
      lastTapTimeRef.current = now
      // 新しいタイムアウトを設定
      timeoutRef.current = window.setTimeout(() => {
        resetSequence()
      }, timeWindowMs)
      return
    }

    // タップ時刻を記録
    lastTapTimeRef.current = now

    setTapCount(prevCount => {
      const newCount = prevCount + 1

      // 必要回数に達した場合
      if (newCount >= requiredTaps) {
        // コールバックを発火
        onSequenceComplete()
        // カウントをリセット（次のシーケンスのため）
        lastTapTimeRef.current = null
        return 0
      }

      return newCount
    })

    // 新しいタイムアウトを設定
    timeoutRef.current = window.setTimeout(() => {
      resetSequence()
    }, timeWindowMs)
  }, [requiredTaps, timeWindowMs, onSequenceComplete, resetSequence])

  return {
    handleTap,
    tapCount,
    resetSequence,
  }
}
