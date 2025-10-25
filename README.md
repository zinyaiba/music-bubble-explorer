# Music Bubble Explorer

楽曲の作詞家・作曲家・編曲家の情報をシャボン玉のメタファーで表現するインタラクティブなWebアプリケーションです。

## 特徴

- 🫧 シャボン玉として浮遊する楽曲・人物情報
- 🎨 パステルカラーの可愛い雰囲気
- 📱 レスポンシブデザイン（PC・スマートフォン対応）
- ⚡ 滑らかなアニメーション
- 🎵 直感的な楽曲情報探索

## 技術スタック

- **フレームワーク**: React.js + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Styled Components + CSS3
- **アニメーション**: Framer Motion
- **リンター**: ESLint + Prettier

## 開発環境のセットアップ

1. 依存関係のインストール
```bash
npm install
```

2. 開発サーバーの起動
```bash
npm run dev
```

3. ビルド
```bash
npm run build
```

4. リンター実行
```bash
npm run lint
```

5. フォーマッター実行
```bash
npm run format
```

## プロジェクト構造

```
src/
├── components/     # Reactコンポーネント
├── services/       # ビジネスロジック・データ管理
├── types/          # TypeScript型定義
├── data/           # JSONデータファイル
├── utils/          # ユーティリティ関数
├── App.tsx         # メインアプリケーション
└── main.tsx        # エントリーポイント
```

## データ構造

楽曲データは `src/data/sampleMusic.json` に格納されており、以下の構造を持ちます：

- **songs**: 楽曲情報（タイトル、作詞家、作曲家、編曲家）
- **people**: 人物情報（名前、役割、関連楽曲）

## デプロイ

### GitHub Pages

このプロジェクトはGitHub Pagesに自動デプロイされます。

#### 自動デプロイ
- `main` ブランチにプッシュすると自動的にビルド・デプロイされます
- GitHub Actionsワークフローが実行されます

#### 手動デプロイ
```bash
npm run deploy
```

#### GitHub Pages設定
1. GitHubリポジトリの Settings > Pages に移動
2. Source を "GitHub Actions" に設定
3. デプロイ完了後、`https://[username].github.io/music-bubble-explorer/` でアクセス可能

## 要件

このアプリケーションは以下の要件を満たします：

- シャボン玉として楽曲・人物情報を表示
- クリックによる詳細情報表示
- レスポンシブデザイン
- パステルカラーのデザイン
- 1-300曲程度のデータ処理