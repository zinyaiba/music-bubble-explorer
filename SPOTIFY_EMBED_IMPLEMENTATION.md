# Spotify埋め込み機能の実装

## 概要

楽曲のジャケット画像URLから、Spotifyの埋め込みプレーヤーに変更しました。これにより：
- 著作権の問題を回避
- ユーザーがSpotifyで直接音楽を聴ける
- ユーザーはSpotifyの埋め込みコードをそのままコピペして登録可能

## 変更内容

### 1. データ型の変更

**`src/types/music.ts`**
- `jacketImageUrl?: string` → `spotifyEmbed?: string` に変更
- Spotify埋め込みコード（iframe全体）を保存

### 2. フォームの変更

**`src/components/SongRegistrationForm.tsx`**
- 入力フィールドを `<input type="url">` から `<textarea>` に変更
- ユーザーはSpotifyの埋め込みコード全体をコピペ
- プレビューで実際のSpotifyプレーヤーを表示（`dangerouslySetInnerHTML`使用）
- バリデーション：
  - `<iframe` タグが含まれているか
  - `open.spotify.com/embed` URLが含まれているか
  - 2000文字以内

### 3. 詳細表示の変更

**`src/components/SongDetailView.tsx`**
- ジャケット画像の代わりにSpotifyプレーヤーを表示
- `dangerouslySetInnerHTML` でiframeを埋め込み

**`src/components/SongDetailView.css`**
- `.spotify-section` スタイルを追加
- iframeのレスポンシブ対応

### 4. バリデーションの更新

**`src/utils/dataValidation.ts`**
- `jacketImageUrl` のURL検証を削除
- `spotifyEmbed` の文字数制限（2000文字）を追加

**`src/components/SongRegistrationForm.tsx`**
- Spotify埋め込みコードの形式チェック

### 5. Firebaseサービスの更新

**`src/services/firebaseService.ts`**
- `jacketImageUrl` → `spotifyEmbed` に変更

### 6. ヘルパー関数の追加

**`src/utils/spotifyEmbedHelper.ts`** (新規)
- `extractSpotifyTrackId()`: トラックIDを抽出
- `isValidSpotifyEmbed()`: 埋め込みコードの検証
- `getSampleSpotifyEmbed()`: テスト用サンプル生成

### 7. テストの更新

以下のテストファイルを更新：
- `src/utils/__tests__/dataValidation.extended.test.ts`
- `src/services/__tests__/firebaseIntegration.test.ts`
- `src/services/__tests__/firebaseRoundTrip.test.ts`
- `src/components/__tests__/SongDetailView.test.tsx`
- `src/components/__tests__/SongRegistrationForm.extended.test.tsx`

## 使用方法

### ユーザー側の操作

1. Spotifyで楽曲を開く
2. 「共有」→「埋め込みコード」を選択
3. 表示されたiframeコード全体をコピー
4. 楽曲登録フォームの「Spotify埋め込みコード」フィールドに貼り付け
5. プレビューで確認
6. 登録

### 埋め込みコードの例

```html
<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/2w6mpaFcHXSd4GYTpozSQS?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
```

## セキュリティ考慮事項

- `dangerouslySetInnerHTML` を使用しているため、バリデーションで必ずSpotify URLを含むことを確認
- XSS攻撃を防ぐため、`open.spotify.com/embed` ドメインのみ許可

## 今後の改善案

1. より厳密なバリデーション（iframe属性のチェック）
2. 他の音楽サービス（Apple Music、YouTube Music等）への対応
3. トラックIDのみの入力にも対応（自動的にiframeを生成）
