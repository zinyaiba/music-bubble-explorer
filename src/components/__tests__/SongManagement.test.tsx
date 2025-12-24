import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '../ThemeProvider'
import { ChristmasThemeProvider } from '../../contexts/ChristmasThemeContext'
import { SongManagement } from '../SongManagement'
import { DataManager } from '../../services/dataManager'
import { Song } from '../../types/music'

// Mock DataManager
vi.mock('../../services/dataManager')
const mockDataManager = DataManager as any

// Mock MusicDataService
vi.mock('../../services/musicDataService', () => ({
  MusicDataService: {
    getInstance: vi.fn(() => ({
      clearCache: vi.fn(),
    })),
  },
}))

// Sample test data
const sampleSongs: Song[] = [
  {
    id: 'song-1',
    title: 'Test Song 1',
    lyricists: ['Test Lyricist 1'],
    composers: ['Test Composer 1'],
    arrangers: ['Test Arranger 1'],
    tags: ['test', 'song'],
  },
  {
    id: 'song-2',
    title: 'Test Song 2',
    lyricists: ['Test Lyricist 2'],
    composers: ['Test Composer 2'],
    arrangers: ['Test Arranger 2'],
    tags: ['test', 'music'],
  },
]

const renderSongManagement = (props = {}) => {
  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    onSongUpdated: vi.fn(),
    onSongDeleted: vi.fn(),
    ...props,
  }

  return render(
    <ThemeProvider>
      <ChristmasThemeProvider>
        <SongManagement {...defaultProps} />
      </ChristmasThemeProvider>
    </ThemeProvider>
  )
}

describe('SongManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDataManager.loadSongs = vi.fn().mockReturnValue(sampleSongs)
    mockDataManager.updateSong = vi.fn().mockReturnValue(true)
    mockDataManager.deleteSong = vi.fn().mockReturnValue(true)
  })

  it('renders song management modal when visible', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('🎵 楽曲管理')).toBeInTheDocument()
    })

    expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    expect(screen.getByText('Test Song 2')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    renderSongManagement({ isVisible: false })

    expect(screen.queryByText('🎵 楽曲管理')).not.toBeInTheDocument()
  })

  it('displays song list with correct information', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Check if song details are displayed
    expect(screen.getByText('Test Lyricist 1')).toBeInTheDocument()
    expect(screen.getByText('Test Composer 1')).toBeInTheDocument()
    expect(screen.getByText('Test Arranger 1')).toBeInTheDocument()
    expect(screen.getByText('test, song')).toBeInTheDocument()
  })

  it('filters songs based on search query', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      '楽曲名、作詞家、作曲家、編曲家、タグで検索...'
    )
    fireEvent.change(searchInput, { target: { value: 'Song 1' } })

    expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    expect(screen.queryByText('Test Song 2')).not.toBeInTheDocument()
  })

  it('opens edit form when edit button is clicked', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByLabelText(/を編集/)
    fireEvent.click(editButtons[0])

    // Check if edit form is opened (SongRegistrationForm should be rendered)
    await waitFor(() => {
      expect(screen.getByText('🎵 楽曲編集')).toBeInTheDocument()
    })
  })

  it('opens delete confirmation when delete button is clicked', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByLabelText(/を削除/)
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('楽曲の削除確認')).toBeInTheDocument()
      expect(screen.getByText('「Test Song 1」')).toBeInTheDocument()
    })
  })

  it('calls onSongDeleted when delete is confirmed', async () => {
    const onSongDeleted = vi.fn()
    renderSongManagement({ onSongDeleted })

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Click delete button
    const deleteButtons = screen.getAllByLabelText(/を削除/)
    fireEvent.click(deleteButtons[0])

    // Confirm deletion
    await waitFor(() => {
      expect(screen.getByText('削除する')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('削除する'))

    await waitFor(() => {
      expect(mockDataManager.deleteSong).toHaveBeenCalledWith('song-1')
      expect(onSongDeleted).toHaveBeenCalledWith('song-1')
    })
  })

  it('closes modal when close button is clicked', async () => {
    const onClose = vi.fn()
    renderSongManagement({ onClose })

    await waitFor(() => {
      expect(screen.getByText('🎵 楽曲管理')).toBeInTheDocument()
    })

    const closeButton = screen.getByLabelText('楽曲管理を閉じる')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('displays empty state when no songs are found', async () => {
    mockDataManager.loadSongs = vi.fn().mockReturnValue([])
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('登録された楽曲がありません')).toBeInTheDocument()
    })
  })

  it('displays search empty state when no songs match search', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(
      '楽曲名、作詞家、作曲家、編曲家、タグで検索...'
    )
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(
      screen.getByText('検索条件に一致する楽曲が見つかりません')
    ).toBeInTheDocument()
  })

  it('displays correct statistics', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('総楽曲数:')).toBeInTheDocument()
      expect(screen.getByText('検索結果:')).toBeInTheDocument()
      const songCounts = screen.getAllByText('2曲')
      expect(songCounts).toHaveLength(2) // Total songs and search results
    })
  })
})
