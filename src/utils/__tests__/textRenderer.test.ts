import { BubbleTextRenderer } from '../textRenderer'

// Mock Canvas Context
class MockCanvasRenderingContext2D {
  font = ''
  fillStyle = ''
  strokeStyle = ''
  lineWidth = 0
  textAlign = ''
  textBaseline = ''

  measureText(text: string) {
    // Simple mock: assume each character is 8px wide
    return { width: text.length * 8 }
  }

  fillText() {}
  strokeText() {}
}

describe('BubbleTextRenderer', () => {
  let mockCtx: MockCanvasRenderingContext2D

  beforeEach(() => {
    mockCtx = new MockCanvasRenderingContext2D()
  })

  describe('calculateOptimalFontSize', () => {
    it('should calculate font size based on bubble size', () => {
      const fontSize = BubbleTextRenderer.calculateOptimalFontSize('Test', 100)
      expect(fontSize).toBeGreaterThanOrEqual(8)
      expect(fontSize).toBeLessThanOrEqual(18)
    })

    it('should reduce font size for longer text', () => {
      const shortTextSize = BubbleTextRenderer.calculateOptimalFontSize('Hi', 100)
      const longTextSize = BubbleTextRenderer.calculateOptimalFontSize('This is a very long text that should have smaller font', 100)
      
      expect(longTextSize).toBeLessThan(shortTextSize)
    })

    it('should respect minimum font size', () => {
      const fontSize = BubbleTextRenderer.calculateOptimalFontSize('Very long text', 20, { minFontSize: 10 })
      expect(fontSize).toBeGreaterThanOrEqual(10)
    })

    it('should respect maximum font size', () => {
      const fontSize = BubbleTextRenderer.calculateOptimalFontSize('Hi', 200, { maxFontSize: 12 })
      expect(fontSize).toBeLessThanOrEqual(12)
    })
  })

  describe('truncateText', () => {
    it('should return original text if it fits', () => {
      const result = BubbleTextRenderer.truncateText(
        mockCtx as any,
        'Short',
        100,
        12
      )
      expect(result).toBe('Short')
    })

    it('should truncate long text with ellipsis', () => {
      const result = BubbleTextRenderer.truncateText(
        mockCtx as any,
        'This is a very long text that should be truncated',
        50, // Small width to force truncation
        12
      )
      expect(result).toContain('…')
      expect(result.length).toBeLessThan('This is a very long text that should be truncated'.length)
    })

    it('should not truncate short text', () => {
      const result = BubbleTextRenderer.truncateText(
        mockCtx as any,
        'Hi',
        100,
        12,
        { ellipsisThreshold: 5 }
      )
      expect(result).toBe('Hi')
    })
  })

  describe('calculateOptimalTextColor', () => {
    it('should return appropriate colors for different bubble types', () => {
      const tagColors = BubbleTextRenderer.calculateOptimalTextColor('#98FB98', 'tag')
      const songColors = BubbleTextRenderer.calculateOptimalTextColor('#FFB6C1', 'song')
      
      expect(tagColors.fillColor).toBeDefined()
      expect(tagColors.strokeColor).toBeDefined()
      expect(songColors.fillColor).toBeDefined()
      expect(songColors.strokeColor).toBeDefined()
      
      // Tag should have different color than song
      expect(tagColors.fillColor).not.toBe(songColors.fillColor)
    })

    it('should provide high contrast colors', () => {
      const colors = BubbleTextRenderer.calculateOptimalTextColor('#FFFFFF', 'song')
      expect(colors.strokeColor).toContain('rgba(255, 255, 255')
    })
  })

  describe('calculateStrokeWidth', () => {
    it('should calculate stroke width based on font size', () => {
      const strokeWidth = BubbleTextRenderer.calculateStrokeWidth(16, 'song')
      expect(strokeWidth).toBeGreaterThan(0)
    })

    it('should use thicker stroke for tags', () => {
      const tagStroke = BubbleTextRenderer.calculateStrokeWidth(16, 'tag')
      const songStroke = BubbleTextRenderer.calculateStrokeWidth(16, 'song')
      
      expect(tagStroke).toBeGreaterThan(songStroke)
    })

    it('should have minimum stroke width', () => {
      const strokeWidth = BubbleTextRenderer.calculateStrokeWidth(4, 'song')
      expect(strokeWidth).toBeGreaterThanOrEqual(1)
    })
  })

  describe('calculateTextMetrics', () => {
    it('should return complete text metrics', () => {
      const metrics = BubbleTextRenderer.calculateTextMetrics(
        mockCtx as any,
        'Test Text',
        100,
        '#FFB6C1',
        'song'
      )

      expect(metrics).toHaveProperty('fontSize')
      expect(metrics).toHaveProperty('displayText')
      expect(metrics).toHaveProperty('textWidth')
      expect(metrics).toHaveProperty('strokeWidth')
      expect(metrics).toHaveProperty('fillColor')
      expect(metrics).toHaveProperty('strokeColor')
      
      expect(metrics.fontSize).toBeGreaterThan(0)
      expect(metrics.textWidth).toBeGreaterThan(0)
      expect(metrics.strokeWidth).toBeGreaterThan(0)
    })

    it('should handle tag type with hash prefix', () => {
      const metrics = BubbleTextRenderer.calculateTextMetrics(
        mockCtx as any,
        'music',
        100,
        '#98FB98',
        'tag'
      )

      // The displayText should be the same as input since hash is added in the canvas component
      expect(metrics.displayText).toBe('music')
      expect(metrics.fillColor).toContain('#')
    })

    it('should truncate long text appropriately', () => {
      const metrics = BubbleTextRenderer.calculateTextMetrics(
        mockCtx as any,
        'This is a very long text that should definitely be truncated',
        60, // Small bubble
        '#FFB6C1',
        'song'
      )

      expect(metrics.displayText.length).toBeLessThan('This is a very long text that should definitely be truncated'.length)
    })
  })

  describe('renderText', () => {
    it('should set appropriate font properties', () => {
      const metrics = {
        fontSize: 14,
        displayText: 'Test',
        textWidth: 32,
        strokeWidth: 2,
        fillColor: '#2C2C2C',
        strokeColor: 'rgba(255, 255, 255, 0.9)'
      }

      BubbleTextRenderer.renderText(mockCtx as any, metrics, 50, 50, 'song')

      expect(mockCtx.font).toContain('14px')
      expect(mockCtx.textAlign).toBe('center')
      expect(mockCtx.textBaseline).toBe('middle')
    })

    it('should use bold font for tags', () => {
      const metrics = {
        fontSize: 14,
        displayText: '#test',
        textWidth: 40,
        strokeWidth: 2,
        fillColor: '#0D4F1C',
        strokeColor: 'rgba(255, 255, 255, 0.9)'
      }

      BubbleTextRenderer.renderText(mockCtx as any, metrics, 50, 50, 'tag')

      expect(mockCtx.font).toContain('bold')
    })
  })
})