/**
 * BubbleRegistry使用例
 * Requirements: 3.1, 3.2, 3.3, 3.4 - シャボン玉レジストリシステムの使用方法
 */

import { BubbleRegistry } from '@/utils/bubbleRegistry'
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
    lyricists: ['田中太郎'],
    composers: ['田中太郎'],
    arrangers: ['山田三郎'],
    tags: ['夏', 'アップテンポ']
  },
  {
    id: 'song3',
    title: '秋の風',
    lyricists: ['佐藤花子'],
    composers: ['佐藤花子'],
    arrangers: ['佐藤花子'],
    tags: ['秋', 'バラード']
  }
]

const samplePeople: Person[] = [
  {
    id: 'person1',
    name: '田中太郎',
    type: 'lyricist',
    songs: ['song1', 'song2']
  },
  {
    id: 'person2',
    name: '佐藤花子',
    type: 'composer',
    songs: ['song1', 'song3']
  },
  {
    id: 'person3',
    name: '鈴木次郎',
    type: 'arranger',
    songs: ['song1']
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
    name: 'バラード',
    songs: ['song1', 'song3']
  }
]

const sampleConsolidatedPersons: ConsolidatedPerson[] = [
  {
    name: '田中太郎',
    roles: [
      { type: 'lyricist', songCount: 2 },
      { type: 'composer', songCount: 1 }
    ],
    totalRelatedCount: 3,
    songs: ['song1', 'song2']
  },
  {
    name: '佐藤花子',
    roles: [
      { type: 'composer', songCount: 2 },
      { type: 'lyricist', songCount: 1 },
      { type: 'arranger', songCount: 1 }
    ],
    totalRelatedCount: 4,
    songs: ['song1', 'song3']
  }
]

/**
 * 基本的な使用例
 */
export function basicUsageExample(): void {
  console.log('=== BubbleRegistry Basic Usage Example ===')
  
  // レジストリを作成
  const registry = new BubbleRegistry()
  
  // コンテンツプールを初期化
  registry.initializeContentPool(sampleSongs, samplePeople, sampleTags, sampleConsolidatedPersons)
  
  console.log('Initial stats:', registry.getStats())
  
  // 利用可能なコンテンツを取得
  const availableContent = registry.getAvailableContent()
  console.log('Available content:', availableContent.length)
  
  // 次のユニークなコンテンツを取得
  const nextContent = registry.getNextUniqueContent()
  if (nextContent) {
    console.log('Next content:', nextContent)
    
    // シャボン玉として登録
    const bubbleId = `bubble_${Date.now()}`
    const registered = registry.registerBubble(nextContent.id, bubbleId, nextContent.type)
    console.log('Registration result:', registered)
    
    console.log('Stats after registration:', registry.getStats())
    
    // 少し待ってから登録解除
    setTimeout(() => {
      registry.unregisterBubble(bubbleId)
      console.log('Stats after unregistration:', registry.getStats())
    }, 1000)
  }
}

/**
 * 重複防止のテスト例
 */
export function duplicatePreventionExample(): void {
  console.log('=== Duplicate Prevention Example ===')
  
  const registry = new BubbleRegistry()
  registry.initializeContentPool(sampleSongs, samplePeople, sampleTags)
  
  // 同じコンテンツを複数回登録しようとする
  const content = registry.getNextUniqueContent()
  if (content) {
    console.log('Selected content:', content.name)
    
    // 1回目の登録（成功するはず）
    const result1 = registry.registerBubble(content.id, 'bubble1', content.type)
    console.log('First registration:', result1)
    
    // 2回目の登録（失敗するはず）
    const result2 = registry.registerBubble(content.id, 'bubble2', content.type)
    console.log('Second registration (should fail):', result2)
    
    // 表示中かチェック
    console.log('Is content displayed:', registry.isContentDisplayed(content.id))
  }
}

/**
 * 重み付き選択のテスト例
 */
export function weightedSelectionExample(): void {
  console.log('=== Weighted Selection Example ===')
  
  // 重み付き選択を有効にした設定
  const config: Partial<BubbleRegistryConfig> = {
    enableWeightedSelection: true,
    weightedConfig: {
      recencyWeight: 0.4,
      popularityWeight: 0.3,
      typeBalanceWeight: 0.2,
      randomWeight: 0.1
    }
  }
  
  const registry = new BubbleRegistry(config)
  registry.initializeContentPool(sampleSongs, samplePeople, sampleTags, sampleConsolidatedPersons)
  
  // 複数回選択して傾向を確認
  const selections: string[] = []
  for (let i = 0; i < 10; i++) {
    const content = registry.getNextUniqueContent()
    if (content) {
      selections.push(`${content.type}:${content.name}`)
      
      // 一時的に登録して選択プールから除外
      const bubbleId = `test_bubble_${i}`
      registry.registerBubble(content.id, bubbleId, content.type)
    }
  }
  
  console.log('Selection results:', selections)
  console.log('Final stats:', registry.getStats())
}

