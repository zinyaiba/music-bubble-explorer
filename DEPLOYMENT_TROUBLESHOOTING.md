# GitHub Pages デプロイメント トラブルシューティングガイド

## 概要

このガイドは、GitHub Pagesへのデプロイメント時に発生する一般的な問題の解決方法を提供します。問題の特定から解決まで、ステップバイステップで説明します。

## 目次

1. [一般的なビルドエラーと解決策](#一般的なビルドエラーと解決策)
2. [ステップバイステップ デプロイメント検証プロセス](#ステップバイステップ-デプロイメント検証プロセス)
3. [ローカル開発環境セットアップ](#ローカル開発環境セットアップ)
4. [緊急時の対応手順](#緊急時の対応手順)

## 一般的なビルドエラーと解決策

### 1. TypeScriptコンパイルエラー

#### 症状
```
error TS2339: Property 'minSize' does not exist on type 'BubbleConfig'
```

#### 原因
- 型定義の不整合
- テストファイルでの不完全な型実装
- インターフェースの変更後の更新漏れ

#### 解決策
```bash
# 1. TypeScriptコンパイルチェックを実行
npm run type-check

# 2. エラーの詳細を確認
npx tsc --noEmit --pretty

# 3. 型定義ファイルを確認
# src/types/ ディレクトリ内の関連ファイルをチェック

# 4. テストファイルの型実装を修正
# 必要なプロパティをすべて含める
```

### 2. 依存関係の問題

#### 症状
```
Module not found: Error: Can't resolve 'package-name'
```

#### 原因
- package.jsonとpackage-lock.jsonの不整合
- 依存関係のバージョン競合
- devDependenciesとdependenciesの分類ミス

#### 解決策
```bash
# 1. node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install

# 2. 依存関係の整合性をチェック
npm audit
npm audit fix

# 3. 特定のパッケージを再インストール
npm uninstall package-name
npm install package-name
```

### 3. ビルド設定エラー

#### 症状
```
Failed to resolve import
Assets not loading in production
```

#### 原因
- Vite設定のbaseURL不正
- 環境変数の設定ミス
- アセットパスの設定問題

#### 解決策
```bash
# 1. vite.config.tsを確認
# base: '/repository-name/' が正しく設定されているかチェック

# 2. 環境変数を確認
echo $NODE_ENV
echo $VITE_BASE_URL

# 3. ローカルで本番ビルドをテスト
npm run build
npm run preview
```

### 4. GitHub Actions ワークフローエラー

#### 症状
```
Process completed with exit code 1
Build failed
```

#### 原因
- Node.jsバージョンの不整合
- 環境変数の未設定
- キャッシュの問題

#### 解決策
```yaml
# .github/workflows/deploy.yml を確認
# Node.jsバージョンを最新LTSに更新
- uses: actions/setup-node@v3
  with:
    node-version: '18'
    cache: 'npm'

# キャッシュをクリア
- name: Clear npm cache
  run: npm cache clean --force
```

## ステップバイステップ デプロイメント検証プロセス

### Phase 1: ローカル検証

#### Step 1: 開発環境の確認
```bash
# Node.jsバージョン確認
node --version  # v18.x.x 推奨

# npm バージョン確認
npm --version

# 依存関係インストール
npm install
```

#### Step 2: TypeScript検証
```bash
# 型チェック実行
npm run type-check

# エラーがある場合は修正してから次へ進む
```

#### Step 3: Lint検証
```bash
# ESLint実行
npm run lint

# 自動修正可能なエラーを修正
npm run lint:fix
```

#### Step 4: テスト実行
```bash
# 全テスト実行
npm test

# 特定のテストファイル実行
npm test -- bubbleManager.test.ts
```

#### Step 5: ローカルビルド検証
```bash
# 本番ビルド実行
npm run build

# ビルド結果確認
ls -la dist/

# ローカルプレビュー
npm run preview
```

### Phase 2: プリプッシュ検証

#### Step 1: 自動検証スクリプト実行
```bash
# プリプッシュ検証実行
npm run pre-push-check

# または手動で各ステップ実行
npm run type-check && npm run lint && npm test && npm run build
```

#### Step 2: Git状態確認
```bash
# 変更ファイル確認
git status

# 差分確認
git diff

# ステージング確認
git diff --cached
```

#### Step 3: コミットとプッシュ
```bash
# 変更をステージング
git add .

# コミット
git commit -m "fix: resolve deployment issues"

# プッシュ
git push origin main
```

### Phase 3: デプロイメント監視

#### Step 1: GitHub Actions監視
1. GitHubリポジトリの「Actions」タブを開く
2. 最新のワークフロー実行を確認
3. 各ステップの実行状況を監視

#### Step 2: ビルドログ確認
```bash
# ローカルでGitHub Actionsログを確認する場合
gh run list
gh run view [run-id]
```

#### Step 3: デプロイメント確認
1. GitHub Pages URLにアクセス
2. アプリケーションの基本機能をテスト
3. ブラウザの開発者ツールでエラーチェック

## ローカル開発環境セットアップ

### 必要な環境

#### システム要件
- Node.js v18.x.x (LTS推奨)
- npm v8.x.x以上
- Git v2.x.x以上

#### 推奨ツール
- Visual Studio Code
- Git Bash (Windows)
- Chrome/Firefox (デバッグ用)

### セットアップ手順

#### 1. リポジトリクローン
```bash
# HTTPSでクローン
git clone https://github.com/username/repository-name.git
cd repository-name

# またはSSHでクローン
git clone git@github.com:username/repository-name.git
cd repository-name
```

#### 2. 依存関係インストール
```bash
# 依存関係インストール
npm install

# インストール確認
npm list --depth=0
```

#### 3. 環境変数設定
```bash
# .env.localファイル作成
cp .env.example .env.local

# 必要な環境変数を設定
# VITE_BASE_URL=http://localhost:5173
# NODE_ENV=development
```

#### 4. 開発サーバー起動
```bash
# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 を開く
```

#### 5. 開発ツール設定

##### VS Code拡張機能
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

##### Git設定
```bash
# ユーザー情報設定
git config user.name "Your Name"
git config user.email "your.email@example.com"

# プリコミットフック設定（後述）
```

### 開発ワークフロー

#### 1. 機能開発
```bash
# 新しいブランチ作成
git checkout -b feature/new-feature

# 開発作業
# ...

# 変更をステージング
git add .

# コミット
git commit -m "feat: add new feature"
```

#### 2. プリコミット検証
```bash
# 自動検証実行
npm run pre-commit-check

# 手動検証
npm run type-check
npm run lint
npm test
```

#### 3. プルリクエスト
```bash
# リモートにプッシュ
git push origin feature/new-feature

# GitHub上でプルリクエスト作成
```

## 緊急時の対応手順

### デプロイメント失敗時

#### 1. 即座の対応
```bash
# 前回の成功したコミットを確認
git log --oneline -10

# 問題のあるコミットをリバート
git revert [commit-hash]
git push origin main
```

#### 2. 問題の特定
```bash
# GitHub Actionsログを確認
gh run view --log

# ローカルで問題を再現
npm run build
```

#### 3. 修正と再デプロイ
```bash
# 問題を修正
# ...

# 検証
npm run pre-push-check

# 再デプロイ
git add .
git commit -m "fix: resolve deployment issue"
git push origin main
```

### 本番サイトダウン時

#### 1. 状況確認
- GitHub Pages URLアクセス確認
- GitHub Status確認
- DNS設定確認

#### 2. 緊急対応
```bash
# 最新の安定版にロールバック
git checkout [stable-commit-hash]
git push --force origin main
```

#### 3. 根本原因調査
- エラーログ分析
- 変更履歴確認
- 環境設定確認

## トラブルシューティング チェックリスト

### ビルド前チェック
- [ ] Node.jsバージョン確認
- [ ] 依存関係インストール完了
- [ ] TypeScriptコンパイルエラーなし
- [ ] ESLintエラーなし
- [ ] テスト全て通過
- [ ] 環境変数設定確認

### ビルド時チェック
- [ ] ビルドコマンド成功
- [ ] dist/ディレクトリ生成確認
- [ ] アセットファイル生成確認
- [ ] ソースマップ生成確認（必要に応じて）

### デプロイ後チェック
- [ ] GitHub Pages URL アクセス可能
- [ ] 基本機能動作確認
- [ ] ブラウザコンソールエラーなし
- [ ] モバイル表示確認
- [ ] パフォーマンス確認

## サポートとリソース

### 公式ドキュメント
- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

### コミュニティリソース
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Community](https://github.community/)
- [Vite Discord](https://chat.vitejs.dev/)

### 内部リソース
- `scripts/pre-push-validation.cjs` - プリプッシュ検証スクリプト
- `scripts/quick-build-check.cjs` - クイックビルドチェック
- `.github/workflows/` - GitHub Actionsワークフロー設定
## 
プリコミット検証セットアップ

### 自動セットアップ

プロジェクトには自動的なプリコミット検証が設定されています：

```bash
# 初回セットアップ（プロジェクトクローン後）
npm install
npm run setup-hooks
```

### 手動セットアップ

自動セットアップが失敗した場合：

```bash
# Huskyとlint-stagedをインストール
npm install --save-dev husky lint-staged

# Huskyを初期化
npx husky init

# プリコミットフックを設定
echo "npx lint-staged && npm run type-check" > .husky/pre-commit

# プリプッシュフックを設定
echo "npm run pre-push" > .husky/pre-push

# フックを実行可能にする（Unix系のみ）
chmod +x .husky/pre-commit .husky/pre-push
```

### 利用可能なコマンド

```bash
# プリコミット検証を手動実行
npm run pre-commit-check

# プリプッシュ検証を手動実行
npm run pre-push

# TypeScript型チェックのみ
npm run type-check

# ESLintチェック
npm run lint

# ESLint自動修正
npm run lint:fix

# Prettierフォーマット
npm run format

# Prettierフォーマットチェック
npm run format:check
```

### フック動作

#### プリコミット時
1. **lint-staged**: 変更されたファイルのみをチェック
   - TypeScriptファイル: ESLint + Prettier
   - CSSファイル: Prettier
2. **TypeScript型チェック**: 全プロジェクトの型整合性確認

#### プリプッシュ時
1. **TypeScript型チェック**
2. **ESLint検証**（警告は許可、エラーのみ失敗）
3. **ビルドテスト**
4. **テスト実行**

### トラブルシューティング

#### フックが実行されない
```bash
# Git設定確認
git config core.hooksPath

# Huskyの再初期化
rm -rf .husky
npm run setup-hooks
```

#### フックをスキップしたい場合
```bash
# プリコミットフックをスキップ
git commit --no-verify -m "commit message"

# プリプッシュフックをスキップ
git push --no-verify
```

#### パフォーマンス問題
```bash
# 高速なプリプッシュ検証（テストスキップ）
npm run pre-push:fast

# 特定ファイルのみチェック
npx eslint src/specific-file.ts
```

### カスタマイズ

#### lint-staged設定（package.json）
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,md}": [
      "prettier --write"
    ]
  }
}
```

#### ESLint設定調整
```bash
# 警告の最大数を調整
npm run lint -- --max-warnings 50

# 特定ルールを無効化
npm run lint -- --rule "no-console: off"
```

### CI/CD統合

GitHub Actionsでも同じ検証を実行：

```yaml
- name: Run pre-commit checks
  run: npm run pre-commit-check

- name: Run pre-push validation
  run: npm run pre-push
```