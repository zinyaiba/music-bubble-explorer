/**
 * BubbleRegistry ユニットテスト
 * Requirements: 3.1, 3.2, 3.3, 3.4 - シャボン玉レジストリシステムのテスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { BubbleRegistry } from '../bubbleRegistry'
import type { Song, Person, Tag } from '@/types/music'
import type { ConsolidatedPerson } from '@/types/consolidatedPerson'
import type { BubbleRegistryConfig } from '@/types/bubbleRegistry'

// テスト用のサンプルデータ
const testSongs: Song[] = [
  {
    id: 'song1',
    title: 'Test Song 1',
    lyricists: ['Artist A'],
    composers: ['Artist B'],
    arrangers: ['Artist C'],
    tags: ['tag1']
  },
  {
    id: 'song2',
    title: 'Test Song 2',
    lyricists: ['Artist A'],
    composers: ['Artist A'],
    arrangers: ['Artist D'],
    tags: ['tag2']
  }
]

const testPeople: Person[] = [
  {
    id: 'person1',
    name: 'Artist A',
    type: 'lyricist',
    songs: ['song1', 'song2']
  },
  {
    id: 'person2',
    name: 'Artist B',
    type: 'composer',
    songs: ['song1']
  }
]

const testTags: Tag[] = [
  {
    id: 'tag1',
    name: 'Rock',
    songs: ['song1']
  },
  {
    id: 'tag2',
    name: 'Pop',
    songs: ['song2']
  }
]

const testConsolidatedPersons: ConsolidatedPerson[] = [
  {
    name: 'Artist A',
    roles: [
      { type: 'lyricist', songCount: 2 },
      { type: 'composer', songCount: 1 }
    ],
    totalRelatedCount: 3,
    songs: ['song1', 'song2']
  }
]

describe('BubbleRegistry', () => {
  let registry: BubbleRegistry

  beforeEach(() => {
    registry = new BubbleRegistry()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('初期化', () => {
    it('デフォルト設定で正しく初期化される', () => {
      expect(registry).toBeDefined()
      expect(registry.getStats().totalContent).toBe(0)
    })

    it('カスタム設定で正しく初期化される', () => {
      const config: Partial<BubbleRegistryConfig> = {
        maxDisplayedItems: 10,
        rotationCooldown: 5000
      }
      
      const customRegistry = new BubbleRegistry(config)
      expect(customRegistry).toBeDefined()
    })
  })

  describe('コンテンツプールの初期化', () => {
    it('楽曲、人物、タグを正しくプールに追加する', () => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
      
      const stats = registry.getStats()
      expect(stats.totalContent).toBe(testSongs.length + testPeople.length + testTags.length)
      expect(stats.songCount).toBe(testSongs.length)
      expect(stats.personCount).toBe(testPeople.length)
      expect(stats.tagCount).toBe(testTags.length)
    })

    it('統合された人物データを優先して使用する', () => {
      registry.initializeContentPool(testSongs, testPeople, testTags, testConsolidatedPersons)
      
      const stats = registry.getStats()
      // 統合された人物データが使用されるため、人物数は統合後の数になる
      expect(stats.personCount).toBe(testConsolidatedPersons.length)
    })

    it('空のデータでも正しく初期化される', () => {
      registry.initializeContentPool([], [], [])
      
      const stats = registry.getStats()
      expect(stats.totalContent).toBe(0)
    })
  })

  describe('シャボン玉の登録', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('新しいシャボン玉を正しく登録する', () => {
      const result = registry.registerBubble('song1', 'bubble1', 'song')
      
      expect(result).toBe(true)
      expect(registry.isContentDisplayed('song1')).toBe(true)
      
      const stats = registry.getStats()
      expect(stats.displayedContent).toBe(1)
      expect(stats.availableContent).toBe(stats.totalContent - 1)
    })

    it('重複するコンテンツの登録を拒否する', () => {
      // 1回目の登録
      const result1 = registry.registerBubble('song1', 'bubble1', 'song')
      expect(result1).toBe(true)
      
      // 2回目の登録（重複）
      const result2 = registry.registerBubble('song1', 'bubble2', 'song')
      expect(result2).toBe(false)
      
      const stats = registry.getStats()
      expect(stats.displayedContent).toBe(1) // 1つだけ登録されている
    })

    it('最大表示数を超える登録を拒否する', () => {
      const config: Partial<BubbleRegistryConfig> = {
        maxDisplayedItems: 1
      }
      
      const limitedRegistry = new BubbleRegistry(config)
      limitedRegistry.initializeContentPool(testSongs, testPeople, testTags)
      
      // 1つ目は成功
      const result1 = limitedRegistry.registerBubble('song1', 'bubble1', 'song')
      expect(result1).toBe(true)
      
      // 2つ目は失敗（上限に達している）
      const result2 = limitedRegistry.registerBubble('song2', 'bubble2', 'song')
      expect(result2).toBe(false)
    })
  })

  describe('シャボン玉の登録解除', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('シャボン玉を正しく登録解除する', () => {
      // 登録
      registry.registerBubble('song1', 'bubble1', 'song')
      expect(registry.isContentDisplayed('song1')).toBe(true)
      
      // 登録解除
      registry.unregisterBubble('bubble1')
      expect(registry.isContentDisplayed('song1')).toBe(false)
      
      const stats = registry.getStats()
      expect(stats.displayedContent).toBe(0)
    })

    it('存在しないシャボン玉の登録解除は何もしない', () => {
      const initialStats = registry.getStats()
      
      registry.unregisterBubble('nonexistent_bubble')
      
      const finalStats = registry.getStats()
      expect(finalStats).toEqual(initialStats)
    })
  })

  describe('コンテンツ選択', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('利用可能なコンテンツから選択する', () => {
      const content = registry.getNextUniqueContent()
      
      expect(content).toBeDefined()
      expect(content?.id).toBeDefined()
      expect(['song', 'person', 'tag']).toContain(content?.type)
    })

    it('表示中のコンテンツは選択されない', () => {
      // 回転戦略を無効にしてテスト
      const config: Partial<BubbleRegistryConfig> = {
        enableRotationStrategy: false
      }
      
      const noRotationRegistry = new BubbleRegistry(config)
      noRotationRegistry.initializeContentPool(testSongs, testPeople, testTags)
      
      // 全てのコンテンツを登録
      const availableContent = noRotationRegistry.getAvailableContent()
      availableContent.forEach((content, index) => {
        noRotationRegistry.registerBubble(content.id, `bubble${index}`, content.type)
      })
      
      // 利用可能なコンテンツがない場合（回転戦略が無効なのでnullが返される）
      const content = noRotationRegistry.getNextUniqueContent()
      expect(content).toBeNull()
    })

    it('重み付き選択が正しく動作する', () => {
      const config: Partial<BubbleRegistryConfig> = {
        enableWeightedSelection: true
      }
      
      const weightedRegistry = new BubbleRegistry(config)
      weightedRegistry.initializeContentPool(testSongs, testPeople, testTags)
      
      const content = weightedRegistry.getNextUniqueContent()
      expect(content).toBeDefined()
    })
  })

  describe('回転戦略', () => {
    it('プールが空の時に最古のアイテムを強制回転する', () => {
      const config: Partial<BubbleRegistryConfig> = {
        maxDisplayedItems: 2,
        enableRotationStrategy: true
      }
      
      const rotationRegistry = new BubbleRegistry(config)
      rotationRegistry.initializeContentPool(testSongs, [], []) // 楽曲のみ
      
      // 全ての楽曲を登録
      rotationRegistry.registerBubble('song1', 'bubble1', 'song')
      rotationRegistry.registerBubble('song2', 'bubble2', 'song')
      
      // プールが空の状態で新しいコンテンツを要求
      const content = rotationRegistry.getNextUniqueContent()
      expect(content).toBeDefined() // 回転により利用可能になる
    })

    it('回転戦略が無効の場合はnullを返す', () => {
      const config: Partial<BubbleRegistryConfig> = {
        maxDisplayedItems: 1,
        enableRotationStrategy: false
      }
      
      const noRotationRegistry = new BubbleRegistry(config)
      noRotationRegistry.initializeContentPool([testSongs[0]], [], [])
      
      // 唯一の楽曲を登録
      noRotationRegistry.registerBubble('song1', 'bubble1', 'song')
      
      // 回転戦略が無効なのでnullが返される
      const content = noRotationRegistry.getNextUniqueContent()
      expect(content).toBeNull()
    })
  })

  describe('統計情報', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('正しい統計情報を返す', () => {
      const stats = registry.getStats()
      
      expect(stats.totalContent).toBe(testSongs.length + testPeople.length + testTags.length)
      expect(stats.availableContent).toBe(stats.totalContent)
      expect(stats.displayedContent).toBe(0)
      expect(stats.songCount).toBe(testSongs.length)
      expect(stats.personCount).toBe(testPeople.length)
      expect(stats.tagCount).toBe(testTags.length)
      expect(stats.rotationCycle).toBe(0)
    })

    it('登録後の統計情報が正しく更新される', () => {
      registry.registerBubble('song1', 'bubble1', 'song')
      
      const stats = registry.getStats()
      expect(stats.displayedContent).toBe(1)
      expect(stats.availableContent).toBe(stats.totalContent - 1)
    })
  })

  describe('タイプ別コンテンツ数', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('タイプ別の利用可能・表示中コンテンツ数を正しく返す', () => {
      const songCount = registry.getContentCountByType('song')
      expect(songCount.available).toBe(testSongs.length)
      expect(songCount.displayed).toBe(0)
      
      // 楽曲を1つ登録
      registry.registerBubble('song1', 'bubble1', 'song')
      
      const updatedSongCount = registry.getContentCountByType('song')
      expect(updatedSongCount.available).toBe(testSongs.length - 1)
      expect(updatedSongCount.displayed).toBe(1)
    })
  })

  describe('設定更新', () => {
    it('設定を正しく更新する', () => {
      const newConfig: Partial<BubbleRegistryConfig> = {
        maxDisplayedItems: 50,
        rotationCooldown: 10000
      }
      
      registry.updateConfig(newConfig)
      
      // 設定が適用されているかテスト（間接的に確認）
      registry.initializeContentPool(testSongs, testPeople, testTags)
      
      // 50個まで登録できるかテスト
      for (let i = 0; i < Math.min(50, testSongs.length + testPeople.length + testTags.length); i++) {
        const content = registry.getNextUniqueContent()
        if (content) {
          const result = registry.registerBubble(content.id, `bubble${i}`, content.type)
          expect(result).toBe(true)
        }
      }
    })
  })

  describe('リセット', () => {
    it('レジストリを正しくリセットする', () => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
      registry.registerBubble('song1', 'bubble1', 'song')
      
      // リセット前の状態確認
      expect(registry.getStats().totalContent).toBeGreaterThan(0)
      expect(registry.getStats().displayedContent).toBe(1)
      
      // リセット
      registry.reset()
      
      // リセット後の状態確認
      const stats = registry.getStats()
      expect(stats.totalContent).toBe(0)
      expect(stats.displayedContent).toBe(0)
      expect(stats.availableContent).toBe(0)
      expect(stats.rotationCycle).toBe(0)
    })
  })

  describe('表示履歴', () => {
    beforeEach(() => {
      registry.initializeContentPool(testSongs, testPeople, testTags)
    })

    it('コンテンツの表示履歴を正しく記録する', () => {
      // 初期状態では履歴なし
      expect(registry.getContentHistory('song1')).toEqual([])
      
      // 登録
      registry.registerBubble('song1', 'bubble1', 'song')
      
      // 履歴が記録される
      const history = registry.getContentHistory('song1')
      expect(history.length).toBe(1)
      expect(typeof history[0]).toBe('number')
    })

    it('複数回の表示履歴を正しく記録する', async () => {
      // 1回目
      registry.registerBubble('song1', 'bubble1', 'song')
      registry.unregisterBubble('bubble1')
      
      // 少し待ってから2回目（タイムスタンプの差を確保）
      await new Promise(resolve => setTimeout(resolve, 10))
      registry.registerBubble('song1', 'bubble2', 'song')
      
      const history = registry.getContentHistory('song1')
      expect(history.length).toBe(2)
      expect(history[1]).toBeGreaterThan(history[0])
    })
  })
})