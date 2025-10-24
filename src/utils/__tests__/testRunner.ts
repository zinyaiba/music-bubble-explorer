import { runDataValidationTests } from './dataValidation.test'
import { runDataParserTests } from './dataParser.test'
import { runRelationshipCalculatorTests } from './relationshipCalculator.test'
import { runColorSelectorTests } from './colorSelector.test'
import { runAllBubbleTests } from '../../services/__tests__/bubbleTestRunner'
import { runBubbleCanvasTests } from '../../components/__tests__/BubbleCanvasTest'
import { runDetailModalTests } from '../../components/__tests__/DetailModalTest'
import { logger } from '../../config/logConfig'

/**
 * 全てのユニットテストを実行するテストランナー
 */
export function runAllTests(): void {
  logger.debug('データモデルとユーティリティのユニットテスト開始')
  
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
    
    logger.debug('全てのテストが完了', { duration: `${duration}ms` })
    
  } catch (error) {
    logger.error('テスト実行中にエラーが発生', error)
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
  
  logger.debug('テスト関数が利用可能', {
    available: [
      'window.runTests.all() - 全てのテストを実行',
      'window.runTests.dataValidation() - データ検証テストのみ',
      'window.runTests.dataParser() - データパーサーテストのみ',
      'window.runTests.relationshipCalculator() - 関連性計算テストのみ',
      'window.runTests.colorSelector() - カラーセレクターテストのみ',
      'window.runTests.bubbleLogic() - シャボン玉ロジックテストのみ',
      'window.runTests.bubbleCanvas() - BubbleCanvasコンポーネントテストのみ'
    ]
  })
  console.log('  - window.runTests.detailModal() - DetailModalコンポーネントテストのみ')
}