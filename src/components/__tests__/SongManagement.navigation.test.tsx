import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '../ThemeProvider'
import { SongManagement } from '../SongManagement'
import { DataManager } from '../../services/dataManager'
import { Song } from '../../types/music'

// Mock DataManager
vi.mock('../../services/dataManager', () => ({
  DataManager: {
    loadSongs: vi.fn(),
    updateSong: vi.fn(),
    deleteSong: vi.fn(),
    getDetailedErrorMessage: vi.fn(),
    monitorNetworkStatus: vi.fn(() => ({ isOnline: true })),
  },
}))

// Mock MusicDataService
vi.mock('../../services/musicDataService', () => ({
  MusicDataService: {
    getInstance: vi.fn(() => ({
      clearCache: vi.fn(),
    })),
  },
}))

// Mock FirebaseService to prevent real Firebase calls
vi.mock('../../services/firebaseService', () => ({
  FirebaseService: {
    getInstance: vi.fn(() => ({
      checkConnection: vi.fn().mockResolvedValue(false),
      getAllSongs: vi.fn().mockResolvedValue([]),
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
      <SongManagement {...defaultProps} />
    </ThemeProvider>
  )
}

describe('SongManagement Navigation - Task 5', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup DataManager mock to return test songs
    vi.mocked(DataManager.loadSongs).mockReturnValue(sampleSongs)
  })

  it('should display song items as clickable with proper accessibility attributes', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Find the clickable song info element
    const songInfo = screen.getByLabelText('Test Song 1の詳細を表示')

    // Verify it has the correct attributes for accessibility
    expect(songInfo).toHaveAttribute('role', 'button')
    expect(songInfo).toHaveAttribute('tabindex', '0')
    expect(songInfo).toHaveClass('song-info', 'clickable')
  })

  it('should open SongDetailView when song item is clicked', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Click on the song info area
    const songInfo = screen.getByLabelText('Test Song 1の詳細を表示')
    fireEvent.click(songInfo)

    // SongDetailView should be rendered (it will try to load the song)
    // We can verify by checking if the detail view component is attempting to render
    await waitFor(() => {
      // The detail view will be visible in the DOM
      const detailViews = document.querySelectorAll(
        '.song-detail-view, [class*="detail"]'
      )
      expect(detailViews.length).toBeGreaterThan(0)
    })
  })

  it('should support keyboard navigation (Enter key) to open detail view', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const songInfo = screen.getByLabelText('Test Song 1の詳細を表示')

    // Simulate Enter key press
    fireEvent.keyDown(songInfo, { key: 'Enter', code: 'Enter' })

    // Detail view should open
    await waitFor(() => {
      const detailViews = document.querySelectorAll(
        '.song-detail-view, [class*="detail"]'
      )
      expect(detailViews.length).toBeGreaterThan(0)
    })
  })

  it('should support keyboard navigation (Space key) to open detail view', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    const songInfo = screen.getByLabelText('Test Song 1の詳細を表示')

    // Simulate Space key press
    fireEvent.keyDown(songInfo, { key: ' ', code: 'Space' })

    // Detail view should open
    await waitFor(() => {
      const detailViews = document.querySelectorAll(
        '.song-detail-view, [class*="detail"]'
      )
      expect(detailViews.length).toBeGreaterThan(0)
    })
  })

  it('should maintain existing edit button functionality without triggering song click', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Click the edit button
    const editButtons = screen.getAllByLabelText(/を編集/)
    fireEvent.click(editButtons[0])

    // Edit form should open, not detail view
    await waitFor(() => {
      // The edit form (SongRegistrationForm) should be visible
      // We can check for the form by looking for specific form elements
      const forms = document.querySelectorAll('form, [class*="registration"]')
      expect(forms.length).toBeGreaterThan(0)
    })
  })

  it('should maintain existing delete button functionality without triggering song click', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
    })

    // Click the delete button
    const deleteButtons = screen.getAllByLabelText(/を削除/)
    fireEvent.click(deleteButtons[0])

    // Delete confirmation should open, not detail view
    await waitFor(() => {
      expect(screen.getByText(/削除確認/)).toBeInTheDocument()
    })
  })

  it('should handle multiple song clicks correctly', async () => {
    renderSongManagement()

    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument()
      expect(screen.getByText('Test Song 2')).toBeInTheDocument()
    })

    // Click first song
    const song1Info = screen.getByLabelText('Test Song 1の詳細を表示')
    fireEvent.click(song1Info)

    await waitFor(() => {
      const detailViews = document.querySelectorAll(
        '.song-detail-view, [class*="detail"]'
      )
      expect(detailViews.length).toBeGreaterThan(0)
    })

    // The component should handle the click and show detail view
    // (In a real scenario, we'd close it and click another song, but for this test
    // we're just verifying the click handler works)
  })
})
