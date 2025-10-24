import { MusicDatabase, Song, Person, Tag } from '@/types/music'
import { ErrorType, safeExecute } from '@/utils/errorHandler'

/**
 * Firebase統合のためのインポート（34.2対応）
 */
let FirebaseService: any = null
const loadFirebaseService = async () => {
  if (!FirebaseService) {
    try {
      const module = await import('./firebaseService')
      FirebaseService = module.FirebaseService
    } catch (error) {
      console.warn('🔥 Firebase service not available:', error)
    }
  }
  return FirebaseService
}

/**
 * LocalStorageデータの構造
 */
interface LocalStorageData {
  songs: Song[]
  version: string
  lastUpdated: string
  metadata?: {
    totalSongs: number
    totalPeople: number
    createdAt: string
  }
}

/**
 * データバージョン管理とマイグレーション用の型
 */
interface MigrationResult {
  success: boolean
  migratedFrom?: string
  migratedTo: string
  errors?: string[]
}

/**
 * データ永続化を管理するクラス
 * LocalStorageを使用して楽曲データの保存・読み込み・インポート・エクスポート機能を提供
 */
export class DataManager {
  private static readonly STORAGE_KEY = 'music-bubble-explorer-data'
  private static readonly CURRENT_VERSION = '1.0.0'
  private static readonly BACKUP_KEY = 'music-bubble-explorer-backup'

  /**
   * 楽曲データを保存（34.3対応: Firebase専用）
   */
  public static async saveSong(song: Song): Promise<boolean> {
    return (
      safeExecute(
        async () => {
          // Firebase専用モードではFirebaseのみに保存
          const firebaseSuccess = await DataManager.saveSongToFirebase(song)

          if (firebaseSuccess) {
            console.log(`🔥 Song "${song.title}" saved to Firebase`)
            return true
          } else {
            console.error(`❌ Failed to save song "${song.title}" to Firebase`)
            return false
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.saveSong',
          songId: song.id,
          songTitle: song.title,
        }
      ) || false
    )
  }

  /**
   * Firebaseに楽曲を保存（34.2対応）
   */
  private static async saveSongToFirebase(song: Song): Promise<boolean> {
    try {
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        return false
      }

      const firebaseService = FirebaseServiceClass.getInstance()
      const firebaseId = await firebaseService.addSong(song)

      return firebaseId !== null
    } catch (error) {
      console.error('🔥 Firebase save error:', error)
      return false
    }
  }

  /**
   * 楽曲データを更新（34.3対応: Firebase専用）
   */
  public static async updateSong(song: Song): Promise<boolean> {
    return (
      safeExecute(
        async () => {
          // Firebase専用モードではFirebaseのみを更新
          const firebaseSuccess = await DataManager.updateSongInFirebase(song)

          if (firebaseSuccess) {
            console.log(`🔥 Song "${song.title}" updated in Firebase`)
            return true
          } else {
            console.error(
              `❌ Failed to update song "${song.title}" in Firebase`
            )
            return false
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.updateSong',
          songId: song.id,
          songTitle: song.title,
        }
      ) || false
    )
  }

  /**
   * Firebaseで楽曲を更新（34.2対応）
   */
  private static async updateSongInFirebase(song: Song): Promise<boolean> {
    try {
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        return false
      }

      const firebaseService = FirebaseServiceClass.getInstance()
      return await firebaseService.updateSong(song.id, song)
    } catch (error) {
      console.error('🔥 Firebase update error:', error)
      return false
    }
  }

  /**
   * 楽曲データを削除（34.3対応: Firebase専用）
   */
  public static async deleteSong(songId: string): Promise<boolean> {
    return (
      safeExecute(
        async () => {
          // Firebase専用モードではFirebaseのみから削除
          const firebaseSuccess =
            await DataManager.deleteSongFromFirebase(songId)

          if (firebaseSuccess) {
            console.log(`🔥 Song with ID "${songId}" deleted from Firebase`)
            return true
          } else {
            console.error(
              `❌ Failed to delete song with ID "${songId}" from Firebase`
            )
            return false
          }
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.deleteSong',
          songId,
        }
      ) || false
    )
  }

