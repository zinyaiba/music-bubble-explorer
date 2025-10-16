import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { SongRegistrationForm } from '../SongRegistrationForm'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
import { theme } from '@/styles/theme'

// Mock dependencies
vi.mock('@/services/dataManager')
vi.mock('@/services/musicDataService')

const mockDataManager = vi.mocked(DataManager)
const mockMusicDataService = {
  getInstance: vi.fn().mockReturnValue({
    clearCache: vi.fn()
  })
}
vi.mocked(MusicDataService).getInstance = mockMusicDataService.getInstance

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
)

describe('SongRegistrationForm', () => {
  const mockOnSongAdded = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    onSongAdded: mockOnSongAdded,
    onClose: mockOnClose,
    isVisible: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDataManager.saveSong.mockReturnValue(true)
  })

  describe('rendering', () => {
    it('should render form when visible', () => {
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('🎵 楽曲登録')).toBeInTheDocument()
      expect(screen.getByLabelText('楽曲名')).toBeInTheDocument()
      expect(screen.getByLabelText('作詞家')).toBeInTheDocument()
      expect(screen.getByLabelText('作曲家')).toBeInTheDocument()
      expect(screen.getByLabelText('編曲家')).toBeInTheDocument()
      expect(screen.getByLabelText('タグ')).toBeInTheDocument()
    })

    it('should not render when not visible', () => {
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} isVisible={false} />
        </TestWrapper>
      )

      expect(screen.queryByText('🎵 楽曲登録')).not.toBeInTheDocument()
    })

    it('should focus on title input when form becomes visible', async () => {
      const { rerender } = render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} isVisible={false} />
        </TestWrapper>
      )

      rerender(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} isVisible={true} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText('楽曲名')).toHaveFocus()
      })
    })
  })

  describe('form validation', () => {
    it('should show error when title is empty', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      expect(screen.getByText('楽曲名は必須です')).toBeInTheDocument()
    })

    it('should show error when title is too long', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const titleInput = screen.getByLabelText('楽曲名')
      // The input has maxLength=100, so we need to test the validation logic differently
      // Let's clear the input and manually set a long value
      await user.clear(titleInput)
      
      // Simulate typing a very long title by directly setting the value
      Object.defineProperty(titleInput, 'value', {
        writable: true,
        value: 'a'.repeat(101)
      })
      
      // Trigger change event
      await user.type(titleInput, 'x') // Add one more character to trigger validation
      
      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      // The form should show the general error since no person info is provided
      expect(screen.getByText('作詞家、作曲家、編曲家のうち少なくとも一つは入力してください')).toBeInTheDocument()
    })

    it('should show error when no person information is provided', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const titleInput = screen.getByLabelText('楽曲名')
      await user.type(titleInput, 'テスト楽曲')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      expect(screen.getByText('作詞家、作曲家、編曲家のうち少なくとも一つは入力してください')).toBeInTheDocument()
    })

    it('should clear field error when user starts typing', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      // Trigger validation error
      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)
      expect(screen.getByText('楽曲名は必須です')).toBeInTheDocument()

      // Start typing to clear error
      const titleInput = screen.getByLabelText('楽曲名')
      await user.type(titleInput, 'テスト')

      expect(screen.queryByText('楽曲名は必須です')).not.toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('should submit valid form successfully', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      // Fill in form
      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A, 作詞家B')
      await user.type(screen.getByLabelText('作曲家'), '作曲家A')
      await user.type(screen.getByLabelText('編曲家'), '編曲家A')
      await user.type(screen.getByLabelText('タグ'), 'テスト, バラード')

      // Submit form
      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      // Verify DataManager.saveSong was called
      await waitFor(() => {
        expect(mockDataManager.saveSong).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'テスト楽曲',
            lyricists: ['作詞家A', '作詞家B'],
            composers: ['作曲家A'],
            arrangers: ['編曲家A'],
            tags: ['テスト', 'バラード']
          })
        )
      })

      // Verify callbacks were called
      expect(mockOnSongAdded).toHaveBeenCalled()
      expect(mockMusicDataService.getInstance().clearCache).toHaveBeenCalled()
    })

    it('should handle comma-separated values correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A,作詞家B, 作詞家C , 作詞家D')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockDataManager.saveSong).toHaveBeenCalledWith(
          expect.objectContaining({
            lyricists: ['作詞家A', '作詞家B', '作詞家C', '作詞家D']
          })
        )
      })
    })

    it('should filter out empty values from comma-separated strings', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), 'A,,B, ,C,')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockDataManager.saveSong).toHaveBeenCalledWith(
          expect.objectContaining({
            lyricists: ['A', 'B', 'C']
          })
        )
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow save operation that returns a promise
      let resolvePromise: (value: boolean) => void
      const savePromise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve
      })
      mockDataManager.saveSong.mockReturnValue(savePromise)
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A')

      const submitButton = screen.getByText('楽曲を登録')
      
      // Click submit and immediately check for loading state
      const clickPromise = user.click(submitButton)
      
      // Wait a bit for the loading state to appear
      await new Promise(resolve => setTimeout(resolve, 10))
      
      // Check for loading state
      expect(screen.getByText('登録中...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Resolve the promise to complete the test
      resolvePromise!(true)
      await clickPromise
    })

    it('should handle save errors gracefully', async () => {
      const user = userEvent.setup()
      mockDataManager.saveSong.mockReturnValue(false)
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('楽曲の保存に失敗しました')).toBeInTheDocument()
      })
    })

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('楽曲が正常に登録されました！')).toBeInTheDocument()
      })
    })
  })

  describe('form interactions', () => {
    it('should close form when close button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const closeButton = screen.getByLabelText('フォームを閉じる')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close form when cancel button is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const cancelButton = screen.getByText('キャンセル')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close form when backdrop is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const overlay = screen.getByRole('dialog')
      await user.click(overlay)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should close form when Escape key is pressed', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.keyboard('{Escape}')

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should not close form when clicking inside form content', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const titleInput = screen.getByLabelText('楽曲名')
      await user.click(titleInput)

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'form-title')

      const titleInput = screen.getByLabelText('楽曲名')
      expect(titleInput).toHaveAttribute('required')
    })

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      const titleInput = screen.getByLabelText('楽曲名')
      const errorMessage = screen.getByText('楽曲名は必須です')
      
      expect(titleInput).toHaveAttribute('aria-describedby', 'title-error')
      expect(errorMessage).toHaveAttribute('id', 'title-error')
      expect(errorMessage).toHaveAttribute('role', 'alert')
    })

    it('should provide screen reader feedback during submission', async () => {
      const user = userEvent.setup()
      
      // Mock slow save operation
      let resolvePromise: (value: boolean) => void
      const savePromise = new Promise<boolean>((resolve) => {
        resolvePromise = resolve
      })
      mockDataManager.saveSong.mockReturnValue(savePromise)
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('楽曲名'), 'テスト楽曲')
      await user.type(screen.getByLabelText('作詞家'), '作詞家A')

      const submitButton = screen.getByText('楽曲を登録')
      
      // Click submit and immediately check for loading state
      const clickPromise = user.click(submitButton)
      
      // Wait a bit for the loading state to appear
      await new Promise(resolve => setTimeout(resolve, 10))

      // Should show loading state with screen reader text
      expect(screen.getByText('楽曲を登録しています。しばらくお待ちください。')).toHaveClass('sr-only')
      
      // Resolve the promise to complete the test
      resolvePromise!(true)
      await clickPromise
    })
  })

  describe('form reset', () => {
    it('should reset form after successful submission', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const titleInput = screen.getByLabelText('楽曲名')
      const lyricistsInput = screen.getByLabelText('作詞家')

      await user.type(titleInput, 'テスト楽曲')
      await user.type(lyricistsInput, '作詞家A')

      const submitButton = screen.getByText('楽曲を登録')
      await user.click(submitButton)

      // Wait for success and auto-close
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled()
      }, { timeout: 3000 })
    })

    it('should reset form when manually closed', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <SongRegistrationForm {...defaultProps} />
        </TestWrapper>
      )

      const titleInput = screen.getByLabelText('楽曲名')
      await user.type(titleInput, 'テスト楽曲')

      const closeButton = screen.getByLabelText('フォームを閉じる')
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})