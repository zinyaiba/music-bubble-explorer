# Design Document

## Overview

Music Bubble Explorerは、楽曲の作詞家・作曲家・編曲家情報をシャボン玉のメタファーで表現するインタラクティブなWebアプリケーションです。HTML5 Canvas、CSS3アニメーション、およびモダンなJavaScriptフレームワークを使用して、滑らかなアニメーションと直感的なユーザーインターフェースを実現します。

## Architecture

### Frontend Architecture
- **フレームワーク**: React.js (コンポーネントベースの開発とstate管理)
- **アニメーション**: Framer Motion (滑らかなシャボン玉アニメーション)
- **スタイリング**: Styled Components + CSS3 (パステルカラーテーマ)
- **レスポンシブ**: CSS Grid/Flexbox + Media Queries

### Data Layer
- **データストレージ**: JSON形式の静的データファイル
- **状態管理**: React Context API + useReducer
- **データ構造**: 正規化されたリレーショナル形式

### Rendering Engine
- **シャボン玉レンダリング**: HTML5 Canvas または CSS Transform
- **物理エンジン**: カスタム軽量物理シミュレーション
- **パフォーマンス**: RequestAnimationFrame + 仮想化

## Components and Interfaces

### Core Components

#### 1. BubbleCanvas Component
```typescript
interface BubbleCanvasProps {
  width: number;
  height: number;
  bubbles: Bubble[];
  onBubbleClick: (bubble: Bubble) => void;
}
```

**責任範囲:**
- シャボン玉の描画とアニメーション
- クリックイベントの検出
- 物理シミュレーション（浮遊、衝突）

#### 2. Bubble Entity
```typescript
interface Bubble {
  id: string;
  type: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag';
  name: string;
  x: number;
  y: number;
  vx: number; // velocity x
  vy: number; // velocity y
  size: number;
  color: string;
  opacity: number;
  lifespan: number;
  maxLifespan: number; // 5-10秒の範囲
  relatedCount: number; // サイズ決定用
}
```

#### 3. DetailModal Component
```typescript
interface DetailModalProps {
  selectedBubble: Bubble | null;
  relatedData: RelatedData[];
  onClose: () => void;
}
```

**責任範囲:**
- 選択されたシャボン玉の詳細情報表示
- 関連楽曲/人物の一覧表示
- モーダルの開閉アニメーション

#### 4. SongRegistrationForm Component
```typescript
interface SongRegistrationFormProps {
  onSongAdded: (song: Song) => void;
  onSongUpdated?: (song: Song) => void;
  editingSong?: Song | null;
  onClose: () => void;
}

interface SongFormData {
  title: string;
  lyricists: string;
  composers: string;
  arrangers: string;
  tags: string[];
}
```

**責任範囲:**
- 楽曲情報の入力・編集フォーム表示
- 個別タグ入力フィールドの動的管理
- 入力値の検証とエラー表示
- 楽曲データの保存・更新処理

#### 5. SongManagement Component
```typescript
interface SongManagementProps {
  songs: Song[];
  onEditSong: (song: Song) => void;
  onDeleteSong: (songId: string) => void;
}
```

**責任範囲:**
- 登録済み楽曲の一覧表示
- 楽曲の編集・削除操作
- 削除確認ダイアログの表示

#### 6. TagInput Component
```typescript
interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  existingTags: string[];
}
```

**責任範囲:**
- 個別タグ入力フィールドの管理
- タグの追加・削除機能
- 既存タグの候補表示

#### 7. BubbleManager Service
```typescript
class BubbleManager {
  generateBubble(): Bubble;
  updateBubblePhysics(bubbles: Bubble[]): Bubble[];
  removeBubble(id: string): void;
  calculateBubbleSize(relatedCount: number): number;
  updateBubbleLifespan(bubbles: Bubble[]): Bubble[];
  createSmoothAnimation(bubble: Bubble): void;
  formatBubbleText(bubble: Bubble): string; // タグに#を付ける処理
  calculateOptimalFontSize(text: string, bubbleSize: number): number;
}
```

