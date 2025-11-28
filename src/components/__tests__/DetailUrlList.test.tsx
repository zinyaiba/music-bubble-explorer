import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DetailUrlList } from '../DetailUrlList'

describe('DetailUrlList', () => {
  it('should render initial empty field', () => {
    const onChange = vi.fn()
    render(<DetailUrlList urls={[]} onChange={onChange} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(1)
    expect(inputs[0]).toHaveValue('')
  })

  it('should render existing URLs', () => {
    const onChange = vi.fn()
    const urls = ['https://example.com/1', 'https://example.com/2']
    render(<DetailUrlList urls={urls} onChange={onChange} />)

    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toHaveValue('https://example.com/1')
    expect(inputs[1]).toHaveValue('https://example.com/2')
  })

  it('should add new URL field when add button is clicked', () => {
    const onChange = vi.fn()
    render(<DetailUrlList urls={['https://example.com']} onChange={onChange} />)

    const addButton = screen.getByRole('button', { name: /URLを追加/i })
    fireEvent.click(addButton)

    expect(onChange).toHaveBeenCalledWith(['https://example.com', ''])
  })

  it('should remove URL field when delete button is clicked', () => {
    const onChange = vi.fn()
    const urls = ['https://example.com/1', 'https://example.com/2']
    render(<DetailUrlList urls={urls} onChange={onChange} />)

    const deleteButtons = screen.getAllByRole('button', { name: /削除/i })
    fireEvent.click(deleteButtons[0])

    expect(onChange).toHaveBeenCalledWith(['https://example.com/2'])
  })

  it('should disable add button when max URLs reached', () => {
    const onChange = vi.fn()
    const urls = Array(10).fill('https://example.com')
    render(<DetailUrlList urls={urls} onChange={onChange} maxUrls={10} />)

    const addButton = screen.getByRole('button', { name: /URLを追加/i })
    expect(addButton).toBeDisabled()
  })

  it('should show limit message when max URLs reached', () => {
    const onChange = vi.fn()
    const urls = Array(10).fill('https://example.com')
    render(<DetailUrlList urls={urls} onChange={onChange} maxUrls={10} />)

    expect(
      screen.getByText(/最大10個までURLを登録できます/i)
    ).toBeInTheDocument()
  })

  it('should call onChange when URL input changes', () => {
    const onChange = vi.fn()
    render(<DetailUrlList urls={['https://example.com']} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'https://newurl.com' } })

    expect(onChange).toHaveBeenCalledWith(['https://newurl.com'])
  })

  it('should show error for invalid URL format', () => {
    const onChange = vi.fn()
    render(<DetailUrlList urls={['invalid-url']} onChange={onChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'invalid-url' } })

    // Wait for validation to trigger
    setTimeout(() => {
      expect(
        screen.getByText(/有効なURL形式で入力してください/i)
      ).toBeInTheDocument()
    }, 100)
  })

  it('should not show delete button when only one field exists', () => {
    const onChange = vi.fn()
    render(<DetailUrlList urls={['https://example.com']} onChange={onChange} />)

    const deleteButtons = screen.queryAllByRole('button', { name: /削除/i })
    expect(deleteButtons).toHaveLength(0)
  })

  it('should disable all inputs when disabled prop is true', () => {
    const onChange = vi.fn()
    render(
      <DetailUrlList
        urls={['https://example.com']}
        onChange={onChange}
        disabled={true}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()

    const addButton = screen.getByRole('button', { name: /URLを追加/i })
    expect(addButton).toBeDisabled()
  })
})
