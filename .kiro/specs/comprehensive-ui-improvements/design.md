# 設計文書

## 概要

この設計文書は、Music Bubble Explorerアプリケーションの包括的なUI改善の技術的アプローチを定義します。主要な改善領域は、UI構造のシンプル化、モバイルレイアウトの安定性、Safari互換性の強化、パフォーマンス最適化、レイアウト標準化、およびキャッシュバスティングの実装です。この設計は、ユーザビリティの向上、クロスブラウザ互換性の確保、および長期的な保守性の向上を目的としています。

## アーキテクチャ

### 現在のアーキテクチャ分析

現在のアプリケーションは以下の構造を持っています：

```
App.tsx (メインコンポーネント)
├── MobileFirstLayout (レイアウトコンテナ)
│   ├── MobileFirstHeader (ヘッダー - 固定表示)
│   ├── MainSection (メインコンテンツ)
│   │   ├── BubbleCanvas (シャボン玉領域)
│   │   └── AppInstructions (ヘルプメッセージ)
│   └── MobileFirstNavigation (フッター - モバイルで固定)
└── 各種ダイアログ (モーダル表示)
```

### 改善後のアーキテクチャ

```
App.tsx (メインコンポーネント)
├── MobileFirstLayout (レイアウトコンテナ)
│   ├── ScrollableMainSection (スクロール可能なメインセクション)
│   │   ├── MobileFirstHeader (ヘッダー - スクロール対象)
│   │   ├── BubbleCanvas (シャボン玉領域)
│   │   └── AppInstructions (ヘルプメッセージ)
│   └── MobileFirstNavigation (フッター - モバイルで固定)
└── 各種ダイアログ (統一レイアウト)
```

## コンポーネントとインターフェース

### 1. レイアウト構造の再設計

#### MobileFirstLayout の改修
- **目的**: ヘッダーをスクロール可能領域に移動
- **変更点**:
  - ヘッダーの固定表示を解除
  - メインセクションにヘッダーを含める
  - スクロール動作の統一

#### ScrollableMainSection の新規作成
- **目的**: ヘッダー + シャボン玉領域 + ヘルプメッセージの統一スクロール
- **機能**:
  - 縦スクロール対応
  - Safari互換性の確保
  - パフォーマンス最適化

### 2. Safari互換性の強化

#### SafariHeaderFix の拡張
- **現在の問題**: Safariでヘッダーが表示されない問題が発生
- **設計決定**: 段階的なフォールバック戦略を採用し、Safari各バージョンに対応
- **解決策**:
  - Safari検出ロジックの改善（バージョン別対応）
  - CSS強制表示ルールの追加
  - 動的な表示確認とフォールバック機能
  - Safari専用CSSファイルの分離

#### 実装アプローチ
```typescript
// Safari検出とヘッダー修正の強化
class SafariCompatibilityManager {
  private safariVersion: string | null = null
  
  detectSafariVersion(): string | null {
    const userAgent = navigator.userAgent
    const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/)
    return safariMatch ? safariMatch[1] : null
  }
  
  applySafariHeaderFix(): void {
    if (this.isSafari()) {
      // バージョン別の修正適用
      // 強制表示ルールの適用
      // 動的スタイル注入
      // 定期的な表示確認
    }
  }
  
  validateHeaderVisibility(): boolean {
    // ヘッダー要素の可視性確認
    // フォールバック処理の実行
  }
}
```

#### Safari専用CSS設計
- **ファイル分離**: `safari-compatibility.css`として独立管理
- **動的ビューポート**: Safari特有のビューポート問題への対応
- **セーフエリア**: iPhone Xシリーズ以降のセーフエリア対応
- **アクセシビリティ**: Safari環境でのアクセシビリティ機能維持

### 3. モバイルレイアウト安定化

#### ResponsiveLayoutManager の新規作成
- **目的**: ページリフレッシュ後のレイアウト崩れ防止
- **機能**:
  - デバイス種別の永続化
  - レイアウト状態の復元
  - 動的サイズ調整の制御

