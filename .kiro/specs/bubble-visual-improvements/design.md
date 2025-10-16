# Design Document

## Overview

シャボン玉ビューアーの視覚的改善システムは、既存のMusic Bubble Explorerに対して、タイプ別の視覚的区別、重複排除、デバッグ情報の環境別制御を追加する拡張機能です。React.jsとCanvas APIを活用し、直感的で一意性のあるシャボン玉表示を実現します。

## Architecture

### Enhanced Bubble System
- **視覚的区別システム**: タイプ別のアイコン、色、形状管理
- **重複排除エンジン**: 表示中コンテンツの追跡と一意性保証
- **環境別UI制御**: 開発/本番環境の自動判別とUI切り替え
- **統合人物管理**: 複数役割を持つ人物の統合表示

### Data Enhancement
- **PersonRole統合**: 同一人物の複数役割を統合管理
- **BubbleRegistry**: 表示中シャボン玉の一意性管理
- **EnvironmentConfig**: 環境別設定の管理

## Components and Interfaces

### Enhanced Bubble Entity
```typescript
interface EnhancedBubble extends Bubble {
  visualType: 'song' | 'person' | 'tag';
  roles?: PersonRole[]; // 人物の場合の役割配列
  iconType: IconType;
  shapeType: ShapeType;
  isMultiRole: boolean;
}

interface PersonRole {
  type: 'lyricist' | 'composer' | 'arranger';
  songCount: number;
}

enum IconType {
  MUSIC_NOTE = 'music-note',     // 楽曲
  PEN = 'pen',                   // 作詞家
  MUSIC_SHEET = 'music-sheet',   // 作曲家
  MIXER = 'mixer',               // 編曲家
  HASHTAG = 'hashtag',           // タグ
  MULTI_ROLE = 'multi-role'      // 複数役割
}

enum ShapeType {
  CIRCLE = 'circle',
  ROUNDED_SQUARE = 'rounded-square',
  HEXAGON = 'hexagon',
  DIAMOND = 'diamond',
  STAR = 'star'
}
```

### Visual Distinction System
```typescript
interface VisualTheme {
  song: BubbleStyle;
  lyricist: BubbleStyle;
  composer: BubbleStyle;
  arranger: BubbleStyle;
  tag: BubbleStyle;
  multiRole: BubbleStyle;
}

interface BubbleStyle {
  primaryColor: string;
  secondaryColor: string;
  gradientDirection: number;
  iconType: IconType;
  shapeType: ShapeType;
  strokeWidth: number;
  strokeColor: string;
  shadowColor: string;
  shadowBlur: number;
}
```

### Bubble Registry System
```typescript
class BubbleRegistry {
  private displayedContent: Set<string>;
  private availableContent: Map<string, ContentItem>;
  
  registerBubble(contentId: string): void;
  unregisterBubble(contentId: string): void;
  isContentDisplayed(contentId: string): boolean;
  getAvailableContent(): ContentItem[];
  getNextUniqueContent(): ContentItem | null;
}

interface ContentItem {
  id: string;
  type: 'song' | 'person' | 'tag';
  name: string;
  roles?: PersonRole[];
  relatedCount: number;
}
```

### Person Consolidation System
```typescript
class PersonConsolidator {
  consolidatePersons(songs: Song[]): ConsolidatedPerson[];
  getPersonRoles(personName: string, songs: Song[]): PersonRole[];
  calculateTotalRelatedCount(person: ConsolidatedPerson): number;
}

interface ConsolidatedPerson {
  name: string;
  roles: PersonRole[];
  totalRelatedCount: number;
  songs: string[]; // 関連楽曲ID配列
}
```

### Environment Configuration System
```typescript
interface EnvironmentConfig {
  isDevelopment: boolean;
  showDebugInfo: boolean;
  showFPS: boolean;
  showResetButton: boolean;
  enableConsoleLogging: boolean;
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  
  detectEnvironment(): EnvironmentConfig;
  shouldShowDebugUI(): boolean;
  shouldLogToConsole(): boolean;
}
```

