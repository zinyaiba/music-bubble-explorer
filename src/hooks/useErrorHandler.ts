import { useState, useCallback, useRef } from 'react'
import { ErrorHandler, ErrorType, AppError } from '@/utils/errorHandler'

interface ErrorState {
  hasError: boolean
  error: AppError | null
  isRecovering: boolean
  retryCount: number
}

interface UseErrorHandlerReturn {
  errorState: ErrorState
  handleError: (error: Error | unknown, type: ErrorType, context?: Record<string, any>) => void
  clearError: () => void
  retry: (retryFn?: () => Promise<void> | void) => Promise<void>
  canRetry: boolean
}

/**
 * エラーハンドリング用のカスタムフック
 */
export function useErrorHandler(maxRetries: number = 3): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    isRecovering: false,
    retryCount: 0
  })

  const retryFnRef = useRef<(() => Promise<void> | void) | null>(null)

  /**
   * エラーを処理する
   */
  const handleError = useCallback((
    error: Error | unknown, 
    type: ErrorType, 
    context?: Record<string, any>
  ) => {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    const appError = ErrorHandler.handleError(errorObj, type, context)
    
    setErrorState(prev => ({
      ...prev,
      hasError: true,
      error: appError,
      isRecovering: false
    }))
  }, [])

  /**
   * エラー状態をクリアする
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      isRecovering: false,
      retryCount: 0
    })
    retryFnRef.current = null
  }, [])

  /**
   * リトライを実行する
   */
  const retry = useCallback(async (retryFn?: () => Promise<void> | void) => {
    if (errorState.isRecovering || errorState.retryCount >= maxRetries) {
      return
    }

    // リトライ関数を保存
    if (retryFn) {
      retryFnRef.current = retryFn
    }

    const currentRetryFn = retryFnRef.current
    if (!currentRetryFn) {
      console.warn('No retry function provided')
      return
    }

    setErrorState(prev => ({
      ...prev,
      isRecovering: true
    }))

    try {
      await currentRetryFn()
      
      // 成功した場合はエラー状態をクリア
      setErrorState({
        hasError: false,
        error: null,
        isRecovering: false,
        retryCount: 0
      })
    } catch (error) {
      // リトライに失敗した場合
      const newRetryCount = errorState.retryCount + 1
      const errorObj = error instanceof Error ? error : new Error(String(error))
      const appError = ErrorHandler.handleError(errorObj, ErrorType.UNKNOWN, {
        source: 'useErrorHandler.retry',
        retryCount: newRetryCount,
        maxRetries
      })

      setErrorState(prev => ({
        ...prev,
        hasError: true,
        error: appError,
        isRecovering: false,
        retryCount: newRetryCount
      }))
    }
  }, [errorState.isRecovering, errorState.retryCount, maxRetries])

  /**
   * リトライ可能かどうか
   */
  const canRetry = errorState.retryCount < maxRetries && !errorState.isRecovering

  return {
    errorState,
    handleError,
    clearError,
    retry,
    canRetry
  }
}

/**
 * 非同期操作用のエラーハンドリングフック
 */
export function useAsyncErrorHandler<T>(
  asyncFn: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
) {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const errorHandler = useErrorHandler()

  const execute = useCallback(async (): Promise<void> => {
    if (isLoading) return

    setIsLoading(true)
    errorHandler.clearError()

    try {
      const result = await asyncFn()
      setData(result)
    } catch (error) {
      errorHandler.handleError(error, errorType, context)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [asyncFn, errorType, context, isLoading, errorHandler])

  const retryAsync = useCallback(() => {
    return errorHandler.retry(execute)
  }, [errorHandler, execute])

  const { retry: _, ...restErrorHandler } = errorHandler

  return {
    data,
    isLoading,
    execute,
    retry: retryAsync,
    ...restErrorHandler
  }
}

/**
 * Canvas操作用のエラーハンドリングフック
 */
export function useCanvasErrorHandler() {
  const errorHandler = useErrorHandler()
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)

  const safeCanvasOperation = useCallback(<T>(
    operation: (ctx: CanvasRenderingContext2D) => T,
    fallbackValue?: T
  ): T | undefined => {
    if (!canvasRef) {
      errorHandler.handleError(
        new Error('Canvas element is not available'),
        ErrorType.CANVAS_RENDERING,
        { operation: 'safeCanvasOperation' }
      )
      return fallbackValue
    }

    const ctx = canvasRef.getContext('2d')
    if (!ctx) {
      errorHandler.handleError(
        new Error('Failed to get 2D context'),
        ErrorType.CANVAS_RENDERING,
        { canvas: canvasRef.tagName }
      )
      return fallbackValue
    }

    try {
      return operation(ctx)
    } catch (error) {
      errorHandler.handleError(
        error,
        ErrorType.CANVAS_RENDERING,
        { canvas: canvasRef.tagName }
      )
      return fallbackValue
    }
  }, [canvasRef, errorHandler])

  return {
    canvasRef,
    setCanvasRef,
    safeCanvasOperation,
    ...errorHandler
  }
}