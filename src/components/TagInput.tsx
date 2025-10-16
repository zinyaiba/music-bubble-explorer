import React, { useState, useCallback, useRef } from 'react'
import styled from 'styled-components'

interface TagInputProps {
  id?: string
  tags: string[]
  onTagsChange: (tags: string[]) => void
  existingTags: string[]
  maxTags?: number
  placeholder?: string
  disabled?: boolean
}

interface TagSuggestion {
  tag: string
  isExisting: boolean
}

/**
 * 個別タグ入力コンポーネント
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */
export const TagInput: React.FC<TagInputProps> = React.memo(({
  id,
  tags,
  onTagsChange,
  existingTags,
  maxTags = 10,
  placeholder = "タグを入力してください",
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  /**
   * タグの候補を生成
   */
  const generateSuggestions = useCallback((input: string): TagSuggestion[] => {
    if (!input.trim()) return []
    
    const inputLower = input.toLowerCase()
    const filteredExisting = existingTags
      .filter(tag => 
        tag.toLowerCase().includes(inputLower) && 
        !tags.includes(tag)
      )
      .map(tag => ({ tag, isExisting: true }))
    
    // 入力値が既存タグと完全一致しない場合、新規タグとして提案
    const exactMatch = existingTags.some(tag => tag.toLowerCase() === inputLower)
    const alreadyAdded = tags.some(tag => tag.toLowerCase() === inputLower)
    
    const suggestions: TagSuggestion[] = [...filteredExisting]
    
    if (!exactMatch && !alreadyAdded && input.trim()) {
      suggestions.unshift({ tag: input.trim(), isExisting: false })
    }
    
    return suggestions.slice(0, 5) // 最大5個の候補
  }, [existingTags, tags])

  /**
   * 入力値の変更処理
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    const newSuggestions = generateSuggestions(value)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
    setSelectedSuggestionIndex(-1)
  }, [generateSuggestions])

  /**
   * タグを追加
   */
  const addTag = useCallback((tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim()
    
    if (!trimmedTag) return
    
    // 重複チェック（大文字小文字を区別しない）
    const isDuplicate = tags.some(tag => tag.toLowerCase() === trimmedTag.toLowerCase())
    if (isDuplicate) return
    
    // 最大タグ数チェック
    if (tags.length >= maxTags) return
    
    // タグを追加
    const newTags = [...tags, trimmedTag]
    onTagsChange(newTags)
    
    // 入力をクリア
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }, [tags, onTagsChange, maxTags])

  /**
   * タグを削除
   */
  const removeTag = useCallback((indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove)
    onTagsChange(newTags)
  }, [tags, onTagsChange])

  /**
   * キーボード操作の処理
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          addTag(suggestions[selectedSuggestionIndex].tag)
        } else if (inputValue.trim()) {
          addTag(inputValue.trim())
        }
        break
        
      case 'ArrowDown':
        e.preventDefault()
        if (showSuggestions && suggestions.length > 0) {
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
        }
        break
        
      case 'ArrowUp':
        e.preventDefault()
        if (showSuggestions && suggestions.length > 0) {
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
        }
        break
        
      case 'Escape':
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
        
      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          // 入力が空の場合、最後のタグを削除
          removeTag(tags.length - 1)
        }
        break
        
      case ',':
      case 'Tab':
        e.preventDefault()
        if (inputValue.trim()) {
          addTag(inputValue.trim())
        }
        break
    }
  }, [disabled, selectedSuggestionIndex, suggestions, showSuggestions, inputValue, addTag, removeTag, tags.length])

  /**
   * 候補をクリックした時の処理
   */
  const handleSuggestionClick = useCallback((suggestion: TagSuggestion) => {
    addTag(suggestion.tag)
  }, [addTag])

  /**
   * 入力フィールドのフォーカス処理
   */
  const handleInputFocus = useCallback(() => {
    if (inputValue) {
      const newSuggestions = generateSuggestions(inputValue)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    }
  }, [inputValue, generateSuggestions])

  /**
   * 入力フィールドのブラー処理
   */
  const handleInputBlur = useCallback(() => {
    // 少し遅延させて候補クリックを可能にする
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }, 200)
  }, [])

  /**
   * コンテナクリック時の処理（入力フィールドにフォーカス）
   */
  const handleContainerClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [disabled])

  return (
    <TagInputContainer onClick={handleContainerClick} $disabled={disabled}>
      <TagList>
        {tags.map((tag, index) => (
          <TagChip key={index} $disabled={disabled}>
            <TagText>{tag}</TagText>
            {!disabled && (
              <RemoveButton
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
                aria-label={`タグ「${tag}」を削除`}
                title={`タグ「${tag}」を削除`}
              >
                ×
              </RemoveButton>
            )}
          </TagChip>
        ))}
        
        {!disabled && tags.length < maxTags && (
          <InputWrapper>
            <TagInputField
              id={id}
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={tags.length === 0 ? placeholder : ''}
              disabled={disabled}
              size={Math.max(inputValue.length + 1, 8)}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <SuggestionsContainer ref={suggestionsRef}>
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={suggestion.tag}
                    $isSelected={index === selectedSuggestionIndex}
                    $isExisting={suggestion.isExisting}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <SuggestionText>{suggestion.tag}</SuggestionText>
                    <SuggestionBadge $isExisting={suggestion.isExisting}>
                      {suggestion.isExisting ? '既存' : '新規'}
                    </SuggestionBadge>
                  </SuggestionItem>
                ))}
              </SuggestionsContainer>
            )}
          </InputWrapper>
        )}
      </TagList>
      
      {tags.length >= maxTags && (
        <MaxTagsMessage>
          最大{maxTags}個のタグまで追加できます
        </MaxTagsMessage>
      )}
    </TagInputContainer>
  )
})

