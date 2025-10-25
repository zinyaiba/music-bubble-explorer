import React from 'react'
import styled from 'styled-components'

/**
 * ジャンルフィルター状態表示コンポーネントのプロパティ
 * Requirements: 5.3, 5.4 - 選択状態の視覚的表示
 */
export interface GenreFilterStatusProps {
  isFilterActive: boolean
  selectedGenres: string[]
  totalBubbles: number
  filteredBubbles: number
  onClearFilter?: () => void
  className?: string
}

/**
 * GenreFilterStatus - フィルター状態を表示するコンポーネント
 * Requirements: 5.3, 5.4 - 選択状態の視覚的表示
 */
export const GenreFilterStatus: React.FC<GenreFilterStatusProps> = ({
  isFilterActive,
  selectedGenres,
  totalBubbles,
  filteredBubbles,
  onClearFilter,
  className,
}) => {
  if (!isFilterActive) {
    return null
  }

  const hiddenBubbles = totalBubbles - filteredBubbles
  const filterRatio =
    totalBubbles > 0 ? (filteredBubbles / totalBubbles) * 100 : 0

  return (
    <StatusContainer className={className}>
      <StatusHeader>
        <StatusIcon>🔍</StatusIcon>
        <StatusTitle>フィルター適用中</StatusTitle>
        {onClearFilter && (
          <ClearButton onClick={onClearFilter} aria-label="フィルターをクリア">
            ×
          </ClearButton>
        )}
      </StatusHeader>

      <StatusContent>
        <FilterSummary>
          <SummaryItem>
            <SummaryLabel>選択ジャンル:</SummaryLabel>
            <SummaryValue>{selectedGenres.length}個</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>表示中:</SummaryLabel>
            <SummaryValue>{filteredBubbles}個</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>非表示:</SummaryLabel>
            <SummaryValue>{hiddenBubbles}個</SummaryValue>
          </SummaryItem>
        </FilterSummary>

        <ProgressBar>
          <ProgressFill ratio={filterRatio} />
          <ProgressText>{Math.round(filterRatio)}%表示中</ProgressText>
        </ProgressBar>

        <SelectedGenres>
          {selectedGenres.map(genre => (
            <GenreTag key={genre}>
              <GenreIcon>🏷️</GenreIcon>
              <GenreName>{genre}</GenreName>
            </GenreTag>
          ))}
        </SelectedGenres>
      </StatusContent>
    </StatusContainer>
  )
}

/**
 * スタイル定義
 */
const StatusContainer = styled.div`
  background: rgba(227, 242, 253, 0.95);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
`

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const StatusIcon = styled.span`
  font-size: 16px;
  margin-right: 6px;
`

const StatusTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  flex: 1;
`

const ClearButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #333;
  }
`

const StatusContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FilterSummary = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const SummaryLabel = styled.span`
  font-size: 12px;
  color: #666;
`

const SummaryValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #1976d2;
`

const ProgressBar = styled.div`
  position: relative;
  height: 20px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ ratio: number }>`
  height: 100%;
  background: linear-gradient(90deg, #2196f3, #64b5f6);
  width: ${({ ratio }) => Math.max(0, Math.min(100, ratio))}%;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`

const SelectedGenres = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const GenreTag = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
`

const GenreIcon = styled.span`
  font-size: 10px;
`

const GenreName = styled.span`
  color: #1976d2;
  font-weight: 500;
`

export default GenreFilterStatus
