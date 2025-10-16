/**
 * アニメーション改善のテスト用ユーティリティ
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { BubbleAnimationManager, LIFECYCLE_CONFIG, BezierCurve } from '../services/bubbleAnimations'
import { BubbleEntity } from '../types/bubble'

/**
 * アニメーション改善のテスト
 */
export function testAnimationImprovements(): void {
  console.log('🎬 アニメーション改善テストを開始します...')
  
  // 1. ライフサイクル設定のテスト（Requirements: 7.1）
  console.log('📋 ライフサイクル設定:')
  console.log(`  - 最小ライフスパン: ${LIFECYCLE_CONFIG.minLifespan}ms (5秒)`)
  console.log(`  - 最大ライフスパン: ${LIFECYCLE_CONFIG.maxLifespan}ms (10秒)`)
  console.log(`  - 消失開始比率: ${LIFECYCLE_CONFIG.fadeStartRatio * 100}%`)
  
  // 2. ベジェ曲線のテスト（Requirements: 7.4）
  console.log('📈 ベジェ曲線テスト:')
  const testPoints = [0, 0.25, 0.5, 0.75, 1]
  testPoints.forEach(t => {
    const natural = BezierCurve.naturalFloat(t)
    const elastic = BezierCurve.easeOutElastic(t)
    console.log(`  t=${t}: natural=${natural.toFixed(3)}, elastic=${elastic.toFixed(3)}`)
  })
  
  // 3. アニメーションマネージャーのテスト
  console.log('🎭 アニメーションマネージャーテスト:')
  const animManager = new BubbleAnimationManager()
  
  // テスト用バブル作成
  const testBubble = new BubbleEntity({
    type: 'song',
    name: 'テスト楽曲',
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    size: 60,
    color: '#FFB6C1',
    opacity: 1,
    lifespan: 8000,
    relatedCount: 5
  })
  
  // 出現アニメーション開始
  animManager.startAppearAnimation(testBubble.id)
  console.log('  ✅ 出現アニメーション開始')
  
  // アニメーション状態確認
  const currentTime = performance.now()
  const scale = animManager.getCurrentScale(testBubble.id, currentTime)
  const opacity = animManager.getCurrentOpacity(testBubble.id, currentTime)
  const noiseOffset = animManager.getNoiseOffset(testBubble.id, currentTime)
  
  console.log(`  - スケール: ${scale.toFixed(3)}`)
  console.log(`  - 透明度: ${opacity.toFixed(3)}`)
  console.log(`  - ノイズオフセット: x=${noiseOffset.x.toFixed(2)}, y=${noiseOffset.y.toFixed(2)}`)
  
  // 4. パフォーマンス統計テスト（Requirements: 7.5）
  console.log('📊 パフォーマンス統計:')
  const stats = animManager.getPerformanceStats()
  console.log(`  - アクティブアニメーション: ${stats.activeAnimations}`)
  console.log(`  - フレーム数: ${stats.frameCount}`)
  console.log(`  - 平均FPS: ${stats.averageFPS.toFixed(1)}`)
  
  // 5. ライフサイクル判定テスト
  console.log('⏰ ライフサイクル判定テスト:')
  const testAges = [0, 2000, 5000, 7000, 8000]
  const testLifespan = 8000
  
  testAges.forEach(age => {
    const shouldDisappear = animManager.shouldStartDisappearAnimation(age, testLifespan)
    const ageRatio = (age / testLifespan * 100).toFixed(1)
    console.log(`  - 年齢: ${age}ms (${ageRatio}%) → 消失開始: ${shouldDisappear ? 'はい' : 'いいえ'}`)
  })
  
  console.log('✨ アニメーション改善テスト完了！')
}

/**
 * リアルタイムアニメーション監視
 */
export function startAnimationMonitoring(): () => void {
  console.log('🔍 アニメーション監視を開始します...')
  
  let frameCount = 0
  let lastTime = performance.now()
  let monitoring = true
  
  const monitor = () => {
    if (!monitoring) return
    
    frameCount++
    const currentTime = performance.now()
    
    // 1秒ごとに統計を出力
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount / ((currentTime - lastTime) / 1000)
      console.log(`📈 FPS: ${fps.toFixed(1)} (目標: 60FPS)`)
      
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(monitor)
  }
  
  requestAnimationFrame(monitor)
  
  // 監視停止関数を返す
  return () => {
    monitoring = false
    console.log('🛑 アニメーション監視を停止しました')
  }
}

/**
 * GPU加速テスト（ブラウザ機能確認）
 */
export function testGPUAcceleration(): void {
  console.log('🖥️ GPU加速テストを開始します...')
  
  // Canvas作成
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 200
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    console.error('❌ Canvas 2Dコンテキストの取得に失敗')
    return
  }
  
  // transform3d効果のテスト
  const startTime = performance.now()
  
  for (let i = 0; i < 100; i++) {
    ctx.save()
    ctx.translate(100, 100)
    ctx.rotate(i * 0.1)
    ctx.scale(1.1, 1.1)
    
    // 円を描画
    ctx.beginPath()
    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.fillStyle = `hsl(${i * 3.6}, 70%, 60%)`
    ctx.fill()
    
    ctx.restore()
  }
  
  const endTime = performance.now()
  const renderTime = endTime - startTime
  
  console.log(`⚡ 100個の回転・スケール描画時間: ${renderTime.toFixed(2)}ms`)
  
  if (renderTime < 10) {
    console.log('✅ GPU加速が効果的に動作しています')
  } else if (renderTime < 50) {
    console.log('⚠️ GPU加速は動作していますが、最適化の余地があります')
  } else {
    console.log('❌ GPU加速が十分に効果を発揮していない可能性があります')
  }
}

// 開発環境でのみテスト実行
if (process.env.NODE_ENV === 'development') {
  // ページ読み込み完了後にテスト実行
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        testAnimationImprovements()
        testGPUAcceleration()
      }, 1000)
    })
  }
}