// スタイル定義
const TagInputContainer = styled.div<{ $disabled?: boolean }>`
  position: relative;
  min-height: 44px;
  padding: 8px 12px;
  border: 2px solid ${({ theme }) => theme.colors.ui.borderLight};
  border-radius: 12px;
  background: ${({ $disabled }) => $disabled ? 'rgba(240, 240, 240, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'text'};
  transition: all ${({ theme }) => theme.animations.duration.fast};

  &:focus-within {
    border-color: #ff69b4;
    box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
    background: rgba(255, 255, 255, 0.95);
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 28px;
`

const TagChip = styled.div<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: linear-gradient(135deg, #98fb98, #90ee90);
  border: 1px solid #90ee90;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  color: #2d5016;
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  transition: all ${({ theme }) => theme.animations.duration.fast};

  &:hover {
    background: ${({ $disabled }) => $disabled ? undefined : 'linear-gradient(135deg, #90ee90, #7dd87d)'};
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-1px)'};
  }
`

const TagText = styled.span`
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RemoveButton = styled.button`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #90ee90;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: #2d5016;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.duration.fast};

  &:hover {
    background: #ff69b4;
    border-color: #ff69b4;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const TagInputField = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 60px;
  max-width: 200px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }

  @media (max-width: 480px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #ff69b4;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
`

const SuggestionItem = styled.div<{ $isSelected: boolean; $isExisting: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(255, 105, 180, 0.1)' : 'transparent'};
  border-bottom: 1px solid rgba(255, 105, 180, 0.1);
  transition: background-color ${({ theme }) => theme.animations.duration.fast};

  &:hover {
    background: rgba(255, 105, 180, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`

const SuggestionText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
`

const SuggestionBadge = styled.span<{ $isExisting: boolean }>`
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  background: ${({ $isExisting }) => $isExisting ? '#98fb98' : '#ffb6c1'};
  color: ${({ $isExisting }) => $isExisting ? '#2d5016' : '#8b0000'};
  border: 1px solid ${({ $isExisting }) => $isExisting ? '#90ee90' : '#ff69b4'};
`

const MaxTagsMessage = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.light};
  margin-top: 4px;
  font-style: italic;
`

export default TagInput