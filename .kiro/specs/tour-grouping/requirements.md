# Requirements Document

## Introduction

ツアーグループ化機能は、同じツアー名を持つ複数のライブ公演をグループ化して表示し、詳細画面で公演地別にセトリを確認できるようにする機能です。現在のライブ管理機能では各公演が個別エントリとして表示されていますが、この機能によりツアー単位での一覧表示と、公演地別の詳細確認が可能になります。

## Glossary

- **Tour_Group**: 同じツアー名（title）を持つライブ公演の集合。liveTypeが'tour'のライブのみがグループ化対象となる
- **Tour_Performance**: ツアーグループ内の個別公演。公演地（tourLocation）、会場名（venueName）、日時（dateTime）、セトリ（setlist）を持つ
- **Grouping_Service**: ライブデータをツアー名でグループ化するロジックを提供するサービス
- **Tour_List_View**: ツアーをグループ化して表示する一覧画面
- **Tour_Detail_View**: ツアーの詳細を公演地別に表示する画面
- **Performance_Accordion**: 公演地別のセトリを展開・折りたたみ表示するUIコンポーネント

## Requirements

### Requirement 1: ツアーグループ化ロジック

**User Story:** As a ユーザー, I want 同じツアー名のライブを自動的にグループ化してほしい, so that ツアー単位でライブを管理できる

#### Acceptance Criteria

1. WHEN ライブデータを取得した時, THE Grouping_Service SHALL liveTypeが'tour'のライブを同じtitleでグループ化すること
2. WHEN グループ化を実行した時, THE Grouping_Service SHALL liveTypeが'solo'または'festival'のライブはグループ化せず個別に表示すること
3. WHEN Tour_Groupを生成した時, THE Grouping_Service SHALL グループ内の公演を日時（dateTime）の昇順でソートすること
4. WHEN Tour_Groupを生成した時, THE Grouping_Service SHALL グループの代表日時として最も古い公演の日時を使用すること
5. WHEN Tour_Groupを生成した時, THE Grouping_Service SHALL グループ内の公演数を計算して保持すること

### Requirement 2: ツアー一覧表示

**User Story:** As a ユーザー, I want ライブ一覧でツアーがグループ化されて表示されてほしい, so that ツアー全体を一目で把握できる

#### Acceptance Criteria

1. WHEN ライブ一覧を表示した時, THE Tour_List_View SHALL ツアーをグループ化して1つのカードとして表示すること
2. WHEN ツアーカードを表示した時, THE Tour_List_View SHALL ツアー名、公演数、開催期間（最初と最後の公演日）を表示すること
3. WHEN ツアーカードを表示した時, THE Tour_List_View SHALL 公演地のリスト（最大3件）をプレビュー表示すること
4. WHEN 単独公演またはフェスを表示した時, THE Tour_List_View SHALL 従来通り個別のカードとして表示すること
5. WHEN 一覧をソートした時, THE Tour_List_View SHALL ツアーは代表日時、その他は公演日時で降順ソートすること

### Requirement 3: ツアー詳細表示

**User Story:** As a ユーザー, I want ツアー詳細画面で公演地別にセトリを確認したい, so that 各公演の内容を比較できる

#### Acceptance Criteria

1. WHEN ツアー詳細画面を開いた時, THE Tour_Detail_View SHALL ツアー名と全公演数を表示すること
2. WHEN ツアー詳細画面を開いた時, THE Tour_Detail_View SHALL 公演地別にアコーディオン形式で表示すること
3. WHEN Performance_Accordionを表示した時, THE Tour_Detail_View SHALL 公演地名、会場名、日時を表示すること
4. WHEN Performance_Accordionを展開した時, THE Tour_Detail_View SHALL その公演のセトリを表示すること
5. WHEN Performance_Accordionを折りたたんだ時, THE Tour_Detail_View SHALL セトリを非表示にすること
6. WHEN ツアー詳細画面を開いた時, THE Tour_Detail_View SHALL 最初の公演のアコーディオンをデフォルトで展開状態にすること

### Requirement 4: 公演間のセトリ比較

**User Story:** As a ユーザー, I want 複数の公演のセトリを同時に確認したい, so that 日替わり曲の違いを把握できる

#### Acceptance Criteria

1. WHEN 複数のPerformance_Accordionを展開した時, THE Tour_Detail_View SHALL 複数の公演のセトリを同時に表示すること
2. WHEN セトリを表示した時, THE Tour_Detail_View SHALL 日替わり曲には視覚的なインジケーターを表示すること
3. WHEN セトリ内の楽曲をタップした時, THE Tour_Detail_View SHALL 楽曲詳細ページに遷移すること

### Requirement 5: ナビゲーションと編集

**User Story:** As a ユーザー, I want ツアー詳細画面から個別公演の編集ができるようにしたい, so that 各公演の情報を更新できる

#### Acceptance Criteria

1. WHEN Performance_Accordionを展開した時, THE Tour_Detail_View SHALL その公演の編集ボタンを表示すること
2. WHEN 編集ボタンをタップした時, THE Tour_Detail_View SHALL 該当公演の編集ページに遷移すること
3. WHEN ツアー詳細画面で戻るボタンをタップした時, THE Tour_Detail_View SHALL ライブ一覧ページに遷移すること
