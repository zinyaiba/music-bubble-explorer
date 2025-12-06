# キャッシュバスティング強化実装

## 実施日
2024年12月6日

## 問題
キャッシュバスティングが効いておらず、更新が反映されない

## 実施した対策

### 1. バージョン更新
- アプリバージョンを `1.0.1` → `1.0.2` に更新
- 以下のファイルで統一:
  - `package.json`
  - `public/sw.js`
  - `src/utils/versionManager.ts`
  - `index.html`

### 2. HTTPヘッダー設定
- `public/_headers` ファイルを新規作成
- HTMLとService Workerは常に最新を取得
- 静的アセット（JS/CSS/画像）はハッシュ付きで長期キャッシュ

```
/*
  Cache-Control: no-cache, no-store, must-revalidate
  
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### 3. Service Worker戦略変更
- **旧**: Cache First（キャッシュ優先）
- **新**: Network First（ネットワーク優先）
  - HTML/JS/CSSは常にネットワークから取得
  - 画像/フォントのみキャッシュファースト
  - オフライン時のみキャッシュにフォールバック

### 4. Vite設定強化
- HTMLトランスフォームプラグイン追加
- ビルド時にタイムスタンプを自動挿入
- アセットファイル名にハッシュを付与（既存）

### 5. HTMLメタタグ強化
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0" />
<meta name="app-version" content="1.0.2" />
<meta name="build-time" content="<%= new Date().getTime() %>" />
```

## 効果
1. ユーザーが常に最新のコードを取得
2. 静的アセットは効率的にキャッシュ
3. オフライン時も動作可能
4. デプロイ後の更新が即座に反映

## デプロイ手順
1. `npm run build` でビルド
2. `dist` フォルダをデプロイ
3. ユーザーがページをリロードすると自動的に最新版に更新

## 確認方法
1. ブラウザの開発者ツールを開く
2. Network タブで "Disable cache" をオフにする
3. ページをリロード
4. HTMLとJSファイルが `200 (from network)` で取得されることを確認
5. 画像ファイルは `200 (from cache)` でもOK
