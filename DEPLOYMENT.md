# デプロイメントガイド

## Firebase設定

本番環境でFirebaseを動作させるには、以下の環境変数を設定する必要があります。

### 必要な環境変数

```
VITE_FIREBASE_API_KEY=AIzaSyDkJCEmdaqTmaBYVH3xLtg0HaKwRzSuefA
VITE_FIREBASE_AUTH_DOMAIN=music-bubble-explorer.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=music-bubble-explorer
VITE_FIREBASE_STORAGE_BUCKET=music-bubble-explorer.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1000893317937
VITE_FIREBASE_APP_ID=1:1000893317937:web:82904e4282466acee0a610
```

## デプロイサービス別設定

### Vercel
1. Vercelダッシュボード → プロジェクト選択
2. **Settings** → **Environment Variables**
3. 上記の環境変数を追加
4. 再デプロイ

### Netlify
1. Netlifyダッシュボード → サイト選択
2. **Site settings** → **Environment variables**
3. 上記の環境変数を追加
4. 再デプロイ

### GitHub Pages
GitHub Pagesは環境変数をサポートしていないため、`src/config/firebase.prod.ts`の設定が自動的に使用されます。

## Firebase Firestoreセキュリティルール

本番環境では以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 本番環境用：読み取りは全て許可、書き込みは制限
    match /songs/{songId} {
      allow read: if true;
      allow write: if request.auth != null; // 認証が必要
    }
  }
}
```

開発中は以下のルールを使用：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発環境用：全て許可
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 確認方法

デプロイ後、ブラウザの開発者ツールのコンソールで以下を確認：

1. `🔥 Firebase初期化完了` メッセージが表示される
2. Firebase設定情報が正しく表示される
3. エラーメッセージがない

## トラブルシューティング

### Firebase接続エラー
- 環境変数が正しく設定されているか確認
- Firestoreデータベースが作成されているか確認
- セキュリティルールが適切に設定されているか確認

### データが表示されない
- Firebase接続テスト機能で接続状況を確認
- ブラウザのコンソールでエラーメッセージを確認
- Firestoreにデータが存在するか確認