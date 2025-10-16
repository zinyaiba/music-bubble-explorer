import { useEffect, useRef, useCallback } from 'react'

/**
 * RequestAnimationFrameを使用したアニメーションループのカスタムフック
 */
export const useAnimationLoop = (
  callback: (deltaTime: number, currentTime: number) => void,
  enabled: boolean = true
) => {
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const enabledRef = useRef(enabled)

  // enabledの状態を最新に保つ
  enabledRef.current = enabled

  const animate = useCallback((currentTime: number) => {
    if (!enabledRef.current) return

    const deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0
    lastTimeRef.current = currentTime

    callback(deltaTime, currentTime)

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [callback])

  const start = useCallback(() => {
    if (animationFrameRef.current) return // 既に開始済み
    
    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(animate)
  }, [animate])

  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = undefined
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }

    return stop
  }, [enabled, start, stop])

  return { start, stop }
}