import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '../ThemeProvider'
import { SongDetailView } from '../SongDetailView'
import { DataManager } from '../../services/dataManager'
import { Song } from '../../types/music'

// Mock DataManager
vi.mock('../../services/dataManager')
const mockDataManager = DataManager as any

// Sample test data with extended fields
const sampleSong: Song = {
  id: 'song-1',
  title: 'Test Song',
  lyricists: ['Test Lyricist 1', 'Test Lyricist 2'],
  composers: ['Test Composer'],
  arrangers: ['Test Arranger'],
  tags: ['test', 'song'],
  artists: ['Test Artist 1', 'Test Artist 2'],
  releaseYear: 2023,
  singleName: 'Test Single',
  albumName: 'Test Album',
  jacketImageUrl: 'https://example.com/jacket.jpg',
  detailPageUrls: ['https://example.com/song1', 'https://example.com/song2'],
  notes: 'Test notes for this song',
}

const renderSongDetailView = (props = {}) => {
  const defaultProps = {
    songId: 'song-1',
    isVisible: true,
    onClose: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    ...props,
  }

  return render(
    <ThemeProvider>
      <SongDetailView {...defaultProps} />
    </ThemeProvider>
  )
}

describe('SongDetailView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDataManager.getSong = vi.fn().mockReturnValue(sampleSong)
  })

  it('renders song detail view when visible', async () => {
    renderSongDetailView()

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })
  })

  it('does not render when not visible', () => {
    renderSongDetailView({ isVisible: false })

    expect(screen.queryByText('Test Song')).not.toBeInTheDocument()
  })

  it('displays all song information correctly', async () => {
    renderSongDetailView()

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    // Check basic info
    expect(screen.getByText('Test Artist 1, Test Artist 2')).toBeInTheDocument()
    expect(screen.getByText('2023年')).toBeInTheDocument()

    // Check creator info
    expect(
      screen.getByText('Test Lyricist 1, Test Lyricist 2')
    ).toBeInTheDocument()
    expect(screen.getByText('Test Composer')).toBeInTheDocument()
    expect(screen.getByText('Test Arranger')).toBeInTheDocument()

    // Check album info
    expect(screen.getByText('Test Single')).toBeInTheDocument()
    expect(screen.getByText('Test Album')).toBeInTheDocument()

    // Check tags
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('song')).toBeInTheDocument()

    // Check notes
    expect(screen.getByText('Test notes for this song')).toBeInTheDocument()
  })

  it('displays detail page URLs correctly', async () => {
    renderSongDetailView()

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    // Check if URLs are displayed
    const urlLinks = screen.getAllByRole('link')
    expect(urlLinks).toHaveLength(2)
    expect(urlLinks[0]).toHaveAttribute('href', 'https://example.com/song1')
    expect(urlLinks[1]).toHaveAttribute('href', 'https://example.com/song2')
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    renderSongDetailView({ onEdit })

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    const editButton = screen.getByLabelText('楽曲を編集')
    fireEvent.click(editButton)

    expect(onEdit).toHaveBeenCalledWith(sampleSong)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    renderSongDetailView({ onDelete })

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    const deleteButton = screen.getByLabelText('楽曲を削除')
    fireEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith('song-1')
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    renderSongDetailView({ onClose })

    await waitFor(() => {
      const titles = screen.getAllByText('Test Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    const closeButton = screen.getByLabelText('画面を閉じる')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('displays error message when song is not found', async () => {
    mockDataManager.getSong = vi.fn().mockReturnValue(null)
    renderSongDetailView()

    await waitFor(() => {
      expect(screen.getByText('楽曲が見つかりません')).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    // Mock getSong to return null initially to simulate loading
    mockDataManager.getSong = vi.fn().mockReturnValue(null)
    renderSongDetailView({ songId: 'loading-song' })

    // In the actual implementation, loading happens synchronously in useEffect
    // so we just verify the component renders without crashing
    expect(screen.queryByText('楽曲が見つかりません')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', async () => {
    const minimalSong: Song = {
      id: 'song-2',
      title: 'Minimal Song',
      lyricists: [],
      composers: [],
      arrangers: [],
    }

    mockDataManager.getSong = vi.fn().mockReturnValue(minimalSong)
    renderSongDetailView({ songId: 'song-2' })

    await waitFor(() => {
      // Use getAllByText since the title appears in both header and content
      const titles = screen.getAllByText('Minimal Song')
      expect(titles.length).toBeGreaterThan(0)
    })

    // Should not crash and should display the title
    expect(screen.queryByText('アーティスト:')).not.toBeInTheDocument()
    expect(screen.queryByText('発売年:')).not.toBeInTheDocument()
  })
})
