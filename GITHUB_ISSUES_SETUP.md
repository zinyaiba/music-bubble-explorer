# GitHub Issues方式でのデータ共有設定

このガイドでは、GitHub Issues を使用して全ユーザー間で楽曲データを共有する方法を説明します。

## 🎯 概要

GitHub Issues方式では、楽曲登録時に自動的にGitHub Issueが作成され、コミュニティで楽曲データを共有できます。

### メリット
- ✅ 完全無料
- ✅ 透明性が高い
- ✅ コミュニティで管理可能
- ✅ バージョン管理
- ✅ 設定が比較的簡単

### デメリット
- ⚠️ リアルタイムではない
- ⚠️ 手動承認が必要
- ⚠️ GitHub Personal Access Tokenが必要

## 🚀 設定手順

### 1. GitHubリポジトリの準備

1. **リポジトリを作成**
   ```bash
   # 新しいリポジトリを作成するか、既存のリポジトリを使用
   # 例: https://github.com/your-username/music-bubble-explorer
   ```

2. **Issues機能を有効化**
   - リポジトリの Settings → Features → Issues にチェック

3. **ラベルを作成**（オプション）
   - Issues → Labels → New label
   - `song-registration` ラベルを作成
   - `community-contribution` ラベルを作成

### 2. Personal Access Tokenの作成

1. **GitHub設定にアクセス**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **新しいトークンを作成**
   - "Generate new token (classic)" をクリック
   - Note: "Music Bubble Explorer - Issues"
   - Expiration: 適切な期限を設定

3. **権限を選択**
   ```
   ✅ repo
     ✅ repo:status
     ✅ repo_deployment
     ✅ public_repo
   ```

4. **トークンをコピー**
   - 生成されたトークンをコピー（一度しか表示されません）

### 3. 環境変数の設定

1. **プロジェクトルートに `.env.local` ファイルを作成**
   ```bash
   # .env.local
   REACT_APP_GITHUB_REPO=your-username/your-repository-name
   REACT_APP_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **`.gitignore` に追加**
   ```bash
   # .env.local は既に .gitignore に含まれているはずですが、確認してください
   .env.local
   ```

### 4. アプリケーション設定の変更

1. **`src/config/sharing.ts` を編集**
   ```typescript
   export const SHARING_CONFIG = {
     // GitHub Issues方式に変更
     method: DataSharingMethod.GITHUB_ISSUES,
     
     github: {
       repo: process.env.REACT_APP_GITHUB_REPO || '',
       token: process.env.REACT_APP_GITHUB_TOKEN || '',
       labels: ['song-registration', 'community-contribution']
     }
   }
   ```

### 5. 動作確認

1. **アプリケーションを再起動**
   ```bash
   npm start
   ```

2. **楽曲を登録**
   - 楽曲登録フォームから新しい楽曲を登録

3. **GitHub Issuesを確認**
   - リポジトリのIssuesタブに新しいIssueが作成されているか確認

## 📝 Issue作成例

楽曲登録時に以下のようなIssueが自動作成されます：

```markdown
## 新しい楽曲登録

**楽曲名:** 恋する天気図
**作詞:** 栗林みな実
**作曲:** 栗林みな実
**編曲:** 中沢伴行
**タグ:** バラード, 恋愛

```json
{
  "id": "song_1234567890",
  "title": "恋する天気図",
  "lyricists": ["栗林みな実"],
  "composers": ["栗林みな実"],
  "arrangers": ["中沢伴行"],
  "tags": ["バラード", "恋愛"]
}
```
```

## 🔧 トラブルシューティング

### よくある問題

1. **Issueが作成されない**
   - Personal Access Tokenの権限を確認
   - リポジトリ名が正しいか確認
   - ネットワーク接続を確認

2. **403 Forbidden エラー**
   - Personal Access Tokenの有効期限を確認
   - リポジトリへのアクセス権限を確認

3. **422 Validation Failed エラー**
   - リポジトリ名の形式を確認（username/repository-name）
   - ラベルが存在するか確認

### デバッグ方法

1. **ブラウザの開発者ツールを開く**
   - F12 → Console タブ

2. **楽曲登録時のログを確認**
   ```
   ✅ Song also saved to shared database
   📝 GitHub Issues投稿用データ: ...
   ```

3. **エラーメッセージを確認**
   ```
   ⚠️ Failed to save to shared database: Error message
   ```

## 🔒 セキュリティ考慮事項

### Personal Access Token の管理

1. **最小権限の原則**
   - 必要最小限の権限のみを付与

2. **定期的な更新**
   - トークンの有効期限を設定
   - 定期的に新しいトークンに更新

3. **漏洩時の対応**
   - トークンが漏洩した場合は即座に無効化
   - 新しいトークンを生成して更新

### 環境変数の管理

1. **本番環境での設定**
   ```bash
   # Vercel の場合
   vercel env add REACT_APP_GITHUB_REPO
   vercel env add REACT_APP_GITHUB_TOKEN
   
   # Netlify の場合
   # Site settings → Environment variables で設定
   ```

2. **開発環境での注意**
   - `.env.local` ファイルをGitにコミットしない
   - チーム開発時は個別に設定

## 🚀 本番環境へのデプロイ

### Vercel での設定

1. **環境変数を設定**
   ```bash
   vercel env add REACT_APP_GITHUB_REPO
   # 値: your-username/your-repository-name
   
   vercel env add REACT_APP_GITHUB_TOKEN
   # 値: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **デプロイ**
   ```bash
   vercel --prod
   ```

### Netlify での設定

1. **Site settings → Environment variables**
   - `REACT_APP_GITHUB_REPO`: your-username/your-repository-name
   - `REACT_APP_GITHUB_TOKEN`: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

2. **デプロイ**
   - GitHubリポジトリと連携してデプロイ

## 📊 運用・管理

### Issue の管理

1. **承認プロセス**
   - 新しいIssueを確認
   - 内容を検証
   - 適切な場合はIssueをクローズ

2. **データの統合**
   - 承認されたデータを共有データベースに統合
   - 重複データの確認・マージ

3. **コミュニティ管理**
   - 不適切なコンテンツの削除
   - ガイドラインの策定・周知

### 自動化の検討

将来的には以下の自動化を検討できます：

1. **GitHub Actions による自動処理**
   - Issue作成時の自動検証
   - データの自動統合
   - 重複チェック

2. **Bot による管理**
   - 自動承認・却下
   - データ品質チェック
   - 統計情報の生成

## 🔄 他の共有方式への移行

GitHub Issues方式から他の方式に移行する場合：

1. **Firebase/Supabase への移行**
   - 既存のIssueデータをエクスポート
   - データベースにインポート
   - 設定を変更

2. **JSONファイル方式への移行**
   - GitHub Actions でJSONファイルを生成
   - 静的ホスティングで配信

詳細は `DATA_SHARING_GUIDE.md` を参照してください。