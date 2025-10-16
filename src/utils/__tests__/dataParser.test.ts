import { DataParser } from '../dataParser'
import { MusicDatabase } from '@/types/music'

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
    toThrow: () => void
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
      toThrow: () => {
        let threw = false
        try {
          if (typeof actual === 'function') {
            actual()
          }
        } catch {
          threw = true
        }
        if (!threw) {
          throw new Error('Expected function to throw an error')
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
 * DataParserのユニットテスト
 */
export function runDataParserTests(): void {
  console.log('=== DataParser ユニットテスト開始 ===')
  const test = new SimpleTest()

  // 有効なJSONデータのパーステスト
  test.test('有効なJSONデータのパース', () => {
    const jsonData = {
      songs: [
        {
          id: 'song_001',
          title: 'テスト楽曲',
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

    const result = DataParser.parseJsonToMusicDatabase(jsonData)
    test.expect(result.songs).toHaveLength(1)
    test.expect(result.people).toHaveLength(1)
    test.expect(result.songs[0].title).toBe('テスト楽曲')
    test.expect(result.people[0].name).toBe('作詞家A')
  })

  // 無効なJSONデータのパーステスト
  test.test('無効なJSONデータのパース（null）', () => {
    test.expect(() => DataParser.parseJsonToMusicDatabase(null)).toThrow()
  })

  test.test('無効なJSONデータのパース（文字列）', () => {
    test.expect(() => DataParser.parseJsonToMusicDatabase('invalid')).toThrow()
  })

  test.test('無効な楽曲データのパース（IDなし）', () => {
    const invalidData = {
      songs: [
        {
          title: 'テスト楽曲',
          lyricists: ['作詞家A'],
          composers: ['作曲家B'],
          arrangers: ['編曲家C']
        }
      ],
      people: []
    }
    test.expect(() => DataParser.parseJsonToMusicDatabase(invalidData)).toThrow()
  })

  test.test('無効な人物データのパース（無効なタイプ）', () => {
    const invalidData = {
      songs: [],
      people: [
        {
          id: 'person_001',
          name: '作詞家A',
          type: 'invalid_type',
          songs: ['song_001']
        }
      ]
    }
    test.expect(() => DataParser.parseJsonToMusicDatabase(invalidData)).toThrow()
  })

  // CSVパーステスト
  test.test('有効なCSVデータのパース', () => {
    const csvData = `id,title,lyricists,composers,arrangers
song_001,テスト楽曲,作詞家A,作曲家B,編曲家C
song_002,テスト楽曲2,作詞家A;作詞家B,作曲家C,編曲家D`

    const result = DataParser.parseCsvToMusicDatabase(csvData)
    test.expect(result.songs).toHaveLength(2)
    test.expect(result.songs[0].title).toBe('テスト楽曲')
    test.expect(result.songs[1].lyricists).toHaveLength(2)
    test.expect(result.people.length).toBe(6) // 各役割ごとに人物が作成される
  })

  test.test('無効なCSVデータのパース（ヘッダーのみ）', () => {
    const csvData = 'id,title,lyricists,composers,arrangers'
    test.expect(() => DataParser.parseCsvToMusicDatabase(csvData)).toThrow()
  })

  test.test('無効なCSVデータのパース（列数不一致）', () => {
    const csvData = `id,title,lyricists,composers,arrangers
song_001,テスト楽曲,作詞家A`
    test.expect(() => DataParser.parseCsvToMusicDatabase(csvData)).toThrow()
  })

  // データ正規化テスト
  test.test('データベースの正規化（重複楽曲の除去）', () => {
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
          id: 'song_001', // 重複ID
          title: 'テスト楽曲1（重複）',
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

    const normalized = DataParser.normalizeMusicDatabase(database)
    test.expect(normalized.songs).toHaveLength(1) // 重複が除去される
    test.expect(normalized.songs[0].title).toBe('テスト楽曲1')
  })

  test.test('データベースの正規化（存在しない楽曲参照の除去）', () => {
    const database: MusicDatabase = {
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
          songs: ['song_001', 'song_999'] // song_999は存在しない
        }
      ]
    }

    const normalized = DataParser.normalizeMusicDatabase(database)
    test.expect(normalized.people[0].songs).toHaveLength(1)
    test.expect(normalized.people[0].songs[0]).toBe('song_001')
  })

  // 空データの処理テスト
  test.test('空のJSONデータの処理', () => {
    const emptyData = { songs: [], people: [] }
    const result = DataParser.parseJsonToMusicDatabase(emptyData)
    test.expect(result.songs).toHaveLength(0)
    test.expect(result.people).toHaveLength(0)
  })

  test.test('部分的なデータの処理（楽曲のみ）', () => {
    const partialData = {
      songs: [
        {
          id: 'song_001',
          title: 'テスト楽曲',
          lyricists: ['作詞家A'],
          composers: ['作曲家B'],
          arrangers: ['編曲家C']
        }
      ]
    }
    const result = DataParser.parseJsonToMusicDatabase(partialData)
    test.expect(result.songs).toHaveLength(1)
    test.expect(result.people).toHaveLength(0)
  })

  test.summary()
  console.log('=== DataParser ユニットテスト終了 ===\n')
}

// テスト関数をエクスポート（必要に応じて直接実行可能）
// runDataParserTests()