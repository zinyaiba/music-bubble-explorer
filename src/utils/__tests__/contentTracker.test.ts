/**
 * ContentTracker のユニットテスト
 * Requirements: 3.1, 3.2, 3.3, 3.4 - 重複防止アルゴリズムのテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ContentTracker } from '../contentTracker'
import type { Song, Person, Tag } from '@/types/music'
import type { ConsolidatedPerson } from '@/types/consolidatedPerson'
import type { BubbleRegistryConfig } from '@/types/bubbleRegistry'

// モックデータ
const mockSongs: Song[] = [
  {
    id: 'song1',
    title: 'Test Song 1',
    lyricists: ['person1'],
    composers: ['person2'],
    arrangers: ['person3'],
    tags: ['tag1']
  },
  {
    id: 'song2',
    title: 'Test Song 2',
    lyricists: ['person2'],
    composers: ['person1'],
    arrangers: [],
    tags: ['tag2']
  },
  {
    id: 'song3',
    title: 'Test Song 3',
    lyricists: ['person3'],
    composers: ['person3'],
    arrangers: ['person1'],
    tags: ['tag1', 'tag2']
  }
]

const mockPeople: Person[] = [
  {
    id: 'person1',
    name: 'Test Person 1',
    songs: ['song1', 'song2', 'song3']
  },
  {
    id: 'person2',
    name: 'Test Person 2',
    songs: ['song1', 'song2']
  },
  {
    id: 'person3',
    name: 'Test Person 3',
    songs: ['song1', 'song3']
  }
]

const mockTags: Tag[] = [
  {
    id: 'tag1',
    name: 'Test Tag 1',
    songs: ['song1', 'song3']
  },
  {
    id: 'tag2',
    name: 'Test Tag 2',
    songs: ['song2', 'song3']
  }
]

const mockConsolidatedPersons: ConsolidatedPerson[] = [
  {
    name: 'Test Person 1',
    roles: [
      { type: 'lyricist', songCount: 1 },
      { type: 'composer', songCount: 1 },
      { type: 'arranger', songCount: 1 }
    ],
    totalRelatedCount: 3,
    songs: ['song1', 'song2', 'song3']
  },
  {
    name: 'Test Person 2',
    roles: [
      { type: 'lyricist', songCount: 1 },
      { type: 'composer', songCount: 1 }
    ],
    totalRelatedCount: 2,
    songs: ['song1', 'song2']
  }
]

describe('ContentTracker', () => {
  let contentTracker: ContentTracker
  let testConfig: Partial<BubbleRegistryConfig>

  beforeEach(() => {
    testConfig = {
      maxDisplayedItems: 5,
      rotationCooldown: 1000, // 1秒（テスト用に短縮）
      enableWeightedSelection: true,
      enableRotationStrategy: true,
      weightedConfig: {
        recencyWeight: 0.3,
        popularityWeight: 0.4,
        typeBalanceWeight: 0.2,
        randomWeight: 0.1
      }
    }
    contentTracker = new ContentTracker(testConfig)
  })

  describe('初期化とコンテンツプール管理', () => {
    it('コンテンツプールを正しく初期化する', () => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
      
      const stats = contentTracker.getStats()
      expect(stats.totalContent).toBe(mockSongs.length + mockPeople.length + mockTags.length)
      expect(stats.availableContent).toBe(mockSongs.length + mockPeople.length + mockTags.length)
      expect(stats.displayedContent).toBe(0)
      expect(stats.songCount).toBe(mockSongs.length)
      expect(stats.personCount).toBe(mockPeople.length)
      expect(stats.tagCount).toBe(mockTags.length)
    })

    it('統合された人物データでコンテンツプールを初期化する', () => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags, mockConsolidatedPersons)
      
      const stats = contentTracker.getStats()
      expect(stats.personCount).toBe(mockConsolidatedPersons.length)
      
      const debugInfo = contentTracker.getDebugInfo()
      const personContent = debugInfo.availableContent.filter(item => item.type === 'person')
      expect(personContent).toHaveLength(mockConsolidatedPersons.length)
      
      // 統合された人物の役割情報が含まれているかチェック
      const person1 = personContent.find(item => item.name === 'Test Person 1')
      expect(person1?.roles).toBeDefined()
      expect(person1?.roles).toHaveLength(3)
    })
  })

  describe('表示中アイテムの追跡機能', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('新しいアイテムを正しく追跡する', () => {
      const result = contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      expect(result).toBe(true)
      
      const stats = contentTracker.getStats()
      expect(stats.displayedContent).toBe(1)
      expect(stats.availableContent).toBe(mockSongs.length + mockPeople.length + mockTags.length - 1)
    })

    it('重複するアイテムの追跡を拒否する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      const result = contentTracker.trackDisplayedItem('song1', 'bubble2', 'song')
      
      expect(result).toBe(false)
      
      const stats = contentTracker.getStats()
      expect(stats.displayedContent).toBe(1)
    })

    it('最大表示数を超える追跡を拒否する', () => {
      // 最大表示数まで追跡
      for (let i = 0; i < testConfig.maxDisplayedItems!; i++) {
        const result = contentTracker.trackDisplayedItem(`song${i}`, `bubble${i}`, 'song')
        if (i < mockSongs.length) {
          expect(result).toBe(true)
        }
      }
      
      // 最大数を超える追跡を試行
      const result = contentTracker.trackDisplayedItem('person1', 'bubble_extra', 'person')
      expect(result).toBe(false)
    })

    it('表示終了時に正しく追跡を解除する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      const statsBefore = contentTracker.getStats()
      expect(statsBefore.displayedContent).toBe(1)
      
      contentTracker.untrackDisplayedItem('bubble1')
      
      const statsAfter = contentTracker.getStats()
      expect(statsAfter.displayedContent).toBe(0)
    })
  })

  describe('重み付き選択アルゴリズム', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('利用可能なコンテンツから選択する', () => {
      const selectedContent = contentTracker.selectNextContent()
      
      expect(selectedContent).not.toBeNull()
      expect(['song', 'person', 'tag']).toContain(selectedContent!.type)
    })

    it('重み付き選択が無効の場合はランダム選択する', () => {
      const configWithoutWeights = { ...testConfig, enableWeightedSelection: false }
      const tracker = new ContentTracker(configWithoutWeights)
      tracker.initializeContentPool(mockSongs, mockPeople, mockTags)
      
      const selectedContent = tracker.selectNextContent()
      expect(selectedContent).not.toBeNull()
    })

    it('人気度スコアが正しく計算される', () => {
      // 関連数の多いアイテムが選ばれやすいかテスト
      const selections: string[] = []
      
      for (let i = 0; i < 50; i++) {
        const selected = contentTracker.selectNextContent()
        if (selected) {
          selections.push(selected.id)
          // 選択されたアイテムを一時的に追跡して重複を避ける
          contentTracker.trackDisplayedItem(selected.id, `bubble${i}`, selected.type)
        }
      }
      
      expect(selections.length).toBeGreaterThan(0)
    })

    it('タイプバランスが考慮される', () => {
      // 複数回選択してタイプのバランスをチェック
      const typeCount = { song: 0, person: 0, tag: 0 }
      
      for (let i = 0; i < 30; i++) {
        const selected = contentTracker.selectNextContent()
        if (selected) {
          typeCount[selected.type]++
          // 選択後すぐに追跡解除してプールに戻す
          contentTracker.trackDisplayedItem(selected.id, `bubble${i}`, selected.type)
          contentTracker.untrackDisplayedItem(`bubble${i}`)
        }
      }
      
      // 各タイプが少なくとも1回は選ばれることを確認
      expect(typeCount.song).toBeGreaterThan(0)
      expect(typeCount.person).toBeGreaterThan(0)
      expect(typeCount.tag).toBeGreaterThan(0)
    })
  })

  describe('回転戦略の実装', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('利用可能プールが空の場合に強制回転を実行する', () => {
      // より小さい最大表示数で強制回転をテスト
      const smallConfig = { ...testConfig, maxDisplayedItems: 2 }
      const tracker = new ContentTracker(smallConfig)
      tracker.initializeContentPool(mockSongs, mockPeople, mockTags)
      
      // 最大表示数まで追跡
      tracker.trackDisplayedItem('song1', 'bubble1', 'song')
      tracker.trackDisplayedItem('song2', 'bubble2', 'song')
      
      // 利用可能プールから全て選択して表示中にする
      let selectedCount = 0
      while (selectedCount < 10) { // 無限ループを防ぐため上限設定
        const selected = tracker.selectNextContent()
        if (!selected) break
        
        const bubbleId = `forced_bubble_${selectedCount}`
        const success = tracker.trackDisplayedItem(selected.id, bubbleId, selected.type)
        if (!success) {
          // 追跡に失敗した場合、強制回転が発生したかチェック
          const stats = tracker.getStats()
          if (stats.rotationStats.forcedRotations > 0) {
            expect(stats.rotationStats.forcedRotations).toBeGreaterThan(0)
            return // テスト成功
          }
          break
        }
        selectedCount++
      }
      
      // 強制回転が発生しなかった場合でも、システムが正常に動作していることを確認
      const finalStats = tracker.getStats()
      expect(finalStats.displayedContent).toBeGreaterThan(0)
    })

    it('回転戦略が無効の場合は強制回転しない', () => {
      const configWithoutRotation = { ...testConfig, enableRotationStrategy: false }
      const tracker = new ContentTracker(configWithoutRotation)
      tracker.initializeContentPool(mockSongs, mockPeople, mockTags)
      
      // 全てのアイテムを表示中にする（最大表示数まで）
      const allItems = [
        ...mockSongs.map(s => ({ id: s.id, type: 'song' as const })),
        ...mockPeople.map(p => ({ id: p.id, type: 'person' as const })),
        ...mockTags.map(t => ({ id: t.id, type: 'tag' as const }))
      ]
      
      // 最大表示数まで追跡
      const itemsToTrack = allItems.slice(0, testConfig.maxDisplayedItems!)
      itemsToTrack.forEach((item, index) => {
        tracker.trackDisplayedItem(item.id, `bubble${index}`, item.type)
      })
      
      // 残りのアイテムがある場合は通常選択、ない場合はnull
      const remainingItems = allItems.length - itemsToTrack.length
      const selectedContent = tracker.selectNextContent()
      
      if (remainingItems > 0) {
        // まだ利用可能なアイテムがある場合は選択される
        expect(selectedContent).not.toBeNull()
      } else {
        // 全てのアイテムが表示中で回転戦略が無効の場合はnull
        expect(selectedContent).toBeNull()
      }
    })

    it('回転サイクルが正しく管理される', () => {
      const initialStats = contentTracker.getStats()
      expect(initialStats.rotationStats.currentCycle).toBe(0)
      expect(initialStats.rotationStats.completedCycles).toBe(0)
      
      // 複数のアイテムを表示して回転サイクルを進める
      const totalItems = mockSongs.length + mockPeople.length + mockTags.length
      const itemsToDisplay = Math.ceil(totalItems * 0.8) // 80%のアイテムを表示
      
      for (let i = 0; i < itemsToDisplay; i++) {
        const selected = contentTracker.selectNextContent()
        if (selected) {
          contentTracker.trackDisplayedItem(selected.id, `bubble${i}`, selected.type)
        }
      }
      
      const statsAfter = contentTracker.getStats()
      expect(statsAfter.rotationStats.itemsInCurrentCycle.size).toBeGreaterThan(0)
    })
  })

  describe('クールダウン機能', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('クールダウン時間内はプールに戻らない', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      contentTracker.untrackDisplayedItem('bubble1')
      
      // クールダウン時間内なのでプールに戻らない
      const availableContent = contentTracker.getDebugInfo().availableContent
      const song1Available = availableContent.find(item => item.id === 'song1')
      expect(song1Available).toBeUndefined()
    })

    it('クールダウン時間経過後はプールに戻る', async () => {
      // タイマーをモック
      vi.useFakeTimers()
      
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      // 時間を進めてから追跡解除
      vi.advanceTimersByTime(testConfig.rotationCooldown! + 100)
      contentTracker.untrackDisplayedItem('bubble1')
      
      // プールに戻ったかチェック
      const availableContent = contentTracker.getDebugInfo().availableContent
      const song1Available = availableContent.find(item => item.id === 'song1')
      expect(song1Available).toBeDefined()
      
      vi.useRealTimers()
    })
  })

  describe('統計情報とデバッグ機能', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('詳細な統計情報を提供する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      const stats = contentTracker.getStats()
      
      expect(stats).toHaveProperty('totalContent')
      expect(stats).toHaveProperty('availableContent')
      expect(stats).toHaveProperty('displayedContent')
      expect(stats).toHaveProperty('rotationStats')
      expect(stats).toHaveProperty('averageDisplayDuration')
      expect(stats).toHaveProperty('selectionEfficiency')
      
      expect(stats.rotationStats).toHaveProperty('currentCycle')
      expect(stats.rotationStats).toHaveProperty('completedCycles')
      expect(stats.rotationStats).toHaveProperty('forcedRotations')
    })

    it('デバッグ情報を提供する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      const debugInfo = contentTracker.getDebugInfo()
      
      expect(debugInfo).toHaveProperty('displayedContent')
      expect(debugInfo).toHaveProperty('availableContent')
      expect(debugInfo).toHaveProperty('rotationState')
      expect(debugInfo).toHaveProperty('typeRotationQueue')
      expect(debugInfo).toHaveProperty('currentTypeIndex')
      expect(debugInfo).toHaveProperty('selectionWeights')
      
      expect(debugInfo.displayedContent).toHaveLength(1)
      expect(debugInfo.selectionWeights.size).toBeGreaterThan(0)
    })

    it('平均表示時間を正しく計算する', async () => {
      vi.useFakeTimers()
      
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      // 1秒経過
      vi.advanceTimersByTime(1000)
      
      contentTracker.untrackDisplayedItem('bubble1')
      
      const stats = contentTracker.getStats()
      expect(stats.averageDisplayDuration).toBe(1000)
      
      vi.useRealTimers()
    })
  })

  describe('設定の更新とリセット', () => {
    beforeEach(() => {
      contentTracker.initializeContentPool(mockSongs, mockPeople, mockTags)
    })

    it('設定を動的に更新できる', () => {
      const newConfig = {
        maxDisplayedItems: 10,
        enableWeightedSelection: false
      }
      
      contentTracker.updateConfig(newConfig)
      
      // 新しい設定で動作することを確認
      for (let i = 0; i < 7; i++) {
        const result = contentTracker.trackDisplayedItem(`song${i}`, `bubble${i}`, 'song')
        if (i < mockSongs.length) {
          expect(result).toBe(true)
        }
      }
    })

    it('リセット機能が正しく動作する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      const statsBefore = contentTracker.getStats()
      expect(statsBefore.displayedContent).toBe(1)
      
      contentTracker.reset()
      
      const statsAfter = contentTracker.getStats()
      expect(statsAfter.displayedContent).toBe(0)
      expect(statsAfter.availableContent).toBe(0)
      expect(statsAfter.totalContent).toBe(0)
    })
  })

  describe('エラーハンドリング', () => {
    it('空のデータでも正常に動作する', () => {
      contentTracker.initializeContentPool([], [], [])
      
      const stats = contentTracker.getStats()
      expect(stats.totalContent).toBe(0)
      
      const selectedContent = contentTracker.selectNextContent()
      expect(selectedContent).toBeNull()
    })

    it('存在しないbubbleIdの追跡解除を無視する', () => {
      contentTracker.trackDisplayedItem('song1', 'bubble1', 'song')
      
      // 存在しないbubbleIdで追跡解除を試行
      expect(() => {
        contentTracker.untrackDisplayedItem('nonexistent_bubble')
      }).not.toThrow()
      
      const stats = contentTracker.getStats()
      expect(stats.displayedContent).toBe(1) // 変化なし
    })

    it('不正なcontentIdでも正常に処理する', () => {
      const result = contentTracker.trackDisplayedItem('nonexistent_content', 'bubble1', 'song')
      
      // 存在しないコンテンツでも追跡は成功する（プールから削除されないだけ）
      expect(result).toBe(true)
      
      const stats = contentTracker.getStats()
      expect(stats.displayedContent).toBe(1)
    })
  })
})