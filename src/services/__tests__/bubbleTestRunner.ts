import { runBubbleManagerTests } from './bubbleManager.test'
import { runBubbleEntityTests } from '../../types/__tests__/bubble.test'

/**
 * シャボン玉関連の全てのユニットテストを実行するテストランナー
 */
export function runAllBubbleTests(): void {
  console.log('🫧 シャボン玉ロジックのユニットテスト開始')
  console.log('=' .repeat(60))
  
  const startTime = Date.now()
  
  try {
    // 各テストスイートを実行
    runBubbleEntityTests()
    runBubbleManagerTests()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('=' .repeat(60))
    console.log(`🎉 シャボン玉テストが完了しました！ (実行時間: ${duration}ms)`)
    console.log('✅ シャボン玉ロジックは正常に動作しています')
    
  } catch (error) {
    console.error('❌ シャボン玉テスト実行中にエラーが発生しました:', error)
    throw error
  }
}

/**
 * 個別のテストスイートを実行する関数
 */
export const bubbleTestSuites = {
  bubbleEntity: runBubbleEntityTests,
  bubbleManager: runBubbleManagerTests,
  all: runAllBubbleTests
}

// 開発環境でのテスト実行用のヘルパー
// コンソールでテストを実行するためのグローバル関数を定義
if (typeof window !== 'undefined') {
  (window as any).runBubbleTests = bubbleTestSuites
  
  console.log('🧪 シャボン玉テスト関数が利用可能です:')
  console.log('  - window.runBubbleTests.all() - 全てのシャボン玉テストを実行')
  console.log('  - window.runBubbleTests.bubbleEntity() - BubbleEntityテストのみ')
  console.log('  - window.runBubbleTests.bubbleManager() - BubbleManagerテストのみ')
}