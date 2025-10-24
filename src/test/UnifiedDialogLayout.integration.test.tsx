import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { UnifiedDialogLayout } from '@/components/UnifiedDialogLayout'

// Mock all CSS imports
vi.mock('@/components/UnifiedDialogLayout.css', () => ({}))
vi.mock('@/components/SongRegistrationForm.css', () => ({}))
vi.mock('@/components/SongManagement.css', () => ({}))
vi.mock('@/components/EnhancedTagList.css', () => ({}))

// Mock DataManager
vi.mock('@/services/dataManager', () => ({
  DataManager: {
    loadSongs: vi.fn(() => []),
    loadMusicDatabase: vi.fn(() => ({ songs: [], people: [], tags: [] })),
    saveSong: vi.fn(),
    deleteSong: vi.fn(),
  },
}))

// Mock MusicDataService
vi.mock('@/services/musicDataService', () => ({
  MusicDataService: {
    getInstance: vi.fn(() => ({
      getAllSongs: vi.fn(() => []),
      addSong: vi.fn(),
      updateSong: vi.fn(),
      deleteSong: vi.fn(),
    })),
  },
}))

describe('UnifiedDialogLayout Integration Tests - Requirements 3.3, 3.4, 3.5', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dialog Layout Consistency Across Components', () => {
    it('maintains consistent header layout across all dialog types', async () => {
      // Test different dialog configurations that would be used for different components
      const { rerender } = render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="楽曲登録"
          size="standard"
        >
          <div className="song-registration-content">
            <form>
              <input type="text" placeholder="楽曲タイトル" />
              <button type="submit">登録</button>
            </form>
          </div>
        </UnifiedDialogLayout>
      )

      let header = document.querySelector('.unified-dialog-header')
      let title = document.querySelector('.unified-dialog-title')
      let closeButton = document.querySelector('.unified-dialog-close')

      expect(header).toBeInTheDocument()
      expect(title).toHaveTextContent('楽曲登録')
      expect(closeButton).toBeInTheDocument()

      // Test SongManagement equivalent layout
      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="楽曲管理"
          size="large"
        >
          <div className="song-management-content">
            <div>楽曲管理コンテンツ</div>
            <button>編集</button>
            <button>削除</button>
          </div>
        </UnifiedDialogLayout>
      )

      header = document.querySelector('.unified-dialog-header')
      title = document.querySelector('.unified-dialog-title')
      closeButton = document.querySelector('.unified-dialog-close')

      expect(header).toBeInTheDocument()
      expect(title).toHaveTextContent('楽曲管理')
      expect(closeButton).toBeInTheDocument()

      // Test EnhancedTagList equivalent layout
      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="タグ一覧"
          size="compact"
        >
          <div className="enhanced-tag-list-content">
            <div>タグ一覧コンテンツ</div>
            <ul>
              <li>#pop</li>
              <li>#rock</li>
            </ul>
          </div>
        </UnifiedDialogLayout>
      )

      header = document.querySelector('.unified-dialog-header')
      title = document.querySelector('.unified-dialog-title')
      closeButton = document.querySelector('.unified-dialog-close')

      expect(header).toBeInTheDocument()
      expect(title).toHaveTextContent('タグ一覧')
      expect(closeButton).toBeInTheDocument()
    })

    it('maintains consistent content area structure across dialog types', () => {
      const { rerender } = render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Test Dialog 1"
        >
          <div className="test-content-1">Content 1</div>
        </UnifiedDialogLayout>
      )

      let contentArea = document.querySelector('.unified-dialog-content')
      expect(contentArea).toBeInTheDocument()
      expect(contentArea).toHaveClass('unified-dialog-content')

      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Test Dialog 2"
        >
          <div className="test-content-2">Content 2</div>
        </UnifiedDialogLayout>
      )

      contentArea = document.querySelector('.unified-dialog-content')
      expect(contentArea).toBeInTheDocument()
      expect(contentArea).toHaveClass('unified-dialog-content')
    })

    it('applies consistent size classes across different dialog contents', () => {
      const sizes: Array<'compact' | 'standard' | 'large'> = [
        'compact',
        'standard',
        'large',
      ]

      sizes.forEach(size => {
        const { unmount } = render(
          <UnifiedDialogLayout
            isVisible={true}
            onClose={vi.fn()}
            title={`${size} Dialog`}
            size={size}
          >
            <div>Test content for {size}</div>
          </UnifiedDialogLayout>
        )

        const dialog = document.querySelector('.unified-dialog')
        expect(dialog).toHaveClass(`unified-dialog--${size}`)

        unmount()
      })
    })
  })

  describe('Mobile Compact Display Testing - Requirements 3.4, 3.5', () => {
    // Mock mobile viewport
    const mockMobileViewport = () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })
    }

    // Mock desktop viewport
    const mockDesktopViewport = () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      })
    }

    it('applies mobile optimization classes for compact display', () => {
      mockMobileViewport()

      render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Mobile Dialog"
          size="compact"
          mobileOptimized={true}
        >
          <div>Mobile content</div>
        </UnifiedDialogLayout>
      )

      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })

    it('maintains proper spacing in compact mobile layout', () => {
      mockMobileViewport()

      render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Compact Mobile Dialog"
          size="compact"
          mobileOptimized={true}
        >
          <div>
            <p>Line 1</p>
            <p>Line 2</p>
            <p>Line 3</p>
          </div>
        </UnifiedDialogLayout>
      )

      const header = document.querySelector('.unified-dialog-header')
      const content = document.querySelector('.unified-dialog-content')

      expect(header).toBeInTheDocument()
      expect(content).toBeInTheDocument()

      // Verify the dialog structure is maintained
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toContainElement(header)
      expect(dialog).toContainElement(content)
    })

    it('handles different content types in mobile compact mode', () => {
      mockMobileViewport()

      const contentTypes = [
        {
          name: 'Form Content',
          content: (
            <form>
              <input type="text" />
              <button>Submit</button>
            </form>
          ),
        },
        {
          name: 'List Content',
          content: (
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          ),
        },
        {
          name: 'Text Content',
          content: (
            <div>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
            </div>
          ),
        },
      ]

      contentTypes.forEach(({ name, content }) => {
        const { unmount } = render(
          <UnifiedDialogLayout
            isVisible={true}
            onClose={vi.fn()}
            title={name}
            size="compact"
            mobileOptimized={true}
          >
            {content}
          </UnifiedDialogLayout>
        )

        const dialog = document.querySelector('.unified-dialog')
        const contentArea = document.querySelector('.unified-dialog-content')

        expect(dialog).toHaveClass('unified-dialog--compact')
        expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
        expect(contentArea).toBeInTheDocument()

        unmount()
      })
    })

    it('maintains accessibility in mobile compact mode', () => {
      mockMobileViewport()

      render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Accessible Mobile Dialog"
          size="compact"
          mobileOptimized={true}
        >
          <div>Accessible content</div>
        </UnifiedDialogLayout>
      )

      const dialog = screen.getByRole('dialog')
      const title = screen.getByRole('heading', { level: 2 })
      const closeButton = screen.getByLabelText('ダイアログを閉じる')

      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'unified-dialog-title')
      expect(title).toHaveAttribute('id', 'unified-dialog-title')
      expect(closeButton).toHaveAttribute('type', 'button')
    })

    it('responds to viewport changes between mobile and desktop', () => {
      // Start with mobile
      mockMobileViewport()

      const { rerender } = render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Responsive Dialog"
          mobileOptimized={true}
        >
          <div>Responsive content</div>
        </UnifiedDialogLayout>
      )

      let dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')

      // Switch to desktop
      mockDesktopViewport()

      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Responsive Dialog"
          mobileOptimized={false}
        >
          <div>Responsive content</div>
        </UnifiedDialogLayout>
      )

      dialog = document.querySelector('.unified-dialog')
      expect(dialog).not.toHaveClass('unified-dialog--mobile-optimized')
    })
  })

  describe('Footer Consistency Across Dialogs - Requirements 3.3', () => {
    it('maintains consistent footer layout when enabled', () => {
      const footerContent = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      )

      const { rerender } = render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Dialog with Footer"
          showFooter={true}
          footerContent={footerContent}
        >
          <div>Content with footer</div>
        </UnifiedDialogLayout>
      )

      let footer = document.querySelector('.unified-dialog-footer')
      expect(footer).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()

      // Test with different content
      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Another Dialog with Footer"
          showFooter={true}
          footerContent={<button>OK</button>}
        >
          <div>Different content with footer</div>
        </UnifiedDialogLayout>
      )

      footer = document.querySelector('.unified-dialog-footer')
      expect(footer).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('maintains consistent layout without footer', () => {
      render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={vi.fn()}
          title="Dialog without Footer"
        >
          <div>Content without footer</div>
        </UnifiedDialogLayout>
      )

      const footer = document.querySelector('.unified-dialog-footer')
      expect(footer).not.toBeInTheDocument()

      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')

      expect(dialog).toContainElement(content)
    })
  })

  describe('Cross-Dialog Event Handling Consistency', () => {
    it('handles close events consistently across different dialog contents', () => {
      const onClose = vi.fn()

      const { rerender } = render(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={onClose}
          title="Test Dialog 1"
        >
          <div>Content 1</div>
        </UnifiedDialogLayout>
      )

      // Test close button
      fireEvent.click(screen.getByLabelText('ダイアログを閉じる'))
      expect(onClose).toHaveBeenCalledTimes(1)

      onClose.mockClear()

      // Test with different content
      rerender(
        <UnifiedDialogLayout
          isVisible={true}
          onClose={onClose}
          title="Test Dialog 2"
        >
          <form>
            <input type="text" />
            <button type="submit">Submit</button>
          </form>
        </UnifiedDialogLayout>
      )

      // Test ESC key
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)

      onClose.mockClear()

      // Test backdrop click
      const overlay = document.querySelector('.unified-dialog-overlay')
      fireEvent.click(overlay!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
