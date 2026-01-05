# 設計書

## 概要

Music Bubble Explorer V2は、既存アプリケーションの機能を維持しつつ、パフォーマンス・レイアウト統一・クロスブラウザ対応を大幅に改善した新規プロジェクトである。React + TypeScript + Viteをベースに、モダンなアーキテクチャで再構築する。

### 設計方針

1. **シンプルなアーキテクチャ**: 過度な抽象化を避け、保守性を重視
2. **パフォーマンス優先**: 初期読み込み3秒以内、操作応答100ms以内
3. **ページベースナビゲーション**: ダイアログ重ね表示をやめ、React Routerによるページ遷移
4. **統一されたデザインシステム**: 全ページで一貫したUI/UX
5. **クロスブラウザ対応**: Safari/Chrome、iPhone/Androidで動作保証

## アーキテクチャ

### 技術スタック

```
フロントエンド:
- React 18
- TypeScript 5
- Vite 5
- React Router v6（ページルーティング）
- CSS Modules（スタイリング）

バックエンド:
- Firebase Firestore（既存データベース共有）

ビルド・開発:
- Vite（ビルドツール）
- Vitest（テスト）
- ESLint + Prettier（コード品質）

デプロイ:
- GitHub Pages
- GitHub Actions（CI/CD）
- リポジトリ名: music-bubble-v2
- 公開URL: https://[username].github.io/music-bubble-v2/
```

### ディレクトリ構造

```
music-bubble-v2/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── common/          # 共通コンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── bubble/          # シャボン玉関連
│   │   │   ├── BubbleCanvas.tsx
│   │   │   ├── Bubble.tsx
│   │   │   └── BubbleDetail.tsx
│   │   ├── filter/          # フィルタ関連
│   │   │   ├── ArtistFilter.tsx
│   │   │   └── GenreFilter.tsx
│   │   ├── song/            # 楽曲関連
│   │   │   ├── SongList.tsx
│   │   │   ├── SongDetail.tsx
│   │   │   ├── SongForm.tsx
│   │   │   └── SongCard.tsx
│   │   └── tag/             # タグ関連
│   │       ├── TagList.tsx
│   │       ├── TagDetail.tsx
│   │       └── TagInput.tsx
│   ├── pages/               # ページコンポーネント
│   │   ├── TopPage.tsx
│   │   ├── SongListPage.tsx
│   │   ├── SongDetailPage.tsx
│   │   ├── TagListPage.tsx
│   │   ├── TagRegistrationPage.tsx
│   │   └── InfoPage.tsx
│   ├── hooks/               # カスタムフック
│   │   ├── useSongs.ts
│   │   ├── useTags.ts
│   │   ├── useFilter.ts
│   │   └── useAnimation.ts
│   ├── services/            # ビジネスロジック
│   │   ├── firebaseService.ts
│   │   ├── songService.ts
│   │   ├── tagService.ts
│   │   └── cacheService.ts
│   ├── types/               # 型定義
│   │   └── index.ts
│   ├── styles/              # グローバルスタイル
│   │   ├── variables.css
│   │   ├── reset.css
│   │   └── global.css
│   ├── config/              # 設定
│   │   └── firebase.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## コンポーネントとインターフェース

### ページコンポーネント

```typescript
// pages/TopPage.tsx
interface TopPageProps {}

// pages/SongListPage.tsx
interface SongListPageProps {}

// pages/SongDetailPage.tsx
interface SongDetailPageProps {
  songId: string  // URLパラメータから取得
}

// pages/TagListPage.tsx
interface TagListPageProps {}

// pages/TagRegistrationPage.tsx
interface TagRegistrationPageProps {}

// pages/InfoPage.tsx
interface InfoPageProps {}
```

### 共通コンポーネント

```typescript
// components/common/Header.tsx
interface HeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

// components/common/Navigation.tsx
interface NavigationProps {
  currentPath: string
}

// components/common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

// components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}
```

### シャボン玉コンポーネント

```typescript
// components/bubble/BubbleCanvas.tsx
interface BubbleCanvasProps {
  bubbles: Bubble[]
  isPaused: boolean
  onBubbleClick: (bubble: Bubble) => void
  width: number
  height: number
}

