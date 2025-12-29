# 実装計画: タグX共有機能

## 概要

タグ一覧からX（旧Twitter）への共有機能を実装する。共有テキストのクリップボードコピーとディープリンク処理の2つの主要機能を段階的に実装する。

## タスク

- [x] 1. TagShareServiceの実装
  - [x] 1.1 TagShareServiceクラスの作成
    - `src/services/tagShareService.ts` を作成
    - シングルトンパターンで実装
    - `generateShareText`, `generateDeepLink`, `encodeTagName`, `decodeTagName` メソッドを実装
    - _要件: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3_

  - [ ]* 1.2 TagShareServiceのプロパティテスト
    - **Property 4: タグ名のエンコード/デコードのラウンドトリップ一貫性**
    - **検証対象: 要件 2.5, 4.4, 5.3, 5.4**

  - [ ]* 1.3 共有テキスト生成のプロパティテスト
    - **Property 1: 共有テキストにハッシュタグ付きタグ名が含まれる**
    - **Property 2: 共有テキストに有効なディープリンクURLが含まれる**
    - **Property 3: 共有テキストの長さが280文字以下**
    - **検証対象: 要件 2.1, 2.2, 2.4, 5.1**

  - [x] 1.4 クリップボードコピー機能の実装
    - `copyToClipboard` メソッドを実装
    - Clipboard API対応、フォールバック処理
    - _要件: 3.1, 3.3_

  - [x] 1.5 Web Share API対応（オプション）
    - `shareNative`, `isNativeShareAvailable` メソッドを実装
    - _要件: 6.1_

- [x] 2. DeepLinkHandlerの実装
  - [x] 2.1 DeepLinkHandler関数の作成
    - `src/utils/deepLinkHandler.ts` を作成
    - `parseTagFromUrl`, `validateTagExists`, `initializeDeepLink` 関数を実装
    - _要件: 4.1, 4.3, 4.4_

  - [ ]* 2.2 DeepLinkHandlerのプロパティテスト
    - **Property 5: URLパラメータからタグ名が正しく解析される**
    - **検証対象: 要件 4.1**

  - [ ]* 2.3 DeepLinkHandlerのユニットテスト
    - 各種URLパラメータの解析テスト
    - タグ存在チェックのテスト
    - エラーケースのテスト
    - _要件: 4.1, 4.3, 4.4_

- [x] 3. TagShareButtonコンポーネントの実装
  - [x] 3.1 TagShareButtonコンポーネントの作成
    - `src/components/TagShareButton.tsx` を作成
    - `src/components/TagShareButton.css` を作成
    - 共有ボタンのUI実装（アイコン、タッチターゲットサイズ）
    - _要件: 1.1, 1.2, 1.3_

  - [x] 3.2 共有成功通知の実装
    - 成功通知の表示（「コピーしました！Xに貼り付けてね」）
    - 3秒後の自動非表示
    - _要件: 3.2, 3.4_

  - [ ]* 3.3 TagShareButtonのユニットテスト
    - ボタン表示のテスト
    - クリックイベントのテスト
    - 通知表示のテスト
    - _要件: 1.1, 3.2_

- [x] 4. EnhancedTagListへの統合
  - [x] 4.1 EnhancedTagListにTagShareButtonを追加
    - 各タグアイテムに共有ボタンを配置
    - タグ詳細クリックとの干渉防止
    - _要件: 1.1, 1.3_

  - [x] 4.2 共有通知のグローバル表示
    - 共有成功/失敗通知をEnhancedTagList内で管理
    - _要件: 3.2, 3.3, 3.4_

- [x] 5. App.tsxへのディープリンク統合
  - [x] 5.1 ディープリンク初期化処理の追加
    - アプリ起動時にURLパラメータをチェック
    - タグパラメータがある場合はタグ詳細画面を自動表示
    - _要件: 4.2, 4.5_

  - [x] 5.2 エラーハンドリングの実装
    - タグが見つからない場合のエラー表示
    - メイン画面へのフォールバック
    - _要件: 4.3_

- [ ] 6. チェックポイント - すべてのテストが通ることを確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

## 備考

- `*` マークのタスクはオプションで、MVPでは省略可能
- 各タスクは特定の要件を参照しており、トレーサビリティを確保
- プロパティテストは `fast-check` ライブラリを使用
- チェックポイントで段階的な検証を実施
