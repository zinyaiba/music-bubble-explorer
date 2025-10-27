import React, { createContext, useContext } from 'react'

// Glassmorphism theme interface based on design specifications
export interface GlassmorphismTheme {
  colors: {
    // Neutral Colors (白とグレー系)
    neutral: {
      0: string // 純白
      50: string // オフホワイト
      100: string // 薄いグレー
      200: string // 中間グレー
      300: string // やや濃いグレー
      400: string // 濃いグレー
      500: string // ダークグレー
    }

    // Glass Effects
    glass: {
      light: string
      medium: string
      strong: string
      tinted: string // 薄いピンクティント
    }

    // Text Colors
    text: {
      primary: string
      secondary: string
      onGlass: string
      disabled: string
      placeholder: string
    }

    // Background Colors
    background: {
      main: string
      glass: string
      disabled: string
      hover: string
    }
    surface: string
    accent: string

    // Border Colors
    border: {
      light: string
      medium: string
    }

    // Primary Colors Extended
    primary: {
      50: string // 最も薄いピンク
      100: string // 薄いピンク
      200: string // 中間ピンク
      300: string // やや濃いピンク
      400: string // 濃いピンク
      500: string // メインピンク
      main: string
      dark: string
      contrastText: string
    }

    // Status Colors
    success: {
      light: string
      main: string
      dark: string
    }

    warning: {
      light: string
      main: string
      dark: string
    }

    error: {
      light: string
      main: string
      dark: string
    }

    info: {
      light: string
      main: string
      dark: string
    }
  }

  effects: {
    blur: {
      light: string
      medium: string
      strong: string
    }

    shadows: {
      subtle: string
      medium: string
      strong: string
      colored: string // ピンクティントのシャドウ
    }

    borders: {
      glass: string
      subtle: string
      accent: string
    }
  }

  typography: {
    fontFamily: string
    fontWeights: {
      light: number
      regular: number
      medium: number
      semiBold: number
      bold: number
    }
  }

  borderRadius: {
    small: string
    medium: string
    large: string
  }
}

// Default glassmorphism theme based on design specifications
const defaultGlassmorphismTheme: GlassmorphismTheme = {
  colors: {
    // Primary Colors (淡いピンク系) - より薄く調整
    primary: {
      50: '#fffcfc', // 最も薄いピンク
      100: '#fef5f5', // 薄いピンク
      200: '#fce8e8', // 中間ピンク
      300: '#f8d1d1', // やや濃いピンク
      400: '#f3b4b4', // 濃いピンク
      500: '#ec8b8b', // メインピンク
      main: '#ec8b8b',
      dark: '#e06666',
      contrastText: '#ffffff',
    },

    // Status Colors
    success: {
      light: '#d1fae5',
      main: '#10b981',
      dark: '#047857',
    },

    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
    },

    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
    },

    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#1d4ed8',
    },

    // Neutral Colors (白とグレー系)
    neutral: {
      0: '#ffffff', // 純白
      50: '#fafafa', // オフホワイト
      100: '#f5f5f5', // 薄いグレー
      200: '#e5e5e5', // 中間グレー
      300: '#d4d4d4', // やや濃いグレー
      400: '#a3a3a3', // 濃いグレー
      500: '#737373', // ダークグレー
    },

    // Glass Effects
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      strong: 'rgba(255, 255, 255, 0.3)',
      tinted: 'rgba(254, 247, 247, 0.2)', // 薄いピンクティント
    },

    // Text Colors
    text: {
      primary: '#374151',
      secondary: '#6b7280',
      onGlass: '#1f2937',
      disabled: '#9ca3af',
      placeholder: '#9ca3af',
    },

    // Background Colors
    background: {
      main: 'linear-gradient(135deg, #fffcfc 0%, #fef5f5 50%, #fce8e8 100%)',
      glass: 'rgba(255, 255, 255, 0.2)',
      disabled: 'rgba(156, 163, 175, 0.1)',
      hover: 'rgba(255, 255, 255, 0.3)',
    },
    surface: '#ffffff',
    accent: '#e06666',

    // Border Colors
    border: {
      light: 'rgba(255, 255, 255, 0.2)',
      medium: 'rgba(255, 255, 255, 0.3)',
    },
  },

  effects: {
    blur: {
      light: 'blur(8px)',
      medium: 'blur(12px)',
      strong: 'blur(20px)',
    },

    shadows: {
      subtle: '0 2px 8px rgba(0, 0, 0, 0.05)',
      medium: '0 4px 16px rgba(0, 0, 0, 0.1)',
      strong: '0 8px 32px rgba(0, 0, 0, 0.15)',
      colored: '0 4px 16px rgba(224, 102, 102, 0.1)', // ピンクティントのシャドウ
    },

    borders: {
      glass: '1px solid rgba(255, 255, 255, 0.2)',
      subtle: '1px solid rgba(255, 255, 255, 0.1)',
      accent: '1px solid rgba(224, 102, 102, 0.2)',
    },
  },

  typography: {
    fontFamily:
      '"M PLUS Rounded 1c", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
  },

  borderRadius: {
    small: '6px',
    medium: '12px',
    large: '16px',
  },
}

