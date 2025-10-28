# デプロイメントガイド

## 概要

音楽シャボン玉エクスプローラーのデプロイメント手順とベストプラクティスを説明します。

## 🚀 GitHub Pages デプロイ（推奨）

### 自動デプロイ設定

1. **GitHub Actions ワークフロー**
   - `.github/workflows/deploy.yml` が自動デプロイを管理
   - `main` ブランチへのプッシュで自動実行

2. **リポジトリ設定**
   ```
   Settings > Pages > Source: GitHub Actions
   ```

3. **デプロイ実行**
   ```bash
   git add .
   git commit -m "feat: 新機能追加"
   git push origin main
   ```

### 手動デプロイ

```bash
# プロダクションビルド実行
npm run build:production

# GitHub Pages にデプロイ
npm run deploy
```

## 🔧 プロダクションビルド

### 最適化されたビルド

```bash
# 包括的なプロダクションビルド
npm run build:production
```

このコマンドは以下を実行します：
- TypeScript コンパイル検証
- ESLint チェック
- テスト実行
- 最適化されたビルド
- バンドルサイズ分析
- デプロイ準備確認

### 通常ビルド

```bash
# 基本的なビルド
npm run build
```

## 📊 ビルド最適化

### バンドルサイズ最適化

1. **コード分割**
   ```typescript
   // 動的インポートによる遅延読み込み
   const TagEditingScreen = lazy(() => import('./TagEditingScreen'))
   ```

2. **チャンク分離**
   ```typescript
   // vite.config.ts
   manualChunks: {
     vendor: ['react', 'react-dom'],
     motion: ['framer-motion'],
     styled: ['styled-components']
   }
   ```

3. **Tree Shaking**
   - 未使用コードの自動除去
   - ES6 モジュールの活用

### パフォーマンス最適化

1. **画像最適化**
   - WebP フォーマット使用
   - 遅延読み込み実装
   - 適切なサイズ設定

2. **CSS 最適化**
   - CSS コード分割
   - 未使用スタイル除去
   - 圧縮とミニファイ

3. **JavaScript 最適化**
   - Terser による圧縮
   - デッドコード除去
   - ソースマップ無効化（本番環境）

## 🔍 デプロイ前チェック

### 自動検証

```bash
# 包括的な検証実行
npm run pre-push
```

検証項目：
- ✅ TypeScript コンパイル
- ✅ ESLint チェック
- ✅ テスト実行
- ✅ ビルド成功
- ✅ デプロイ準備確認

### 手動確認項目

1. **機能テスト**
   - [ ] シャボン玉表示
   - [ ] タグ登録・編集
   - [ ] 楽曲管理
   - [ ] レスポンシブ対応

2. **パフォーマンス**
   - [ ] 初期読み込み時間 < 3秒
   - [ ] バンドルサイズ < 2MB
   - [ ] Lighthouse スコア > 90

3. **アクセシビリティ**
   - [ ] キーボードナビゲーション
   - [ ] スクリーンリーダー対応
   - [ ] 色彩コントラスト

## 🌐 他のプラットフォームへのデプロイ

### Vercel

1. **設定ファイル作成**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

2. **デプロイ実行**
   ```bash
   npx vercel --prod
   ```

### Netlify

1. **設定ファイル作成**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **デプロイ実行**
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

### Firebase Hosting

1. **Firebase CLI インストール**
   ```bash
   npm install -g firebase-tools
   ```

2. **初期化**
   ```bash
   firebase init hosting
   ```

3. **デプロイ**
   ```bash
   npm run build
   firebase deploy
   ```

## 🔒 セキュリティ考慮事項

### 環境変数

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_FIREBASE_API_KEY=your-api-key
```

### CSP（Content Security Policy）

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;">
```

### HTTPS 強制

```javascript
// Service Worker での HTTPS リダイレクト
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace('https:' + window.location.href.substring(window.location.protocol.length))
}
```

## 📈 監視とメトリクス

### パフォーマンス監視

1. **Web Vitals**
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'
   
   getCLS(console.log)
   getFID(console.log)
   getFCP(console.log)
   getLCP(console.log)
   getTTFB(console.log)
   ```

2. **Google Analytics**
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

### エラー監視

1. **Sentry 統合**
   ```typescript
   import * as Sentry from "@sentry/react"
   
   Sentry.init({
     dsn: "YOUR_DSN_HERE",
     environment: process.env.NODE_ENV
   })
   ```

## 🔄 CI/CD パイプライン

### GitHub Actions ワークフロー

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:production
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 段階的デプロイ

1. **開発環境**: feature ブランチ
2. **ステージング環境**: develop ブランチ
3. **本番環境**: main ブランチ

## 🚨 トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```bash
   # 依存関係の再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **デプロイ失敗**
   ```bash
   # GitHub Pages 設定確認
   npm run deployment-check
   ```

3. **パフォーマンス問題**
   ```bash
   # バンドルサイズ分析
   npm run build -- --analyze
   ```

### ログとデバッグ

1. **ビルドログ確認**
   ```bash
   npm run build:production 2>&1 | tee build.log
   ```

2. **デプロイログ確認**
   - GitHub Actions の Logs タブを確認
   - エラーメッセージの詳細を分析

## 📋 デプロイチェックリスト

### デプロイ前
- [ ] 全テストが通過
- [ ] ビルドが成功
- [ ] バンドルサイズが適切
- [ ] セキュリティチェック完了
- [ ] パフォーマンステスト完了

### デプロイ後
- [ ] サイトが正常に表示
- [ ] 全機能が動作
- [ ] モバイル対応確認
- [ ] SEO 設定確認
- [ ] Analytics 動作確認

---

このガイドに従って、安全で効率的なデプロイを実現してください。