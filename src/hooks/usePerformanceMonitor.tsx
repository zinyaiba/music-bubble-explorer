import React, { useRef, useState, useCallback } from 'react'
import { FPSCounter, getMemoryUsage } from '@/utils/PerformanceOptimizer'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  renderCount: number
  visibleBubbles: number
  totalBubbles: number
  memoryUsage?: number
}

/**
 * パフォーマンス監視用カスタムフック（最適化版）
 * FPS、フレーム時間、レンダリング回数などを追跡
 */
export const usePerformanceMonitor = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    renderCount: 0,
    visibleBubbles: 0,
    totalBubbles: 0
  })

  const fpsCounterRef = useRef(new FPSCounter())
  const renderCountRef = useRef(0)
  const lastFrameTimeRef = useRef(performance.now())

  /**
   * フレーム開始時に呼び出す（最適化版）
   */
  const startFrame = useCallback(() => {
    if (!enabled) return
    renderCountRef.current++
    lastFrameTimeRef.current = performance.now()
  }, [enabled])

  /**
   * フレーム終了時に呼び出す（最適化版）
   */
  const endFrame = useCallback((visibleBubbles: number, totalBubbles: number) => {
    if (!enabled) return
    
    const now = performance.now()
    const frameTime = now - lastFrameTimeRef.current
    const fps = fpsCounterRef.current.update()

    // メトリクスを更新（頻度を制限）
    if (renderCountRef.current % 15 === 0) {
      setMetrics(prev => ({
        ...prev,
        fps,
        frameTime,
        renderCount: renderCountRef.current,
        visibleBubbles,
        totalBubbles,
        memoryUsage: getMemoryUsage() || prev.memoryUsage
      }))
    }
  }, [enabled])

  /**
   * パフォーマンス統計をリセット（最適化版）
   */
  const resetMetrics = useCallback(() => {
    fpsCounterRef.current.reset()
    renderCountRef.current = 0
    lastFrameTimeRef.current = performance.now()
    setMetrics({
      fps: 0,
      frameTime: 0,
      renderCount: 0,
      visibleBubbles: 0,
      totalBubbles: 0
    })
  }, [])

  return {
    metrics,
    startFrame,
    endFrame,
    resetMetrics,
    enabled
  }
}

/**
 * パフォーマンスメトリクス表示コンポーネント
 */
export const PerformanceDisplay: React.FC<{ metrics: PerformanceMetrics }> = ({ metrics }) => {
  if (process.env.NODE_ENV !== 'development') return null

  const getPerformanceColor = (fps: number) => {
    if (fps >= 55) return '#4CAF50' // Green
    if (fps >= 30) return '#FF9800' // Orange
    return '#F44336' // Red
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000,
      minWidth: '200px'
    }}>
      <div style={{ color: getPerformanceColor(metrics.fps) }}>
        FPS: {metrics.fps}
      </div>
      <div>Frame Time: {metrics.frameTime.toFixed(1)}ms</div>
      <div>Renders: {metrics.renderCount}</div>
      <div>Visible/Total: {metrics.visibleBubbles}/{metrics.totalBubbles}</div>
      {metrics.memoryUsage && (
        <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  )
}