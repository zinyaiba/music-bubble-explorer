# Implementation Plan

- [ ] 1. データモデルとバリデーションの拡張
  - Song型に新しいフィールドを追加（artists, releaseYear, singleName, albumName, jacketImageUrl, detailPageUrls）
  - バリデーション関数を実装（URL形式、文字数制限、数値範囲）
  - _Requirements: 9.1-9.4, 10.1-10.4, 11.1-11.3, 12.1-12.3, 13.1-13.5, 14.1-14.7_

- [ ]* 1.1 Write property test for URL validation
  - **Property 11: URL形式のバリデーション**
  - **Validates: Requirements 13.3, 14.4**

- [ ]* 1.2 Write property test for text length validation
  - **Property 8: テキスト入力の文字数制限**
  - **Validates: Requirements 9.3, 11.3, 12.3**

- [ ]* 1.3 Write property test for release year validation
  - **Property 10: 発売年の数値バリデーション**
  - **Validates: Requirements 10.3, 10.4**

- [ ]* 1.4 Write property test for URL length validation
  - **Property 13: URL文字数制限**
  - **Validates: Requirements 13.5, 14.7**

- [ ] 2. JacketImage コンポーネントの実装
  - 外部URLから画像を読み込むコンポーネントを作成
  - 読み込みエラー時のフォールバック処理を実装
  - レスポンシブサイズ調整を実装
  - 画像クリック時の拡大表示機能を実装
  - _Requirements: 2.1-2.5_

- [ ]* 2.1 Write property test for image display and fallback
  - **Property 1: ジャケット画像の表示とフォールバック**
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ]* 2.2 Write property test for image size constraints
  - **Property 2: ジャケット画像のサイズ制約**
  - **Validates: Requirements 2.4**

- [ ]* 2.3 Write property test for responsive image sizing
  - **Property 19: レスポンシブ画像サイズ調整**
  - **Validates: Requirements 17.3**

- [ ]* 2.4 Write unit tests for JacketImage component
  - Test valid URL rendering
  - Test invalid URL fallback
  - Test click handler
  - _Requirements: 2.1-2.5_

- [ ] 3. DetailUrlList コンポーネントの実装
  - 動的URL入力フィールドリストを作成
  - 追加ボタンと削除ボタンを実装
  - 最大数（10個）の制限を実装
  - URL形式のバリデーションを統合
  - _Requirements: 14.1-14.7_

- [ ]* 3.1 Write property test for dynamic URL field addition
  - **Property 14: 動的URL入力フィールドの追加**
  - **Validates: Requirements 14.2, 14.6**

- [ ]* 3.2 Write property test for dynamic URL field deletion
  - **Property 15: 動的URL入力フィールドの削除**
  - **Validates: Requirements 14.5**

- [ ]* 3.3 Write unit tests for DetailUrlList component
  - Test add button functionality
  - Test delete button functionality
  - Test max limit enforcement
  - _Requirements: 14.1-14.7_

- [ ] 4. SongDetailView コンポーネントの実装
  - StandardLayoutを使用した全画面ビューを作成
  - 楽曲データの取得と表示ロジックを実装
  - JacketImageコンポーネントを統合
  - クリエイター情報、アーティスト名、発売年、収録作品情報の表示を実装
  - 楽曲詳細ページURLリストの表示を実装
  - 編集・削除ボタンを配置
  - _Requirements: 1.1-1.5, 2.1-2.5, 3.1-3.4, 4.1-4.3, 5.1-5.3, 6.1-6.2, 7.1-7.2, 8.1-8.4_

- [ ]* 4.1 Write property test for creator info display
  - **Property 3: クリエイター情報のカンマ区切り表示**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ]* 4.2 Write property test for artist name display
  - **Property 4: アーティスト名の表示**
  - **Validates: Requirements 4.1, 4.3**

- [ ]* 4.3 Write property test for release year display
  - **Property 5: 発売年の4桁表示**
  - **Validates: Requirements 5.1**

