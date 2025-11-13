import { useState, useEffect, useCallback, useRef } from 'react'

export interface AnimationControlResult {
  shouldAnimate: boolean // アニメーションを実行すべきかどうか
  setDialogOpen: (isOpen: boolean) => void // ダイアログ開閉状態を設定
}

/**
 * アニメーション制御用のカスタムフック
 * ダイアログ開閉時とアイドル状態でアニメーションを制御し、
 * モバイルデバイスでの発熱とバッテリー消費を削減します。
 */
export function useAnimationControl(): AnimationControlResult {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const idleTimerRef = useRef<number | null>(null)

  // アイドルタイマーをリセット
  const resetIdleTimer = useCallback(() => {
    if (isDialogOpen) return // ダイアログが開いている間はリセットしない

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }

    setIsIdle(false)

    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true)
    }, 30000) // 30秒
  }, [isDialogOpen])

  // ユーザー操作イベントの監視
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'touchstart', 'scroll', 'keydown']

    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer)
    })

    resetIdleTimer() // 初回タイマー設定

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer)
      })
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [resetIdleTimer])

  const setDialogOpen = useCallback(
    (isOpen: boolean) => {
      setIsDialogOpen(isOpen)
      if (!isOpen) {
        resetIdleTimer() // ダイアログを閉じたらタイマーをリセット
      }
    },
    [resetIdleTimer]
  )

  const shouldAnimate = !isDialogOpen && !isIdle

  return { shouldAnimate, setDialogOpen }
}
