# Implementation Plan: タイムラインページ

## Overview

タイムラインページは、楽曲とライブパフォーマンスを時系列で可視化する新しいページ機能です。中央の垂直タイムライン軸を持つスクロール可能なレイアウトで、楽曲を右側に、ライブイベントを左側に配置し、重要イベント（単独公演・ツアー）を中央に表示します。

実装アプローチは以下の通りです:
1. TypeScript型定義とデータ変換サービス層を構築
2. タイムライン表示用のReactコンポーネントを作成
3. ページとルーティングを実装
4. インタラクティブ機能（展開/折りたたみ、ナビゲーション）を追加
5. プロパティベーステストとユニットテストで検証

## Tasks

- [x] 1. 型定義とデータレイヤーの構築
  - [x] 1.1 TimelineItem型定義の追加
    - `src/types/index.ts`に以下の型を追加:
      - `TimelineItemType`, `TimelineItemPosition`
      - `BaseTimelineItem`
      - `SongTimelineItem`, `ReleaseUnitTimelineItem`
      - `LiveTimelineItem`, `TourGroupTimelineItem`, `MajorEventTimelineItem`
      - `TimelineItem`（ユニオン型）
      - `TimelineYearMonthGroup`
    - _要件: 1.2, 2.1, 3.1, 4.1_

  - [x] 1.2 timelineServiceの基本構造作成
    - `src/services/timelineService.ts`を作成
    - TimelineServiceクラスを定義
    - コンストラクタで`songService`, `liveService`, `tourGroupingService`を注入
    - _要件: 8.1, 8.2_

  - [x] 1.3 年月キー抽出関数の実装
    - `extractYearMonth`メソッドを実装
    - ISO 8601形式の文字列と`{releaseYear, releaseDate}`オブジェクトの両方に対応
    - YYYY-MM形式の文字列を返す
    - 日付情報が欠落している場合は`'9999-99'`を返す
    - _要件: 4.5, 7.1, 8.3_

  - [ ]* 1.4 年月キー抽出のプロパティテスト
    - **Property 7: Year-month extraction is correct**
    - **検証要件: 4.5**
    - fast-checkを使用してランダムな日付入力を生成
    - 結果がYYYY-MM形式であることを確認
    - 元の日付の年月と一致することを確認

  - [x] 1.5 楽曲のリリース単位グループ化関数の実装
    - `groupSongsByRelease`メソッドを実装
    - `singleName`でグループ化（優先度1）
    - `albumName`でグループ化（優先度2、singleNameがない場合）
    - どちらもない楽曲は`standaloneSongs`配列に格納
    - `{releaseUnits: Map<string, Song[]>, standaloneSongs: Song[]}`を返す
    - _要件: 4.1, 4.2, 4.3_

  - [ ]* 1.6 楽曲リリース単位グループ化のプロパティテスト
    - **Property 6: Songs are grouped by release name**
    - **検証要件: 4.1, 4.2, 4.3**
    - ランダムな楽曲リスト（singleName/albumName/なしの組み合わせ）を生成
    - 同じsingleName/albumNameの楽曲が同じリリース単位にあることを確認
    - どちらもない楽曲が個別アイテムになることを確認

