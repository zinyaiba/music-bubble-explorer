import React from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

// Typography variant types
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'button'

// Typography component props
export interface TypographyProps {
  variant?: TypographyVariant
  component?: keyof JSX.IntrinsicElements
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  color?: 'primary' | 'secondary' | 'onGlass' | 'accent'
  weight?: 'light' | 'regular' | 'medium' | 'bold'
  align?: 'left' | 'center' | 'right'
  noWrap?: boolean
}

// Styled typography component
const StyledTypography = styled.span<{
  $variant: TypographyVariant
  $color: string
  $weight: number
  $align: string
  $noWrap: boolean
  $fontFamily: string
}>`
  font-family: ${props => props.$fontFamily};
  color: ${props => props.$color};
  font-weight: ${props => props.$weight};
  text-align: ${props => props.$align};
  margin: 0;
  
  ${props => props.$noWrap && `
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `}
  
  /* Typography scale based on variant */
  ${props => {
    switch (props.$variant) {
      case 'h1':
        return `
          font-size: clamp(2rem, 5vw, 3.2rem);
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: -0.02em;
        `
      case 'h2':
        return `
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.01em;
        `
      case 'h3':
        return `
          font-size: clamp(1.5rem, 3vw, 2rem);
          line-height: 1.4;
          font-weight: 600;
        `
      case 'h4':
        return `
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          line-height: 1.4;
          font-weight: 600;
        `
      case 'h5':
        return `
          font-size: clamp(1.125rem, 2vw, 1.25rem);
          line-height: 1.5;
          font-weight: 500;
        `
      case 'h6':
        return `
          font-size: clamp(1rem, 1.5vw, 1.125rem);
          line-height: 1.5;
          font-weight: 500;
        `
      case 'body1':
        return `
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 400;
        `
      case 'body2':
        return `
          font-size: 0.875rem;
          line-height: 1.6;
          font-weight: 400;
        `
      case 'caption':
        return `
          font-size: 0.75rem;
          line-height: 1.4;
          font-weight: 400;
          letter-spacing: 0.03em;
        `
      case 'button':
        return `
          font-size: 0.875rem;
          line-height: 1.4;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        `
      default:
        return `
          font-size: 1rem;
          line-height: 1.6;
          font-weight: 400;
        `
    }
  }}
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${props => {
      switch (props.$variant) {
        case 'h1':
          return `font-size: clamp(1.75rem, 6vw, 2.5rem);`
        case 'h2':
          return `font-size: clamp(1.5rem, 5vw, 2rem);`
        case 'h3':
          return `font-size: clamp(1.25rem, 4vw, 1.75rem);`
        default:
          return ''
      }
    }}
  }
`

/**
 * Typography component with M PLUS Rounded 1c font system
 * Provides consistent typography across the application
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  component,
  children,
  className,
  style,
  color = 'primary',
  weight,
  align = 'left',
  noWrap = false,
  ...props
}) => {
  const theme = useGlassmorphismTheme()
  
  // Determine the HTML element to render
  const Component = component || getDefaultComponent(variant)
  
  // Get color value from theme
  const colorValue = getColorValue(theme, color)
  
  // Get font weight value
  const fontWeight = weight ? theme.typography.fontWeights[weight] : undefined
  
  return (
    <StyledTypography
      as={Component}
      $variant={variant}
      $color={colorValue}
      $weight={fontWeight || theme.typography.fontWeights.regular}
      $align={align}
      $noWrap={noWrap}
      $fontFamily={theme.typography.fontFamily}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </StyledTypography>
  )
}

// Helper function to get default HTML component for variant
const getDefaultComponent = (variant: TypographyVariant): keyof JSX.IntrinsicElements => {
  switch (variant) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return variant
    case 'body1':
    case 'body2':
      return 'p'
    case 'caption':
      return 'span'
    case 'button':
      return 'span'
    default:
      return 'span'
  }
}

// Helper function to get color value from theme
const getColorValue = (theme: any, color: string): string => {
  switch (color) {
    case 'primary':
      return theme.colors.text.primary
    case 'secondary':
      return theme.colors.text.secondary
    case 'onGlass':
      return theme.colors.text.onGlass
    case 'accent':
      return theme.colors.accent
    default:
      return theme.colors.text.primary
  }
}

// Preset typography components for common use cases
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
)

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
)

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
)

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
)

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
)

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
)

export const ButtonText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="button" {...props} />
)