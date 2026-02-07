# 実装計画: ツアーグループ化機能

## 概要

同じツアー名を持つ複数のライブ公演をグループ化して表示し、詳細画面で公演地別にセトリを確認できるようにする機能を実装する。

## タスク

- [x] 1. 型定義の追加
  - [x] 1.1 TourGroup型を定義
    - `music-bubble-v2/src/types/index.ts` に追加
    - id, tourName, performances, performanceCount, firstDate, lastDate
    - _要件: 1.3, 1.4, 1.5_
  - [x] 1.2 GroupedLiveItem型を定義
    - `music-bubble-v2/src/types/index.ts` に追加
    - type: 'tour' | 'live' の判別型
    - _要件: 1.1, 1.2_

- [x] 2. ツアーグループ化サービスの実装
  - [x] 2.1 tourGroupingServiceの基本構造を作成
    - `music-bubble-v2/src/services/tourGroupingService.ts` を新規作成
    - _要件: 1.1_
  - [x] 2.2 groupLivesメソッドを実装
    - liveType='tour'のライブを同じtitleでグループ化
    - liveType='solo'/'festival'は個別項目として返す
    - _要件: 1.1, 1.2_
  - [x] 2.3 createTourGroupメソッドを実装
    - 公演を日時昇順でソート
    - firstDate, lastDate, performanceCountを計算
    - _要件: 1.3, 1.4, 1.5_
  - [x] 2.4 sortGroupedItemsメソッドを実装
    - 代表日時で降順ソート
    - _要件: 2.5_
  - [ ]* 2.5 tourGroupingServiceのプロパティテストを作成
    - **Property 1: Tour grouping correctness**
    - **Property 2: Tour group ordering and dates**
    - **Property 3: Performance count consistency**
    - **Property 4: Grouped items sort order**
    - **検証対象: 要件 1.1-1.5, 2.5**

- [x] 3. チェックポイント - サービス層の確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

- [x] 4. TourCardコンポーネントの実装
  - [x] 4.1 TourCardコンポーネントを作成
    - `music-bubble-v2/src/components/live/TourCard.tsx` を新規作成
    - ツアー名、公演数、開催期間を表示
    - 公演地プレビュー（最大3件）を表示
    - クリックハンドラーを実装
    - _要件: 2.1, 2.2, 2.3_
  - [x] 4.2 TourCard.cssを作成
    - `music-bubble-v2/src/components/live/TourCard.css` を新規作成
    - _要件: 2.1_
  - [ ]* 4.3 TourCardのプロパティテストを作成
    - **Property 5: TourCard display completeness**
    - **検証対象: 要件 2.2, 2.3**

- [x] 5. PerformanceAccordionコンポーネントの実装
  - [x] 5.1 PerformanceAccordionコンポーネントを作成
    - `music-bubble-v2/src/components/live/PerformanceAccordion.tsx` を新規作成
    - ヘッダー: 公演地、会場名、日時
    - 展開時: セトリ表示、編集ボタン
    - 展開/折りたたみ切り替え
    - _要件: 3.2, 3.3, 3.4, 3.5, 5.1_
  - [x] 5.2 PerformanceAccordion.cssを作成
    - `music-bubble-v2/src/components/live/PerformanceAccordion.css` を新規作成
    - _要件: 3.2_
  - [ ]* 5.3 PerformanceAccordionのプロパティテストを作成
    - **Property 6: PerformanceAccordion header completeness**
    - **検証対象: 要件 3.3**

- [x] 6. チェックポイント - コンポーネントの確認
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

- [x] 7. LiveListPageの更新
  - [x] 7.1 LiveListPageにグループ化ロジックを統合
    - `music-bubble-v2/src/pages/LiveListPage.tsx` を修正
    - tourGroupingServiceを使用してライブをグループ化
    - ツアーはTourCard、その他はLiveCardで表示
    - _要件: 2.1, 2.4, 2.5_

- [x] 8. TourDetailPageの実装
  - [x] 8.1 TourDetailPageを作成
    - `music-bubble-v2/src/pages/TourDetailPage.tsx` を新規作成
    - ツアー名と全公演数を表示
    - 公演地別にPerformanceAccordionで表示
    - 最初の公演をデフォルトで展開
    - _要件: 3.1, 3.2, 3.6_
  - [x] 8.2 TourDetailPage.cssを作成
    - `music-bubble-v2/src/pages/TourDetailPage.css` を新規作成
    - _要件: 3.1_
  - [x] 8.3 複数アコーディオン同時展開を実装
    - 複数の公演のセトリを同時に表示可能に
    - _要件: 4.1_
  - [x] 8.4 セトリ内の日替わり曲インジケーターを確認
    - 既存のSetlistDisplayを使用
    - _要件: 4.2_
  - [x] 8.5 楽曲クリックで詳細ページへ遷移を実装
    - _要件: 4.3_
  - [x] 8.6 編集ボタンから編集ページへ遷移を実装
    - _要件: 5.1, 5.2_
  - [x] 8.7 戻るボタンでライブ一覧へ遷移を実装
    - _要件: 5.3_

- [x] 9. ルーティングの更新
  - [x] 9.1 router.tsxを更新
    - /tours/:tourName → TourDetailPage
    - tourNameはURLエンコードされたツアー名
    - _要件: 3.1_

- [-] 10. コンポーネントエクスポートの更新
  - [-] 10.1 live/index.tsを更新
    - TourCard, PerformanceAccordionをエクスポート
  - [ ] 10.2 pages/index.tsを更新
    - TourDetailPageをエクスポート

- [ ] 11. 最終チェックポイント
  - すべてのテストが通ることを確認し、質問があればユーザーに確認する

## 備考

- `*` マークのタスクはオプションで、MVPでは省略可能
- 各プロパティテストは最低100回の反復を設定
- プロパティテストにはfast-checkライブラリを使用
- 既存のLiveCard, SetlistDisplayコンポーネントを再利用
- Firestoreのデータ構造は変更せず、クライアント側でグループ化を行う
