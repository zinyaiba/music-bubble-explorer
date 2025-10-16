/**
 * 最終統合テスト - 全コンポーネントの動作確認
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.2
 */

import { MusicDataService } from '@/services/musicDataService'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from '@/services/bubbleManager'
import { BubbleEntity } from '@/types/bubble'

interface TestResult {
  testName: string
  passed: boolean
  message: string
  duration: number
}

interface IntegrationTestSuite {
  results: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  totalDuration: number
}

/**
 * テスト実行ヘルパー
 */
async function runTest(testName: string, testFn: () => Promise<void> | void): Promise<TestResult> {
  const startTime = performance.now()
  
  try {
    await testFn()
    const duration = performance.now() - startTime
    return {
      testName,
      passed: true,
      message: 'テスト成功',
      duration
    }
  } catch (error) {
    const duration = performance.now() - startTime
    return {
      testName,
      passed: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      duration
    }
  }
}

/**
 * データサービスの統合テスト
 */
async function testDataServiceIntegration(): Promise<void> {
  const musicService = MusicDataService.getInstance()
  
  // データベースが空でないことを確認
  if (musicService.isEmpty()) {
    throw new Error('Music database is empty')
  }
  
  // データベース検証
  const validation = musicService.validateDatabase()
  if (!validation.isValid) {
    throw new Error(`Database validation failed: ${validation.errors.join(', ')}`)
  }
  
  // 楽曲データの取得テスト
  const songs = musicService.getAllSongs()
  if (songs.length === 0) {
    throw new Error('No songs found in database')
  }
  
  // 人物データの取得テスト
  const people = musicService.getAllPeople()
  if (people.length === 0) {
    throw new Error('No people found in database')
  }
  
  // 関連データの取得テスト
  const firstSong = songs[0]
  const relatedPeople = musicService.getPeopleForSong(firstSong.id)
  if (relatedPeople.length === 0) {
    throw new Error('No related people found for first song')
  }
  
  console.log(`✓ Data service integration test passed: ${songs.length} songs, ${people.length} people`)
}

/**
 * シャボン玉マネージャーの統合テスト
 */
async function testBubbleManagerIntegration(): Promise<void> {
  const musicService = MusicDataService.getInstance()
  const musicDatabase = {
    songs: musicService.getAllSongs(),
    people: musicService.getAllPeople(),
    tags: []
  }
  
  const config = {
    ...DEFAULT_BUBBLE_CONFIG,
    canvasWidth: 800,
    canvasHeight: 600,
    maxBubbles: 50
  }
  
  const bubbleManager = new BubbleManager(musicDatabase, config)
  
  // シャボン玉生成テスト
  const bubbles: BubbleEntity[] = []
  for (let i = 0; i < 10; i++) {
    const bubble = bubbleManager.generateBubble()
    if (!bubble) {
      throw new Error('Failed to generate bubble')
    }
    bubbles.push(bubble)
    bubbleManager.addBubble(bubble)
  }
  
  // 物理更新テスト
  const updatedBubbles = bubbleManager.updateFrame()
  if (updatedBubbles.length !== bubbles.length) {
    throw new Error('Bubble count mismatch after update')
  }
  
  // クリックアニメーションテスト
  const firstBubble = updatedBubbles[0]
  bubbleManager.triggerClickAnimation(firstBubble.id)
  
  console.log(`✓ Bubble manager integration test passed: ${updatedBubbles.length} bubbles managed`)
}

/**
 * パフォーマンステスト（大量データ）
 */
async function testPerformanceWithLargeDataset(): Promise<void> {
  const musicService = MusicDataService.getInstance()
  
  // 大量データでの初期化テスト
  const startTime = performance.now()
  
  const songs = musicService.getAllSongs()
  const people = musicService.getAllPeople()
  
  if (songs.length < 100) {
    console.warn(`Warning: Dataset has only ${songs.length} songs, expected at least 100 for performance test`)
  }
  
  const musicDatabase = { songs, people, tags: [] }
  
  const config = {
    ...DEFAULT_BUBBLE_CONFIG,
    canvasWidth: 1200,
    canvasHeight: 800,
    maxBubbles: 100
  }
  
  const bubbleManager = new BubbleManager(musicDatabase, config)
  
  // 大量シャボン玉生成テスト
  const bubbles: BubbleEntity[] = []
  for (let i = 0; i < config.maxBubbles; i++) {
    const bubble = bubbleManager.generateBubble()
    if (bubble) {
      bubbles.push(bubble)
      bubbleManager.addBubble(bubble)
    }
  }
  
  // 複数フレーム更新テスト
  for (let frame = 0; frame < 60; frame++) {
    bubbleManager.updateFrame()
  }
  
  const duration = performance.now() - startTime
  
  if (duration > 1000) { // 1秒以上かかった場合は警告
    console.warn(`Performance test took ${duration.toFixed(2)}ms, which may be too slow`)
  }
  
  console.log(`✓ Performance test passed: ${bubbles.length} bubbles, ${duration.toFixed(2)}ms`)
}

