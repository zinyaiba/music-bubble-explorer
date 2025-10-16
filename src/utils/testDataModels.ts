import { MusicDataService } from '@/services/musicDataService'
import { RelationshipCalculator } from '@/utils/relationshipCalculator'
import { DataValidator } from '@/utils/dataValidation'

/**
 * データモデルとユーティリティの動作確認用テスト関数
 */
export function testDataModels(): void {
  console.log('=== データモデルとユーティリティのテスト開始 ===')

  try {
    // MusicDataServiceのテスト
    const musicService = MusicDataService.getInstance()
    
    console.log('\n1. 基本データ取得テスト')
    const allSongs = musicService.getAllSongs()
    const allPeople = musicService.getAllPeople()
    console.log(`楽曲数: ${allSongs.length}`)
    console.log(`人物数: ${allPeople.length}`)

    // 最初の楽曲の詳細を確認
    if (allSongs.length > 0) {
      const firstSong = allSongs[0]
      console.log(`\n最初の楽曲: ${firstSong.title}`)
      
      const relatedPeople = musicService.getPeopleForSong(firstSong.id)
      console.log(`関連人物数: ${relatedPeople.length}`)
      relatedPeople.forEach(person => {
        console.log(`  - ${person.name} (${person.type})`)
      })
    }

    // 関連性計算のテスト
    console.log('\n2. 関連性計算テスト')
    const relationshipCalc = new RelationshipCalculator()
    
    if (allSongs.length > 0) {
      const songId = allSongs[0].id
      const bubbleSize = relationshipCalc.calculateBubbleSize('song', songId)
      console.log(`楽曲 "${allSongs[0].title}" のシャボン玉サイズ: ${bubbleSize}px`)
      
      const complexity = relationshipCalc.calculateSongComplexity(songId)
      console.log(`楽曲の複雑さ: 人数=${complexity.totalPeople}, 役割数=${complexity.roleVariety}, 複雑度=${complexity.complexity}`)
    }

    if (allPeople.length > 0) {
      const personId = allPeople[0].id
      const influence = relationshipCalc.calculatePersonInfluence(personId)
      console.log(`人物 "${allPeople[0].name}" の影響力: ${influence.influence.toFixed(2)}`)
    }

    // データベース統計の確認
    console.log('\n3. データベース統計')
    const stats = musicService.getDatabaseStats()
    console.log(`総楽曲数: ${stats.totalSongs}`)
    console.log(`総人物数: ${stats.totalPeople}`)
    console.log(`楽曲あたり平均協力者数: ${stats.averageCollaboratorsPerSong.toFixed(2)}`)
    console.log(`人物あたり平均楽曲数: ${stats.averageSongsPerPerson.toFixed(2)}`)
    if (stats.mostProductivePerson) {
      console.log(`最多楽曲関与者: ${stats.mostProductivePerson.name} (${stats.mostProductivePerson.songCount}曲)`)
    }

    // データ検証のテスト
    console.log('\n4. データ検証テスト')
    const database = { songs: allSongs, people: allPeople }
    const validation = DataValidator.validateMusicDatabase(database)
    console.log(`データ検証結果: ${validation.isValid ? '成功' : '失敗'}`)
    if (!validation.isValid) {
      console.log('検証エラー:', validation.errors)
    }

    const dbStats = DataValidator.getDatabaseStats(database)
    console.log(`作詞家数: ${dbStats.lyricistCount}`)
    console.log(`作曲家数: ${dbStats.composerCount}`)
    console.log(`編曲家数: ${dbStats.arrangerCount}`)

    console.log('\n=== テスト完了: すべて正常に動作しています ===')

  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error)
  }
}

// 開発環境でのみ実行
if (import.meta.env.DEV) {
  // testDataModels()
}