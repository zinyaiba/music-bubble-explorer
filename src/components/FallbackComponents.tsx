import React from 'react'
import { AppError, ErrorHandler } from '@/utils/errorHandler'

interface FallbackComponentProps {
  error?: AppError
  onRetry?: () => void
  onReload?: () => void
}

/**
 * データ読み込み失敗時のフォールバック表示
 */
export const DataLoadingFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  return (
    <div className="fallback-container data-loading-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">📊</div>
        <h2>データを読み込めませんでした</h2>
        <p className="fallback-message">
          楽曲データの読み込みに失敗しました。<br />
          ネットワーク接続を確認してから再試行してください。
        </p>
        
        {error && (
          <div className="error-details">
            <details>
              <summary>エラー詳細</summary>
              <p><strong>メッセージ:</strong> {error.message}</p>
              <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              ページを再読み込み
            </button>
          )}
        </div>

        <div className="fallback-suggestions">
          <h3>解決方法:</h3>
          <ul>
            <li>インターネット接続を確認してください</li>
            <li>ブラウザのキャッシュをクリアしてください</li>
            <li>しばらく時間をおいて再試行してください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Canvas描画失敗時のフォールバック表示
 */
export const CanvasRenderingFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  return (
    <div className="fallback-container canvas-rendering-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">🎨</div>
        <h2>シャボン玉を表示できませんでした</h2>
        <p className="fallback-message">
          Canvas描画に問題が発生しました。<br />
          ブラウザの設定を確認してから再試行してください。
        </p>

        {error && (
          <div className="error-details">
            <details>
              <summary>エラー詳細</summary>
              <p><strong>メッセージ:</strong> {error.message}</p>
              <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              ページを再読み込み
            </button>
          )}
        </div>

        <div className="fallback-suggestions">
          <h3>解決方法:</h3>
          <ul>
            <li>ブラウザを最新版に更新してください</li>
            <li>ハードウェアアクセラレーションを有効にしてください</li>
            <li>他のブラウザを試してください</li>
          </ul>
        </div>

        {/* 簡易的なテキストベースの代替表示 */}
        <div className="text-based-fallback">
          <h3>代替表示</h3>
          <div className="simple-bubble-list">
            <p>🎵 楽曲とアーティスト情報（テキスト版）</p>
            <div className="bubble-text-items">
              <span className="bubble-text-item">♪ サンプル楽曲1</span>
              <span className="bubble-text-item">♪ サンプル楽曲2</span>
              <span className="bubble-text-item">♪ サンプル楽曲3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ネットワークエラー時のフォールバック表示
 */
export const NetworkErrorFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  return (
    <div className="fallback-container network-error-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">🌐</div>
        <h2>ネットワーク接続エラー</h2>
        <p className="fallback-message">
          インターネット接続に問題があります。<br />
          接続を確認してから再試行してください。
        </p>

        {error && (
          <div className="error-details">
            <details>
              <summary>エラー詳細</summary>
              <p><strong>メッセージ:</strong> {error.message}</p>
              <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              ページを再読み込み
            </button>
          )}
        </div>

        <div className="fallback-suggestions">
          <h3>解決方法:</h3>
          <ul>
            <li>Wi-Fiまたはモバイルデータ接続を確認してください</li>
            <li>VPNを使用している場合は無効にしてください</li>
            <li>ファイアウォール設定を確認してください</li>
            <li>しばらく時間をおいて再試行してください</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * 一般的なエラー時のフォールバック表示
 */
export const GenericErrorFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  return (
    <div className="fallback-container generic-error-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">⚠️</div>
        <h2>予期しないエラーが発生しました</h2>
        <p className="fallback-message">
          {error ? ErrorHandler.getUserFriendlyMessage(error) : 'アプリケーションでエラーが発生しました。'}
        </p>

        {error && (
          <div className="error-details">
            <details>
              <summary>エラー詳細</summary>
              <p><strong>メッセージ:</strong> {error.message}</p>
              <p><strong>タイプ:</strong> {error.type}</p>
              <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
              {error.context && (
                <div>
                  <strong>コンテキスト:</strong>
                  <pre>{JSON.stringify(error.context, null, 2)}</pre>
                </div>
              )}
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              ページを再読み込み
            </button>
          )}
        </div>

        {error && (
          <div className="fallback-suggestions">
            <h3>解決方法:</h3>
            <ul>
              {ErrorHandler.getRecoveryActions(error).map((action, index) => (
                <li key={index}>
                  <button onClick={action.action}>{action.label}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 軽量なインライン エラー表示
 */
export const InlineErrorDisplay: React.FC<{
  message: string
  onDismiss?: () => void
}> = ({ message, onDismiss }) => {
  return (
    <div className="inline-error">
      <span className="error-icon">⚠️</span>
      <span className="error-message">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="dismiss-button">
          ×
        </button>
      )}
    </div>
  )
}

/**
 * ローディング中のエラー表示
 */
export const LoadingErrorDisplay: React.FC<{
  message?: string
  onRetry?: () => void
}> = ({ message = 'データの読み込みに失敗しました', onRetry }) => {
  return (
    <div className="loading-error">
      <div className="loading-error-content">
        <div className="error-icon">📊</div>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button-small">
            再試行
          </button>
        )}
      </div>
    </div>
  )
}