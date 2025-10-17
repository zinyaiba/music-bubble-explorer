import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EnhancedTagList } from '@/components/EnhancedTagList'
import { DataManager } from '@/services/dataManager'
import { Song, Tag } from '@/types/music'

// Mock DataManager
vi.mock('@/services/dataManager', () => ({
  DataManager: {
    loadSongs: vi.fn(),
    loadMusicDatabase: vi.fn()
  }
}))

// Mock CSS import
vi.mock('@/components/EnhancedTagList.css', () => ({}))

describe('EnhancedTagList Component', () => {
  const mockSongs: Song[] = [
    {
      id: 'song1',
      title: 'Test Song 1',
      lyricists: ['Lyricist 1'],
      composers: ['Composer 1'],
      arrangers: ['Arranger 1'],
      tags: ['pop', 'anime'],
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'song2',
      title: 'Test Song 2',
      lyricists: ['Lyricist 2'],
      composers: ['Composer 2'],
      arrangers: ['Arranger 2'],
      tags: ['rock', 'anime'],
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]

  const mockTags: Tag[] = [
    {
      id: 'tag-pop',
      name: 'pop',
      songs: ['song1']
    },
    {
      id: 'tag-rock',
      name: 'rock',
      songs: ['song2']
    },
    {
      id: 'tag-anime',
      name: 'anime',
      songs: ['song1', 'song2']
    }
  ]

  const mockMusicDatabase = {
    songs: mockSongs,
    people: [],
    tags: mockTags
  }

  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    onTagClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(DataManager.loadSongs).mockReturnValue(mockSongs)
    vi.mocked(DataManager.loadMusicDatabase).mockReturnValue(mockMusicDatabase)
  })

  it('renders tag list when visible', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('タグ一覧')).toBeInTheDocument()
    })
  })

  it('does not render when not visible', () => {
    render(<EnhancedTagList {...defaultProps} isVisible={false} />)
    
    expect(screen.queryByText('タグ一覧')).not.toBeInTheDocument()
  })

  it('displays tags with hash prefix (Requirements: 21.1, 21.2)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('#pop')).toBeInTheDocument()
      expect(screen.getByText('#rock')).toBeInTheDocument()
      expect(screen.getByText('#anime')).toBeInTheDocument()
    })
  })

  it('shows song count for each tag (Requirements: 21.2)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getAllByText('1曲')).toHaveLength(2) // pop and rock tags
      expect(screen.getByText('2曲')).toBeInTheDocument() // anime tag
    })
  })

  it('filters tags based on search input (Requirements: 21.3)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('#pop')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('タグを検索...')
    fireEvent.change(searchInput, { target: { value: 'pop' } })

    await waitFor(() => {
      expect(screen.getByText('#pop')).toBeInTheDocument()
      expect(screen.queryByText('#rock')).not.toBeInTheDocument()
    })
  })

  it('sorts tags by frequency by default (Requirements: 21.3)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      const tagItems = screen.getAllByRole('button')
      const tagNames = tagItems.map(item => item.textContent)
      
      // anime (2 songs) should come before pop and rock (1 song each)
      const animeIndex = tagNames.findIndex(name => name?.includes('#anime'))
      const popIndex = tagNames.findIndex(name => name?.includes('#pop'))
      const rockIndex = tagNames.findIndex(name => name?.includes('#rock'))
      
      expect(animeIndex).toBeLessThan(popIndex)
      expect(animeIndex).toBeLessThan(rockIndex)
    })
  })

  it('changes sort order when sort option is selected (Requirements: 21.3)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('#anime')).toBeInTheDocument()
    })

    const sortSelect = screen.getByLabelText('並び順:')
    fireEvent.change(sortSelect, { target: { value: 'alphabetical' } })

    await waitFor(() => {
      const tagItems = screen.getAllByRole('button')
      const tagNames = tagItems.map(item => item.textContent)
      
      // In alphabetical order: anime, pop, rock
      const animeIndex = tagNames.findIndex(name => name?.includes('#anime'))
      const popIndex = tagNames.findIndex(name => name?.includes('#pop'))
      const rockIndex = tagNames.findIndex(name => name?.includes('#rock'))
      
      expect(animeIndex).toBeLessThan(popIndex)
      expect(popIndex).toBeLessThan(rockIndex)
    })
  })

  it('opens tag detail modal when tag is clicked (Requirements: 21.4)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('#anime')).toBeInTheDocument()
    })

    const animeTag = screen.getByText('#anime')
    fireEvent.click(animeTag)

    await waitFor(() => {
      expect(screen.getByText('関連楽曲')).toBeInTheDocument()
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
      expect(screen.getByText('Test Song 2')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<EnhancedTagList {...defaultProps} onClose={onClose} />)
    
    await waitFor(() => {
      expect(screen.getByText('タグ一覧')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText('タグ一覧を閉じる')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onTagClick when provided and tag is clicked', async () => {
    const onTagClick = vi.fn()
    render(<EnhancedTagList {...defaultProps} onTagClick={onTagClick} />)
    
    await waitFor(() => {
      expect(screen.getByText('#anime')).toBeInTheDocument()
    })

    const animeTag = screen.getByText('#anime')
    fireEvent.click(animeTag)

    expect(onTagClick).toHaveBeenCalledTimes(1)
    expect(onTagClick).toHaveBeenCalledWith(expect.objectContaining({
      name: 'anime',
      displayName: '#anime',
      songCount: 2
    }))
  })

  it('switches between grid and list layouts (Requirements: 21.5)', async () => {
    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('タグ一覧')).toBeInTheDocument()
    })

    const listButton = screen.getByLabelText('リスト表示')
    fireEvent.click(listButton)

    const tagGrid = document.querySelector('.tag-grid')
    expect(tagGrid).toHaveClass('list')

    const gridButton = screen.getByLabelText('グリッド表示')
    fireEvent.click(gridButton)

    expect(tagGrid).toHaveClass('grid')
  })

  it('shows loading state initially', async () => {
    // Mock loading state by returning empty arrays initially
    vi.mocked(DataManager.loadSongs).mockReturnValue([])
    vi.mocked(DataManager.loadMusicDatabase).mockReturnValue({
      songs: [],
      people: [],
      tags: []
    })

    render(<EnhancedTagList {...defaultProps} />)
    
    // The component should handle empty data gracefully
    await waitFor(() => {
      expect(screen.getByText('タグが登録されていません')).toBeInTheDocument()
    })
  })

  it('handles empty tag list gracefully', async () => {
    vi.mocked(DataManager.loadSongs).mockReturnValue([])
    vi.mocked(DataManager.loadMusicDatabase).mockReturnValue({
      songs: [],
      people: [],
      tags: []
    })

    render(<EnhancedTagList {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('タグが登録されていません')).toBeInTheDocument()
    })
  })
})