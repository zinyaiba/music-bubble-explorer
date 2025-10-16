import { runDataValidationTests } from './dataValidation.test'
import { runDataParserTests } from './dataParser.test'
import { runRelationshipCalculatorTests } from './relationshipCalculator.test'
import { runColorSelectorTests } from './colorSelector.test'
import { runAllBubbleTests } from '../../services/__tests__/bubbleTestRunner'
import { runBubbleCanvasTests } from '../../components/__tests__/BubbleCanvasTest'
import { runDetailModalTests } from '../../components/__tests__/DetailModalTest'

/**
 * 全てのユニットテストを実行するテストランナー
 */
export function runAllTests(): void {
  console.log('🚀 データモデルとユーティリティのユニットテスト開始')
  console.log('=' .repeat(60))
  
  const startTime = Date.now()
  
  try {
    // 各テストスイートを実行
    runDataValidationTests()
    runDataParserTests()
    runRelationshipCalculatorTests()
    runColorSelectorTests()
    runAllBubbleTests()
    runBubbleCanvasTests()
    runDetailModalTests()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log('=' .repeat(60))
    console.log(`🎉 全てのテストが完了しました！ (実行時間: ${duration}ms)`)
    console.log('✅ データモデルとユーティリティは正常に動作しています')
    
  } catch (error) {
    console.error('❌ テスト実行中にエラーが発生しました:', error)
    throw error
  }
}

/**
 * 個別のテストスイートを実行する関数
 */
export const testSuites = {
  dataValidation: runDataValidationTests,
  dataParser: runDataParserTests,
  relationshipCalculator: runRelationshipCalculatorTests,
  colorSelector: runColorSelectorTests,
  bubbleLogic: runAllBubbleTests,
  bubbleCanvas: runBubbleCanvasTests,
  detailModal: runDetailModalTests,
  all: runAllTests
}

// 開発環境でのテスト実行用のヘルパー
// コンソールでテストを実行するためのグローバル関数を定義
if (typeof window !== 'undefined') {
  (window as any).runTests = testSuites
  
  console.log('🧪 テスト関数が利用可能です:')
  console.log('  - window.runTests.all() - 全てのテストを実行')
  console.log('  - window.runTests.dataValidation() - データ検証テストのみ')
  console.log('  - window.runTests.dataParser() - データパーサーテストのみ')
  console.log('  - window.runTests.relationshipCalculator() - 関連性計算テストのみ')
  console.log('  - window.runTests.colorSelector() - カラーセレクターテストのみ')
  console.log('  - window.runTests.bubbleLogic() - シャボン玉ロジックテストのみ')
  console.log('  - window.runTests.bubbleCanvas() - BubbleCanvasコンポーネントテストのみ')
  console.log('  - window.runTests.detailModal() - DetailModalコンポーネントテストのみ')
}