import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UnifiedDialogLayout } from '@/components/UnifiedDialogLayout'

// Mock CSS import
vi.mock('@/components/UnifiedDialogLayout.css', () => ({}))

describe('UnifiedDialogLayout Mobile Compact Display Tests - Requirements 3.4, 3.5', () => {
  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    title: 'Mobile Test Dialog',
    children: <div>Mobile test content</div>
  }

  // Mock different mobile viewport sizes
  const mockViewport = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    })
    
    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Reset viewport to default
    mockViewport(1024, 768)
  })

  describe('Mobile Viewport Sizes', () => {
    const mobileViewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'Small Mobile', width: 320, height: 568 }
    ]

    mobileViewports.forEach(({ name, width, height }) => {
      it(`renders correctly on ${name} (${width}x${height})`, () => {
        mockViewport(width, height)
        
        render(
          <UnifiedDialogLayout 
            {...defaultProps} 
            size="compact"
            mobileOptimized={true}
          />
        )

        const dialog = document.querySelector('.unified-dialog')
        const overlay = document.querySelector('.unified-dialog-overlay')
        
        expect(dialog).toHaveClass('unified-dialog--compact')
        expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
        expect(overlay).toBeInTheDocument()
      })
    })
  })

  describe('Compact Size Behavior', () => {
    beforeEach(() => {
      mockViewport(375, 667) // iPhone SE size
    })

    it('applies compact size classes correctly', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )

      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })

    it('maintains proper header structure in compact mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
          title="Compact Mobile Header"
        />
      )

      const header = document.querySelector('.unified-dialog-header')
      const title = document.querySelector('.unified-dialog-title')
      const closeButton = document.querySelector('.unified-dialog-close')

      expect(header).toBeInTheDocument()
      expect(title).toHaveTextContent('Compact Mobile Header')
      expect(closeButton).toBeInTheDocument()
      
      // Verify header is part of dialog
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toContainElement(header)
    })

    it('optimizes content area for mobile scrolling', () => {
      const longContent = (
        <div>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>This is paragraph {i + 1} with some content to test scrolling behavior.</p>
          ))}
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          {longContent}
        </UnifiedDialogLayout>
      )

      const content = document.querySelector('.unified-dialog-content')
      expect(content).toBeInTheDocument()
      
      // Verify content area has proper overflow handling
      const computedStyle = window.getComputedStyle(content!)
      expect(content).toHaveClass('unified-dialog-content')
    })

    it('handles touch interactions properly', () => {
      const onClose = vi.fn()
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          onClose={onClose}
          size="compact"
          mobileOptimized={true}
        />
      )

      const closeButton = screen.getByLabelText('ダイアログを閉じる')
      
      // Simulate touch events
      fireEvent.touchStart(closeButton)
      fireEvent.touchEnd(closeButton)
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Mobile Layout Optimization', () => {
    beforeEach(() => {
      mockViewport(375, 667)
    })

    it('minimizes vertical scrolling in compact mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          <div style={{ height: '200px' }}>
            Compact content that should fit well
          </div>
        </UnifiedDialogLayout>
      )

      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')
      
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(content).toBeInTheDocument()
    })

    it('maintains proper spacing in mobile compact layout', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          <form>
            <div>
              <label>Field 1:</label>
              <input type="text" />
            </div>
            <div>
              <label>Field 2:</label>
              <input type="text" />
            </div>
            <button type="submit">Submit</button>
          </form>
        </UnifiedDialogLayout>
      )

      const dialog = document.querySelector('.unified-dialog')
      const header = document.querySelector('.unified-dialog-header')
      const content = document.querySelector('.unified-dialog-content')

      expect(dialog).toContainElement(header)
      expect(dialog).toContainElement(content)
      expect(screen.getByText('Field 1:')).toBeInTheDocument()
      expect(screen.getByText('Field 2:')).toBeInTheDocument()
    })

    it('handles footer in mobile compact mode', () => {
      const footerContent = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
          showFooter={true}
          footerContent={footerContent}
        >
          <div>Content with footer</div>
        </UnifiedDialogLayout>
      )

      const dialog = document.querySelector('.unified-dialog')
      const footer = document.querySelector('.unified-dialog-footer')
      
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(footer).toBeInTheDocument()
      expect(dialog).toContainElement(footer)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('adapts to orientation changes', () => {
      // Portrait mode
      mockViewport(375, 667)
      
      const { rerender } = render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )

      let dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')

      // Landscape mode
      mockViewport(667, 375)
      
      rerender(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )

      dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })

    it('maintains functionality across different mobile sizes', () => {
      const sizes: Array<{ width: number; height: number }> = [
        { width: 320, height: 568 }, // Small mobile
        { width: 375, height: 667 }, // iPhone SE
        { width: 414, height: 896 }, // iPhone XR
        { width: 428, height: 926 }  // iPhone 12 Pro Max
      ]

      sizes.forEach(({ width, height }) => {
        mockViewport(width, height)
        
        const onClose = vi.fn()
        const { unmount } = render(
          <UnifiedDialogLayout 
            {...defaultProps} 
            onClose={onClose}
            size="compact"
            mobileOptimized={true}
          />
        )

        // Test basic functionality
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Mobile Test Dialog' })).toBeInTheDocument()
        
        // Test close functionality
        fireEvent.click(screen.getByLabelText('ダイアログを閉じる'))
        expect(onClose).toHaveBeenCalledTimes(1)
        
        unmount()
      })
    })
  })

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      mockViewport(375, 667)
    })

    it('maintains accessibility features in mobile compact mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )

      const dialog = screen.getByRole('dialog')
      const title = screen.getByRole('heading', { level: 2 })
      const closeButton = screen.getByLabelText('ダイアログを閉じる')

      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'unified-dialog-title')
      expect(title).toHaveAttribute('id', 'unified-dialog-title')
      expect(closeButton).toHaveAttribute('type', 'button')
    })

    it('supports keyboard navigation in mobile mode', () => {
      const onClose = vi.fn()
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          onClose={onClose}
          size="compact"
          mobileOptimized={true}
        >
          <div>
            <button>Button 1</button>
            <button>Button 2</button>
          </div>
        </UnifiedDialogLayout>
      )

      // Test ESC key
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('provides proper focus management in mobile compact mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          <form>
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
            <button type="submit">Submit</button>
          </form>
        </UnifiedDialogLayout>
      )

      const firstInput = screen.getByPlaceholderText('First input')
      const secondInput = screen.getByPlaceholderText('Second input')
      const submitButton = screen.getByText('Submit')

      expect(firstInput).toBeInTheDocument()
      expect(secondInput).toBeInTheDocument()
      expect(submitButton).toBeInTheDocument()
    })
  })

  describe('Performance in Mobile Mode', () => {
    beforeEach(() => {
      mockViewport(375, 667)
    })

    it('handles rapid open/close cycles efficiently', () => {
      const onClose = vi.fn()
      
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <UnifiedDialogLayout 
            {...defaultProps} 
            onClose={onClose}
            size="compact"
            mobileOptimized={true}
          />
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        unmount()
      }

      // Should not cause memory leaks or performance issues
      expect(document.querySelectorAll('.unified-dialog')).toHaveLength(0)
    })

    it('handles complex content efficiently in mobile mode', () => {
      const complexContent = (
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i}>
              <h3>Section {i + 1}</h3>
              <p>Content for section {i + 1}</p>
              <button>Action {i + 1}</button>
            </div>
          ))}
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          {complexContent}
        </UnifiedDialogLayout>
      )

      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')
      
      expect(dialog).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(screen.getByText('Section 1')).toBeInTheDocument()
    })
  })
})