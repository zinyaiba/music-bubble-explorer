import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { Song } from '@/types/music'
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

const slideInFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

// Props interface for SongSelectionScreen
export interface SongSelectionScreenProps {
  songs?: Song[]
  onSongSelect: (song: Song) => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
  className?: string
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
  gap: 20px;
  overflow: hidden;

  /* Animation */
  animation: ${fadeInUp} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`

const SearchSection = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Animation */
  animation: ${slideInFromLeft} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`

const SearchInput = styled.input<{
  $theme: any
}>`
  /* Glassmorphism input styling */
  background: ${props => props.$theme.colors.glass.light};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  border: ${props => props.$theme.effects.borders.glass};
  border-radius: 16px;

  /* Layout */
  padding: 16px 20px;
  width: 100%;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 16px;
  font-weight: ${props => props.$theme.typography.fontWeights.regular};
  color: ${props => props.$theme.colors.text.primary};

  /* Placeholder styling */
  &::placeholder {
    color: ${props => props.$theme.colors.text.secondary};
    opacity: 0.8;
  }

  /* Focus styles */
  &:focus {
    outline: none;
    border: 2px solid ${props => props.$theme.colors.accent};
    background: ${props => props.$theme.colors.glass.medium};
    box-shadow: ${props => props.$theme.effects.shadows.medium};
  }

  /* Transitions */
  transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
    border-radius: 12px;
  }
`

const SearchStats = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  color: ${props => props.$theme.colors.text.secondary};

  .search-count {
    font-weight: ${props => props.$theme.typography.fontWeights.medium};
  }

  .clear-search {
    color: ${props => props.$theme.colors.accent};
    cursor: pointer;
    text-decoration: underline;

    &:hover {
      color: ${props => props.$theme.colors.primary[400]};
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 13px;
  }
`

const SongsContainer = styled.div<{
  $theme: any
}>`
  /* Layout */
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.$theme.colors.glass.light};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.$theme.colors.glass.medium};
    border-radius: 4px;

    &:hover {
      background: ${props => props.$theme.colors.glass.strong};
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    &::-webkit-scrollbar {
      width: 6px;
    }
  }
`

const SongsList = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    gap: 10px;
  }
`

const SongCard = styled.div<{
  $theme: any
  $index: number
}>`
  /* Base glassmorphism styles */
  background: ${props => props.$theme.colors.glass.medium};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.medium};
  border: ${props => props.$theme.effects.borders.glass};
  border-radius: ${props => props.$theme.borderRadius.large};
  box-shadow: ${props => props.$theme.effects.shadows.medium};

  /* Layout */
  padding: 20px;
  cursor: pointer;

  /* Animation with staggered delay */
  animation: ${fadeInUp} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-delay: ${props => props.$index * 0.05}s;
  animation-fill-mode: both;

  /* Interactive states */
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$theme.effects.shadows.strong};
  }

  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }

  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 16px;

    &:hover {
      transform: none;
    }

    &:active {
      transform: scale(0.98);
    }
  }
`

const SongTitle = styled.h3<{
  $theme: any
}>`
  /* Typography */
  margin: 0 0 8px 0;
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 18px;
  font-weight: ${props => props.$theme.typography.fontWeights.bold};
  color: ${props => props.$theme.colors.text.primary};
  line-height: 1.4;

  /* Text handling */
  word-break: break-word;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const SongDetails = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 14px;
  color: ${props => props.$theme.colors.text.secondary};

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 13px;
    gap: 3px;
  }
`

const SongCredit = styled.span<{
  $theme: any
}>`
  /* Layout */
  display: block;

  /* Typography */
  line-height: 1.4;

  .credit-label {
    font-weight: ${props => props.$theme.typography.fontWeights.medium};
    color: ${props => props.$theme.colors.text.primary};
  }

  .credit-names {
    margin-left: 4px;
  }
`

const SongTags = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    gap: 4px;
    margin-top: 6px;
  }
`

const TagChip = styled.span<{
  $theme: any
}>`
  /* Glassmorphism chip styling */
  background: ${props => props.$theme.colors.glass.tinted};
  backdrop-filter: ${props => props.$theme.effects.blur.light};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur.light};
  border: ${props => props.$theme.effects.borders.accent};
  border-radius: 12px;

  /* Layout */
  padding: 4px 8px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  font-size: 12px;
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props => props.$theme.colors.text.onGlass};

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 11px;
    padding: 3px 6px;
    border-radius: 10px;
  }
`

const EmptyState = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  color: ${props => props.$theme.colors.text.secondary};

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty-title {
    font-size: 18px;
    font-weight: ${props => props.$theme.typography.fontWeights.medium};
    color: ${props => props.$theme.colors.text.primary};
    margin-bottom: 8px;
  }

  .empty-description {
    font-size: 14px;
    line-height: 1.5;
    max-width: 300px;
  }

  /* Animation */
  animation: ${fadeInUp} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  /* Responsive adjustments */
  @media (max-width: 768px) {
    padding: 40px 16px;

    .empty-icon {
      font-size: 40px;
    }

    .empty-title {
      font-size: 16px;
    }

    .empty-description {
      font-size: 13px;
    }
  }
`

const LoadingState = styled.div<{
  $theme: any
}>`
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;

  /* Typography */
  font-family: ${props => props.$theme.typography.fontFamily};
  color: ${props => props.$theme.colors.text.secondary};

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid ${props => props.$theme.colors.neutral[200]};
    border-top: 3px solid ${props => props.$theme.colors.accent};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 14px;
  }
`

/**
 * SongSelectionScreen component
 * A glassmorphism-styled song selection interface with search and filtering
 *
 * Requirements: 4.1, 4.2, 4.4, 4.5
 */
