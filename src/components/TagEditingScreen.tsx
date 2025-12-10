import React, { useState, useCallback, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { GlassCard } from './GlassCard'
import { TagChipGroup } from './TagChipGroup'
import { ConfirmDialog } from './ConfirmDialog'
import { Song } from '@/types/music'
import { TagRegistrationService } from '@/services/tagRegistrationService'
import { MusicDataService } from '@/services/musicDataService'
import { DataManager } from '@/services/dataManager'

// Animation keyframes
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

// Props interface for TagEditingScreen
export interface TagEditingScreenProps {
  song: Song
  selectedTags?: string[]
  onTagsChange?: (tags: string[]) => void
  onSave: (songId: string, tags: string[]) => void
  maxTags?: number
  className?: string
  showHeader?: boolean
}

// Styled components
const ScreenContainer = styled.div<{
  $theme: any
}>`
  /* Layout */
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 32px;
  overflow: hidden;

  /* Animation */
  animation: ${fadeInUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 24px;
  }
`

const SongInfoSection = styled(GlassCard)<{
  $theme: any
}>`
  /* Layout */
  padding: 20px;

  /* Animation */
  animation: ${slideInFromRight} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const SongTitle = styled.h2<{
  $theme: any
}>`
  /* Typography */
  margin: 0 0 12px 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 20px;
  font-weight: ${props => props.$theme.typography.fontWeights.bold};
  color: ${props => props.$theme.colors.text.primary};
  line-height: 1.4;

  /* Text handling */
  word-break: break-word;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 18px;
  }
`

const SongDetails = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 4px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  color: ${props => props.$theme.colors.text.secondary};
  line-height: 1.5;
`

const TagEditingSection = styled(GlassCard)<{
  $theme: any
}>`
  /* Layout */
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;

  /* Animation */
  animation: ${slideInFromRight} 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`

const SectionTitle = styled.h3<{
  $theme: any
}>`
  /* Typography */
  margin: 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 18px;
  font-weight: ${props => props.$theme.typography.fontWeights.semiBold};
  color: ${props => props.$theme.colors.text.primary};

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const TagInputContainer = styled.div<{
  $theme: any
}>`
  /* Layout */
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    gap: 6px;
  }