#### 実装戦略
```typescript
class ResponsiveLayoutManager {
  private deviceType: 'mobile' | 'desktop'
  private layoutState: LayoutState
  
  detectAndPersistDevice(): void
  restoreLayoutState(): void
  preventLayoutFlicker(): void
}
```

### 4. パフォーマンス最適化と安定性システム

#### 自動リフレッシュ問題の解決
- **現在の問題**: 予期しない自動ページリフレッシュが発生
- **設計決定**: POSTリクエストエラーの根本原因を特定し、エラーハンドリングを強化
- **解決策**:
  - 認証関連エラーの適切な処理
  - ネットワークエラーのリトライ機能
  - ユーザー状態の永続化
  - エラー発生時のグレースフルな処理

#### BubblePerformanceOptimizer の拡張
- **目的**: CPU使用率削減と発熱防止
- **設計決定**: 段階的な最適化レベルを提供し、ユーザーが制御可能
- **機能**:
  - アニメーションフレームレート制御
  - GPU加速の最適化
  - メモリ使用量監視
  - 発熱検出と自動調整

#### PerformanceMonitor の新規作成
- **機能**:
  - リアルタイムパフォーマンス監視
  - 自動最適化の実行
  - ユーザー向け制御オプション
  - 長時間使用時のメモリ最適化

#### ユーザー向けパフォーマンス制御
- **設計決定**: 発熱問題を経験するユーザー向けに明示的な制御を提供
- **機能**:
  - パフォーマンス設定画面
  - 自動最適化のオン/オフ
  - 手動最適化レベル調整
  - 遅延読み込みの制御

### 5. レイアウト標準化システム

#### UnifiedLayoutSystem の拡張
- **目的**: 全画面の統一レイアウト適用
- **対象画面**:
  - タグ一覧画面
  - 楽曲編集画面
  - 楽曲登録画面

#### 標準レイアウトテンプレート
```typescript
interface StandardLayoutProps {
  title: string
  content: ReactNode
  actions?: ReactNode
  size: 'standard' | 'large'
}

const StandardLayout: React.FC<StandardLayoutProps>
```

### 6. キャッシュバスティングシステム

#### CacheBustingManager の新規作成
- **目的**: 自動的なキャッシュ無効化
- **機能**:
  - ビルド時のハッシュ生成
  - 動的アセット読み込み
  - ブラウザ互換性の確保

## データモデル

### 1. レイアウト状態管理

```typescript
interface LayoutState {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  screenSize: {
    width: number
    height: number
  }
  orientation: 'portrait' | 'landscape'
  safariVersion?: string
  lastUpdated: number
  isStable: boolean // レイアウト安定性フラグ
}

interface PerformanceState {
  cpuUsage: number
  memoryUsage: number
  frameRate: number
  heatLevel: 'low' | 'medium' | 'high'
  optimizationLevel: number
  userPreferences: {
    autoOptimization: boolean
    maxFrameRate: number
    enableGPUAcceleration: boolean
  }
}

interface SafariCompatibilityState {
  version: string
  hasHeaderIssue: boolean
  appliedFixes: string[]
  fallbackMode: boolean
}
```

### 2. キャッシュ管理

```typescript
interface CacheManifest {
  version: string
  buildHash: string
  assets: {
    css: string[]
    js: string[]
    images: string[]
  }
  timestamp: number
  browserCompatibility: {
    safari: boolean
    chrome: boolean
    firefox: boolean
    edge: boolean
  }
}

interface CacheBustingConfig {
  enabled: boolean
  strategy: 'hash' | 'timestamp' | 'version'
  fileTypes: string[]
  cacheHeaders: Record<string, string>
}
```

### 3. 標準レイアウト管理

```typescript
interface StandardLayoutConfig {
  template: 'tag-registration' | 'unified'
  title: string
  showBackButton: boolean
  showActions: boolean
  responsive: boolean
}

interface LayoutTemplate {
  id: string
  name: string
  components: {
    header: boolean
    content: boolean
    actions: boolean
    footer: boolean
  }
  styles: string[]
}
```

## エラーハンドリング

### 1. レイアウト復旧システム

