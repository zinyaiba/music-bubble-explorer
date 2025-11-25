# Design Document

## Overview

本設計は、Music Bubble Explorer アプリケーションに楽曲詳細画面を追加し、楽曲登録・編集機能を拡張するものです。主な目標は以下の通りです：

1. **楽曲詳細画面の実装**: 楽曲管理画面から個別の楽曲をタップして詳細情報を閲覧できる新しい画面を追加
2. **メタデータの拡張**: アーティスト名、発売年、収録シングル、収録アルバム、ジャケット画像URL、楽曲詳細ページURL（複数）などの新しいフィールドを追加
3. **画像表示の最適化**: 外部URLからジャケット画像をサムネイル表示し、アプリ内に画像データを保存しない設計
4. **動的フィールド管理**: 楽曲詳細ページURLを動的に追加・削除できる機能
5. **既存機能との統合**: 既存の編集・削除機能を維持しつつ、新しい詳細画面へのナビゲーションを追加

この設計は、既存のコンポーネント構造（StandardLayout、UnifiedDialogLayout、DetailModal）を活用し、一貫性のあるユーザー体験を提供します。

## Architecture

### Component Hierarchy

```
App
├── SongManagement (楽曲管理画面)
│   ├── SongList (楽曲一覧)
│   │   └── SongItem (楽曲アイテム) → SongDetailView へ遷移
│   └── SongRegistrationForm (楽曲登録・編集フォーム)
│
├── SongDetailView (新規: 楽曲詳細画面)
│   ├── SongDetailHeader (ヘッダー: タイトル、編集・削除ボタン)
│   ├── SongDetailContent (詳細コンテンツ)
│   │   ├── JacketImage (ジャケット画像表示)
│   │   ├── BasicInfo (基本情報: アーティスト、発売年)
│   │   ├── CreatorInfo (クリエイター情報: 作詞・作曲・編曲)
│   │   ├── AlbumInfo (収録作品情報: シングル、アルバム)
│   │   └── ExternalLinks (外部リンク: 楽曲詳細ページURL)
│   └── ActionButtons (編集・削除ボタン)
│
└── SongRegistrationForm (拡張: 楽曲登録・編集フォーム)
    ├── BasicFields (既存フィールド: タイトル、作詞・作曲・編曲)
    ├── ExtendedFields (新規フィールド)
    │   ├── ArtistInput (アーティスト名入力)
    │   ├── ReleaseYearInput (発売年入力)
    │   ├── SingleInput (収録シングル入力)
    │   ├── AlbumInput (収録アルバム入力)
    │   ├── JacketUrlInput (ジャケット画像URL入力 + プレビュー)
    │   └── DetailUrlList (楽曲詳細ページURL入力リスト)
    │       └── DetailUrlInput (個別URL入力フィールド + 削除ボタン)
    └── FormActions (送信・キャンセルボタン)
```

### Data Flow

1. **楽曲詳細画面への遷移**:
   - `SongManagement` → ユーザーが楽曲アイテムをタップ → `SongDetailView` を表示
   - `SongDetailView` は楽曲IDを受け取り、DataManager から楽曲データを取得

2. **楽曲登録・編集**:
   - `SongRegistrationForm` → ユーザーが入力 → バリデーション → DataManager.saveSong() または DataManager.updateSong()
   - Firebase に保存後、ローカルキャッシュを更新

3. **画像表示**:
   - `JacketImage` コンポーネントが外部URLから画像を読み込み
   - 読み込み失敗時はデフォルト画像を表示

### State Management

- **ローカルステート**: 各コンポーネントは React の useState を使用してローカルステートを管理
- **データ永続化**: DataManager クラスが Firebase との通信を担当
- **キャッシュ**: MusicDataService がデータキャッシュを管理

## Components and Interfaces

### 1. SongDetailView (新規コンポーネント)

**責務**: 個別の楽曲の詳細情報を表示する全画面ビュー

**Props**:
```typescript
interface SongDetailViewProps {
  songId: string
  isVisible: boolean
  onClose: () => void
  onEdit: (song: Song) => void
  onDelete: (songId: string) => void
}
```

**主要機能**:
- 楽曲データの取得と表示
- ジャケット画像の表示（外部URL）
- 編集・削除ボタンの提供
- StandardLayout を使用した全画面表示

### 2. JacketImage (新規コンポーネント)

**責務**: ジャケット画像を外部URLから読み込んで表示

**Props**:
```typescript
interface JacketImageProps {
  imageUrl?: string
  alt: string
  size?: 'small' | 'medium' | 'large'
  onImageClick?: () => void
  fallbackIcon?: string
}
```