`

const TagInput = styled.input<{
  $theme: any
}>`
  /* Layout */
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  border: 1px solid ${props => props.$theme.colors.border.light};
  border-radius: ${props => props.$theme.borderRadius.medium};

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  color: ${props => props.$theme.colors.text.primary};

  /* Background */
  background: ${props => props.$theme.colors.background.glass};
  backdrop-filter: blur(${props => props.$theme.effects.blur.light});

  /* Transitions */
  transition: all 0.2s ease;

  /* Focus state */
  &:focus {
    outline: none;
    border-color: ${props => props.$theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${props => props.$theme.colors.primary.main}20;
  }

  /* Placeholder */
  &::placeholder {
    color: ${props => props.$theme.colors.text.placeholder};
  }
`

const AddTagButton = styled.button<{
  $theme: any
  $disabled?: boolean
}>`
  /* Layout */
  padding: 8px 16px;
  border: none;
  border-radius: ${props => props.$theme.borderRadius.medium};
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props =>
    props.$disabled
      ? props.$theme.colors.text.disabled
      : props.$theme.colors.primary.contrastText};

  /* Background */
  background: ${props =>
    props.$disabled
      ? props.$theme.colors.background.disabled
      : props.$theme.colors.primary.main};

  /* Transitions */
  transition: all 0.2s ease;

  /* Hover state */
  &:hover:not(:disabled) {
    background: ${props => props.$theme.colors.primary.dark};
    transform: translateY(-1px);
  }

  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`

const TagSuggestionsDropdown = styled.div<{
  $theme: any
  $show: boolean
}>`
  /* Layout */
  position: absolute;
  top: 100%;
  left: 0;
  right: 60px; /* Leave space for the add button */
  z-index: 1000;

  /* Visibility */
  display: ${props => (props.$show ? 'block' : 'none')};

  /* Solid background for better readability */
  background: ${props => props.$theme.colors.surface || '#ffffff'};
  border: 1px solid ${props => props.$theme.colors.border.medium || '#e0e0e0'};
  border-radius: ${props => props.$theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  /* Layout */
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;

  /* Animation */
  animation: ${fadeInUp} 0.2s ease;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`

const TagSuggestionItem = styled.div<{
  $theme: any
}>`
  /* Layout */
  padding: 8px 12px;
  cursor: pointer;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  color: ${props => props.$theme.colors.text.primary};

  /* Transitions */
  transition: all 0.2s ease;

  /* Hover state */
  &:hover {
    background: ${props => props.$theme.colors.glass.medium};
    color: ${props => props.$theme.colors.accent};
  }

  /* First item */
  &:first-child {
    border-top-left-radius: ${props => props.$theme.borderRadius.medium};
    border-top-right-radius: ${props => props.$theme.borderRadius.medium};
  }

  /* Last item */
  &:last-child {
    border-bottom-left-radius: ${props => props.$theme.borderRadius.medium};
    border-bottom-right-radius: ${props => props.$theme.borderRadius.medium};
  }

  /* Text handling */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const TagsContainer = styled.div`
  /* Layout */
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
  min-height: 200px;
  max-height: 400px;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`

// Action buttons are removed for immediate save functionality

const StatusMessage = styled.div<{
  $theme: any
  $type: 'info' | 'success' | 'warning' | 'error'
}>`
  /* Layout */
  padding: 8px 12px;
  border-radius: ${props => props.$theme.borderRadius.small};
  margin-bottom: 8px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 12px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};

  /* Colors based on type */
  background: ${props => {
    switch (props.$type) {
      case 'success':
        return props.$theme.colors.success.light
      case 'warning':
        return props.$theme.colors.warning.light
      case 'error':
        return props.$theme.colors.error.light
      default:
        return props.$theme.colors.info.light
    }
  }};

  color: ${props => {
    switch (props.$type) {
      case 'success':
        return props.$theme.colors.success.dark
      case 'warning':
        return props.$theme.colors.warning.dark
      case 'error':
        return props.$theme.colors.error.dark
      default:
        return props.$theme.colors.info.dark
    }
  }};

  /* Animation */
  animation: ${fadeInUp} 0.3s ease;
`

// Main component
export const TagEditingScreen: React.FC<TagEditingScreenProps> = ({
  song,
  selectedTags = [],
  onTagsChange,
  onSave,
  maxTags = 1000,
  className,
  showHeader = true,
}) => {
  const theme = useGlassmorphismTheme()

  // State management
  const [currentTags, setCurrentTags] = useState<string[]>(selectedTags)
  const [newTagInput, setNewTagInput] = useState('')
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    text: string
    type: 'info' | 'success' | 'warning' | 'error'
  } | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    tagToRemove: string
    indexToRemove: number
  }>({
    isOpen: false,
    tagToRemove: '',
    indexToRemove: -1,
  })

  // Computed values

  const canAddMoreTags = currentTags.length < maxTags
  const canAddNewTag =
    newTagInput.trim() &&
    !currentTags.includes(newTagInput.trim()) &&
    canAddMoreTags

  // Event handlers with immediate save
  const handleTagAdd = useCallback(
    async (tag: string) => {
      if (!currentTags.includes(tag) && canAddMoreTags) {
        const newTags = [...currentTags, tag]
        setCurrentTags(newTags)
        onTagsChange?.(newTags)

        // Immediate save to DB using TagRegistrationService
        try {
          const tagService = TagRegistrationService.getInstance()
          const result = await tagService.replaceTagsForSong(song.id, newTags)

          if (result.success) {
            // Also call the parent's onSave for any additional handling
            onSave(song.id, newTags)
            setStatusMessage({
              text: `タグ「${tag}」を追加しました`,
              type: 'success',
            })
          } else {
            throw new Error(
              result.errorMessages?.join(', ') || 'タグの追加に失敗しました'
            )
          }
        } catch (error) {
          console.error('Tag add error:', error)
          setStatusMessage({
            text: `タグ「${tag}」の追加に失敗しました`,
            type: 'error',
          })
          // Revert on error
          setCurrentTags(currentTags)
          onTagsChange?.(currentTags)
        }
        setTimeout(() => setStatusMessage(null), 3000)
      }
    },
    [currentTags, canAddMoreTags, onTagsChange, onSave, song.id]
  )

  const handleTagRemove = useCallback(
    (index: number) => {
      const tag = currentTags[index]
      // Show custom confirmation dialog
      setConfirmDialog({
        isOpen: true,
        tagToRemove: tag,
        indexToRemove: index,
      })
    },
    [currentTags]
  )

  const handleConfirmRemove = useCallback(async () => {
    const { tagToRemove, indexToRemove } = confirmDialog
    setConfirmDialog({ isOpen: false, tagToRemove: '', indexToRemove: -1 })

    const newTags = currentTags.filter((_, i) => i !== indexToRemove)

    // 即座にUIを更新
    setCurrentTags(newTags)
    onTagsChange?.(newTags)
    setIsProcessing(true)

    // Immediate save to DB using TagRegistrationService
    try {
      const tagService = TagRegistrationService.getInstance()
      const result = await tagService.replaceTagsForSong(song.id, newTags)

      if (result.success) {
        // Also call the parent's onSave for any additional handling
        onSave(song.id, newTags)
        setStatusMessage({
          text: `タグ「${tagToRemove}」を削除しました`,
          type: 'success',
        })
      } else {
        throw new Error(
          result.errorMessages?.join(', ') || 'タグの削除に失敗しました'
        )
      }
    } catch (error) {
      console.error('Tag remove error:', error)
      setStatusMessage({
        text: `タグ「${tagToRemove}」の削除に失敗しました`,
        type: 'error',
      })
      // Revert on error
      setCurrentTags(currentTags)
      onTagsChange?.(currentTags)
    } finally {
      setIsProcessing(false)
    }
    setTimeout(() => setStatusMessage(null), 3000)
  }, [confirmDialog, currentTags, onTagsChange, onSave, song.id])

  const handleCancelRemove = useCallback(() => {
    setConfirmDialog({ isOpen: false, tagToRemove: '', indexToRemove: -1 })
  }, [])

  const handleNewTagAdd = useCallback(() => {
    const tag = newTagInput.trim()
    if (canAddNewTag) {
      handleTagAdd(tag)
      setNewTagInput('')
      setShowSuggestions(false)
    }
  }, [newTagInput, canAddNewTag, handleTagAdd])

  // Handle tag suggestion selection - now just fills the input
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setNewTagInput(suggestion)
    setShowSuggestions(false)
  }, [])

  // Handle input change and fetch suggestions
  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setNewTagInput(value)

      if (value.trim().length > 0) {
        try {
          // Get suggestions from TagRegistrationService first
          const tagService = TagRegistrationService.getInstance()
          let suggestions = tagService.getTagSuggestions(value.trim(), 10)
          console.log(
            '🏷️ Tag suggestions from TagRegistrationService for "' +
              value.trim() +
              '":',
            suggestions
          )

          // If no suggestions from TagRegistrationService, get from MusicDataService
          if (suggestions.length === 0) {
            try {
              const musicService = MusicDataService.getInstance()

              // Get all songs and extract tags from them
              const allSongs = musicService.getAllSongs()
              console.log(
                '🏷️ All songs from MusicDataService:',
                allSongs.length
              )

              // Extract unique tags from all songs
              const allTagsSet = new Set<string>()
              allSongs.forEach(song => {
                if (song.tags && song.tags.length > 0) {
                  song.tags.forEach(tag => allTagsSet.add(tag))
                }
              })
              const allTagsFromSongs = Array.from(allTagsSet)
              console.log('🏷️ All tags extracted from songs:', allTagsFromSongs)

              const normalizedQuery = value.trim().toLowerCase()
              const matchingTags = allTagsFromSongs
                .filter(tagName =>
                  tagName.toLowerCase().includes(normalizedQuery)
                )
                .filter(tagName => !currentTags.includes(tagName))
                .slice(0, 10)

              console.log('🏷️ Matching tags from song data:', matchingTags)
              suggestions = matchingTags
            } catch (musicServiceError) {
              console.error(
                'Failed to get tags from MusicDataService:',
                musicServiceError
              )
            }
          }

          // Filter out already selected tags
          const filteredSuggestions = suggestions.filter(
            tag => !currentTags.includes(tag)
          )
          console.log('🏷️ Filtered suggestions:', filteredSuggestions)

          setTagSuggestions(filteredSuggestions)
          setShowSuggestions(filteredSuggestions.length > 0)
        } catch (error) {
          console.error('Failed to get tag suggestions:', error)
          setTagSuggestions([])
          setShowSuggestions(false)
        }
      } else {
        // When input is empty, show popular tags
        try {
          const musicService = MusicDataService.getInstance()

          // Get all songs and extract tags from them
          const allSongs = musicService.getAllSongs()

          // Extract unique tags from all songs with usage count
          const tagUsageMap = new Map<string, number>()
          allSongs.forEach(song => {
            if (song.tags && song.tags.length > 0) {
              song.tags.forEach(tag => {
                tagUsageMap.set(tag, (tagUsageMap.get(tag) || 0) + 1)
              })
            }
          })

          // Sort by usage count (most used first) and filter out already selected tags
          const sortedTags = Array.from(tagUsageMap.entries())
            .sort((a, b) => b[1] - a[1]) // Sort by usage count descending
            .map(([tag]) => tag)
            .filter(tag => !currentTags.includes(tag))
            .slice(0, 10)

          if (sortedTags.length > 0) {
            setTagSuggestions(sortedTags)
            setShowSuggestions(true)
          } else {
            setTagSuggestions([])
            setShowSuggestions(false)
          }
        } catch (error) {
          console.error('Failed to get popular tags for empty input:', error)
          setTagSuggestions([])
          setShowSuggestions(false)
        }
      }
    },
    [currentTags]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleNewTagAdd()
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    },
    [handleNewTagAdd]
  )

  // Handle input blur to hide suggestions
  const handleInputBlur = useCallback(() => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  // Handle input focus to show suggestions if there are any
  const handleInputFocus = useCallback(async () => {
    if (tagSuggestions.length > 0) {
      setShowSuggestions(true)
    } else if (newTagInput.trim().length === 0) {
      // Show existing tags when input is empty (on focus)
      try {
        const musicService = MusicDataService.getInstance()

        // Get all songs and extract tags from them
        const allSongs = musicService.getAllSongs()

        // Extract unique tags from all songs with usage count
        const tagUsageMap = new Map<string, number>()
        allSongs.forEach(song => {
          if (song.tags && song.tags.length > 0) {
            song.tags.forEach(tag => {
              tagUsageMap.set(tag, (tagUsageMap.get(tag) || 0) + 1)
            })
          }
        })

        // Sort by usage count (most used first) and filter out already selected tags
        const sortedTags = Array.from(tagUsageMap.entries())
          .sort((a, b) => b[1] - a[1]) // Sort by usage count descending
          .map(([tag]) => tag)
          .filter(tag => !currentTags.includes(tag))
          .slice(0, 10)

        console.log('🏷️ Popular tags for empty input:', sortedTags)

        if (sortedTags.length > 0) {
          setTagSuggestions(sortedTags)
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error('Failed to get popular tags:', error)
      }
    }
  }, [tagSuggestions.length, newTagInput, currentTags])

  // Remove save/cancel handlers as we now save immediately

  // Effects
  useEffect(() => {
    if (!canAddMoreTags && newTagInput) {
      setStatusMessage({
        text: `タグは最大${maxTags}個まで追加できます`,
        type: 'warning',
      })
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }, [canAddMoreTags, newTagInput, maxTags])

  // Debug: Log available tags on component mount
  useEffect(() => {
    // Check DataManager directly
    const songs = DataManager.loadSongs()
    console.log('🏷️ Songs from DataManager:', songs.length, songs.slice(0, 3))

    const allTags = DataManager.getAllTags()
    console.log('🏷️ All tags from DataManager:', allTags)

    // Check if any song has the expected tag
    const songsWithTag = songs.filter(
      song => song.tags && song.tags.some(tag => tag.includes('君が望む'))
    )
    console.log('🏷️ Songs with "君が望む" tag:', songsWithTag)

    const tagService = TagRegistrationService.getInstance()
    const allTagsFromService = tagService.getTagSuggestions('', 50) // Get popular tags
    console.log('🏷️ Available tags on component mount:', allTagsFromService)

    // Also try to get from MusicDataService
    const musicService = MusicDataService.getInstance()
    const musicTags = musicService.getAllTags()
    console.log('🏷️ Tags from MusicDataService on mount:', musicTags)

    const allSongs = musicService.getAllSongs()
    console.log('🏷️ Songs from MusicDataService:', allSongs.length)

    // Extract tags from songs
    const allTagsSet = new Set<string>()
    allSongs.forEach(song => {
      console.log('🏷️ Song:', song.title, 'Tags:', song.tags)
      if (song.tags && song.tags.length > 0) {
        song.tags.forEach(tag => allTagsSet.add(tag))
      }
    })
    const allTagsFromSongs = Array.from(allTagsSet)
    console.log('🏷️ All tags extracted from songs:', allTagsFromSongs)
  }, [])

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="タグの削除"
        message={`タグ「${confirmDialog.tagToRemove}」を削除しますか？`}
        confirmText="削除"
        cancelText="キャンセル"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        variant="danger"
      />

      <ScreenContainer $theme={theme} className={className}>
        {/* Song Information - conditionally shown */}
        {showHeader && (
          <SongInfoSection $theme={theme}>
            <SongTitle $theme={theme}>{song.title}</SongTitle>
            <SongDetails $theme={theme}>
              {song.lyricists.length > 0 && (
                <div>作詞: {song.lyricists.join(', ')}</div>
              )}
              {song.composers.length > 0 && (
                <div>作曲: {song.composers.join(', ')}</div>
              )}
              {song.arrangers.length > 0 && (
                <div>編曲: {song.arrangers.join(', ')}</div>
              )}
            </SongDetails>
          </SongInfoSection>
        )}

        {/* Tag Editing */}
        <TagEditingSection $theme={theme}>
          <SectionTitle $theme={theme}>
            タグ編集 ({currentTags.length}/{maxTags})
          </SectionTitle>

          {/* Status Message */}
          {statusMessage && (
            <StatusMessage $theme={theme} $type={statusMessage.type}>
              {statusMessage.text}
            </StatusMessage>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <StatusMessage $theme={theme} $type="info">
              処理中...
            </StatusMessage>
          )}

          {/* Tag Input */}
          <TagInputContainer $theme={theme}>
            <TagInput
              $theme={theme}
              type="text"
              value={newTagInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
              placeholder="新しいタグを入力..."
              disabled={!canAddMoreTags}
            />
            <AddTagButton
              $theme={theme}
              $disabled={!canAddNewTag}
              onClick={handleNewTagAdd}
              disabled={!canAddNewTag}
            >
              追加
            </AddTagButton>

            {/* Tag Suggestions Dropdown */}
            <TagSuggestionsDropdown $theme={theme} $show={showSuggestions}>
              {tagSuggestions.map((suggestion, index) => (
                <TagSuggestionItem
                  key={index}
                  $theme={theme}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  title={suggestion}
                >
                  {suggestion}
                </TagSuggestionItem>
              ))}
            </TagSuggestionsDropdown>
          </TagInputContainer>

          {/* Current Tags */}
          <TagsContainer>
            <TagChipGroup
              tags={currentTags}
              onTagRemove={isProcessing ? undefined : handleTagRemove}
              variant="editable"
              showFullText={true}
              maxTags={maxTags}
            />
          </TagsContainer>

          {/* Action buttons removed - immediate save functionality */}
        </TagEditingSection>
      </ScreenContainer>
    </>
  )
}
