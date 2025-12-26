# 実装計画

- [-] 1. TagRenameServiceの実装




  - [x] 1.1 TagRenameServiceクラスの作成


    - `src/services/tagRenameService.ts`を作成
    - validateTagName、checkDuplicate、renameTag、mergeTagsメソッドを実装
    - _Requirements: 1.2, 1.3, 2.3, 2.4_
  - [ ]* 1.2 Property 2のプロパティテスト作成
    - **Property 2: 空白タグ名の拒否**
    - **Validates: Requirements 1.3**
  - [ ]* 1.3 Property 1のプロパティテスト作成
    - **Property 1: タグ名称変更のラウンドトリップ**
    - **Validates: Requirements 1.2, 1.5**
  - [ ]* 1.4 Property 4のプロパティテスト作成
    - **Property 4: タグ統合の完全性**
    - **Validates: Requirements 2.3, 2.4**

- [x] 2. useTagRenameフックの実装






  - [x] 2.1 useTagRenameカスタムフックの作成

    - `src/hooks/useTagRename.ts`を作成
    - 編集状態、統合ダイアログ状態、操作状態の管理を実装
    - _Requirements: 1.1, 1.4, 2.1, 2.5_
  - [ ]* 2.2 Property 3のプロパティテスト作成
    - **Property 3: キャンセル操作の状態保持**
    - **Validates: Requirements 1.4, 2.5**

- [x] 3. TagInlineEditorコンポーネントの実装






  - [x] 3.1 TagInlineEditorコンポーネントの作成

    - `src/components/TagInlineEditor.tsx`を作成
    - インライン編集UI、バリデーション表示、ローディング状態を実装
    - _Requirements: 1.1, 3.1, 3.4_
  - [x] 3.2 TagInlineEditorのスタイル作成


    - `src/components/TagInlineEditor.css`を作成
    - モバイル対応のタッチターゲットサイズ（44x44px以上）を確保
    - _Requirements: 4.1_

- [x] 4. TagMergeDialogコンポーネントの実装






  - [x] 4.1 TagMergeDialogコンポーネントの作成

    - `src/components/TagMergeDialog.tsx`を作成
    - 統合元・統合先タグ名、影響楽曲数の表示を実装
    - _Requirements: 2.1, 2.2, 4.3_

- [x] 5. EnhancedTagListへの統合




  - [x] 5.1 EnhancedTagListにタグ編集機能を追加

    - useTagRenameフックを統合
    - タグ項目に編集ボタンを追加
    - TagInlineEditorとTagMergeDialogを組み込み
    - _Requirements: 1.1, 2.1, 3.2, 3.3_

  - [x] 5.2 EnhancedTagList.cssの更新


    - 編集ボタンのスタイル追加
    - 編集中のハイライト表示スタイル追加
    - _Requirements: 3.4, 4.1_

- [ ] 6. チェックポイント - すべてのテストが通ることを確認
  - すべてのテストが通ることを確認し、問題があればユーザーに質問する

- [ ]* 7. Property 5のプロパティテスト作成
  - **Property 5: タグ統合のラウンドトリップ**
  - **Validates: Requirements 2.6**

- [ ] 8. 最終チェックポイント - すべてのテストが通ることを確認
  - すべてのテストが通ることを確認し、問題があればユーザーに質問する