export const SongSelectionScreen: React.FC<SongSelectionScreenProps> = ({
  songs: propSongs,
  onSongSelect,
  searchTerm: propSearchTerm = '',
  onSearchChange,
  className,
}) => {
  const theme = useGlassmorphismTheme()

  // Local state for songs and search
  const [songs, setSongs] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState(propSearchTerm)
  const [isLoading, setIsLoading] = useState(false)

  // Load songs data if not provided via props
  useEffect(() => {
    if (propSongs) {
      setSongs(propSongs)
    } else {
      const loadSongs = async () => {
        setIsLoading(true)
        try {
          const musicService = MusicDataService.getInstance()

          // Load from Firebase first
          await musicService.loadFromFirebase()

          // Get songs from multiple sources
          const serviceSongs = musicService.getAllSongs()
          const dataManagerSongs = DataManager.loadSongs()

          // Use the source with more data
          const finalSongs =
            serviceSongs.length > dataManagerSongs.length
              ? serviceSongs
              : dataManagerSongs

          setSongs(finalSongs)
        } catch (error) {
          console.error('Failed to load songs:', error)
          setSongs([])
        } finally {
          setIsLoading(false)
        }
      }

      loadSongs()
    }
  }, [propSongs])

  // Handle search term changes
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchTerm(term)
      if (onSearchChange) {
        onSearchChange(term)
      }
    },
    [onSearchChange]
  )

  // Filter songs based on search term
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) {
      return songs
    }

    const searchLower = searchTerm.toLowerCase()
    return songs.filter(
      song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.lyricists.some(lyricist =>
          lyricist.toLowerCase().includes(searchLower)
        ) ||
        song.composers.some(composer =>
          composer.toLowerCase().includes(searchLower)
        ) ||
        song.arrangers.some(arranger =>
          arranger.toLowerCase().includes(searchLower)
        ) ||
        (song.tags &&
          song.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    )
  }, [songs, searchTerm])

  // Handle song selection
  const handleSongSelect = useCallback(
    (song: Song) => {
      onSongSelect(song)
    },
    [onSongSelect]
  )

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    handleSearchChange('')
  }, [handleSearchChange])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, song: Song) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleSongSelect(song)
      }
    },
    [handleSongSelect]
  )

  // Render song credit information
  const renderSongCredits = useCallback(
    (song: Song) => {
      const credits = []

      if (song.lyricists.length > 0) {
        credits.push(
          <SongCredit key="lyricists" $theme={theme}>
            <span className="credit-label">作詞:</span>
            <span className="credit-names">{song.lyricists.join(', ')}</span>
          </SongCredit>
        )
      }

      if (song.composers.length > 0) {
        credits.push(
          <SongCredit key="composers" $theme={theme}>
            <span className="credit-label">作曲:</span>
            <span className="credit-names">{song.composers.join(', ')}</span>
          </SongCredit>
        )
      }

      if (song.arrangers.length > 0) {
        credits.push(
          <SongCredit key="arrangers" $theme={theme}>
            <span className="credit-label">編曲:</span>
            <span className="credit-names">{song.arrangers.join(', ')}</span>
          </SongCredit>
        )
      }

      return credits
    },
    [theme]
  )

  return (
    <ScreenContainer $theme={theme} className={className}>
      {/* Search Section */}
      <SearchSection $theme={theme}>
        <SearchInput
          $theme={theme}
          type="text"
          value={searchTerm}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="楽曲名、アーティスト、タグで検索..."
          aria-label="楽曲を検索"
        />

        {/* Search Statistics */}
        <SearchStats $theme={theme}>
          <span className="search-count">
            {filteredSongs.length} 件の楽曲
            {searchTerm && ` (「${searchTerm}」で検索)`}
          </span>
          {searchTerm && (
            <span
              className="clear-search"
              onClick={handleClearSearch}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClearSearch()
                }
              }}
            >
              検索をクリア
            </span>
          )}
        </SearchStats>
      </SearchSection>

      {/* Songs Container */}
      <SongsContainer $theme={theme}>
        {isLoading ? (
          <LoadingState $theme={theme}>
            <div className="loading-spinner" />
            <div className="loading-text">楽曲を読み込んでいます...</div>
          </LoadingState>
        ) : filteredSongs.length === 0 ? (
          <EmptyState $theme={theme}>
            <div className="empty-icon">{searchTerm ? '🔍' : '🎵'}</div>
            <div className="empty-title">
              {searchTerm ? '楽曲が見つかりません' : '楽曲が登録されていません'}
            </div>
            <div className="empty-description">
              {searchTerm
                ? '検索条件を変更して再度お試しください。'
                : '楽曲登録画面から楽曲を追加してください。'}
            </div>
          </EmptyState>
        ) : (
          <SongsList $theme={theme}>
            {filteredSongs.map((song, index) => (
              <SongCard
                key={song.id}
                $theme={theme}
                $index={index}
                onClick={() => handleSongSelect(song)}
                onKeyDown={(e: React.KeyboardEvent) => handleKeyDown(e, song)}
                tabIndex={0}
                role="button"
                aria-label={`楽曲「${song.title}」を選択`}
              >
                <SongTitle $theme={theme}>{song.title}</SongTitle>

                <SongDetails $theme={theme}>
                  {renderSongCredits(song)}
                </SongDetails>

                {song.tags && song.tags.length > 0 && (
                  <SongTags $theme={theme}>
                    {song.tags.map((tag, tagIndex) => (
                      <TagChip key={tagIndex} $theme={theme}>
                        {tag}
                      </TagChip>
                    ))}
                  </SongTags>
                )}
              </SongCard>
            ))}
          </SongsList>
        )}
      </SongsContainer>
    </ScreenContainer>
  )
}

export default SongSelectionScreen
