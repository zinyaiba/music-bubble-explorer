import React, { useState, useEffect } from 'react'
import { AppError, ErrorHandler } from '@/utils/errorHandler'
import { DataManager } from '@/services/dataManager'

interface FallbackComponentProps {
  error?: AppError
  onRetry?: () => void
  onReload?: () => void
}

interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  effectiveType?: string
}

/**
 * データ読み込み失敗時のフォールバック表示（34.5対応: 具体的なエラーメッセージ）
 */
export const DataLoadingFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null)
  const [detailedError, setDetailedError] = useState<string>('')

  useEffect(() => {
    // ネットワーク状態の監視
    const status = DataManager.monitorNetworkStatus()
    setNetworkStatus(status)

    // 詳細なエラーメッセージの生成
    if (error) {
      const detailed = DataManager.getDetailedErrorMessage(error)
      setDetailedError(detailed)
    }
  }, [error])

  return (
    <div className="fallback-container data-loading-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">📊</div>
        <h2>データを読み込めませんでした</h2>
        
        {/* 具体的なエラーメッセージ（34.5対応） */}
        <div className="fallback-message">
          {detailedError ? (
            <p className="detailed-error-message">{detailedError}</p>
          ) : (
            <p>
              楽曲データの読み込みに失敗しました。<br />
              ネットワーク接続を確認してから再試行してください。
            </p>
          )}
        </div>

        {/* ネットワーク状態の表示（34.5対応） */}
        {networkStatus && (
          <div className="network-status">
            <h3>ネットワーク状態</h3>
            <div className="status-grid">
              <div className={`status-item ${networkStatus.isOnline ? 'online' : 'offline'}`}>
                <span className="status-icon">{networkStatus.isOnline ? '🟢' : '🔴'}</span>
                <span>{networkStatus.isOnline ? 'オンライン' : 'オフライン'}</span>
              </div>
              <div className="status-item">
                <span className="status-icon">📶</span>
                <span>接続: {networkStatus.connectionType}</span>
              </div>
              {networkStatus.effectiveType && (
                <div className="status-item">
                  <span className="status-icon">⚡</span>
                  <span>速度: {networkStatus.effectiveType}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-details">
            <details>
              <summary>技術的な詳細</summary>
              <div className="error-info">
                <p><strong>エラータイプ:</strong> {error.type}</p>
                <p><strong>メッセージ:</strong> {error.message}</p>
                <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
                <p><strong>重要度:</strong> {error.severity}</p>
                {error.context && (
                  <div>
                    <strong>コンテキスト:</strong>
                    <pre>{JSON.stringify(error.context, null, 2)}</pre>
                  </div>
                )}
              </div>
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              🔄 再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              🔄 ページを再読み込み
            </button>
          )}
          <button 
            onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            className="firebase-console-button"
          >
            🔥 Firebase Console
          </button>
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
 * ネットワークエラー時のフォールバック表示（34.5対応: ネットワーク状態の監視と通知）
 */
export const NetworkErrorFallback: React.FC<FallbackComponentProps> = ({
  error,
  onRetry,
  onReload
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null)
  const [connectionTest, setConnectionTest] = useState<{
    testing: boolean
    result: string | null
  }>({ testing: false, result: null })

  useEffect(() => {
    // ネットワーク状態の監視
    const updateNetworkStatus = () => {
      const status = DataManager.monitorNetworkStatus()
      setNetworkStatus(status)
    }

    updateNetworkStatus()
    
    // ネットワーク状態の変化を監視
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  const testConnection = async () => {
    setConnectionTest({ testing: true, result: null })
    
    try {
      // Firebase接続テスト
      const connectionInfo = await DataManager.checkFirebaseConnection()
      
      if (connectionInfo.isConnected) {
        setConnectionTest({ 
          testing: false, 
          result: '✅ Firebase接続成功！データベースにアクセスできます。' 
        })
      } else {
        setConnectionTest({ 
          testing: false, 
          result: `❌ Firebase接続失敗: ${connectionInfo.error || '不明なエラー'}` 
        })
      }
    } catch (error) {
      setConnectionTest({ 
        testing: false, 
        result: `❌ 接続テスト失敗: ${error instanceof Error ? error.message : String(error)}` 
      })
    }
  }

  return (
    <div className="fallback-container network-error-fallback">
      <div className="fallback-content">
        <div className="fallback-icon">🌐</div>
        <h2>ネットワーク接続エラー</h2>
        
        {/* リアルタイムネットワーク状態（34.5対応） */}
        {networkStatus && (
          <div className="network-status-live">
            <div className={`connection-indicator ${networkStatus.isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              <span>{networkStatus.isOnline ? 'インターネット接続: 正常' : 'インターネット接続: 切断'}</span>
            </div>
            <div className="connection-details">
              <span>接続タイプ: {networkStatus.connectionType}</span>
              {networkStatus.effectiveType && (
                <span>実効速度: {networkStatus.effectiveType}</span>
              )}
            </div>
          </div>
        )}

        <p className="fallback-message">
          {networkStatus?.isOnline 
            ? 'インターネットには接続されていますが、Firebaseサーバーにアクセスできません。'
            : 'インターネット接続に問題があります。接続を確認してから再試行してください。'
          }
        </p>

        {/* 接続テスト機能（34.5対応） */}
        <div className="connection-test">
          <button 
            onClick={testConnection} 
            disabled={connectionTest.testing}
            className="test-connection-button"
          >
            {connectionTest.testing ? '🔄 テスト中...' : '🔍 接続テスト'}
          </button>
          {connectionTest.result && (
            <div className="test-result">
              {connectionTest.result}
            </div>
          )}
        </div>

        {error && (
          <div className="error-details">
            <details>
              <summary>技術的な詳細</summary>
              <div className="error-info">
                <p><strong>エラータイプ:</strong> {error.type}</p>
                <p><strong>メッセージ:</strong> {error.message}</p>
                <p><strong>発生時刻:</strong> {error.timestamp.toLocaleString()}</p>
                <p><strong>詳細エラー:</strong> {DataManager.getDetailedErrorMessage(error)}</p>
              </div>
            </details>
          </div>
        )}

        <div className="fallback-actions">
          {onRetry && (
            <button onClick={onRetry} className="retry-button">
              🔄 再試行
            </button>
          )}
          {onReload && (
            <button onClick={onReload} className="reload-button">
              🔄 ページを再読み込み
            </button>
          )}
          <button 
            onClick={() => window.open('https://downdetector.com/status/firebase/', '_blank')}
            className="status-check-button"
          >
            📊 Firebase状態確認
          </button>
        </div>

        <div className="fallback-suggestions">
          <h3>解決方法:</h3>
          <ul>
            <li>Wi-Fiまたはモバイルデータ接続を確認してください</li>
            <li>VPNを使用している場合は無効にしてください</li>
            <li>ファイアウォール設定を確認してください</li>
            <li>ブラウザのキャッシュとCookieをクリアしてください</li>
            <li>別のネットワークで試してください</li>
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