# 音楽サービス埋め込み機能の実装

## 概要

楽曲のジャケット画像URLから、音楽サービス（Spotify、Apple Music、YouTube）の埋め込みプレーヤーに変更しました。これにより：
- 著作権の問題を回避
- ユーザーが音楽サービスで直接音楽を聴ける
- ユーザーは埋め込みコードをそのままコピペして登録可能
- **1楽曲に対して複数の埋め込みコード（最大5個）を登録可能**

## 変更内容

### 1. データ型の変更

**`src/types/music.ts`**
- `jacketImageUrl?: string` → `musicServiceEmbeds?: string[]` に変更
- 音楽サービス埋め込みコード配列（iframe全体）を保存
- Spotify、Apple Music、YouTube に対応
- 1楽曲に対して最大5個まで登録可能

### 2. フォームの変更

**`src/components/SongRegistrationForm.tsx`**
- 新しいコンポーネント `MusicServiceEmbedList` を使用
- 複数の埋め込みコードを管理（最大5個）
- 各埋め込みコードにプレビューと削除ボタンを表示
- 音楽サービスを自動判定（Spotify、Apple Music、YouTube）

**`src/components/MusicServiceEmbedList.tsx`** (新規)
- 埋め込みコードのリスト管理コンポーネント
- 追加・削除・プレビュー機能
- バリデーション：
  - `<iframe` タグが含まれているか
  - `open.spotify.com/embed`、`embed.music.apple.com`、または `youtube.com/embed` URLが含まれているか
  - 各埋め込みコードは2000文字以内
  - 最大5個まで

### 3. 詳細表示の変更

**`src/components/SongDetailView.tsx`**
- ジャケット画像の代わりに音楽サービスプレーヤーを表示
- 複数の埋め込みコードを順番に表示
- `dangerouslySetInnerHTML` でiframeを埋め込み

**`src/components/SongDetailView.css`**
- `.music-service-section` スタイルを追加（縦並び）
- `.music-service-player` スタイルを追加
- iframeのレスポンシブ対応

### 4. バリデーションの更新

**`src/utils/dataValidation.ts`**
- `jacketImageUrl` のURL検証を削除
- `musicServiceEmbeds` 配列のバリデーションを追加
  - 配列であることを確認
  - 最大5個まで
  - 各埋め込みコードは2000文字以内

**`src/components/MusicServiceEmbedList.tsx`**
- 音楽サービス埋め込みコードの形式チェック
- Spotify、Apple Music、または YouTube のURLを含むことを確認

### 5. Firebaseサービスの更新

**`src/services/firebaseService.ts`**
- `jacketImageUrl` → `musicServiceEmbeds` に変更（配列形式）

### 6. ヘルパー関数の追加

**`src/utils/spotifyEmbedHelper.ts`** (新規)
- `extractSpotifyTrackId()`: SpotifyトラックIDを抽出
- `extractAppleMusicId()`: Apple Music ID を抽出
- `extractYouTubeVideoId()`: YouTube動画IDを抽出
- `isValidMusicServiceEmbed()`: 埋め込みコードの検証
- `detectMusicService()`: 音楽サービスを判定（spotify/applemusic/youtube/unknown）
- `getSampleSpotifyEmbed()`: テスト用Spotifyサンプル生成
- `getSampleAppleMusicEmbed()`: テスト用Apple Musicサンプル生成
- `getSampleYouTubeEmbed()`: テスト用YouTubeサンプル生成

### 7. テストの更新

以下のテストファイルを更新：
- `src/utils/__tests__/dataValidation.extended.test.ts`
- `src/services/__tests__/firebaseIntegration.test.ts`
- `src/services/__tests__/firebaseRoundTrip.test.ts`
- `src/components/__tests__/SongDetailView.test.tsx`
- `src/components/__tests__/SongRegistrationForm.extended.test.tsx`

## 使用方法

### ユーザー側の操作

#### Spotifyの場合
1. Spotifyで楽曲を開く
2. 「共有」→「埋め込みコード」を選択
3. 表示されたiframeコード全体をコピー
4. 楽曲登録フォームの「音楽サービス埋め込みコード」フィールドに貼り付け
5. プレビューで確認
6. 登録

#### Apple Musicの場合
1. Apple Musicで楽曲またはアルバムを開く
2. 「共有」→「埋め込みコード」を選択
3. 表示されたiframeコード全体をコピー
4. 楽曲登録フォームの「音楽サービス埋め込みコード」フィールドに貼り付け
5. プレビューで確認
6. 「追加」ボタンをクリック

#### YouTubeの場合
1. YouTubeで楽曲の動画を開く
2. 「共有」→「埋め込む」を選択
3. 表示されたiframeコード全体をコピー
4. 楽曲登録フォームの「音楽サービス埋め込みコード」フィールドに貼り付け
5. プレビューで確認
6. 「追加」ボタンをクリック

**複数の埋め込みコードを登録する場合**
- 上記の手順を繰り返して、最大5個まで追加可能
- 登録済みの埋め込みコードは削除ボタン（✕）で削除可能

### 埋め込みコードの例

#### Spotify

```html
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/2w6mpaFcHXSd4GYTpozSQS?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
```

#### Apple Music

```html
<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="450" style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="https://embed.music.apple.com/jp/album/test/1234567890"></iframe>
```

#### YouTube

```html
<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
```

## セキュリティ考慮事項

- `dangerouslySetInnerHTML` を使用しているため、バリデーションで必ず音楽サービスのURLを含むことを確認
- XSS攻撃を防ぐため、以下のドメインのみ許可：
  - `open.spotify.com/embed`
  - `embed.music.apple.com`
  - `youtube.com/embed`

## 今後の改善案

1. より厳密なバリデーション（iframe属性のチェック）
2. 他の音楽サービス（SoundCloud、Bandcamp等）への対応
3. トラックIDのみの入力にも対応（自動的にiframeを生成）
4. 埋め込みコードからメタデータ（曲名、アーティスト名等）を自動抽出
5. 埋め込みコードの並び順を変更できるドラッグ&ドロップ機能
6. 各埋め込みコードにラベル（「公式MV」「ライブ映像」等）を付ける機能
