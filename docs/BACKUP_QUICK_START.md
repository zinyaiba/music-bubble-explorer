# バックアップクイックスタート

## 🚀 5分でセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. サービスアカウントキーの取得

1. [Firebase Console](https://console.firebase.google.com/) → プロジェクト設定 → サービスアカウント
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたファイルを `firebase-service-account.json` としてプロジェクトルートに保存

### 3. バックアップ実行

```bash
npm run backup
```

完了！ `backups/` フォルダにバックアップファイルが作成されます。

## 📝 よく使うコマンド

```bash
# バックアップ作成
npm run backup

# バックアップから復元
npm run restore backups/firebase-backup-2024-11-29T12-00-00.json

# マージモードで復元（既存データを保持）
node scripts/firebase-restore.cjs backups/firebase-backup-2024-11-29T12-00-00.json --merge
```

## 📖 詳細ドキュメント

詳しい使い方は [FIREBASE_BACKUP_GUIDE.md](./FIREBASE_BACKUP_GUIDE.md) を参照してください。
