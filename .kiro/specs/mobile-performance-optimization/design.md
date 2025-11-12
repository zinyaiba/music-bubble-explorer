# Design Document

## Overview

このドキュメントは、Music Bubble Explorerアプリケーションのモバイルパフォーマンス最適化機能の技術設計を定義します。主な目的は、ダイアログ表示時のバックグラウンドアニメーション停止、アイドル状態での処理削減、デバイス性能に応じた自動最適化により、スマートフォンでの発熱とバッテリー消費を大幅に削減することです。

現在のアプリケーションは、`App.tsx`内のアニメーションループ（`requestAnimationFrame`）が常時実行されており、ダイアログやモーダルが開いている間もバックグラウンドでシャボン玉のアニメーションが継続されています。これにより、不要なCPU使用率が発生し、モバイルデバイスの発熱とバッテリー消費の原因となっています。

## Architecture

### システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         AnimationController (新規)                     │  │
│  │  - アニメーション状態管理                              │  │
│  │  - ダイアログ状態監視                                  │  │
│  │  - アイドル状態検出                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    useAnimationOptimization Hook (新規)               │  │
│  │  - アニメーションフレーム制御                          │  │
│  │  - パフォーマンス監視                                  │  │
│  │  - 最適化レベル調整                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      PerformanceMonitor (新規)                         │  │
│  │  - FPS計測                                             │  │
│  │  - CPU使用率推定                                       │  │
│  │  - デバイス性能検出                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Dialog Components                               │
│  - DetailModal                                               │
│  - StandardLayout                                            │
│  - UnifiedDialogLayout                                       │
│  - その他のダイアログコンポーネント                          │
│                                                              │
│  各コンポーネントは isVisible prop を通じて                 │
│  AnimationController に状態を通知                           │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **ダイアログ開閉時**
   - ダイアログコンポーネントの `isVisible` prop が変更
   - `AnimationController` が状態変更を検出
   - `useAnimationOptimization` がアニメーションフレームを一時停止/再開
   - バックグラウンドのシャボン玉アニメーションが停止/再開

2. **アイドル状態検出時**
   - ユーザー操作イベント（マウス、タッチ、キーボード）を監視
   - 30秒間操作がない場合、アイドル状態に移行
   - フレームレートを50%削減（60fps → 30fps）
   - 非表示要素のレンダリングを停止

3. **パフォーマンス監視**
   - `PerformanceMonitor` が継続的にFPSとCPU使用率を計測
   - フレームドロップが連続で発生した場合、最適化レベルを自動調整
   - 開発モードでは、パフォーマンス指標をUIに表示

## Components and Interfaces

### 1. AnimationController (Context Provider)

アニメーション状態を管理するReact Contextプロバイダー。

```typescript
interface AnimationState {
  isAnimationActive: boolean      // アニメーションが実行中かどうか
  isDialogOpen: boolean            // ダイアログが開いているかどうか
  isIdle: boolean                  // アイドル状態かどうか
  optimizationLevel: 'none' | 'standard' | 'aggressive'
  performanceMetrics: PerformanceMetrics
}

interface AnimationControllerContextValue {
  state: AnimationState
  pauseAnimation: () => void
  resumeAnimation: () => void
  setDialogOpen: (isOpen: boolean) => void
  setOptimizationLevel: (level: 'none' | 'standard' | 'aggressive') => void
}

// Context Provider
export const AnimationControllerProvider: React.FC<{children: React.ReactNode}>
```

**責務:**
- アニメーション状態の一元管理
- ダイアログ開閉状態の追跡
- アイドル状態の検出と管理
- 最適化レベルの調整

### 2. useAnimationOptimization Hook

アニメーションフレーム制御とパフォーマンス最適化を提供するカスタムフック。

```typescript
interface AnimationOptimizationOptions {
  enabled: boolean                 // 最適化を有効にするかどうか
  idleTimeout: number              // アイドル状態に移行するまでの時間（ミリ秒）
  idleFrameRateReduction: number   // アイドル時のフレームレート削減率（0-1）
  pauseOnDialogOpen: boolean       // ダイアログ開閉時にアニメーションを停止するか
}

interface AnimationOptimizationResult {
  shouldAnimate: boolean           // アニメーションを実行すべきかどうか
  frameRateMultiplier: number      // フレームレート乗数（1.0 = 通常、0.5 = 50%削減）
  isOptimized: boolean             // 最適化が適用されているかどうか
  performanceMetrics: PerformanceMetrics
}

export function useAnimationOptimization(
  options: AnimationOptimizationOptions
): AnimationOptimizationResult
```

**責務:**
- `requestAnimationFrame` の制御
- フレームレート調整
- アイドル状態でのアニメーション削減
- ダイアログ開閉時のアニメーション停止

### 3. PerformanceMonitor Class

パフォーマンス指標の計測と監視を行うシングルトンクラス。

