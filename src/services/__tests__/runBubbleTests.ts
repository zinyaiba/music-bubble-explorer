/**
 * シャボン玉テストの実行スクリプト
 * 開発環境でテストを実行するためのスタンドアロンスクリプト
 */

import { runAllBubbleTests } from './bubbleTestRunner'

// テストを実行
console.log('シャボン玉ロジックのユニットテストを開始します...')
console.log('')

try {
  runAllBubbleTests()
  console.log('')
  console.log('✅ 全てのシャボン玉テストが正常に完了しました！')
} catch (error) {
  console.error('')
  console.error('❌ テスト実行中にエラーが発生しました:')
  console.error(error)
  process.exit(1)
}