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

#### 7. Enhanced BubbleManager Service
```typescript
interface BubbleAnimationConfig {
  disappearanceInterval: { min: number; max: number }; // ランダム消失間隔
  floatingSpeed: { min: number; max: number };         // 浮遊スピード範囲
  maxSize: { min: number; max: number };               // 最大サイズ範囲
  randomnessFactor: number;                            // ランダム性係数
  staggeredDisappearance: boolean;                     // まばらな消失
}

class BubbleManager {
  private animationConfig: BubbleAnimationConfig;
  
  generateBubble(): Bubble;
  updateBubblePhysics(bubbles: Bubble[]): Bubble[];
  removeBubble(id: string): void;
  calculateBubbleSize(relatedCount: number): number;
  updateBubbleLifespan(bubbles: Bubble[]): Bubble[];
  createSmoothAnimation(bubble: Bubble): void;
  formatBubbleText(bubble: Bubble): string;
  calculateOptimalFontSize(text: string, bubbleSize: number): number;
  
  // 新機能
  generateUniqueRoleBubbles(person: Person): Bubble[];  // 役割別一意シャボン玉生成
  applyRandomDisappearance(bubbles: Bubble[]): Bubble[]; // ランダム消失
  updateAnimationConfig(config: Partial<BubbleAnimationConfig>): void;
  getCategoryColor(category: string): string;           // カテゴリ別色取得
}

#### 8. ColorLegend Component
```typescript
interface ColorLegendProps {
  position: 'top-right' | 'bottom-left' | 'bottom-right';
  isVisible: boolean;
  categories: LegendItem[];
}

interface LegendItem {
  category: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag';
  color: string;
  label: string;
  count?: number; // 該当するシャボン玉の数
}
```

#### 9. TagList Component
```typescript
interface TagListProps {
  tags: Tag[];
  onTagClick: (tag: Tag) => void;
  sortBy: 'alphabetical' | 'frequency';
  isVisible: boolean;
}

