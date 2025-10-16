import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/styles/theme'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import SongRegistrationForm from '../SongRegistrationForm'
import { DataManager } from '@/services/dataManager'

// Mock DataManager
vi.mock('@/services/dataManager', () => ({
  DataManager: {
    saveSong: vi.fn(() => true),
    updateSong: vi.fn(() => true),
    getAllTags: vi.fn(() => ['バラード', 'アニメ', 'ロック', 'ポップス'])
  }
}))

// Mock MusicDataService
vi.mock('@/services/musicDataService', () => ({
  MusicDataService: {
    getInstance: vi.fn(() => ({
      clearCache: vi.fn()
    }))
  }
}))

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('SongRegistrationForm TagInput Integration', () => {
  const mockOnSongAdded = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders TagInput component in the form', async () => {
    renderWithTheme(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Wait for the form to load and existing tags to be fetched
    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument()
    })

    // Check that the TagInput placeholder is present
    expect(screen.getByPlaceholderText(/タグを入力してください/)).toBeInTheDocument()
  })

  it('allows adding tags using TagInput', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument()
    })

    // Fill in required fields
    await user.type(screen.getByLabelText(/楽曲名/), 'テスト楽曲')
    await user.type(screen.getByLabelText(/作詞家/), 'テスト作詞家')

    // Add tags using TagInput
    const tagInput = screen.getByPlaceholderText(/タグを入力してください/)
    await user.type(tagInput, 'バラード')
    await user.keyboard('{Enter}')

    // Check that the tag was added
    expect(screen.getByText('バラード')).toBeInTheDocument()

    // Add another tag
    await user.type(tagInput, '感動')
    await user.keyboard('{Enter}')

    // Check that both tags are present
    expect(screen.getByText('バラード')).toBeInTheDocument()
    expect(screen.getByText('感動')).toBeInTheDocument()
  })

  it('shows existing tag suggestions', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument()
    })

    // Type partial tag name to trigger suggestions
    const tagInput = screen.getByPlaceholderText(/タグを入力してください/)
    await user.type(tagInput, 'バ')

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('バラード')).toBeInTheDocument()
    })

    // Check that the suggestion has the "既存" badge
    expect(screen.getByText('既存')).toBeInTheDocument()
  })

  it('submits form with tags correctly', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument()
    })

    // Fill in form fields
    await user.type(screen.getByLabelText(/楽曲名/), 'テスト楽曲')
    await user.type(screen.getByLabelText(/作詞家/), 'テスト作詞家')

    // Add tags
    const tagInput = screen.getByPlaceholderText(/タグを入力してください/)
    await user.type(tagInput, 'バラード')
    await user.keyboard('{Enter}')
    await user.type(tagInput, 'アニメ')
    await user.keyboard('{Enter}')

    // Submit form
    await user.click(screen.getByRole('button', { name: /楽曲を登録/ }))

    // Wait for form submission
    await waitFor(() => {
      expect(DataManager.saveSong).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'テスト楽曲',
          lyricists: ['テスト作詞家'],
          tags: ['バラード', 'アニメ']
        })
      )
    })
  })

  it('allows removing tags', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <SongRegistrationForm
        onSongAdded={mockOnSongAdded}
        onClose={mockOnClose}
        isVisible={true}
      />
    )

    // Wait for form to load
    await waitFor(() => {
      expect(screen.getByText('タグ')).toBeInTheDocument()
    })

    // Add a tag by typing and pressing Enter
    const tagInput = screen.getByPlaceholderText(/タグを入力してください/)
    await user.clear(tagInput)
    await user.type(tagInput, 'バラード')
    await user.keyboard('{Enter}')

    // Wait for tag to be added and verify it appears as a chip
    await waitFor(() => {
      const tagChips = screen.getAllByText('バラード')
      expect(tagChips.length).toBeGreaterThan(0)
    })

    // Find the remove button by looking for buttons with × text
    const removeButtons = screen.getAllByText('×')
    const tagRemoveButton = removeButtons.find(button => 
      button.getAttribute('aria-label')?.includes('バラード')
    )
    
    expect(tagRemoveButton).toBeDefined()
    await user.click(tagRemoveButton!)

    // Verify tag was removed - wait for it to disappear
    await waitFor(() => {
      const remainingTagChips = screen.queryAllByText('バラード')
      // Should only have the suggestion text, not the chip
      expect(remainingTagChips.length).toBeLessThanOrEqual(1)
    })
  })
})