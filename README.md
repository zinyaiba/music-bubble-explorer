# 🌰栗林みな実 Mallon Bubbles🌰

楽曲の作詞家・作曲家・編曲家の情報をシャボン玉のメタファーで表現するインタラクティブなWebアプリケーションです。新しいガラスモーフィズムデザインにより、より美しく現代的なUIを提供します。

## ✨ 新機能・特徴

- 🫧 **シャボン玉ビジュアライゼーション**: 楽曲・人物情報を美しいシャボン玉で表現
- 🎨 **ガラスモーフィズムデザイン**: 透明感のあるモダンなUI
- 🌸 **淡いピンクと白の配色**: 優しく清潔感のある色合い
- 🏷️ **専用タグ登録画面**: ダイアログから独立した使いやすいタグ管理
- 💎 **チップ形式タグ**: 美しいチップデザインでのタグ表示・編集
- 📱 **完全レスポンシブ**: モバイルファーストの設計
- ⚡ **高性能**: 最適化されたバンドルとアニメーション
- ♿ **アクセシビリティ対応**: WCAG 2.1 AA基準準拠

## 🛠️ 技術スタック

### フロントエンド
- **React 18**: 最新のUIライブラリ
- **TypeScript**: 型安全性とコード品質
- **Vite**: 高速ビルドツール
- **Styled Components**: CSS-in-JSスタイリング
- **Framer Motion**: 滑らかなアニメーション

### デザインシステム
- **ガラスモーフィズム**: 透明感のあるモダンデザイン
- **M PLUS Rounded 1c**: 丸みのあるフォント
- **レスポンシブデザイン**: モバイルファースト設計

### 開発ツール
- **ESLint + Prettier**: コード品質とフォーマット
- **Vitest**: テストフレームワーク
- **Husky**: Git hooks
- **GitHub Actions**: CI/CD

## 🚀 開発環境のセットアップ

### 前提条件
- Node.js 16以上
- npm または yarn

### インストールと起動

1. **リポジトリのクローン**
```bash
git clone https://github.com/your-username/music-bubble-explorer.git
cd music-bubble-explorer
```

2. **依存関係のインストール**
```bash
npm install
```

3. **開発サーバーの起動**
```bash
npm run dev
```

4. **プロダクションビルド**
```bash
npm run build:production
```

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 通常ビルド
npm run build

# 最適化されたプロダクションビルド
npm run build:production

# テスト実行
npm run test

# リンター実行
npm run lint

# フォーマッター実行
npm run format

# デプロイ準備確認
npm run deployment-check

# プッシュ前検証
npm run pre-push
```

## 📁 プロジェクト構造

```
src/
├── components/              # Reactコンポーネント
│   ├── glassmorphism/       # ガラスモーフィズムコンポーネント
│   ├── tag/                # タグ関連コンポーネント
│   ├── TagEditingScreen.tsx # 専用タグ編集画面
│   ├── TagRegistrationScreen.tsx # タグ登録画面
│   └── SongSelectionScreen.tsx # 楽曲選択画面
├── services/               # ビジネスロジック・データ管理
├── utils/                  # ユーティリティ関数
│   ├── glassmorphismPerformanceOptimizer.ts
│   ├── glassmorphismAccessibility.ts
│   └── bundleOptimization.ts
├── styles/                 # スタイルファイル
│   ├── glassmorphism-*.css # ガラスモーフィズムスタイル
│   └── responsive-enhanced.css
├── types/                  # TypeScript型定義
├── data/                   # JSONデータファイル
├── docs/                   # ドキュメント
│   ├── USER_GUIDE.md       # ユーザーガイド
│   ├── DESIGN_SYSTEM.md    # デザインシステム
│   └── DEVELOPER_GUIDE.md  # 開発者ガイド
├── App.tsx                 # メインアプリケーション
└── main.tsx                # エントリーポイント
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
## 🎨 ガラス
モーフィズムデザイン

### デザインの特徴
- **透明感**: `backdrop-filter: blur()`による背景ぼかし効果
- **半透明背景**: `rgba(255, 255, 255, 0.1-0.3)`による透明度
- **白い枠線**: 繊細な境界線で要素を区別
- **控えめなシャドウ**: 奥行きを演出する影効果
- **角丸デザイン**: 16px-24pxの角丸で優しい印象

### カラーパレット
- **プライマリ**: 淡いピンク系 (#fef7f7 - #e06666)
- **ニュートラル**: 白とグレー系 (#ffffff - #737373)
- **ガラス効果**: 半透明の白系統

## 🏷️ 新しいタグシステム

### 専用タグ登録画面
- **全画面表示**: ダイアログから独立した専用画面
- **2段階フロー**: 楽曲選択 → タグ編集
- **スムーズな遷移**: アニメーション付き画面切り替え

### チップ形式タグ
- **ガラスモーフィズム効果**: 透明感のある美しいデザイン
- **インライン編集**: チップ内で直接編集可能
- **完全文字表示**: 編集時は文字省略なし
- **視覚的フィードバック**: ホバー・フォーカス効果

## 📱 PWA対応

### インストール可能
- ホーム画面に追加可能
- ネイティブアプリのような体験
- オフライン対応

### 最適化機能
- Service Worker によるキャッシュ
- 高速な起動時間
- バックグラウンド同期

## 🔧 パフォーマンス最適化

### バンドル最適化
- **コード分割**: 機能別チャンク分離
- **Tree Shaking**: 未使用コード除去
- **圧縮**: Terser による最適化
- **遅延読み込み**: 必要時のみモジュール読み込み

### レンダリング最適化
- **GPU加速**: `will-change` プロパティ活用
- **メモ化**: React.memo による再レンダリング防止
- **仮想化**: 大量データの効率的表示

## ♿ アクセシビリティ

### WCAG 2.1 AA準拠
- **キーボードナビゲーション**: 全機能をキーボードで操作可能
- **スクリーンリーダー対応**: 適切なARIAラベル設定
- **色彩対比**: 十分なコントラスト比確保
- **フォーカス管理**: 明確なフォーカス表示

## 🌐 ブラウザサポート

### デスクトップ
- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

### モバイル
- iOS Safari 14+
- Chrome Mobile 88+
- Samsung Internet 15+

## 📚 ドキュメント

- **[ユーザーガイド](docs/USER_GUIDE.md)**: アプリの使い方
- **[デザインシステム](docs/DESIGN_SYSTEM.md)**: ガラスモーフィズムデザイン仕様
- **[開発者ガイド](docs/DEVELOPER_GUIDE.md)**: 開発・カスタマイズ方法

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します！

### 開発フロー
1. フォークしてブランチを作成
2. 変更を実装
3. テストを追加・実行
4. プルリクエストを作成

### コードスタイル
- ESLint + Prettier の設定に従う
- TypeScript の型定義を適切に行う
- コンポーネントには Props の型定義を必須とする

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 🙏 謝辞

- **M PLUS Rounded 1c**: 美しい日本語フォント
- **React Community**: 素晴らしいライブラリとツール
- **Glassmorphism Design**: モダンなデザイントレンド

---

**🌰栗林みな実 Mallon Bubbles🌰** - 音楽の世界を美しく探索しよう