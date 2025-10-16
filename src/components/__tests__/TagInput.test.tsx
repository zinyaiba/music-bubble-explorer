import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { theme } from '@/styles/theme'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import TagInput from '../TagInput'

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('TagInput', () => {
  const mockOnTagsChange = vi.fn()
  const existingTags = ['バラード', 'アニメ', 'ロック', 'ポップス']

  beforeEach(() => {
    mockOnTagsChange.mockClear()
  })

  it('renders correctly with empty tags', () => {
    renderWithTheme(
      <TagInput
        tags={[]}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    expect(screen.getByPlaceholderText('タグを入力してください')).toBeInTheDocument()
  })

  it('displays existing tags as chips', () => {
    const tags = ['バラード', 'アニメ']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    expect(screen.getByText('バラード')).toBeInTheDocument()
    expect(screen.getByText('アニメ')).toBeInTheDocument()
  })

  it('adds a new tag when Enter is pressed', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TagInput
        tags={[]}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByPlaceholderText('タグを入力してください')
    await user.type(input, '新しいタグ')
    await user.keyboard('{Enter}')

    expect(mockOnTagsChange).toHaveBeenCalledWith(['新しいタグ'])
  })

  it('adds a tag when comma is pressed', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TagInput
        tags={[]}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByPlaceholderText('タグを入力してください')
    await user.type(input, '新しいタグ,')

    expect(mockOnTagsChange).toHaveBeenCalledWith(['新しいタグ'])
  })

  it('removes a tag when remove button is clicked', async () => {
    const user = userEvent.setup()
    const tags = ['バラード', 'アニメ']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const removeButtons = screen.getAllByLabelText(/タグ「.*」を削除/)
    await user.click(removeButtons[0])

    expect(mockOnTagsChange).toHaveBeenCalledWith(['アニメ'])
  })

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TagInput
        tags={[]}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByPlaceholderText('タグを入力してください')
    await user.type(input, 'バ')

    await waitFor(() => {
      expect(screen.getByText('バラード')).toBeInTheDocument()
    })
  })

  it('prevents duplicate tags', async () => {
    const user = userEvent.setup()
    const tags = ['バラード']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'バラード')
    await user.keyboard('{Enter}')

    // Should not call onTagsChange because it's a duplicate
    expect(mockOnTagsChange).not.toHaveBeenCalled()
  })

  it('respects maxTags limit', async () => {
    const user = userEvent.setup()
    const tags = ['tag1', 'tag2']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
        maxTags={2}
      />
    )

    // Input should not be visible when max tags reached
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('最大2個のタグまで追加できます')).toBeInTheDocument()
  })

  it('adds suggestion when clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <TagInput
        tags={[]}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByPlaceholderText('タグを入力してください')
    await user.type(input, 'アニ')

    await waitFor(() => {
      expect(screen.getByText('アニメ')).toBeInTheDocument()
    })

    // Click on the suggestion
    await user.click(screen.getByText('アニメ'))

    expect(mockOnTagsChange).toHaveBeenCalledWith(['アニメ'])
  })

  it('removes last tag when backspace is pressed on empty input', async () => {
    const user = userEvent.setup()
    const tags = ['バラード', 'アニメ']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Backspace}')

    expect(mockOnTagsChange).toHaveBeenCalledWith(['バラード'])
  })

  it('is disabled when disabled prop is true', () => {
    const tags = ['バラード']
    renderWithTheme(
      <TagInput
        tags={tags}
        onTagsChange={mockOnTagsChange}
        existingTags={existingTags}
        disabled={true}
      />
    )

    // Remove button should not be present when disabled
    expect(screen.queryByLabelText(/タグ「.*」を削除/)).not.toBeInTheDocument()
    // Input should not be present when disabled
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})