**主要機能**:
- 外部URLからの画像読み込み
- 読み込みエラー時のフォールバック表示
- レスポンシブサイズ調整
- クリック時の拡大表示（オプション）

### 3. DetailUrlList (新規コンポーネント)

**責務**: 楽曲詳細ページURLの動的リストを管理

**Props**:
```typescript
interface DetailUrlListProps {
  urls: string[]
  onChange: (urls: string[]) => void
  maxUrls?: number
  disabled?: boolean
}
```

**主要機能**:
- URL入力フィールドの動的追加・削除
- URL形式のバリデーション
- 最大数の制限（デフォルト: 10）

### 4. SongRegistrationForm (拡張)

**既存機能の維持**:
- タイトル、作詞・作曲・編曲の入力
- バリデーション
- Firebase への保存

**新規機能**:
- アーティスト名入力フィールド
- 発売年入力フィールド（数値のみ）
- 収録シングル入力フィールド
- 収録アルバム入力フィールド
- ジャケット画像URL入力フィールド + プレビュー
- 楽曲詳細ページURL動的リスト

### 5. SongManagement (拡張)

**既存機能の維持**:
- 楽曲一覧表示
- 検索機能
- 編集・削除ボタン

**新規機能**:
- 楽曲アイテムのタップで SongDetailView へ遷移
- 編集・削除ボタンは従来通り機能

## Data Models

### Song 型の拡張

既存の Song インターフェースに新しいフィールドを追加します：

```typescript
export interface Song {
  // 既存フィールド
  id: string
  title: string
  lyricists: string[]
  composers: string[]
  arrangers: string[]
  tags?: string[]
  notes?: string
  createdAt?: string
  
  // 新規フィールド
  artists?: string[]           // アーティスト名（複数対応）
  releaseYear?: number         // 発売年（4桁の数値）
  singleName?: string          // 収録シングル名
  albumName?: string           // 収録アルバム名
  jacketImageUrl?: string      // ジャケット画像URL
  detailPageUrls?: string[]    // 楽曲詳細ページURL（複数）
}
```

### FormData 型の拡張

SongRegistrationForm で使用するフォームデータ型を拡張します：

```typescript
interface SongFormData {
  // 既存フィールド
  title: string
  lyricists: string
  composers: string
  arrangers: string
  tags: string[]
  
  // 新規フィールド
  artists: string              // カンマ区切り文字列
  releaseYear: string          // 入力時は文字列、保存時に数値に変換
  singleName: string
  albumName: string
  jacketImageUrl: string
  detailPageUrls: string[]     // URL配列
}
```

### Validation Rules

各フィールドのバリデーションルール：

| フィールド | 必須 | 最大長 | 形式 | その他 |
|-----------|------|--------|------|--------|
| title | ✓ | 100 | テキスト | - |
| lyricists | - | 200 | カンマ区切り | - |
| composers | - | 200 | カンマ区切り | - |
| arrangers | - | 200 | カンマ区切り | - |
| artists | - | 200 | カンマ区切り | - |
| releaseYear | - | 4 | 数値 | 1000-9999 |
| singleName | - | 200 | テキスト | - |
| albumName | - | 200 | テキスト | - |
| jacketImageUrl | - | 500 | URL | http/https |
| detailPageUrls | - | 500/個 | URL | http/https, 最大10個 |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: ジャケット画像の表示とフォールバック

*For any* 楽曲データ、ジャケット画像URLが有効な場合は画像要素が表示され、無効またはundefinedの場合はデフォルトの代替画像が表示される
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: ジャケット画像のサイズ制約

*For any* 表示されたジャケット画像、その表示サイズは指定された範囲内（例: 最大200x200px）に収まる
**Validates: Requirements 2.4**

### Property 3: クリエイター情報のカンマ区切り表示

*For any* 楽曲データ、作詞者・作曲者・編曲者の各配列が空でない場合、それぞれの名前がカンマ区切りで表示され、すべての名前が表示文字列に含まれる
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: アーティスト名の表示

*For any* 楽曲データ、アーティスト配列が空でない場合、すべてのアーティスト名がカンマ区切りで表示される
**Validates: Requirements 4.1, 4.3**

### Property 5: 発売年の4桁表示

*For any* 楽曲データ、発売年が定義されている場合、4桁の数値形式で表示される
**Validates: Requirements 5.1**

### Property 6: 収録作品情報の表示

*For any* 楽曲データ、収録シングル名または収録アルバム名が定義されている場合、それぞれの値が表示される
**Validates: Requirements 6.1, 7.1**

### Property 7: 楽曲詳細ページURLのリスト表示

*For any* 楽曲データ、楽曲詳細ページURL配列が空でない場合、すべてのURLがリスト形式で登録順に表示される
**Validates: Requirements 8.1, 8.4**

