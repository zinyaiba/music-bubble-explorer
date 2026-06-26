# Requirements Document

## Introduction

本ドキュメントは、タイムラインページ機能の要件を定義します。タイムラインページは、楽曲とライブパフォーマンスを時系列で可視化する機能です。タイムラインページは、登録された楽曲とライブイベントを、中央のタイムライン軸を持つスクロール可能な時系列形式で表示します。楽曲は右側に、ライブイベントは左側に表示され、重要なイベント（単独公演とツアー）は両側にまたがって表示されます。このページは将来的な公開計画のため、直接URLアクセスのみで閲覧可能です（ナビゲーションメニューには表示されません）。

## Glossary

- **Timeline_System**: 時系列コンテンツを表示するタイムラインページ機能
- **Timeline_Axis**: 時間の流れを表す中央の垂直線
- **Timeline_Item**: タイムライン上に表示可能な単位（楽曲、ライブイベント、または重要イベント）
- **Major_Event**: 中央に目立つように表示される単独公演とツアー
- **Tour_Group**: 複数のツアー公演を1つのタイムラインエントリに統合したもの
- **Release_Unit**: シングル名/アルバム名でグループ化された楽曲、またはグループ化されていない個別楽曲
- **Embedded_Content**: タイムラインアイテムに埋め込まれたメディアコンテンツ（YouTube、Spotifyなど）
- **Year_Month_Unit**: 年と月による時間グループ化（日の精度は不要）

## Requirements

### Requirement 1: タイムラインの表示とレイアウト

**User Story:** ユーザーとして、楽曲とライブパフォーマンスの時系列タイムラインを見たい。それにより、アーティストの歴史を時間順に探索できるようにしたい。

#### Acceptance Criteria

1. THE Timeline_System SHALL 中央にTimeline_Axisを持つ垂直スクロール可能なページを表示する
2. WHEN ページが読み込まれる, THE Timeline_System SHALL Timeline_ItemをYear_Month_Unitでグループ化する
3. THE Timeline_System SHALL Timeline_Axisの左側にライブイベントを表示する
4. THE Timeline_System SHALL Timeline_Axisの右側に楽曲を表示する
5. WHEN Timeline_Itemをレンダリングする, THE Timeline_System SHALL それらを時系列順（古い順または新しい順）にソートする

### Requirement 2: 重要イベントの表示

**User Story:** ユーザーとして、重要なイベントを目立つように見たい。それにより、アーティストのキャリアにおける重要なマイルストーンを特定できるようにしたい。

#### Acceptance Criteria

1. WHEN ライブイベントがliveType='solo'である, THE Timeline_System SHALL それをTimeline_Axisの両側にまたがるMajor_Eventとして表示する
2. WHEN ライブイベントがliveType='tour'である, THE Timeline_System SHALL それをTimeline_Axisの両側にまたがるMajor_Eventとして表示する
3. WHEN Major_Eventを表示する, THE Timeline_System SHALL それをTimeline_Axisの中央に配置する
4. THE Timeline_System SHALL スタイリングによってMajor_Eventを通常のTimeline_Itemsと視覚的に区別する

### Requirement 3: ツアーの統合

**User Story:** ユーザーとして、ツアーを1つのエントリに統合したい。それにより、タイムラインが多数の個別ツアー公演で散らからないようにしたい。

#### Acceptance Criteria

1. WHEN 複数のライブイベントが同じタイトルを共有しAND liveType='tour'である, THE Timeline_System SHALL それらを1つのTour_Groupに統合する
2. WHEN Tour_Groupを表示する, THE Timeline_System SHALL ツアー名と日付範囲を表示する
3. WHEN Tour_Groupが展開される, THE Timeline_System SHALL ツアー内の個別公演を表示する
4. THE Timeline_System SHALL Tour_Groupを最も早い公演日のYear_Month_Unitでグループ化する

### Requirement 4: リリース単位での楽曲グループ化

**User Story:** ユーザーとして、楽曲をシングルまたはアルバムでグループ化したい。それにより、タイムラインが個別楽曲エントリで圧倒されることなく、リリースを表示できるようにしたい。

#### Acceptance Criteria

1. WHEN 楽曲がsingleName値を持つ, THE Timeline_System SHALL それらをsingleNameによってRelease_Unitにグループ化する
2. WHEN 楽曲がalbumName値を持ちAND singleNameを持たない, THE Timeline_System SHALL それらをalbumNameによってRelease_Unitにグループ化する
3. WHEN 楽曲がsingleNameもalbumNameも持たない, THE Timeline_System SHALL それを個別のTimeline_Itemとして表示する
4. WHEN Release_Unitを表示する, THE Timeline_System SHALL リリース名と含まれる楽曲のリストを表示する
5. THE Timeline_System SHALL Release_UnitをreleaseYearとreleaseDate（MMDD形式）でグループ化してYear_Month_Unit表示する

