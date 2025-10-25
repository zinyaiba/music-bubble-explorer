import React from 'react'
import styled from 'styled-components'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

// Props interface for GlassCard component
export interface GlassCardProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  blur?: 'light' | 'medium' | 'strong'
  opacity?: number
  className?: string
  onClick?: () => void
  style?: React.CSSProperties
  role?: string
  tabIndex?: number
  'aria-label'?: string
}

// Styled component for the glass card
const StyledGlassCard = styled.div<{
  $variant: 'primary' | 'secondary' | 'accent'
  $blur: 'light' | 'medium' | 'strong'
  $opacity: number
  $theme: any
}>`
  /* Base glassmorphism styles */
  background: ${props => {
    const { glass } = props.$theme.colors
    switch (props.$variant) {
      case 'primary':
        return glass.medium
      case 'secondary':
        return glass.light
      case 'accent':
        return glass.tinted
      default:
        return glass.medium
    }
  }};
  
  /* Backdrop filter for blur effect */
  backdrop-filter: ${props => props.$theme.effects.blur[props.$blur]};
  -webkit-backdrop-filter: ${props => props.$theme.effects.blur[props.$blur]};
  
  /* Border styling */
  border: ${props => {
    switch (props.$variant) {
      case 'accent':
        return props.$theme.effects.borders.accent
      case 'secondary':
        return props.$theme.effects.borders.subtle
      default:
        return props.$theme.effects.borders.glass
    }
  }};
  
  /* Border radius for rounded corners */
  border-radius: 16px;
  
  /* Box shadow for depth */
  box-shadow: ${props => {
    switch (props.$variant) {
      case 'accent':
        return props.$theme.effects.shadows.colored
      case 'secondary':
        return props.$theme.effects.shadows.subtle
      default:
        return props.$theme.effects.shadows.medium
    }
  }};
  
  /* Opacity control */
  opacity: ${props => props.$opacity};
  
  /* Positioning and layout */
  position: relative;
  overflow: hidden;
  
  /* Smooth transitions */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  /* Interactive states */
  ${props => props.onClick && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.$theme.effects.shadows.strong};
      background: ${props.$variant === 'accent' 
        ? props.$theme.colors.glass.strong 
        : props.$theme.colors.glass.medium};
    }
    
    &:active {
      transform: translateY(0);
      transition: all 0.1s ease;
    }
  `}
  
  /* Focus styles for accessibility */
  &:focus {
    outline: 2px solid ${props => props.$theme.colors.accent};
    outline-offset: 2px;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    border-radius: 12px;
    
    ${props => props.onClick && `
      &:hover {
        transform: none; /* Disable hover transform on mobile */
      }
      
      &:active {
        transform: scale(0.98);
      }
    `}
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border: 2px solid ${props => props.$theme.colors.neutral[400]};
    background: ${props => props.$theme.colors.surface};
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover {
      transform: none;
    }
  }
  
  /* Performance optimizations */
  will-change: transform, box-shadow;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
`

/**
 * GlassCard component
 * A reusable glassmorphism card component with blur effects and transparency
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'primary',
  blur = 'medium',
  opacity = 1,
  className,
  onClick,
  style,
  role,
  tabIndex,
  'aria-label': ariaLabel,
  ...props
}) => {
  const theme = useGlassmorphismTheme()
  
  // Handle keyboard interaction for accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }
  
  return (
    <StyledGlassCard
      $variant={variant}
      $blur={blur}
      $opacity={opacity}
      $theme={theme}
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={style}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={tabIndex || (onClick ? 0 : undefined)}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </StyledGlassCard>
  )
}

// Preset variants for common use cases
export const GlassCardPrimary: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="primary" {...props} />
)

export const GlassCardSecondary: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="secondary" {...props} />
)

export const GlassCardAccent: React.FC<Omit<GlassCardProps, 'variant'>> = (props) => (
  <GlassCard variant="accent" {...props} />
)

// Utility function to create glass card styles for other components
export const createGlassCardStyles = (
  theme: any,
  variant: 'primary' | 'secondary' | 'accent' = 'primary',
  blur: 'light' | 'medium' | 'strong' = 'medium'
) => {
  const { glass } = theme.colors
  const background = variant === 'primary' ? glass.medium : 
                    variant === 'secondary' ? glass.light : glass.tinted
  
  return {
    background,
    backdropFilter: theme.effects.blur[blur],
    WebkitBackdropFilter: theme.effects.blur[blur],
    border: variant === 'accent' ? theme.effects.borders.accent : 
            variant === 'secondary' ? theme.effects.borders.subtle : 
            theme.effects.borders.glass,
    borderRadius: '16px',
    boxShadow: variant === 'accent' ? theme.effects.shadows.colored :
               variant === 'secondary' ? theme.effects.shadows.subtle :
               theme.effects.shadows.medium
  }
}