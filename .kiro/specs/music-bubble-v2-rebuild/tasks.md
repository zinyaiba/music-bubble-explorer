# 実装計画: Music Bubble Explorer V2

## 概要

既存のMusic Bubble Explorerを新規プロジェクトとして再構築する。React + TypeScript + Viteをベースに、パフォーマンス・レイアウト統一・クロスブラウザ対応を改善する。

**進め方**: TOPページを先に完成させて確認後、各ページを段階的に追加していく。

## フェーズ1: TOPページの完成

- [x] 1. プロジェクト初期設定
  - [x] 1.1 新規プロジェクトディレクトリ作成とVite初期化
    - 親ディレクトリに `music-bubble-v2` を作成
    - `npm create vite@latest music-bubble-v2 -- --template react-ts`
    - _Requirements: プロジェクト構成_

  - [x] 1.2 依存関係のインストールと設定
    - React Router v6, Firebase設定
    - ESLint, Prettier設定
    - _Requirements: 技術スタック_

  - [x] 1.3 Firebase設定の移行
    - 既存プロジェクトからFirebase設定をコピー
    - 環境変数設定（.env.local）
    - _Requirements: 13.1_

  - [x] 1.4 基本ディレクトリ構造の作成
    - src/components, src/pages, src/hooks, src/services, src/types, src/styles, src/config
    - _Requirements: アーキテクチャ_

- [x] 2. 型定義とサービス層（TOPページ用）
  - [x] 2.1 型定義ファイルの作成
    - Song, Tag, Bubble, FilterState等の型定義
    - _Requirements: データモデル_

  - [x] 2.2 Firebaseサービスの実装
    - 楽曲データの取得
    - _Requirements: 13.1, 13.2_

  - [x] 2.3 キャッシュサービスの実装
    - ローカルストレージへのデータキャッシュ
    - _Requirements: 12.6, 13.3_

- [x] 3. 共通コンポーネントの実装
  - [x] 3.1 グローバルスタイルの設定
    - CSS変数（カラー、スペーシング、タイポグラフィ）
    - リセットCSS
    - _Requirements: 11.1, 11.2_

  - [x] 3.2 レイアウトコンポーネントの実装
    - Header, Navigation, LoadingSpinner, ErrorMessage
    - _Requirements: 11.1, 11.2, 11.4_

- [x] 4. フィルタ機能の実装
  - [x] 4.1 アーティストフィルタの実装
    - 固定3種類のオプション（栗林みな実/Minami/それ以外）
    - フィルタリングロジック
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 ジャンルフィルタの実装
    - 動的オプション生成
    - アーティストフィルタとの連動
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. シャボン玉機能の実装
  - [x] 5.1 Bubbleコンポーネントの実装
    - シャボン玉の描画
    - クリックイベント
    - _Requirements: 1.1, 1.2_

  - [x] 5.2 BubbleCanvasコンポーネントの実装
    - シャボン玉のアニメーション
    - 一時停止/再開機能
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.5_

  - [x] 5.3 BubbleDetailコンポーネントの実装
    - シャボン玉詳細表示（モーダル）
    - 楽曲詳細ページへのリンク
    - _Requirements: 1.2, 1.3_

- [x] 6. TOPページの統合
  - [x] 6.1 TopPageコンポーネントの実装
    - BubbleCanvas, ArtistFilter, GenreFilterの統合
    - ローディング状態の表示
    - _Requirements: 1.1, 1.5, 3.1, 4.1_

  - [x] 6.2 ルーティングの設定
    - React Routerの基本設定
    - _Requirements: 14.1, 14.3, 14.4_

- [x] 7. チェックポイント - TOPページの確認
  - TOPページの動作確認
  - シャボン玉表示、フィルタ機能、一時停止/再開の確認
  - 質問があればユーザーに確認

## フェーズ2: 楽曲一覧・詳細ページ

- [ ] 8. 楽曲サービスの拡張
  - [ ] 8.1 楽曲検索機能の実装
    - タイトル、アーティスト、作詞家、作曲家、編曲家での検索
    - _Requirements: 7.2_

- [ ] 9. 楽曲一覧ページの実装
  - [ ] 9.1 SongCardコンポーネントの実装
    - 楽曲情報のコンパクト表示
    - _Requirements: 7.6_

  - [ ] 9.2 SongListコンポーネントの実装
    - 楽曲一覧表示、検索機能
    - _Requirements: 7.1, 7.2_

  - [ ] 9.3 SongListPageの実装
    - 楽曲一覧ページ、新規追加ボタン
    - _Requirements: 7.1, 7.4_

