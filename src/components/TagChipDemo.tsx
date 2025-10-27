import React, { useState } from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'
import { TagChip, TagChipGroup } from './TagComponents'

const DemoContainer = styled.div<{ $theme: any }>`
  padding: 24px;
  background: ${props => props.$theme.colors.background};
  min-height: 100vh;
  font-family: ${props => props.$theme.typography.fontFamily};
`

const Section = styled.div<{ $theme: any }>`
  margin-bottom: 32px;
  padding: 20px;
  background: ${props => props.$theme.colors.glass.light};
  backdrop-filter: ${props => props.$theme.effects.blur.medium};
  border: ${props => props.$theme.effects.borders.glass};
  border-radius: 16px;
  box-shadow: ${props => props.$theme.effects.shadows.medium};
`

const SectionTitle = styled.h2<{ $theme: any }>`
  margin: 0 0 16px 0;
  color: ${props => props.$theme.colors.text.primary};
  font-weight: ${props => props.$theme.typography.fontWeights.bold};
`

const DemoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`

const Label = styled.span<{ $theme: any }>`
  font-weight: ${props => props.$theme.typography.fontWeights.medium};
  color: ${props => props.$theme.colors.text.secondary};
  min-width: 120px;
`

/**
 * TagChipDemo component
 * Demonstrates the functionality of the tag chip system
 */
export const TagChipDemo: React.FC = () => {
  const theme = useGlassmorphismTheme()

  // Demo state
  const [editableTags, setEditableTags] = useState([
    'React',
    'TypeScript',
    'ガラスモーフィズム',
  ])
  const [selectableTags] = useState([
    '音楽',
    'ジャズ',
    'ロック',
    'クラシック',
    'ポップス',
  ])
  const [selectedTags, setSelectedTags] = useState<string[]>(['ジャズ'])

  // Handle tag editing
  const handleTagEdit = (index: number, newTag: string) => {
    setEditableTags(prev => {
      const newTags = [...prev]
      newTags[index] = newTag
      return newTags
    })
  }

  // Handle tag removal
  const handleTagRemove = (index: number) => {
    setEditableTags(prev => prev.filter((_, i) => i !== index))
  }

  // Handle tag addition
  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !editableTags.includes(tag.trim())) {
      setEditableTags(prev => [...prev, tag.trim()])
    }
  }

  // Handle tag selection
  const handleTagSelect = (tag: string, selected: boolean) => {
    setSelectedTags(prev =>
      selected ? [...prev, tag] : prev.filter(t => t !== tag)
    )
  }

  return (
    <DemoContainer $theme={theme}>
      <Section $theme={theme}>
        <SectionTitle $theme={theme}>Individual Tag Chips</SectionTitle>

        <DemoRow>
          <Label $theme={theme}>Default:</Label>
          <TagChip tag="デフォルト" />
          <TagChip tag="長いタグ名の例です" />
          <TagChip tag="Short" size="small" />
          <TagChip tag="Large Tag" size="large" />
        </DemoRow>

        <DemoRow>
          <Label $theme={theme}>Selected:</Label>
          <TagChip tag="選択済み" variant="selected" />
          <TagChip tag="Selected" variant="selected" size="small" />
          <TagChip tag="Large Selected" variant="selected" size="large" />
        </DemoRow>

        <DemoRow>
          <Label $theme={theme}>Editable:</Label>
          <TagChip
            tag="編集可能"
            variant="editable"
            onEdit={newTag => console.log('Edited:', newTag)}
          />
          <TagChip
            tag="Click to edit"
            variant="editable"
            size="small"
            onEdit={newTag => console.log('Edited:', newTag)}
          />
        </DemoRow>

        <DemoRow>
          <Label $theme={theme}>Removable:</Label>
          <TagChip
            tag="削除可能"
            variant="removable"
            onRemove={() => console.log('Removed')}
          />
          <TagChip
            tag="Remove me"
            variant="removable"
            size="large"
            onRemove={() => console.log('Removed')}
          />
        </DemoRow>

        <DemoRow>
          <Label $theme={theme}>Full Text:</Label>
          <TagChip
            tag="とても長いタグ名の例でテキストが省略されないようにする"
            showFullText
          />
          <TagChip
            tag="Very long tag name example that should not be truncated"
            showFullText
          />
        </DemoRow>

        <DemoRow>
          <Label $theme={theme}>Disabled:</Label>
          <TagChip tag="無効" disabled />
          <TagChip tag="Disabled Removable" variant="removable" disabled />
        </DemoRow>
      </Section>

      <Section $theme={theme}>
        <SectionTitle $theme={theme}>Tag Chip Groups</SectionTitle>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Display Group:</Label>
          <TagChipGroup
            tags={['表示専用', 'Display Only', 'タグ1', 'タグ2', 'タグ3']}
            variant="display"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Editable Group:</Label>
          <TagChipGroup
            tags={editableTags}
            variant="editable"
            onTagEdit={handleTagEdit}
            onTagRemove={handleTagRemove}
            onTagAdd={handleTagAdd}
            maxTags={10}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Selectable Group:</Label>
          <TagChipGroup
            tags={selectableTags}
            variant="selectable"
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />
          <div
            style={{
              marginTop: '8px',
              fontSize: '14px',
              color: theme.colors.text.secondary,
            }}
          >
            選択済み: {selectedTags.join(', ') || 'なし'}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Scroll Layout:</Label>
          <TagChipGroup
            tags={[
              'スクロール',
              'レイアウト',
              'Horizontal',
              'Scroll',
              'Layout',
              'Example',
              'With',
              'Many',
              'Tags',
              'To',
              'Show',
              'Scrolling',
            ]}
            layout="scroll"
            variant="display"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Small Size:</Label>
          <TagChipGroup
            tags={['小さい', 'Small', 'Size', 'Tags']}
            size="small"
            variant="display"
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Label $theme={theme}>Large Size:</Label>
          <TagChipGroup
            tags={['大きい', 'Large', 'Size']}
            size="large"
            variant="display"
          />
        </div>
      </Section>
    </DemoContainer>
  )
}

export default TagChipDemo