/**
 * 回転戦略のテスト例
 */
export function rotationStrategyExample(): void {
  console.log('=== Rotation Strategy Example ===')
  
  // 最大表示数を少なくして回転を発生させやすくする
  const config: Partial<BubbleRegistryConfig> = {
    maxDisplayedItems: 3,
    enableRotationStrategy: true,
    rotationCooldown: 1000 // 1秒
  }
  
  const registry = new BubbleRegistry(config)
  registry.initializeContentPool(sampleSongs, samplePeople, sampleTags)
  
  console.log('Initial available content:', registry.getAvailableContent().length)
  
  // 最大表示数を超えるまでコンテンツを登録
  const registeredBubbles: string[] = []
  for (let i = 0; i < 5; i++) {
    const content = registry.getNextUniqueContent()
    if (content) {
      const bubbleId = `rotation_bubble_${i}`
      const registered = registry.registerBubble(content.id, bubbleId, content.type)
      
      if (registered) {
        registeredBubbles.push(bubbleId)
        console.log(`Registered bubble ${i + 1}:`, content.name)
      } else {
        console.log(`Failed to register bubble ${i + 1} - rotation should occur`)
      }
      
      console.log('Current stats:', registry.getStats())
    }
  }
}

/**
 * パフォーマンステスト例
 */
export function performanceTestExample(): void {
  console.log('=== Performance Test Example ===')
  
  // 大量のデータでテスト
  const largeSongs: Song[] = []
  const largePeople: Person[] = []
  const largeTags: Tag[] = []
  
  // 1000曲のサンプルデータを生成
  for (let i = 0; i < 1000; i++) {
    largeSongs.push({
      id: `song_${i}`,
      title: `Song ${i}`,
      lyricists: [`Lyricist ${i % 100}`],
      composers: [`Composer ${i % 100}`],
      arrangers: [`Arranger ${i % 100}`],
      tags: [`tag_${i % 50}`]
    })
  }
  
  // 100人のサンプルデータを生成
  for (let i = 0; i < 100; i++) {
    largePeople.push({
      id: `person_${i}`,
      name: `Person ${i}`,
      type: ['lyricist', 'composer', 'arranger'][i % 3] as any,
      songs: [`song_${i * 10}`, `song_${i * 10 + 1}`]
    })
  }
  
  // 50タグのサンプルデータを生成
  for (let i = 0; i < 50; i++) {
    largeTags.push({
      id: `tag_${i}`,
      name: `Tag ${i}`,
      songs: [`song_${i * 20}`, `song_${i * 20 + 1}`]
    })
  }
  
  const registry = new BubbleRegistry()
  
  // 初期化のパフォーマンス測定
  const startTime = performance.now()
  registry.initializeContentPool(largeSongs, largePeople, largeTags)
  const initTime = performance.now() - startTime
  
  console.log(`Initialization time: ${initTime.toFixed(2)}ms`)
  console.log('Large dataset stats:', registry.getStats())
  
  // 選択のパフォーマンス測定
  const selectionStartTime = performance.now()
  for (let i = 0; i < 100; i++) {
    const content = registry.getNextUniqueContent()
    if (content) {
      registry.registerBubble(content.id, `perf_bubble_${i}`, content.type)
    }
  }
  const selectionTime = performance.now() - selectionStartTime
  
  console.log(`100 selections time: ${selectionTime.toFixed(2)}ms`)
  console.log(`Average selection time: ${(selectionTime / 100).toFixed(2)}ms`)
}

/**
 * 全ての使用例を実行
 */
export function runAllExamples(): void {
  console.log('Running BubbleRegistry examples...')
  
  basicUsageExample()
  
  setTimeout(() => {
    duplicatePreventionExample()
    
    setTimeout(() => {
      weightedSelectionExample()
      
      setTimeout(() => {
        rotationStrategyExample()
        
        setTimeout(() => {
          performanceTestExample()
        }, 1000)
      }, 1000)
    }, 1000)
  }, 2000)
}

// 使用例の実行（開発環境でのみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // ブラウザ環境でのテスト用
  (window as any).bubbleRegistryExamples = {
    basicUsage: basicUsageExample,
    duplicatePrevention: duplicatePreventionExample,
    weightedSelection: weightedSelectionExample,
    rotationStrategy: rotationStrategyExample,
    performanceTest: performanceTestExample,
    runAll: runAllExamples
  }
}