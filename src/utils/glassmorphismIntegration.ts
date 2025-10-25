/**
 * Glassmorphism Integration Utility
 * Provides helper functions for integrating glassmorphism design system
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { GlassmorphismTheme } from '../components/GlassmorphismThemeProvider'

// CSS class name generator for glassmorphism components
export const glassmorphismClasses = {
  // Card variants
  card: {
    primary: 'glass-card glass-card-primary',
    secondary: 'glass-card glass-card-secondary',
    accent: 'glass-card glass-card-accent',
    interactive: 'glass-card glass-card-interactive'
  },
  
  // Button variants
  button: {
    default: 'glass-button',
    primary: 'glass-button glass-button-primary'
  },
  
  // Input variants
  input: {
    default: 'glass-input'
  },
  
  // Modal variants
  modal: {
    overlay: 'glass-modal-overlay',
    content: 'glass-modal'
  },
  
  // Typography variants
  typography: {
    h1: 'glass-typography-h1',
    h2: 'glass-typography-h2',
    h3: 'glass-typography-h3',
    h4: 'glass-typography-h4',
    h5: 'glass-typography-h5',
    h6: 'glass-typography-h6',
    body1: 'glass-typography-body1',
    body2: 'glass-typography-body2',
    caption: 'glass-typography-caption',
    button: 'glass-typography-button'
  },
  
  // Utility classes
  utils: {
    blur: {
      light: 'glass-blur-light',
      medium: 'glass-blur-medium',
      strong: 'glass-blur-strong'
    },
    background: {
      light: 'glass-bg-light',
      medium: 'glass-bg-medium',
      strong: 'glass-bg-strong',
      tinted: 'glass-bg-tinted'
    },
    border: {
      default: 'glass-border',
      subtle: 'glass-border-subtle',
      accent: 'glass-border-accent'
    },
    shadow: {
      subtle: 'glass-shadow-subtle',
      medium: 'glass-shadow-medium',
      strong: 'glass-shadow-strong',
      colored: 'glass-shadow-colored'
    },
    radius: {
      sm: 'glass-radius-sm',
      md: 'glass-radius-md',
      lg: 'glass-radius-lg',
      xl: 'glass-radius-xl',
      '2xl': 'glass-radius-2xl'
    },
    text: {
      primary: 'glass-text-primary',
      secondary: 'glass-text-secondary',
      onGlass: 'glass-text-on-glass',
      accent: 'glass-text-accent'
    },
    layout: {
      container: 'glass-container',
      section: 'glass-section',
      grid: 'glass-grid',
      flex: 'glass-flex',
      flexCenter: 'glass-flex-center'
    },
    optimize: 'glass-optimize'
  }
}

// CSS-in-JS style generator for glassmorphism effects
export const createGlassmorphismStyles = (theme: GlassmorphismTheme) => ({
  // Card styles
  card: {
    primary: {
      background: theme.colors.glass.medium,
      backdropFilter: theme.effects.blur.medium,
      WebkitBackdropFilter: theme.effects.blur.medium,
      border: theme.effects.borders.glass,
      borderRadius: '16px',
      boxShadow: theme.effects.shadows.medium,
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    secondary: {
      background: theme.colors.glass.light,
      backdropFilter: theme.effects.blur.light,
      WebkitBackdropFilter: theme.effects.blur.light,
      border: theme.effects.borders.subtle,
      borderRadius: '16px',
      boxShadow: theme.effects.shadows.subtle,
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    accent: {
      background: theme.colors.glass.tinted,
      backdropFilter: theme.effects.blur.medium,
      WebkitBackdropFilter: theme.effects.blur.medium,
      border: theme.effects.borders.accent,
      borderRadius: '16px',
      boxShadow: theme.effects.shadows.colored,
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
  },
  
  // Button styles
  button: {
    default: {
      background: theme.colors.glass.medium,
      backdropFilter: theme.effects.blur.medium,
      WebkitBackdropFilter: theme.effects.blur.medium,
      border: theme.effects.borders.glass,
      borderRadius: '16px',
      padding: '12px 24px',
      color: theme.colors.text.onGlass,
      fontFamily: theme.typography.fontFamily,
      fontWeight: theme.typography.fontWeights.medium,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none',
      outline: 'none'
    },
    primary: {
      background: theme.colors.glass.tinted,
      border: theme.effects.borders.accent,
      color: theme.colors.accent
    }
  },
  
  // Input styles
  input: {
    default: {
      background: theme.colors.glass.light,
      backdropFilter: theme.effects.blur.light,
      WebkitBackdropFilter: theme.effects.blur.light,
      border: theme.effects.borders.subtle,
      borderRadius: '12px',
      padding: '12px 16px',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily,
      fontSize: '1rem',
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      outline: 'none',
      width: '100%'
    }
  },
  
  // Typography styles
  typography: {
    h1: {
      fontFamily: theme.typography.fontFamily,
      fontSize: 'clamp(2rem, 5vw, 3.2rem)',
      fontWeight: theme.typography.fontWeights.bold,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
      color: theme.colors.text.primary,
      margin: 0
    },
    h2: {
      fontFamily: theme.typography.fontFamily,
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      fontWeight: theme.typography.fontWeights.bold,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: theme.colors.text.primary,
      margin: 0
    },
    h3: {
      fontFamily: theme.typography.fontFamily,
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      fontWeight: theme.typography.fontWeights.medium,
      lineHeight: 1.4,
      color: theme.colors.text.primary,
      margin: 0
    },
    body1: {
      fontFamily: theme.typography.fontFamily,
      fontSize: '1rem',
      fontWeight: theme.typography.fontWeights.regular,
      lineHeight: 1.6,
      color: theme.colors.text.primary,
      margin: 0
    },
    body2: {
      fontFamily: theme.typography.fontFamily,
      fontSize: '0.875rem',
      fontWeight: theme.typography.fontWeights.regular,
      lineHeight: 1.6,
      color: theme.colors.text.secondary,
      margin: 0
    }
  }
})

// Utility function to combine glassmorphism classes
export const combineGlassClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Utility function to apply glassmorphism theme to existing components
export const applyGlassmorphismTheme = (element: HTMLElement, variant: 'card' | 'button' | 'input' = 'card'): void => {
  const baseClasses = {
    card: glassmorphismClasses.card.primary,
    button: glassmorphismClasses.button.default,
    input: glassmorphismClasses.input.default
  }
  
  element.className = combineGlassClasses(element.className, baseClasses[variant])
}

// CSS custom properties injection for runtime theme changes
export const injectGlassmorphismCSSProperties = (theme: GlassmorphismTheme): void => {
  const root = document.documentElement
  
  // Primary colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    root.style.setProperty(`--glass-primary-${key}`, value)
  })
  
  // Neutral colors
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    root.style.setProperty(`--glass-neutral-${key}`, value)
  })
  
  // Glass effects
  Object.entries(theme.colors.glass).forEach(([key, value]) => {
    root.style.setProperty(`--glass-${key}`, value)
  })
  
  // Text colors
  Object.entries(theme.colors.text).forEach(([key, value]) => {
    root.style.setProperty(`--glass-text-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
  })
  
  // Background and surface colors
  root.style.setProperty('--glass-background', theme.colors.background)
  root.style.setProperty('--glass-surface', theme.colors.surface)
  root.style.setProperty('--glass-accent', theme.colors.accent)
  
  // Blur effects
  Object.entries(theme.effects.blur).forEach(([key, value]) => {
    root.style.setProperty(`--glass-blur-${key}`, value)
  })
  
  // Shadows
  Object.entries(theme.effects.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--glass-shadow-${key}`, value)
  })
  
  // Borders
  Object.entries(theme.effects.borders).forEach(([key, value]) => {
    root.style.setProperty(`--glass-border-${key}`, value)
  })
  
  // Typography
  root.style.setProperty('--font-family-primary', theme.typography.fontFamily)
  Object.entries(theme.typography.fontWeights).forEach(([key, value]) => {
    root.style.setProperty(`--font-weight-${key}`, value.toString())
  })
}

// Feature detection for backdrop-filter support
export const supportsBackdropFilter = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return CSS.supports('backdrop-filter', 'blur(1px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
}

// Fallback styles for browsers that don't support backdrop-filter
export const getFallbackStyles = (theme: GlassmorphismTheme) => ({
  card: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.neutral[200]}`,
    boxShadow: theme.effects.shadows.medium
  },
  button: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.neutral[300]}`
  },
  input: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.neutral[200]}`
  }
})

// Performance optimization utilities
export const optimizeGlassmorphismPerformance = (): void => {
  // Add will-change property to glassmorphism elements
  const glassElements = document.querySelectorAll('.glass-card, .glass-button, .glass-input')
  
  glassElements.forEach(element => {
    const htmlElement = element as HTMLElement
    htmlElement.style.willChange = 'transform, opacity'
    htmlElement.style.backfaceVisibility = 'hidden'
    htmlElement.style.transform = 'translateZ(0)'
  })
}

// Initialize glassmorphism system
export const initializeGlassmorphismSystem = (theme?: GlassmorphismTheme): void => {
  // Inject CSS properties if theme is provided
  if (theme) {
    injectGlassmorphismCSSProperties(theme)
  }
  
  // Apply performance optimizations
  optimizeGlassmorphismPerformance()
  
  // Add feature detection classes
  const root = document.documentElement
  if (supportsBackdropFilter()) {
    root.classList.add('supports-backdrop-filter')
  } else {
    root.classList.add('no-backdrop-filter')
  }
  
  console.log('✨ Glassmorphism design system initialized')
}