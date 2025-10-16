import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { Song } from '@/types/music'

/**
 * DataManagerの使用例を示すデモ
 */
export class DataManagerDemo {
  /**
   * 基本的な使用例
   */
  public static basicUsageExample(): void {
    console.log('=== DataManager Basic Usage Demo ===')
    
    // 1. 新しい楽曲を作成
    const newSong: Song = {
      id: 'demo-song-001',
      title: 'デモ楽曲',
      lyricists: ['デモ作詞家'],
      composers: ['デモ作曲家'],
      arrangers: ['デモ編曲家'],
      tags: ['デモ', 'テスト']
    }
    
    // 2. MusicDataService経由で楽曲を追加（自動的に永続化される）
    const musicService = MusicDataService.getInstance()
    const success = musicService.addSong(newSong)
    
    if (success) {
      console.log('✅ Song added and persisted successfully')
      
      // 3. データ統計を確認
      const stats = DataManager.getDataStats()
      console.log('📊 Current data stats:', {
        songs: stats.songCount,
        people: stats.peopleCount,
        lastUpdated: stats.lastUpdated,
        storageUsed: `${(stats.storageUsage.used / 1024).toFixed(2)} KB`
      })
    }
  }

  /**
   * データのバックアップとエクスポート例
   */
  public static backupAndExportExample(): void {
    console.log('=== DataManager Backup & Export Demo ===')
    
    // 1. 現在のデータをバックアップ
    const backupSuccess = DataManager.createBackup()
    console.log(`Backup created: ${backupSuccess ? '✅' : '❌'}`)
    
    // 2. データをエクスポート
    const exportedData = DataManager.exportData()
    console.log(`Data exported: ${exportedData.length > 10 ? '✅' : '❌'}`)
    console.log(`Export size: ${(exportedData.length / 1024).toFixed(2)} KB`)
    
    // 3. エクスポートされたデータの構造を確認
    try {
      const parsed = JSON.parse(exportedData)
      console.log('Export structure:', {
        version: parsed.version,
        songCount: parsed.songs?.length || 0,
        hasMetadata: !!parsed.metadata,
        exportedAt: parsed.exportedAt
      })
    } catch (error) {
      console.error('Failed to parse exported data:', error)
    }
  }

  /**
   * データのインポート例
   */
  public static importExample(jsonData: string): void {
    console.log('=== DataManager Import Demo ===')
    
    try {
      // 1. 現在のデータをバックアップ
      DataManager.createBackup()
      
      // 2. 新しいデータをインポート
      const importSuccess = DataManager.importData(jsonData)
      
      if (importSuccess) {
        console.log('✅ Data imported successfully')
        
        // 3. インポート後の統計を確認
        const stats = DataManager.getDataStats()
        console.log('📊 After import:', {
          songs: stats.songCount,
          people: stats.peopleCount,
          version: stats.version
        })
        
        // 4. MusicDataServiceも更新されているか確認
        const musicService = MusicDataService.getInstance()
        const allSongs = musicService.getAllSongs()
        console.log(`MusicDataService has ${allSongs.length} songs`)
        
      } else {
        console.error('❌ Import failed')
        
        // 5. 失敗した場合はバックアップから復元
        const restoreSuccess = DataManager.restoreFromBackup()
        console.log(`Restored from backup: ${restoreSuccess ? '✅' : '❌'}`)
      }
      
    } catch (error) {
      console.error('Import demo failed:', error)
    }
  }

  /**
   * ストレージ管理例
   */
  public static storageManagementExample(): void {
    console.log('=== DataManager Storage Management Demo ===')
    
    // 1. 現在のストレージ使用量を確認
    const stats = DataManager.getDataStats()
    const usage = stats.storageUsage
    
    console.log('💾 Storage Usage:')
    console.log(`  Used: ${(usage.used / 1024).toFixed(2)} KB`)
    console.log(`  Available: ${(usage.available / 1024).toFixed(2)} KB`)
    console.log(`  Percentage: ${usage.percentage.toFixed(2)}%`)
    
    // 2. 使用量に基づく推奨アクション
    if (usage.percentage > 80) {
      console.log('⚠️  Storage usage is high. Consider:')
      console.log('   - Exporting and clearing old data')
      console.log('   - Removing unused songs')
    } else if (usage.percentage > 50) {
      console.log('ℹ️  Storage usage is moderate. Monitor regularly.')
    } else {
      console.log('✅ Storage usage is healthy.')
    }
    
    // 3. データクリーンアップの例
    if (usage.percentage > 90) {
      console.log('🧹 Performing emergency cleanup...')
      
      // バックアップを作成してからクリア
      DataManager.createBackup()
      DataManager.clearData()
      
      console.log('✅ Data cleared. Use restoreFromBackup() to restore if needed.')
    }
  }

  /**
   * 全てのデモを実行
   */
  public static runAllDemos(): void {
    console.log('🚀 Running all DataManager demos...\n')
    
    try {
      DataManagerDemo.basicUsageExample()
      console.log('')
      
      DataManagerDemo.backupAndExportExample()
      console.log('')
      
      DataManagerDemo.storageManagementExample()
      console.log('')
      
      console.log('🎉 All demos completed successfully!')
      
    } catch (error) {
      console.error('❌ Demo execution failed:', error)
    }
  }
}