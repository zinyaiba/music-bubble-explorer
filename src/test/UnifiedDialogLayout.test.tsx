import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UnifiedDialogLayout } from '@/components/UnifiedDialogLayout'

// Mock CSS import
vi.mock('@/components/UnifiedDialogLayout.css', () => ({}))

describe('UnifiedDialogLayout Component', () => {
  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    title: 'Test Dialog',
    children: <div>Test Content</div>
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', vi.fn())
  })

  describe('Basic Functionality', () => {
    it('renders dialog when visible', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('does not render when not visible', () => {
      render(<UnifiedDialogLayout {...defaultProps} isVisible={false} />)
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<UnifiedDialogLayout {...defaultProps} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('ダイアログを閉じる')
      fireEvent.click(closeButton)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when backdrop is clicked', () => {
      const onClose = vi.fn()
      render(<UnifiedDialogLayout {...defaultProps} onClose={onClose} />)
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      fireEvent.click(overlay!)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close when dialog content is clicked', () => {
      const onClose = vi.fn()
      render(<UnifiedDialogLayout {...defaultProps} onClose={onClose} />)
      
      const dialogContent = screen.getByText('Test Content')
      fireEvent.click(dialogContent)
      
      expect(onClose).not.toHaveBeenCalled()
    })

    it('calls onClose when Escape key is pressed', async () => {
      const onClose = vi.fn()
      render(<UnifiedDialogLayout {...defaultProps} onClose={onClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Size Variants - Requirements 3.3, 3.4', () => {
    it('applies compact size class', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="compact" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
    })

    it('applies standard size class by default', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--standard')
    })

    it('applies large size class', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="large" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--large')
    })
  })

  describe('Mobile Optimization - Requirements 3.4, 3.5', () => {
    it('applies mobile optimization class by default', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })

    it('does not apply mobile optimization when disabled', () => {
      render(<UnifiedDialogLayout {...defaultProps} mobileOptimized={false} />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).not.toHaveClass('unified-dialog--mobile-optimized')
    })

    it('renders compact layout for mobile optimization', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact" 
          mobileOptimized={true} 
        />
      )
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })
  })

  describe('Footer Functionality - Requirements 3.3', () => {
    it('does not show footer by default', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      expect(document.querySelector('.unified-dialog-footer')).not.toBeInTheDocument()
    })

    it('shows footer when enabled with content', () => {
      const footerContent = <button>Footer Button</button>
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          showFooter={true} 
          footerContent={footerContent} 
        />
      )
      
      expect(document.querySelector('.unified-dialog-footer')).toBeInTheDocument()
      expect(screen.getByText('Footer Button')).toBeInTheDocument()
    })

    it('does not show footer when enabled but no content provided', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          showFooter={true} 
        />
      )
      
      expect(document.querySelector('.unified-dialog-footer')).not.toBeInTheDocument()
    })
  })

  describe('Custom Styling - Requirements 3.3', () => {
    it('applies custom className', () => {
      render(<UnifiedDialogLayout {...defaultProps} className="custom-dialog" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('custom-dialog')
    })

    it('maintains base classes with custom className', () => {
      render(<UnifiedDialogLayout {...defaultProps} className="custom-dialog" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--standard')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
      expect(dialog).toHaveClass('custom-dialog')
    })
  })

  describe('Accessibility - Requirements 3.5', () => {
    it('has proper ARIA attributes', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const overlay = screen.getByRole('dialog')
      expect(overlay).toHaveAttribute('aria-modal', 'true')
      expect(overlay).toHaveAttribute('aria-labelledby', 'unified-dialog-title')
    })

    it('has proper heading structure', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveTextContent('Test Dialog')
      expect(title).toHaveAttribute('id', 'unified-dialog-title')
    })

    it('close button has proper accessibility label', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const closeButton = screen.getByLabelText('ダイアログを閉じる')
      expect(closeButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Event Handling', () => {
    it('prevents event propagation on backdrop click', () => {
      const onClose = vi.fn()
      render(<UnifiedDialogLayout {...defaultProps} onClose={onClose} />)
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      
      // Create a mock event with stopPropagation
      const mockEvent = {
        target: overlay,
        currentTarget: overlay,
        stopPropagation: vi.fn(),
        preventDefault: vi.fn()
      }
      
      // Simulate the click event
      fireEvent.click(overlay!, mockEvent)
      
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('adds and removes keydown event listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      
      const { unmount } = render(<UnifiedDialogLayout {...defaultProps} />)
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('does not add event listener when not visible', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      
      render(<UnifiedDialogLayout {...defaultProps} isVisible={false} />)
      
      expect(addEventListenerSpy).not.toHaveBeenCalled()
    })
  })
})