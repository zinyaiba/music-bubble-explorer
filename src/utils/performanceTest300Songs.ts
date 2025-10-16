/**
 * 300曲データセットでのパフォーマンステスト
 * Requirements: 1.4, 2.1, 4.4, 5.2
 */

import { MusicDataService } from '../services/musicDataService'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from '../services/bubbleManager'
import { BubbleEntity } from '../types/bubble'

export interface Performance300SongsResult {
  success: boolean
  datasetInfo: {
    songCount: number
    peopleCount: number
    totalRelations: number
    isLargeDataset: boolean
  }
  performanceMetrics: {
    loadTime: number
    initializationTime: number
    bubbleGenerationTime: number
    averageFrameTime: number
    memoryUsage: number
    fps: number
  }
  scalabilityTest: {
    maxBubbles: number
    performanceAtMax: number
    recommendedBubbles: number
  }
  issues: string[]
  recommendations: string[]
}

/**
 * メモリ使用量を測定
 */
function measureMemoryUsage(): number {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return memory.usedJSHeapSize / 1024 / 1024 // MB
  }
  return 0
}

/**
 * フレームレートを測定
 */
function measureFrameRate(duration: number = 2000): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0
    const startTime = performance.now()
    
    const countFrame = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - startTime >= duration) {
        const fps = (frameCount * 1000) / (currentTime - startTime)
        resolve(fps)
      } else {
        requestAnimationFrame(countFrame)
      }
    }
    
    requestAnimationFrame(countFrame)
  })
}

/**
 * バブル生成のパフォーマンステスト
 */
function testBubbleGeneration(bubbleManager: BubbleManager, count: number): number {
  const startTime = performance.now()
  
  const bubbles: BubbleEntity[] = []
  for (let i = 0; i < count; i++) {
    const bubble = bubbleManager.generateBubble()
    if (bubble) {
      bubbles.push(bubble)
      bubbleManager.addBubble(bubble)
    }
  }
  
  const endTime = performance.now()
  return endTime - startTime
}

/**
 * スケーラビリティテスト
 */
function testScalability(bubbleManager: BubbleManager): {
  maxBubbles: number
  performanceAtMax: number
  recommendedBubbles: number
} {
  const results = []
  const testCounts = [50, 100, 150, 200, 250, 300]
  
  for (const count of testCounts) {
    // 既存のバブルをクリア
    bubbleManager.clearAllBubbles()
    
    const generationTime = testBubbleGeneration(bubbleManager, count)
    const performanceScore = count / generationTime // bubbles per ms
    
    results.push({
      count,
      generationTime,
      performanceScore
    })
    
    // パフォーマンスが著しく低下した場合は停止
    if (generationTime > 1000) { // 1秒以上かかる場合
      break
    }
  }
  
  // 最適なバブル数を推定
  const bestResult = results.reduce((best, current) => 
    current.performanceScore > best.performanceScore ? current : best
  )
  
  return {
    maxBubbles: results[results.length - 1].count,
    performanceAtMax: results[results.length - 1].performanceScore,
    recommendedBubbles: bestResult.count
  }
}

/**
 * 300曲データセットでのパフォーマンステストを実行
 */
