# データ共有ガイド

このプロジェクトでは、全ユーザー間で楽曲データを共有するための複数の方法を提供しています。

## 現在の状況

- **データ保存場所**: ブラウザのLocalStorage
- **共有範囲**: 個人のみ
- **他のユーザーとの共有**: なし

## 共有方法の選択肢

### 1. ローカルストレージのみ（現在の方式）

**メリット:**
- 設定不要
- 高速
- プライベート

**デメリット:**
- ユーザー間で共有されない
- ブラウザ依存

**設定:** 不要（現在の方式）

### 2. GitHub Issues 📝

**メリット:**
- 完全無料
- 簡単に始められる
- 透明性が高い
- コミュニティで管理可能

**デメリット:**
- 手動承認が必要
- リアルタイムではない

**設定方法:**
1. GitHubリポジトリを作成
2. Issues機能を有効化
3. アプリの設定でリポジトリ名を指定

### 3. Firebase Firestore 🔥 **（推奨）**

**メリット:**
- リアルタイム同期
- 高機能・高信頼性
- スケーラブル
- 無料枠が充実（月間50,000回の読み取り、20,000回の書き込み）
- 自動バックアップ
- セキュリティルール

**デメリット:**
- 初期設定が必要
- 大量利用時は有料

**詳細設定手順:**

#### 1. Firebaseプロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: music-bubble-explorer）
4. Google Analyticsは任意で設定
5. プロジェクトを作成

#### 2. Firestoreデータベースの設定
1. 左メニューから「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. セキュリティルールで「テストモードで開始」を選択
4. ロケーションを選択（asia-northeast1推奨）

#### 3. ウェブアプリの追加
1. プロジェクト設定（歯車アイコン）をクリック
2. 「全般」タブで「アプリを追加」→「ウェブ」を選択
3. アプリ名を入力（例: Music Bubble Explorer）
4. Firebase SDKの設定をコピー

#### 4. 環境変数の設定
`.env.local`ファイルに以下を追加：
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012345
```

#### 5. セキュリティルールの設定（推奨）
Firestoreのルールタブで以下を設定：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 楽曲データは誰でも読み取り可能、認証済みユーザーのみ書き込み可能
    match /songs/{songId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Supabase 🚀

**メリット:**
- オープンソース
- PostgreSQL使用
- 無料枠が充実
- Firebase代替

**デメリット:**
- 比較的新しいサービス
- 設定が必要

**設定方法:**
1. Supabaseプロジェクトを作成
2. データベーステーブルを設定
3. 認証設定
4. アプリにSupabase SDKを統合

### 5. JSONファイル + GitHub Actions 📄

**メリット:**
- 完全無料
- 透明性が高い
- バージョン管理
- 静的ホスティング対応

**デメリット:**
- リアルタイムではない
- 設定が複雑

**設定方法:**
1. GitHubリポジトリを作成
2. 共有データ用JSONファイルを作成
3. GitHub Actionsワークフローを設定
4. Pull Request自動化を設定

## 推奨設定

### 個人プロジェクト
- **Firebase Firestore** - 無料枠で十分、将来の拡張性も考慮

### 小規模コミュニティ（〜100ユーザー）
- **Firebase Firestore** - リアルタイム同期で快適な体験

### 中規模コミュニティ（100〜1000ユーザー）
- **Firebase Firestore** - 無料枠内で運用可能

### 大規模コミュニティ（1000ユーザー以上）
- **Firebase Firestore** - 高い信頼性とスケーラビリティ

### 完全無料を希望する場合
- **GitHub Issues** - 無料で透明性が高い（手動承認が必要）

## 実装例

### GitHub Issues方式の実装

```typescript
// 楽曲登録時にGitHub Issuesに投稿
const addSongViaGitHubIssues = async (song: Song) => {
  const issueBody = `
## 新しい楽曲登録

**楽曲名:** ${song.title}
**作詞:** ${song.lyricists.join(', ')}
**作曲:** ${song.composers.join(', ')}
**編曲:** ${song.arrangers.join(', ')}
**タグ:** ${song.tags?.join(', ') || 'なし'}

\`\`\`json
${JSON.stringify(song, null, 2)}
\`\`\`
  `

  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: `楽曲登録: ${song.title}`,
      body: issueBody,
      labels: ['song-registration']
    })
  })

  return response.ok
}
```

### Firebase方式の実装

```typescript
import { FirebaseService } from '@/services/firebaseService'
import { AuthService } from '@/services/authService'

// Firebase初期化
const firebaseService = FirebaseService.getInstance()
const authService = AuthService.getInstance()

// 匿名認証
await authService.signInAnonymously()

// 楽曲をFirestoreに保存
const addSongViaFirebase = async (song: Song) => {
  const userId = authService.getUserId()
  const songId = await firebaseService.addSong(song, userId)
  return songId !== null
}

// Firestoreから楽曲を取得
const getSongsFromFirebase = async () => {
  const database = await firebaseService.getMusicDatabase()
  return database.songs
}

// リアルタイム監視
const unsubscribe = firebaseService.subscribeToSongs((songs) => {
  console.log('楽曲データが更新されました:', songs.length)
})

// 監視を停止
unsubscribe()
```

## セキュリティ考慮事項

### データ検証
- 入力データの妥当性チェック
- XSS攻撃の防止
- 不適切なコンテンツのフィルタリング

### 認証・認可
- ユーザー認証の実装
- 投稿権限の管理
- レート制限の実装

### プライバシー
- 個人情報の保護
- データの匿名化
- GDPR対応（必要に応じて）

## 移行手順

### 現在のローカルデータを共有データベースに移行

1. **データのエクスポート**
   ```typescript
   const exportData = () => {
     const data = DataManager.exportData()
     console.log('エクスポートデータ:', data)
   }
   ```

2. **共有データベースへのインポート**
   ```typescript
   const importToShared = async (data: MusicDatabase) => {
     const sharedService = SharedDataService.getInstance()
     for (const song of data.songs) {
       await sharedService.addSongToShared(song)
     }
   }
   ```

3. **設定の切り替え**
   ```typescript
   const sharedService = SharedDataService.getInstance()
   sharedService.configure({
     method: DataSharingMethod.FIREBASE, // または他の方式
     firebaseConfig: { /* Firebase設定 */ }
   })
   ```

## トラブルシューティング

### よくある問題

1. **データが同期されない**
   - ネットワーク接続を確認
   - 認証情報を確認
   - サービスの状態を確認

2. **重複データが作成される**
   - 一意性制約の確認
   - 重複チェックロジックの実装

3. **パフォーマンスが低下する**
   - データ量の確認
   - インデックスの最適化
   - キャッシュの実装

### サポート

問題が発生した場合は、以下の情報を含めてIssueを作成してください：

- 使用している共有方式
- エラーメッセージ
- 再現手順
- ブラウザとバージョン
- 期待する動作

## 今後の拡張予定

- [ ] リアルタイム同期機能
- [ ] オフライン対応
- [ ] データの自動バックアップ
- [ ] 管理者機能
- [ ] データ分析機能
- [ ] API提供