### Data Models

#### Music Data Structure
```typescript
interface Song {
  id: string;
  title: string;
  lyricists: string[];
  composers: string[];
  arrangers: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Person {
  id: string;
  name: string;
  type: 'lyricist' | 'composer' | 'arranger';
  songs: string[]; // song IDs
}

interface Tag {
  id: string;
  name: string;
  songs: string[]; // song IDs
  displayName: string; // #付きの表示名
}

interface MusicDatabase {
  songs: Song[];
  people: Person[];
  tags: Tag[];
}
```

## Animation System

### Improved Bubble Lifecycle Animation

1. **出現アニメーション**
   - 初期サイズ: 0
   - フェードイン: opacity 0 → 1 (0.5秒)
   - スケールアップ: scale 0 → 1 (0.3秒、easeOut)

2. **浮遊アニメーション**
   - 60FPS滑らかな物理ベース移動
   - ベジェ曲線による自然な軌道
   - 微細な揺れ（sin波 + パーリンノイズ）
   - GPU加速によるtransform3d使用

3. **ライフサイクル管理**
   - 各シャボン玉の寿命: 5-10秒（ランダム）
   - 寿命の70%経過時点でフェードアウト開始
   - 消失と同時に新しいシャボン玉生成

4. **消失アニメーション**
   - フェードアウト: opacity 1 → 0 (1.5秒、easeInOut)
   - スケールダウン: scale 1 → 0 (1.0秒、easeIn)
   - 回転効果: rotate 0 → 360deg (1.5秒)

### Click Interaction Animation

1. **選択時拡大**
   - スケール: 1 → 1.5 (0.2秒、easeOut)
   - 他のシャボン玉: opacity 1 → 0.3

2. **詳細表示**
   - モーダル背景: opacity 0 → 0.8
   - コンテンツ: translateY(50px) → 0, opacity 0 → 1

## Color System

### Pastel Color Palette
```css
:root {
  --bubble-pink: #FFB6C1;      /* 楽曲 */
  --bubble-blue: #B6E5D8;      /* 作詞家 */
  --bubble-purple: #DDA0DD;    /* 作曲家 */
  --bubble-yellow: #F0E68C;    /* 編曲家 */
  --bubble-green: #98FB98;     /* タグ */
  --bubble-orange: #FFDAB9;    /* その他 */
  
  --background-gradient: linear-gradient(135deg, #E8F4FD 0%, #FFF0F5 100%);
  --text-primary: #5A5A5A;
  --text-secondary: #8A8A8A;
  --form-background: rgba(255, 255, 255, 0.9);
  --form-border: #E0E0E0;
}
```

### Size Calculation Algorithm
```typescript
function calculateBubbleSize(relatedCount: number): number {
  const minSize = 40;
  const maxSize = 120;
  const normalizedCount = Math.min(relatedCount / 20, 1); // 20件で最大サイズ
  return minSize + (maxSize - minSize) * normalizedCount;
}
```

## Responsive Design Strategy

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Adaptive Features
- **Mobile**: タッチ操作最適化、シャボン玉数削減（パフォーマンス）
- **Tablet**: 中間サイズのシャボン玉、スワイプジェスチャー
- **Desktop**: マウスホバー効果、キーボードナビゲーション

## Performance Optimization

### Rendering Optimization
1. **仮想化**: 画面外のシャボン玉は描画スキップ
2. **バッチ更新**: RequestAnimationFrame内で一括更新
3. **メモ化**: React.memo、useMemo、useCallbackの活用

### Memory Management
1. **オブジェクトプール**: シャボン玉オブジェクトの再利用
2. **イベントリスナー**: 適切なクリーンアップ
3. **画像最適化**: WebP形式、適切なサイズ

## Error Handling

### Data Loading Errors
- ネットワークエラー時のフォールバック表示
- 不正なデータ形式の検証とエラーメッセージ
- 部分的なデータ読み込み失敗への対応

