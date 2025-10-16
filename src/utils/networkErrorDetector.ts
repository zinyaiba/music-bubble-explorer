/**
 * ネットワークエラー検出ユーティリティ
 */

export interface NetworkStatus {
  isOnline: boolean
  connectionType: string
  effectiveType?: string
  downlink?: number
  rtt?: number
}

export class NetworkErrorDetector {
  private static listeners: ((status: NetworkStatus) => void)[] = []
  private static currentStatus: NetworkStatus = {
    isOnline: navigator.onLine,
    connectionType: 'unknown'
  }

  /**
   * ネットワーク状態の監視を開始
   */
  static startMonitoring(): void {
    // オンライン/オフライン状態の監視
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))

    // Connection API が利用可能な場合
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', this.handleConnectionChange.bind(this))
        this.updateConnectionInfo()
      }
    }

    // 初期状態を更新
    this.updateStatus()
  }

  /**
   * ネットワーク状態の監視を停止
   */
  static stopMonitoring(): void {
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))

    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.removeEventListener('change', this.handleConnectionChange.bind(this))
      }
    }
  }

  /**
   * ネットワーク状態変更のリスナーを追加
   */
  static addListener(listener: (status: NetworkStatus) => void): void {
    this.listeners.push(listener)
  }

  /**
   * ネットワーク状態変更のリスナーを削除
   */
  static removeListener(listener: (status: NetworkStatus) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * 現在のネットワーク状態を取得
   */
  static getCurrentStatus(): NetworkStatus {
    return { ...this.currentStatus }
  }

  /**
   * エラーがネットワーク関連かどうかを判定
   */
  static isNetworkError(error: Error | unknown): boolean {
    if (!(error instanceof Error)) return false

    const message = error.message.toLowerCase()
    const networkKeywords = [
      'network',
      'fetch',
      'connection',
      'timeout',
      'offline',
      'cors',
      'net::',
      'failed to fetch',
      'load failed',
      'network request failed'
    ]

    return networkKeywords.some(keyword => message.includes(keyword))
  }

  /**
   * 接続テストを実行
   */
  static async testConnection(url: string = '/favicon.ico', timeout: number = 5000): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * ネットワーク品質を評価
   */
  static evaluateNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' {
    if (!('connection' in navigator)) return 'unknown'

    const connection = (navigator as any).connection
    if (!connection) return 'unknown'

    const { effectiveType, downlink, rtt } = connection

    // 4G以上で高速
    if (effectiveType === '4g' && downlink > 10 && rtt < 100) {
      return 'excellent'
    }

    // 4Gで中程度
    if (effectiveType === '4g' && downlink > 1.5 && rtt < 300) {
      return 'good'
    }

    // 3Gまたは低速4G
    if (effectiveType === '3g' || (effectiveType === '4g' && downlink > 0.5)) {
      return 'fair'
    }

    // 2G以下または非常に低速
    return 'poor'
  }

  private static handleOnline(): void {
    this.updateStatus()
  }

  private static handleOffline(): void {
    this.updateStatus()
  }

  private static handleConnectionChange(): void {
    this.updateConnectionInfo()
    this.updateStatus()
  }

  private static updateConnectionInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        this.currentStatus.connectionType = connection.type || 'unknown'
        this.currentStatus.effectiveType = connection.effectiveType
        this.currentStatus.downlink = connection.downlink
        this.currentStatus.rtt = connection.rtt
      }
    }
  }

  private static updateStatus(): void {
    const newStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      connectionType: this.currentStatus.connectionType,
      effectiveType: this.currentStatus.effectiveType,
      downlink: this.currentStatus.downlink,
      rtt: this.currentStatus.rtt
    }

    const hasChanged = JSON.stringify(newStatus) !== JSON.stringify(this.currentStatus)
    this.currentStatus = newStatus

    if (hasChanged) {
      this.notifyListeners()
    }
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentStatus)
      } catch (error) {
        console.error('Error in network status listener:', error)
      }
    })
  }
}

/**
 * ネットワーク状態監視用のReactフック
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = React.useState<NetworkStatus>(
    NetworkErrorDetector.getCurrentStatus()
  )

  React.useEffect(() => {
    const handleStatusChange = (status: NetworkStatus) => {
      setNetworkStatus(status)
    }

    NetworkErrorDetector.addListener(handleStatusChange)
    NetworkErrorDetector.startMonitoring()

    return () => {
      NetworkErrorDetector.removeListener(handleStatusChange)
      NetworkErrorDetector.stopMonitoring()
    }
  }, [])

  return networkStatus
}

// React import for the hook
import React from 'react'