# シャボン玉ロジックのユニットテスト

このディレクトリには、Music Bubble Explorerのシャボン玉関連ロジックのユニットテストが含まれています。

## テストファイル構成

### 1. `bubbleManager.test.ts`
`BubbleManager`クラスのテスト

**テスト内容:**
- BubbleManagerの初期化
- サイズ計算アルゴリズム（最小・最大・中間・境界値）
- シャボン玉生成（基本生成、位置範囲、速度範囲）
- シャボン玉の追加・削除
- 最大シャボン玉数の制限
- 物理更新（基本移動、死んだシャボン玉の除去）
- 座標からシャボン玉を検索（ヒット・ミス）
- シャボン玉数の維持
- 全シャボン玉のクリア
- 設定の更新
- 統計情報の取得

### 2. `../types/__tests__/bubble.test.ts`
`BubbleEntity`クラスのテスト

**テスト内容:**
- BubbleEntityの初期化（基本プロパティ、カスタムID、自動ID生成）
- 物理更新（位置更新、年齢・ライフスパン更新、透明度フェードアウト）
- 生存状態チェック（生きている状態、寿命切れ、透明度0）
- 境界チェック（画面内・外、マージン考慮）
- 点の包含テスト（中心点、境界内・外、境界ちょうど）
- 速度設定
- 位置設定
- アニメーション状態の設定・取得
- シャボン玉のクローン（基本プロパティ、内部状態、独立性）

### 3. `bubbleTestRunner.ts`
シャボン玉テスト専用のテストランナー

**機能:**
- 全シャボン玉テストの一括実行
- 個別テストスイートの実行
- テスト結果の集計と表示

### 4. `runBubbleTests.ts`
スタンドアロンテスト実行スクリプト

## テスト実行方法

### 開発環境での実行

1. **ブラウザのコンソールで実行:**
   ```javascript
   // 全てのシャボン玉テストを実行
   window.runBubbleTests.all()
   
   // 個別のテストスイートを実行
   window.runBubbleTests.bubbleEntity()
   window.runBubbleTests.bubbleManager()
   ```

2. **メインテストランナーから実行:**
   ```javascript
   // 全てのテスト（データ + シャボン玉）を実行
   window.runTests.all()
   
   // シャボン玉テストのみ実行
   window.runTests.bubbleLogic()
   ```

3. **コード内での実行:**
   ```typescript
   import { runAllBubbleTests } from './services/__tests__/bubbleTestRunner'
   
   // 全シャボン玉テストを実行
   runAllBubbleTests()
   ```

## テストカバレッジ

### BubbleManager
- [x] 初期化とコンストラクタ
- [x] サイズ計算アルゴリズム（全ケース）
- [x] シャボン玉生成ロジック
- [x] シャボン玉の追加・削除・検索
- [x] 物理更新とアニメーション
- [x] 境界処理と衝突判定
- [x] 設定管理と統計情報
- [x] エラーハンドリング

### BubbleEntity
- [x] オブジェクトの初期化と状態管理
- [x] 物理計算（位置、速度、時間）
- [x] ライフサイクル管理（生成、更新、消滅）
- [x] 境界判定とクリック判定
- [x] アニメーション状態管理
- [x] オブジェクトのクローンと独立性
- [x] 各種セッター・ゲッター

## テストデータ

テストでは以下のようなデータを使用しています：

```typescript
// サンプル楽曲データベース
const testDatabase: MusicDatabase = {
  songs: [
    {
      id: 'song_001',
      title: 'テスト楽曲1',
      lyricists: ['作詞家A', '作詞家B'],
      composers: ['作曲家A'],
      arrangers: ['編曲家A', '編曲家B', '編曲家C']
    }
    // ... 他の楽曲
  ],
  people: [
    {
      id: 'person_001',
      name: '作詞家A',
      type: 'lyricist',
      songs: ['song_001', 'song_002']
    }
    // ... 他の人物
  ]
}

// テスト用シャボン玉設定
const testConfig: BubbleConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  maxBubbles: 10,
  minLifespan: 5000,
  maxLifespan: 15000,
  minVelocity: 10,
  maxVelocity: 50
}
```

## テストされるアルゴリズム

### 1. サイズ計算アルゴリズム
```typescript
function calculateBubbleSize(relatedCount: number): number {
  const minSize = 40
  const maxSize = 120
  const normalizedCount = Math.min(relatedCount / 20, 1)
  return minSize + (maxSize - minSize) * normalizedCount
}
```

**テストケース:**
- 関連数0 → サイズ40（最小）
- 関連数20以上 → サイズ120（最大）
- 関連数10 → サイズ80（中間）
- 関連数1 → サイズ44（境界値）

### 2. 物理更新アルゴリズム
- 位置更新: `x += vx * deltaTime`
- 速度減衰: `vx *= 0.99`（空気抵抗）
- 重力効果: `vy -= 10 * deltaTime`（浮力）
- 境界反射: 壁に当たると速度反転 + 減衰

### 3. ライフサイクル管理
- 年齢更新: `age += deltaTime`
- 寿命減少: `lifespan = maxLifespan - age`
- フェードアウト: 寿命80%以降で透明度減少

## エラーケースのテスト

以下のエラーケースもテストしています：

1. **境界値エラー**
   - サイズ0のシャボン玉
   - 負の座標
   - 画面外への移動

2. **状態エラー**
   - 寿命切れのシャボン玉
   - 透明度0のシャボン玉
   - 存在しないIDでの削除

3. **物理計算エラー**
   - 極端な速度値
   - NaN値の処理
   - 時間差分0での更新

## パフォーマンステスト

大量のシャボン玉での動作確認：
- 最大シャボン玉数での生成・更新
- 長時間実行でのメモリリーク確認
- 高頻度更新での処理性能

## 注意事項

- テストは開発環境でのみ実行されます
- 本番環境ではテストコードは含まれません
- 物理計算のテストでは浮動小数点の精度を考慮しています
- アニメーション関連のテストは時間に依存する部分があります

## Requirements Coverage

このテストは以下の要件をカバーしています：

- **Requirement 1.4**: シャボン玉のサイズが関連データ数に比例する
- **Requirement 2.4**: シャボン玉のサイズ決定ロジック

テストにより、シャボン玉の生成、更新、削除、物理計算、ライフサイクル管理が正常に動作することが確認されています。