// components/bubble/Bubble.tsx
interface BubbleProps {
  bubble: Bubble
  onClick: () => void
}

// components/bubble/BubbleDetail.tsx
interface BubbleDetailProps {
  bubble: Bubble
  songs: Song[]
  onSongClick: (songId: string) => void
  onClose: () => void
}
```

### フィルタコンポーネント

```typescript
// components/filter/ArtistFilter.tsx
type ArtistFilterValue = '栗林みな実' | 'Minami' | 'other' | null

interface ArtistFilterProps {
  value: ArtistFilterValue
  onChange: (value: ArtistFilterValue) => void
}

// components/filter/GenreFilter.tsx
interface GenreFilterProps {
  genres: string[]
  selectedGenres: string[]
  onChange: (genres: string[]) => void
}
```

### 楽曲コンポーネント

```typescript
// components/song/SongList.tsx
interface SongListProps {
  songs: Song[]
  onSongClick: (songId: string) => void
  searchQuery?: string
}

// components/song/SongDetail.tsx
interface SongDetailProps {
  song: Song
  onEdit: () => void
  onBack: () => void
}

// components/song/SongForm.tsx
interface SongFormProps {
  song?: Song  // 編集時は既存データ
  onSubmit: (song: Partial<Song>) => void
  onCancel: () => void
}

// components/song/SongCard.tsx
interface SongCardProps {
  song: Song
  onClick: () => void
  compact?: boolean
}
```

### タグコンポーネント

```typescript
// components/tag/TagList.tsx
interface TagListProps {
  tags: Tag[]
  onTagClick: (tagId: string) => void
  searchQuery?: string
}

// components/tag/TagDetail.tsx
interface TagDetailProps {
  tag: Tag
  songs: Song[]
  onSongClick: (songId: string) => void
  onShare: () => void
  onBack: () => void
}

// components/tag/TagInput.tsx
interface TagInputProps {
  existingTags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
}
```

## データモデル

### 楽曲データ（既存Firebase構造を継承）

```typescript
interface Song {
  id: string
  title: string
  artists?: string[]
  lyricists: string[]
  composers: string[]
  arrangers: string[]
  tags?: string[]
  notes?: string
  releaseYear?: number
  releaseDate?: string
  singleName?: string
  albumName?: string
  musicServiceEmbed?: string
  detailPageUrls?: DetailPageUrl[]
  createdAt?: string
  updatedAt?: string
}

interface DetailPageUrl {
  url: string
  label?: string
}
```

### タグデータ（クライアント側で生成）

```typescript
interface Tag {
  id: string
  name: string
  songIds: string[]
  songCount: number
}
```

### シャボン玉データ

```typescript
type BubbleType = 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'

interface Bubble {
  id: string
  type: BubbleType
  name: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  relatedCount: number
}
```

### フィルタ状態

```typescript
interface FilterState {
  artist: '栗林みな実' | 'Minami' | 'other' | null
  genres: string[]
}
```



## エラーハンドリング

### エラー種別と対応

```typescript
// ネットワークエラー
interface NetworkError {
  type: 'network'
  message: string
  retryable: true
}

// データエラー
interface DataError {
  type: 'data'
  message: string
  retryable: boolean
}

// バリデーションエラー
interface ValidationError {
  type: 'validation'
  field: string
  message: string
}
```

### エラーハンドリング戦略

1. **ネットワークエラー**: リトライボタン表示、オフラインキャッシュからデータ表示
2. **データエラー**: エラーメッセージ表示、管理者への報告オプション
3. **バリデーションエラー**: フィールド単位でエラー表示

### オフライン対応

```typescript
// services/cacheService.ts
interface CacheService {
  // データをローカルストレージにキャッシュ
  cacheSongs(songs: Song[]): void
  cacheTags(tags: Tag[]): void
  
  // キャッシュからデータ取得
  getCachedSongs(): Song[] | null
  getCachedTags(): Tag[] | null
  
  // キャッシュの有効期限チェック
  isCacheValid(): boolean
  