```typescript
class LayoutRecoverySystem {
  detectLayoutFailure(): boolean
  attemptLayoutRecovery(): Promise<boolean>
  fallbackToSafeLayout(): void
  preserveUserState(): void // ユーザー入力とメニュー状態の保持
  preventLayoutFlicker(): void // 画面ちらつき防止
}
```

### 2. 自動リフレッシュ防止システム

```typescript
class RefreshPreventionSystem {
  interceptPOSTErrors(): void
  handleAuthenticationErrors(): void
  preserveApplicationState(): void
  implementGracefulErrorHandling(): void
  retryFailedRequests(): Promise<boolean>
}
```

### 3. パフォーマンス監視とフォールバック

```typescript
class PerformanceGuard {
  monitorPerformance(): void
  detectOverheating(): boolean
  applyEmergencyOptimizations(): void
  adjustFrameRate(targetFPS: number): void
  optimizeMemoryUsage(): void
}
```

### 4. Safari互換性フォールバック

```typescript
class SafariCompatibilityLayer {
  detectSafariIssues(): string[]
  applyCompatibilityFixes(): void
  provideFallbackExperience(): void
  ensureHeaderVisibility(): boolean
  maintainAccessibilityFeatures(): void
}
```

### 5. キャッシュバスティング エラーハンドリング

```typescript
class CacheErrorHandler {
  detectCacheIssues(): boolean
  fallbackToNonCachedAssets(): void
  validateAssetIntegrity(): boolean
  handleBrowserIncompatibility(): void
}
```

## テスト戦略

### 1. レイアウトテスト
- **単体テスト**: 各レイアウトコンポーネントの動作確認
- **統合テスト**: レイアウト切り替えの動作確認
- **視覚回帰テスト**: レイアウト変更の影響確認
- **レスポンシブテスト**: モバイル・デスクトップでの一貫性確認
- **リフレッシュ後安定性テスト**: ページリロード後のレイアウト維持確認

### 2. Safari互換性テスト
- **ヘッダー表示テスト**: Safari各バージョンでのヘッダー可視性確認
- **機能テスト**: Safari環境での全機能動作確認
- **アクセシビリティテスト**: Safari環境でのアクセシビリティ機能確認
- **自動修正テスト**: Safari固有問題の自動修正機能確認

### 3. パフォーマンステスト
- **負荷テスト**: 長時間使用時のパフォーマンス確認
- **メモリリークテスト**: メモリ使用量の監視
- **発熱テスト**: デバイス温度の監視
- **CPU使用率テスト**: シャボン玉アニメーション最適化の効果確認
- **フレームレートテスト**: アニメーション品質の維持確認

### 4. 安定性テスト
- **自動リフレッシュ防止テスト**: 予期しないリフレッシュの発生確認
- **エラーハンドリングテスト**: 各種エラー状況での適切な処理確認
- **状態保持テスト**: ユーザー入力とメニュー状態の永続化確認

### 5. キャッシュバスティングテスト
- **ブラウザ互換性テスト**: 各ブラウザでのキャッシュ無効化確認
- **アセット更新テスト**: CSS/JS更新の自動反映確認
- **パフォーマンス影響テスト**: キャッシュバスティングの性能影響確認

### 6. ユーザビリティテスト
- **タスク完了率テスト**: 各機能の使用成功率測定
- **標準化レイアウトテスト**: 統一されたレイアウトの使いやすさ確認
- **アクセシビリティテスト**: キーボードナビゲーションとスクリーンリーダー対応確認

## 実装フェーズ

### フェーズ1: 基盤整備
1. レイアウト構造の再設計
2. Safari互換性の強化
3. パフォーマンス監視システムの構築

### フェーズ2: 機能実装
1. モバイルレイアウト安定化
2. レイアウト標準化の適用
3. キャッシュバスティングの実装

### フェーズ3: 最適化と検証
1. パフォーマンス最適化の適用
2. 包括的なテストの実行
3. ユーザビリティの検証

### 7. タグ一覧画面の完全再構築システム