- [x] 2. タイムラインアイテム変換ロジックの実装
  - [x] 2.1 楽曲からタイムラインアイテムへの変換関数
    - `convertSongsToTimelineItems`メソッドを実装
    - `groupSongsByRelease`を呼び出して楽曲をグループ化
    - リリース単位から`ReleaseUnitTimelineItem`を生成
    - 個別楽曲から`SongTimelineItem`を生成
    - 各アイテムに`id`, `type`, `position='right'`, `date`, `yearMonth`を設定
    - _要件: 1.4, 4.1, 4.2, 4.3, 4.5_

  - [x] 2.2 ライブからタイムラインアイテムへの変換関数
    - `convertLivesToTimelineItems`メソッドを実装
    - `liveType='tour'`のライブを`tourGroupingService`でグループ化
    - `liveType='solo'`または`liveType='tour'`の場合、`MajorEventTimelineItem`を生成（`position='center'`）
    - その他のライブは`LiveTimelineItem`を生成（`position='left'`）
    - ツアーグループから`TourGroupTimelineItem`を生成
    - 各アイテムに`id`, `type`, `position`, `date`, `yearMonth`を設定
    - _要件: 1.3, 2.1, 2.2, 3.1, 3.4_

  - [ ]* 2.3 重要イベント変換のプロパティテスト
    - **Property 4: Major events are created for solo and tour lives**
    - **検証要件: 2.1, 2.2**
    - ランダムなLive（solo/tour）を生成
    - MajorEventTimelineItemに変換されることを確認
    - position='center'であることを確認

  - [ ]* 2.4 ツアーグループ年月決定のプロパティテスト
    - **Property 5: Tour groups use earliest performance date for year-month**
    - **検証要件: 3.4**
    - ランダムなTourGroup（複数の異なる日付の公演）を生成
    - yearMonthが最も早い公演の年月と一致することを確認

- [x] 3. 年月グループ化とソート機能の実装
  - [x] 3.1 年月グループ化関数の実装
    - `groupByYearMonth`メソッドを実装
    - `TimelineItem[]`を受け取り、`yearMonth`でグループ化
    - ソート順パラメータ（'asc' | 'desc'、デフォルト: 'desc'）を受け取る
    - グループ内アイテムは`date`の昇順でソート
    - グループ自体は`yearMonth`の指定順（昇順/降順）でソート
    - `TimelineYearMonthGroup[]`を返す
    - _要件: 1.2, 1.5, 7.1, 7.3, 7.4_

  - [ ]* 3.2 年月グループ化のプロパティテスト
    - **Property 1: Timeline items are grouped by year-month**
    - **検証要件: 1.2, 7.1, 7.3**
    - ランダムなTimelineItemリストを生成
    - 同じyearMonthのアイテムが同じグループにあることを確認
    - 異なるyearMonthのアイテムが別のグループにあることを確認

  - [ ]* 3.3 アイテム内ソート順のプロパティテスト
    - **Property 2: Timeline items are sorted chronologically**
    - **検証要件: 1.5**
    - ランダムなTimelineItemリストを生成
    - グループ内のアイテムがdate昇順であることを確認

  - [ ]* 3.4 グループソート順のプロパティテスト
    - **Property 3: Year-month groups are sorted chronologically**
    - **検証要件: 7.4**
    - ランダムなTimelineYearMonthGroupリストを生成
    - 指定したソート順（asc/desc）でグループが並んでいることを確認

- [x] 4. タイムラインデータ取得の統合
  - [x] 4.1 fetchTimelineData関数の実装
    - `fetchTimelineData`メソッドを実装
    - `songService.fetchAllSongs()`で楽曲データを取得
    - `liveService.fetchAllLives()`でライブデータを取得
    - `convertSongsToTimelineItems`と`convertLivesToTimelineItems`で変換
    - すべてのアイテムを統合してリストを作成
    - `groupByYearMonth`で年月グループ化
    - `TimelineYearMonthGroup[]`を返す
    - エラーハンドリングを実装
    - _要件: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 4.2 timelineServiceのユニットテスト
    - `extractYearMonth`の境界値ケース（1月、12月、うるう年）をテスト
    - `groupSongsByRelease`の特定のシングル/アルバム名でのグループ化をテスト
    - `convertLivesToTimelineItems`の各liveTypeの変換をテスト
    - エラーハンドリングをテスト

- [x] 5. チェックポイント - データレイヤーの動作確認
  - すべてのテストがパスすることを確認
  - 型定義とサービス層が正しく動作することを確認
  - 質問があればユーザーに確認

