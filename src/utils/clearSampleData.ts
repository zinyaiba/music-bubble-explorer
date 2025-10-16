/**
 * サンプルデータクリア用ユーティリティ
 * LocalStorageに保存されたサンプルデータを削除し、クリーンな状態にする
 */

import { DataManager } from '@/services/dataManager'

/**
 * LocalStorageからすべてのサンプルデータを削除
 */
export function clearAllSampleData(): boolean {
  try {
    console.log('🧹 Clearing all sample data from LocalStorage...')
    
    // DataManagerを使用してデータを削除
    const success = DataManager.clearData()
    
    if (success) {
      console.log('✅ Sample data cleared successfully')
      
      // 追加で関連するキーも削除
      const keysToRemove = [
        'music-bubble-explorer-data',
        'music-bubble-explorer-backup',
        'bubble-manager-cache',
        'tag-manager-cache'
      ]
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to remove key ${key}:`, error)
        }
      })
      
      return true
    } else {
      console.warn('⚠️ Failed to clear sample data')
      return false
    }
  } catch (error) {
    console.error('❌ Error clearing sample data:', error)
    return false
  }
}

/**
 * サンプルデータが存在するかチェック
 */
export function hasSampleData(): boolean {
  try {
    const data = localStorage.getItem('music-bubble-explorer-data')
    if (!data) return false
    
    const parsed = JSON.parse(data)
    
    // サンプルデータの特徴的なIDパターンをチェック
    const hasSampleSongs = parsed.songs?.some((song: any) => 
      song.id?.startsWith('song_') && 
      song.lyricists?.includes('栗林みな実')
    )
    
    return hasSampleSongs || false
  } catch (error) {
    console.warn('Error checking for sample data:', error)
    return false
  }
}

/**
 * 開発環境でのみサンプルデータを自動クリア
 */
export function autoCleanupSampleData(): void {
  if (process.env.NODE_ENV === 'development') {
    if (hasSampleData()) {
      console.log('🔧 Development mode: Auto-clearing sample data')
      clearAllSampleData()
    }
  }
}

/**
 * LocalStorageの使用量を確認
 */
export function getStorageInfo(): {
  hasData: boolean
  dataSize: number
  keys: string[]
} {
  const keys: string[] = []
  let totalSize = 0
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        keys.push(key)
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
        }
      }
    }
  } catch (error) {
    console.warn('Error getting storage info:', error)
  }
  
  return {
    hasData: keys.length > 0,
    dataSize: totalSize,
    keys
  }
}