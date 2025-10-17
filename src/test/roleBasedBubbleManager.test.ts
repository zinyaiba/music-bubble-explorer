import { describe, it, expect, beforeEach } from 'vitest'
import { RoleBasedBubbleManager, CATEGORY_COLORS } from '@/services/roleBasedBubbleManager'
import type { MusicDatabase } from '@/types/music'

describe('RoleBasedBubbleManager', () => {
  let manager: RoleBasedBubbleManager
  let mockDatabase: MusicDatabase

  beforeEach(() => {
    // Create mock database with multi-role persons
    mockDatabase = {
      songs: [
        {
          id: '1',
          title: 'Test Song 1',
          lyricists: ['Alice', 'Bob'],
          composers: ['Alice', 'Charlie'],
          arrangers: ['Bob', 'David'],
          tags: ['pop', 'anime']
        },
        {
          id: '2',
          title: 'Test Song 2',
          lyricists: ['Alice'],
          composers: ['Charlie'],
          arrangers: ['David'],
          tags: ['rock']
        }
      ],
      people: [
        { id: '1', name: 'Alice', type: 'lyricist', songs: ['1', '2'] },
        { id: '2', name: 'Bob', type: 'lyricist', songs: ['1'] },
        { id: '3', name: 'Charlie', type: 'composer', songs: ['1', '2'] },
        { id: '4', name: 'David', type: 'arranger', songs: ['1', '2'] }
      ],
      tags: [
        { id: '1', name: 'pop', songs: ['1'] },
        { id: '2', name: 'anime', songs: ['1'] },
        { id: '3', name: 'rock', songs: ['2'] }
      ]
    }

    const config = {
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10,
      minLifespan: 5000,
      maxLifespan: 10000,
      minVelocity: 8,
      maxVelocity: 35
    }

    manager = new RoleBasedBubbleManager(mockDatabase, config)
  })

  it('should initialize with correct category colors', () => {
    expect(CATEGORY_COLORS.song).toBe('#FFB6C1')
    expect(CATEGORY_COLORS.lyricist).toBe('#B6E5D8')
    expect(CATEGORY_COLORS.composer).toBe('#DDA0DD')
    expect(CATEGORY_COLORS.arranger).toBe('#F0E68C')
    expect(CATEGORY_COLORS.tag).toBe('#98FB98')
  })

  it('should generate unique role bubbles for multi-role persons', () => {
    // Alice has both lyricist and composer roles
    const aliceBubbles = manager.generateUniqueRoleBubbles('Alice')
    
    expect(aliceBubbles.length).toBe(2) // lyricist + composer
    
    const lyricistBubble = aliceBubbles.find(b => b.type === 'lyricist')
    const composerBubble = aliceBubbles.find(b => b.type === 'composer')
    
    expect(lyricistBubble).toBeDefined()
    expect(composerBubble).toBeDefined()
    expect(lyricistBubble?.name).toBe('Alice')
    expect(composerBubble?.name).toBe('Alice')
    expect(lyricistBubble?.color).toBe(CATEGORY_COLORS.lyricist)
    expect(composerBubble?.color).toBe(CATEGORY_COLORS.composer)
  })

  it('should prevent duplicate display of role bubbles', () => {
    const bubbles = [
      manager.generateBubble(),
      manager.generateBubble(),
      manager.generateBubble()
    ]

    const uniqueBubbles = manager.preventDuplicateDisplay(bubbles)
    
    // Should not have duplicate role-based bubbles
    const bubbleIds = uniqueBubbles.map(b => b.id)
    const uniqueIds = new Set(bubbleIds)
    
    expect(bubbleIds.length).toBe(uniqueIds.size)
  })

  it('should assign category colors correctly', () => {
    const bubbles = [
      manager.generateBubble(),
      manager.generateBubble(),
      manager.generateBubble()
    ]

    const coloredBubbles = manager.assignCategoryColors(bubbles)
    
    coloredBubbles.forEach(bubble => {
      const expectedColor = CATEGORY_COLORS[bubble.type as keyof typeof CATEGORY_COLORS]
      expect(bubble.color).toBe(expectedColor)
    })
  })

  it('should get role-based statistics', () => {
    const stats = manager.getRoleBasedStats()
    
    expect(stats.totalPersons).toBeGreaterThan(0)
    expect(stats.roleDistribution).toBeDefined()
    expect(stats.multiRolePersons).toBeDefined()
    
    // Alice should be in multi-role persons (lyricist + composer)
    const aliceMultiRole = stats.multiRolePersons.find(p => p.name === 'Alice')
    expect(aliceMultiRole).toBeDefined()
    expect(aliceMultiRole?.roles).toContain('lyricist')
    expect(aliceMultiRole?.roles).toContain('composer')
  })

  it('should update music database and rebuild role map', () => {
    const newDatabase = {
      ...mockDatabase,
      songs: [
        ...mockDatabase.songs,
        {
          id: '3',
          title: 'New Song',
          lyricists: ['Eve'],
          composers: ['Eve'],
          arrangers: ['Eve'],
          tags: ['new']
        }
      ]
    }

    manager.updateMusicDatabase(newDatabase)
    
    const stats = manager.getRoleBasedStats()
    expect(stats.totalPersons).toBeGreaterThan(mockDatabase.people.length)
    
    // Eve should be a multi-role person
    const eveMultiRole = stats.multiRolePersons.find(p => p.name === 'Eve')
    expect(eveMultiRole).toBeDefined()
    expect(eveMultiRole?.roles.length).toBe(3) // lyricist + composer + arranger
  })

  it('should generate bubbles with correct properties', () => {
    const bubble = manager.generateBubble()
    
    expect(bubble).toBeDefined()
    expect(bubble.x).toBeGreaterThanOrEqual(0)
    expect(bubble.y).toBeGreaterThanOrEqual(0)
    expect(bubble.size).toBeGreaterThan(0)
    expect(bubble.lifespan).toBeGreaterThan(0)
    expect(['song', 'lyricist', 'composer', 'arranger', 'tag']).toContain(bubble.type)
    
    // Color should match category
    const expectedColor = CATEGORY_COLORS[bubble.type as keyof typeof CATEGORY_COLORS]
    expect(bubble.color).toBe(expectedColor)
  })

  it('should handle empty database gracefully', () => {
    const emptyDatabase: MusicDatabase = {
      songs: [],
      people: [],
      tags: []
    }

    const emptyManager = new RoleBasedBubbleManager(emptyDatabase, {
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10,
      minLifespan: 5000,
      maxLifespan: 10000,
      minVelocity: 8,
      maxVelocity: 35
    })

    expect(() => emptyManager.generateBubble()).toThrow()
    
    const stats = emptyManager.getRoleBasedStats()
    expect(stats.totalPersons).toBe(0)
    expect(stats.multiRolePersons.length).toBe(0)
  })
})