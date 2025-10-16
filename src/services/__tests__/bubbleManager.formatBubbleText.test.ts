import { BubbleManager } from '../bubbleManager'
import { BubbleEntity } from '@/types/bubble'
import { MusicDatabase } from '@/types/music'

describe('BubbleManager.formatBubbleText', () => {
  let bubbleManager: BubbleManager
  
  beforeEach(() => {
    const mockDatabase: MusicDatabase = {
      songs: [],
      people: [],
      tags: []
    }
    
    const config = {
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10,
      minLifespan: 5000,
      maxLifespan: 10000,
      minVelocity: 5,
      maxVelocity: 15
    }
    
    bubbleManager = new BubbleManager(mockDatabase, config)
  })

  it('should add # prefix to tag bubbles', () => {
    const tagBubble = new BubbleEntity({
      type: 'tag',
      name: 'ロック',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 3
    })

    const result = bubbleManager.formatBubbleText(tagBubble)
    expect(result).toBe('#ロック')
  })

  it('should not add # prefix to song bubbles', () => {
    const songBubble = new BubbleEntity({
      type: 'song',
      name: 'Beautiful Amulet',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 3
    })

    const result = bubbleManager.formatBubbleText(songBubble)
    expect(result).toBe('Beautiful Amulet')
  })

  it('should not add # prefix to person bubbles', () => {
    const lyricistBubble = new BubbleEntity({
      type: 'lyricist',
      name: '栗林みな実',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#87CEEB',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 5
    })

    const result = bubbleManager.formatBubbleText(lyricistBubble)
    expect(result).toBe('栗林みな実')
  })

  it('should handle empty tag names', () => {
    const emptyTagBubble = new BubbleEntity({
      type: 'tag',
      name: '',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 0
    })

    const result = bubbleManager.formatBubbleText(emptyTagBubble)
    expect(result).toBe('#')
  })

  it('should handle special characters in tag names', () => {
    const specialTagBubble = new BubbleEntity({
      type: 'tag',
      name: 'アニメ&ゲーム',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 50,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 2
    })

    const result = bubbleManager.formatBubbleText(specialTagBubble)
    expect(result).toBe('#アニメ&ゲーム')
  })
})