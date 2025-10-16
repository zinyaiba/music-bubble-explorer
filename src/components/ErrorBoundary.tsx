import React, { Component, ReactNode } from 'react'
import { ErrorHandler, ErrorType, AppError } from '@/utils/errorHandler'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: AppError) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
}

/**
 * React Error Boundary - アプリケーション全体のエラーをキャッチ
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.handleError(error, ErrorType.UNKNOWN, {
      component: 'ErrorBoundary',
      source: 'getDerivedStateFromError'
    })

    return {
      hasError: true,
      error: appError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handleError(error, ErrorType.UNKNOWN, {
      component: 'ErrorBoundary',
      source: 'componentDidCatch',
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    })

    this.props.onError?.(appError)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>🚫 エラーが発生しました</h2>
            <p className="error-message">
              {ErrorHandler.getUserFriendlyMessage(this.state.error)}
            </p>
            
            <div className="error-details">
              <details>
                <summary>詳細情報</summary>
                <pre>{this.state.error.message}</pre>
                <p><strong>発生時刻:</strong> {this.state.error.timestamp.toLocaleString()}</p>
                <p><strong>エラータイプ:</strong> {this.state.error.type}</p>
              </details>
            </div>

            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                再試行
              </button>
              <button onClick={() => window.location.reload()} className="reload-button">
                ページを再読み込み
              </button>
            </div>

            <div className="recovery-suggestions">
              <h3>解決方法:</h3>
              <ul>
                {ErrorHandler.getRecoveryActions(this.state.error).map((action, index) => (
                  <li key={index}>
                    <button onClick={action.action}>{action.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Canvas専用のエラーバウンダリ
 */
export class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.handleCanvasError(error, {
      component: 'CanvasErrorBoundary',
      source: 'getDerivedStateFromError'
    })

    return {
      hasError: true,
      error: appError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handleCanvasError(error, {
      component: 'CanvasErrorBoundary',
      source: 'componentDidCatch',
      errorInfo
    })

    this.props.onError?.(appError)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="canvas-error-fallback">
          <div className="error-icon">🎨</div>
          <h3>Canvas描画エラー</h3>
          <p>シャボン玉の描画に問題が発生しました</p>
          <button onClick={this.handleRetry} className="retry-button">
            再試行
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * データローディング専用のエラーバウンダリ
 */
export class DataLoadingErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = ErrorHandler.handleDataLoadingError(error, {
      component: 'DataLoadingErrorBoundary',
      source: 'getDerivedStateFromError'
    })

    return {
      hasError: true,
      error: appError
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = ErrorHandler.handleDataLoadingError(error, {
      component: 'DataLoadingErrorBoundary',
      source: 'componentDidCatch',
      errorInfo
    })

    this.props.onError?.(appError)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="data-loading-error-fallback">
          <div className="error-icon">📊</div>
          <h3>データ読み込みエラー</h3>
          <p>楽曲データの読み込みに失敗しました</p>
          <div className="error-actions">
            <button onClick={this.handleRetry} className="retry-button">
              再試行
            </button>
            <button onClick={() => window.location.reload()} className="reload-button">
              ページを再読み込み
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}