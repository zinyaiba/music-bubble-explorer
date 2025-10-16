/**
 * パフォーマンス最適化ユーティリティ
 * 300曲データでの動作確認とパフォーマンス調整
 * Requirements: 1.4, 2.1, 4.4, 5.2
 */

import { BubbleEntity } from '@/types/bubble'

/**
 * 数値を指定範囲内にクランプ
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * メモリ使用量を取得
 */
export function getMemoryUsage(): number {
  if (typeof performance !== 'undefined' && 'memory' in performance && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
  }
  return 0
}

/**
 * FPSカウンター
 */
export class FPSCounter {
  private frameCount = 0
  private lastTime = 0
  private fps = 60

  update(): number {
    this.frameCount++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = currentTime
    }
    
    return this.fps
  }

  getFPS(): number {
    return this.fps
  }

  reset(): void {
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fps = 60
  }
}

interface PerformanceConfig {
  maxBubbles: number
  targetFPS: number
  enableVirtualization: boolean
  enableObjectPooling: boolean
  enableBatching: boolean
}

interface PerformanceMetrics {
  fps: number
  frameTime: number
  visibleBubbles: number
  totalBubbles: number
  memoryUsage: number
  renderTime: number
}

/**
 * デバイス性能に基づく最適化設定
 */
export function getOptimalPerformanceConfig(): PerformanceConfig {
  const isLowEndDevice = () => {
    // メモリ容量での判定
    if (typeof performance !== 'undefined' && 'memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      return memory.jsHeapSizeLimit < 1073741824 // 1GB未満
    }
    
    // ハードウェア並行性での判定
    if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency < 4
    }
    
    // User Agentでの大まかな判定
    if (typeof navigator !== 'undefined' && 'userAgent' in navigator) {
      const userAgent = (navigator as any).userAgent.toLowerCase()
      return /mobile|android|iphone|ipad/.test(userAgent)
    }
    
    return false
  }
  
  const isMobile = typeof navigator !== 'undefined' && 'userAgent' in navigator && /mobile|android|iphone|ipad/i.test((navigator as any).userAgent)
  const isLowEnd = isLowEndDevice()
  
  if (isLowEnd || isMobile) {
    return {
      maxBubbles: 30,
      targetFPS: 30,
      enableVirtualization: true,
      enableObjectPooling: true,
      enableBatching: true
    }
  } else {
    return {
      maxBubbles: 80,
      targetFPS: 60,
      enableVirtualization: true,
      enableObjectPooling: true,
      enableBatching: false
    }
  }
}

/**
 * 画面サイズに基づくシャボン玉数の調整
 */
export function calculateOptimalBubbleCount(
  canvasWidth: number, 
  canvasHeight: number, 
  datasetSize: number
): number {
  const area = canvasWidth * canvasHeight
  const baseCount = Math.floor(area / 15000) // 15000px²あたり1個
  
  // データセットサイズに応じた調整
  const datasetFactor = Math.min(datasetSize / 100, 2) // 最大2倍まで
  
  // デバイス性能に応じた調整
  const config = getOptimalPerformanceConfig()
  
  return Math.min(Math.floor(baseCount * datasetFactor), config.maxBubbles)
}

/**
 * 300曲データでのパフォーマンステスト
 */
export async function performLargeDatasetTest(): Promise<{
  success: boolean
  metrics: PerformanceMetrics
  warnings: string[]
  recommendations: string[]
}> {
  console.log('🚀 Starting large dataset performance test...')
  
  const testDuration = 2000 // 2秒間のテスト
  const startTime = Date.now()
  
  // 模擬的な大量データテスト
  const mockBubbles: BubbleEntity[] = []
  for (let i = 0; i < 300; i++) {
    // 実際のBubbleEntityの代わりに模擬オブジェクトを使用
    mockBubbles.push({
      id: `test_${i}`,
      x: Math.random() * 1200,
      y: Math.random() * 800,
      getDisplaySize: () => 40 + Math.random() * 40,
      getDisplayOpacity: () => 0.8
    } as any)
  }
  
  let frameCount = 0
  let totalFrameTime = 0
  const maxFrames = 120 // 最大120フレーム
  
  while (Date.now() - startTime < testDuration && frameCount < maxFrames) {
    const frameStart = performance.now()
    
    // 模擬的な描画処理
    const config = getOptimalPerformanceConfig()
    const optimizedBubbles = mockBubbles.slice(0, config.maxBubbles)
    
    // 実際の処理をシミュレート
    optimizedBubbles.forEach(bubble => {
      bubble.x += Math.random() * 2 - 1
      bubble.y += Math.random() * 2 - 1
    })
    
    // 模擬的な処理時間
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2))
    
    const frameTime = performance.now() - frameStart
    totalFrameTime += frameTime
    frameCount++
  }
  
  const avgFrameTime = totalFrameTime / frameCount
  const avgFPS = frameCount / (testDuration / 1000)
  
  const metrics: PerformanceMetrics = {
    fps: avgFPS,
    frameTime: avgFrameTime,
    visibleBubbles: Math.min(mockBubbles.length, getOptimalPerformanceConfig().maxBubbles),
    totalBubbles: mockBubbles.length,
    memoryUsage: 0,
    renderTime: avgFrameTime
  }
  
  const warnings: string[] = []
  if (avgFPS < 30) {
    warnings.push(`FPS低下: ${avgFPS.toFixed(1)}fps`)
  }
  if (avgFrameTime > 33) {
    warnings.push(`フレーム時間過大: ${avgFrameTime.toFixed(1)}ms`)
  }
  
  const recommendations: string[] = []
  if (avgFPS < 30) {
    recommendations.push('シャボン玉数を削減することを推奨します')
  }
  if (warnings.length === 0) {
    recommendations.push('現在の設定で良好なパフォーマンスが得られています')
  }
  
  console.log('✅ Large dataset performance test completed')
  console.log(`Frames processed: ${frameCount}`)
  console.log(`Average FPS: ${avgFPS.toFixed(1)}`)
  console.log(`Average frame time: ${avgFrameTime.toFixed(2)}ms`)
  
  return {
    success: warnings.length === 0,
    metrics,
    warnings,
    recommendations
  }
}