#### 既存コードの完全削除と再構築
- **目的**: 複雑化したタグ一覧画面のクリーンな再実装
- **対象ファイル**:
  - `src/components/EnhancedTagList.tsx` - 完全書き換え
  - `src/components/EnhancedTagList.css` - 完全書き換え
- **アプローチ**: 既存のレイアウト関連コードを削除し、StandardLayoutテンプレートベースで再構築

#### 統一レイアウトの適用（タグ登録画面と完全に同じ構成）
```typescript
// 新しいタグ一覧コンポーネント構造（タグ登録画面と同じStandardLayoutテンプレート使用）
interface TagListProps {
  isVisible: boolean
  onClose: () => void
  onTagClick?: (tag: TagListItem) => void
  onTagDetailOpen?: (bubble: BubbleEntity) => void
}

const TagList: React.FC<TagListProps> = (props) => {
  return (
    <StandardLayout
      isVisible={props.isVisible}
      onClose={props.onClose}
      title="🏷️ タグ一覧"
      size="standard"
      mobileOptimized={true}
    >
      {/* タグ一覧の新しい実装 - タグ登録画面と同じタイトル部・ボディ部構成 */}
    </StandardLayout>
  )
}
```

### 8. 楽曲管理統合システム

#### 既存コードの完全削除と再構築
- **目的**: 複雑化した楽曲編集・楽曲登録画面のクリーンな再実装
- **対象ファイル**:
  - `src/components/SongManagement.tsx` - 完全書き換え
  - `src/components/SongManagement.css` - 完全書き換え
  - `src/components/SongRegistrationForm.tsx` - 完全書き換え
  - `src/components/SongRegistrationForm.css` - 完全書き換え
- **アプローチ**: 既存のレイアウト関連コードを削除し、StandardLayoutテンプレートベースで統合画面として再構築

#### メニュー統合の設計
- **統合前**: 「楽曲登録」「楽曲編集」の2つの独立したメニュー
- **統合後**: 「楽曲管理」1つのメニューで両機能にアクセス
- **実装方式**: タブ切り替えで両機能を1つの画面に統合

#### 楽曲管理統合コンポーネント（タグ登録画面と完全に同じ構成）
```typescript
interface UnifiedSongManagementProps {
  isVisible: boolean
  onClose: () => void
  initialMode?: 'register' | 'edit'
}

const UnifiedSongManagement: React.FC<UnifiedSongManagementProps> = ({
  isVisible,
  onClose,
  initialMode = 'edit'
}) => {
  const [currentMode, setCurrentMode] = useState<'register' | 'edit'>(initialMode)
  
  return (
    <StandardLayout
      isVisible={isVisible}
      onClose={onClose}
      title="🎵 楽曲管理"
      size="large"
      mobileOptimized={true}
    >
      {/* タグ登録画面と同じタイトル部・ボディ部構成を踏襲 */}
      <div className="song-management-tabs">
        <button 
          className={currentMode === 'edit' ? 'active' : ''}
          onClick={() => setCurrentMode('edit')}
        >
          楽曲編集
        </button>
        <button 
          className={currentMode === 'register' ? 'active' : ''}
          onClick={() => setCurrentMode('register')}
        >
          楽曲登録
        </button>
      </div>
      
      {currentMode === 'edit' && <SongEditingInterface />}
      {currentMode === 'register' && <SongRegistrationInterface />}
    </StandardLayout>
  )
}
```

### 9. ナビゲーション再構築システム

#### 新しいメニュー構造
```typescript
interface NavigationItem {
  id: string
  label: string
  icon: string
  isEnabled: boolean
  order: number
  onClick: () => void
}

const navigationItems: NavigationItem[] = [
  {
    id: 'tag-registration',
    label: 'タグ登録',
    icon: '🏷️➕',
    isEnabled: true,
    order: 1,
    onClick: handleOpenTagRegistration
  },
  {
    id: 'tag-list',
    label: 'タグ一覧',
    icon: '🏷️',
    isEnabled: true,
    order: 2,
    onClick: handleOpenTagList
  },
  {
    id: 'song-list',
    label: '楽曲一覧',
    icon: '🎵📋',
    isEnabled: false, // 非活性
    order: 3,
    onClick: () => {} // 何もしない
  },
  {
    id: 'song-management',
    label: '楽曲管理',
    icon: '🎵⚙️',
    isEnabled: true,
    order: 4,
    onClick: handleOpenSongManagement
  }
]
```

