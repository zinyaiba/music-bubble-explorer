# 設計文書

## 概要

この設計文書は、Music Bubble Explorerアプリケーションのナビゲーション改善とユーザ探索体験向上の技術的アプローチを定義します。主要な改善領域は、タグ一覧・タグ詳細画面の別画面化によるパフォーマンス向上と、シャボン玉詳細ダイアログからの継続的な楽曲探索機能の実装です。この設計は、現在のダイアログベースの表示から完全な画面遷移システムへの移行を目的としています。

## アーキテクチャ

### 現在のアーキテクチャ分析

現在のアプリケーションは以下の構造を持っています：

```
App.tsx (メインコンポーネント)
├── MobileFirstLayout (レイアウトコンテナ)
│   ├── BubbleCanvas (シャボン玉領域 - 常時表示)
│   └── 各種ダイアログ (モーダル表示)
│       ├── EnhancedTagList (タグ一覧ダイアログ)
│       ├── DetailModal (シャボン玉詳細ダイアログ)
│       ├── SongRegistrationForm (楽曲登録ダイアログ)
│       └── SongManagement (楽曲編集ダイアログ)
```

### 改善後のアーキテクチャ

```
App.tsx (メインコンポーネント)
├── Router (画面遷移管理)
│   ├── MainScreen (メイン画面)
│   │   ├── MobileFirstLayout
│   │   ├── BubbleCanvas (シャボン玉領域)
│   │   └── DetailModal (拡張版 - 継続探索機能付き)
│   ├── TagListScreen (タグ一覧画面 - 独立)
│   └── TagDetailScreen (タグ詳細画面 - 独立)
└── NavigationManager (画面遷移とパフォーマンス管理)
```

## コンポーネントとインターフェース

### 1. 画面遷移システムの設計

#### NavigationManager の新規作成
- **目的**: 画面遷移の管理とパフォーマンス最適化
- **機能**:
  - 画面遷移の制御
  - シャボン玉アニメーションの停止/再開
  - メモリ使用量の最適化
  - 遷移履歴の管理

```typescript
class NavigationManager {
  private currentScreen: ScreenType
  private navigationHistory: ScreenType[]
  private bubbleAnimationRef: React.RefObject<BubbleCanvas>
  
  navigateToScreen(screen: ScreenType): void
  goBack(): void
  pauseBubbleAnimation(): void
  resumeBubbleAnimation(): void
  optimizeMemoryUsage(): void
}

type ScreenType = 'main' | 'tag-list' | 'tag-detail'
```

#### ScreenRouter の新規作成
- **目的**: React Router風の画面管理システム
- **機能**:
  - 画面コンポーネントの動的レンダリング
  - URLパラメータの管理（将来的な拡張用）
  - 画面遷移アニメーション

```typescript
interface ScreenRouterProps {
  currentScreen: ScreenType
  screenProps: Record<string, any>
  onNavigate: (screen: ScreenType, props?: any) => void
}

const ScreenRouter: React.FC<ScreenRouterProps>
```

### 2. 独立画面コンポーネントの設計

#### TagListScreen の新規作成
- **目的**: タグ一覧の独立画面表示
- **設計決定**: 現在の `EnhancedTagList` をベースに、フルスクリーン対応版を作成
- **機能**:
  - ガラスモーフィズムデザインの適用
  - タグ検索機能の維持
  - タグ詳細画面への遷移

```typescript
interface TagListScreenProps {
  onTagSelect: (tagId: string) => void
  onBack: () => void
}

const TagListScreen: React.FC<TagListScreenProps> = ({
  onTagSelect,
  onBack
}) => {
  return (
    <div className="screen-container tag-list-screen">
      <ScreenHeader title="🏷️ タグ一覧" onBack={onBack} />
      <div className="screen-content glassmorphism-container">
        {/* 既存のタグ一覧機能を移植 */}
      </div>
    </div>
  )
}
```

#### TagDetailScreen の新規作成
- **目的**: タグ詳細の独立画面表示
- **設計決定**: 現在のタグ詳細ダイアログ機能をフルスクリーン化
- **機能**:
  - 関連楽曲の表示
  - 楽曲フィルタリング機能
  - シャボン玉詳細への遷移

```typescript
interface TagDetailScreenProps {
  tagId: string
  onSongSelect: (bubble: BubbleEntity) => void
  onBack: () => void
}

const TagDetailScreen: React.FC<TagDetailScreenProps>
```

