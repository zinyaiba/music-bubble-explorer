import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnimationControl } from '../hooks/useAnimationControl'

describe('useAnimationControl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('初期状態', () => {
    it('初期状態ではアニメーションが有効であること', () => {
      const { result } = renderHook(() => useAnimationControl())

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('setDialogOpen関数が提供されること', () => {
      const { result } = renderHook(() => useAnimationControl())

      expect(typeof result.current.setDialogOpen).toBe('function')
    })
  })

  describe('ダイアログ開閉時のアニメーション制御 (Requirements: 1.1, 1.2, 1.3, 1.4)', () => {
    it('ダイアログを開いた時にアニメーションが停止すること', () => {
      const { result } = renderHook(() => useAnimationControl())

      act(() => {
        result.current.setDialogOpen(true)
      })

      expect(result.current.shouldAnimate).toBe(false)
    })

    it('ダイアログを閉じた時にアニメーションが再開すること', () => {
      const { result } = renderHook(() => useAnimationControl())

      act(() => {
        result.current.setDialogOpen(true)
      })

      expect(result.current.shouldAnimate).toBe(false)

      act(() => {
        result.current.setDialogOpen(false)
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('複数回ダイアログを開閉してもアニメーション制御が正常に動作すること', () => {
      const { result } = renderHook(() => useAnimationControl())

      // 1回目の開閉
      act(() => {
        result.current.setDialogOpen(true)
      })
      expect(result.current.shouldAnimate).toBe(false)

      act(() => {
        result.current.setDialogOpen(false)
      })
      expect(result.current.shouldAnimate).toBe(true)

      // 2回目の開閉
      act(() => {
        result.current.setDialogOpen(true)
      })
      expect(result.current.shouldAnimate).toBe(false)

      act(() => {
        result.current.setDialogOpen(false)
      })
      expect(result.current.shouldAnimate).toBe(true)
    })
  })

  describe('アイドル状態の検出 (Requirements: 2.1, 2.2, 2.3, 2.4)', () => {
    it('30秒間操作がない場合にアニメーションが停止すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      expect(result.current.shouldAnimate).toBe(true)

      // 30秒経過
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)
    })

    it('マウス移動でアイドル状態から復帰すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // マウス移動イベントを発火
      await act(async () => {
        window.dispatchEvent(new MouseEvent('mousemove'))
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('クリックでアイドル状態から復帰すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // クリックイベントを発火
      await act(async () => {
        window.dispatchEvent(new MouseEvent('mousedown'))
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('タッチでアイドル状態から復帰すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // タッチイベントを発火
      await act(async () => {
        window.dispatchEvent(new TouchEvent('touchstart'))
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('スクロールでアイドル状態から復帰すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // スクロールイベントを発火
      await act(async () => {
        window.dispatchEvent(new Event('scroll'))
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('キーボード入力でアイドル状態から復帰すること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // キーボードイベントを発火
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown'))
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(true)
    })

    it('操作後にアイドルタイマーがリセットされること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 20秒経過
      await act(async () => {
        vi.advanceTimersByTime(20000)
        await Promise.resolve()
      })

      // まだアイドル状態ではない
      expect(result.current.shouldAnimate).toBe(true)

      // マウス移動でタイマーリセット
      await act(async () => {
        window.dispatchEvent(new MouseEvent('mousemove'))
        await Promise.resolve()
      })

      // さらに20秒経過（合計40秒だが、リセットされたので20秒）
      await act(async () => {
        vi.advanceTimersByTime(20000)
        await Promise.resolve()
      })

      // まだアイドル状態ではない
      expect(result.current.shouldAnimate).toBe(true)

      // さらに10秒経過（リセット後30秒）
      await act(async () => {
        vi.advanceTimersByTime(10000)
        await Promise.resolve()
      })

      // アイドル状態になる
      expect(result.current.shouldAnimate).toBe(false)
    })
  })

  describe('ダイアログ開閉とアイドル状態の相互作用 (Requirement: 2.5)', () => {
    it('ダイアログが開いている間はアイドルタイマーが動作しないこと', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // ダイアログを開く
      act(() => {
        result.current.setDialogOpen(true)
      })

      expect(result.current.shouldAnimate).toBe(false)

      // 30秒経過
      act(() => {
        vi.advanceTimersByTime(30000)
      })

      // ダイアログを閉じる
      act(() => {
        result.current.setDialogOpen(false)
      })

      // ダイアログを閉じた直後はアニメーションが再開される
      // （アイドルタイマーがリセットされるため）
      expect(result.current.shouldAnimate).toBe(true)
    })

    it('ダイアログを閉じた後にアイドルタイマーがリセットされること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // ダイアログを開く
      await act(async () => {
        result.current.setDialogOpen(true)
        await Promise.resolve()
      })

      // 30秒経過（ダイアログが開いているのでアイドルタイマーは動作しない）
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      // ダイアログを閉じる
      await act(async () => {
        result.current.setDialogOpen(false)
        await Promise.resolve()
      })

      // アニメーションが再開される
      expect(result.current.shouldAnimate).toBe(true)

      // さらに30秒経過
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      // アイドル状態になる
      expect(result.current.shouldAnimate).toBe(false)
    })

    it('アイドル状態でダイアログを開いてもアニメーションは停止したままであること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // ダイアログを開く
      await act(async () => {
        result.current.setDialogOpen(true)
        await Promise.resolve()
      })

      // アニメーションは停止したまま
      expect(result.current.shouldAnimate).toBe(false)
    })

    it('アイドル状態でダイアログを開いて閉じた後、アイドルタイマーがリセットされること', async () => {
      const { result } = renderHook(() => useAnimationControl())

      // 30秒経過してアイドル状態に
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)

      // ダイアログを開く
      await act(async () => {
        result.current.setDialogOpen(true)
        await Promise.resolve()
      })

      // ダイアログを閉じる（アイドルタイマーがリセットされる）
      await act(async () => {
        result.current.setDialogOpen(false)
        await Promise.resolve()
      })

      // ダイアログを閉じた時にアイドルタイマーがリセットされるため、アニメーションが再開される
      expect(result.current.shouldAnimate).toBe(true)

      // さらに30秒経過すると再びアイドル状態になる
      await act(async () => {
        vi.advanceTimersByTime(30000)
        await Promise.resolve()
      })

      expect(result.current.shouldAnimate).toBe(false)
    })
  })

  describe('クリーンアップ (Requirements: 3.1, 3.2)', () => {
    it('アンマウント時にイベントリスナーが削除されること', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const { unmount } = renderHook(() => useAnimationControl())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousedown',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'touchstart',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      )
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })

    it('アンマウント時にアイドルタイマーがクリアされること', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
      const { unmount } = renderHook(() => useAnimationControl())

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })
})