- [x] 6. 基本UIコンポーネントの作成
  - [x] 6.1 TimelineAxis コンポーネントの実装
    - `src/components/timeline/TimelineAxis.tsx`を作成
    - 中央の垂直タイムライン軸を表示
    - 対応するCSSファイル`TimelineAxis.css`を作成
    - _要件: 1.1, 9.2_

  - [x] 6.2 TimelineDot コンポーネントの実装
    - `src/components/timeline/TimelineDot.tsx`を作成
    - タイムライン軸とアイテムを接続するドットを表示
    - 対応するCSSファイル`TimelineDot.css`を作成
    - _要件: 9.3_

  - [x] 6.3 TimelineYearMonthHeader コンポーネントの実装
    - `src/components/timeline/TimelineYearMonthHeader.tsx`を作成
    - 年月ヘッダーを表示（YYYY-MM形式）
    - 対応するCSSファイル`TimelineYearMonthHeader.css`を作成
    - _要件: 7.2_

- [x] 7. タイムラインアイテムコンポーネントの作成
  - [x] 7.1 SongTimelineItem コンポーネントの実装
    - `src/components/timeline/SongTimelineItem.tsx`を作成
    - 個別楽曲をタイムラインアイテムとして表示
    - クリック可能にし、`onClick`コールバックを受け取る
    - 楽曲名、リリース情報、埋め込みコンテンツを表示
    - 対応するCSSファイル`SongTimelineItem.css`を作成
    - _要件: 1.4, 5.1, 10.1_

  - [x] 7.2 ReleaseUnit コンポーネントの実装
    - `src/components/timeline/ReleaseUnit.tsx`を作成
    - リリース単位（シングル/アルバム）をタイムラインアイテムとして表示
    - ヘッダー部分にリリース名、収録曲数を表示
    - 展開/折りたたみ機能を実装（`isExpanded`状態管理）
    - 展開時に収録楽曲リストと埋め込みコンテンツを表示
    - 対応するCSSファイル`ReleaseUnit.css`を作成
    - _要件: 4.4, 5.3, 10.3_

  - [ ]* 7.3 リリース単位埋め込みコンテンツのプロパティテスト
    - **Property 8: Release unit embeds include all songs' content**
    - **検証要件: 5.3**
    - ランダムなReleaseUnitTimelineItemを生成（各楽曲が異なる埋め込みを持つ）
    - 表示される埋め込みコンテンツが全楽曲の埋め込みを含むことを確認

  - [x] 7.4 LiveTimelineItem コンポーネントの実装
    - `src/components/timeline/LiveTimelineItem.tsx`を作成
    - 個別ライブイベントをタイムラインアイテムとして表示
    - クリック可能にし、`onClick`コールバックを受け取る
    - ライブ名、日時、場所を表示
    - 対応するCSSファイル`LiveTimelineItem.css`を作成
    - _要件: 1.3, 10.1_

  - [x] 7.5 TourGroupItem コンポーネントの実装
    - `src/components/timeline/TourGroupItem.tsx`を作成
    - ツアーグループをタイムラインアイテムとして表示
    - ツアー名、日付範囲、公演数を表示
    - 展開/折りたたみ機能を実装（`isExpanded`状態管理）
    - 展開時に個別公演リストを表示
    - 既存の`TourCard`コンポーネントを参考にする
    - 対応するCSSファイル`TourGroupItem.css`を作成
    - _要件: 3.2, 3.3, 10.2_

  - [x] 7.6 MajorEventItem コンポーネントの実装
    - `src/components/timeline/MajorEventItem.tsx`を作成
    - 重要イベント（単独公演・ツアー）を中央に表示
    - タイムライン軸の両側にまたがるレイアウト
    - 目立つスタイリング（大きめのカード、強調色）
    - 展開/折りたたみ機能を実装（`isExpanded`状態管理）
    - `eventType`に応じて単独公演またはツアー情報を表示
    - 対応するCSSファイル`MajorEventItem.css`を作成
    - _要件: 2.1, 2.2, 2.3, 2.4_

