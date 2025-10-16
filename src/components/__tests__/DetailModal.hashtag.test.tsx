import React from 'react'
import { render, screen } from '@testing-library/react'
import { DetailModal } from '../DetailModal'
import { BubbleEntity } from '@/types/bubble'
import { ThemeProvider } from '../ThemeProvider'
import { vi } from 'vitest'

// Mock MusicDataService
vi.mock('@/services/musicDataService', () => ({
  MusicDataService: {
    getInstance: () => ({
      getSongByTitle: vi.fn().mockReturnValue(null),
      getPeopleForSong: vi.fn().mockReturnValue([]),
      getSongsForTag: vi.fn().mockReturnValue([
        { id: '1', title: 'Test Song 1', tags: ['ロック', 'アニメ'] },
        { id: '2', title: 'Test Song 2', tags: ['バラード'] }
      ]),
      getPeopleByName: vi.fn().mockReturnValue([]),
      getSongById: vi.fn().mockReturnValue(null),
      getTagManager: () => ({
        calculateTagPopularity: vi.fn().mockReturnValue(5),
        getRelatedTags: vi.fn().mockReturnValue([])
      })
    })
  }
}))

describe('DetailModal Hashtag Display', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display hashtag prefix for tag bubbles in title', () => {
    const tagBubble = new BubbleEntity({
      type: 'tag',
      name: 'ロック',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 3
    })

    render(
      <ThemeProvider>
        <DetailModal
          selectedBubble={tagBubble}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    // Check if the title displays with hashtag prefix
    expect(screen.getByRole('heading', { name: '#ロック' })).toBeInTheDocument()
  })

  it('should display hashtag in tag description', () => {
    const tagBubble = new BubbleEntity({
      type: 'tag',
      name: 'アニメ',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 2
    })

    render(
      <ThemeProvider>
        <DetailModal
          selectedBubble={tagBubble}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    // Check if the description includes hashtag
    expect(screen.getByText('「#アニメ」タグの詳細情報')).toBeInTheDocument()
  })

  it('should not display hashtag prefix for song bubbles', () => {
    const songBubble = new BubbleEntity({
      type: 'song',
      name: 'Beautiful Amulet',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 3
    })

    render(
      <ThemeProvider>
        <DetailModal
          selectedBubble={songBubble}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    // Check if the title displays without hashtag prefix
    expect(screen.getByText('Beautiful Amulet')).toBeInTheDocument()
    expect(screen.queryByText('#Beautiful Amulet')).not.toBeInTheDocument()
  })

  it('should not display hashtag prefix for person bubbles', () => {
    const personBubble = new BubbleEntity({
      type: 'lyricist',
      name: '栗林みな実',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#87CEEB',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 5
    })

    render(
      <ThemeProvider>
        <DetailModal
          selectedBubble={personBubble}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    // Check if the title displays without hashtag prefix
    expect(screen.getByText('栗林みな実')).toBeInTheDocument()
    expect(screen.queryByText('#栗林みな実')).not.toBeInTheDocument()
  })

  it('should display tag chips with hashtag prefix in song details', () => {
    const tagBubble = new BubbleEntity({
      type: 'tag',
      name: 'テスト',
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      size: 60,
      color: '#98FB98',
      opacity: 1,
      lifespan: 5000,
      relatedCount: 2
    })

    render(
      <ThemeProvider>
        <DetailModal
          selectedBubble={tagBubble}
          onClose={mockOnClose}
        />
      </ThemeProvider>
    )

    // Check if tag popularity is displayed
    expect(screen.getByText(/人気度: 2曲に使用/)).toBeInTheDocument()
  })
})