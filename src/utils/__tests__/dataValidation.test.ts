import { DataValidator } from '../dataValidation'
import { MusicDatabase, Song, Person } from '@/types/music'

/**
 * シンプルなテストフレームワーク
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
 * DataValidatorのユニットテスト
 */
export function runDataValidationTests(): void {
  console.log('=== DataValidator ユニットテスト開始 ===')
  const test = new SimpleTest()

  // 有効な楽曲データのテスト
  test.test('有効な楽曲データの検証', () => {
    const validSong: Song = {
      id: 'song_001',
      title: 'テスト楽曲',
      lyricists: ['作詞家A'],
      composers: ['作曲家B'],
      arrangers: ['編曲家C']
    }
    test.expect(DataValidator.validateSong(validSong)).toBeTruthy()
  })

  // 無効な楽曲データのテスト
  test.test('無効な楽曲データの検証（空のID）', () => {
    const invalidSong = {
      id: '',
      title: 'テスト楽曲',
      lyricists: ['作詞家A'],
      composers: ['作曲家B'],
      arrangers: ['編曲家C']
    } as Song
    test.expect(DataValidator.validateSong(invalidSong)).toBeFalsy()
  })

  test.test('無効な楽曲データの検証（空のタイトル）', () => {
    const invalidSong = {
      id: 'song_001',
      title: '',
      lyricists: ['作詞家A'],
      composers: ['作曲家B'],
      arrangers: ['編曲家C']
    } as Song
    test.expect(DataValidator.validateSong(invalidSong)).toBeFalsy()
  })

  test.test('無効な楽曲データの検証（配列でない作詞家）', () => {
    const invalidSong = {
      id: 'song_001',
      title: 'テスト楽曲',
      lyricists: '作詞家A',
      composers: ['作曲家B'],
      arrangers: ['編曲家C']
    } as any
    test.expect(DataValidator.validateSong(invalidSong)).toBeFalsy()
  })

  // 有効な人物データのテスト
  test.test('有効な人物データの検証', () => {
    const validPerson: Person = {
      id: 'person_001',
      name: 'テスト作詞家',
      type: 'lyricist',
      songs: ['song_001', 'song_002']
    }
    test.expect(DataValidator.validatePerson(validPerson)).toBeTruthy()
  })

  // 無効な人物データのテスト
  test.test('無効な人物データの検証（無効なタイプ）', () => {
    const invalidPerson = {
      id: 'person_001',
      name: 'テスト作詞家',
      type: 'invalid_type',
      songs: ['song_001']
    } as any
    test.expect(DataValidator.validatePerson(invalidPerson)).toBeFalsy()
  })

  test.test('無効な人物データの検証（空の名前）', () => {
    const invalidPerson = {
      id: 'person_001',
      name: '',
      type: 'lyricist',
      songs: ['song_001']
    } as Person
    test.expect(DataValidator.validatePerson(invalidPerson)).toBeFalsy()
  })

  // データベース全体の検証テスト
  test.test('有効なデータベースの検証', () => {
    const validDatabase: MusicDatabase = {
      songs: [
        {
          id: 'song_001',
          title: 'テスト楽曲1',
          lyricists: ['作詞家A'],
          composers: ['作曲家B'],
          arrangers: ['編曲家C']
        }
      ],
      people: [
        {
          id: 'person_001',
          name: '作詞家A',
          type: 'lyricist',
          songs: ['song_001']
        }
      ]
    }
    const result = DataValidator.validateMusicDatabase(validDatabase)
    test.expect(result.isValid).toBeTruthy()
    test.expect(result.errors).toHaveLength(0)
  })

  test.test('無効なデータベースの検証（存在しない楽曲参照）', () => {
    const invalidDatabase: MusicDatabase = {
      songs: [
        {
          id: 'song_001',
          title: 'テスト楽曲1',
          lyricists: ['作詞家A'],
          composers: ['作曲家B'],
          arrangers: ['編曲家C']
        }
      ],
      people: [
        {
          id: 'person_001',
          name: '作詞家A',
          type: 'lyricist',
          songs: ['song_001', 'song_999'] // 存在しない楽曲
        }
      ]
    }
    const result = DataValidator.validateMusicDatabase(invalidDatabase)
    test.expect(result.isValid).toBeFalsy()
    test.expect(result.errors.length).toBe(1)
    test.expect(result.errors[0]).toContain('song_999')
  })

  // 統計情報のテスト
  test.test('データベース統計の計算', () => {
    const database: MusicDatabase = {
      songs: [
        {
          id: 'song_001',
          title: 'テスト楽曲1',
          lyricists: ['作詞家A'],
          composers: ['作曲家B'],
          arrangers: ['編曲家C']
        },
        {
          id: 'song_002',
          title: 'テスト楽曲2',
          lyricists: ['作詞家A'],
          composers: ['作曲家D'],
          arrangers: ['編曲家C']
        }
      ],
      people: [
        {
          id: 'person_001',
          name: '作詞家A',
          type: 'lyricist',
          songs: ['song_001', 'song_002']
        },
        {
          id: 'person_002',
          name: '作曲家B',
          type: 'composer',
          songs: ['song_001']
        },
        {
          id: 'person_003',
          name: '作曲家D',
          type: 'composer',
          songs: ['song_002']
        },
        {
          id: 'person_004',
          name: '編曲家C',
          type: 'arranger',
          songs: ['song_001', 'song_002']
        }
      ]
    }

    const stats = DataValidator.getDatabaseStats(database)
    test.expect(stats.songCount).toBe(2)
    test.expect(stats.personCount).toBe(4)
    test.expect(stats.lyricistCount).toBe(1)
    test.expect(stats.composerCount).toBe(2)
    test.expect(stats.arrangerCount).toBe(1)
  })

  test.summary()
  console.log('=== DataValidator ユニットテスト終了 ===\n')
}

// テスト関数をエクスポート（必要に応じて直接実行可能）
// runDataValidationTests()