### 3. 拡張DetailModalの設計

#### EnhancedDetailModal の拡張
- **目的**: 継続的探索機能の実装
- **設計決定**: 現在の `DetailModal` を拡張し、階層的なダイアログ管理を追加
- **機能**:
  - 楽曲・作詞・作曲・編曲の詳細表示
  - タグ詳細画面への遷移
  - ダイアログ階層の管理

```typescript
interface DetailModalState {
  primaryBubble: BubbleEntity | null
  secondaryBubble: BubbleEntity | null
  modalStack: BubbleEntity[]
  currentLevel: number
}

interface EnhancedDetailModalProps {
  selectedBubble: BubbleEntity | null
  onClose: () => void
  onTagNavigate: (tagId: string) => void
  onBubbleNavigate: (bubble: BubbleEntity) => void
}

const EnhancedDetailModal: React.FC<EnhancedDetailModalProps>
```

#### ModalStackManager の新規作成
- **目的**: ダイアログの階層管理
- **機能**:
  - ダイアログスタックの管理
  - 戻る操作の制御
  - 視覚的階層表示

```typescript
class ModalStackManager {
  private modalStack: BubbleEntity[]
  private currentLevel: number
  
  pushModal(bubble: BubbleEntity): void
  popModal(): BubbleEntity | null
  getCurrentLevel(): number
  getStackDepth(): number
  clearStack(): void
}
```

### 4. パフォーマンス最適化システム

#### ScreenPerformanceManager の新規作成
- **目的**: 画面遷移時のパフォーマンス最適化
- **機能**:
  - シャボン玉アニメーションの制御
  - メモリ使用量の監視
  - 不要な処理の停止

```typescript
class ScreenPerformanceManager {
  private animationController: AnimationController
  private memoryMonitor: MemoryMonitor
  
  pauseAnimations(): void
  resumeAnimations(): void
  optimizeMemoryForScreen(screen: ScreenType): void
  cleanupUnusedResources(): void
}

interface AnimationController {
  pause(): void
  resume(): void
  isRunning(): boolean
}
```

## データモデル

### 1. 画面遷移状態管理

```typescript
interface NavigationState {
  currentScreen: ScreenType
  previousScreen: ScreenType | null
  screenHistory: ScreenType[]
  screenProps: Record<ScreenType, any>
  isTransitioning: boolean
  transitionDirection: 'forward' | 'backward'
}

interface ScreenTransition {
  from: ScreenType
  to: ScreenType
  props?: any
  timestamp: number
  duration?: number
}
```

### 2. 継続的探索状態管理

```typescript
interface ExplorationState {
  currentBubble: BubbleEntity | null
  explorationPath: BubbleEntity[]
  relatedBubbles: BubbleEntity[]
  explorationDepth: number
  maxDepth: number
}

interface ExplorationHistory {
  sessionId: string
  startTime: number
  explorationPath: {
    bubble: BubbleEntity
    timestamp: number
    source: 'click' | 'related' | 'tag'
  }[]
  totalExploredItems: number
}
```

### 3. パフォーマンス監視データ

```typescript
interface PerformanceMetrics {
  screenTransitionTime: number
  memoryUsage: {
    before: number
    after: number
    peak: number
  }
  animationFrameRate: number
  renderTime: number
  userInteractionDelay: number
}

interface ScreenPerformanceProfile {
  screenType: ScreenType
  loadTime: number
  memoryFootprint: number
  animationStatus: 'running' | 'paused' | 'stopped'
  optimizationLevel: 'none' | 'basic' | 'aggressive'
}
```

## エラーハンドリング

### 1. 画面遷移エラー処理

```typescript
class NavigationErrorHandler {
  handleTransitionError(error: NavigationError): void
  recoverFromFailedTransition(): void
  fallbackToSafeScreen(): void
  preserveUserContext(): void
}

interface NavigationError {
  type: 'transition_failed' | 'screen_load_error' | 'memory_error'
  screen: ScreenType
  message: string
  recoverable: boolean
}
```

### 2. 継続的探索エラー処理

```typescript
class ExplorationErrorHandler {
  handleBubbleLoadError(bubbleId: string): void
  recoverFromCorruptedPath(): void
  resetExplorationState(): void
  preserveExplorationHistory(): void
}
```