### Enhanced Bubble Manager
```typescript
class EnhancedBubbleManager extends BubbleManager {
  private registry: BubbleRegistry;
  private consolidator: PersonConsolidator;
  private visualTheme: VisualTheme;
  
  generateUniqueBubble(): EnhancedBubble | null;
  applyVisualStyle(bubble: EnhancedBubble): void;
  renderBubbleWithIcon(bubble: EnhancedBubble, ctx: CanvasRenderingContext2D): void;
  handleBubbleLifecycle(bubble: EnhancedBubble): void;
}
```

## Visual Design System

### Color Palette Enhancement
```css
:root {
  /* 楽曲 - 音符のイメージ */
  --song-primary: #FF6B9D;
  --song-secondary: #FFB3D1;
  --song-gradient: linear-gradient(135deg, #FF6B9D 0%, #FFB3D1 100%);
  
  /* 作詞家 - ペンのイメージ */
  --lyricist-primary: #4ECDC4;
  --lyricist-secondary: #A7E6E1;
  --lyricist-gradient: linear-gradient(135deg, #4ECDC4 0%, #A7E6E1 100%);
  
  /* 作曲家 - 楽譜のイメージ */
  --composer-primary: #A8E6CF;
  --composer-secondary: #D4F1E4;
  --composer-gradient: linear-gradient(135deg, #A8E6CF 0%, #D4F1E4 100%);
  
  /* 編曲家 - ミキサーのイメージ */
  --arranger-primary: #FFD93D;
  --arranger-secondary: #FFEB99;
  --arranger-gradient: linear-gradient(135deg, #FFD93D 0%, #FFEB99 100%);
  
  /* タグ - ハッシュタグのイメージ */
  --tag-primary: #B8A9FF;
  --tag-secondary: #D6CCFF;
  --tag-gradient: linear-gradient(135deg, #B8A9FF 0%, #D6CCFF 100%);
  
  /* 複数役割 - 虹色のイメージ */
  --multi-role-gradient: linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 25%, #A8E6CF 50%, #FFD93D 75%, #B8A9FF 100%);
}
```

### Icon System Design
```typescript
interface IconRenderer {
  renderMusicNote(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
  renderPen(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
  renderMusicSheet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
  renderMixer(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
  renderHashtag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
  renderMultiRole(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void;
}
```

### Shape Rendering System
```typescript
interface ShapeRenderer {
  renderCircle(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void;
  renderRoundedSquare(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void;
  renderHexagon(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void;
  renderDiamond(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void;
  renderStar(ctx: CanvasRenderingContext2D, bubble: EnhancedBubble): void;
}
```

## Duplicate Prevention Strategy

### Content Tracking Algorithm
```typescript
class ContentTracker {
  private displayedItems: Map<string, {
    contentId: string;
    bubbleId: string;
    timestamp: number;
  }>;
  
  trackBubble(bubble: EnhancedBubble): void;
  untrackBubble(bubbleId: string): void;
  isContentAvailable(contentId: string): boolean;
  getAvailableContentPool(): ContentItem[];
}
```

### Unique Selection Algorithm
1. **Available Pool Management**: 表示中でないコンテンツのプール管理
2. **Weighted Selection**: 関連度や重要度に基づく重み付き選択
3. **Rotation Strategy**: 全コンテンツが均等に表示される回転戦略
4. **Fallback Handling**: 利用可能コンテンツがない場合の処理

## Environment Detection System

### Development vs Production Detection
```typescript
class EnvironmentDetector {
  detectEnvironment(): EnvironmentConfig {
    const isDev = process.env.NODE_ENV === 'development' || 
                  window.location.hostname === 'localhost' ||
                  window.location.hostname.includes('127.0.0.1') ||
                  window.location.search.includes('debug=true');
    
    return {
      isDevelopment: isDev,
      showDebugInfo: isDev,
      showFPS: isDev,
      showResetButton: isDev,
      enableConsoleLogging: isDev
    };
  }
}
```

