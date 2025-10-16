/**
 * アニメーション改善のデモンストレーション
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { BubbleAnimationManager, BezierCurve } from '../services/bubbleAnimations'

/**
 * ベジェ曲線による自然な動きのデモ
 */
export function demonstrateBezierMovement(): void {
  console.log('🎨 ベジェ曲線による自然な動きのデモ')
  
  // 0から1まで20ステップで計算
  const steps = 20
  const results: string[] = []
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const natural = BezierCurve.naturalFloat(t)
    const elastic = BezierCurve.easeOutElastic(t)
    const cubic = BezierCurve.easeInOutCubic(t)
    
    results.push(`t=${t.toFixed(2)}: natural=${natural.toFixed(3)}, elastic=${elastic.toFixed(3)}, cubic=${cubic.toFixed(3)}`)
  }
  
  console.table(results)
}

/**
 * パーリンノイズによる微細な揺れのデモ
 */
export function demonstratePerlinNoise(): void {
  console.log('🌊 パーリンノイズによる微細な揺れのデモ')
  
  const animManager = new BubbleAnimationManager()
  const bubbleId = 'demo-bubble-001'
  
  // 浮遊アニメーション開始
  animManager.startFloatingAnimation(bubbleId)
  
  // 時間経過による変化を確認
  const baseTime = performance.now()
  const timeSteps = [0, 100, 200, 500, 1000, 2000]
  
  timeSteps.forEach(deltaMs => {
    const currentTime = baseTime + deltaMs
    const noiseOffset = animManager.getNoiseOffset(bubbleId, currentTime)
    console.log(`${deltaMs}ms後: x=${noiseOffset.x.toFixed(2)}, y=${noiseOffset.y.toFixed(2)}`)
  })
}

/**
 * ライフサイクル管理のデモ
 */
export function demonstrateLifecycleManagement(): void {
  console.log('⏰ ライフサイクル管理のデモ')
  
  const animManager = new BubbleAnimationManager()
  
  // 異なるライフスパンでのテスト
  const testCases = [
    { lifespan: 5000, ages: [0, 1000, 2500, 3500, 4000, 5000] },
    { lifespan: 8000, ages: [0, 2000, 4000, 5600, 7000, 8000] },
    { lifespan: 10000, ages: [0, 3000, 5000, 7000, 8500, 10000] }
  ]
  
  testCases.forEach(({ lifespan, ages }) => {
    console.log(`\n📊 ライフスパン ${lifespan}ms の場合:`)
    
    ages.forEach(age => {
      const shouldDisappear = animManager.shouldStartDisappearAnimation(age, lifespan)
      const percentage = ((age / lifespan) * 100).toFixed(1)
      const status = shouldDisappear ? '🔴 消失開始' : '🟢 継続中'
      
      console.log(`  ${age}ms (${percentage}%): ${status}`)
    })
  })
}

/**
 * 60FPSアニメーションのパフォーマンステスト
 */
export function testAnimationPerformance(): Promise<void> {
  return new Promise((resolve) => {
    console.log('⚡ 60FPSアニメーションパフォーマンステスト開始')
    
    const animManager = new BubbleAnimationManager()
    const testBubbles: string[] = []
    
    // 30個のテストバブルを作成
    for (let i = 0; i < 30; i++) {
      const bubbleId = `perf-test-${i}`
      testBubbles.push(bubbleId)
      animManager.startFloatingAnimation(bubbleId)
    }
    
    let frameCount = 0
    const startTime = performance.now()
    const targetFrames = 180 // 3秒間のテスト
    
    const testFrame = () => {
      frameCount++
      const currentTime = performance.now()
      
      // 各バブルのアニメーション状態を更新
      testBubbles.forEach(bubbleId => {
        animManager.getCurrentScale(bubbleId, currentTime)
        animManager.getCurrentOpacity(bubbleId, currentTime)
        animManager.getNoiseOffset(bubbleId, currentTime)
      })
      
      // フレーム更新
      animManager.updateFrame(currentTime)
      
      if (frameCount < targetFrames) {
        requestAnimationFrame(testFrame)
      } else {
        // テスト完了
        const endTime = performance.now()
        const totalTime = endTime - startTime
        const actualFPS = (frameCount / totalTime) * 1000
        const stats = animManager.getPerformanceStats()
        
        console.log('📈 パフォーマンステスト結果:')
        console.log(`  - 実際のFPS: ${actualFPS.toFixed(1)}`)
        console.log(`  - 目標FPS: 60`)
        console.log(`  - 効率: ${((actualFPS / 60) * 100).toFixed(1)}%`)
        console.log(`  - アクティブアニメーション: ${stats.activeAnimations}`)
        console.log(`  - 総フレーム数: ${frameCount}`)
        console.log(`  - 総時間: ${totalTime.toFixed(2)}ms`)
        
        if (actualFPS >= 55) {
          console.log('✅ パフォーマンス良好！')
        } else if (actualFPS >= 45) {
          console.log('⚠️ パフォーマンス普通（最適化推奨）')
        } else {
          console.log('❌ パフォーマンス不良（要改善）')
        }
        
        resolve()
      }
    }
    
    requestAnimationFrame(testFrame)
  })
}

/**
 * 全デモを実行
 */
export async function runAllAnimationDemos(): Promise<void> {
  console.log('🎬 アニメーション改善デモを開始します...\n')
  
  demonstrateBezierMovement()
  console.log('\n')
  
  demonstratePerlinNoise()
  console.log('\n')
  
  demonstrateLifecycleManagement()
  console.log('\n')
  
  await testAnimationPerformance()
  
  console.log('\n✨ 全デモ完了！')
}

// 開発環境でのみ実行
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // コンソールからデモを実行できるようにグローバルに公開
  (window as any).animationDemo = {
    bezier: demonstrateBezierMovement,
    noise: demonstratePerlinNoise,
    lifecycle: demonstrateLifecycleManagement,
    performance: testAnimationPerformance,
    runAll: runAllAnimationDemos
  }
  
  console.log('🎮 アニメーションデモが利用可能です:')
  console.log('  - window.animationDemo.bezier() - ベジェ曲線デモ')
  console.log('  - window.animationDemo.noise() - パーリンノイズデモ')
  console.log('  - window.animationDemo.lifecycle() - ライフサイクルデモ')
  console.log('  - window.animationDemo.performance() - パフォーマンステスト')
  console.log('  - window.animationDemo.runAll() - 全デモ実行')
}