```typescript
interface PerformanceMetrics {
  fps: number                      // 現在のフレームレート
  averageFps: number               // 平均フレームレート
  cpuUsageEstimate: number         // CPU使用率の推定値（0-100）
  frameDropCount: number           // フレームドロップ回数
  devicePerformance: 'low' | 'medium' | 'high'
  lastUpdateTime: number           // 最終更新時刻
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  
  static getInstance(): PerformanceMonitor
  
  startMonitoring(): void
  stopMonitoring(): void
  getMetrics(): PerformanceMetrics
  detectDevicePerformance(): 'low' | 'medium' | 'high'
  recordFrame(timestamp: number): void
  reset(): void
}
```

**責務:**
- FPS計測（`requestAnimationFrame`のタイムスタンプを使用）
- CPU使用率の推定（フレームドロップ率から算出）
- デバイス性能の検出（初回レンダリング時のFPSから判定）
- パフォーマンス指標の記録と提供

### 4. PerformanceDebugOverlay Component (開発モード専用)

パフォーマンス指標を画面上に表示するデバッグ用コンポーネント。

```typescript
interface PerformanceDebugOverlayProps {
  enabled: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const PerformanceDebugOverlay: React.FC<PerformanceDebugOverlayProps>
```

**表示内容:**
- 現在のFPS
- 平均FPS
- CPU使用率推定値
- アニメーション状態（アクティブ/一時停止/アイドル）
- 最適化レベル
- デバイス性能

## Data Models

### AnimationState

```typescript
interface AnimationState {
  isAnimationActive: boolean
  isDialogOpen: boolean
  isIdle: boolean
  optimizationLevel: 'none' | 'standard' | 'aggressive'
  performanceMetrics: PerformanceMetrics
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  fps: number
  averageFps: number
  cpuUsageEstimate: number
  frameDropCount: number
  devicePerformance: 'low' | 'medium' | 'high'
  lastUpdateTime: number
}
```

### OptimizationConfig

```typescript
interface OptimizationConfig {
  enabled: boolean
  idleTimeout: number
  idleFrameRateReduction: number
  pauseOnDialogOpen: boolean
  autoAdjustOptimization: boolean
  frameDropThreshold: number
}
```

## Error Handling

### エラーケース

1. **パフォーマンス監視の失敗**
   - `performance.now()` が利用できない環境
   - フォールバック: `Date.now()` を使用

2. **アニメーションフレームの制御失敗**
   - `requestAnimationFrame` / `cancelAnimationFrame` が利用できない環境
   - フォールバック: 最適化を無効化し、通常のアニメーションを継続

3. **デバイス性能検出の失敗**
   - 初回レンダリング時のFPS計測が不正確
   - フォールバック: 'medium' 性能として扱う

### エラーハンドリング戦略

- すべてのエラーは console.warn でログ出力
- エラーが発生してもアプリケーションの動作を継続
- 最適化が失敗した場合は、最適化なしの通常動作にフォールバック
- 開発モードでは、エラー詳細を `PerformanceDebugOverlay` に表示

## Testing Strategy

### ユニットテスト

1. **PerformanceMonitor**
   - FPS計測の精度テスト
   - CPU使用率推定の妥当性テスト
   - デバイス性能検出のロジックテスト

2. **useAnimationOptimization Hook**
   - アイドル状態検出のタイミングテスト
   - フレームレート削減の計算テスト
   - ダイアログ開閉時のアニメーション停止テスト

3. **AnimationController**
   - 状態管理のロジックテスト
   - Context値の更新テスト

### 統合テスト

1. **ダイアログ開閉時のアニメーション制御**
   - DetailModal を開いた時にアニメーションが停止することを確認
   - DetailModal を閉じた時にアニメーションが再開することを確認
   - 複数のダイアログが同時に開いている場合の動作確認

2. **アイドル状態の検出と最適化**
   - 30秒間操作がない場合にアイドル状態に移行することを確認
   - アイドル状態でフレームレートが50%削減されることを確認
   - 操作再開時に通常のフレームレートに復帰することを確認

3. **パフォーマンス監視**
   - FPS計測が正確に行われることを確認
   - CPU使用率推定が妥当な範囲内であることを確認
   - デバイス性能検出が適切に機能することを確認

### パフォーマンステスト

1. **CPU使用率の削減**
   - 最適化前後のCPU使用率を比較
   - 目標: 30%以上の削減

2. **バッテリー消費の削減**
   - 長時間使用時のバッテリー消費を計測
   - 目標: 最適化により使用時間が延長されること

3. **ユーザー体験の維持**
   - スクロール時のフレームレートが60FPSを維持することを確認
   - UI操作の応答性が損なわれていないことを確認
   - ダイアログ内のアニメーションが正常に動作することを確認

### 手動テスト

1. **モバイルデバイスでの実機テスト**
   - iPhone (Safari)
   - Android (Chrome)
   - 発熱の体感確認
   - バッテリー消費の確認