#### 非活性ボタンの視覚デザイン
```css
.nav-button--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-button--disabled:hover {
  transform: none;
  box-shadow: none;
}
```

## 設計決定と根拠

### 1. UI構造のシンプル化
- **決定**: ヘッダーを固定表示からスクロール可能領域に移動
- **根拠**: ユーザビリティテストで固定ヘッダーがコンテンツ領域を圧迫していることが判明
- **トレードオフ**: ナビゲーションアクセスが若干低下するが、コンテンツ表示領域が拡大

### 2. Safari互換性の段階的対応
- **決定**: バージョン別の段階的フォールバック戦略を採用
- **根拠**: Safari各バージョンで異なる問題が発生するため、一律の対応では不十分
- **実装**: 検出→修正→検証→フォールバックの4段階プロセス

### 3. パフォーマンス制御のユーザー委譲
- **決定**: 自動最適化に加えて、ユーザーが手動制御可能な仕組みを提供
- **根拠**: デバイス性能や使用環境が多様で、一律の最適化では対応困難
- **利点**: ユーザーが自身の環境に最適な設定を選択可能

### 4. レイアウト標準化のテンプレート方式
- **決定**: タグ登録画面をベースとした統一テンプレートを採用
- **根拠**: 既存の画面で最も洗練されたデザインを持つため
- **実装**: 既存機能を維持しながら段階的に適用

### 5. キャッシュバスティングの自動化
- **決定**: ビルド時の自動ハッシュ生成とブラウザ互換性の両立
- **根拠**: 手動でのキャッシュクリアはユーザビリティを損なう
- **実装**: Vite設定の拡張とカスタムマネージャーの組み合わせ

### 6. タグ一覧画面の完全再構築
- **決定**: 既存コードを完全削除してゼロから再構築
- **根拠**: 過去の改修の積み重ねによりコードが複雑化し、部分修正では限界
- **利点**: クリーンなコードベース、統一されたレイアウト、保守性の向上

### 7. 楽曲機能の統合
- **決定**: 楽曲登録と楽曲編集を「楽曲管理」として統合
- **根拠**: メニューの簡素化とユーザビリティの向上
- **実装**: タブ切り替え方式で両機能を1つの画面に統合

### 8. 段階的機能追加の準備
- **決定**: 楽曲一覧ボタンを非活性状態で先行追加
- **根拠**: 将来のアップデートでスムーズな機能追加を可能にする
- **利点**: ユーザーへの機能予告、開発計画の明確化

## 技術的考慮事項

### 1. パフォーマンス最適化
- **GPU加速**: transform3d()の活用
- **レイヤー分離**: will-changeプロパティの適切な使用
- **メモリ管理**: 不要なオブジェクトの適切な破棄

### 2. アクセシビリティ
- **キーボードナビゲーション**: 全機能のキーボード操作対応
- **スクリーンリーダー**: 適切なARIAラベルの設定
- **コントラスト**: 高コントラストモードの対応

### 3. セキュリティ
- **CSP**: Content Security Policyの適切な設定
- **XSS防止**: ユーザー入力の適切なサニタイズ
- **HTTPS**: 全通信の暗号化

### 4. 保守性
- **コード分割**: 機能別のモジュール化
- **型安全性**: TypeScriptの活用
- **テスト可能性**: 依存性注入の活用

## 監視とメトリクス

### 1. パフォーマンスメトリクス
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift
- **FID**: First Input Delay

### 2. ユーザビリティメトリクス
- **タスク完了率**: 各機能の使用成功率
- **エラー発生率**: 操作エラーの頻度
- **ユーザー満足度**: フィードバックの収集

### 3. 技術メトリクス
- **バンドルサイズ**: JavaScriptとCSSのサイズ
- **キャッシュヒット率**: 静的アセットのキャッシュ効率
- **エラー率**: JavaScript実行エラーの頻度