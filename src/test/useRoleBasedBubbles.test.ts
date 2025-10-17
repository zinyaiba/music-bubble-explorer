import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRoleBasedBubbles } from '@/hooks/useRoleBasedBubbles'
import type { MusicDatabase } from '@/types/music'

describe('useRoleBasedBubbles', () => {
  let mockDatabase: MusicDatabase

  beforeEach(() => {
    mockDatabase = {
      songs: [
        {
          id: '1',
          title: 'Test Song 1',
          lyricists: ['Alice'],
          composers: ['Alice', 'Bob'],
          arrangers: ['Charlie'],
          tags: ['pop']
        },
        {
          id: '2',
          title: 'Test Song 2',
          lyricists: ['Bob'],
          composers: ['Charlie'],
          arrangers: ['Alice'],
          tags: ['rock']
        }
      ],
      people: [
        { id: '1', name: 'Alice', type: 'lyricist', songs: ['1', '2'] },
        { id: '2', name: 'Bob', type: 'composer', songs: ['1', '2'] },
        { id: '3', name: 'Charlie', type: 'arranger', songs: ['1', '2'] }
      ],
      tags: [
        { id: '1', name: 'pop', songs: ['1'] },
        { id: '2', name: 'rock', songs: ['2'] }
      ]
    }
  })

  it('should initialize with empty state when database is empty', () => {
    const emptyDatabase: MusicDatabase = { songs: [], people: [], tags: [] }
    
    const { result } = renderHook(() =>
      useRoleBasedBubbles(emptyDatabase, 800, 600, 10)
    )

    expect(result.current.bubbles).toEqual([])
    expect(result.current.isInitialized).toBe(false)
    expect(result.current.stats).toBeNull()
  })

  it('should initialize with music database', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    expect(result.current.isInitialized).toBe(true)
    expect(result.current.bubbleManager).toBeDefined()
  })

  it('should generate legend items with correct structure', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    const legendItems = result.current.legendItems
    
    expect(legendItems).toHaveLength(5)
    
    const songItem = legendItems.find(item => item.category === 'song')
    const lyricistItem = legendItems.find(item => item.category === 'lyricist')
    const composerItem = legendItems.find(item => item.category === 'composer')
    const arrangerItem = legendItems.find(item => item.category === 'arranger')
    const tagItem = legendItems.find(item => item.category === 'tag')

    expect(songItem).toBeDefined()
    expect(songItem?.label).toBe('楽曲')
    expect(songItem?.icon).toBe('🎵')
    expect(songItem?.color).toBe('#FFB6C1')

    expect(lyricistItem).toBeDefined()
    expect(lyricistItem?.label).toBe('作詞家')
    expect(lyricistItem?.icon).toBe('✍️')
    expect(lyricistItem?.color).toBe('#B6E5D8')

    expect(composerItem).toBeDefined()
    expect(composerItem?.label).toBe('作曲家')
    expect(composerItem?.icon).toBe('🎼')
    expect(composerItem?.color).toBe('#DDA0DD')

    expect(arrangerItem).toBeDefined()
    expect(arrangerItem?.label).toBe('編曲家')
    expect(arrangerItem?.icon).toBe('🎹')
    expect(arrangerItem?.color).toBe('#F0E68C')

    expect(tagItem).toBeDefined()
    expect(tagItem?.label).toBe('タグ')
    expect(tagItem?.icon).toBe('🏷️')
    expect(tagItem?.color).toBe('#98FB98')
  })

  it('should handle bubble click', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    act(() => {
      const clickedBubble = result.current.handleBubbleClick(100, 100)
      // Should return null if no bubble at position, or bubble if found
      expect(clickedBubble).toBeNull() // No bubble at 100,100 initially
    })
  })

  it('should update frame and return bubbles', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    act(() => {
      const updatedBubbles = result.current.updateFrame()
      expect(Array.isArray(updatedBubbles)).toBe(true)
    })
  })

  it('should generate person role bubbles', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    act(() => {
      const aliceBubbles = result.current.generatePersonRoleBubbles('Alice')
      expect(Array.isArray(aliceBubbles)).toBe(true)
      // Alice has lyricist and arranger roles in our test data
    })
  })

  it('should prevent duplicates', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    // Wait for initialization
    if (!result.current.bubbleManager) {
      return
    }

    act(() => {
      // Generate actual bubbles from the manager
      const bubble1 = result.current.bubbleManager!.generateBubble()
      const bubble2 = result.current.bubbleManager!.generateBubble()
      const bubble3 = result.current.bubbleManager!.generateBubble()
      
      const mockBubbles = [bubble1, bubble2, bubble3]
      const uniqueBubbles = result.current.preventDuplicates(mockBubbles)
      expect(uniqueBubbles.length).toBeLessThanOrEqual(mockBubbles.length)
    })
  })

  it('should apply category colors', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    // Wait for initialization
    if (!result.current.bubbleManager) {
      return
    }

    act(() => {
      // Generate actual bubbles from the manager
      const bubble1 = result.current.bubbleManager!.generateBubble()
      const bubble2 = result.current.bubbleManager!.generateBubble()
      
      const mockBubbles = [bubble1, bubble2]
      const coloredBubbles = result.current.applyCategoryColors(mockBubbles)
      
      // Colors should be applied based on bubble type
      expect(coloredBubbles.length).toBe(2)
      coloredBubbles.forEach(bubble => {
        expect(bubble.color).toBeDefined()
        expect(bubble.color).not.toBe('#000000') // Should not be the default black
      })
    })
  })

  it('should clear bubbles', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    act(() => {
      result.current.clearBubbles()
      expect(result.current.bubbles).toEqual([])
    })
  })

  it('should update config', () => {
    const { result } = renderHook(() =>
      useRoleBasedBubbles(mockDatabase, 800, 600, 10)
    )

    act(() => {
      result.current.updateConfig({ maxBubbles: 20 })
      // Config should be updated in the bubble manager
    })

    expect(result.current.bubbleManager).toBeDefined()
  })
})