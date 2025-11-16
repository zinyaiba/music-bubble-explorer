# ダイアログパフォーマンス修正

## 問題

楽曲管理から表示する、楽曲の登録・楽曲の編集・楽曲削除のダイアログを表示した際、表示してしばらくしてから操作しないと画面が固まってしまうケースがある。

## 原因

以下の3つの主要な原因が特定されました:

### 1. 複数のsetTimeoutによる遅延処理

`UnifiedDialogLayout.tsx`と`StandardLayout.tsx`で、ヘッダーの高さ調整のために複数の`setTimeout`が実行されていました:

```typescript
setTimeout(updatePadding, 0)
setTimeout(updatePadding, 100)
setTimeout(updatePadding, 300)
```

これらの処理が完了するまで、ユーザーの操作がブロックされる可能性がありました。

### 2. フォーカス管理の遅延

`SongRegistrationForm.tsx`で、入力フィールドへのフォーカスに100msの遅延がありました:

```typescript
setTimeout(() => {
  titleInputRef.current?.focus()
}, 100)
```

### 3. Firebaseデータ読み込みの同期処理

`SongManagement.tsx`の`loadSongs`関数で、Firebaseからのデータ読み込みが同期的に行われており、接続が遅い場合に画面が固まる原因となっていました。

## 修正内容

### 1. UnifiedDialogLayout.tsx

複数の`setTimeout`を`requestAnimationFrame`に置き換え:

```typescript
// 修正前
setTimeout(updatePadding, 0)
setTimeout(updatePadding, 100)
setTimeout(updatePadding, 300)

// 修正後
const rafId = requestAnimationFrame(() => {
  updatePadding()
})

// クリーンアップ
return () => {
  cancelAnimationFrame(rafId)
  // ...
}
```

### 2. StandardLayout.tsx

同様に`requestAnimationFrame`を使用:

```typescript
const rafId = requestAnimationFrame(() => {
  updatePadding()
})

return () => {
  cancelAnimationFrame(rafId)
  // ...
}
```

### 3. SongRegistrationForm.tsx

フォーカス管理を`requestAnimationFrame`に変更し、`isVisible`の依存関係を追加:

```typescript
// 修正前
useEffect(() => {
  if (titleInputRef.current) {
    setTimeout(() => {
      titleInputRef.current?.focus()
    }, 100)
  }
}, [])

// 修正後
useEffect(() => {
  if (isVisible && titleInputRef.current) {
    const rafId = requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })
    return () => cancelAnimationFrame(rafId)
  }
}, [isVisible])
```

### 4. SongManagement.tsx

Firebaseデータ読み込みにタイムアウトを追加:

```typescript
const loadWithTimeout = async () => {
  const timeoutPromise = new Promise<Song[]>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 5000)
  })

  const loadPromise = (async () => {
    try {
      const { FirebaseService } = await import('@/services/firebaseService')
      const firebaseService = FirebaseService.getInstance()

      const isConnected = await firebaseService.checkConnection()
      if (isConnected) {
        return await firebaseService.getAllSongs()
      } else {
        return DataManager.loadSongs()
      }
    } catch (firebaseError) {
      return DataManager.loadSongs()
    }
  })()

  return Promise.race([loadPromise, timeoutPromise])
}

try {
  loadedSongs = await loadWithTimeout()
} catch (timeoutError) {
  console.warn('Firebase load timeout, falling back to local storage')
  loadedSongs = DataManager.loadSongs()
}
```

## 効果

- ダイアログの初期化処理が高速化され、表示直後から操作可能になります
- `requestAnimationFrame`を使用することで、ブラウザの描画サイクルに合わせた最適なタイミングで処理が実行されます
- Firebaseの読み込みにタイムアウトを設定することで、接続が遅い場合でも5秒後にローカルストレージにフォールバックします
- 不要な遅延処理を削減し、ユーザー体験が向上します

## テスト方法

1. 楽曲管理画面を開く
2. 「新規登録」ボタンをクリック
3. ダイアログが表示された直後に入力フィールドをクリックまたはタップ
4. 画面が固まらず、すぐに入力できることを確認

5. 楽曲の編集ボタンをクリック
6. ダイアログが表示された直後に操作可能であることを確認

7. 楽曲の削除ボタンをクリック
8. 確認ダイアログが表示された直後に操作可能であることを確認

## 追加修正: 閉じるボタンの反応遅延

### 問題

編集画面を表示してすぐに閉じるボタンを押下しても、しばらく時間が経たないと閉じず、画面が固まったように見える。

### 原因

1. **閉じるボタンのイベントハンドラーが直接`onClose`を呼び出していた** - イベントの伝播が適切に処理されていませんでした
2. **`handleCloseEditForm`が親の`onClose`を呼び出していた** - 編集フォームを閉じる際に、楽曲管理画面も閉じてしまっていました

### 修正内容

#### 1. StandardLayout.tsx と UnifiedDialogLayout.tsx

閉じるボタン専用のイベントハンドラーを追加:

```typescript
/**
 * 閉じるボタンのクリックハンドラー（即座に反応）
 */
const handleCloseClick = useCallback((e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('🔙 Close button clicked')
  onClose()
}, [onClose])
```

閉じるボタンで`handleCloseClick`を使用:

```typescript
<button
  className="standard-layout-integrated-close"
  onClick={handleCloseClick}  // onCloseから変更
  aria-label="画面を閉じる"
  type="button"
>
  ×
</button>
```

#### 2. SongManagement.tsx

`handleCloseEditForm`はそのまま維持（編集フォームを閉じる際に親の楽曲管理画面も閉じてトップ画面に戻る仕様）:

```typescript
const handleCloseEditForm = useCallback(() => {
  console.log('🔙 Closing edit form and parent song management')
  setEditingSong(null)
  setShowEditForm(false)
  // 編集フォームを閉じる時に、楽曲編集画面も閉じてトップ画面に戻る
  onClose()
}, [onClose])
```

### 効果

- 閉じるボタンをクリックした際に、イベントが即座に処理されます
- `e.preventDefault()`と`e.stopPropagation()`により、イベントの伝播が適切に制御されます
- 編集フォームを閉じると、楽曲管理画面も閉じてトップ画面に戻ります（元の仕様通り）
- ユーザーが期待する動作（トップ画面に戻る）が実現されます

## 注意事項

- `requestAnimationFrame`は次のフレームで実行されるため、`setTimeout(fn, 0)`よりも適切なタイミングで処理が実行されます
- Firebaseのタイムアウトは5秒に設定されていますが、必要に応じて調整可能です
- ローカルストレージへのフォールバックにより、オフライン時でも動作します
- 閉じるボタンには`touch-action: manipulation`が設定されており、タッチデバイスでの反応が最適化されています