### Requirement 5: 埋め込みコンテンツの表示

**User Story:** ユーザーとして、タイムラインアイテム内に埋め込まれたメディアコンテンツを見たい。それにより、豊かな視覚体験を楽しめるようにしたい。

#### Acceptance Criteria

1. WHEN Timeline_Itemが有効な埋め込みデータを含むmusicServiceEmbedsを含む, THE Timeline_System SHALL Embedded_Contentをインライン表示する
2. WHEN Timeline_ItemがdetailPageUrlsを含む, THE Timeline_System SHALL ラベル付きのクリック可能なリンクを表示する
3. WHEN Release_Unitを表示する, THE Timeline_System SHALL そのリリース内の任意の楽曲からのEmbedded_Contentを表示する
4. THE Timeline_System SHALL Embedded_Contentがタイムラインレイアウトを壊さないことを保証する

### Requirement 6: 直接URLアクセスのみ

**User Story:** 開発者として、タイムラインページを直接URLでのみアクセス可能にしたい。それにより、機能の公式リリース時期をコントロールできるようにしたい。

#### Acceptance Criteria

1. THE Timeline_System SHALL 直接URLルート（例: /timeline）を介してアクセス可能である
2. THE Timeline_System SHALL ボトムナビゲーションメニューに表示されない
3. WHEN ユーザーがタイムラインURLに直接ナビゲートする, THE Timeline_System SHALL タイムラインページをレンダリングする
4. THE Timeline_System SHALL 既存のページにタイムラインへのリンクやボタンを追加しない

### Requirement 7: 時間グループ化表示

**User Story:** ユーザーとして、タイムラインアイテムを年月でグループ化したい。それにより、イベントの時間的コンテキストを理解できるようにしたい。

#### Acceptance Criteria

1. THE Timeline_System SHALL Timeline_ItemsをYear_Month_Unit（YYYY-MM形式）でグループ化する
2. THE Timeline_System SHALL 各時間グループの上にYear_Month_Unitヘッダーを表示する
3. WHEN 複数のTimeline_Itemsが同じYear_Month_Unitを共有する, THE Timeline_System SHALL それらを1つの時間ヘッダーの下に表示する
4. THE Timeline_System SHALL Year_Month_Unitグループを時系列順に並べる

### Requirement 8: データ取得と統合

**User Story:** ユーザーとして、タイムラインに既存の楽曲とライブデータを読み込みたい。それにより、登録されたすべてのコンテンツを見ることができるようにしたい。

#### Acceptance Criteria

1. WHEN Timeline_Systemが初期化される, THE Timeline_System SHALL 楽曲データベースからすべての楽曲を取得する
2. WHEN Timeline_Systemが初期化される, THE Timeline_System SHALL ライブデータベースからすべてのライブイベントを取得する
3. THE Timeline_System SHALL 楽曲やライブに日付情報が欠落しているケースを処理する
4. WHEN データ取得が失敗する, THE Timeline_System SHALL ユーザーにエラーメッセージを表示する

### Requirement 9: ビジュアルデザインとスタイリング

**User Story:** ユーザーとして、タイムラインが視覚的に魅力的であってほしい。それにより、コンテンツを楽しく探索できるようにしたい。

#### Acceptance Criteria

1. THE Timeline_System SHALL 既存のアプリケーションデザインシステムと一貫したスタイリングを使用する
2. THE Timeline_System SHALL Timeline_Axisを可視的な垂直線として表示する
3. THE Timeline_System SHALL Timeline_ItemsをTimeline_Axisに接続するための視覚的インジケーター（ドット、ライン）を使用する
4. THE Timeline_System SHALL レイアウトがレスポンシブでモバイルデバイスで使用可能であることを保証する
5. THE Timeline_System SHALL 読みやすさのためにTimeline_Items間に十分なスペーシングを提供する

### Requirement 10: インタラクティブ要素

**User Story:** ユーザーとして、タイムラインアイテムと対話したい。それにより、楽曲やライブイベントの詳細にアクセスできるようにしたい。

#### Acceptance Criteria

1. WHEN Timeline_Itemがクリックされる, THE Timeline_System SHALL 対応する詳細ページ（楽曲詳細またはライブ詳細）にナビゲートする
2. WHEN Tour_Groupがクリックされる, THE Timeline_System SHALL 個別公演を表示するために展開する
3. WHEN Release_Unitがクリックされる, THE Timeline_System SHALL リリース内の個別楽曲を表示するために展開する
4. THE Timeline_System SHALL クリック可能な要素に対して視覚的フィードバック（ホバー効果、カーソル変更）を提供する