export async function runPerformanceTest300Songs(): Promise<Performance300SongsResult> {
  const result: Performance300SongsResult = {
    success: false,
    datasetInfo: {
      songCount: 0,
      peopleCount: 0,
      totalRelations: 0,
      isLargeDataset: false
    },
    performanceMetrics: {
      loadTime: 0,
      initializationTime: 0,
      bubbleGenerationTime: 0,
      averageFrameTime: 0,
      memoryUsage: 0,
      fps: 0
    },
    scalabilityTest: {
      maxBubbles: 0,
      performanceAtMax: 0,
      recommendedBubbles: 0
    },
    issues: [],
    recommendations: []
  }

  try {
    console.log('🚀 Starting 300-song dataset performance test...')
    
    // 1. データ読み込み時間の測定
    const loadStartTime = performance.now()
    const musicService = MusicDataService.getInstance()
    const loadEndTime = performance.now()
    
    result.performanceMetrics.loadTime = loadEndTime - loadStartTime
    
    // 2. データセット情報の取得
    const datasetInfo = musicService.getDatasetInfo()
    // Calculate total relations
    const songs = musicService.getAllSongs()
    const totalRelations = songs.reduce((total, song) => 
      total + song.lyricists.length + song.composers.length + song.arrangers.length, 0
    )
    
    result.datasetInfo = {
      songCount: datasetInfo.songCount,
      peopleCount: datasetInfo.peopleCount,
      totalRelations,
      isLargeDataset: datasetInfo.isLargeDataset
    }
    
    // 300曲データセットの確認
    if (datasetInfo.songCount < 300) {
      result.issues.push(`Dataset has only ${datasetInfo.songCount} songs (expected 300)`)
    } else {
      console.log(`✅ Dataset verified: ${datasetInfo.songCount} songs`)
    }
    
    // 3. BubbleManager初期化時間の測定
    const initStartTime = performance.now()
    const musicDatabase = {
      songs: musicService.getAllSongs(),
      people: musicService.getAllPeople(),
      tags: []
    }
    
    const bubbleManager = new BubbleManager(musicDatabase, {
      ...DEFAULT_BUBBLE_CONFIG,
      canvasWidth: 1200,
      canvasHeight: 800,
      maxBubbles: 150
    })
    const initEndTime = performance.now()
    
    result.performanceMetrics.initializationTime = initEndTime - initStartTime
    
    // 4. バブル生成パフォーマンステスト
    const bubbleGenTime = testBubbleGeneration(bubbleManager, 100)
    result.performanceMetrics.bubbleGenerationTime = bubbleGenTime
    
    // 5. スケーラビリティテスト
    result.scalabilityTest = testScalability(bubbleManager)
    
    // 6. メモリ使用量測定
    result.performanceMetrics.memoryUsage = measureMemoryUsage()
    
    // 7. フレームレート測定（ブラウザ環境でのみ）
    if (typeof requestAnimationFrame !== 'undefined') {
      result.performanceMetrics.fps = await measureFrameRate(1000)
    }
    
    // 8. 平均フレーム時間の計算
    if (result.performanceMetrics.fps > 0) {
      result.performanceMetrics.averageFrameTime = 1000 / result.performanceMetrics.fps
    }
    
    // 9. パフォーマンス評価
    const performanceIssues = []
    const recommendations = []
    
    // データ読み込み時間の評価
    if (result.performanceMetrics.loadTime > 500) {
      performanceIssues.push(`Slow data loading: ${result.performanceMetrics.loadTime.toFixed(2)}ms`)
      recommendations.push('Consider data caching or lazy loading')
    }
    
    // 初期化時間の評価
    if (result.performanceMetrics.initializationTime > 200) {
      performanceIssues.push(`Slow initialization: ${result.performanceMetrics.initializationTime.toFixed(2)}ms`)
      recommendations.push('Optimize BubbleManager initialization')
    }
    
    // バブル生成時間の評価
    if (result.performanceMetrics.bubbleGenerationTime > 100) {
      performanceIssues.push(`Slow bubble generation: ${result.performanceMetrics.bubbleGenerationTime.toFixed(2)}ms for 100 bubbles`)
      recommendations.push('Optimize bubble generation algorithm')
    }
    
    // フレームレートの評価
    if (result.performanceMetrics.fps < 30) {
      performanceIssues.push(`Low frame rate: ${result.performanceMetrics.fps.toFixed(1)} FPS`)
      recommendations.push('Reduce animation complexity or bubble count')
    } else if (result.performanceMetrics.fps >= 60) {
      recommendations.push('Excellent frame rate performance')
    }
    
    // メモリ使用量の評価
    if (result.performanceMetrics.memoryUsage > 100) {
      performanceIssues.push(`High memory usage: ${result.performanceMetrics.memoryUsage.toFixed(1)}MB`)
      recommendations.push('Implement object pooling or memory optimization')
    }
    
    // スケーラビリティの評価
    if (result.scalabilityTest.maxBubbles < 100) {
      performanceIssues.push(`Low scalability: max ${result.scalabilityTest.maxBubbles} bubbles`)
      recommendations.push('Improve rendering performance for better scalability')
    }
    
    result.issues = performanceIssues
    result.recommendations = recommendations
    
    // 10. 総合評価
    const hasNoIssues = performanceIssues.length === 0
    const hasGoodPerformance = result.performanceMetrics.fps >= 30 && 
                              result.performanceMetrics.loadTime <= 500 &&
                              result.performanceMetrics.memoryUsage <= 50
    
    result.success = hasNoIssues && hasGoodPerformance && datasetInfo.songCount >= 300
    
    // 結果の出力
    console.log('\n🎯 300-Song Dataset Performance Test Results:')
    console.log('==============================================')
    console.log(`Dataset: ${result.datasetInfo.songCount} songs, ${result.datasetInfo.peopleCount} people`)
    console.log(`Load Time: ${result.performanceMetrics.loadTime.toFixed(2)}ms`)
    console.log(`Initialization: ${result.performanceMetrics.initializationTime.toFixed(2)}ms`)
    console.log(`Bubble Generation: ${result.performanceMetrics.bubbleGenerationTime.toFixed(2)}ms (100 bubbles)`)
    console.log(`Frame Rate: ${result.performanceMetrics.fps.toFixed(1)} FPS`)
    console.log(`Memory Usage: ${result.performanceMetrics.memoryUsage.toFixed(1)}MB`)
    console.log(`Scalability: Max ${result.scalabilityTest.maxBubbles} bubbles, Recommended ${result.scalabilityTest.recommendedBubbles}`)
    console.log(`Overall: ${result.success ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`)
    
    if (performanceIssues.length > 0) {
      console.log('\nIssues:')
      performanceIssues.forEach(issue => console.log(`  ❌ ${issue}`))
    }
    
    if (recommendations.length > 0) {
      console.log('\nRecommendations:')
      recommendations.forEach(rec => console.log(`  💡 ${rec}`))
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    result.issues.push(`Test execution failed: ${error}`)
    result.success = false
  }
  
  return result
}

/**
 * 開発環境での自動実行
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // ページ読み込み完了後に実行
  window.addEventListener('load', () => {
    setTimeout(() => {
      runPerformanceTest300Songs().catch(console.error)
    }, 5000) // アプリの完全な初期化を待つ
  })
}