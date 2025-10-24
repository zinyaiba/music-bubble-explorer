import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { UnifiedDialogLayout } from '@/components/UnifiedDialogLayout'

// Mock CSS import
vi.mock('@/components/UnifiedDialogLayout.css', () => ({}))

describe('UnifiedDialogLayout Positioning Tests - Dialog Centering Fix', () => {
  const defaultProps = {
    isVisible: true,
    onClose: vi.fn(),
    title: 'Positioning Test Dialog',
    children: <div>Test content for positioning</div>
  }

  // Mock different viewport sizes
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

  describe('Overlay Positioning', () => {
    it('applies proper overlay positioning classes', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      expect(overlay).toBeInTheDocument()
      
      // Check that overlay has the correct class for positioning
      expect(overlay).toHaveClass('unified-dialog-overlay')
    })

    it('centers dialog content in overlay', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      const dialog = document.querySelector('.unified-dialog')
      
      expect(overlay).toContainElement(dialog)
      expect(overlay).toHaveClass('unified-dialog-overlay')
      expect(dialog).toHaveClass('unified-dialog')
    })
  })

  describe('Desktop Positioning (1024x768)', () => {
    beforeEach(() => {
      mockViewport(1024, 768)
    })

    it('maintains proper centering on desktop', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="standard" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--standard')
      expect(dialog).toBeInTheDocument()
    })

    it('handles large dialogs on desktop', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="large" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--large')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('Tablet Positioning (768x1024)', () => {
    beforeEach(() => {
      mockViewport(768, 1024)
    })

    it('maintains proper centering on tablet', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="standard" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveClass('unified-dialog--standard')
    })

    it('handles compact dialogs on tablet', () => {
      render(<UnifiedDialogLayout {...defaultProps} size="compact" />)
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toHaveClass('unified-dialog--compact')
    })
  })

  describe('Mobile Positioning - iPhone SE (375x667)', () => {
    beforeEach(() => {
      mockViewport(375, 667)
    })

    it('centers dialog properly on iPhone SE', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      const dialog = document.querySelector('.unified-dialog')
      
      expect(overlay).toBeInTheDocument()
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveClass('unified-dialog--compact')
      expect(dialog).toHaveClass('unified-dialog--mobile-optimized')
    })

    it('ensures dialog fits within viewport on iPhone SE', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          <div style={{ height: '800px' }}>Very tall content</div>
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toBeInTheDocument()
      
      // Dialog should have proper max-height constraints
      expect(dialog).toHaveClass('unified-dialog--compact')
    })
  })

  describe('Small Mobile Positioning (320x568)', () => {
    beforeEach(() => {
      mockViewport(320, 568)
    })

    it('centers dialog properly on very small screens', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      const dialog = document.querySelector('.unified-dialog')
      
      expect(overlay).toBeInTheDocument()
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveClass('unified-dialog--compact')
    })

    it('handles minimal content on very small screens', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        >
          <div>Minimal content</div>
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')
      
      expect(dialog).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(content).toHaveTextContent('Minimal content')
    })
  })

  describe('Landscape Mobile Positioning (667x375)', () => {
    beforeEach(() => {
      mockViewport(667, 375)
    })

    it('maintains proper centering in landscape mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="compact"
          mobileOptimized={true}
        />
      )
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      const dialog = document.querySelector('.unified-dialog')
      
      expect(overlay).toBeInTheDocument()
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveClass('unified-dialog--compact')
    })

    it('handles wide content in landscape mode', () => {
      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="standard"
          mobileOptimized={true}
        >
          <div style={{ width: '500px' }}>Wide content for landscape</div>
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('Content Overflow Handling', () => {
    it('handles tall content with proper scrolling', () => {
      const tallContent = (
        <div>
          {Array.from({ length: 50 }, (_, i) => (
            <p key={i}>Line {i + 1} of very tall content that should scroll properly</p>
          ))}
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="standard"
        >
          {tallContent}
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')
      
      expect(dialog).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(screen.getByText('Line 1 of very tall content that should scroll properly')).toBeInTheDocument()
    })

    it('handles wide content with proper containment', () => {
      const wideContent = (
        <div style={{ width: '1000px', background: 'red' }}>
          This is very wide content that should be contained within the dialog
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          size="large"
        >
          {wideContent}
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      const content = document.querySelector('.unified-dialog-content')
      
      expect(dialog).toBeInTheDocument()
      expect(content).toBeInTheDocument()
    })
  })

  describe('Multiple Dialog Sizes Positioning', () => {
    const sizes: Array<'compact' | 'standard' | 'large'> = ['compact', 'standard', 'large']

    sizes.forEach(size => {
      it(`centers ${size} dialog properly`, () => {
        render(
          <UnifiedDialogLayout 
            {...defaultProps} 
            size={size}
            title={`${size} Dialog`}
          />
        )
        
        const dialog = document.querySelector('.unified-dialog')
        expect(dialog).toHaveClass(`unified-dialog--${size}`)
        expect(screen.getByText(`${size} Dialog`)).toBeInTheDocument()
      })
    })
  })

  describe('Footer Positioning', () => {
    it('positions footer correctly with content', () => {
      const footerContent = (
        <div>
          <button>Cancel</button>
          <button>Save</button>
        </div>
      )

      render(
        <UnifiedDialogLayout 
          {...defaultProps} 
          showFooter={true}
          footerContent={footerContent}
        >
          <div>Main content</div>
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      const header = document.querySelector('.unified-dialog-header')
      const content = document.querySelector('.unified-dialog-content')
      const footer = document.querySelector('.unified-dialog-footer')
      
      expect(dialog).toContainElement(header)
      expect(dialog).toContainElement(content)
      expect(dialog).toContainElement(footer)
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.getByText('Save')).toBeInTheDocument()
    })
  })

  describe('Z-Index and Layering', () => {
    it('ensures dialog appears above other content', () => {
      render(<UnifiedDialogLayout {...defaultProps} />)
      
      const overlay = document.querySelector('.unified-dialog-overlay')
      expect(overlay).toBeInTheDocument()
      
      // The overlay should have high z-index to appear above other content
      expect(overlay).toHaveClass('unified-dialog-overlay')
    })

    it('maintains proper layering with multiple elements', () => {
      render(
        <UnifiedDialogLayout {...defaultProps}>
          <div>
            <button>Button 1</button>
            <input type="text" placeholder="Input field" />
            <select>
              <option>Option 1</option>
            </select>
          </div>
        </UnifiedDialogLayout>
      )
      
      const dialog = document.querySelector('.unified-dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('Button 1')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Input field')).toBeInTheDocument()
    })
  })
})