import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ColorLegend } from '@/components/ColorLegend'
import { CATEGORY_COLORS } from '@/services/roleBasedBubbleManager'
import type { LegendItem } from '@/components/ColorLegend'

describe('ColorLegend', () => {
  const mockLegendItems: LegendItem[] = [
    {
      category: 'song',
      color: CATEGORY_COLORS.song,
      label: '楽曲',
      icon: '🎵',
      count: 5
    },
    {
      category: 'lyricist',
      color: CATEGORY_COLORS.lyricist,
      label: '作詞家',
      icon: '✍️',
      count: 3
    },
    {
      category: 'composer',
      color: CATEGORY_COLORS.composer,
      label: '作曲家',
      icon: '🎼',
      count: 2
    }
  ]

  it('should render legend with default props', () => {
    render(<ColorLegend />)
    
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByText('楽曲')).toBeInTheDocument()
    expect(screen.getByText('作詞家')).toBeInTheDocument()
    expect(screen.getByText('作曲家')).toBeInTheDocument()
    expect(screen.getByText('編曲家')).toBeInTheDocument()
    expect(screen.getByText('タグ')).toBeInTheDocument()
  })

  it('should render legend with custom categories', () => {
    render(
      <ColorLegend 
        categories={mockLegendItems}
        showCounts={true}
      />
    )
    
    expect(screen.getByText('楽曲')).toBeInTheDocument()
    expect(screen.getByText('作詞家')).toBeInTheDocument()
    expect(screen.getByText('作曲家')).toBeInTheDocument()
    
    // Should show counts
    expect(screen.getByText('(5)')).toBeInTheDocument()
    expect(screen.getByText('(3)')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
  })

  it('should not render when isVisible is false', () => {
    render(<ColorLegend isVisible={false} />)
    
    expect(screen.queryByText('カテゴリ')).not.toBeInTheDocument()
  })

  it('should render in different positions', () => {
    const { rerender } = render(<ColorLegend position="top-left" />)
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
    
    rerender(<ColorLegend position="bottom-right" />)
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
  })

  it('should render icons when provided', () => {
    render(<ColorLegend categories={mockLegendItems} />)
    
    expect(screen.getByText('🎵')).toBeInTheDocument()
    expect(screen.getByText('✍️')).toBeInTheDocument()
    expect(screen.getByText('🎼')).toBeInTheDocument()
  })

  it('should not show counts when showCounts is false', () => {
    render(
      <ColorLegend 
        categories={mockLegendItems}
        showCounts={false}
      />
    )
    
    expect(screen.queryByText('(5)')).not.toBeInTheDocument()
    expect(screen.queryByText('(3)')).not.toBeInTheDocument()
    expect(screen.queryByText('(2)')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<ColorLegend className="custom-legend" />)
    
    expect(container.querySelector('.custom-legend')).toBeInTheDocument()
  })
})