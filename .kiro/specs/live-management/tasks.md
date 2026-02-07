# 実装計画: ライブ管理機能

## 概要

Music Bubble Explorer V2にライブ情報管理機能を追加する。ナビゲーションの改善（タグページ統合）、ライブのCRUD操作、セトリ管理、日替わり曲表示を実装する。

## タスク

- [x] 1. 型定義とデータモデルの追加
  - [x] 1.1 Live, SetlistItem, LiveType の型定義を追加
    - `src/types/index.ts` に型定義を追加
    - LiveType: 'tour' | 'solo' | 'festival'
    - SetlistItem: songId?, songTitle, order, isDailySong
    - Live: id, liveType, title, venueName, dateTime, tourLocation?, setlist, createdAt?, updatedAt?
    - _要件: 3.1, 3.2, 3.4, 3.5, 3.6_

- [x] 2. ライブサービスの実装
  - [x] 2.1 liveService の基本構造を作成
    - `src/services/liveService.ts` を新規作成
    - FirebaseServiceと同様のシングルトンパターンを使用
    - livesコレクションへのアクセスを実装
    - _要件: 3.7_
  - [x] 2.2 ライブCRUD操作を実装
    - getAllLives(): Promise<Live[]>
    - getLiveById(liveId: string): Promise<Live | null>
    - createLive(liveData): Promise<string>
    - updateLive(liveId, liveData): Promise<void>
    - deleteLive(liveId): Promise<void>
    - _要件: 6.8, 7.6, 8.2_
  - [x] 2.3 ライブソート機能を実装
    - sortLivesByDate(): 日時の降順ソート
    - _要件: 4.4_
  - [ ]* 2.4 liveServiceのプロパティテストを作成
    - **Property 10: ライブデータのラウンドトリップ**
    - **Property 12: ライブ削除後の取得不可**
    - **Property 5: ライブのソート順**
    - **検証対象: 要件 4.4, 6.8, 7.6, 8.2**

- [x] 3. チェックポイント - サービス層の確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

- [x] 4. ナビゲーションの更新
  - [x] 4.1 ナビゲーションアイテムを更新
    - `src/components/common/Navigation.tsx` を修正
    - 「タグ一覧」「タグ登録」を「タグ」に統合
    - 「ライブ」メニュー項目を追加（楽曲とタグの間）
    - 5項目: TOP, 楽曲, ライブ, タグ, お知らせ
    - _要件: 1.1, 1.2, 1.3, 1.4_

- [x] 5. タグページの統合
  - [x] 5.1 TabSwitcherコンポーネントを作成
    - `src/components/common/TabSwitcher.tsx` を新規作成
    - タブの切り替えUIを実装
    - アクティブタブのスタイリング
    - _要件: 2.1_
  - [x] 5.2 統合TagPageを作成
    - `src/pages/TagPage.tsx` を新規作成
    - 既存のTagListPage, TagRegistrationPageの機能を統合
    - URLパラメータ（?tab=list, ?tab=registration）でタブ状態を管理
    - デフォルトは「タグ一覧」タブ
    - _要件: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 5.3 タブ状態とURL同期のプロパティテストを作成
    - **Property 1: タブ状態とURLパラメータの同期**
    - **検証対象: 要件 2.4**

- [x] 6. ライブ一覧ページの実装
  - [x] 6.1 LiveCardコンポーネントを作成
    - `src/components/live/LiveCard.tsx` を新規作成
    - ライブ種別、公演名、会場名、日時を表示
    - クリックハンドラーを実装
    - _要件: 4.2_
  - [x] 6.2 LiveListPageを作成
    - `src/pages/LiveListPage.tsx` を新規作成
    - ライブ一覧の取得と表示
    - 空の状態メッセージ
    - 新規登録ボタン
    - _要件: 4.1, 4.3, 4.5_
  - [ ]* 6.3 LiveCardの表示内容プロパティテストを作成
    - **Property 4: ライブ一覧の表示内容検証**
    - **検証対象: 要件 4.1, 4.2**

- [x] 7. チェックポイント - 一覧ページの確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