  /**
   * Firebaseから楽曲を削除（34.2対応）
   */
  private static async deleteSongFromFirebase(
    songId: string
  ): Promise<boolean> {
    try {
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        return false
      }

      const firebaseService = FirebaseServiceClass.getInstance()
      return await firebaseService.deleteSong(songId)
    } catch (error) {
      console.error('🔥 Firebase delete error:', error)
      return false
    }
  }

  /**
   * 特定の楽曲データを取得
   */
  public static getSong(songId: string): Song | null {
    return (
      safeExecute(
        () => {
          const currentData = DataManager.loadStorageData()
          console.log('🔍 DataManager.getSong:', {
            searchingForId: songId,
            totalSongs: currentData.songs.length,
            songIds: currentData.songs.map(s => ({ id: s.id, title: s.title })),
          })
          const song = currentData.songs.find(s => s.id === songId)
          console.log(
            '🔍 Found song:',
            song ? { id: song.id, title: song.title } : 'NOT FOUND'
          )
          return song || null
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.getSong',
          songId,
        }
      ) || null
    )
  }

  /**
   * 複数の楽曲データを一括保存
   */
  public static saveSongs(songs: Song[]): boolean {
    return (
      safeExecute(
        () => {
          const currentData = DataManager.loadStorageData()

          // 既存データとマージ
          songs.forEach(song => {
            const existingIndex = currentData.songs.findIndex(
              s => s.id === song.id
            )
            if (existingIndex >= 0) {
              currentData.songs[existingIndex] = song
            } else {
              currentData.songs.push(song)
            }
          })

          // メタデータを更新
          currentData.lastUpdated = new Date().toISOString()
          currentData.metadata = {
            totalSongs: currentData.songs.length,
            totalPeople: DataManager.extractPeopleFromSongs(currentData.songs)
              .length,
            createdAt:
              currentData.metadata?.createdAt || new Date().toISOString(),
          }

          DataManager.saveStorageData(currentData)
          console.log(`${songs.length} songs saved successfully`)
          return true
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.saveSongs',
          songCount: songs.length,
        }
      ) || false
    )
  }

  /**
   * 保存された楽曲データを読み込み
   */
  public static loadSongs(): Song[] {
    return (
      safeExecute(
        () => {
          const data = DataManager.loadStorageData()
          console.log(`Loaded ${data.songs.length} songs from storage`)
          return data.songs
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.loadSongs' }
      ) || []
    )
  }

  /**
   * 完全なMusicDatabaseを読み込み
   */
  public static loadMusicDatabase(): MusicDatabase {
    return (
      safeExecute(
        () => {
          const songs = DataManager.loadSongs()
          const people = DataManager.extractPeopleFromSongs(songs)
          const tags = DataManager.extractTagsFromSongs(songs)

          return {
            songs,
            people,
            tags,
          }
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.loadMusicDatabase' }
      ) || { songs: [], people: [], tags: [] }
    )
  }

  /**
   * データをJSON形式でエクスポート
   */
  public static exportData(): string {
    return (
      safeExecute(
        () => {
          const data = DataManager.loadStorageData()
          const exportData = {
            ...data,
            exportedAt: new Date().toISOString(),
            exportVersion: DataManager.CURRENT_VERSION,
          }

          const jsonString = JSON.stringify(exportData, null, 2)
          console.log('Data exported successfully')
          return jsonString
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.exportData' }
      ) || '{}'
    )
  }

  /**
   * JSON形式のデータをインポート
   */
  public static importData(jsonData: string): boolean {
    return (
      safeExecute(
        () => {
          const importedData = JSON.parse(jsonData)

          // データの妥当性を検証
          if (!DataManager.validateImportData(importedData)) {
            throw new Error('Invalid import data format')
          }

          // バックアップを作成
          DataManager.createBackup()

          // バージョンマイグレーションを実行
          const migrationResult = DataManager.migrateData(importedData)
          if (!migrationResult.success) {
            throw new Error(
              `Migration failed: ${migrationResult.errors?.join(', ')}`
            )
          }

          // データを保存
          const storageData: LocalStorageData = {
            songs: importedData.songs || [],
            version: DataManager.CURRENT_VERSION,
            lastUpdated: new Date().toISOString(),
            metadata: {
              totalSongs: importedData.songs?.length || 0,
              totalPeople: DataManager.extractPeopleFromSongs(
                importedData.songs || []
              ).length,
              createdAt:
                importedData.metadata?.createdAt || new Date().toISOString(),
            },
          }

          DataManager.saveStorageData(storageData)
          console.log(
            `Data imported successfully: ${storageData.songs.length} songs`
          )
          return true
        },
        ErrorType.DATA_LOADING,
        {
          source: 'DataManager.importData',
          dataLength: jsonData.length,
        }
      ) || false
    )
  }

  /**
   * 保存されたデータを削除
   */
  public static clearData(): boolean {
    return (
      safeExecute(
        () => {
          // バックアップを作成してから削除
          DataManager.createBackup()

          localStorage.removeItem(DataManager.STORAGE_KEY)
          console.log('All data cleared successfully')
          return true
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.clearData' }
      ) || false
    )
  }

  /**
   * データのバックアップを作成
   */
  public static createBackup(): boolean {
    return (
      safeExecute(
        () => {
          const currentData = localStorage.getItem(DataManager.STORAGE_KEY)
          if (currentData) {
            const backupData = {
              data: currentData,
              backedUpAt: new Date().toISOString(),
            }
            localStorage.setItem(
              DataManager.BACKUP_KEY,
              JSON.stringify(backupData)
            )
            console.log('Backup created successfully')
          }
          return true
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.createBackup' }
      ) || false
    )
  }

  /**
   * バックアップからデータを復元
   */
  public static restoreFromBackup(): boolean {
    return (
      safeExecute(
        () => {
          const backupData = localStorage.getItem(DataManager.BACKUP_KEY)
          if (!backupData) {
            throw new Error('No backup data found')
          }

          const backup = JSON.parse(backupData)
          localStorage.setItem(DataManager.STORAGE_KEY, backup.data)
          console.log('Data restored from backup successfully')
          return true
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.restoreFromBackup' }
      ) || false
    )
  }

  /**
   * ストレージの使用量を取得（概算）
   */
  public static getStorageUsage(): {
    used: number
    available: number
    percentage: number
  } {
    return (
      safeExecute(
        () => {
          const data = localStorage.getItem(DataManager.STORAGE_KEY)
          const used = data ? new Blob([data]).size : 0
          const available = 5 * 1024 * 1024 // 5MB (LocalStorageの一般的な制限)
          const percentage = (used / available) * 100

          return { used, available, percentage }
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.getStorageUsage' }
      ) || { used: 0, available: 0, percentage: 0 }
    )
  }

  // Private helper methods

  /**
   * LocalStorageからデータを読み込み
   */
  private static loadStorageData(): LocalStorageData {
    const stored = localStorage.getItem(DataManager.STORAGE_KEY)

    if (!stored) {
      return {
        songs: [],
        version: DataManager.CURRENT_VERSION,
        lastUpdated: new Date().toISOString(),
      }
    }

    try {
      const data = JSON.parse(stored)

      // バージョンマイグレーションを実行
      const migrationResult = DataManager.migrateData(data)
      if (migrationResult.success) {
        return data
      } else {
        console.warn(
          'Migration failed, returning empty data:',
          migrationResult.errors
        )
        return {
          songs: [],
          version: DataManager.CURRENT_VERSION,
          lastUpdated: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error('Failed to parse stored data:', error)
      return {
        songs: [],
        version: DataManager.CURRENT_VERSION,
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  /**
   * LocalStorageにデータを保存
   */
  private static saveStorageData(data: LocalStorageData): void {
    try {
      const jsonString = JSON.stringify(data)
      localStorage.setItem(DataManager.STORAGE_KEY, jsonString)
    } catch (error) {
      console.error('Failed to save data to localStorage:', error)
      throw error
    }
  }

  /**
   * 楽曲データから人物データを抽出
   */
  private static extractPeopleFromSongs(songs: Song[]): Person[] {
    const peopleMap = new Map<string, Person>()

    songs.forEach(song => {
      // 作詞家を追加
      song.lyricists.forEach(name => {
        const id = `lyricist-${name}`
        if (!peopleMap.has(id)) {
          peopleMap.set(id, {
            id,
            name,
            type: 'lyricist',
            songs: [],
          })
        }
        peopleMap.get(id)!.songs.push(song.id)
      })

      // 作曲家を追加
      song.composers.forEach(name => {
        const id = `composer-${name}`
        if (!peopleMap.has(id)) {
          peopleMap.set(id, {
            id,
            name,
            type: 'composer',
            songs: [],
          })
        }
        peopleMap.get(id)!.songs.push(song.id)
      })

      // 編曲家を追加
      song.arrangers.forEach(name => {
        const id = `arranger-${name}`
        if (!peopleMap.has(id)) {
          peopleMap.set(id, {
            id,
            name,
            type: 'arranger',
            songs: [],
          })
        }
        peopleMap.get(id)!.songs.push(song.id)
      })
    })

    return Array.from(peopleMap.values())
  }

  /**
   * 楽曲データからタグデータを抽出
   */
  private static extractTagsFromSongs(songs: Song[]): Tag[] {
    const tagMap = new Map<string, Set<string>>()

    songs.forEach(song => {
      if (song.tags && song.tags.length > 0) {
        song.tags.forEach(tagName => {
          if (!tagMap.has(tagName)) {
            tagMap.set(tagName, new Set())
          }
          tagMap.get(tagName)!.add(song.id)
        })
      }
    })

    return Array.from(tagMap.entries()).map(([tagName, songIds]) => ({
      id: `tag-${tagName}`,
      name: tagName,
      songs: Array.from(songIds),
    }))
  }

  /**
   * インポートデータの妥当性を検証
   */
  private static validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false
    }

    if (!Array.isArray(data.songs)) {
      return false
    }

    // 各楽曲データの妥当性をチェック
    return data.songs.every((song: any) => {
      return (
        song &&
        typeof song.id === 'string' &&
        typeof song.title === 'string' &&
        Array.isArray(song.lyricists) &&
        Array.isArray(song.composers) &&
        Array.isArray(song.arrangers)
      )
    })
  }

  /**
   * データバージョンマイグレーション
   */
  private static migrateData(data: any): MigrationResult {
    try {
      const currentVersion = data.version || '0.0.0'

      // 現在のバージョンと同じ場合はマイグレーション不要
      if (currentVersion === DataManager.CURRENT_VERSION) {
        return {
          success: true,
          migratedTo: DataManager.CURRENT_VERSION,
        }
      }

      // バージョン0.0.0から1.0.0へのマイグレーション
      if (currentVersion === '0.0.0') {
        // メタデータが存在しない場合は追加
        if (!data.metadata) {
          data.metadata = {
            totalSongs: data.songs?.length || 0,
            totalPeople: DataManager.extractPeopleFromSongs(data.songs || [])
              .length,
            createdAt: new Date().toISOString(),
          }
        }

        // バージョンを更新
        data.version = DataManager.CURRENT_VERSION
        data.lastUpdated = new Date().toISOString()

        return {
          success: true,
          migratedFrom: '0.0.0',
          migratedTo: DataManager.CURRENT_VERSION,
        }
      }

      // 未知のバージョンの場合
      console.warn(`Unknown version: ${currentVersion}`)
      return {
        success: true,
        migratedFrom: currentVersion,
        migratedTo: DataManager.CURRENT_VERSION,
      }
    } catch (error) {
      return {
        success: false,
        migratedTo: DataManager.CURRENT_VERSION,
        errors: [
          error instanceof Error ? error.message : 'Unknown migration error',
        ],
      }
    }
  }

  /**
   * 全てのタグ名を取得
   */
  public static getAllTags(): string[] {
    return (
      safeExecute(
        () => {
          const songs = DataManager.loadSongs()
          const tagSet = new Set<string>()

          songs.forEach(song => {
            if (song.tags && song.tags.length > 0) {
              song.tags.forEach(tag => tagSet.add(tag))
            }
          })

          return Array.from(tagSet).sort()
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.getAllTags' }
      ) || []
    )
  }

  /**
   * データベースの統計情報を取得
   */
  public static getDataStats(): {
    songCount: number
    peopleCount: number
    storageUsage: { used: number; available: number; percentage: number }
    lastUpdated: string
    version: string
  } {
    return (
      safeExecute(
        () => {
          const data = DataManager.loadStorageData()
          const storageUsage = DataManager.getStorageUsage()

          return {
            songCount: data.songs.length,
            peopleCount: DataManager.extractPeopleFromSongs(data.songs).length,
            storageUsage,
            lastUpdated: data.lastUpdated,
            version: data.version,
          }
        },
        ErrorType.DATA_LOADING,
        { source: 'DataManager.getDataStats' }
      ) || {
        songCount: 0,
        peopleCount: 0,
        storageUsage: { used: 0, available: 0, percentage: 0 },
        lastUpdated: new Date().toISOString(),
        version: DataManager.CURRENT_VERSION,
      }
    )
  }

  /**
   * Firebase接続状態の監視と表示機能（34.2対応）
   */
  public static async checkFirebaseConnection(): Promise<{
    isConnected: boolean
    error: string | null
    details: any
  }> {
    try {
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        return {
          isConnected: false,
          error: 'Firebase service not available',
          details: { reason: 'Service not loaded' },
        }
      }

      const firebaseService = FirebaseServiceClass.getInstance()
      const isConnected = await firebaseService.checkConnection()

      if (isConnected) {
        const stats = await firebaseService.getStats()
        return {
          isConnected: true,
          error: null,
          details: {
            totalSongs: stats.totalSongs,
            totalTags: stats.totalTags.size,
            recentSongsCount: stats.recentSongsCount,
          },
        }
      } else {
        return {
          isConnected: false,
          error: 'Firebase connection failed',
          details: { reason: 'Connection test failed' },
        }
      }
    } catch (error) {
      return {
        isConnected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      }
    }
  }

  /**
   * データベース操作エラーハンドリングの強化（34.2対応）
   */
  public static async syncWithFirebase(): Promise<{
    success: boolean
    syncedSongs: number
    errors: string[]
  }> {
    const errors: string[] = []
    let syncedSongs = 0

    try {
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        errors.push('Firebase service not available')
        return { success: false, syncedSongs: 0, errors }
      }

      const firebaseService = FirebaseServiceClass.getInstance()

      // 接続チェック
      const isConnected = await firebaseService.checkConnection()
      if (!isConnected) {
        errors.push('Firebase connection failed')
        return { success: false, syncedSongs: 0, errors }
      }

      // ローカルの楽曲を取得
      const localSongs = DataManager.loadSongs()

      // Firebaseの楽曲を取得
      const firebaseSongs = await firebaseService.getAllSongs()
      const firebaseIds = new Set(firebaseSongs.map((s: any) => s.id))

      // ローカルにあってFirebaseにない楽曲をアップロード
      for (const song of localSongs) {
        if (!firebaseIds.has(song.id)) {
          try {
            const firebaseId = await firebaseService.addSong(song)
            if (firebaseId) {
              syncedSongs++
            } else {
              errors.push(`Failed to sync song: ${song.title}`)
            }
          } catch (error) {
            errors.push(
              `Error syncing song ${song.title}: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }
      }

      return {
        success: errors.length === 0,
        syncedSongs,
        errors,
      }
    } catch (error) {
      errors.push(
        `Sync error: ${error instanceof Error ? error.message : String(error)}`
      )
      return { success: false, syncedSongs: 0, errors }
    }
  }

  /**
   * ネットワーク状態の監視と通知（34.2対応）
   */
  public static monitorNetworkStatus(): {
    isOnline: boolean
    connectionType: string
    effectiveType?: string
  } {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return {
        isOnline: true,
        connectionType: 'unknown',
      }
    }

    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection

    return {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || undefined,
    }
  }

  /**
   * 既存ローカルストレージデータのクリア処理（34.3対応）
   */
  public static clearLocalStorageData(): {
    success: boolean
    clearedItems: string[]
    errors: string[]
  } {
    const clearedItems: string[] = []
    const errors: string[] = []

    try {
      // 既存のローカルストレージキーをクリア
      const keysToRemove = [
        DataManager.STORAGE_KEY,
        DataManager.BACKUP_KEY,
        'music-bubble-explorer-songs', // 古いキー
        'music-data', // 古いキー
        'bubble-data', // 古いキー
        'shared-music-data', // 共有データキー
      ]

      keysToRemove.forEach(key => {
        try {
          const existingData = localStorage.getItem(key)
          if (existingData) {
            localStorage.removeItem(key)
            clearedItems.push(key)
            console.log(`🗑️ Cleared localStorage key: ${key}`)
          }
        } catch (error) {
          errors.push(
            `Failed to clear ${key}: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      })

      // セッションストレージもクリア
      try {
        const sessionKeys = ['music-cache', 'bubble-cache', 'temp-music-data']
        sessionKeys.forEach(key => {
          const existingData = sessionStorage.getItem(key)
          if (existingData) {
            sessionStorage.removeItem(key)
            clearedItems.push(`session:${key}`)
            console.log(`🗑️ Cleared sessionStorage key: ${key}`)
          }
        })
      } catch (error) {
        errors.push(
          `Failed to clear sessionStorage: ${error instanceof Error ? error.message : String(error)}`
        )
      }

      return {
        success: errors.length === 0,
        clearedItems,
        errors,
      }
    } catch (error) {
      errors.push(
        `General error: ${error instanceof Error ? error.message : String(error)}`
      )
      return {
        success: false,
        clearedItems,
        errors,
      }
    }
  }

  /**
   * Firebase専用データ管理への移行（34.3対応）
   */
  public static async migrateToFirebaseOnly(): Promise<{
    success: boolean
    migratedSongs: number
    errors: string[]
  }> {
    const errors: string[] = []
    let migratedSongs = 0

    try {
      // ローカルストレージから既存データを取得
      const localData = DataManager.loadStorageData()

      if (localData.songs.length === 0) {
        console.log('📭 No local songs to migrate')
        return { success: true, migratedSongs: 0, errors: [] }
      }

      console.log(`🔄 Migrating ${localData.songs.length} songs to Firebase...`)

      // Firebase接続をチェック
      const FirebaseServiceClass = await loadFirebaseService()
      if (!FirebaseServiceClass) {
        errors.push('Firebase service not available')
        return { success: false, migratedSongs: 0, errors }
      }

      const firebaseService = FirebaseServiceClass.getInstance()
      const isConnected = await firebaseService.checkConnection()

      if (!isConnected) {
        errors.push('Firebase connection failed')
        return { success: false, migratedSongs: 0, errors }
      }

      // 既存のFirebaseデータを取得
      const existingSongs = await firebaseService.getAllSongs()
      const existingIds = new Set(existingSongs.map((s: any) => s.id))

      // ローカルの楽曲をFirebaseに移行
      for (const song of localData.songs) {
        try {
          if (!existingIds.has(song.id)) {
            const firebaseId = await firebaseService.addSong(song)
            if (firebaseId) {
              migratedSongs++
              console.log(`✅ Migrated song: ${song.title}`)
            } else {
              errors.push(`Failed to migrate song: ${song.title}`)
            }
          } else {
            console.log(`⏭️ Song already exists in Firebase: ${song.title}`)
          }
        } catch (error) {
          errors.push(
            `Error migrating song ${song.title}: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }

      // 移行完了後、ローカルストレージをクリア
      if (
        migratedSongs > 0 ||
        localData.songs.length === existingSongs.length
      ) {
        const clearResult = DataManager.clearLocalStorageData()
        if (!clearResult.success) {
          errors.push(...clearResult.errors)
        } else {
          console.log(
            `🗑️ Cleared local storage: ${clearResult.clearedItems.join(', ')}`
          )
        }
      }

      return {
        success: errors.length === 0,
        migratedSongs,
        errors,
      }
    } catch (error) {
      errors.push(
        `Migration error: ${error instanceof Error ? error.message : String(error)}`
      )
      return { success: false, migratedSongs: 0, errors }
    }
  }

  /**
   * 具体的なエラーメッセージの実装（34.2対応）
   */
  public static getDetailedErrorMessage(error: any): string {
    if (!error) return 'Unknown error occurred'

    // Firebase特有のエラー
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          return 'Firebase: アクセス権限がありません。認証状態を確認してください。'
        case 'unavailable':
          return 'Firebase: サービスが一時的に利用できません。しばらく後に再試行してください。'
        case 'not-found':
          return 'Firebase: 指定されたデータが見つかりません。'
        case 'already-exists':
          return 'Firebase: 同じデータが既に存在します。'
        case 'resource-exhausted':
          return 'Firebase: リソースの制限に達しました。'
        case 'failed-precondition':
          return 'Firebase: 操作の前提条件が満たされていません。'
        case 'aborted':
          return 'Firebase: 操作が中断されました。'
        case 'out-of-range':
          return 'Firebase: 指定された値が範囲外です。'
        case 'unimplemented':
          return 'Firebase: この機能は実装されていません。'
        case 'internal':
          return 'Firebase: 内部エラーが発生しました。'
        case 'deadline-exceeded':
          return 'Firebase: 操作がタイムアウトしました。'
        case 'cancelled':
          return 'Firebase: 操作がキャンセルされました。'
        default:
          return `Firebase エラー (${error.code}): ${error.message || 'Unknown error'}`
      }
    }

    // ネットワークエラー
    if (error.message && error.message.includes('network')) {
      return 'ネットワーク接続エラー: インターネット接続を確認してください。'
    }

    // 一般的なエラー
    if (error instanceof Error) {
      return `エラー: ${error.message}`
    }

    return `予期しないエラー: ${String(error)}`
  }
}
