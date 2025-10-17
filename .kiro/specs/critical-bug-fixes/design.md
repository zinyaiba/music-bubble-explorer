# Design Document

## Overview

Music Bubble Explorerアプリケーションで発生している重要なバグを修正するための設計文書です。タグ一覧表示の不具合、UIレイアウトの重複問題、シャボン玉サイズ制御の問題、および詳細ダイアログの関連情報表示問題を解決します。

## Architecture

### 問題分析と修正アプローチ

#### 1. タグ一覧表示問題
**現状分析:**
- タグ一覧ボタンをクリックしても登録されているタグが表示されない
- データ取得エラーまたはコンポーネントの表示ロジックに問題がある可能性

**修正アプローチ:**
- `EnhancedTagList`コンポーネントの実装確認と修正
- `DataManager`からのタグデータ取得ロジックの検証
- Firebase接続とローカルデータの整合性確認

#### 2. UIレイアウト重複問題
**現状分析:**
- タグ一覧画面に閉じるボタンが2つ表示されている
- レイアウトコンポーネントの重複または不適切な配置

**修正アプローチ:**
- `SimpleDialog`コンポーネントと`EnhancedTagList`コンポーネントの構造見直し
- 重複するUI要素の特定と除去
- 統一されたダイアログレイアウトの実装

#### 3. シャボン玉サイズ制御問題
**現状分析:**
- 最小・最大サイズを同じに設定しても大きなシャボン玉が発生する
- `bubbleSettings.ts`の設定が正しく反映されていない可能性

**修正アプローチ:**
- `BubbleManager`のサイズ計算ロジックの検証
- 設定ファイルの値が実際の計算に反映されているかの確認
- サイズ計算アルゴリズムの修正

#### 4. 詳細ダイアログ関連情報表示問題
**現状分析:**
- シャボン玉をクリックしても関連情報が表示されない
- データ取得またはモーダル表示ロジックに問題がある可能性

**修正アプローチ:**
- `DetailModal`コンポーネントの関連情報取得ロジック確認
- `MusicDataService`からの関連データ取得の検証
- モーダル表示時のデータバインディング修正

## Components and Interfaces

### 1. Enhanced Tag List Component (修正版)

```typescript
interface EnhancedTagListProps {
  isVisible: boolean
  onClose: () => void
  musicDatabase: MusicDatabase
  onTagClick?: (tag: Tag) => void
}

interface TagListState {
  tags: Tag[]
  isLoading: boolean
  error: string | null
  sortBy: 'alphabetical' | 'frequency'
}

class EnhancedTagList {
  // タグデータ取得の改善
  private async loadTags(): Promise<Tag[]>
  
  // エラーハンドリングの強化
  private handleTagLoadError(error: Error): void
  
  // 空状態の適切な表示
  private renderEmptyState(): JSX.Element
  
  // 重複UI要素の除去
  private renderCleanLayout(): JSX.Element
}
```

### 2. Bubble Size Calculator (修正版)

```typescript
interface BubbleSizeConfig {
  minSize: number
  maxSize: number
  respectMaxSize: boolean // 最大サイズ制限を厳密に適用
  sizeCalculationMode: 'strict' | 'proportional'
}

class BubbleSizeCalculator {
  // 設定ファイルの値を厳密に適用
  calculateSize(relatedCount: number, config: BubbleSizeConfig): number {
    if (config.sizeCalculationMode === 'strict') {
      // 最小・最大が同じ場合は固定サイズを返す
      if (config.minSize === config.maxSize) {
        return config.minSize
      }
    }
    
    // 従来の比例計算
    const normalizedCount = Math.min(relatedCount / 20, 1)
    const calculatedSize = config.minSize + (config.maxSize - config.minSize) * normalizedCount
    
    // 最大サイズ制限を厳密に適用
    if (config.respectMaxSize) {
      return Math.min(calculatedSize, config.maxSize)
    }
    
    return calculatedSize
  }
}
```

