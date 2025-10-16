/**
 * データローダーユーティリティ
 * 大量データセットの動的読み込みとフォールバック処理
 * Requirements: 5.2 - 300曲程度のデータを効率的に処理
 */

import { MusicDatabase } from '@/types/music'

/**
 * 音楽データを動的に読み込む
 * LocalStorageからデータを読み込み、空でも正常に動作する
 */
export async function loadMusicData(): Promise<MusicDatabase> {
  try {
    // LocalStorageからデータを読み込み（DataManagerを使用）
    const { DataManager } = await import('@/services/dataManager')
    const database = DataManager.loadMusicDatabase()
    
    console.log(`✅ Loaded music dataset from storage: ${database.songs?.length || 0} songs, ${database.people?.length || 0} people, ${database.tags?.length || 0} tags`)
    
    // データが空でも正常なデータベースオブジェクトを返す
    return {
      songs: database.songs || [],
      people: database.people || [],
      tags: database.tags || []
    }
  } catch (error) {
    console.error('❌ Failed to load music data:', error)
    
    // エラーが発生した場合は空のデータベースを返す
    return {
      songs: [],
      people: [],
      tags: []
    }
  }
}

/**
 * データセットのサイズ情報を取得
 */
export function getDatasetInfo(database: MusicDatabase): {
  songCount: number
  peopleCount: number
  isLargeDataset: boolean
  estimatedBubbleCount: number
} {
  const songCount = database.songs.length
  const peopleCount = database.people.length
  const isLargeDataset = songCount >= 100 // 100曲以上を大量データセットと判定
  
  // 推定シャボン玉数（楽曲 + 人物の一部）
  const estimatedBubbleCount = songCount + Math.min(peopleCount, songCount * 2)
  
  return {
    songCount,
    peopleCount,
    isLargeDataset,
    estimatedBubbleCount
  }
}

/**
 * データセットのパフォーマンス推奨設定を取得
 */
export function getRecommendedSettings(database: MusicDatabase): {
  maxBubbles: number
  enableVirtualization: boolean
  enableObjectPooling: boolean
  targetFPS: number
} {
  const info = getDatasetInfo(database)
  
  if (info.isLargeDataset) {
    // 大量データセット用の設定
    return {
      maxBubbles: Math.min(80, Math.floor(info.estimatedBubbleCount * 0.3)),
      enableVirtualization: true,
      enableObjectPooling: true,
      targetFPS: 60
    }
  } else {
    // 小規模データセット用の設定
    return {
      maxBubbles: Math.min(50, info.estimatedBubbleCount),
      enableVirtualization: false,
      enableObjectPooling: false,
      targetFPS: 60
    }
  }
}