- [ ]* 4.4 Write property test for album info display
  - **Property 6: 収録作品情報の表示**
  - **Validates: Requirements 6.1, 7.1**

- [ ]* 4.5 Write property test for detail URL list display
  - **Property 7: 楽曲詳細ページURLのリスト表示**
  - **Validates: Requirements 8.1, 8.4**

- [ ]* 4.6 Write property test for long text wrapping
  - **Property 20: 長いテキストの折り返し**
  - **Validates: Requirements 17.4**

- [ ] 5. SongManagement コンポーネントの拡張
  - 楽曲アイテムのクリックハンドラを追加
  - SongDetailViewへの遷移ロジックを実装
  - 既存の編集・削除機能を維持
  - _Requirements: 1.1-1.5_

- [ ] 6. SongRegistrationForm コンポーネントの拡張
  - アーティスト名入力フィールドを追加
  - 発売年入力フィールドを追加（数値のみ）
  - 収録シングル入力フィールドを追加
  - 収録アルバム入力フィールドを追加
  - ジャケット画像URL入力フィールドとプレビューを追加
  - DetailUrlListコンポーネントを統合
  - フォームバリデーションを拡張
  - カンマ区切り文字列から配列への変換ロジックを実装
  - _Requirements: 9.1-9.4, 10.1-10.4, 11.1-11.3, 12.1-12.3, 13.1-13.5, 14.1-14.7, 15.1-15.5_

- [ ]* 6.1 Write property test for comma-separated input
  - **Property 9: カンマ区切り入力の許可**
  - **Validates: Requirements 9.4**

- [ ]* 6.2 Write property test for URL preview display
  - **Property 12: URL入力プレビュー表示**
  - **Validates: Requirements 13.4**

- [ ]* 6.3 Write property test for existing data display in edit mode
  - **Property 16: 編集画面での既存データ表示**
  - **Validates: Requirements 15.1**

- [ ]* 6.4 Write property test for input change handling
  - **Property 17: 入力変更の受け付け**
  - **Validates: Requirements 15.2**

- [ ] 7. Firebase統合とデータ永続化
  - DataManagerのsaveSong/updateSongメソッドが拡張フィールドを処理することを確認
  - Firebaseスキーマが新しいフィールドを受け入れることを確認
  - エラーハンドリングを実装（既存のgetDetailedErrorMessageを使用）
  - _Requirements: 16.1-16.4_

- [ ]* 7.1 Write property test for Firebase round-trip
  - **Property 18: Firebaseデータのラウンドトリップ**
  - **Validates: Requirements 16.1, 16.4**

- [ ] 8. スタイリングとレスポンシブ対応
  - SongDetailView用のCSSを作成
  - JacketImage用のCSSを作成
  - DetailUrlList用のCSSを作成
  - SongRegistrationForm用のCSSを拡張
  - モバイル最適化（768px未満）を実装
  - 既存のStandardLayoutスタイルを活用
  - _Requirements: 17.1-17.4, 18.1-18.4_

- [ ] 9. エラーハンドリングの実装
  - 画像読み込みエラーのハンドリング
  - URLバリデーションエラーの表示
  - 文字数制限エラーの表示
  - Firebase保存エラーの表示
  - データ取得エラーの表示
  - _Requirements: All error scenarios_

- [ ] 10. Checkpoint - すべてのテストが通ることを確認
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. 統合テストとマニュアルテスト
  - 楽曲詳細画面の表示フローをテスト
  - 楽曲登録フローをテスト
  - 画像表示フローをテスト
  - モバイルデバイスでの表示確認（手動）
  - 画像読み込みパフォーマンス確認（手動）
  - _Requirements: All_

- [ ] 12. ドキュメントとコードクリーンアップ
  - コンポーネントにJSDocコメントを追加
  - README更新（新機能の説明）
  - 不要なコンソールログを削除
  - コードフォーマットを統一