- [x] 8. セトリ表示コンポーネントの実装
  - [x] 8.1 SetlistDisplayコンポーネントを作成
    - `src/components/live/SetlistDisplay.tsx` を新規作成
    - 演奏順に楽曲を表示
    - 日替わり曲インジケーター（バッジ）を表示
    - 楽曲IDがある場合はクリック可能に
    - _要件: 5.2, 5.3, 5.5_
  - [ ]* 8.2 SetlistDisplayのプロパティテストを作成
    - **Property 6: セトリの順序表示**
    - **Property 7: 日替わり曲インジケーター表示**
    - **検証対象: 要件 5.2, 5.3**

- [x] 9. ライブ詳細ページの実装
  - [x] 9.1 LiveDetailPageを作成
    - `src/pages/LiveDetailPage.tsx` を新規作成
    - ライブ情報の全項目表示
    - ツアーの場合は公演地を表示
    - セトリ表示（SetlistDisplayを使用）
    - 編集・削除ボタン
    - _要件: 5.1, 5.4_
  - [ ]* 9.2 ツアー公演地表示のプロパティテストを作成
    - **Property 8: ツアー公演地の条件付き表示**
    - **検証対象: 要件 5.4**

- [x] 10. セトリエディターの実装
  - [x] 10.1 SetlistEditorコンポーネントを作成
    - `src/components/live/SetlistEditor.tsx` を新規作成
    - 既存楽曲からの選択機能（オートコンプリート）
    - フリー入力での楽曲追加
    - 日替わり曲フラグの設定
    - 順序変更（上下ボタン）
    - 削除機能
    - _要件: 6.4, 6.5, 6.6, 6.7_
  - [ ]* 10.2 SetlistEditorのプロパティテストを作成
    - **Property 3: 日替わり曲フラグの動作**
    - **検証対象: 要件 3.6, 7.5**

- [x] 11. ライブフォームの実装
  - [x] 11.1 LiveFormコンポーネントを作成
    - `src/components/live/LiveForm.tsx` を新規作成
    - ライブ種別セレクター
    - 公演名、会場名、日時入力
    - ツアー選択時の公演地入力フィールド
    - セトリエディター統合
    - バリデーション処理
    - _要件: 6.1, 6.2, 6.3, 6.9_
  - [ ]* 11.2 LiveFormのバリデーションプロパティテストを作成
    - **Property 11: バリデーションエラー表示**
    - **検証対象: 要件 6.9**

- [x] 12. チェックポイント - フォームコンポーネントの確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

- [x] 13. ライブ登録・編集ページの実装
  - [x] 13.1 LiveEditPageを作成
    - `src/pages/LiveEditPage.tsx` を新規作成
    - 新規登録モード（/lives/new）
    - 編集モード（/lives/:liveId/edit）
    - 既存データの事前入力
    - ライブ種別変更時の公演地クリア
    - 保存処理と確認メッセージ
    - _要件: 6.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  - [ ]* 13.2 編集フォーム事前入力のプロパティテストを作成
    - **Property 13: 編集フォームの事前入力**
    - **Property 9: ライブ種別変更時の公演地クリア**
    - **検証対象: 要件 7.1, 7.3**

- [x] 14. ライブ削除機能の実装
  - [x] 14.1 削除確認ダイアログを実装
    - LiveDetailPage内に確認ダイアログを追加
    - 削除成功時は一覧ページへ遷移
    - 削除失敗時はエラーメッセージ表示
    - _要件: 8.1, 8.2, 8.3, 8.4_

- [x] 15. ルーティングの更新
  - [x] 15.1 router.tsxを更新
    - /lives → LiveListPage
    - /lives/new → LiveEditPage
    - /lives/:liveId → LiveDetailPage
    - /lives/:liveId/edit → LiveEditPage
    - /tags → TagPage（統合版）
    - /tag-registration を削除
    - _要件: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 16. 最終チェックポイント
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

## 備考

- `*` マークのタスクはオプションで、MVPでは省略可能
- 各プロパティテストは最低100回の反復を設定
- プロパティテストにはfast-checkライブラリを使用
- 既存のTagListPage, TagRegistrationPageのコードは統合TagPageで再利用