### Runtime Errors
- Canvas描画エラーのキャッチと復旧
- アニメーション例外の処理
- メモリ不足時の graceful degradation

## Data Persistence Strategy

### Local Storage Implementation
```typescript
interface DataManager {
  saveSong(song: Song): void;
  loadSongs(): Song[];
  exportData(): string; // JSON形式
  importData(jsonData: string): void;
}
```

### Storage Structure
```typescript
interface LocalStorageData {
  songs: Song[];
  version: string;
  lastUpdated: string;
}
```

**特徴:**
- ブラウザのlocalStorageを使用
- JSONシリアライゼーション
- データバージョン管理
- インポート/エクスポート機能

## Tag System Design

### Tag Management
```typescript
interface TagManager {
  extractTagsFromSongs(songs: Song[]): Tag[];
  getTaggedSongs(tagName: string): Song[];
  calculateTagPopularity(tagName: string): number;
}
```

### Tag Bubble Styling
- **色**: 緑系パステルカラー（#98FB98）
- **形状**: 少し角丸の六角形（他と区別）
- **アニメーション**: 軽やかな浮遊（重力係数0.8）

## GitHub Pages Deployment

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  base: '/music-bubble-explorer/', // リポジトリ名
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

### PWA対応
- Service Worker実装
- オフライン対応
- モバイルアプリライクな体験

## Performance Enhancements

### Animation Optimization
1. **GPU加速**: transform3d、will-change使用
2. **フレーム制御**: requestAnimationFrame + タイムスタンプ管理
3. **レンダリング最適化**: 変更検知による部分更新

### Memory Management
1. **オブジェクトプール**: シャボン玉の再利用
2. **イベント最適化**: passive listenerの使用
3. **ガベージコレクション**: 定期的なクリーンアップ

## Data Management Strategy

### Enhanced Data Manager
```typescript
interface DataManager {
  saveSong(song: Song): void;
  updateSong(song: Song): void;
  deleteSong(songId: string): void;
  loadSongs(): Song[];
  exportData(): string;
  importData(jsonData: string): void;
  getAllTags(): string[];
}
```

### Song Management Features
- **CRUD Operations**: 楽曲の作成、読み取り、更新、削除
- **Tag Management**: 個別タグ入力と既存タグ候補表示
- **Data Validation**: 入力データの整合性チェック
- **Backup/Restore**: データのエクスポート・インポート機能

## UI Enhancement Strategy

### Improved Text Visibility
```typescript
interface TextRenderingConfig {
  minFontSize: number; // 最小フォントサイズ
  maxFontSize: number; // 最大フォントサイズ
  contrastRatio: number; // 色コントラスト比
  strokeWidth: number; // 文字の縁取り幅
}
```

### Tag Display Enhancement
- **Hash Prefix**: タグ名の前に#を自動付与
- **Visual Distinction**: タグ専用の色とスタイル
- **Dynamic Sizing**: タグの人気度に応じたサイズ調整

### Dynamic Tag Input System
```typescript
interface TagInputSystem {
  addTagField(): void;
  removeTagField(index: number): void;
  suggestTags(input: string): string[];
  validateTag(tag: string): boolean;
}
```

## Testing Strategy

### Unit Testing
- シャボン玉物理計算のロジックテスト
- データ変換・フィルタリング機能のテスト
- カラーパレット生成アルゴリズムのテスト
- CRUD操作のテスト
- タグ管理機能のテスト

### Integration Testing
- コンポーネント間の相互作用テスト
- アニメーション状態遷移のテスト
- レスポンシブレイアウトのテスト
- 楽曲編集・削除フローのテスト

### Performance Testing
- 大量データ（300曲）での動作確認
- 長時間実行時のメモリリーク検証
- 異なるデバイスでのフレームレート測定

### User Experience Testing
- タッチ操作の精度テスト
- アニメーション滑らかさの主観評価
- アクセシビリティ準拠の確認
- 文字の可読性テスト