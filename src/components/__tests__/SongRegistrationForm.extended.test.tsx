/**
 * Extended fields test for SongRegistrationForm
 * Tests the new fields added in task 6
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SongRegistrationForm } from '../SongRegistrationForm'
import { DataManager } from '@/services/dataManager'

// Mock DataManager
vi.mock('@/services/dataManager', () => ({
  DataManager: {
    saveSong: vi.fn(),
    updateSong: vi.fn(),
    getAllTags: vi.fn(() => []),
  },
}))

// Mock MusicDataService
vi.mock('@/services/musicDataService', () => ({
  MusicDataService: {
    getInstance: vi.fn(() => ({
      clearCache: vi.fn(),
    })),
  },
}))

// Mock AnalyticsService
vi.mock('@/services/analyticsService', () => ({
  AnalyticsService: {
    getInstance: vi.fn(() => ({
      logSongRegistration: vi.fn(),
    })),
  },
}))

describe('SongRegistrationForm - Extended Fields', () => {
  const mockOnSongAdded = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all extended fields', () => {
    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Check for extended fields
    expect(screen.getByLabelText('アーティスト')).toBeInTheDocument()
    expect(screen.getByLabelText('発売年')).toBeInTheDocument()
    expect(screen.getByLabelText('収録シングル')).toBeInTheDocument()
    expect(screen.getByLabelText('収録アルバム')).toBeInTheDocument()
    expect(screen.getByLabelText('ジャケット画像URL')).toBeInTheDocument()
    // DetailUrlList is a composite component, check for its label text instead
    expect(screen.getByText('楽曲詳細ページURL')).toBeInTheDocument()
  })

  it('should accept input in extended fields', async () => {
    const user = userEvent.setup()

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    const artistsInput = screen.getByLabelText('アーティスト')
    const releaseYearInput = screen.getByLabelText('発売年')
    const singleNameInput = screen.getByLabelText('収録シングル')
    const albumNameInput = screen.getByLabelText('収録アルバム')
    const jacketUrlInput = screen.getByLabelText('ジャケット画像URL')

    await user.type(artistsInput, 'アーティストA, アーティストB')
    await user.type(releaseYearInput, '2024')
    await user.type(singleNameInput, 'テストシングル')
    await user.type(albumNameInput, 'テストアルバム')
    await user.type(jacketUrlInput, 'https://example.com/jacket.jpg')

    expect(artistsInput).toHaveValue('アーティストA, アーティストB')
    expect(releaseYearInput).toHaveValue(2024)
    expect(singleNameInput).toHaveValue('テストシングル')
    expect(albumNameInput).toHaveValue('テストアルバム')
    expect(jacketUrlInput).toHaveValue('https://example.com/jacket.jpg')
  })

  it('should validate release year correctly', async () => {
    const user = userEvent.setup()

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    const titleInput = screen.getByLabelText('楽曲名')
    const lyricistsInput = screen.getByLabelText('作詞家')
    const releaseYearInput = screen.getByLabelText('発売年')
    const submitButton = screen.getByRole('button', { name: /楽曲を登録/ })

    // Fill required fields
    await user.type(titleInput, 'テスト楽曲')
    await user.type(lyricistsInput, '作詞家A')

    // Enter invalid year
    await user.type(releaseYearInput, '999')
    await user.click(submitButton)

    // Should show error
    await waitFor(() => {
      expect(
        screen.getByText(/1000から9999の範囲で入力してください/)
      ).toBeInTheDocument()
    })
  })

  it('should validate URL format correctly', async () => {
    const user = userEvent.setup()

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    const titleInput = screen.getByLabelText('楽曲名')
    const lyricistsInput = screen.getByLabelText('作詞家')
    const jacketUrlInput = screen.getByLabelText('ジャケット画像URL')
    const submitButton = screen.getByRole('button', { name: /楽曲を登録/ })

    // Fill required fields
    await user.type(titleInput, 'テスト楽曲')
    await user.type(lyricistsInput, '作詞家A')

    // Enter invalid URL
    await user.type(jacketUrlInput, 'not-a-valid-url')
    await user.click(submitButton)

    // Should show error
    await waitFor(() => {
      expect(
        screen.getByText(/有効なURL形式で入力してください/)
      ).toBeInTheDocument()
    })
  })

  it('should show jacket image preview when valid URL is entered', async () => {
    const user = userEvent.setup()

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    const jacketUrlInput = screen.getByLabelText('ジャケット画像URL')

    // Enter valid URL
    await user.type(jacketUrlInput, 'https://example.com/jacket.jpg')

    // Should show preview label
    await waitFor(() => {
      expect(screen.getByText('プレビュー')).toBeInTheDocument()
    })
  })

  it('should save extended fields when submitting', async () => {
    const user = userEvent.setup()
    const mockSaveSong = vi.mocked(DataManager.saveSong)
    mockSaveSong.mockResolvedValue('test-id-123')

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Fill all fields
    await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
    await user.type(screen.getByLabelText('作詞家'), '作詞家A')
    await user.type(
      screen.getByLabelText('アーティスト'),
      'アーティストA, アーティストB'
    )
    await user.type(screen.getByLabelText('発売年'), '2024')
    await user.type(screen.getByLabelText('収録シングル'), 'テストシングル')
    await user.type(screen.getByLabelText('収録アルバム'), 'テストアルバム')
    await user.type(
      screen.getByLabelText('ジャケット画像URL'),
      'https://example.com/jacket.jpg'
    )

    const submitButton = screen.getByRole('button', { name: /楽曲を登録/ })
    await user.click(submitButton)

    // Wait for save to be called
    await waitFor(() => {
      expect(mockSaveSong).toHaveBeenCalled()
    })

    // Check that extended fields were included
    const savedSong = mockSaveSong.mock.calls[0][0]
    expect(savedSong.artists).toEqual(['アーティストA', 'アーティストB'])
    expect(savedSong.releaseYear).toBe(2024)
    expect(savedSong.singleName).toBe('テストシングル')
    expect(savedSong.albumName).toBe('テストアルバム')
    expect(savedSong.jacketImageUrl).toBe('https://example.com/jacket.jpg')
  })

  it('should populate extended fields in edit mode', () => {
    const editingSong = {
      id: 'test-id',
      title: 'テスト楽曲',
      lyricists: ['作詞家A'],
      composers: ['作曲家A'],
      arrangers: ['編曲家A'],
      artists: ['アーティストA', 'アーティストB'],
      releaseYear: 2024,
      singleName: 'テストシングル',
      albumName: 'テストアルバム',
      jacketImageUrl: 'https://example.com/jacket.jpg',
      detailPageUrls: [
        'https://example.com/detail1',
        'https://example.com/detail2',
      ],
    }

    render(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
        editingSong={editingSong}
      />
    )

    // Check that extended fields are populated
    expect(screen.getByLabelText('アーティスト')).toHaveValue(
      'アーティストA, アーティストB'
    )
    expect(screen.getByLabelText('発売年')).toHaveValue(2024)
    expect(screen.getByLabelText('収録シングル')).toHaveValue('テストシングル')
    expect(screen.getByLabelText('収録アルバム')).toHaveValue('テストアルバム')
    expect(screen.getByLabelText('ジャケット画像URL')).toHaveValue(
      'https://example.com/jacket.jpg'
    )
  })
})
