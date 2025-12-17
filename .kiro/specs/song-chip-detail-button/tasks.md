# Implementation Plan

- [x] 1. SongDetailButtonコンポーネントの作成






  - [x] 1.1 SongDetailButtonコンポーネントを作成する

    - `src/components/SongDetailButton.tsx` を新規作成
    - Props: songId, songTitle, onClick
    - アイコン（📋 または ➡️）を表示
    - クリックイベントで `stopPropagation()` を呼び出し、`onClick(songId)` を実行
    - キーボードイベント（Enter/Space）のサポート
    - aria-label="楽曲詳細を表示" を設定
    - _Requirements: 1.1, 1.3, 2.2, 3.2, 3.3_
  - [x] 1.2 SongDetailButtonのCSSスタイルを作成する


    - `src/components/SongDetailButton.css` を新規作成
    - 最小44x44pxのタップ領域
    - フォーカスインジケーター
    - タップフィードバック（:active スタイル）
    - モバイル対応のレスポンシブスタイル
    - _Requirements: 2.3, 3.1, 4.1, 4.2_
  - [ ]* 1.3 SongDetailButtonのproperty-based testを作成する
    - **Property 1: 楽曲チップには遷移ボタンとアクセシブルラベルが存在する**
    - **Validates: Requirements 1.1, 3.3**
    - fast-checkを使用してランダムなsongId/songTitleでテスト
    - aria-labelの存在を検証
    - _Requirements: 1.1, 3.3_

- [x] 2. DetailModalへの統合






  - [x] 2.1 DetailModalにSongDetailButtonを統合する

    - タグ詳細（tag-details）の楽曲チップにSongDetailButtonを追加
    - 人物詳細（person-details）の楽曲チップにSongDetailButtonを追加
    - `selectedSongForDetail` 状態を追加
    - `handleSongDetailClick` ハンドラを追加
    - SongDetailViewの条件付きレンダリングを追加
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 DetailModal.cssに楽曲チップのレイアウト調整を追加する

    - 楽曲チップ内でSongDetailButtonを右端に配置
    - flexboxレイアウトの調整
    - _Requirements: 4.2_
  - [ ]* 2.3 DetailModalの統合テストを作成する
    - 遷移ボタンクリック時のコールバック呼び出しを検証
    - イベント伝播の停止を検証
    - チップ本体クリック時の既存動作維持を検証
    - キーボード操作を検証
    - _Requirements: 1.2, 2.1, 2.2, 3.2_

- [ ] 3. Checkpoint - Make sure all tests are passing
  - Ensure all tests pass, ask the user if questions arise.
