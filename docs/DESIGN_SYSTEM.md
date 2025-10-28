# ガラスモーフィズムデザインシステム

## 概要

音楽シャボン玉エクスプローラーのガラスモーフィズムデザインシステムは、透明感のあるモダンなUIを提供します。

## カラーパレット

### プライマリカラー（淡いピンク系）
- `--glass-primary-50`: #fef7f7 (最も薄いピンク)
- `--glass-primary-100`: #fce8e8 (薄いピンク)
- `--glass-primary-200`: #f8d1d1 (中間ピンク)
- `--glass-primary-300`: #f3b4b4 (やや濃いピンク)
- `--glass-primary-400`: #ec8b8b (濃いピンク)
- `--glass-primary-500`: #e06666 (メインピンク)

### ニュートラルカラー（白とグレー系）
- `--glass-neutral-0`: #ffffff (純白)
- `--glass-neutral-50`: #fafafa (オフホワイト)
- `--glass-neutral-100`: #f5f5f5 (薄いグレー)
- `--glass-neutral-200`: #e5e5e5 (中間グレー)
- `--glass-neutral-300`: #d4d4d4 (やや濃いグレー)
- `--glass-neutral-400`: #a3a3a3 (濃いグレー)
- `--glass-neutral-500`: #737373 (ダークグレー)

### ガラス効果カラー
- `--glass-light`: rgba(255, 255, 255, 0.1)
- `--glass-medium`: rgba(255, 255, 255, 0.2)
- `--glass-strong`: rgba(255, 255, 255, 0.3)
- `--glass-tinted`: rgba(254, 247, 247, 0.2)

## エフェクト

### ぼかし効果
- `--blur-light`: blur(8px)
- `--blur-medium`: blur(12px)
- `--blur-strong`: blur(20px)

### シャドウ
- `--shadow-subtle`: 0 2px 8px rgba(0, 0, 0, 0.05)
- `--shadow-medium`: 0 4px 16px rgba(0, 0, 0, 0.1)
- `--shadow-strong`: 0 8px 32px rgba(0, 0, 0, 0.15)
- `--shadow-colored`: 0 4px 16px rgba(224, 102, 102, 0.1)

### 枠線
- `--border-glass`: 1px solid rgba(255, 255, 255, 0.2)
- `--border-subtle`: 1px solid rgba(255, 255, 255, 0.1)
- `--border-accent`: 1px solid rgba(224, 102, 102, 0.2)

## タイポグラフィ

### フォントファミリー
- **プライマリ**: 'M PLUS Rounded 1c', 'Hiragino Sans', 'Yu Gothic UI', sans-serif
- **セカンダリ**: 'Poppins', 'M PLUS Rounded 1c', sans-serif

### フォントウェイト
- `--font-light`: 300
- `--font-regular`: 400
- `--font-medium`: 500
- `--font-bold`: 700

### フォントサイズ
- `--text-xs`: 0.75rem (12px)
- `--text-sm`: 0.875rem (14px)
- `--text-base`: 1rem (16px)
- `--text-lg`: 1.125rem (18px)
- `--text-xl`: 1.25rem (20px)
- `--text-2xl`: 1.5rem (24px)
- `--text-3xl`: 1.875rem (30px)
- `--text-4xl`: 2.25rem (36px)

## コンポーネント

### GlassCard
基本的なガラスモーフィズムカードコンポーネント

```css
.glass-card {
  background: var(--glass-medium);
  backdrop-filter: var(--blur-medium);
  border: var(--border-glass);
  border-radius: 16px;
  box-shadow: var(--shadow-medium);
}
```

### TagChip
チップ形式のタグコンポーネント

```css
.tag-chip {
  background: var(--glass-light);
  backdrop-filter: var(--blur-light);
  border: var(--border-subtle);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
}

.tag-chip:hover {
  background: var(--glass-medium);
  transform: translateY(-1px);
  box-shadow: var(--shadow-colored);
}
```

## 使用ガイドライン

### 適用原則
1. **透明感の維持**: 常に背景が透けて見えるレベルの透明度を保つ
2. **階層の明確化**: 重要度に応じてぼかし強度を調整
3. **一貫性の確保**: 同じ機能には同じスタイルを適用
4. **アクセシビリティ**: 十分なコントラスト比を確保

### パフォーマンス考慮事項
- `backdrop-filter`の使用は必要最小限に
- GPU加速のため`will-change: backdrop-filter`を適用
- モバイルでは効果を軽減

## ブラウザサポート

### 完全サポート
- Chrome 88+
- Firefox 87+
- Safari 14+
- Edge 88+

### フォールバック
`backdrop-filter`未対応ブラウザでは通常の半透明背景を使用