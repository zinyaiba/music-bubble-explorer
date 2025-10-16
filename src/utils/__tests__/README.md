# データモデルとユーティリティのユニットテスト

このディレクトリには、Music Bubble Explorerのデータモデルとユーティリティクラスのユニットテストが含まれています。

## テストファイル構成

### 1. `dataValidation.test.ts`
`DataValidator`クラスのテスト

**テスト内容:**
- 楽曲データの検証（有効・無効なデータ）
- 人物データの検証（有効・無効なデータ）
- データベース全体の整合性検証
- 統計情報の計算テスト

### 2. `dataParser.test.ts`
`DataParser`クラスのテスト

**テスト内容:**
- JSONデータのパース（有効・無効なデータ）
- CSVデータのパース
- データの正規化処理
- エラーハンドリング

### 3. `relationshipCalculator.test.ts`
`RelationshipCalculator`クラスのテスト

**テスト内容:**
- シャボン玉サイズ計算
- 協力関係の強さ計算
- 楽曲の複雑さ計算
- 人物の影響力計算
- 楽曲ジャンル推定
- 関連楽曲・人物の推薦

### 4. `testRunner.ts`
全テストの実行とテストフレームワーク

**機能:**
- 全テストスイートの一括実行
- 個別テストスイートの実行
- テスト結果の集計と表示

## テスト実行方法

### 開発環境での実行

1. **ブラウザのコンソールで実行:**
   ```javascript
   // 全てのテストを実行
   window.runTests.all()
   
   // 個別のテストスイートを実行
   window.runTests.dataValidation()
   window.runTests.dataParser()
   window.runTests.relationshipCalculator()
   ```

2. **コード内での実行:**
   ```typescript
   import { runAllTests } from './utils/__tests__/testRunner'
   
   // 全テストを実行
   runAllTests()
   ```

### テスト結果の見方

- ✅ 成功したテスト
- ❌ 失敗したテスト（エラー詳細も表示）
- 📊 テスト結果サマリー（成功数/総数）

## テストカバレッジ

### DataValidator
- [x] 楽曲データの基本検証
- [x] 人物データの基本検証
- [x] データベース全体の整合性
- [x] 関連性の検証
- [x] 統計情報の計算

### DataParser
- [x] JSONデータのパース
- [x] CSVデータのパース
- [x] エラーハンドリング
- [x] データ正規化
- [x] 境界値テスト

### RelationshipCalculator
- [x] シャボン玉サイズ計算
- [x] 協力関係の計算
- [x] 楽曲複雑さの計算
- [x] 人物影響力の計算
- [x] ジャンル推定
- [x] 推薦機能

## テストデータ

テストでは以下のようなデータを使用しています：

```typescript
// サンプル楽曲データ
{
  id: 'song_001',
  title: 'テスト楽曲',
  lyricists: ['作詞家A'],
  composers: ['作曲家B'],
  arrangers: ['編曲家C']
}

// サンプル人物データ
{
  id: 'person_001',
  name: '作詞家A',
  type: 'lyricist',
  songs: ['song_001']
}
```

## エラーケースのテスト

以下のエラーケースもテストしています：

1. **データ形式エラー**
   - 必須フィールドの欠如
   - 不正なデータ型
   - 空の値

2. **関連性エラー**
   - 存在しない楽曲/人物の参照
   - 循環参照
   - 重複データ

3. **境界値エラー**
   - 空のデータセット
   - 最大/最小値の処理
   - null/undefined の処理

## テストの拡張

新しいテストを追加する場合：

1. 適切なテストファイルに追加
2. `SimpleTest`クラスを使用してテストを記述
3. `testRunner.ts`に新しいテストスイートを登録（必要に応じて）

```typescript
test.test('新しいテスト', () => {
  // テストロジック
  test.expect(actual).toBe(expected)
})
```

## 注意事項

- テストは開発環境でのみ実行されます
- 本番環境ではテストコードは含まれません
- テスト実行時はコンソールに詳細なログが出力されます
- エラーが発生した場合は、詳細なエラーメッセージが表示されます