### Property 8: テキスト入力の文字数制限

*For any* テキスト入力フィールド（アーティスト名、収録シングル、収録アルバム）、入力値が200文字を超える場合、エラーメッセージが表示される
**Validates: Requirements 9.3, 11.3, 12.3**

### Property 9: カンマ区切り入力の許可

*For any* カンマ区切り対応フィールド（アーティスト名）、カンマを含む文字列の入力が受け付けられ、保存後に配列として正しく分割される
**Validates: Requirements 9.4**

### Property 10: 発売年の数値バリデーション

*For any* 発売年入力、数値以外の値または1000未満・9999を超える値の場合、エラーメッセージが表示される
**Validates: Requirements 10.3, 10.4**

### Property 11: URL形式のバリデーション

*For any* URL入力フィールド（ジャケット画像URL、楽曲詳細ページURL）、無効なURL形式の入力に対してエラーメッセージが表示される
**Validates: Requirements 13.3, 14.4**

### Property 12: URL入力プレビュー表示

*For any* 有効なジャケット画像URL、入力後にプレビュー画像が表示される
**Validates: Requirements 13.4**

### Property 13: URL文字数制限

*For any* URL入力フィールド、入力値が500文字を超える場合、エラーメッセージが表示される
**Validates: Requirements 13.5, 14.7**

### Property 14: 動的URL入力フィールドの追加

*For any* 楽曲詳細ページURL入力リスト、追加ボタンをクリックすると新しい入力フィールドが追加され、フィールド数が10個に達すると追加ボタンが無効化される
**Validates: Requirements 14.2, 14.6**

### Property 15: 動的URL入力フィールドの削除

*For any* 楽曲詳細ページURL入力フィールド、削除ボタンをクリックすると該当フィールドが削除され、残りのフィールドが正しく表示される
**Validates: Requirements 14.5**

### Property 16: 編集画面での既存データ表示

*For any* 楽曲データ、編集画面が表示されたとき、すべての既存フィールド値が対応する入力フィールドに正しく表示される
**Validates: Requirements 15.1**

### Property 17: 入力変更の受け付け

*For any* 入力フィールド、ユーザーが値を変更したとき、変更内容がフォームステートに反映される
**Validates: Requirements 15.2**

### Property 18: Firebaseデータのラウンドトリップ

*For any* 拡張された楽曲データ、Firebaseに保存後、同じIDで読み込んだデータがすべてのフィールドで元のデータと一致する
**Validates: Requirements 16.1, 16.4**

### Property 19: レスポンシブ画像サイズ調整

*For any* 画面幅、ジャケット画像のサイズが画面幅に応じて適切に調整され、画面からはみ出さない
**Validates: Requirements 17.3**

### Property 20: 長いテキストの折り返し

*For any* 長いテキスト（URL等）、表示時に適切に折り返されるか省略表示され、画面からはみ出さない
**Validates: Requirements 17.4**

## Error Handling

### 画像読み込みエラー

- **シナリオ**: ジャケット画像URLが無効、または画像の読み込みに失敗
- **処理**: 
  1. `<img>` 要素の `onError` イベントをキャッチ
  2. デフォルトの代替画像（音符アイコンなど）を表示
  3. コンソールに警告ログを出力（本番環境では抑制）

### URL バリデーションエラー

- **シナリオ**: ユーザーが無効なURL形式を入力
- **処理**:
  1. URL形式を正規表現でバリデーション: `/^https?:\/\/.+/`
  2. 無効な場合、入力フィールドの下にエラーメッセージを表示
  3. フォーム送信をブロック

### 文字数制限エラー

- **シナリオ**: ユーザーが最大文字数を超える入力を行う
- **処理**:
  1. リアルタイムで文字数をカウント
  2. 制限を超えた場合、エラーメッセージを表示
  3. フォーム送信をブロック

### Firebase 保存エラー

- **シナリオ**: Firebaseへの保存が失敗（ネットワークエラー、権限エラーなど）
- **処理**:
  1. エラーをキャッチし、ユーザーフレンドリーなメッセージを表示
  2. 既存の `DataManager.getDetailedErrorMessage()` を使用
  3. ローカルキャッシュは更新せず、再試行オプションを提供

### データ取得エラー

- **シナリオ**: 楽曲詳細画面で楽曲データが見つからない
- **処理**:
  1. 楽曲IDでデータを検索
  2. 見つからない場合、「楽曲が見つかりません」メッセージを表示
  3. 楽曲管理画面に戻るボタンを提供

## Testing Strategy

### Unit Testing

本機能では、以下のコンポーネントとユーティリティ関数に対してユニットテストを実装します：