- [x] 8. コンテナコンポーネントの作成
  - [x] 8.1 TimelineGroup コンポーネントの実装
    - `src/components/timeline/TimelineGroup.tsx`を作成
    - 1つの年月グループを表示
    - `TimelineYearMonthHeader`を表示
    - `TimelineAxis`を中央に配置
    - 左側にライブアイテム、右側に楽曲アイテム、中央に重要イベントを配置
    - 各アイテムの`position`に基づいてレイアウト
    - 対応するCSSファイル`TimelineGroup.css`を作成
    - _要件: 1.1, 1.3, 1.4, 2.3, 7.3_

  - [x] 8.2 TimelineContainer コンポーネントの実装
    - `src/components/timeline/TimelineContainer.tsx`を作成
    - タイムライン全体のコンテナ
    - スクロール可能な領域を提供
    - `TimelineGroup[]`を受け取り、各グループをレンダリング
    - 対応するCSSファイル`TimelineContainer.css`を作成
    - _要件: 1.1, 7.4, 9.4_

- [x] 9. チェックポイント - コンポーネント動作確認
  - すべてのコンポーネントが正しくレンダリングされることを確認
  - スタイリングが既存のデザインシステムに準拠していることを確認
  - 質問があればユーザーに確認

- [x] 10. タイムラインページとルーティングの実装
  - [x] 10.1 useTimelineData カスタムフックの作成
    - `src/hooks/useTimelineData.ts`を作成
    - `timelineService.fetchTimelineData()`を呼び出す
    - ローディング状態、エラー状態、データ状態を管理
    - `{data, loading, error}`を返す
    - _要件: 8.1, 8.2, 8.4_

  - [x] 10.2 TimelinePage コンポーネントの実装
    - `src/pages/TimelinePage.tsx`を作成
    - `useTimelineData`フックを使用してデータを取得
    - ソート順の状態管理（'asc' | 'desc'、デフォルト: 'desc'）
    - `Header`コンポーネントを表示（タイトル: "タイムライン"）
    - ソート切り替えコントロールを表示
    - ローディング時は`LoadingSpinner`を表示
    - エラー時は`ErrorMessage`を表示
    - データ取得成功時は`TimelineContainer`を表示
    - 対応するCSSファイル`TimelinePage.css`を作成
    - _要件: 1.1, 1.5, 8.4, 9.1_

  - [x] 10.3 ルーティングの追加
    - `src/router.tsx`（または該当するルーティング設定ファイル）に`/timeline`ルートを追加
    - `TimelinePage`コンポーネントをインポート
    - ルート定義: `path: '/timeline', element: <TimelinePage />`
    - _要件: 6.1, 6.3_

  - [ ]* 10.4 TimelinePageのユニットテスト
    - データ読み込み中の表示をテスト
    - エラー時の表示をテスト
    - データ表示の確認

- [x] 11. インタラクティブ機能の実装
  - [x] 11.1 タイムラインアイテムのナビゲーション機能
    - `TimelinePage`でナビゲーションハンドラーを実装
    - 楽曲クリック時: `/songs/:id`へ遷移
    - ライブクリック時: `/lives/:id`へ遷移
    - 各コンポーネントに`onClick`ハンドラーを渡す
    - _要件: 10.1, 10.4_

  - [x] 11.2 展開/折りたたみ状態管理の実装
    - `ReleaseUnit`コンポーネントで`isExpanded`状態を管理
    - `TourGroupItem`コンポーネントで`isExpanded`状態を管理
    - `MajorEventItem`コンポーネントで`isExpanded`状態を管理
    - 展開/折りたたみアニメーション（CSS transition: 0.3s）
    - _要件: 3.3, 10.2, 10.3_

  - [x] 11.3 ホバー効果とカーソル変更
    - クリック可能な要素に`cursor: pointer`を適用
    - ホバー時に背景色を若干明るくし、box-shadowを追加
    - アクティブ時にスケール0.98を適用
    - _要件: 10.4_