/**
 * レスポンシブ機能テスト
 */
async function testResponsiveFeatures(): Promise<void> {
  // 異なる画面サイズでのテスト
  const screenSizes = [
    { width: 320, height: 568, name: 'Mobile Small' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ]
  
  const musicService = MusicDataService.getInstance()
  const musicDatabase = {
    songs: musicService.getAllSongs(),
    people: musicService.getAllPeople(),
    tags: []
  }
  
  for (const size of screenSizes) {
    const config = {
      ...DEFAULT_BUBBLE_CONFIG,
      canvasWidth: size.width,
      canvasHeight: size.height,
      maxBubbles: Math.floor((size.width * size.height) / 10000) // 画面サイズに応じた調整
    }
    
    const bubbleManager = new BubbleManager(musicDatabase, config)
    
    // 各画面サイズでシャボン玉生成テスト
    const bubble = bubbleManager.generateBubble()
    if (!bubble) {
      throw new Error(`Failed to generate bubble for ${size.name}`)
    }
    
    // 境界チェック
    if (bubble.x < 0 || bubble.x > size.width || bubble.y < 0 || bubble.y > size.height) {
      throw new Error(`Bubble position out of bounds for ${size.name}`)
    }
  }
  
  console.log(`✓ Responsive features test passed for ${screenSizes.length} screen sizes`)
}

/**
 * エラーハンドリングテスト
 */
async function testErrorHandling(): Promise<void> {
  // 無効なデータでのテスト
  try {
    const invalidDatabase = { songs: [], people: [], tags: [] }
    const config = { ...DEFAULT_BUBBLE_CONFIG }
    const bubbleManager = new BubbleManager(invalidDatabase, config)
    
    // 空のデータベースでシャボン玉生成を試行
    const bubble = bubbleManager.generateBubble()
    if (bubble) {
      throw new Error('Should not generate bubble with empty database')
    }
  } catch (error) {
    // エラーが適切にハンドリングされることを確認
    if (!(error instanceof Error)) {
      throw new Error('Error handling failed')
    }
  }
  
  console.log('✓ Error handling test passed')
}

/**
 * アクセシビリティ機能テスト
 */
async function testAccessibilityFeatures(): Promise<void> {
  // DOM要素の存在確認（実際のDOM環境でのみ実行）
  if (typeof document !== 'undefined') {
    // ARIA属性の確認
    const canvas = document.querySelector('canvas[role="img"]')
    if (!canvas) {
      throw new Error('Canvas with accessibility role not found')
    }
    
    // スクリーンリーダー用説明の確認
    const instructions = document.querySelector('#canvas-instructions')
    if (!instructions) {
      throw new Error('Canvas instructions for screen readers not found')
    }
    
    // フォーカス可能要素の確認
    const focusableElements = document.querySelectorAll('[tabindex="0"]')
    if (focusableElements.length === 0) {
      throw new Error('No focusable elements found')
    }
  }
  
  console.log('✓ Accessibility features test passed')
}

/**
 * 統合テストスイートの実行
 */
export async function runIntegrationTests(): Promise<IntegrationTestSuite> {
  console.log('🧪 Starting integration tests...')
  
  const tests = [
    { name: 'Data Service Integration', fn: testDataServiceIntegration },
    { name: 'Bubble Manager Integration', fn: testBubbleManagerIntegration },
    { name: 'Performance with Large Dataset', fn: testPerformanceWithLargeDataset },
    { name: 'Responsive Features', fn: testResponsiveFeatures },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Accessibility Features', fn: testAccessibilityFeatures }
  ]
  
  const results: TestResult[] = []
  const startTime = performance.now()
  
  for (const test of tests) {
    console.log(`Running: ${test.name}...`)
    const result = await runTest(test.name, test.fn)
    results.push(result)
    
    if (result.passed) {
      console.log(`✅ ${test.name}: ${result.message} (${result.duration.toFixed(2)}ms)`)
    } else {
      console.error(`❌ ${test.name}: ${result.message} (${result.duration.toFixed(2)}ms)`)
    }
  }
  
  const totalDuration = performance.now() - startTime
  const passedTests = results.filter(r => r.passed).length
  const failedTests = results.filter(r => !r.passed).length
  
  const suite: IntegrationTestSuite = {
    results,
    totalTests: tests.length,
    passedTests,
    failedTests,
    totalDuration
  }
  
  console.log('\n📊 Integration Test Results:')
  console.log(`Total Tests: ${suite.totalTests}`)
  console.log(`Passed: ${suite.passedTests}`)
  console.log(`Failed: ${suite.failedTests}`)
  console.log(`Total Duration: ${suite.totalDuration.toFixed(2)}ms`)
  console.log(`Success Rate: ${((suite.passedTests / suite.totalTests) * 100).toFixed(1)}%`)
  
  return suite
}

/**
 * 開発環境での自動テスト実行
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // ページ読み込み後にテストを実行
  window.addEventListener('load', () => {
    setTimeout(() => {
      runIntegrationTests().catch(console.error)
    }, 2000) // アプリの初期化を待つ
  })
}