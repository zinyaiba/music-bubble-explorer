import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { Song } from '@/types/music'

/**
 * DataManagerの機能をテストするユーティリティ
 */
export class DataManagerTest {
  /**
   * 基本的な保存・読み込み機能をテスト
   */
  public static testBasicOperations(): boolean {
    console.log('🧪 Testing DataManager basic operations...')
    
    try {
      // テスト用の楽曲データを作成
      const testSong: Song = {
        id: 'test-song-1',
        title: 'テスト楽曲',
        lyricists: ['テスト作詞家'],
        composers: ['テスト作曲家'],
        arrangers: ['テスト編曲家'],
        tags: ['テスト']
      }
      
      // 楽曲を保存
      const saved = DataManager.saveSong(testSong)
      if (!saved) {
        console.error('❌ Failed to save test song')
        return false
      }
      console.log('✅ Song saved successfully')
      
      // 楽曲を読み込み
      const loadedSongs = DataManager.loadSongs()
      const foundSong = loadedSongs.find(song => song.id === testSong.id)
      
      if (!foundSong) {
        console.error('❌ Failed to load saved song')
        return false
      }
      
      if (foundSong.title !== testSong.title) {
        console.error('❌ Loaded song data does not match saved data')
        return false
      }
      console.log('✅ Song loaded successfully')
      
      // MusicDatabaseとして読み込み
      const database = DataManager.loadMusicDatabase()
      if (database.songs.length === 0) {
        console.error('❌ Failed to load music database')
        return false
      }
      console.log('✅ Music database loaded successfully')
      
      // 統計情報を取得
      const stats = DataManager.getDataStats()
      console.log('📊 Data stats:', stats)
      
      console.log('🎉 All basic operations passed!')
      return true
      
    } catch (error) {
      console.error('❌ Test failed with error:', error)
      return false
    }
  }

  /**
   * インポート・エクスポート機能をテスト
   */
  public static testImportExport(): boolean {
    console.log('🧪 Testing DataManager import/export...')
    
    try {
      // 現在のデータをエクスポート
      const exportedData = DataManager.exportData()
      if (!exportedData || exportedData === '{}') {
        console.error('❌ Failed to export data')
        return false
      }
      console.log('✅ Data exported successfully')
      
      // データをクリア
      DataManager.clearData()
      
      // 空になったことを確認
      const emptyDatabase = DataManager.loadMusicDatabase()
      if (emptyDatabase.songs.length > 0) {
        console.error('❌ Data was not cleared properly')
        return false
      }
      console.log('✅ Data cleared successfully')
      
      // データをインポート
      const imported = DataManager.importData(exportedData)
      if (!imported) {
        console.error('❌ Failed to import data')
        return false
      }
      console.log('✅ Data imported successfully')
      
      // インポートされたデータを確認
      const restoredDatabase = DataManager.loadMusicDatabase()
      if (restoredDatabase.songs.length === 0) {
        console.error('❌ Imported data is empty')
        return false
      }
      console.log('✅ Imported data verified successfully')
      
      console.log('🎉 Import/export test passed!')
      return true
      
    } catch (error) {
      console.error('❌ Import/export test failed with error:', error)
      return false
    }
  }

  /**
   * MusicDataServiceとの統合をテスト
   */
  public static testMusicDataServiceIntegration(): boolean {
    console.log('🧪 Testing MusicDataService integration...')
    
    try {
      const musicService = MusicDataService.getInstance()
      
      // 新しい楽曲を追加
      const newSong: Song = {
        id: 'integration-test-song',
        title: '統合テスト楽曲',
        lyricists: ['統合テスト作詞家'],
        composers: ['統合テスト作曲家'],
        arrangers: [],
        tags: ['統合テスト']
      }
      
      const added = musicService.addSong(newSong)
      if (!added) {
        console.error('❌ Failed to add song through MusicDataService')
        return false
      }
      console.log('✅ Song added through MusicDataService')
      
      // 楽曲が正しく保存されているか確認
      const foundSong = musicService.getSongById(newSong.id)
      if (!foundSong) {
        console.error('❌ Added song not found in MusicDataService')
        return false
      }
      console.log('✅ Added song found in MusicDataService')
      
      // LocalStorageにも保存されているか確認
      const persistedSongs = DataManager.loadSongs()
      const persistedSong = persistedSongs.find(song => song.id === newSong.id)
      if (!persistedSong) {
        console.error('❌ Added song not persisted in LocalStorage')
        return false
      }
      console.log('✅ Added song persisted in LocalStorage')
      
      // 楽曲を削除
      const removed = musicService.removeSong(newSong.id)
      if (!removed) {
        console.error('❌ Failed to remove song through MusicDataService')
        return false
      }
      console.log('✅ Song removed through MusicDataService')
      
      // 削除が永続化されているか確認
      const remainingSongs = DataManager.loadSongs()
      const deletedSong = remainingSongs.find(song => song.id === newSong.id)
      if (deletedSong) {
        console.error('❌ Deleted song still exists in LocalStorage')
        return false
      }
      console.log('✅ Song deletion persisted in LocalStorage')
      
      console.log('🎉 MusicDataService integration test passed!')
      return true
      
    } catch (error) {
      console.error('❌ Integration test failed with error:', error)
      return false
    }
  }