- [x] 12. レスポンシブデザインの実装
  - [x] 12.1 デスクトップレイアウトの実装（768px以上）
    - 3カラムレイアウト（左:ライブ | 中央:軸 | 右:楽曲）
    - タイムライン軸の幅: 2px
    - 左右の余白: 各40px
    - アイテム幅: 最大400px
    - 対応するメディアクエリをCSSに追加
    - _要件: 9.4_

  - [x] 12.2 モバイルレイアウトの実装（767px以下）
    - 単一カラムレイアウト（垂直スタック）
    - タイムライン軸を左端に配置（幅: 1px）
    - アイテムを軸の右側に縦並び
    - 左右の余白: 各16px
    - アイテム幅: 画面幅 - 余白
    - 対応するメディアクエリをCSSに追加
    - _要件: 9.4_

- [x] 13. アクセシビリティの実装
  - [x] 13.1 ARIA属性の追加
    - 各タイムラインアイテムに`role="article"`を追加
    - 展開可能アイテムに`aria-expanded`属性を追加
    - タイムライン軸に`aria-label="タイムライン軸"`を追加
    - _要件: 9.1_

  - [x] 13.2 キーボードナビゲーションの実装
    - タブキーでのフォーカス順序を設定（上から下、左から右）
    - Enter/Spaceキーで展開/折りたたみを実装
    - フォーカス時の視覚的フィードバック（outline）を追加
    - _要件: 10.4_

- [ ] 14. 統合テストの実装
  - [ ]* 14.1 ルーティング統合テスト
    - `/timeline`への直接アクセスでページが表示されることを確認
    - ナビゲーションメニューにタイムラインリンクがないことを確認

  - [ ]* 14.2 データフェッチ統合テスト
    - 実際のFirestoreからのデータ取得とタイムライン表示を確認
    - エラー時のリトライボタンが動作することを確認

  - [ ]* 14.3 ナビゲーション統合テスト
    - タイムラインアイテムクリックで詳細ページへ遷移することを確認
    - ブラウザの戻るボタンでタイムラインに戻れることを確認

  - [ ]* 14.4 展開機能統合テスト
    - ツアーグループの展開/折りたたみが動作することを確認
    - リリース単位の展開/折りたたみが動作することを確認
    - 重要イベントの展開/折りたたみが動作することを確認

  - [ ]* 14.5 レスポンシブ統合テスト
    - モバイルサイズ（375px）でのレイアウト表示を確認
    - タブレットサイズ（768px）でのレイアウト表示を確認
    - デスクトップサイズ（1024px以上）でのレイアウト表示を確認

- [x] 15. 最終チェックポイント - 完全動作確認
  - すべてのテスト（プロパティテスト、ユニットテスト、統合テスト）がパスすることを確認
  - すべての受入基準が満たされていることを確認
  - パフォーマンスを確認（100曲 + 100ライブで3秒以内に初期表示）
  - 質問があればユーザーに確認

## Notes

- `*`マークが付いたサブタスクはオプションであり、より速いMVPのためにスキップ可能です
- 各タスクは特定の要件を参照しており、トレーサビリティを確保しています
- チェックポイントは段階的な検証を保証します
- プロパティテストは設計書で定義された普遍的な正しさプロパティを検証します
- ユニットテストは特定の例とエッジケースを検証します
- プロパティベーステストにはfast-checkライブラリを使用します
- すべてのコンポーネントは既存のデザインシステム（CSS変数）に準拠します
- 実装中は既存の`songService`, `liveService`, `tourGroupingService`を最大限活用します

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "1.5"] },
    { "id": 2, "tasks": ["1.4", "1.6", "2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3", "2.4", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "4.1"] },
    { "id": 5, "tasks": ["4.2", "6.1", "6.2", "6.3"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.4", "7.5", "7.6"] },
    { "id": 7, "tasks": ["7.3", "8.1"] },
    { "id": 8, "tasks": ["8.2", "10.1"] },
    { "id": 9, "tasks": ["10.2"] },
    { "id": 10, "tasks": ["10.3", "10.4"] },
    { "id": 11, "tasks": ["11.1", "11.2", "11.3"] },
    { "id": 12, "tasks": ["12.1", "12.2"] },
    { "id": 13, "tasks": ["13.1", "13.2"] },
    { "id": 14, "tasks": ["14.1", "14.2", "14.3", "14.4", "14.5"] }
  ]
}
```
