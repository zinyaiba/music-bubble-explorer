import { LayoutState } from './ResponsiveLayoutManager'

/**
 * レイアウト状態の永続化設定
 */
export interface PersistenceConfig {
  storageKey: string
  maxStateAge: number
  enableCompression: boolean
  enableBackup: boolean
  maxBackupCount: number
}

/**
 * バックアップ状態の情報
 */
export interface BackupStateInfo {
  timestamp: number
  deviceType: string
  screenSize: string
  reason: string
}

/**
 * レイアウト状態の永続化管理クラス
 * LocalStorageを使用した状態保存、復元、クリーンアップ機能を提供
 */
export class LayoutStatePersistence {
  private config: PersistenceConfig = {
    storageKey: 'musicBubble_layoutState',
    maxStateAge: 24 * 60 * 60 * 1000, // 24時間
    enableCompression: false, // 将来の拡張用
    enableBackup: true,
    maxBackupCount: 5,
  }

  private readonly BACKUP_KEY_PREFIX = 'musicBubble_layoutState_backup_'
  private readonly BACKUP_INDEX_KEY = 'musicBubble_layoutState_backups'

  constructor(config?: Partial<PersistenceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.initializePersistence()
  }

  /**
   * レイアウト状態を保存
   */
  public saveLayoutState(state: LayoutState): boolean {
    try {
      // 現在の状態をバックアップ
      if (this.config.enableBackup) {
        this.createBackup('manual_save')
      }

      // 状態を保存
      const serializedState = JSON.stringify(state)
      localStorage.setItem(this.config.storageKey, serializedState)

      console.log('💾 Layout state saved successfully')
      return true
    } catch (error) {
      console.error('💾 Failed to save layout state:', error)

      // ストレージ容量不足の場合はクリーンアップを試行
      if (this.isStorageQuotaExceeded(error)) {
        console.log('💾 Storage quota exceeded, attempting cleanup...')
        this.performEmergencyCleanup()

        // クリーンアップ後に再試行
        try {
          localStorage.setItem(this.config.storageKey, JSON.stringify(state))
          console.log('💾 Layout state saved after cleanup')
          return true
        } catch (retryError) {
          console.error('💾 Failed to save even after cleanup:', retryError)
        }
      }

      return false
    }
  }

