/**
 * ContentTracker の使用例
 * Requirements: 3.1, 3.2, 3.3, 3.4 - 重複防止アルゴリズムの使用方法
 */

import { ContentTracker } from '@/utils/contentTracker'
import type { Song, Person, Tag } from '@/types/music'
import type { ConsolidatedPerson } from '@/types/consolidatedPerson'
import type { BubbleRegistryConfig } from '@/types/bubbleRegistry'

// サンプルデータ
const sampleSongs: Song[] = [
  {
    id: 'song1',
    title: '春の歌',
    lyricists: ['田中太郎'],
    composers: ['佐藤花子'],
    arrangers: ['鈴木次郎'],
    tags: ['春', 'バラード']
  },
  {
    id: 'song2',
    title: '夏祭り',
    lyricists: ['佐藤花子'],
    composers: ['田中太郎'],
    arrangers: [],
    tags: ['夏', 'アップテンポ']
  },
  {
    id: 'song3',
    title: '秋の風',
    lyricists: ['鈴木次郎'],
    composers: ['鈴木次郎'],
    arrangers: ['田中太郎'],
    tags: ['秋', 'バラード']
  }
]

const samplePeople: Person[] = [
  {
    id: 'person1',
    name: '田中太郎',
    songs: ['song1', 'song2', 'song3']
  },
  {
    id: 'person2',
    name: '佐藤花子',
    songs: ['song1', 'song2']
  },
  {
    id: 'person3',
    name: '鈴木次郎',
    songs: ['song1', 'song3']
  }
]

const sampleTags: Tag[] = [
  {
    id: 'tag1',
    name: '春',
    songs: ['song1']
  },
  {
    id: 'tag2',
    name: '夏',
    songs: ['song2']
  },
  {
    id: 'tag3',
    name: '秋',
    songs: ['song3']
  },
  {
    id: 'tag4',
    name: 'バラード',
    songs: ['song1', 'song3']
  }
]

const sampleConsolidatedPersons: ConsolidatedPerson[] = [
  {
    name: '田中太郎',
    roles: [
      { type: 'lyricist', songCount: 1 },
      { type: 'composer', songCount: 1 },
      { type: 'arranger', songCount: 1 }
    ],
    totalRelatedCount: 3,
    songs: ['song1', 'song2', 'song3']
  },
  {
    name: '佐藤花子',
    roles: [
      { type: 'lyricist', songCount: 1 },
      { type: 'composer', songCount: 1 }
    ],
    totalRelatedCount: 2,
    songs: ['song1', 'song2']
  },
  {
    name: '鈴木次郎',
    roles: [
      { type: 'lyricist', songCount: 1 },
      { type: 'composer', songCount: 1 },
      { type: 'arranger', songCount: 1 }
    ],
    totalRelatedCount: 3,
    songs: ['song1', 'song3']
  }
]

/**
 * 基本的な使用例
 */
export function basicContentTrackerUsage(): void {
  console.log('=== ContentTracker 基本使用例 ===')
  
  // 1. ContentTrackerを初期化
  const contentTracker = new ContentTracker()
  
  // 2. コンテンツプールを初期化
  contentTracker.initializeContentPool(sampleSongs, samplePeople, sampleTags, sampleConsolidatedPersons)
  
  // 3. 初期統計を表示
  const initialStats = contentTracker.getStats()
  console.log('初期統計:', {
    総コンテンツ数: initialStats.totalContent,
    利用可能: initialStats.availableContent,
    表示中: initialStats.displayedContent,
    楽曲数: initialStats.songCount,
    人物数: initialStats.personCount,
    タグ数: initialStats.tagCount
  })
  
  // 4. コンテンツを選択して表示
  console.log('\n--- コンテンツ選択と表示 ---')
  for (let i = 0; i < 5; i++) {
    const selectedContent = contentTracker.selectNextContent()
    if (selectedContent) {
      const bubbleId = `bubble_${Date.now()}_${i}`
      const success = contentTracker.trackDisplayedItem(selectedContent.id, bubbleId, selectedContent.type)
      
      console.log(`選択 ${i + 1}:`, {
        コンテンツ: selectedContent.name,
        タイプ: selectedContent.type,
        関連数: selectedContent.relatedCount,
        追跡成功: success,
        バブルID: bubbleId
      })
    } else {
      console.log(`選択 ${i + 1}: 利用可能なコンテンツがありません`)
    }
  }
  
  // 5. 表示後の統計を確認
  const afterStats = contentTracker.getStats()
  console.log('\n表示後統計:', {
    利用可能: afterStats.availableContent,
    表示中: afterStats.displayedContent,
    回転サイクル: afterStats.rotationStats.currentCycle,
    選択効率: `${(afterStats.selectionEfficiency * 100).toFixed(1)}%`
  })
}

