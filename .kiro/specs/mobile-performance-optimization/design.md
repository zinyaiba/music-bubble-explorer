# Design Document

## Overview

このドキュメントは、Music Bubble Explorerアプリケーションのシャボン玉アニメーション制御機能の技術設計を定義します。主な目的は、ダイアログ表示時とアイドル状態でのアニメーション停止により、スマートフォンでの発熱とバッテリー消費を削減することです。

現在のアプリケーションは、`App.tsx`内のアニメーションループ（`requestAnimationFrame`）が常時実行されており、ダイアログやモーダルが開いている間もバックグラウンドでシャボン玉のアニメーションが継続されています。これにより、不要なCPU使用率が発生し、モバイルデバイスの発熱とバッテリー消費の原因となっています。

**設計方針**: 複雑なシステムを作り込まず、シンプルで理解しやすい実装を優先します。

## Architecture

### システムアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │    useAnimationControl Hook (新規)                    │  │
│  │  - ダイアログ開閉状態の追跡                            │  │
│  │  - アイドル状態の検出（30秒タイマー）                  │  │
│  │  - shouldAnimate フラグの管理                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      既存のアニメーションループ                        │  │
│  │  - shouldAnimate が true の時のみ実行                 │  │
│  │  - requestAnimationFrame の制御                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↑
┌─────────────────────────────────────────────────────────────┐
│              Dialog Components                               │
│  - DetailModal                                               │
│  - StandardLayout                                            │
│  - UnifiedDialogLayout                                       │
│                                                              │
│  各コンポーネントは開閉状態を                                │
│  useAnimationControl に通知                                 │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **ダイアログ開閉時**
   - ダイアログコンポーネントが `useAnimationControl` の `setDialogOpen` を呼び出し
   - `shouldAnimate` が `false` に変更
   - `App.tsx` のアニメーションループが停止
   - ダイアログを閉じると `shouldAnimate` が `true` に戻り、アニメーション再開

2. **アイドル状態検出時**
   - `useAnimationControl` がユーザー操作イベント（マウス移動、クリック、タッチ、スクロール、キーボード）を監視
   - 30秒間操作がない場合、`shouldAnimate` が `false` に変更
   - 操作が再開されると、`shouldAnimate` が `true` に戻る
   - ダイアログが開いている間は、アイドルタイマーをリセットしない

## Components and Interfaces

### 1. useAnimationControl Hook

アニメーション制御を提供するシンプルなカスタムフック。

```typescript
interface AnimationControlResult {
  shouldAnimate: boolean           // アニメーションを実行すべきかどうか
  setDialogOpen: (isOpen: boolean) => void  // ダイアログ開閉状態を設定
}

export function useAnimationControl(): AnimationControlResult
```

**内部実装:**
- `isDialogOpen` state: ダイアログが開いているかどうか
- `isIdle` state: アイドル状態かどうか
- `idleTimerRef`: 30秒のアイドルタイマー
- イベントリスナー: `mousemove`, `mousedown`, `touchstart`, `scroll`, `keydown`
- `shouldAnimate = !isDialogOpen && !isIdle`

**責務:**
- ダイアログ開閉状態の追跡
- アイドル状態の検出（30秒タイマー）
- ユーザー操作イベントの監視
- アニメーション実行可否の判定

## Data Models

### AnimationControlResult

```typescript
interface AnimationControlResult {
  shouldAnimate: boolean
  setDialogOpen: (isOpen: boolean) => void
}
```

**内部状態（フック内部のみ）:**
- `isDialogOpen: boolean` - ダイアログが開いているかどうか
- `isIdle: boolean` - アイドル状態かどうか
- `idleTimerRef: React.MutableRefObject<number | null>` - アイドルタイマーの参照

## Error Handling

### エラーケース

1. **イベントリスナーの登録失敗**
   - イベントリスナーの追加/削除時のエラー
   - フォールバック: エラーをログ出力し、アニメーションは継続

2. **タイマーの制御失敗**
   - `setTimeout` / `clearTimeout` の失敗
   - フォールバック: アイドル検出を無効化し、アニメーションは継続

### エラーハンドリング戦略

- すべてのエラーは `console.warn` でログ出力
- エラーが発生してもアプリケーションの動作を継続
- 最適化が失敗した場合は、通常のアニメーション動作を維持

## Testing Strategy

### 手動テスト

1. **ダイアログ開閉時のアニメーション制御**
   - DetailModal を開いた時にアニメーションが停止することを確認
   - DetailModal を閉じた時にアニメーションが再開することを確認
   - StandardLayout を開いた時にアニメーションが停止することを確認
   - UnifiedDialogLayout を開いた時にアニメーションが停止することを確認

2. **アイドル状態の検出**
   - 30秒間操作がない場合にアニメーションが停止することを確認
   - マウス移動でアニメーションが再開することを確認
   - クリックでアニメーションが再開することを確認
   - スクロールでアニメーションが再開することを確認
   - ダイアログが開いている間はアイドルタイマーが動作しないことを確認

3. **モバイルデバイスでの実機テスト**
   - iPhone (Safari) での動作確認
   - Android (Chrome) での動作確認
   - 発熱の体感確認
   - バッテリー消費の確認

## Implementation Notes

### App.tsx への統合

現在の `App.tsx` のアニメーションループを、`useAnimationControl` フックを使用して制御します。

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
const { shouldAnimate, setDialogOpen } = useAnimationControl()

useEffect(() => {
  if (!bubbleManagerRef.current || isLoading || !shouldAnimate) return
  
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
}, [isLoading, shouldAnimate])
```

### ダイアログコンポーネントへの統合

`DetailModal`, `StandardLayout`, `UnifiedDialogLayout` などのダイアログコンポーネントは、`useAnimationControl` の `setDialogOpen` を呼び出して、開閉状態を通知します。

```typescript
// DetailModal の例
export const DetailModal: React.FC<DetailModalProps> = ({ selectedBubble, onClose, ... }) => {
  const { setDialogOpen } = useAnimationControl()
  
  useEffect(() => {
    if (selectedBubble) {
      setDialogOpen(true)
    }
    return () => {
      setDialogOpen(false)
    }
  }, [selectedBubble, setDialogOpen])
  
  // ... 既存のコード
}
```

### useAnimationControl フックの実装詳細

```typescript
export function useAnimationControl(): AnimationControlResult {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const idleTimerRef = useRef<number | null>(null)
  
  // アイドルタイマーをリセット
  const resetIdleTimer = useCallback(() => {
    if (isDialogOpen) return // ダイアログが開いている間はリセットしない
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    
    setIsIdle(false)
    
    idleTimerRef.current = window.setTimeout(() => {
      setIsIdle(true)
    }, 30000) // 30秒
  }, [isDialogOpen])
  
  // ユーザー操作イベントの監視
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'touchstart', 'scroll', 'keydown']
    
    events.forEach(event => {
      window.addEventListener(event, resetIdleTimer)
    })
    
    resetIdleTimer() // 初回タイマー設定
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetIdleTimer)
      })
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [resetIdleTimer])
  
  const setDialogOpen = useCallback((isOpen: boolean) => {
    setIsDialogOpen(isOpen)
    if (!isOpen) {
      resetIdleTimer() // ダイアログを閉じたらタイマーをリセット
    }
  }, [resetIdleTimer])
  
  const shouldAnimate = !isDialogOpen && !isIdle
  
  return { shouldAnimate, setDialogOpen }
}
```

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