  /**
   * レイアウト状態を復元
   */
  public restoreLayoutState(): LayoutState | null {
    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (!stored) {
        console.log('💾 No stored layout state found')
        return null
      }

      const parsedState: LayoutState = JSON.parse(stored)

      // 状態の有効性をチェック
      if (!this.validateStateIntegrity(parsedState)) {
        console.warn(
          '💾 Stored state is invalid, attempting backup restoration'
        )
        return this.restoreFromBackup()
      }

      // 古すぎる状態の場合はバックアップから復元を試行
      if (this.isStateExpired(parsedState)) {
        console.warn(
          '💾 Stored state is expired, attempting backup restoration'
        )
        const backupState = this.restoreFromBackup()
        if (backupState && !this.isStateExpired(backupState)) {
          return backupState
        }
        // バックアップも古い場合は現在の状態を返す（nullではなく）
        console.log('💾 Using expired state as fallback')
      }

      console.log('💾 Layout state restored successfully')
      return parsedState
    } catch (error) {
      console.error('💾 Error restoring layout state:', error)

      // パースエラーの場合はバックアップから復元を試行
      console.log('💾 Attempting backup restoration due to parse error')
      return this.restoreFromBackup()
    }
  }

  /**
   * 不正な状態データをクリーンアップ
   */
  public cleanupInvalidState(): void {
    try {
      // メイン状態をバックアップしてから削除
      const currentState = localStorage.getItem(this.config.storageKey)
      if (currentState) {
        this.createBackup('cleanup_invalid')
      }

      localStorage.removeItem(this.config.storageKey)
      console.log('💾 Invalid layout state cleaned up')
    } catch (error) {
      console.error('💾 Failed to cleanup invalid state:', error)
    }
  }

  /**
   * 期限切れの状態をクリーンアップ
   */
  public cleanupExpiredStates(): void {
    try {
      // メイン状態のチェック
      const mainState = this.restoreLayoutState()
      if (mainState && this.isStateExpired(mainState)) {
        this.cleanupInvalidState()
      }

      // バックアップ状態のクリーンアップ
      this.cleanupExpiredBackups()

      console.log('💾 Expired states cleaned up')
    } catch (error) {
      console.error('💾 Failed to cleanup expired states:', error)
    }
  }

  /**
   * ストレージ使用量を取得
   */
  public getStorageUsage(): {
    used: number
    total: number
    percentage: number
  } {
    try {
      let totalSize = 0

      // 全てのキーのサイズを計算
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('musicBubble_')) {
          const value = localStorage.getItem(key)
          if (value) {
            totalSize += key.length + value.length
          }
        }
      }

      // 概算の総容量（ブラウザによって異なる）
      const estimatedTotal = 5 * 1024 * 1024 // 5MB

      return {
        used: totalSize,
        total: estimatedTotal,
        percentage: (totalSize / estimatedTotal) * 100,
      }
    } catch (error) {
      console.error('💾 Failed to calculate storage usage:', error)
      return { used: 0, total: 0, percentage: 0 }
    }
  }

  /**
   * バックアップを作成
   */
  private createBackup(reason: string): void {
    if (!this.config.enableBackup) return

    try {
      const currentState = localStorage.getItem(this.config.storageKey)
      if (!currentState) return

      const parsedState: LayoutState = JSON.parse(currentState)
      const timestamp = Date.now()
      const backupKey = `${this.BACKUP_KEY_PREFIX}${timestamp}`

      // バックアップ情報を作成
      const backupInfo: BackupStateInfo = {
        timestamp,
        deviceType: parsedState.deviceType,
        screenSize: `${parsedState.screenSize.width}x${parsedState.screenSize.height}`,
        reason,
      }

      // バックアップを保存
      localStorage.setItem(backupKey, currentState)

      // バックアップインデックスを更新
      this.updateBackupIndex(backupInfo)

      // 古いバックアップを削除
      this.cleanupOldBackups()

      console.log(`💾 Backup created: ${backupKey}`)
    } catch (error) {
      console.error('💾 Failed to create backup:', error)
    }
  }

  /**
   * バックアップから復元
   */
  private restoreFromBackup(): LayoutState | null {
    if (!this.config.enableBackup) return null

    try {
      const backupIndex = this.getBackupIndex()
      if (backupIndex.length === 0) {
        console.log('💾 No backups available')
        return null
      }

      // 最新のバックアップから順に試行
      for (const backup of backupIndex.reverse()) {
        try {
          const backupKey = `${this.BACKUP_KEY_PREFIX}${backup.timestamp}`
          const backupData = localStorage.getItem(backupKey)

          if (backupData) {
            const parsedState: LayoutState = JSON.parse(backupData)

            if (this.validateStateIntegrity(parsedState)) {
              console.log(`💾 Restored from backup: ${backupKey}`)

              // 復元した状態をメインに保存
              this.saveLayoutState(parsedState)
              return parsedState
            }
          }
        } catch (backupError) {
          console.warn(
            `💾 Failed to restore from backup ${backup.timestamp}:`,
            backupError
          )
          continue
        }
      }

      console.warn('💾 No valid backups found')
      return null
    } catch (error) {
      console.error('💾 Error during backup restoration:', error)
      return null
    }
  }

  /**
   * バックアップインデックスを更新
   */
  private updateBackupIndex(backupInfo: BackupStateInfo): void {
    try {
      const currentIndex = this.getBackupIndex()
      currentIndex.push(backupInfo)

      // 最大数を超えた場合は古いものを削除
      while (currentIndex.length > this.config.maxBackupCount) {
        currentIndex.shift()
      }

      localStorage.setItem(this.BACKUP_INDEX_KEY, JSON.stringify(currentIndex))
    } catch (error) {
      console.error('💾 Failed to update backup index:', error)
    }
  }

  /**
   * バックアップインデックスを取得
   */
  private getBackupIndex(): BackupStateInfo[] {
    try {
      const indexData = localStorage.getItem(this.BACKUP_INDEX_KEY)
      return indexData ? JSON.parse(indexData) : []
    } catch (error) {
      console.error('💾 Failed to get backup index:', error)
      return []
    }
  }

  /**
   * 古いバックアップをクリーンアップ
   */
  private cleanupOldBackups(): void {
    try {
      const backupIndex = this.getBackupIndex()
      const currentTime = Date.now()

      // 期限切れのバックアップを特定
      const expiredBackups = backupIndex.filter(
        backup => currentTime - backup.timestamp > this.config.maxStateAge
      )

      // 期限切れのバックアップを削除
      expiredBackups.forEach(backup => {
        const backupKey = `${this.BACKUP_KEY_PREFIX}${backup.timestamp}`
        localStorage.removeItem(backupKey)
      })

      if (expiredBackups.length > 0) {
        // インデックスを更新
        const validBackups = backupIndex.filter(
          backup => currentTime - backup.timestamp <= this.config.maxStateAge
        )
        localStorage.setItem(
          this.BACKUP_INDEX_KEY,
          JSON.stringify(validBackups)
        )

        console.log(`💾 Cleaned up ${expiredBackups.length} expired backups`)
      }
    } catch (error) {
      console.error('💾 Failed to cleanup old backups:', error)
    }
  }

  /**
   * 期限切れのバックアップをクリーンアップ
   */
  private cleanupExpiredBackups(): void {
    this.cleanupOldBackups()
  }

  /**
   * 状態の整合性を検証
   */
  private validateStateIntegrity(state: LayoutState): boolean {
    if (!state || typeof state !== 'object') return false

    // 必須フィールドの存在チェック
    if (
      !state.deviceType ||
      !state.screenSize ||
      typeof state.lastUpdated !== 'number'
    ) {
      return false
    }

    // デバイス種別の妥当性チェック
    if (!['mobile', 'tablet', 'desktop'].includes(state.deviceType)) {
      return false
    }

    // 画面サイズの妥当性チェック
    if (
      typeof state.screenSize.width !== 'number' ||
      typeof state.screenSize.height !== 'number'
    ) {
      return false
    }

    if (state.screenSize.width <= 0 || state.screenSize.height <= 0) {
      return false
    }

    if (state.screenSize.width > 10000 || state.screenSize.height > 10000) {
      return false
    }

    // オリエンテーションの妥当性チェック
    if (
      state.orientation &&
      !['portrait', 'landscape'].includes(state.orientation)
    ) {
      return false
    }

    return true
  }

  /**
   * 状態が期限切れかチェック
   */
  private isStateExpired(state: LayoutState): boolean {
    return Date.now() - state.lastUpdated > this.config.maxStateAge
  }

  /**
   * ストレージ容量不足エラーかチェック
   */
  private isStorageQuotaExceeded(error: any): boolean {
    return (
      error &&
      (error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error.code === 22)
    )
  }

  /**
   * 緊急クリーンアップを実行
   */
  private performEmergencyCleanup(): void {
    try {
      console.log('💾 Performing emergency cleanup...')

      // 期限切れの状態をクリーンアップ
      this.cleanupExpiredStates()

      // 古いバックアップを削除
      this.cleanupOldBackups()

      // それでも容量が不足している場合は、最古のバックアップを削除
      const backupIndex = this.getBackupIndex()
      if (backupIndex.length > 2) {
        const oldestBackup = backupIndex[0]
        const backupKey = `${this.BACKUP_KEY_PREFIX}${oldestBackup.timestamp}`
        localStorage.removeItem(backupKey)

        backupIndex.shift()
        localStorage.setItem(this.BACKUP_INDEX_KEY, JSON.stringify(backupIndex))

        console.log('💾 Removed oldest backup for space')
      }
    } catch (error) {
      console.error('💾 Emergency cleanup failed:', error)
    }
  }

  /**
   * 永続化システムを初期化
   */
  private initializePersistence(): void {
    // 起動時に期限切れの状態をクリーンアップ
    setTimeout(() => {
      this.cleanupExpiredStates()
    }, 1000)
  }

  /**
   * 設定を更新
   */
  public updateConfig(newConfig: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 全ての関連データを削除
   */
  public clearAllData(): void {
    try {
      // メイン状態を削除
      localStorage.removeItem(this.config.storageKey)

      // バックアップを削除
      const backupIndex = this.getBackupIndex()
      backupIndex.forEach(backup => {
        const backupKey = `${this.BACKUP_KEY_PREFIX}${backup.timestamp}`
        localStorage.removeItem(backupKey)
      })

      // バックアップインデックスを削除
      localStorage.removeItem(this.BACKUP_INDEX_KEY)

      console.log('💾 All layout state data cleared')
    } catch (error) {
      console.error('💾 Failed to clear all data:', error)
    }
  }
}

/**
 * デフォルトの永続化インスタンスを作成
 */
export const createLayoutPersistence = (
  config?: Partial<PersistenceConfig>
): LayoutStatePersistence => {
  return new LayoutStatePersistence(config)
}

/**
 * グローバルな永続化インスタンス
 */
export const layoutPersistence = new LayoutStatePersistence()