- [ ] 10. 楽曲詳細ページの実装
  - [ ] 10.1 SongDetailコンポーネントの実装
    - 楽曲詳細表示、埋め込みコンテンツ、外部リンク
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_

  - [ ] 10.2 SongDetailPageの実装
    - 楽曲詳細ページ、戻るナビゲーション
    - _Requirements: 8.5_

- [ ] 11. 楽曲登録・編集機能の実装
  - [ ] 11.1 SongFormコンポーネントの実装
    - 楽曲登録・編集フォーム、バリデーション
    - _Requirements: 7.4, 7.5, 15.5_

- [ ] 12. チェックポイント - 楽曲機能の確認
  - 楽曲一覧、詳細、登録・編集の動作確認
  - 質問があればユーザーに確認

## フェーズ3: タグ機能

- [ ] 13. タグサービスの実装
  - [ ] 13.1 タグサービスの実装
    - タグデータの生成、検索、ソート
    - タグの追加・削除
    - _Requirements: 5.4, 5.5, 6.2, 6.3, 6.4, 6.6_

- [ ] 14. タグ一覧ページの実装
  - [ ] 14.1 TagListコンポーネントの実装
    - タグ一覧表示、検索・ソート機能
    - _Requirements: 6.1, 6.2, 6.6_

  - [ ] 14.2 TagDetailコンポーネントの実装
    - タグ詳細表示、関連楽曲一覧、SNS共有機能
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 14.3 TagListPageの実装
    - タグ一覧ページ
    - _Requirements: 6.1_

- [ ] 15. タグ登録ページの実装
  - [ ] 15.1 TagInputコンポーネントの実装
    - タグ入力・選択UI
    - _Requirements: 5.3, 5.6_

  - [ ] 15.2 TagRegistrationPageの実装
    - タグ登録ページ、楽曲一覧とタグ入力
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 16. チェックポイント - タグ機能の確認
  - タグ一覧、詳細、登録の動作確認
  - 質問があればユーザーに確認

## フェーズ4: お知らせ・使い方ページとエラーハンドリング

- [ ] 17. お知らせ・使い方ページの実装
  - [ ] 17.1 InfoPageの実装
    - 使い方説明、お知らせ表示
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 18. エラーハンドリングの実装
  - [ ] 18.1 エラーハンドリングの実装
    - ネットワークエラー表示、リトライ機能、オフラインモード
    - _Requirements: 15.1, 15.2, 15.4_

- [ ] 19. チェックポイント - 全機能の確認
  - 全ページの動作確認
  - 質問があればユーザーに確認

## フェーズ5: クロスブラウザ対応と最終調整

- [ ] 20. クロスブラウザ対応の確認と調整
  - [ ] 20.1 Safari対応の確認と調整
    - iOS Safari, macOS Safariでの動作確認
    - _Requirements: 10.1, 10.5, 10.6_

  - [ ] 20.2 Chrome対応の確認と調整
    - Android Chrome, Windows/macOS Chromeでの動作確認
    - _Requirements: 10.2, 10.5, 10.6_

- [ ] 21. 最終チェックポイント
  - 全てのページの動作確認
  - パフォーマンスの確認
  - 質問があればユーザーに確認

## フェーズ6: デプロイ設定

- [ ] 22. GitHub Pages デプロイ設定
  - [ ] 22.1 GitHubリポジトリの作成
    - 新規リポジトリ `music-bubble-v2` を作成
    - _Requirements: デプロイ構成_

  - [ ] 22.2 Vite設定のbase URL設定
    - `vite.config.ts` に `base: '/music-bubble-v2/'` を設定
    - _Requirements: デプロイ構成_

  - [ ] 22.3 GitHub Actions ワークフローの設定
    - `.github/workflows/deploy.yml` を作成
    - mainブランチへのpushで自動デプロイ
    - _Requirements: デプロイ構成_

  - [ ] 22.4 デプロイ確認
    - GitHub Pagesの設定を有効化
    - 公開URLでの動作確認
    - _Requirements: デプロイ構成_

## 備考

- 各フェーズ終了時にチェックポイントを設け、ユーザー確認を行う
- TOPページ完成後に一度確認し、その後各ページを段階的に追加
- プロパティテストは必要に応じて追加可能
