# Requirements Document

## Introduction

本機能は、楽曲詳細画面の追加と、楽曲登録・編集画面における入力項目の拡張を実現します。ユーザーは楽曲管理画面から楽曲をタップして詳細情報を閲覧でき、より豊富なメタデータ（アーティスト名、発売年、収録作品、ジャケット画像URL、楽曲詳細ページURLなど）を登録・編集できるようになります。ジャケット画像については、外部URLを指定することでサムネイル表示を実現し、アプリ内に画像データを保存しない設計とします。

## Glossary

- **System**: Music Bubble Explorer アプリケーション
- **楽曲詳細画面**: 個別の楽曲に関する詳細情報を表示する画面
- **楽曲管理画面**: 登録済み楽曲の一覧を表示し、編集・削除を行う画面（SongManagement コンポーネント）
- **楽曲登録画面**: 新規楽曲を登録するフォーム画面（SongRegistrationForm コンポーネント）
- **楽曲編集画面**: 既存楽曲の情報を編集するフォーム画面（SongRegistrationForm コンポーネント）
- **ジャケット画像**: 楽曲のアルバムアートやシングルジャケットの画像
- **サムネイル**: 画像の縮小表示
- **楽曲詳細ページURL**: 楽曲に関する外部Webページへのリンク（複数登録可能）
- **Song型**: 楽曲データを表す TypeScript インターフェース
- **DataManager**: 楽曲データの永続化を管理するクラス
- **Firebase**: バックエンドデータストレージサービス

## Requirements

### Requirement 1

**User Story:** ユーザーとして、楽曲管理画面から楽曲をタップして詳細情報を閲覧したい。これにより、楽曲の包括的な情報を一箇所で確認できる。

#### Acceptance Criteria

1. WHEN ユーザーが楽曲管理画面で楽曲アイテムをタップ THEN the System SHALL 楽曲詳細画面へ遷移する
2. WHEN 楽曲詳細画面が表示される THEN the System SHALL 楽曲タイトルをヘッダーに表示する
3. WHEN 楽曲詳細画面が表示される THEN the System SHALL 既存の編集ボタン（鉛筆マーク）と削除ボタン（ゴミ箱）を維持する
4. WHEN ユーザーが楽曲詳細画面の編集ボタンをタップ THEN the System SHALL 楽曲編集画面へ遷移する
5. WHEN ユーザーが楽曲詳細画面の削除ボタンをタップ THEN the System SHALL 削除確認ダイアログを表示する

### Requirement 2

**User Story:** ユーザーとして、楽曲詳細画面でジャケット画像を閲覧したい。これにより、視覚的に楽曲を識別できる。

#### Acceptance Criteria

1. WHEN 楽曲にジャケット画像URLが登録されている THEN the System SHALL 画像URLからサムネイルを読み込んで表示する
2. WHEN ジャケット画像の読み込みが失敗する THEN the System SHALL デフォルトの代替画像またはプレースホルダーを表示する
3. WHEN ジャケット画像URLが登録されていない THEN the System SHALL デフォルトの代替画像またはプレースホルダーを表示する
4. WHEN ジャケット画像が表示される THEN the System SHALL 適切なサイズ（例: 200x200px）でサムネイル表示する
5. WHEN ユーザーがジャケット画像をタップ THEN the System SHALL 画像を拡大表示するか、元のURLを新しいタブで開く

### Requirement 3

**User Story:** ユーザーとして、楽曲詳細画面で作詞者・作曲者・編曲者の情報を閲覧したい。これにより、楽曲のクリエイター情報を確認できる。

#### Acceptance Criteria

1. WHEN 楽曲に作詞者が登録されている THEN the System SHALL 作詞者名をカンマ区切りで表示する
2. WHEN 楽曲に作曲者が登録されている THEN the System SHALL 作曲者名をカンマ区切りで表示する
3. WHEN 楽曲に編曲者が登録されている THEN the System SHALL 編曲者名をカンマ区切りで表示する
4. WHEN 作詞者・作曲者・編曲者のいずれかが未登録 THEN the System SHALL その項目を非表示にするか「未登録」と表示する

### Requirement 4

**User Story:** ユーザーとして、楽曲詳細画面でアーティスト名を閲覧したい。これにより、楽曲の演奏者・歌手を確認できる。

#### Acceptance Criteria