### 3. Detail Modal Data Provider (修正版)

```typescript
interface DetailModalDataProvider {
  // 関連情報取得の改善
  getRelatedData(bubble: BubbleEntity): Promise<RelatedData[]>
  
  // エラーハンドリング
  handleDataLoadError(error: Error): string
  
  // 空状態の処理
  handleEmptyRelatedData(bubble: BubbleEntity): RelatedData[]
}

interface RelatedData {
  type: 'song' | 'person' | 'tag'
  id: string
  name: string
  details: string
  count?: number
}

class DetailModalService {
  async getRelatedSongs(personName: string, role: string): Promise<Song[]>
  async getRelatedPeople(songTitle: string): Promise<Person[]>
  async getTaggedSongs(tagName: string): Promise<Song[]>
  
  // データ整合性チェック
  validateRelatedData(data: any[]): boolean
  
  // フォールバック処理
  getEmptyStateMessage(bubbleType: string): string
}
```

### 4. Unified Dialog Layout System

```typescript
interface UnifiedDialogProps {
  isVisible: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  showCloseButton?: boolean // 重複防止のための制御
  closeButtonPosition?: 'header' | 'footer' | 'both'
}

class UnifiedDialogLayout {
  // 重複UI要素の防止
  private preventDuplicateCloseButtons(): void
  
  // 統一されたレイアウト
  private renderConsistentLayout(): JSX.Element
  
  // アクセシビリティの確保
  private ensureAccessibility(): void
}
```

## Data Models

### Tag Data Structure (修正版)

```typescript
interface Tag {
  id: string
  name: string
  songs: string[] // song IDs
  displayName: string // #付きの表示名
  count: number // 関連楽曲数（キャッシュ用）
  lastUpdated: string // データ更新日時
}

interface TagListData {
  tags: Tag[]
  totalCount: number
  isEmpty: boolean
  lastFetched: string
  error: string | null
}
```

### Bubble Configuration (修正版)

```typescript
interface BubbleSettings {
  // サイズ設定の厳密化
  minSize: number
  maxSize: number
  strictSizeMode: boolean // 厳密サイズモード
  
  // その他の設定
  maxBubbles: number
  minLifespan: number
  maxLifespan: number
  minVelocity: number
  maxVelocity: number
  buoyancyStrength: number
  airResistance: number
  windStrength: number
  breathingFrequency: number
  breathingAmplitude: number
  noiseIntensity: number
}
```

## Error Handling

### Enhanced Error Management

```typescript
interface ErrorContext {
  component: string
  operation: string
  timestamp: number
  userMessage: string
  technicalDetails: string
}

class BugFixErrorHandler {
  // タグ一覧エラー
  handleTagListError(error: Error): ErrorContext {
    return {
      component: 'EnhancedTagList',
      operation: 'loadTags',
      timestamp: Date.now(),
      userMessage: 'タグ情報の取得に失敗しました。再試行してください。',
      technicalDetails: error.message
    }
  }
  
  // シャボン玉サイズエラー
  handleBubbleSizeError(error: Error): ErrorContext {
    return {
      component: 'BubbleManager',
      operation: 'calculateBubbleSize',
      timestamp: Date.now(),
      userMessage: 'シャボン玉のサイズ計算でエラーが発生しました。',
      technicalDetails: error.message
    }
  }
  
  // 関連情報取得エラー
  handleRelatedDataError(error: Error): ErrorContext {
    return {
      component: 'DetailModal',
      operation: 'getRelatedData',
      timestamp: Date.now(),
      userMessage: '関連情報の取得に失敗しました。',
      technicalDetails: error.message
    }
  }
  
  // ネットワークエラー
  handleNetworkError(error: Error): ErrorContext {
    return {
      component: 'DataManager',
      operation: 'fetchData',
      timestamp: Date.now(),
      userMessage: 'ネットワーク接続を確認してください。',
      technicalDetails: error.message
    }
  }
}
```

