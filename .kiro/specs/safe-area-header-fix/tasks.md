# 実装計画

## セーフエリア対応ヘッダー修正

- [x] 1. セーフエリアCSS変数システムの作成






  - [x] 1.1 `src/styles/safe-area-system.css`を新規作成

    - セーフエリアインセット変数（--safe-area-inset-top等）を定義
    - フォールバック付きセーフエリア変数を定義
    - ヘッダー・ナビゲーション高さ変数を定義
    - _要件: 2.3, 2.4_

  - [x] 1.2 `src/index.css`にsafe-area-system.cssをインポート

    - _要件: 2.4_

- [x] 2. index.htmlのビューポート設定確認






  - [x] 2.1 viewport metaタグに`viewport-fit=cover`が設定されていることを確認

    - _要件: 3.1_

- [x] 3. MobileFirstHeaderコンポーネントの修正





  - [x] 3.1 HeaderContainerにセーフエリアpadding-topを適用


    - env(safe-area-inset-top)を使用
    - フォールバック値として20pxを設定
    - min-heightにセーフエリアを含めた計算を追加
    - _要件: 1.1, 1.2, 1.4, 4.1_

  - [x] 3.2 HeaderContentの位置調整

    - インタラクティブ要素がセーフエリア内に収まるよう調整
    - _要件: 4.2_
  - [ ]* 3.3 プロパティテスト: ヘッダーパディングの最小値保証
    - **プロパティ1: ヘッダーパディングの最小値保証**
    - **検証: 要件 1.1, 1.4**

- [x] 4. MobileFirstLayoutコンポーネントの修正





  - [x] 4.1 LayoutContainerのセーフエリア対応強化


    - padding-topにセーフエリア変数を使用
    - dvh単位の使用とvhフォールバック
    - _要件: 3.2, 5.3_

  - [x] 4.2 NavigationSectionのセーフエリア対応確認

    - padding-bottomにenv(safe-area-inset-bottom)を適用
    - _要件: 3.3_
  - [ ]* 4.3 プロパティテスト: ナビゲーションのセーフエリア適用
    - **プロパティ5: ナビゲーションのセーフエリア適用**
    - **検証: 要件 3.3**

- [x] 5. ScrollableMainSectionコンポーネントの修正





  - [x] 5.1 HeaderWrapperの高さ計算修正


    - min-heightにセーフエリアを含める
    - padding-topにセーフエリアを適用
    - _要件: 1.1, 4.1_

  - [x] 5.2 ScrollableContainerの位置調整

    - モバイル時のtop位置にセーフエリアを考慮
    - bottom位置にナビゲーション高さ+セーフエリアを考慮
    - _要件: 1.3, 3.3_

- [x] 6. StandardLayout.cssの修正





  - [x] 6.1 統合ヘッダーのセーフエリア対応


    - .standard-layout-integrated-headerにpadding-topを追加
    - @supportsを使用したenv()サポート検出
    - _要件: 2.1, 2.2_

  - [x] 6.2 コンテンツラッパーの位置調整

    - padding-topにセーフエリアを含めた計算
    - _要件: 2.1_
  - [ ]* 6.3 プロパティテスト: モーダルヘッダーのセーフエリア適用
    - **プロパティ4: モーダルヘッダーのセーフエリア適用**
    - **検証: 要件 2.1, 2.2**

- [x] 7. mobileFirst.cssの修正






  - [x] 7.1 ヘッダー関連スタイルの統一

    - .mobile-first-headerのセーフエリア対応を強化
    - 既存のenv()使用箇所を新しい変数に置き換え
    - _要件: 1.1, 2.3_


  - [x] 7.2 ナビゲーション関連スタイルの統一


    - .mobile-first-navigationのセーフエリア対応を確認
    - _要件: 3.3_
  - [x] 7.3 フォールバックスタイルの追加

    - @supports not (padding-top: env(safe-area-inset-top))ブロックを追加
    - _要件: 6.2, 6.3_
  - [ ]* 7.4 プロパティテスト: env()非サポート時のフォールバック
    - **プロパティ7: env()非サポート時のフォールバック**
    - **検証: 要件 6.2**

- [ ] 8. チェックポイント - 全テスト実行
  - 全てのテストが通ることを確認し、問題があればユーザーに確認

- [ ] 9. 開発モード用デバッグ機能の追加（オプション）
  - [ ]* 9.1 セーフエリア可視化CSSクラスの追加
    - .debug-safe-areaクラスを作成
    - セーフエリア境界を視覚的に表示
    - _要件: 6.1_

- [ ] 10. 最終チェックポイント
  - 全てのテストが通ることを確認し、問題があればユーザーに確認

