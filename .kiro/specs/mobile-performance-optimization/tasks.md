# Implementation Plan

- [ ] 1. useAnimationControlフックの実装
  - src/hooks/useAnimationControl.tsファイルを作成
  - ダイアログ開閉状態の管理（isDialogOpen state）を実装
  - アイドル状態の管理（isIdle state）を実装
  - 30秒のアイドルタイマー（idleTimerRef）を実装
  - ユーザー操作イベント（mousemove, mousedown, touchstart, scroll, keydown）の監視を実装
  - shouldAnimateフラグの計算ロジック（!isDialogOpen && !isIdle）を実装
  - setDialogOpen関数を実装
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. App.tsxへのアニメーション制御の統合
  - useAnimationControlフックをインポート
  - shouldAnimateフラグを取得
  - 既存のアニメーションループのuseEffectにshouldAnimateを依存配列に追加
  - shouldAnimateがfalseの時はアニメーションループを実行しないように条件を追加
  - setDialogOpenをダイアログコンポーネントに渡すための準備
  - _Requirements: 1.1, 1.2, 1.3, 2.2, 3.1, 3.2_

- [ ] 3. DetailModalへのアニメーション制御の統合
  - useAnimationControlフックをインポート
  - setDialogOpenを取得
  - selectedBubbleの変化を監視するuseEffectを追加
  - selectedBubbleがある時はsetDialogOpen(true)を呼び出し
  - クリーンアップ関数でsetDialogOpen(false)を呼び出し
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 4. StandardLayoutへのアニメーション制御の統合
  - useAnimationControlフックをインポート
  - setDialogOpenを取得
  - コンポーネントのマウント時にsetDialogOpen(true)を呼び出し
  - アンマウント時にsetDialogOpen(false)を呼び出し
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 5. UnifiedDialogLayoutへのアニメーション制御の統合
  - useAnimationControlフックをインポート
  - setDialogOpenを取得
  - コンポーネントのマウント時にsetDialogOpen(true)を呼び出し
  - アンマウント時にsetDialogOpen(false)を呼び出し
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 6. 動作確認とテスト
  - ダイアログを開いた時にシャボン玉のアニメーションが停止することを確認
  - ダイアログを閉じた時にシャボン玉のアニメーションが再開することを確認
  - 30秒間操作しない時にアニメーションが停止することを確認
  - 操作を再開した時にアニメーションが再開することを確認
  - ダイアログが開いている間はアイドルタイマーが動作しないことを確認
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_
