import { RelationshipCalculator } from '../relationshipCalculator'
import { MusicDataService } from '@/services/musicDataService'

/**
 * シンプルなテストフレームワーク（再利用）
 */
class SimpleTest {
  private testCount = 0
  private passCount = 0
  private failCount = 0

  test(name: string, testFn: () => void): void {
    this.testCount++
    try {
      testFn()
      this.passCount++
      console.log(`✅ ${name}`)
    } catch (error) {
      this.failCount++
      console.error(`❌ ${name}:`, error)
    }
  }

  expect(actual: any): {
    toBe: (expected: any) => void
    toEqual: (expected: any) => void
    toBeTruthy: () => void
    toBeFalsy: () => void
    toContain: (expected: any) => void
    toHaveLength: (expected: number) => void
    toBeGreaterThan: (expected: number) => void
    toBeLessThanOrEqual: (expected: number) => void
    toBeGreaterThanOrEqual: (expected: number) => void
  } {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`)
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`)
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`)
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`)
        }
      },
      toContain: (expected: any) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`)
        }
      },
      toHaveLength: (expected: number) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${actual.length} to be ${expected}`)
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`)
        }
      },
      toBeLessThanOrEqual: (expected: number) => {
        if (actual > expected) {
          throw new Error(`Expected ${actual} to be less than or equal to ${expected}`)
        }
      },
      toBeGreaterThanOrEqual: (expected: number) => {
        if (actual < expected) {
          throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`)
        }
      }
    }
  }

  summary(): void {
    console.log(`\n📊 テスト結果: ${this.passCount}/${this.testCount} 成功`)
    if (this.failCount > 0) {
      console.log(`❌ ${this.failCount} 件のテストが失敗しました`)
    } else {
      console.log('🎉 すべてのテストが成功しました！')
    }
  }
}

/**
 * RelationshipCalculatorのユニットテスト
 */
