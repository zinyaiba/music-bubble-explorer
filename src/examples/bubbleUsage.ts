/**
 * シャボン玉システムの使用例
 * このファイルは実装の動作確認用のサンプルコードです
 */

import { BubbleManager, DEFAULT_BUBBLE_CONFIG, BubbleEntity } from '@/services'
import type { MusicDatabase } from '@/types'

// サンプル音楽データベース
const sampleDatabase: MusicDatabase = {
  songs: [
    {
      id: '1',
      title: '春の歌',
      lyricists: ['田中太郎'],
      composers: ['佐藤花子'],
      arrangers: ['鈴木次郎']
    },
    {
      id: '2', 
      title: '夏の思い出',
      lyricists: ['田中太郎', '山田三郎'],
      composers: ['佐藤花子'],
      arrangers: ['鈴木次郎', '高橋四郎']
    }
  ],
  people: [
    {
      id: '1',
      name: '田中太郎',
      type: 'lyricist',
      songs: ['1', '2']
    },
    {
      id: '2',
      name: '佐藤花子', 
      type: 'composer',
      songs: ['1', '2']
    },
    {
      id: '3',
      name: '鈴木次郎',
      type: 'arranger',
      songs: ['1', '2']
    }
  ]
}

/**
 * シャボン玉システムの基本的な使用例
 */
export function demonstrateBubbleSystem() {
  // BubbleManagerを初期化
  const bubbleManager = new BubbleManager(sampleDatabase, {
    ...DEFAULT_BUBBLE_CONFIG,
    canvasWidth: 1200,
    canvasHeight: 800,
    maxBubbles: 15
  })

  console.log('=== シャボン玉システムデモ ===')

  // 1. シャボン玉を生成
  console.log('\n1. シャボン玉の生成:')
  for (let i = 0; i < 5; i++) {
    const bubble = bubbleManager.generateBubble()
    bubbleManager.addBubble(bubble)
    console.log(`  - ${bubble.type}: "${bubble.name}" (サイズ: ${bubble.size}, 関連数: ${bubble.relatedCount})`)
  }

  // 2. 現在のシャボン玉一覧を表示
  console.log('\n2. 現在のシャボン玉一覧:')
  const bubbles = bubbleManager.getBubbles()
  bubbles.forEach((bubble, index) => {
    console.log(`  ${index + 1}. ${bubble.name} - 位置: (${bubble.x.toFixed(1)}, ${bubble.y.toFixed(1)})`)
  })

  // 3. サイズ計算のテスト
  console.log('\n3. サイズ計算テスト:')
  const testCounts = [1, 5, 10, 20, 30]
  testCounts.forEach(count => {
    const size = bubbleManager.calculateBubbleSize(count)
    console.log(`  関連数 ${count} → サイズ ${size}`)
  })

  // 4. 物理更新のシミュレーション
  console.log('\n4. 物理更新シミュレーション:')
  const initialBubbles = bubbleManager.getBubbles()
  const updatedBubbles = bubbleManager.updateBubblePhysics(initialBubbles)
  
  console.log(`  更新前: ${initialBubbles.length}個のシャボン玉`)
  console.log(`  更新後: ${updatedBubbles.length}個のシャボン玉`)
  
  if (updatedBubbles.length > 0) {
    const firstBubble = updatedBubbles[0]
    console.log(`  最初のシャボン玉の新しい位置: (${firstBubble.x.toFixed(1)}, ${firstBubble.y.toFixed(1)})`)
  }

  // 5. クリック判定のテスト
  console.log('\n5. クリック判定テスト:')
  if (updatedBubbles.length > 0) {
    const testBubble = updatedBubbles[0]
    const clickX = testBubble.x
    const clickY = testBubble.y
    
    const foundBubble = bubbleManager.findBubbleAtPosition(clickX, clickY)
    if (foundBubble) {
      console.log(`  座標 (${clickX.toFixed(1)}, ${clickY.toFixed(1)}) でクリック → "${foundBubble.name}" を発見`)
    } else {
      console.log(`  座標 (${clickX.toFixed(1)}, ${clickY.toFixed(1)}) でクリック → シャボン玉なし`)
    }
  }

  // 6. 統計情報の表示
  console.log('\n6. 統計情報:')
  const stats = bubbleManager.getStats()
  console.log(`  総シャボン玉数: ${stats.totalBubbles}`)
  console.log(`  楽曲: ${stats.songBubbles}, 作詞家: ${stats.lyricistBubbles}`)
  console.log(`  作曲家: ${stats.composerBubbles}, 編曲家: ${stats.arrangerBubbles}`)
  console.log(`  平均サイズ: ${stats.averageSize.toFixed(1)}`)
  console.log(`  平均ライフスパン: ${stats.averageLifespan.toFixed(0)}ms`)

  return bubbleManager
}

/**
 * シャボン玉エンティティの個別機能テスト
 */
export function demonstrateBubbleEntity() {
  console.log('\n=== シャボン玉エンティティデモ ===')

  // シャボン玉を作成
  const bubble = new BubbleEntity({
    type: 'song',
    name: 'テスト楽曲',
    x: 400,
    y: 300,
    vx: 20,
    vy: -10,
    size: 80,
    color: '#FFB6C1',
    opacity: 1,
    lifespan: 5000,
    relatedCount: 8
  })

  console.log(`\n作成されたシャボン玉: "${bubble.name}"`)
  console.log(`ID: ${bubble.id}`)
  console.log(`初期位置: (${bubble.x}, ${bubble.y})`)
  console.log(`初期速度: (${bubble.vx}, ${bubble.vy})`)

  // 物理更新をシミュレート
  console.log('\n物理更新シミュレーション:')
  for (let i = 0; i < 3; i++) {
    const oldX = bubble.x
    const oldY = bubble.y
    
    bubble.update(0.1) // 100ms経過
    
    console.log(`  ${i + 1}回目: (${oldX.toFixed(1)}, ${oldY.toFixed(1)}) → (${bubble.x.toFixed(1)}, ${bubble.y.toFixed(1)})`)
    console.log(`    年齢: ${bubble.getAge().toFixed(2)}s, ライフスパン: ${bubble.lifespan.toFixed(0)}ms`)
  }

  // クリック判定テスト
  console.log('\nクリック判定テスト:')
  const testPoints = [
    [bubble.x, bubble.y], // 中心
    [bubble.x + 20, bubble.y + 20], // 内部
    [bubble.x + 100, bubble.y + 100] // 外部
  ]
  
  testPoints.forEach(([x, y]) => {
    const isInside = bubble.containsPoint(x, y)
    console.log(`  点 (${x}, ${y}): ${isInside ? '内部' : '外部'}`)
  })

  return bubble
}

// 使用例の実行（コメントアウト状態）
// demonstrateBubbleSystem()
// demonstrateBubbleEntity()