interface TagListItem {
  id: string;
  name: string;
  songCount: number;
  displayName: string; // #付きの表示名
}
```

#### 10. Mobile-First Navigation Component
```typescript
interface MobileNavigationProps {
  currentView: 'bubbles' | 'song-registration' | 'song-management' | 'tag-list';
  onViewChange: (view: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  view: string;
  isActive: boolean;
}
```
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

## Enhanced Animation System

### Configurable Bubble Lifecycle Animation

1. **出現アニメーション**
   - 初期サイズ: 0
   - フェードイン: opacity 0 → 1 (0.5秒)
   - スケールアップ: scale 0 → 1 (0.3秒、easeOut)
   - ランダムな出現位置とタイミング

2. **浮遊アニメーション**
   - 60FPS滑らかな物理ベース移動
   - ベジェ曲線による自然な軌道
   - 微細な揺れ（sin波 + パーリンノイズ）
   - GPU加速によるtransform3d使用
   - 設定可能な浮遊スピード範囲

3. **ランダム化されたライフサイクル管理**
   - 各シャボン玉の寿命: 設定可能な範囲（デフォルト5-10秒）
   - ランダムな消失タイミング（一斉消失の回避）
   - 寿命の70%経過時点でフェードアウト開始
   - まばらな消失パターンの実装

4. **改善された消失アニメーション**
   - フェードアウト: opacity 1 → 0 (1.5秒、easeInOut)
   - スケールダウン: scale 1 → 0 (1.0秒、easeIn)
   - 回転効果: rotate 0 → 360deg (1.5秒)
   - ランダムな消失間隔の適用

### Mobile Performance Optimization

1. **チラつき防止対策**
   - CSS `will-change` の適切な管理
   - レイヤー分離による描画最適化
   - 不要な再描画の抑制

2. **ダイアログ安定性**
   - アニメーション実行中のダイアログ固定
   - z-index管理の改善
   - モーダル状態の適切な管理

### Click Interaction Animation

1. **選択時拡大**
   - スケール: 1 → 1.5 (0.2秒、easeOut)
   - 他のシャボン玉: opacity 1 → 0.3

2. **詳細表示**
   - モーダル背景: opacity 0 → 0.8
   - コンテンツ: translateY(50px) → 0, opacity 0 → 1

## Color System

### Enhanced Category-Based Color Palette
```css
:root {
  /* カテゴリ別シャボン玉カラー */
  --bubble-song: #FFB6C1;      /* 楽曲 - ピンク */
  --bubble-lyricist: #B6E5D8;  /* 作詞家 - ライトブルー */
  --bubble-composer: #DDA0DD;  /* 作曲家 - ライトパープル */
  --bubble-arranger: #F0E68C;  /* 編曲家 - ライトイエロー */
  --bubble-tag: #98FB98;       /* タグ - ライトグリーン */
  
  /* 凡例用カラー */
  --legend-background: rgba(255, 255, 255, 0.95);
  --legend-border: #E0E0E0;
  --legend-text: #5A5A5A;
  
  --background-gradient: linear-gradient(135deg, #E8F4FD 0%, #FFF0F5 100%);
  --text-primary: #5A5A5A;
  --text-secondary: #8A8A8A;
  --form-background: rgba(255, 255, 255, 0.9);
  --form-border: #E0E0E0;
}
```

### Color Legend Component
```typescript
interface ColorLegendProps {
  position: 'top-right' | 'bottom-left' | 'bottom-right';
  isVisible: boolean;
}

interface LegendItem {
  category: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag';
  color: string;
  label: string;
  icon?: string;
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

## Mobile-First Responsive Design Strategy

### Enhanced Breakpoints
- **Mobile**: < 768px (Primary focus)
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Mobile-First UI Design

#### Header Simplification
```css
.mobile-header {
  height: 60px; /* 従来の80pxから縮小 */
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.desktop-header {
  height: 80px;
  padding: 12px 24px;
}
```

#### Icon-Based Navigation
```typescript
interface MobileNavigation {
  items: [
    { id: 'bubbles', icon: 'bubble', label: 'シャボン玉', primary: true },
    { id: 'add-song', icon: 'plus', label: '楽曲登録' },
    { id: 'manage-songs', icon: 'list', label: '楽曲管理' },
    { id: 'tag-list', icon: 'tag', label: 'タグ一覧' }
  ];
}
```

### Adaptive Features
- **Mobile**: 
  - シャボン玉領域を画面の85%に拡大
  - アイコンベースのナビゲーション
  - タッチ操作最適化
  - シャボン玉数削減（パフォーマンス）
- **Tablet**: 中間サイズのシャボン玉、スワイプジェスチャー
- **Desktop**: マウスホバー効果、キーボードナビゲーション

## Performance Optimization

### Mobile Performance Enhancement
1. **チラつき防止**: 
   - CSS `will-change` プロパティの適切な使用
   - `transform3d` による GPU 加速の活用
   - 不要な再レンダリングの防止（React.memo、useMemo）
   - ダイアログ表示中のアニメーション制御

2. **ダイアログ安定性**:
   - ダイアログのz-indexとポジション固定
   - アニメーション実行中のダイアログ状態保持
   - モーダル背景のイベント伝播制御

### Rendering Optimization
1. **仮想化**: 画面外のシャボン玉は描画スキップ
2. **バッチ更新**: RequestAnimationFrame内で一括更新
3. **メモ化**: React.memo、useMemo、useCallbackの活用
4. **レンダリング最適化**: 
   - 条件付きレンダリングによる不要な描画回避
   - Canvas描画の最適化とフレーム制御

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
## Unique 
Role-Based Bubble System

### Duplicate Prevention Strategy
```typescript
interface UniqueBubbleGenerator {
  generateRoleBasedBubbles(person: Person): Bubble[];
  preventDuplicateDisplay(bubbles: Bubble[]): Bubble[];
  assignCategoryColors(bubbles: Bubble[]): Bubble[];
}

interface PersonRole {
  personName: string;
  roles: ('lyricist' | 'composer' | 'arranger')[];
  songs: string[];
}
```

### Role-Based Color Assignment
- **作詞家**: `#B6E5D8` (ライトブルー)
- **作曲家**: `#DDA0DD` (ライトパープル)  
- **編曲家**: `#F0E68C` (ライトイエロー)
- **楽曲**: `#FFB6C1` (ピンク)
- **タグ**: `#98FB98` (ライトグリーン)

## Tag Management System

### Enhanced Tag List Component
```typescript
interface TagListComponent {
  displayTags(): TagListItem[];
  sortTags(sortBy: 'alphabetical' | 'frequency'): TagListItem[];
  filterTags(searchTerm: string): TagListItem[];
  getTaggedSongs(tagId: string): Song[];
}

interface TagListView {
  layout: 'grid' | 'list';
  showCounts: boolean;
  enableSearch: boolean;
  sortOptions: string[];
}
```

### Tag Display Features
- アルファベット順・使用頻度順ソート
- 各タグの楽曲数表示
- タグクリックで関連楽曲表示
- モバイル最適化レイアウト

## Animation Configuration System

### Configurable Animation Parameters
```typescript
interface AnimationSettings {
  bubbleLifespan: {
    min: number;      // 最小寿命（秒）
    max: number;      // 最大寿命（秒）
  };
  floatingSpeed: {
    min: number;      // 最小浮遊速度
    max: number;      // 最大浮遊速度
  };
  maxBubbleSize: {
    min: number;      // 最小最大サイズ
    max: number;      // 最大最大サイズ
  };
  randomnessFactor: number;     // ランダム性係数 (0-1)
  staggerDisappearance: boolean; // まばらな消失の有効化
  disappearanceDelay: {
    min: number;      // 最小消失遅延
    max: number;      // 最大消失遅延
  };
}

class AnimationController {
  private settings: AnimationSettings;
  
  updateSettings(newSettings: Partial<AnimationSettings>): void;
  applyRandomDisappearance(bubbles: Bubble[]): void;
  calculateStaggeredTiming(bubbleCount: number): number[];
  optimizeForMobile(): AnimationSettings;
}
```

## Mobile Performance Architecture

### Enhanced Anti-Flicker System
```typescript
interface PerformanceOptimizer {
  preventFlicker(): void;
  stabilizeDialogs(): void;
  optimizeRendering(): void;
  manageGPUAcceleration(): void;
  isolateDialogLayers(): void;
  controlAnimationDuringDialog(): void;
}

class MobilePerformanceManager {
  private isDialogOpen: boolean;
  private animationPaused: boolean;
  private dialogZIndex: number;
  
  handleDialogState(isOpen: boolean): void;
  pauseAnimationsDuringDialog(): void;
  resumeAnimationsAfterDialog(): void;
  applyMobileOptimizations(): void;
  createDialogProtectionLayer(): void;
  manageRenderingLayers(): void;
  preventDialogDisappearance(): void;
}
```

### Dialog Stability Enhancement
- ダイアログ表示中のアニメーション制御強化
- 独立したレンダリングレイヤーによるダイアログ保護
- z-index とポジション固定の改善
- モーダル背景のイベント伝播制御
- GPU加速の適切な管理とレイヤー分離
- アニメーション実行中のダイアログ状態保持

### Flicker Prevention Strategy
```css
/* チラつき防止のCSS最適化 */
.bubble-canvas {
  will-change: transform;
  transform: translateZ(0); /* GPU加速強制 */
  backface-visibility: hidden;
  perspective: 1000px;
}

.dialog-overlay {
  position: fixed;
  z-index: 9999;
  isolation: isolate; /* 新しいスタッキングコンテキスト作成 */
  contain: layout style paint;
}

.animation-container {
  contain: layout style paint size;
  transform: translateZ(0);
}
```

## Enhanced Unique Role-Based Bubble System

### Advanced Duplicate Prevention
```typescript
interface EnhancedBubbleGenerator {
  generateUniqueRoleBubbles(person: Person): Bubble[];
  preventDuplicateDisplay(bubbles: Bubble[]): Bubble[];
  assignCategoryColors(bubbles: Bubble[]): Bubble[];
  createRoleBasedIdentifiers(person: Person): string[];
}

interface PersonRoleMapping {
  personName: string;
  roles: {
    lyricist: boolean;
    composer: boolean;
    arranger: boolean;
  };
  songs: string[];
  uniqueIdentifiers: string[]; // 役割別の一意ID
}

class RoleBasedBubbleManager {
  generateRoleSpecificBubbles(person: Person): Bubble[];
  ensureUniqueDisplay(bubbles: Bubble[]): Bubble[];
  applyCategoryColorScheme(bubbles: Bubble[]): Bubble[];
  createColorLegend(): LegendItem[];
}
```

### Enhanced Category Color System
```typescript
interface CategoryColorScheme {
  song: string;      // #FFB6C1 (ピンク)
  lyricist: string;  // #B6E5D8 (ライトブルー)
  composer: string;  // #DDA0DD (ライトパープル)
  arranger: string;  // #F0E68C (ライトイエロー)
  tag: string;       // #98FB98 (ライトグリーン)
}

interface ColorLegendComponent {
  position: 'top-right' | 'bottom-left' | 'bottom-right';
  isVisible: boolean;
  categories: CategoryLegendItem[];
  showCounts: boolean;
}

interface CategoryLegendItem {
  category: keyof CategoryColorScheme;
  color: string;
  label: string;
  icon?: string;
  count: number;
}
```

## Advanced Animation Configuration System

### Comprehensive Animation Settings
```typescript
interface AdvancedAnimationConfig {
  bubbleLifespan: {
    min: number;      // 最小寿命（秒）
    max: number;      // 最大寿命（秒）
    variance: number; // 寿命のばらつき係数
  };
  floatingSpeed: {
    min: number;      // 最小浮遊速度
    max: number;      // 最大浮遊速度
    acceleration: number; // 加速度係数
  };
  maxBubbleSize: {
    min: number;      // 最小最大サイズ
    max: number;      // 最大最大サイズ
    scaleFactor: number; // サイズスケール係数
  };
  randomnessFactor: number;     // ランダム性係数 (0-1)
  staggerDisappearance: {
    enabled: boolean;           // まばらな消失の有効化
    delayRange: {
      min: number;              // 最小消失遅延
      max: number;              // 最大消失遅延
    };
    pattern: 'random' | 'wave' | 'spiral'; // 消失パターン
  };
  appearanceAnimation: {
    duration: number;           // 出現アニメーション時間
    easing: string;            // イージング関数
    staggerDelay: number;      // 出現の時間差
  };
}

class AdvancedAnimationController {
  private config: AdvancedAnimationConfig;
  private activeAnimations: Map<string, Animation>;
  
  updateConfiguration(newConfig: Partial<AdvancedAnimationConfig>): void;
  applyRandomDisappearance(bubbles: Bubble[]): void;
  calculateStaggeredTiming(bubbleCount: number): number[];
  createNaturalDisappearancePattern(bubbles: Bubble[]): void;
  optimizeForMobile(): AdvancedAnimationConfig;
  pauseAnimationsForDialog(): void;
  resumeAnimationsAfterDialog(): void;
}
```

### Natural Disappearance Patterns
```typescript
interface DisappearancePattern {
  type: 'random' | 'wave' | 'spiral' | 'cascade';
  intensity: number;
  duration: number;
  affectedBubbles: string[];
}

class NaturalAnimationManager {
  createRandomDisappearance(bubbles: Bubble[]): DisappearancePattern;
  createWaveDisappearance(bubbles: Bubble[]): DisappearancePattern;
  createSpiralDisappearance(bubbles: Bubble[]): DisappearancePattern;
  applySmoothTransitions(pattern: DisappearancePattern): void;
}
```

## Enhanced Tag Management System

### Comprehensive Tag List Component
```typescript
interface EnhancedTagListComponent {
  displayTags(): TagListItem[];
  sortTags(sortBy: 'alphabetical' | 'frequency' | 'recent'): TagListItem[];
  filterTags(searchTerm: string): TagListItem[];
  getTaggedSongs(tagId: string): Song[];
  exportTagData(): TagExportData;
}

interface TagListView {
  layout: 'grid' | 'list' | 'cloud';
  showCounts: boolean;
  enableSearch: boolean;
  sortOptions: ('alphabetical' | 'frequency' | 'recent')[];
  groupByFirstLetter: boolean;
}

interface TagListItem {
  id: string;
  name: string;
  displayName: string; // #付きの表示名
  songCount: number;
  color: string;
  lastUsed: Date;
  popularity: number; // 使用頻度スコア
}

interface TagExportData {
  tags: TagListItem[];
  totalCount: number;
  exportDate: string;
  format: 'json' | 'csv';
}
```

### Tag List UI Components
```typescript
interface TagListScreen {
  header: TagListHeader;
  searchBar: TagSearchBar;
  sortControls: TagSortControls;
  tagGrid: TagGrid;
  tagDetails: TagDetailModal;
}

interface TagListHeader {
  title: string;
  totalTagCount: number;
  backButton: boolean;
}

interface TagSearchBar {
  placeholder: string;
  onSearch: (term: string) => void;
  clearButton: boolean;
}

interface TagSortControls {
  options: SortOption[];
  currentSort: string;
  onSortChange: (sort: string) => void;
}

interface TagGrid {
  tags: TagListItem[];
  layout: 'grid' | 'list';
  onTagClick: (tag: TagListItem) => void;
  itemsPerRow: number;
}
```

## Mobile-First UI Enhancement

### Simplified Header Design
```typescript
interface MobileFirstHeader {
  height: {
    mobile: number;    // 50px (従来の60pxから縮小)
    tablet: number;    // 60px
    desktop: number;   // 80px
  };
  content: {
    logo: LogoConfig;
    navigation: MobileNavigation;
    actions: HeaderAction[];
  };
}

interface LogoConfig {
  size: 'small' | 'medium' | 'large';
  showText: boolean;
  position: 'left' | 'center';
}

interface MobileNavigation {
  type: 'icons' | 'tabs' | 'bottom-bar';
  items: NavigationItem[];
  showLabels: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  view: string;
  isActive: boolean;
  badge?: number; // 通知バッジ
}
```

### Icon-Based Navigation System
```typescript
interface IconBasedNavigation {
  position: 'header' | 'bottom' | 'floating';
  items: [
    {
      id: 'bubbles',
      icon: 'bubble-chart',
      label: 'シャボン玉',
      primary: true,
      color: '#FFB6C1'
    },
    {
      id: 'add-song',
      icon: 'add-circle',
      label: '楽曲登録',
      color: '#B6E5D8'
    },
    {
      id: 'manage-songs',
      icon: 'list-alt',
      label: '楽曲管理',
      color: '#DDA0DD'
    },
    {
      id: 'tag-list',
      icon: 'local-offer',
      label: 'タグ一覧',
      color: '#98FB98'
    }
  ];
}
```

### Bubble Area Maximization
```css
/* モバイルファーストレイアウト */
.mobile-layout {
  --header-height: 50px;
  --navigation-height: 60px;
  --bubble-area-height: calc(100vh - var(--header-height) - var(--navigation-height));
}

.bubble-main-area {
  height: var(--bubble-area-height);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.mobile-header {
  height: var(--header-height);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(224, 224, 224, 0.3);
}

.mobile-navigation {
  height: var(--navigation-height);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(224, 224, 224, 0.3);
}
```