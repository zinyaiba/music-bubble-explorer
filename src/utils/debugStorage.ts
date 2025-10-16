/**
 * LocalStorageデバッグユーティリティ
 */

import { DataManager } from '@/services/dataManager'

/**
 * LocalStorageの内容をコンソールに出力
 */
export function debugLocalStorage(): void {
  console.log('🔍 LocalStorage Debug Information')
  console.log('================================')
  
  try {
    // DataManagerを使用してデータを取得
    const database = DataManager.loadMusicDatabase()
    
    console.log('📊 Database Summary:')
    console.log(`  Songs: ${database.songs?.length || 0}`)
    console.log(`  People: ${database.people?.length || 0}`)
    console.log(`  Tags: ${database.tags?.length || 0}`)
    
    if (database.songs && database.songs.length > 0) {
      console.log('\n🎵 Songs:')
      database.songs.forEach((song, index) => {
        console.log(`  ${index + 1}. "${song.title}" (ID: ${song.id})`)
        console.log(`     作詞: ${song.lyricists.join(', ')}`)
        console.log(`     作曲: ${song.composers.join(', ')}`)
        console.log(`     編曲: ${song.arrangers.join(', ')}`)
        console.log(`     タグ: ${song.tags?.join(', ') || 'なし'}`)
      })
    }
    
    if (database.people && database.people.length > 0) {
      console.log('\n👤 People:')
      database.people.forEach((person, index) => {
        console.log(`  ${index + 1}. ${person.name} (${person.type}) - ${person.songs.length} songs`)
      })
    }
    
    if (database.tags && database.tags.length > 0) {
      console.log('\n🏷️ Tags:')
      database.tags.forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.name} - ${tag.songs.length} songs`)
      })
    }
    
    // 生のLocalStorageデータも表示
    console.log('\n💾 Raw LocalStorage Data:')
    const rawData = localStorage.getItem('music-bubble-explorer-data')
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData)
        console.log('  Version:', parsed.version)
        console.log('  Last Updated:', parsed.lastUpdated)
        console.log('  Songs Count:', parsed.songs?.length || 0)
        console.log('  Raw Data:', parsed)
      } catch (parseError) {
        console.error('  Failed to parse raw data:', parseError)
        console.log('  Raw string:', rawData.substring(0, 200) + '...')
      }
    } else {
      console.log('  No data found in LocalStorage')
    }
    
    // 統計情報
    const stats = DataManager.getDataStats()
    console.log('\n📈 Statistics:')
    console.log(`  Song Count: ${stats.songCount}`)
    console.log(`  People Count: ${stats.peopleCount}`)
    console.log(`  Storage Usage: ${stats.storageUsage.used} bytes (${stats.storageUsage.percentage.toFixed(2)}%)`)
    console.log(`  Last Updated: ${stats.lastUpdated}`)
    console.log(`  Version: ${stats.version}`)
    
  } catch (error) {
    console.error('❌ Error debugging LocalStorage:', error)
  }
  
  console.log('================================')
}

/**
 * 特定の楽曲IDを検索
 */
export function findSongById(songId: string): void {
  console.log(`🔍 Searching for song ID: ${songId}`)
  
  try {
    const database = DataManager.loadMusicDatabase()
    const song = database.songs.find(s => s.id === songId)
    
    if (song) {
      console.log('✅ Song found:')
      console.log(`  Title: ${song.title}`)
      console.log(`  ID: ${song.id}`)
      console.log(`  Lyricists: ${song.lyricists.join(', ')}`)
      console.log(`  Composers: ${song.composers.join(', ')}`)
      console.log(`  Arrangers: ${song.arrangers.join(', ')}`)
      console.log(`  Tags: ${song.tags?.join(', ') || 'なし'}`)
    } else {
      console.log('❌ Song not found in database')
      
      // 部分一致で検索
      const partialMatches = database.songs.filter(s => s.id.includes(songId))
      if (partialMatches.length > 0) {
        console.log('🔍 Partial matches found:')
        partialMatches.forEach(match => {
          console.log(`  - "${match.title}" (ID: ${match.id})`)
        })
      }
    }
  } catch (error) {
    console.error('❌ Error searching for song:', error)
  }
}

/**
 * LocalStorageをクリア
 */
export function clearLocalStorage(): void {
  console.log('🗑️ Clearing LocalStorage...')
  
  try {
    const success = DataManager.clearData()
    if (success) {
      console.log('✅ LocalStorage cleared successfully')
    } else {
      console.log('❌ Failed to clear LocalStorage')
    }
  } catch (error) {
    console.error('❌ Error clearing LocalStorage:', error)
  }
}

/**
 * ブラウザのコンソールでデバッグ関数を使用可能にする
 */
export function enableConsoleDebug(): void {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.debugStorage = debugLocalStorage
    // @ts-ignore
    window.findSong = findSongById
    // @ts-ignore
    window.clearStorage = clearLocalStorage
    
    console.log('🔧 Debug functions enabled:')
    console.log('  debugStorage() - Show all LocalStorage data')
    console.log('  findSong(id) - Find song by ID')
    console.log('  clearStorage() - Clear all LocalStorage data')
  }
}