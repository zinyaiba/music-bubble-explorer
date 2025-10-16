import { MusicDatabase, Song, Person, Tag } from '@/types/music'
import { ErrorType, safeExecute } from '@/utils/errorHandler'

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
   * 楽曲データを保存
   */
  public static saveSong(song: Song): boolean {
    return safeExecute(
      () => {
        const currentData = DataManager.loadStorageData()
        
        // 既存の楽曲を更新または新規追加
        const existingIndex = currentData.songs.findIndex(s => s.id === song.id)
        if (existingIndex >= 0) {
          currentData.songs[existingIndex] = song
        } else {
          currentData.songs.push(song)
        }
        
        // メタデータを更新
        currentData.lastUpdated = new Date().toISOString()
        currentData.metadata = {
          totalSongs: currentData.songs.length,
          totalPeople: DataManager.extractPeopleFromSongs(currentData.songs).length,
          createdAt: currentData.metadata?.createdAt || new Date().toISOString()
        }
        
        DataManager.saveStorageData(currentData)
        console.log(`Song "${song.title}" saved successfully`)
        return true
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.saveSong',
        songId: song.id,
        songTitle: song.title
      }
    ) || false
  }

  /**
   * 楽曲データを更新
   */
  public static updateSong(song: Song): boolean {
    return safeExecute(
      () => {
        const currentData = DataManager.loadStorageData()
        
        // 既存の楽曲を検索
        const existingIndex = currentData.songs.findIndex(s => s.id === song.id)
        if (existingIndex < 0) {
          throw new Error(`Song with id "${song.id}" not found`)
        }
        
        // 楽曲を更新
        currentData.songs[existingIndex] = song
        
        // メタデータを更新
        currentData.lastUpdated = new Date().toISOString()
        currentData.metadata = {
          totalSongs: currentData.songs.length,
          totalPeople: DataManager.extractPeopleFromSongs(currentData.songs).length,
          createdAt: currentData.metadata?.createdAt || new Date().toISOString()
        }
        
        DataManager.saveStorageData(currentData)
        console.log(`Song "${song.title}" updated successfully`)
        return true
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.updateSong',
        songId: song.id,
        songTitle: song.title
      }
    ) || false
  }

  /**
   * 楽曲データを削除
   */
  public static deleteSong(songId: string): boolean {
    return safeExecute(
      () => {
        const currentData = DataManager.loadStorageData()
        
        // 削除対象の楽曲を検索
        const existingIndex = currentData.songs.findIndex(s => s.id === songId)
        if (existingIndex < 0) {
          throw new Error(`Song with id "${songId}" not found`)
        }
        
        const deletedSong = currentData.songs[existingIndex]
        
        // 楽曲を削除
        currentData.songs.splice(existingIndex, 1)
        
        // メタデータを更新
        currentData.lastUpdated = new Date().toISOString()
        currentData.metadata = {
          totalSongs: currentData.songs.length,
          totalPeople: DataManager.extractPeopleFromSongs(currentData.songs).length,
          createdAt: currentData.metadata?.createdAt || new Date().toISOString()
        }
        
        DataManager.saveStorageData(currentData)
        console.log(`Song "${deletedSong.title}" deleted successfully`)
        return true
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.deleteSong',
        songId
      }
    ) || false
  }

  /**
   * 特定の楽曲データを取得
   */
  public static getSong(songId: string): Song | null {
    return safeExecute(
      () => {
        const currentData = DataManager.loadStorageData()
        const song = currentData.songs.find(s => s.id === songId)
        return song || null
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.getSong',
        songId
      }
    ) || null
  }

  /**
   * 複数の楽曲データを一括保存
   */
  public static saveSongs(songs: Song[]): boolean {
    return safeExecute(
      () => {
        const currentData = DataManager.loadStorageData()
        
        // 既存データとマージ
        songs.forEach(song => {
          const existingIndex = currentData.songs.findIndex(s => s.id === song.id)
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
          totalPeople: DataManager.extractPeopleFromSongs(currentData.songs).length,
          createdAt: currentData.metadata?.createdAt || new Date().toISOString()
        }
        
        DataManager.saveStorageData(currentData)
        console.log(`${songs.length} songs saved successfully`)
        return true
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.saveSongs',
        songCount: songs.length
      }
    ) || false
  }

  /**
   * 保存された楽曲データを読み込み
   */
  public static loadSongs(): Song[] {
    return safeExecute(
      () => {
        const data = DataManager.loadStorageData()
        console.log(`Loaded ${data.songs.length} songs from storage`)
        return data.songs
      },
      ErrorType.DATA_LOADING,
      { source: 'DataManager.loadSongs' }
    ) || []
  }

  /**
   * 完全なMusicDatabaseを読み込み
   */
  public static loadMusicDatabase(): MusicDatabase {
    return safeExecute(
      () => {
        const songs = DataManager.loadSongs()
        const people = DataManager.extractPeopleFromSongs(songs)
        const tags = DataManager.extractTagsFromSongs(songs)
        
        return {
          songs,
          people,
          tags
        }
      },
      ErrorType.DATA_LOADING,
      { source: 'DataManager.loadMusicDatabase' }
    ) || { songs: [], people: [], tags: [] }
  }

  /**
   * データをJSON形式でエクスポート
   */
  public static exportData(): string {
    return safeExecute(
      () => {
        const data = DataManager.loadStorageData()
        const exportData = {
          ...data,
          exportedAt: new Date().toISOString(),
          exportVersion: DataManager.CURRENT_VERSION
        }
        
        const jsonString = JSON.stringify(exportData, null, 2)
        console.log('Data exported successfully')
        return jsonString
      },
      ErrorType.DATA_LOADING,
      { source: 'DataManager.exportData' }
    ) || '{}'
  }

  /**
   * JSON形式のデータをインポート
   */
  public static importData(jsonData: string): boolean {
    return safeExecute(
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
          throw new Error(`Migration failed: ${migrationResult.errors?.join(', ')}`)
        }
        
        // データを保存
        const storageData: LocalStorageData = {
          songs: importedData.songs || [],
          version: DataManager.CURRENT_VERSION,
          lastUpdated: new Date().toISOString(),
          metadata: {
            totalSongs: importedData.songs?.length || 0,
            totalPeople: DataManager.extractPeopleFromSongs(importedData.songs || []).length,
            createdAt: importedData.metadata?.createdAt || new Date().toISOString()
          }
        }
        
        DataManager.saveStorageData(storageData)
        console.log(`Data imported successfully: ${storageData.songs.length} songs`)
        return true
      },
      ErrorType.DATA_LOADING,
      { 
        source: 'DataManager.importData',
        dataLength: jsonData.length
      }
    ) || false
  }

  /**
   * 保存されたデータを削除
   */
  public static clearData(): boolean {
    return safeExecute(
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
  }

  /**
   * データのバックアップを作成
   */
  public static createBackup(): boolean {
    return safeExecute(
      () => {
        const currentData = localStorage.getItem(DataManager.STORAGE_KEY)
        if (currentData) {
          const backupData = {
            data: currentData,
            backedUpAt: new Date().toISOString()
          }
          localStorage.setItem(DataManager.BACKUP_KEY, JSON.stringify(backupData))
          console.log('Backup created successfully')
        }
        return true
      },
      ErrorType.DATA_LOADING,
      { source: 'DataManager.createBackup' }
    ) || false
  }

  /**
   * バックアップからデータを復元
   */
  public static restoreFromBackup(): boolean {
    return safeExecute(
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
  }

  /**
   * ストレージの使用量を取得（概算）
   */
  public static getStorageUsage(): { used: number; available: number; percentage: number } {
    return safeExecute(
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
        lastUpdated: new Date().toISOString()
      }
    }
    
    try {
      const data = JSON.parse(stored)
      
      // バージョンマイグレーションを実行
      const migrationResult = DataManager.migrateData(data)
      if (migrationResult.success) {
        return data
      } else {
        console.warn('Migration failed, returning empty data:', migrationResult.errors)
        return {
          songs: [],
          version: DataManager.CURRENT_VERSION,
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to parse stored data:', error)
      return {
        songs: [],
        version: DataManager.CURRENT_VERSION,
        lastUpdated: new Date().toISOString()
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
            songs: []
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
            songs: []
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
            songs: []
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
      songs: Array.from(songIds)
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
      return song &&
        typeof song.id === 'string' &&
        typeof song.title === 'string' &&
        Array.isArray(song.lyricists) &&
        Array.isArray(song.composers) &&
        Array.isArray(song.arrangers)
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
          migratedTo: DataManager.CURRENT_VERSION
        }
      }
      
      // バージョン0.0.0から1.0.0へのマイグレーション
      if (currentVersion === '0.0.0') {
        // メタデータが存在しない場合は追加
        if (!data.metadata) {
          data.metadata = {
            totalSongs: data.songs?.length || 0,
            totalPeople: DataManager.extractPeopleFromSongs(data.songs || []).length,
            createdAt: new Date().toISOString()
          }
        }
        
        // バージョンを更新
        data.version = DataManager.CURRENT_VERSION
        data.lastUpdated = new Date().toISOString()
        
        return {
          success: true,
          migratedFrom: '0.0.0',
          migratedTo: DataManager.CURRENT_VERSION
        }
      }
      
      // 未知のバージョンの場合
      console.warn(`Unknown version: ${currentVersion}`)
      return {
        success: true,
        migratedFrom: currentVersion,
        migratedTo: DataManager.CURRENT_VERSION
      }
      
    } catch (error) {
      return {
        success: false,
        migratedTo: DataManager.CURRENT_VERSION,
        errors: [error instanceof Error ? error.message : 'Unknown migration error']
      }
    }
  }

  /**
   * 全てのタグ名を取得
   */
  public static getAllTags(): string[] {
    return safeExecute(
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
    return safeExecute(
      () => {
        const data = DataManager.loadStorageData()
        const storageUsage = DataManager.getStorageUsage()
        
        return {
          songCount: data.songs.length,
          peopleCount: DataManager.extractPeopleFromSongs(data.songs).length,
          storageUsage,
          lastUpdated: data.lastUpdated,
          version: data.version
        }
      },
      ErrorType.DATA_LOADING,
      { source: 'DataManager.getDataStats' }
    ) || {
      songCount: 0,
      peopleCount: 0,
      storageUsage: { used: 0, available: 0, percentage: 0 },
      lastUpdated: new Date().toISOString(),
      version: DataManager.CURRENT_VERSION
    }
  }
}