/**
 * 重み付き選択の設定例
 */
export function weightedSelectionExample(): void {
  console.log('\n=== 重み付き選択設定例 ===')
  
  // カスタム設定で ContentTracker を初期化
  const customConfig: Partial<BubbleRegistryConfig> = {
    maxDisplayedItems: 10,
    rotationCooldown: 5000, // 5秒
    enableWeightedSelection: true,
    weightedConfig: {
      recencyWeight: 0.4,    // 最近表示されたものを避ける重み
      popularityWeight: 0.3, // 人気度（関連数）の重み
      typeBalanceWeight: 0.2, // タイプバランスの重み
      randomWeight: 0.1      // ランダム要素の重み
    },
    enableRotationStrategy: true
  }
  
  const contentTracker = new ContentTracker(customConfig)
  contentTracker.initializeContentPool(sampleSongs, samplePeople, sampleTags, sampleConsolidatedPersons)
  
  console.log('重み付き設定:', customConfig.weightedConfig)
  
  // 複数回選択してタイプバランスを確認
  const typeCount = { song: 0, person: 0, tag: 0 }
  const selections: Array<{ name: string; type: string; relatedCount: number }> = []
  
  for (let i = 0; i < 15; i++) {
    const selected = contentTracker.selectNextContent()
    if (selected) {
      typeCount[selected.type]++
      selections.push({
        name: selected.name,
        type: selected.type,
        relatedCount: selected.relatedCount
      })
      
      // 一時的に追跡して重複を避ける
      const bubbleId = `temp_bubble_${i}`
      contentTracker.trackDisplayedItem(selected.id, bubbleId, selected.type)
      
      // 短時間後に解除（実際のシャボン玉の寿命をシミュレート）
      setTimeout(() => {
        contentTracker.untrackDisplayedItem(bubbleId)
      }, 100 * i)
    }
  }
  
  console.log('\n選択結果:', selections)
  console.log('タイプ分布:', typeCount)
}

/**
 * 回転戦略のデモ
 */
export function rotationStrategyDemo(): void {
  console.log('\n=== 回転戦略デモ ===')
  
  const contentTracker = new ContentTracker({
    maxDisplayedItems: 3, // 少ない表示数で強制回転を発生させる
    enableRotationStrategy: true,
    rotationCooldown: 1000
  })
  
  contentTracker.initializeContentPool(sampleSongs, samplePeople, sampleTags)
  
  console.log('最大表示数: 3（総コンテンツ数より少ない）')
  
  // 表示数上限まで追跡
  const trackedBubbles: string[] = []
  for (let i = 0; i < 5; i++) {
    const selected = contentTracker.selectNextContent()
    if (selected) {
      const bubbleId = `rotation_bubble_${i}`
      const success = contentTracker.trackDisplayedItem(selected.id, bubbleId, selected.type)
      
      if (success) {
        trackedBubbles.push(bubbleId)
        console.log(`追跡 ${i + 1}: ${selected.name} (${selected.type}) - 成功`)
      } else {
        console.log(`追跡 ${i + 1}: ${selected.name} (${selected.type}) - 失敗（上限または重複）`)
      }
      
      const stats = contentTracker.getStats()
      console.log(`  現在の状態: 表示中=${stats.displayedContent}, 利用可能=${stats.availableContent}, 強制回転=${stats.rotationStats.forcedRotations}`)
    }
  }
  
  // 強制回転の発生を確認
  const finalStats = contentTracker.getStats()
  if (finalStats.rotationStats.forcedRotations > 0) {
    console.log(`\n強制回転が ${finalStats.rotationStats.forcedRotations} 回発生しました`)
  }
}

/**
 * デバッグ情報の表示例
 */