1. **JacketImage コンポーネント**:
   - 有効なURLで画像が表示されること
   - 無効なURLでフォールバック画像が表示されること
   - 画像クリック時のイベントハンドラが正しく動作すること

2. **DetailUrlList コンポーネント**:
   - URL追加ボタンが正しく動作すること
   - URL削除ボタンが正しく動作すること
   - 最大数（10個）に達したときに追加ボタンが無効化されること

3. **バリデーション関数**:
   - URL形式のバリデーション
   - 文字数制限のバリデーション
   - 発売年の数値バリデーション

4. **データ変換関数**:
   - カンマ区切り文字列から配列への変換
   - 配列からカンマ区切り文字列への変換

### Property-Based Testing

本機能では、**fast-check** ライブラリを使用してプロパティベーステストを実装します。各プロパティベーステストは最低100回の反復を実行し、ランダムな入力に対して正しく動作することを検証します。

#### テスト対象プロパティ

1. **Property 1-2**: ジャケット画像の表示とサイズ制約
2. **Property 3-4**: クリエイター情報とアーティスト名の表示
3. **Property 5-7**: 発売年、収録作品、URL リストの表示
4. **Property 8-13**: 入力バリデーション（文字数、URL形式、数値）
5. **Property 14-15**: 動的URL入力フィールドの追加・削除
6. **Property 16-17**: 編集画面でのデータ表示と変更
7. **Property 18**: Firebaseデータのラウンドトリップ
8. **Property 19-20**: レスポンシブ表示

#### テストタグ形式

各プロパティベーステストには、以下の形式でコメントタグを付与します：

```typescript
// **Feature: song-detail-and-enhanced-registration, Property 1: ジャケット画像の表示とフォールバック**
```

#### ジェネレータ戦略

- **楽曲データジェネレータ**: ランダムな楽曲データを生成（すべてのフィールドを含む）
- **URL ジェネレータ**: 有効/無効なURLをランダムに生成
- **文字列ジェネレータ**: 様々な長さの文字列を生成（境界値を含む）
- **数値ジェネレータ**: 有効/無効な発売年を生成

### Integration Testing

以下の統合テストを実装します：

1. **楽曲詳細画面の表示フロー**:
   - 楽曲管理画面 → 楽曲詳細画面 → 編集画面 → 保存 → 詳細画面に戻る

2. **楽曲登録フロー**:
   - 楽曲管理画面 → 新規登録画面 → 入力 → 保存 → Firebase確認

3. **画像表示フロー**:
   - ジャケット画像URL入力 → プレビュー表示 → 保存 → 詳細画面で表示

### Manual Testing

以下の項目は手動テストで確認します：

1. **モバイルデバイスでのレスポンシブ表示**:
   - iPhone、Android実機での表示確認
   - 画面回転時の表示確認

2. **画像読み込みパフォーマンス**:
   - 大きな画像URLでの読み込み速度
   - 複数の画像を含む楽曲リストのスクロール性能

3. **キーボード表示**:
   - モバイルデバイスでの適切なキーボードタイプ表示
   - 入力フィールドのフォーカス動作

## Implementation Notes

### 既存コードへの影響

1. **Song 型の拡張**:
   - `src/types/music.ts` に新しいフィールドを追加
   - 既存のフィールドはすべて維持（後方互換性）

2. **DataManager の拡張**:
   - 既存のメソッドは変更不要
   - Firebase スキーマは自動的に拡張フィールドを受け入れる

3. **SongManagement コンポーネントの拡張**:
   - 楽曲アイテムのクリックハンドラを追加
   - 既存の編集・削除機能は維持

4. **SongRegistrationForm コンポーネントの拡張**:
   - 新しい入力フィールドを追加
   - 既存のバリデーションロジックを拡張

### パフォーマンス考慮事項

1. **画像の遅延読み込み**:
   - 楽曲リストでは画像を遅延読み込み（Intersection Observer API）
   - 詳細画面では即座に読み込み

2. **URL バリデーションの最適化**:
   - デバウンス処理を適用（300ms）
   - 不要な再バリデーションを防ぐ

3. **動的フィールドの最適化**:
   - React の key プロパティを適切に設定
   - 不要な再レンダリングを防ぐ

### アクセシビリティ

1. **画像の代替テキスト**:
   - すべての画像に適切な `alt` 属性を設定
   - 読み込みエラー時も代替テキストを提供

2. **フォームラベル**:
   - すべての入力フィールドに `<label>` を関連付け
   - 必須フィールドを明示

3. **キーボードナビゲーション**:
   - すべてのインタラクティブ要素にキーボードアクセスを提供
   - フォーカス順序を論理的に設定

4. **スクリーンリーダー対応**:
   - ARIA ラベルを適切に設定
   - エラーメッセージを `aria-live` で通知