### 3. パフォーマンスエラー処理

```typescript
class PerformanceErrorHandler {
  handleMemoryPressure(): void
  handleAnimationFailure(): void
  applyEmergencyOptimizations(): void
  gracefulDegradation(): void
}
```

## テスト戦略

### 1. 画面遷移テスト
- **単体テスト**: 各画面コンポーネントの独立動作確認
- **統合テスト**: 画面間の遷移動作確認
- **パフォーマンステスト**: 遷移時のメモリ使用量とレスポンス時間測定
- **ユーザビリティテスト**: 直感的な操作性の確認

### 2. 継続的探索機能テスト
- **機能テスト**: ダイアログ階層の正常動作確認
- **データ整合性テスト**: 関連データの正確な表示確認
- **ナビゲーションテスト**: 戻る操作とスタック管理の確認

### 3. パフォーマンステスト
- **メモリリークテスト**: 画面遷移時のメモリ解放確認
- **アニメーション制御テスト**: 停止/再開の正常動作確認
- **レスポンス時間テスト**: ユーザー操作の応答性確認

## 実装フェーズ

### フェーズ1: 基盤システム構築
1. NavigationManager の実装
2. ScreenRouter の実装
3. 基本的な画面遷移システムの構築

### フェーズ2: 独立画面の実装
1. TagListScreen の実装
2. TagDetailScreen の実装
3. 既存機能の移植と最適化

### フェーズ3: 継続的探索機能の実装
1. EnhancedDetailModal の拡張
2. ModalStackManager の実装
3. 関連データの動的取得機能

### フェーズ4: パフォーマンス最適化
1. ScreenPerformanceManager の実装
2. メモリ最適化の適用
3. アニメーション制御の実装

## 設計決定と根拠

### 1. 完全な画面遷移システムの採用
- **決定**: ダイアログベースから独立画面への移行
- **根拠**: パフォーマンス問題の根本的解決とユーザビリティの向上
- **トレードオフ**: 実装複雑度の増加 vs パフォーマンス向上

### 2. 階層的ダイアログシステムの維持
- **決定**: シャボン玉詳細は引き続きダイアログとして実装
- **根拠**: 継続的探索機能に最適な UI パターン
- **実装**: スタック管理による階層制御

### 3. パフォーマンス優先の設計
- **決定**: 画面遷移時のアニメーション停止
- **根拠**: ユーザー体験の向上とデバイス負荷軽減
- **実装**: 自動的な最適化とユーザー制御の両立

### 4. 既存機能の完全保持
- **決定**: すべての既存機能を新システムで利用可能
- **根拠**: ユーザーの学習コストを最小化
- **実装**: 段階的移行とフォールバック機能

## 技術的考慮事項

### 1. メモリ管理
- **コンポーネントの適切なアンマウント**: 画面遷移時の確実なクリーンアップ
- **イベントリスナーの管理**: メモリリークの防止
- **大量データの処理**: 仮想化とページネーション

### 2. アクセシビリティ
- **キーボードナビゲーション**: 全画面でのキーボード操作対応
- **スクリーンリーダー**: 画面遷移の適切な通知
- **フォーカス管理**: 画面遷移時のフォーカス制御

### 3. レスポンシブデザイン
- **モバイル最適化**: タッチ操作に適したインターフェース
- **画面サイズ対応**: 各デバイスでの最適な表示
- **オリエンテーション対応**: 縦横回転への適切な対応

### 4. 将来的な拡張性
- **ルーティングシステム**: URL ベースのナビゲーション対応準備
- **状態管理**: Redux/Zustand 等への移行準備
- **API 統合**: 外部データソースとの連携準備

## 監視とメトリクス

### 1. ユーザー行動メトリクス
- **画面遷移パターン**: ユーザーの典型的な操作フロー
- **探索深度**: 継続的探索機能の利用状況
- **滞在時間**: 各画面での平均滞在時間

### 2. パフォーマンスメトリクス
- **画面遷移時間**: 各遷移の所要時間
- **メモリ使用量**: 画面別のメモリフットプリント
- **フレームレート**: アニメーション品質の維持状況

### 3. エラーメトリクス
- **遷移失敗率**: 画面遷移の成功率
- **データ読み込みエラー**: 関連データの取得失敗率
- **パフォーマンス警告**: メモリ不足等の発生頻度