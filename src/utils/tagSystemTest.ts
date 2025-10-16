import { MusicDataService } from '@/services/musicDataService'
import { BubbleManager } from '@/services/bubbleManager'
// import { DEFAULT_BUBBLE_CONFIG } from '@/config/bubbleConfig'

/**
 * タグシステムの動作確認用テスト関数
 */
export function testTagSystem(): void {
  console.log('🏷️ タグシステムのテストを開始します...')
  
  try {
    // MusicDataServiceを取得
    const musicService = MusicDataService.getInstance()
    
    // 全タグを取得
    const allTags = musicService.getAllTags()
    console.log('📊 タグ統計:', { totalTags: allTags.length })
    
    if (allTags.length > 0) {
      // 最初のタグの詳細を表示
      const firstTag = allTags[0]
      console.log(`🔍 タグ "${firstTag.name}" の詳細:`)
      console.log(`  - ID: ${firstTag.id}`)
      console.log(`  - 関連楽曲数: ${firstTag.songs.length}`)
      
      // 関連楽曲を取得
      const relatedSongs = musicService.getSongsForTag(firstTag.name)
      console.log(`  - 関連楽曲: ${relatedSongs.map(s => s.title).join(', ')}`)
      
      // 関連タグを取得
      const relatedTags = musicService.getRelatedTags(firstTag.name)
      console.log(`  - 関連タグ: ${relatedTags.map(t => t.name).join(', ')}`)
    }
    
    // 人気度順のタグを取得（楽曲数でソート）
    const popularTags = allTags.sort((a, b) => b.songs.length - a.songs.length)
    console.log('🔥 人気度順タグ:')
    popularTags.slice(0, 5).forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.name} (${tag.songs.length}曲)`)
    })
    
    console.log('✅ タグシステムのテストが完了しました！')
    
  } catch (error) {
    console.error('❌ タグシステムのテストでエラーが発生しました:', error)
  }
}

/**
 * タグシャボン玉生成をテスト
 */
export function testTagBubbleGeneration(): void {
  console.log('🫧 タグシャボン玉生成のテストを開始します...')
  
  try {
    // MusicDataServiceを取得
    const musicService = MusicDataService.getInstance()
    
    // データベースを構築
    const musicDatabase = {
      songs: musicService.getAllSongs(),
      people: musicService.getAllPeople(),
      tags: musicService.getAllTags()
    }
    
    const bubbleManager = new BubbleManager(musicDatabase, {
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10,
      minLifespan: 5000,
      maxLifespan: 15000,
      minVelocity: 0.5,
      maxVelocity: 2.0
    })
    
    // タグシャボン玉を生成してテスト
    let tagBubbleCount = 0
    for (let i = 0; i < 20; i++) {
      const bubble = bubbleManager.generateBubble()
      if (bubble.type === 'tag') {
        tagBubbleCount++
        console.log(`🫧 タグシャボン玉生成: "${bubble.name}" (サイズ: ${bubble.size}px, 色: ${bubble.color})`)
      }
    }
    
    console.log(`✅ タグシャボン玉生成数: ${tagBubbleCount}/20`)
    
  } catch (error) {
    console.error('❌ タグシャボン玉生成のテストでエラーが発生しました:', error)
  }
}

/**
 * タグ検索機能をテスト
 */
export function testTagSearch(): void {
  console.log('🔍 タグ検索機能のテストを開始します...')
  
  try {
    // MusicDataServiceを取得
    const musicService = MusicDataService.getInstance()
    const allTags = musicService.getAllTags()
    
    // 検索クエリのテスト
    const searchQueries = ['バラード', 'ロック', 'ポップ', 'アニメ']
    
    searchQueries.forEach(query => {
      const results = allTags.filter(tag => tag.name.includes(query))
      console.log(`🔍 "${query}" の検索結果: ${results.length}件`)
      results.forEach(tag => {
        console.log(`  - ${tag.name} (${tag.songs.length}曲)`)
      })
    })
    
    console.log('✅ タグ検索機能のテストが完了しました！')
    
  } catch (error) {
    console.error('❌ タグ検索機能のテストでエラーが発生しました:', error)
  }
}

/**
 * 重み付きランダム選択をテスト
 */
export function testWeightedRandomTag(): void {
  console.log('🎲 重み付きランダムタグ選択のテストを開始します...')
  
  try {
    // MusicDataServiceを取得
    const musicService = MusicDataService.getInstance()
    const allTags = musicService.getAllTags()
    
    if (allTags.length === 0) {
      console.log('⚠️ タグが見つかりません')
      return
    }
    
    // 重み付きランダム選択をシミュレート
    const iterations = 100
    const selectionCount = new Map<string, number>()
    
    for (let i = 0; i < iterations; i++) {
      // 楽曲数に基づく重み付きランダム選択
      const totalWeight = allTags.reduce((sum, tag) => sum + tag.songs.length, 0)
      let random = Math.random() * totalWeight
      
      let selectedTag = allTags[0]
      for (const tag of allTags) {
        random -= tag.songs.length
        if (random <= 0) {
          selectedTag = tag
          break
        }
      }
      
      const count = selectionCount.get(selectedTag.name) || 0
      selectionCount.set(selectedTag.name, count + 1)
    }
    
    console.log(`🎲 ${iterations}回の重み付きランダム選択結果:`)
    Array.from(selectionCount.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([tagName, count]) => {
        const tag = allTags.find(t => t.name === tagName)
        const popularity = tag ? tag.songs.length : 0
        const percentage = ((count / iterations) * 100).toFixed(1)
        console.log(`  - ${tagName}: ${count}回 (${percentage}%, 人気度: ${popularity})`)
      })
    
    console.log('✅ 重み付きランダムタグ選択のテストが完了しました！')
    
  } catch (error) {
    console.error('❌ 重み付きランダムタグ選択のテストでエラーが発生しました:', error)
  }
}

// 開発環境でのみ実行
if (import.meta.env.DEV) {
  // testTagSystem()
  // testTagBubbleGeneration()
  // testTagSearch()
  // testWeightedRandomTag()
}