## Testing Strategy

### Bug Fix Validation

```typescript
interface BugFixTestSuite {
  // タグ一覧表示テスト
  testTagListDisplay(): Promise<boolean>
  
  // UIレイアウトテスト
  testDialogLayout(): Promise<boolean>
  
  // シャボン玉サイズテスト
  testBubbleSizeCalculation(): Promise<boolean>
  
  // 関連情報表示テスト
  testRelatedDataDisplay(): Promise<boolean>
}

class BugFixValidator {
  // タグ一覧が正常に表示されることを確認
  async validateTagListDisplay(): Promise<ValidationResult> {
    // 1. タグデータが正常に取得できるか
    // 2. 空状態が適切に表示されるか
    // 3. エラー状態が適切に処理されるか
    // 4. タグクリック時の動作が正常か
  }
  
  // レイアウトの重複がないことを確認
  async validateDialogLayout(): Promise<ValidationResult> {
    // 1. 閉じるボタンが1つだけ表示されるか
    // 2. レイアウトが適切に配置されるか
    // 3. モバイルでの表示が正常か
  }
  
  // シャボン玉サイズが設定通りになることを確認
  async validateBubbleSizeCalculation(): Promise<ValidationResult> {
    // 1. 最小・最大サイズが同じ場合の動作
    // 2. 設定ファイルの値が反映されるか
    // 3. 異常に大きなシャボン玉が生成されないか
  }
  
  // 関連情報が正常に表示されることを確認
  async validateRelatedDataDisplay(): Promise<ValidationResult> {
    // 1. 楽曲クリック時の関連人物表示
    // 2. 人物クリック時の関連楽曲表示
    // 3. タグクリック時の関連楽曲表示
    // 4. 空状態の適切な処理
  }
}
```

## Implementation Plan

### Phase 1: タグ一覧表示修正
1. `EnhancedTagList`コンポーネントの実装確認
2. データ取得ロジックの修正
3. エラーハンドリングの強化
4. 空状態表示の実装

### Phase 2: UIレイアウト修正
1. `SimpleDialog`コンポーネントの構造見直し
2. 重複UI要素の特定と除去
3. 統一されたダイアログレイアウトの実装
4. モバイル対応の確認

### Phase 3: シャボン玉サイズ制御修正
1. `BubbleManager`のサイズ計算ロジック確認
2. 設定ファイル連携の修正
3. 厳密サイズモードの実装
4. 設定値の適用確認

### Phase 4: 詳細ダイアログ修正
1. `DetailModal`の関連情報取得ロジック修正
2. データバインディングの確認
3. エラーハンドリングの強化
4. 空状態の適切な処理

### Phase 5: 統合テストと検証
1. 各修正の動作確認
2. 回帰テストの実行
3. モバイル・PC両環境での確認
4. パフォーマンス影響の確認

## Performance Considerations

### 修正による影響の最小化

1. **データ取得の最適化**
   - キャッシュ機能の活用
   - 不要なAPI呼び出しの削減
   - エラー時のフォールバック処理

2. **UI更新の効率化**
   - 不要な再レンダリングの防止
   - メモ化の適切な使用
   - 仮想化の活用

3. **メモリ使用量の管理**
   - オブジェクトプールの活用
   - 不要なデータの適切な解放
   - ガベージコレクションの最適化

## Security Considerations

### データ整合性の確保

1. **入力値の検証**
   - タグ名の妥当性チェック
   - SQLインジェクション対策
   - XSS攻撃の防止

2. **エラー情報の適切な処理**
   - 機密情報の漏洩防止
   - ユーザーフレンドリーなエラーメッセージ
   - ログ出力の適切な制御

3. **データアクセスの制御**
   - 権限チェックの実装
   - 不正アクセスの防止
   - データの暗号化