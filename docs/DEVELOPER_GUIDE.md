# 開発者ガイド

## プロジェクト概要

音楽シャボン玉エクスプローラーは、React + TypeScript + Viteで構築されたモダンなWebアプリケーションです。

## 技術スタック

### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全性
- **Vite**: ビルドツール
- **Styled Components**: CSS-in-JS
- **Framer Motion**: アニメーション

### 開発ツール
- **ESLint**: コード品質
- **Prettier**: コードフォーマット
- **Vitest**: テストフレームワーク
- **Husky**: Git hooks

## セットアップ

### 前提条件
- Node.js 16以上
- npm または yarn

### インストール
```bash
git clone https://github.com/your-username/music-bubble-explorer.git
cd music-bubble-explorer
npm install
```

### 開発サーバー起動
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### テスト実行
```bash
npm run test
```

## プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── glassmorphism/   # ガラスモーフィズムコンポーネント
│   ├── tag/            # タグ関連コンポーネント
│   └── ui/             # 基本UIコンポーネント
├── services/           # データサービス
├── utils/              # ユーティリティ関数
├── styles/             # スタイルファイル
├── types/              # TypeScript型定義
└── hooks/              # カスタムフック
```

## ガラスモーフィズム実装

### 基本的な使用方法

```tsx
import { GlassCard } from '@/components/glassmorphism/GlassCard'

function MyComponent() {
  return (
    <GlassCard variant="primary" blur="medium">
      <p>ガラスモーフィズムカード</p>
    </GlassCard>
  )
}
```

### カスタムスタイル

```tsx
import styled from 'styled-components'

const CustomGlassCard = styled.div`
  background: var(--glass-medium);
  backdrop-filter: var(--blur-medium);
  border: var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
`
```

## タグシステム

### TagChipコンポーネント

```tsx
import { TagChip } from '@/components/tag/TagChip'

function TagList({ tags }: { tags: string[] }) {
  return (
    <div>
      {tags.map((tag, index) => (
        <TagChip
          key={index}
          tag={tag}
          variant="editable"
          onEdit={(newTag) => handleTagEdit(index, newTag)}
          onRemove={() => handleTagRemove(index)}
        />
      ))}
    </div>
  )
}
```

### タグ編集画面

```tsx
import { TagEditingScreen } from '@/components/TagEditingScreen'

function App() {
  return (
    <TagEditingScreen
      song={selectedSong}
      selectedTags={tags}
      onTagsChange={setTags}
      onSave={handleSave}
    />
  )
}
```

## パフォーマンス最適化

### バンドル最適化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          styled: ['styled-components']
        }
      }
    }
  }
})
```

### 遅延読み込み

```tsx
import { lazy, Suspense } from 'react'

const TagEditingScreen = lazy(() => import('./TagEditingScreen'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagEditingScreen />
    </Suspense>
  )
}
```

## テスト

### コンポーネントテスト

```tsx
import { render, screen } from '@testing-library/react'
import { TagChip } from '@/components/tag/TagChip'

test('TagChipが正しく表示される', () => {
  render(<TagChip tag="テストタグ" />)
  expect(screen.getByText('テストタグ')).toBeInTheDocument()
})
```

### ユーティリティテスト

```tsx
import { describe, it, expect } from 'vitest'
import { formatTagName } from '@/utils/tagUtils'

describe('formatTagName', () => {
  it('タグ名を正しくフォーマットする', () => {
    expect(formatTagName('  test tag  ')).toBe('test tag')
  })
})
```

## デプロイ

### GitHub Pages
```bash
npm run build
npm run deploy
```

### 手動デプロイ
```bash
npm run build:production
# distフォルダの内容をサーバーにアップロード
```

## 貢献ガイドライン

### コードスタイル
- ESLintとPrettierの設定に従う
- TypeScriptの型定義を適切に行う
- コンポーネントにはPropsの型定義を必須とする

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: スタイル変更
refactor: リファクタリング
test: テスト追加・修正
```

### プルリクエスト
1. featureブランチを作成
2. 変更を実装
3. テストを追加・実行
4. プルリクエストを作成

## トラブルシューティング

### よくある問題

#### ビルドエラー
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install
```

#### TypeScriptエラー
```bash
# 型チェック実行
npm run type-check
```

#### テスト失敗
```bash
# テスト詳細実行
npm run test -- --verbose
```

## API リファレンス

### GlassmorphismThemeProvider

```tsx
interface GlassmorphismThemeProviderProps {
  children: React.ReactNode
  theme?: Partial<GlassmorphismTheme>
}
```

### TagChip

```tsx
interface TagChipProps {
  tag: string
  variant?: 'default' | 'selected' | 'editable' | 'removable'
  size?: 'small' | 'medium' | 'large'
  isEditing?: boolean
  onEdit?: (newTag: string) => void
  onRemove?: () => void
  onSelect?: () => void
}
```

## 今後の開発予定

- [ ] クラウド同期機能
- [ ] 高度な検索機能
- [ ] データ分析ダッシュボード
- [ ] モバイルアプリ版