  // キャッシュクリア
  clearCache(): void
}
```

## テスト戦略

### テスト種別

1. **ユニットテスト**: サービス層、ユーティリティ関数
2. **コンポーネントテスト**: UIコンポーネントの動作確認
3. **統合テスト**: ページ単位の動作確認

### テストツール

- Vitest（テストランナー）
- React Testing Library（コンポーネントテスト）
- MSW（APIモック）



## 正確性プロパティ

*正確性プロパティとは、システムの全ての有効な実行において真であるべき特性や振る舞いのことである。プロパティは人間が読める仕様と機械で検証可能な正確性保証の橋渡しとなる。*

### Property 1: アーティストフィルタの正確性

*任意の*楽曲データセットに対して、アーティストフィルタを適用した場合：
- 「栗林みな実」選択時は、アーティスト名に「栗林みな実」を含む楽曲のみが表示される
- 「Minami」選択時は、アーティスト名に「Minami」を含む楽曲のみが表示される
- 「それ以外」選択時は、「栗林みな実」「Minami」を含まない楽曲のみが表示される
- フィルタ未選択時は、全ての楽曲が表示される

**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 2: ジャンルフィルタの正確性

*任意の*楽曲データセットとアーティストフィルタ状態に対して：
- ジャンルフィルタのオプションは、現在のアーティストフィルタに一致する楽曲のジャンルのみを含む
- ジャンル選択時は、アーティストフィルタとジャンルフィルタの両方に一致する楽曲のみが表示される
- アーティストフィルタ変更時は、ジャンルオプションが動的に更新される

**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

### Property 3: 検索機能の正確性

*任意の*検索クエリと楽曲データセットに対して：
- 検索結果は、クエリ文字列を含む楽曲のみを返す
- 検索対象フィールド（タイトル、アーティスト、作詞家、作曲家、編曲家、タグ）のいずれかにクエリが含まれる楽曲が結果に含まれる
- 空のクエリは全ての楽曲を返す

**Validates: Requirements 5.2, 7.2**

### Property 4: タグ一覧機能の正確性

*任意の*タグデータセットに対して：
- タグ検索は、クエリ文字列を含むタグのみを返す
- タグ選択時は、そのタグを持つ全ての楽曲が表示される
- 各タグの楽曲数は、実際にそのタグを持つ楽曲の数と一致する
- アルファベット順ソートは、タグ名の辞書順で並ぶ
- 楽曲数ソートは、楽曲数の降順で並ぶ

**Validates: Requirements 6.2, 6.3, 6.4, 6.6**

### Property 5: アニメーション状態の永続化

*任意の*アニメーション状態変更に対して：
- 一時停止状態はローカルストレージに保存される
- ページリロード後も一時停止状態が復元される
- 一時停止中はシャボン玉の位置が変化しない
- 再開後はシャボン玉の位置が変化する

**Validates: Requirements 2.2, 2.3, 2.5**

### Property 6: タグ操作のデータ整合性

*任意の*タグ追加・削除操作に対して：
- タグ追加後、データベースにそのタグが保存される
- タグ削除後、データベースからそのタグが削除される
- 操作後のUIは、データベースの状態と一致する

**Validates: Requirements 5.4, 5.5**

### Property 7: 楽曲詳細表示の完全性

*任意の*楽曲データに対して：
- 詳細ページは全てのメタデータ（タイトル、アーティスト、作詞家、作曲家、編曲家）を表示する
- 楽曲に関連する全てのタグが表示される
- 埋め込みコンテンツが無効な場合、エラーメッセージまたはフォールバックが表示される

**Validates: Requirements 8.1, 8.4, 8.6**

### Property 8: キャッシュの正確性

*任意の*データ取得操作に対して：
- 取得したデータはローカルストレージにキャッシュされる
- オフライン時はキャッシュからデータが提供される
- キャッシュデータは元のデータと同一である

**Validates: Requirements 12.6, 15.4**

### Property 9: 入力バリデーションの正確性

*任意の*ユーザー入力に対して：
- 無効な入力は拒否され、エラーメッセージが表示される
- 有効な入力は受け入れられ、処理される
- エラーメッセージは入力フィールドに関連付けられる

**Validates: Requirements 15.5**

### Property 10: エラーログの安全性

*任意の*エラー発生時：
- エラーはコンソールにログ出力される
- ログには機密情報（APIキー、ユーザー認証情報等）が含まれない
- エラーメッセージはデバッグに有用な情報を含む

**Validates: Requirements 15.3**