1. WHEN 楽曲にアーティスト名が登録されている THEN the System SHALL アーティスト名を表示する
2. WHEN アーティスト名が未登録 THEN the System SHALL 「未登録」と表示するか項目を非表示にする
3. WHEN 複数のアーティストが登録されている THEN the System SHALL アーティスト名をカンマ区切りで表示する

### Requirement 5

**User Story:** ユーザーとして、楽曲詳細画面で発売年を閲覧したい。これにより、楽曲のリリース時期を確認できる。

#### Acceptance Criteria

1. WHEN 楽曲に発売年が登録されている THEN the System SHALL 発売年を4桁の数値形式で表示する
2. WHEN 発売年が未登録 THEN the System SHALL 「未登録」と表示するか項目を非表示にする
3. WHEN 発売年が無効な値（例: 1800年以前、未来の年）である THEN the System SHALL エラー表示を行わず、登録された値をそのまま表示する

### Requirement 6

**User Story:** ユーザーとして、楽曲詳細画面で収録シングル名を閲覧したい。これにより、楽曲がどのシングルに収録されているかを確認できる。

#### Acceptance Criteria

1. WHEN 楽曲に収録シングル名が登録されている THEN the System SHALL 収録シングル名を表示する
2. WHEN 収録シングル名が未登録 THEN the System SHALL 「未登録」と表示するか項目を非表示にする

### Requirement 7

**User Story:** ユーザーとして、楽曲詳細画面で収録アルバム名を閲覧したい。これにより、楽曲がどのアルバムに収録されているかを確認できる。

#### Acceptance Criteria

1. WHEN 楽曲に収録アルバム名が登録されている THEN the System SHALL 収録アルバム名を表示する
2. WHEN 収録アルバム名が未登録 THEN the System SHALL 「未登録」と表示するか項目を非表示にする

### Requirement 8

**User Story:** ユーザーとして、楽曲詳細画面で楽曲詳細ページのリンクを閲覧したい。これにより、外部サイトの詳細情報にアクセスできる。

#### Acceptance Criteria

1. WHEN 楽曲に楽曲詳細ページURLが1つ以上登録されている THEN the System SHALL 全ての登録されたURLをリスト形式で表示する
2. WHEN ユーザーが楽曲詳細ページURLをタップ THEN the System SHALL 該当URLを新しいタブまたはウィンドウで開く
3. WHEN 楽曲詳細ページURLが未登録 THEN the System SHALL 「未登録」と表示するか項目を非表示にする
4. WHEN 複数の楽曲詳細ページURLが登録されている THEN the System SHALL URLを登録順に表示する

### Requirement 9

**User Story:** ユーザーとして、楽曲登録画面でアーティスト名を入力したい。これにより、楽曲の演奏者・歌手情報を記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL アーティスト名入力フィールドを表示する
2. WHEN ユーザーがアーティスト名を入力する THEN the System SHALL 入力値を受け付ける
3. WHEN アーティスト名が200文字を超える THEN the System SHALL エラーメッセージを表示する
4. WHEN 複数のアーティストを入力する THEN the System SHALL カンマ区切りでの入力を許可する

### Requirement 10

**User Story:** ユーザーとして、楽曲登録画面で発売年を入力したい。これにより、楽曲のリリース時期を記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL 発売年入力フィールドを表示する
2. WHEN ユーザーが発売年を入力する THEN the System SHALL 数値形式（4桁）での入力を受け付ける
3. WHEN 発売年が数値以外の値である THEN the System SHALL エラーメッセージを表示する
4. WHEN 発売年が1000未満または9999を超える THEN the System SHALL エラーメッセージを表示する

### Requirement 11

**User Story:** ユーザーとして、楽曲登録画面で収録シングル名を入力したい。これにより、楽曲の収録作品情報を記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL 収録シングル名入力フィールドを表示する
2. WHEN ユーザーが収録シングル名を入力する THEN the System SHALL 入力値を受け付ける
3. WHEN 収録シングル名が200文字を超える THEN the System SHALL エラーメッセージを表示する

### Requirement 12

**User Story:** ユーザーとして、楽曲登録画面で収録アルバム名を入力したい。これにより、楽曲の収録作品情報を記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL 収録アルバム名入力フィールドを表示する
2. WHEN ユーザーが収録アルバム名を入力する THEN the System SHALL 入力値を受け付ける
3. WHEN 収録アルバム名が200文字を超える THEN the System SHALL エラーメッセージを表示する

### Requirement 13

