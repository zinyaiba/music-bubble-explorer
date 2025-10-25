/**
 * Font Loading Utility for M PLUS Rounded 1c
 * Provides font loading detection and fallback management
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

// Font loading status
export type FontLoadingStatus = 'loading' | 'loaded' | 'error' | 'timeout'

// Font loading configuration
interface FontLoadingConfig {
  fontFamily: string
  weights: number[]
  timeout: number
  fallbackFonts: string[]
}

// Default configuration for M PLUS Rounded 1c
const DEFAULT_CONFIG: FontLoadingConfig = {
  fontFamily: 'M PLUS Rounded 1c',
  weights: [300, 400, 500, 700],
  timeout: 3000, // 3 seconds
  fallbackFonts: [
    'Hiragino Sans',
    'Hiragino Kaku Gothic ProN',
    'Noto Sans JP',
    'Yu Gothic',
    'Meiryo',
    'sans-serif'
  ]
}

// Font loading event listeners
type FontLoadingListener = (status: FontLoadingStatus) => void

class FontLoader {
  private static instance: FontLoader
  private config: FontLoadingConfig
  private status: FontLoadingStatus = 'loading'
  private listeners: FontLoadingListener[] = []
  private loadingPromise: Promise<void> | null = null

  private constructor(config: FontLoadingConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  public static getInstance(config?: FontLoadingConfig): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader(config)
    }
    return FontLoader.instance
  }

  /**
   * Load M PLUS Rounded 1c font with fallback handling
   */
  public async loadFont(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = this.performFontLoading()
    return this.loadingPromise
  }

  private async performFontLoading(): Promise<void> {
    try {
      // Check if Font Loading API is supported
      if ('fonts' in document) {
        await this.loadWithFontAPI()
      } else {
        // Fallback to CSS-based detection
        await this.loadWithCSSDetection()
      }
    } catch (error) {
      console.warn('Font loading failed:', error)
      this.setStatus('error')
    }
  }

  /**
   * Load font using Font Loading API
   */
  private async loadWithFontAPI(): Promise<void> {
    const fontPromises = this.config.weights.map(weight => {
      const fontFace = new FontFace(
        this.config.fontFamily,
        `url(https://fonts.gstatic.com/s/mplusrounded1c/v15/VdGCAYIAV6gnpUpoWwNkYvrugw9RuM${this.getFontUrlSuffix(weight)}ixLsg.woff2)`,
        { weight: weight.toString() }
      )
      
      return fontFace.load()
    })

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Font loading timeout')), this.config.timeout)
      })

      const loadedFonts = await Promise.race([
        Promise.all(fontPromises),
        timeoutPromise
      ])

      // Add loaded fonts to document
      loadedFonts.forEach(font => {
        document.fonts.add(font)
      })

      this.setStatus('loaded')
    } catch (error) {
      if (error instanceof Error && error.message === 'Font loading timeout') {
        this.setStatus('timeout')
      } else {
        this.setStatus('error')
      }
      throw error
    }
  }

  /**
   * Load font using CSS-based detection (fallback method)
   */
  private async loadWithCSSDetection(): Promise<void> {
    return new Promise((resolve, reject) => {
      const testElement = document.createElement('div')
      testElement.style.fontFamily = this.config.fallbackFonts.join(', ')
      testElement.style.fontSize = '100px'
      testElement.style.position = 'absolute'
      testElement.style.left = '-9999px'
      testElement.style.top = '-9999px'
      testElement.style.visibility = 'hidden'
      testElement.textContent = 'あいうえおABCDE12345'
      
      document.body.appendChild(testElement)
      const fallbackWidth = testElement.offsetWidth

      // Apply target font
      testElement.style.fontFamily = `"${this.config.fontFamily}", ${this.config.fallbackFonts.join(', ')}`
      
      let attempts = 0
      const maxAttempts = this.config.timeout / 50 // Check every 50ms

      const checkFont = () => {
        attempts++
        const currentWidth = testElement.offsetWidth

        if (currentWidth !== fallbackWidth) {
          // Font has loaded
          document.body.removeChild(testElement)
          this.setStatus('loaded')
          resolve()
        } else if (attempts >= maxAttempts) {
          // Timeout
          document.body.removeChild(testElement)
          this.setStatus('timeout')
          reject(new Error('Font loading timeout'))
        } else {
          // Continue checking
          setTimeout(checkFont, 50)
        }
      }

      checkFont()
    })
  }

  /**
   * Get font URL suffix for different weights
   */
  private getFontUrlSuffix(weight: number): string {
    switch (weight) {
      case 300: return '3'
      case 400: return '0'
      case 500: return '2S'
      case 700: return '1q'
      default: return '0'
    }
  }

  /**
   * Set font loading status and notify listeners
   */
  private setStatus(status: FontLoadingStatus): void {
    this.status = status
    this.notifyListeners(status)
    
    // Update document class for CSS styling
    document.documentElement.classList.remove('font-loading', 'font-loaded', 'font-error', 'font-timeout')
    document.documentElement.classList.add(`font-${status}`)
  }

  /**
   * Add listener for font loading status changes
   */
  public addListener(listener: FontLoadingListener): void {
    this.listeners.push(listener)
  }

  /**
   * Remove listener for font loading status changes
   */
  public removeListener(listener: FontLoadingListener): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: FontLoadingStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Font loading listener error:', error)
      }
    })
  }

  /**
   * Get current font loading status
   */
  public getStatus(): FontLoadingStatus {
    return this.status
  }

  /**
   * Check if font is loaded
   */
  public isLoaded(): boolean {
    return this.status === 'loaded'
  }

  /**
   * Get font family string with fallbacks
   */
  public getFontFamilyString(): string {
    if (this.status === 'loaded') {
      return `"${this.config.fontFamily}", ${this.config.fallbackFonts.join(', ')}`
    }
    return this.config.fallbackFonts.join(', ')
  }

  /**
   * Preload font for better performance
   */
  public preloadFont(): void {
    // Create link elements for font preloading
    this.config.weights.forEach(weight => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.type = 'font/woff2'
      link.crossOrigin = 'anonymous'
      link.href = `https://fonts.gstatic.com/s/mplusrounded1c/v15/VdGCAYIAV6gnpUpoWwNkYvrugw9RuM${this.getFontUrlSuffix(weight)}ixLsg.woff2`
      
      document.head.appendChild(link)
    })
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance()

/**
 * Initialize font loading system
 */
export const initializeFontSystem = async (): Promise<void> => {
  try {
    // Set initial loading state
    document.documentElement.classList.add('font-loading')
    
    // Preload fonts for better performance
    fontLoader.preloadFont()
    
    // Load fonts
    await fontLoader.loadFont()
    
    console.log('✅ M PLUS Rounded 1c font loaded successfully')
  } catch (error) {
    console.warn('⚠️ Font loading failed, using fallback fonts:', error)
  }
}

/**
 * React hook for font loading status
 */
export const useFontLoading = (): FontLoadingStatus => {
  const [status, setStatus] = React.useState<FontLoadingStatus>(fontLoader.getStatus())
  
  React.useEffect(() => {
    const listener = (newStatus: FontLoadingStatus) => {
      setStatus(newStatus)
    }
    
    fontLoader.addListener(listener)
    
    return () => {
      fontLoader.removeListener(listener)
    }
  }, [])
  
  return status
}

// Import React for the hook
import React from 'react'