2. **様々なシナリオでのテスト**
   - ダイアログを開いたまま長時間放置
   - ダイアログを頻繁に開閉
   - アイドル状態からの復帰
   - 低性能デバイスでの動作確認

## Implementation Notes

### App.tsx への統合

現在の `App.tsx` のアニメーションループ（`useEffect` 内の `animate` 関数）を、`useAnimationOptimization` フックを使用して制御します。

```typescript
// 現在の実装
useEffect(() => {
  if (!bubbleManagerRef.current || isLoading) return
  
  const animate = () => {
    const updatedBubbles = bubbleManagerRef.current.updateFrame()
    setBubbles([...updatedBubbles])
    animationFrameRef.current = requestAnimationFrame(animate)
  }
  
  animationFrameRef.current = requestAnimationFrame(animate)
  
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }
}, [isLoading])

// 最適化後の実装
const { shouldAnimate, frameRateMultiplier } = useAnimationOptimization({
  enabled: true,
  idleTimeout: 30000,
  idleFrameRateReduction: 0.5,
  pauseOnDialogOpen: true,
})

useEffect(() => {
  if (!bubbleManagerRef.current || isLoading || !shouldAnimate) return
  
  let lastFrameTime = 0
  const targetFrameInterval = (1000 / 60) / frameRateMultiplier
  
  const animate = (timestamp: number) => {
    if (timestamp - lastFrameTime >= targetFrameInterval) {
      const updatedBubbles = bubbleManagerRef.current.updateFrame()
      setBubbles([...updatedBubbles])
      lastFrameTime = timestamp
      
      // パフォーマンス監視
      PerformanceMonitor.getInstance().recordFrame(timestamp)
    }
    
    animationFrameRef.current = requestAnimationFrame(animate)
  }
  
  animationFrameRef.current = requestAnimationFrame(animate)
  
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }
}, [isLoading, shouldAnimate, frameRateMultiplier])
```

### ダイアログコンポーネントへの統合

`DetailModal`, `StandardLayout`, `UnifiedDialogLayout` などのダイアログコンポーネントは、`AnimationController` の `setDialogOpen` を呼び出して、開閉状態を通知します。

```typescript
// DetailModal の例
export const DetailModal: React.FC<DetailModalProps> = ({ selectedBubble, onClose, ... }) => {
  const { setDialogOpen } = useAnimationController()
  
  useEffect(() => {
    if (selectedBubble) {
      setDialogOpen(true)
    } else {
      setDialogOpen(false)
    }
  }, [selectedBubble, setDialogOpen])
  
  // ... 既存のコード
}
```

### CSS アニメーションの制御

CSS アニメーションも、ダイアログ開閉時に停止する必要があります。これは、ダイアログが開いている時に、バックグラウンド要素に `animation-play-state: paused` を適用することで実現します。

```css
/* 新規CSSファイル: src/styles/animationOptimization.css */

.animation-paused * {
  animation-play-state: paused !important;
  transition: none !important;
}

.animation-paused canvas {
  /* Canvas要素は描画を停止（JavaScriptで制御） */
}
```

### デバイス性能検出

初回レンダリング時に、短時間（1秒間）のFPS計測を行い、デバイス性能を判定します。

- **高性能**: 平均FPS >= 55
- **中性能**: 平均FPS >= 40
- **低性能**: 平均FPS < 40

低性能デバイスでは、より積極的な最適化（`optimizationLevel: 'aggressive'`）を自動的に適用します。

## Performance Targets

### 最適化目標

1. **CPU使用率削減**: 30%以上の削減
2. **ダイアログ開閉時のアニメーション停止**: 0.3秒以内
3. **アイドル状態でのフレームレート削減**: 50%削減（60fps → 30fps）
4. **ユーザー操作の応答性**: 0.1秒以内
5. **スクロール時のフレームレート**: 60FPS維持

### 計測方法

- Chrome DevTools の Performance タブを使用
- `performance.now()` を使用したカスタム計測
- モバイルデバイスでの実機計測（バッテリー消費、発熱）

## Future Enhancements

1. **Web Workers を使用したバックグラウンド処理**
   - シャボン玉の物理演算を Web Worker に移動
   - メインスレッドの負荷をさらに削減

2. **Intersection Observer を使用した可視領域外の要素の非表示**
   - 画面外のシャボン玉のレンダリングを停止
   - さらなるパフォーマンス向上

3. **ユーザー設定による最適化レベルの調整**
   - 設定画面で最適化レベルを手動で選択可能に
   - 「パフォーマンス優先」「バランス」「品質優先」の3段階

4. **バッテリー API の活用**
   - バッテリー残量が少ない場合、自動的に最適化を強化
   - 充電中は最適化を緩和

5. **Service Worker によるバックグラウンド同期**
   - アプリがバックグラウンドにある時は、すべてのアニメーションを停止
   - フォアグラウンドに戻った時に再開