export function debugInfoExample(): void {
  console.log('\n=== デバッグ情報表示例 ===')
  
  const contentTracker = new ContentTracker()
  contentTracker.initializeContentPool(sampleSongs, samplePeople, sampleTags, sampleConsolidatedPersons)
  
  // いくつかのアイテムを表示
  for (let i = 0; i < 3; i++) {
    const selected = contentTracker.selectNextContent()
    if (selected) {
      contentTracker.trackDisplayedItem(selected.id, `debug_bubble_${i}`, selected.type)
    }
  }
  
  // デバッグ情報を取得
  const debugInfo = contentTracker.getDebugInfo()
  
  console.log('表示中コンテンツ:')
  debugInfo.displayedContent.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.contentId} (${item.type}) - バブル: ${item.bubbleId}`)
  })
  
  console.log('\n利用可能コンテンツ（最初の5件）:')
  debugInfo.availableContent.slice(0, 5).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name} (${item.type}) - 関連数: ${item.relatedCount}`)
  })
  
  console.log('\n回転状態:')
  console.log(`  現在のサイクル: ${debugInfo.rotationState.currentCycle}`)
  console.log(`  完了したサイクル: ${debugInfo.rotationState.completedCycles}`)
  console.log(`  現在のサイクルのアイテム数: ${debugInfo.rotationState.itemsInCurrentCycle.size}`)
  console.log(`  強制回転回数: ${debugInfo.rotationState.forcedRotations}`)
  
  console.log('\nタイプローテーションキュー:', debugInfo.typeRotationQueue)
  console.log('現在のタイプインデックス:', debugInfo.currentTypeIndex)
  
  // 選択重みの例（最初の3件）
  console.log('\n選択重み（最初の3件）:')
  let count = 0
  for (const [contentId, weights] of debugInfo.selectionWeights) {
    if (count >= 3) break
    console.log(`  ${contentId}:`)
    console.log(`    最近度: ${weights.recencyScore.toFixed(3)}`)
    console.log(`    人気度: ${weights.popularityScore.toFixed(3)}`)
    console.log(`    バランス: ${weights.typeBalanceScore.toFixed(3)}`)
    console.log(`    回転: ${weights.rotationScore.toFixed(3)}`)
    console.log(`    総重み: ${weights.totalWeight.toFixed(3)}`)
    count++
  }
}

/**
 * パフォーマンステスト例
 */
export function performanceTestExample(): void {
  console.log('\n=== パフォーマンステスト例 ===')
  
  // 大量のデータを生成
  const largeSongs: Song[] = []
  const largePeople: Person[] = []
  const largeTags: Tag[] = []
  
  for (let i = 0; i < 1000; i++) {
    largeSongs.push({
      id: `song_${i}`,
      title: `楽曲 ${i}`,
      lyricists: [`person_${i % 100}`],
      composers: [`person_${(i + 1) % 100}`],
      arrangers: [`person_${(i + 2) % 100}`],
      tags: [`tag_${i % 50}`]
    })
  }
  
  for (let i = 0; i < 100; i++) {
    largePeople.push({
      id: `person_${i}`,
      name: `人物 ${i}`,
      songs: largeSongs.filter(s => 
        s.lyricists.includes(`person_${i}`) || 
        s.composers.includes(`person_${i}`) || 
        s.arrangers.includes(`person_${i}`)
      ).map(s => s.id)
    })
  }
  
  for (let i = 0; i < 50; i++) {
    largeTags.push({
      id: `tag_${i}`,
      name: `タグ ${i}`,
      songs: largeSongs.filter(s => s.tags.includes(`tag_${i}`)).map(s => s.id)
    })
  }
  
  console.log(`テストデータ: 楽曲${largeSongs.length}件, 人物${largePeople.length}件, タグ${largeTags.length}件`)
  
  // 初期化時間を測定
  const startInit = performance.now()
  const contentTracker = new ContentTracker()
  contentTracker.initializeContentPool(largeSongs, largePeople, largeTags)
  const initTime = performance.now() - startInit
  
  console.log(`初期化時間: ${initTime.toFixed(2)}ms`)
  
  // 選択時間を測定
  const startSelection = performance.now()
  const selections = []
  for (let i = 0; i < 100; i++) {
    const selected = contentTracker.selectNextContent()
    if (selected) {
      selections.push(selected)
      contentTracker.trackDisplayedItem(selected.id, `perf_bubble_${i}`, selected.type)
    }
  }
  const selectionTime = performance.now() - startSelection
  
  console.log(`100回選択時間: ${selectionTime.toFixed(2)}ms`)
  console.log(`平均選択時間: ${(selectionTime / 100).toFixed(3)}ms`)
  
  // 統計情報を表示
  const stats = contentTracker.getStats()
  console.log('最終統計:', {
    総コンテンツ数: stats.totalContent,
    表示中: stats.displayedContent,
    利用可能: stats.availableContent,
    選択効率: `${(stats.selectionEfficiency * 100).toFixed(1)}%`
  })
}

/**
 * 全ての使用例を実行
 */
export function runAllContentTrackerExamples(): void {
  console.log('ContentTracker 使用例の実行開始\n')
  
  try {
    basicContentTrackerUsage()
    weightedSelectionExample()
    rotationStrategyDemo()
    debugInfoExample()
    performanceTestExample()
    
    console.log('\n=== 全ての使用例が正常に完了しました ===')
  } catch (error) {
    console.error('使用例の実行中にエラーが発生しました:', error)
  }
}

// 使用例の実行（このファイルが直接実行された場合）
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllContentTrackerExamples()
}