// Create context for glassmorphism theme
const GlassmorphismThemeContext = createContext<GlassmorphismTheme>(
  defaultGlassmorphismTheme
)

// Props interface for the theme provider
export interface GlassmorphismThemeProviderProps {
  children: React.ReactNode
  theme?: Partial<GlassmorphismTheme>
}

/**
 * GlassmorphismThemeProvider component
 * Provides glassmorphism theme context to all child components
 *
 * Requirements: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.5
 */
export const GlassmorphismThemeProvider: React.FC<
  GlassmorphismThemeProviderProps
> = ({ children, theme = {} }) => {
  // Merge custom theme with default theme
  const mergedTheme: GlassmorphismTheme = {
    colors: {
      ...defaultGlassmorphismTheme.colors,
      ...theme.colors,
      primary: {
        ...defaultGlassmorphismTheme.colors.primary,
        ...theme.colors?.primary,
      },
      neutral: {
        ...defaultGlassmorphismTheme.colors.neutral,
        ...theme.colors?.neutral,
      },
      glass: {
        ...defaultGlassmorphismTheme.colors.glass,
        ...theme.colors?.glass,
      },
      text: {
        ...defaultGlassmorphismTheme.colors.text,
        ...theme.colors?.text,
      },
      background: {
        ...defaultGlassmorphismTheme.colors.background,
        ...theme.colors?.background,
      },
      border: {
        ...defaultGlassmorphismTheme.colors.border,
        ...theme.colors?.border,
      },
      success: {
        ...defaultGlassmorphismTheme.colors.success,
        ...theme.colors?.success,
      },
      warning: {
        ...defaultGlassmorphismTheme.colors.warning,
        ...theme.colors?.warning,
      },
      error: {
        ...defaultGlassmorphismTheme.colors.error,
        ...theme.colors?.error,
      },
      info: {
        ...defaultGlassmorphismTheme.colors.info,
        ...theme.colors?.info,
      },
    },
    effects: {
      ...defaultGlassmorphismTheme.effects,
      ...theme.effects,
      blur: {
        ...defaultGlassmorphismTheme.effects.blur,
        ...theme.effects?.blur,
      },
      shadows: {
        ...defaultGlassmorphismTheme.effects.shadows,
        ...theme.effects?.shadows,
      },
      borders: {
        ...defaultGlassmorphismTheme.effects.borders,
        ...theme.effects?.borders,
      },
    },
    typography: {
      ...defaultGlassmorphismTheme.typography,
      ...theme.typography,
      fontWeights: {
        ...defaultGlassmorphismTheme.typography.fontWeights,
        ...theme.typography?.fontWeights,
      },
    },
    borderRadius: {
      ...defaultGlassmorphismTheme.borderRadius,
      ...theme.borderRadius,
    },
  }

  return (
    <GlassmorphismThemeContext.Provider value={mergedTheme}>
      {children}
    </GlassmorphismThemeContext.Provider>
  )
}

/**
 * Hook to use glassmorphism theme
 * @returns GlassmorphismTheme object
 */
export const useGlassmorphismTheme = (): GlassmorphismTheme => {
  const context = useContext(GlassmorphismThemeContext)

  if (!context) {
    throw new Error(
      'useGlassmorphismTheme must be used within a GlassmorphismThemeProvider'
    )
  }

  return context
}

/**
 * Higher-order component to inject glassmorphism theme as props
 */
export const withGlassmorphismTheme = <P extends object>(
  Component: React.ComponentType<P & { theme: GlassmorphismTheme }>
) => {
  return (props: P) => {
    const theme = useGlassmorphismTheme()
    return <Component {...props} theme={theme} />
  }
}