  /**
   * バックアップ・復元機能をテスト
   */
  public static testBackupRestore(): boolean {
    console.log('🧪 Testing backup/restore functionality...')
    
    try {
      // テストデータを保存
      const testSong: Song = {
        id: 'backup-test-song',
        title: 'バックアップテスト楽曲',
        lyricists: ['バックアップ作詞家'],
        composers: ['バックアップ作曲家'],
        arrangers: [],
        tags: ['バックアップテスト']
      }
      
      DataManager.saveSong(testSong)
      
      // バックアップを作成
      const backupCreated = DataManager.createBackup()
      if (!backupCreated) {
        console.error('❌ Failed to create backup')
        return false
      }
      console.log('✅ Backup created successfully')
      
      // データを変更
      const modifiedSong: Song = {
        ...testSong,
        title: '変更されたタイトル'
      }
      DataManager.saveSong(modifiedSong)
      
      // 変更が反映されていることを確認
      const modifiedData = DataManager.loadSongs()
      const changedSong = modifiedData.find(song => song.id === testSong.id)
      if (!changedSong || changedSong.title !== modifiedSong.title) {
        console.error('❌ Song modification was not saved')
        return false
      }
      console.log('✅ Song modification confirmed')
      
      // バックアップから復元
      const restored = DataManager.restoreFromBackup()
      if (!restored) {
        console.error('❌ Failed to restore from backup')
        return false
      }
      console.log('✅ Restored from backup successfully')
      
      // 元のデータに戻っていることを確認
      const restoredData = DataManager.loadSongs()
      const restoredSong = restoredData.find(song => song.id === testSong.id)
      if (!restoredSong || restoredSong.title !== testSong.title) {
        console.error('❌ Backup restoration failed')
        return false
      }
      console.log('✅ Backup restoration verified')
      
      console.log('🎉 Backup/restore test passed!')
      return true
      
    } catch (error) {
      console.error('❌ Backup/restore test failed with error:', error)
      return false
    }
  }

  /**
   * 全てのテストを実行
   */
  public static runAllTests(): boolean {
    console.log('🚀 Running all DataManager tests...')
    
    const results = [
      DataManagerTest.testBasicOperations(),
      DataManagerTest.testImportExport(),
      DataManagerTest.testMusicDataServiceIntegration(),
      DataManagerTest.testBackupRestore()
    ]
    
    const passed = results.filter(result => result).length
    const total = results.length
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`)
    
    if (passed === total) {
      console.log('🎉 All tests passed! DataManager is working correctly.')
      return true
    } else {
      console.log('❌ Some tests failed. Please check the implementation.')
      return false
    }
  }

  /**
   * ストレージ使用量をチェック
   */
  public static checkStorageUsage(): void {
    console.log('💾 Checking storage usage...')
    
    const usage = DataManager.getDataStats()
    console.log('Storage usage:', {
      used: `${(usage.storageUsage.used / 1024).toFixed(2)} KB`,
      available: `${(usage.storageUsage.available / 1024).toFixed(2)} KB`,
      percentage: `${usage.storageUsage.percentage.toFixed(2)}%`
    })
    
    if (usage.storageUsage.percentage > 80) {
      console.warn('⚠️ Storage usage is high (>80%). Consider cleaning up old data.')
    } else if (usage.storageUsage.percentage > 50) {
      console.log('ℹ️ Storage usage is moderate (>50%).')
    } else {
      console.log('✅ Storage usage is low (<50%).')
    }
  }
}