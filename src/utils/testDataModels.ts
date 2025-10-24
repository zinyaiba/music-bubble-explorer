import { MusicDataService } from '@/services/musicDataService'
import { RelationshipCalculator } from '@/utils/relationshipCalculator'
import { DataValidator } from '@/utils/dataValidation'
import { logger } from '../config/logConfig'

/**
 * データモデルとユーティリティの動作確認用テスト関数
 */
export function testDataModels(): void {
  logger.debug('データモデルとユーティリティのテスト開始')

  try {
    // MusicDataServiceのテスト
    const musicService = MusicDataService.getInstance()
    
    logger.debug('基本データ取得テスト')
    const allSongs = musicService.getAllSongs()
    const allPeople = musicService.getAllPeople()
    logger.debug('データ取得結果', { songCount: allSongs.length, peopleCount: allPeople.length })

    // 最初の楽曲の詳細を確認
    if (allSongs.length > 0) {
      const firstSong = allSongs[0]
      const relatedPeople = musicService.getPeopleForSong(firstSong.id)
      logger.debug('最初の楽曲詳細', {
        title: firstSong.title,
        relatedPeopleCount: relatedPeople.length,
        relatedPeople: relatedPeople.map(p => ({ name: p.name, type: p.type }))
      })
    }

    // 関連性計算のテスト
    logger.debug('関連性計算テスト')
    const relationshipCalc = new RelationshipCalculator()
    
    if (allSongs.length > 0) {
      const songId = allSongs[0].id
      const bubbleSize = relationshipCalc.calculateBubbleSize('song', songId)
      const complexity = relationshipCalc.calculateSongComplexity(songId)
      logger.debug('楽曲関連性計算結果', {
        title: allSongs[0].title,
        bubbleSize: `${bubbleSize}px`,
        complexity: {
          totalPeople: complexity.totalPeople,
          roleVariety: complexity.roleVariety,
          complexity: complexity.complexity
        }
      })
    }

    if (allPeople.length > 0) {
      const personId = allPeople[0].id
      const influence = relationshipCalc.calculatePersonInfluence(personId)
      logger.debug('人物影響力計算結果', {
        name: allPeople[0].name,
        influence: influence.influence.toFixed(2)
      })
    }

    // データベース統計の確認
    logger.debug('データベース統計')
    const stats = musicService.getDatabaseStats()
    logger.debug('データベース統計結果', {
      totalSongs: stats.totalSongs,
      totalPeople: stats.totalPeople,
      averageCollaboratorsPerSong: stats.averageCollaboratorsPerSong.toFixed(2),
      averageSongsPerPerson: stats.averageSongsPerPerson.toFixed(2),
      mostProductivePerson: stats.mostProductivePerson ? {
        name: stats.mostProductivePerson.name,
        songCount: stats.mostProductivePerson.songCount
      } : null
    })

    // データ検証のテスト
    logger.debug('データ検証テスト')
    const database = { songs: allSongs, people: allPeople }
    const validation = DataValidator.validateMusicDatabase(database)
    logger.debug('データ検証結果', {
      isValid: validation.isValid,
      errors: validation.isValid ? [] : validation.errors
    })

    const dbStats = DataValidator.getDatabaseStats(database)
    logger.debug('データベース統計詳細', {
      lyricistCount: dbStats.lyricistCount,
      composerCount: dbStats.composerCount,
      arrangerCount: dbStats.arrangerCount
    })

    logger.debug('テスト完了: すべて正常に動作')

  } catch (error) {
    logger.error('テスト中にエラーが発生', error)
  }
}

// 開発環境でのみ実行
if (import.meta.env.DEV) {
  // testDataModels()
}