**User Story:** ユーザーとして、楽曲登録画面でジャケット画像URLを入力したい。これにより、楽曲の視覚的な識別情報を記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL ジャケット画像URL入力フィールドを表示する
2. WHEN ユーザーがジャケット画像URLを入力する THEN the System SHALL URL形式での入力を受け付ける
3. WHEN 入力されたURLが無効な形式である THEN the System SHALL エラーメッセージを表示する
4. WHEN 有効なジャケット画像URLが入力される THEN the System SHALL プレビュー画像を表示する
5. WHEN ジャケット画像URLが500文字を超える THEN the System SHALL エラーメッセージを表示する

### Requirement 14

**User Story:** ユーザーとして、楽曲登録画面で楽曲詳細ページURLを複数入力したい。これにより、複数の外部リソースへのリンクを記録できる。

#### Acceptance Criteria

1. WHEN 楽曲登録画面が表示される THEN the System SHALL 楽曲詳細ページURL入力フィールドを1つ表示する
2. WHEN ユーザーが「追加」ボタンをタップ THEN the System SHALL 新しい楽曲詳細ページURL入力フィールドを追加する
3. WHEN ユーザーが楽曲詳細ページURLを入力する THEN the System SHALL URL形式での入力を受け付ける
4. WHEN 入力されたURLが無効な形式である THEN the System SHALL エラーメッセージを表示する
5. WHEN ユーザーが入力フィールドの削除ボタンをタップ THEN the System SHALL 該当する入力フィールドを削除する
6. WHEN 楽曲詳細ページURLが10個を超える THEN the System SHALL 追加ボタンを無効化する
7. WHEN 楽曲詳細ページURLが500文字を超える THEN the System SHALL エラーメッセージを表示する

### Requirement 15

**User Story:** ユーザーとして、楽曲編集画面で既存の楽曲情報を編集したい。これにより、登録済みの楽曲データを更新できる。

#### Acceptance Criteria

1. WHEN 楽曲編集画面が表示される THEN the System SHALL 既存の楽曲データを全ての入力フィールドに表示する
2. WHEN ユーザーが入力フィールドを変更する THEN the System SHALL 変更内容を受け付ける
3. WHEN ユーザーが「更新」ボタンをタップ THEN the System SHALL 変更内容を検証し保存する
4. WHEN 保存が成功する THEN the System SHALL 成功メッセージを表示し楽曲詳細画面に戻る
5. WHEN 保存が失敗する THEN the System SHALL エラーメッセージを表示し編集画面を維持する

### Requirement 16

**User Story:** ユーザーとして、拡張された楽曲データをFirebaseに保存したい。これにより、データの永続化とデバイス間での同期が可能になる。

#### Acceptance Criteria

1. WHEN 楽曲が登録または更新される THEN the System SHALL 拡張されたフィールドを含む楽曲データをFirebaseに保存する
2. WHEN Firebaseへの保存が成功する THEN the System SHALL ローカルキャッシュを更新する
3. WHEN Firebaseへの保存が失敗する THEN the System SHALL エラーメッセージを表示する
4. WHEN 楽曲データを読み込む THEN the System SHALL Firebaseから拡張されたフィールドを含む楽曲データを取得する

### Requirement 17

**User Story:** ユーザーとして、楽曲詳細画面がモバイルデバイスで適切に表示されることを期待する。これにより、スマートフォンでも快適に閲覧できる。

#### Acceptance Criteria

1. WHEN 楽曲詳細画面がモバイルデバイスで表示される THEN the System SHALL レスポンシブレイアウトを適用する
2. WHEN 画面幅が768px未満である THEN the System SHALL モバイル最適化されたレイアウトを使用する
3. WHEN ジャケット画像が表示される THEN the System SHALL 画面幅に応じて画像サイズを調整する
4. WHEN 長いテキスト（URL等）が表示される THEN the System SHALL テキストを適切に折り返すか省略表示する

### Requirement 18

**User Story:** ユーザーとして、楽曲登録・編集画面がモバイルデバイスで適切に表示されることを期待する。これにより、スマートフォンでも快適に入力できる。

#### Acceptance Criteria

1. WHEN 楽曲登録・編集画面がモバイルデバイスで表示される THEN the System SHALL レスポンシブレイアウトを適用する
2. WHEN 画面幅が768px未満である THEN the System SHALL モバイル最適化されたレイアウトを使用する
3. WHEN 入力フィールドがフォーカスされる THEN the System SHALL 適切なキーボードタイプを表示する
4. WHEN 複数の楽曲詳細ページURL入力フィールドが表示される THEN the System SHALL スクロール可能な領域内に配置する