### Debug UI Components
```typescript
interface DebugUIProps {
  show: boolean;
  fps?: number;
  bubbleCount?: number;
  onReset?: () => void;
}

const DebugUI: React.FC<DebugUIProps> = ({ show, fps, bubbleCount, onReset }) => {
  if (!show) return null;
  
  return (
    <div className="debug-overlay">
      <div className="debug-info">
        <span>FPS: {fps}</span>
        <span>Bubbles: {bubbleCount}</span>
      </div>
      <button onClick={onReset} className="reset-button">
        Reset Status
      </button>
    </div>
  );
};
```

## Person Consolidation Algorithm

### Multi-Role Detection
```typescript
class RoleConsolidator {
  consolidateRoles(songs: Song[]): ConsolidatedPerson[] {
    const personMap = new Map<string, Set<PersonRole>>();
    
    // 全楽曲から人物と役割を抽出
    songs.forEach(song => {
      this.extractPersonRoles(song, personMap);
    });
    
    // 複数役割を持つ人物を統合
    return Array.from(personMap.entries()).map(([name, roles]) => ({
      name,
      roles: Array.from(roles),
      totalRelatedCount: this.calculateTotalCount(name, songs),
      songs: this.getRelatedSongs(name, songs)
    }));
  }
  
  private extractPersonRoles(song: Song, personMap: Map<string, Set<PersonRole>>): void {
    // 作詞家、作曲家、編曲家の役割を抽出・統合
  }
}
```

### Visual Representation for Multi-Role
- **複合グラデーション**: 複数の役割色を組み合わせたグラデーション
- **複合アイコン**: 複数の役割アイコンを組み合わせた表示
- **特殊形状**: 星形やダイヤモンド形で複数役割を表現

## Performance Considerations

### Rendering Optimization
1. **Icon Caching**: アイコンの事前レンダリングとキャッシュ
2. **Shape Optimization**: 複雑な形状の描画最適化
3. **Gradient Caching**: グラデーションパターンのキャッシュ
4. **Selective Rendering**: 変更された要素のみの再描画

### Memory Management
1. **Registry Cleanup**: 不要になったレジストリエントリの削除
2. **Icon Resource Management**: アイコンリソースの効率的管理
3. **Event Listener Optimization**: イベントリスナーの適切なクリーンアップ

## Testing Strategy

### Visual Testing
- **スクリーンショット比較**: 各タイプのシャボン玉の視覚的確認
- **色彩検証**: カラーパレットの正確性確認
- **アイコン表示テスト**: 各アイコンの正確な描画確認

### Functional Testing
- **重複防止テスト**: 同一コンテンツの重複表示防止確認
- **環境切り替えテスト**: 開発/本番環境での適切なUI表示確認
- **統合表示テスト**: 複数役割人物の正確な統合表示確認

### Integration Testing
- **既存システム連携**: 既存のBubbleManagerとの互換性確認
- **データ整合性**: PersonConsolidatorの正確性確認
- **パフォーマンステスト**: 大量データでの動作確認

## Error Handling

### Visual Rendering Errors
- **アイコン描画失敗**: フォールバック形状での表示
- **色彩適用エラー**: デフォルトカラーでの代替表示
- **形状描画エラー**: 基本円形での代替表示

### Data Consolidation Errors
- **人物統合エラー**: 個別表示へのフォールバック
- **役割抽出エラー**: 基本タイプでの表示継続
- **レジストリエラー**: 重複チェックの無効化と警告表示

## Migration Strategy

### Existing System Integration
1. **段階的導入**: 既存システムを破壊せずに新機能を追加
2. **後方互換性**: 既存のBubbleインターフェースとの互換性維持
3. **設定可能な有効化**: 新機能のオン/オフ切り替え可能
4. **データマイグレーション**: 既存データの新形式への変換