export function runRelationshipCalculatorTests(): void {
  console.log('=== RelationshipCalculator ユニットテスト開始 ===')
  const test = new SimpleTest()
  const calculator = new RelationshipCalculator()
  const musicService = MusicDataService.getInstance()

  // シャボン玉サイズ計算のテスト
  test.test('シャボン玉サイズ計算（楽曲）', () => {
    const songs = musicService.getAllSongs()
    if (songs.length > 0) {
      const size = calculator.calculateBubbleSize('song', songs[0].id)
      test.expect(size).toBeGreaterThanOrEqual(40) // 最小サイズ
      test.expect(size).toBeLessThanOrEqual(120) // 最大サイズ
    }
  })

  test.test('シャボン玉サイズ計算（人物）', () => {
    const people = musicService.getAllPeople()
    if (people.length > 0) {
      const size = calculator.calculateBubbleSize('lyricist', people[0].id)
      test.expect(size).toBeGreaterThanOrEqual(40) // 最小サイズ
      test.expect(size).toBeLessThanOrEqual(120) // 最大サイズ
    }
  })

  test.test('シャボン玉サイズ計算（存在しないID）', () => {
    const size = calculator.calculateBubbleSize('song', 'non_existent_id')
    test.expect(size).toBe(40) // 関連数0の場合は最小サイズ
  })

  // 協力関係の強さ計算テスト
  test.test('協力関係の強さ計算', () => {
    const people = musicService.getAllPeople()
    if (people.length >= 2) {
      const strength = calculator.calculateCollaborationStrength(people[0].id, people[1].id)
      test.expect(strength).toBeGreaterThanOrEqual(0)
      test.expect(strength).toBeLessThanOrEqual(1)
    }
  })

  test.test('協力関係の強さ計算（存在しない人物）', () => {
    const people = musicService.getAllPeople()
    if (people.length > 0) {
      const strength = calculator.calculateCollaborationStrength(people[0].id, 'non_existent_id')
      test.expect(strength).toBe(0)
    }
  })

  // 楽曲の複雑さ計算テスト
  test.test('楽曲の複雑さ計算', () => {
    const songs = musicService.getAllSongs()
    if (songs.length > 0) {
      const complexity = calculator.calculateSongComplexity(songs[0].id)
      test.expect(complexity.totalPeople).toBeGreaterThanOrEqual(0)
      test.expect(complexity.roleVariety).toBeGreaterThanOrEqual(0)
      test.expect(complexity.roleVariety).toBeLessThanOrEqual(3) // 最大3つの役割
      test.expect(complexity.complexity).toBeGreaterThanOrEqual(0)
    }
  })

  test.test('楽曲の複雑さ計算（存在しない楽曲）', () => {
    const complexity = calculator.calculateSongComplexity('non_existent_id')
    test.expect(complexity.totalPeople).toBe(0)
    test.expect(complexity.roleVariety).toBe(0)
    test.expect(complexity.complexity).toBe(0)
  })

  // 人物の影響力計算テスト
  test.test('人物の影響力計算', () => {
    const people = musicService.getAllPeople()
    if (people.length > 0) {
      const influence = calculator.calculatePersonInfluence(people[0].id)
      test.expect(influence.songCount).toBeGreaterThanOrEqual(0)
      test.expect(influence.collaboratorCount).toBeGreaterThanOrEqual(0)
      test.expect(influence.influence).toBeGreaterThanOrEqual(0)
    }
  })

  test.test('人物の影響力計算（存在しない人物）', () => {
    const influence = calculator.calculatePersonInfluence('non_existent_id')
    test.expect(influence.songCount).toBe(0)
    test.expect(influence.collaboratorCount).toBe(0)
    test.expect(influence.influence).toBe(0)
  })

  // 楽曲ジャンル推定テスト
  test.test('楽曲ジャンル推定', () => {
    const songs = musicService.getAllSongs()
    if (songs.length > 0) {
      const genre = calculator.estimateSongGenre(songs[0].id)
      test.expect(typeof genre.isCollaborative).toBe('boolean')
      test.expect(typeof genre.isSoloWork).toBe('boolean')
      test.expect(typeof genre.hasSpecializedRoles).toBe('boolean')
      
      // 論理的な整合性チェック
      if (genre.isSoloWork) {
        test.expect(genre.isCollaborative).toBeFalsy()
      }
    }
  })

  // 関連楽曲推薦テスト
  test.test('関連楽曲推薦', () => {
    const songs = musicService.getAllSongs()
    if (songs.length > 0) {
      const relatedSongs = calculator.getRelatedSongs(songs[0].id, 3)
      test.expect(Array.isArray(relatedSongs)).toBeTruthy()
      test.expect(relatedSongs.length).toBeLessThanOrEqual(3)
      
      // 元の楽曲が含まれていないことを確認
      const originalSongIncluded = relatedSongs.some(song => song.id === songs[0].id)
      test.expect(originalSongIncluded).toBeFalsy()
    }
  })

  test.test('関連楽曲推薦（存在しない楽曲）', () => {
    const relatedSongs = calculator.getRelatedSongs('non_existent_id', 3)
    test.expect(relatedSongs).toHaveLength(0)
  })

  // 関連人物推薦テスト
  test.test('関連人物推薦', () => {
    const people = musicService.getAllPeople()
    if (people.length > 0) {
      const relatedPeople = calculator.getRelatedPeople(people[0].id, 3)
      test.expect(Array.isArray(relatedPeople)).toBeTruthy()
      test.expect(relatedPeople.length).toBeLessThanOrEqual(3)
      
      // 元の人物が含まれていないことを確認
      const originalPersonIncluded = relatedPeople.some(person => person.id === people[0].id)
      test.expect(originalPersonIncluded).toBeFalsy()
    }
  })

  test.test('関連人物推薦（存在しない人物）', () => {
    const relatedPeople = calculator.getRelatedPeople('non_existent_id', 3)
    test.expect(relatedPeople).toHaveLength(0)
  })

  // カスタムサイズ範囲のテスト
  test.test('カスタムサイズ範囲でのシャボン玉サイズ計算', () => {
    const songs = musicService.getAllSongs()
    if (songs.length > 0) {
      const size = calculator.calculateBubbleSize('song', songs[0].id, 20, 80)
      test.expect(size).toBeGreaterThanOrEqual(20)
      test.expect(size).toBeLessThanOrEqual(80)
    }
  })

  // 境界値テスト
  test.test('シャボン玉サイズ計算（最小・最大境界値）', () => {
    // 最小サイズのテスト（関連数0）
    const minSize = calculator.calculateBubbleSize('song', 'non_existent_id', 10, 100)
    test.expect(minSize).toBe(10)
    
    // カスタム範囲での計算
    const customSize = calculator.calculateBubbleSize('song', 'non_existent_id', 50, 50)
    test.expect(customSize).toBe(50) // 最小と最大が同じ場合
  })

  test.summary()
  console.log('=== RelationshipCalculator ユニットテスト終了 ===\n')
}

// テスト関数をエクスポート（必要に応じて直接実行可能）
// runRelationshipCalculatorTests()