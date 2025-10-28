/**
 * Glassmorphism Browser Compatibility
 * ブラウザ互換性の確保とフォールバック対応
 */

interface BrowserInfo {
  name: string
  version: number
  engine: string
  supportsBackdropFilter: boolean
  supportsCSSGrid: boolean
  supportsFlexbox: boolean
  supportsCustomProperties: boolean
  supportsWebFonts: boolean
  isMobile: boolean
  isLowEnd: boolean
}

interface CompatibilityFeatures {
  backdropFilter: boolean
  cssGrid: boolean
  flexbox: boolean
  customProperties: boolean
  webFonts: boolean
  transforms3d: boolean
  willChange: boolean
  contain: boolean
}

interface FallbackStyles {
  background: string
  border: string
  boxShadow: string
  borderRadius: string
  opacity: string
}

class GlassmorphismBrowserCompatibility {
  private browserInfo: BrowserInfo
  private features: CompatibilityFeatures
  // private fallbackStylesCache = new Map<string, FallbackStyles>()

  constructor() {
    this.browserInfo = this.detectBrowser()
    this.features = this.detectFeatures()
    this.init()
  }

  private init(): void {
    this.applyBrowserSpecificFixes()
    this.setupFeatureDetection()
    this.loadPolyfills()
    this.setupFallbackStyles()
  }

  /**
   * ブラウザ検出
   */
  private detectBrowser(): BrowserInfo {
    const userAgent = navigator.userAgent
    // const vendor = navigator.vendor || ''

    let name = 'Unknown'
    let version = 0
    let engine = 'Unknown'

    // Chrome/Chromium系
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      name = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      version = match ? parseInt(match[1]) : 0
      engine = 'Blink'
    }
    // Edge (Chromium)
    else if (userAgent.includes('Edg')) {
      name = 'Edge'
      const match = userAgent.match(/Edg\/(\d+)/)
      version = match ? parseInt(match[1]) : 0
      engine = 'Blink'
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      version = match ? parseInt(match[1]) : 0
      engine = 'Gecko'
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      version = match ? parseInt(match[1]) : 0
      engine = 'WebKit'
    }

    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const isLowEnd = this.detectLowEndDevice()

    return {
      name,
      version,
      engine,
      supportsBackdropFilter: this.testBackdropFilter(),
      supportsCSSGrid: this.testCSSGrid(),
      supportsFlexbox: this.testFlexbox(),
      supportsCustomProperties: this.testCustomProperties(),
      supportsWebFonts: this.testWebFonts(),
      isMobile,
      isLowEnd,
    }
  }

  /**
   * 機能検出
   */
  private detectFeatures(): CompatibilityFeatures {
    return {
      backdropFilter: this.testBackdropFilter(),
      cssGrid: this.testCSSGrid(),
      flexbox: this.testFlexbox(),
      customProperties: this.testCustomProperties(),
      webFonts: this.testWebFonts(),
      transforms3d: this.testTransforms3D(),
      willChange: this.testWillChange(),
      contain: this.testContain(),
    }
  }

  /**
   * 機能テストメソッド
   */
  private testBackdropFilter(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return (
      CSS.supports('backdrop-filter', 'blur(1px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
    )
  }

  private testCSSGrid(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('display', 'grid')
  }

  private testFlexbox(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('display', 'flex')
  }

  private testCustomProperties(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('--test', '1')
  }

  private testWebFonts(): boolean {
    return 'fonts' in document
  }

  private testTransforms3D(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('transform', 'translate3d(0, 0, 0)')
  }

  private testWillChange(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('will-change', 'transform')
  }

  private testContain(): boolean {
    if (typeof CSS === 'undefined' || !CSS.supports) return false
    return CSS.supports('contain', 'layout')
  }

  /**
   * 低スペック端末の検出
   */
  private detectLowEndDevice(): boolean {
    // メモリ情報が利用可能な場合
    if ('deviceMemory' in navigator) {
      return (navigator as any).deviceMemory <= 2
    }

    // ハードウェア並行性が低い場合
    if ('hardwareConcurrency' in navigator) {
      return navigator.hardwareConcurrency <= 2
    }

    // 接続速度が遅い場合
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g'
      )
    }

    return false
  }

  /**
   * ブラウザ固有の修正適用
   */
  private applyBrowserSpecificFixes(): void {
    const root = document.documentElement

    // Safari固有の修正
    if (this.browserInfo.name === 'Safari') {
      root.classList.add('browser-safari')
      this.applySafariFixes()
    }

    // Firefox固有の修正
    if (this.browserInfo.name === 'Firefox') {
      root.classList.add('browser-firefox')
      this.applyFirefoxFixes()
    }

    // Chrome固有の修正
    if (this.browserInfo.name === 'Chrome') {
      root.classList.add('browser-chrome')
      this.applyChromeFixes()
    }

    // Edge固有の修正
    if (this.browserInfo.name === 'Edge') {
      root.classList.add('browser-edge')
      this.applyEdgeFixes()
    }

    // モバイル固有の修正
    if (this.browserInfo.isMobile) {
      root.classList.add('browser-mobile')
      this.applyMobileFixes()
    }

    // 低スペック端末の修正
    if (this.browserInfo.isLowEnd) {
      root.classList.add('browser-low-end')
      this.applyLowEndFixes()
    }
  }

  /**
   * Safari固有の修正
   */
  private applySafariFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Safari backdrop-filter optimization */
      .glass-card,
      .glass-button,
      .glass-modal {
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
      }
      
      /* Safari transform optimization */
      .glass-card,
      .glass-button {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
      }
      
      /* Safari font rendering */
      .glass-card,
      .glass-button,
      .glass-input {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Firefox固有の修正
   */
  private applyFirefoxFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Firefox backdrop-filter fallback */
      @-moz-document url-prefix() {
        .glass-card,
        .glass-button,
        .glass-modal {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
      }
      
      /* Firefox flexbox fixes */
      .glass-flex {
        display: -moz-box;
        display: -webkit-flex;
        display: flex;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Chrome固有の修正
   */
  private applyChromeFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Chrome backdrop-filter optimization */
      .glass-card,
      .glass-button,
      .glass-modal {
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      
      /* Chrome GPU acceleration */
      .glass-card,
      .glass-button {
        will-change: transform;
        transform: translateZ(0);
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Edge固有の修正
   */
  private applyEdgeFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Edge backdrop-filter support */
      @supports (-ms-backdrop-filter: blur(10px)) {
        .glass-card,
        .glass-button,
        .glass-modal {
          -ms-backdrop-filter: blur(12px);
        }
      }
      
      /* Edge flexbox fixes */
      .glass-flex {
        display: -ms-flexbox;
        display: flex;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * モバイル固有の修正
   */
  private applyMobileFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Mobile backdrop-filter optimization */
      .glass-card,
      .glass-button,
      .glass-modal {
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      
      /* Mobile touch optimization */
      .glass-button,
      .glass-card-interactive {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      
      /* Mobile font size adjustment */
      .glass-input {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 低スペック端末の修正
   */
  private applyLowEndFixes(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Low-end device optimizations */
      .glass-card,
      .glass-button,
      .glass-modal {
        backdrop-filter: blur(6px) !important;
        -webkit-backdrop-filter: blur(6px) !important;
        will-change: auto !important;
      }
      
      /* Disable expensive effects */
      .glass-card-interactive:hover {
        transform: none !important;
      }
      
      /* Reduce animation complexity */
      * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 機能検出クラスの設定
   */
  private setupFeatureDetection(): void {
    const root = document.documentElement

    // backdrop-filter support
    if (this.features.backdropFilter) {
      root.classList.add('supports-backdrop-filter')
    } else {
      root.classList.add('no-backdrop-filter')
    }

    // CSS Grid support
    if (this.features.cssGrid) {
      root.classList.add('supports-css-grid')
    } else {
      root.classList.add('no-css-grid')
    }

    // Flexbox support
    if (this.features.flexbox) {
      root.classList.add('supports-flexbox')
    } else {
      root.classList.add('no-flexbox')
    }

    // Custom properties support
    if (this.features.customProperties) {
      root.classList.add('supports-custom-properties')
    } else {
      root.classList.add('no-custom-properties')
    }

    // Web fonts support
    if (this.features.webFonts) {
      root.classList.add('supports-web-fonts')
    } else {
      root.classList.add('no-web-fonts')
    }
  }

  /**
   * ポリフィルの読み込み
   */
  private loadPolyfills(): void {
    // CSS Custom Properties polyfill for IE
    if (!this.features.customProperties) {
      this.loadCSSCustomPropertiesPolyfill()
    }

    // Flexbox polyfill for older browsers
    if (!this.features.flexbox) {
      this.loadFlexboxPolyfill()
    }

    // Web Fonts polyfill
    if (!this.features.webFonts) {
      this.loadWebFontsPolyfill()
    }
  }

  /**
   * フォールバックスタイルの設定
   */
  private setupFallbackStyles(): void {
    if (!this.features.backdropFilter) {
      this.createBackdropFilterFallback()
    }

    if (!this.features.cssGrid) {
      this.createCSSGridFallback()
    }

    if (!this.features.customProperties) {
      this.createCustomPropertiesFallback()
    }
  }

  /**
   * backdrop-filterフォールバックの作成
   */
  private createBackdropFilterFallback(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* Backdrop filter fallback */
      .glass-card,
      .glass-button,
      .glass-input,
      .glass-modal {
        background: rgba(255, 255, 255, 0.85) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
      
      .glass-card-primary {
        background: rgba(254, 247, 247, 0.9) !important;
      }
      
      .glass-card-secondary {
        background: rgba(255, 255, 255, 0.7) !important;
      }
      
      .glass-modal {
        background: rgba(255, 255, 255, 0.95) !important;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * CSS Gridフォールバックの作成
   */
  private createCSSGridFallback(): void {
    const style = document.createElement('style')
    style.textContent = `
      /* CSS Grid fallback using flexbox */
      .glass-grid {
        display: -webkit-flex;
        display: -ms-flexbox;
        display: flex;
        -webkit-flex-wrap: wrap;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
      }
      
      .glass-grid > * {
        -webkit-flex: 1 1 300px;
        -ms-flex: 1 1 300px;
        flex: 1 1 300px;
        margin: 8px;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * CSS Custom Propertiesフォールバックの作成
   */
  private createCustomPropertiesFallback(): void {
    const fallbackValues = {
      '--glass-primary-500': '#e06666',
      '--glass-neutral-0': '#ffffff',
      '--glass-neutral-100': '#f5f5f5',
      '--glass-radius-lg': '16px',
      '--glass-space-4': '1rem',
      '--glass-shadow-medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
    }

    const style = document.createElement('style')
    let css = '/* CSS Custom Properties fallback */\n'

    Object.entries(fallbackValues).forEach(([property, value]) => {
      const className = property.replace('--', '').replace(/-/g, '_')
      css += `.fallback_${className} { ${property.replace('--', '')}: ${value}; }\n`
    })

    style.textContent = css
    document.head.appendChild(style)
  }

  /**
   * ポリフィル読み込みメソッド
   */
  private loadCSSCustomPropertiesPolyfill(): void {
    // CSS Custom Properties polyfill implementation
    console.log('Loading CSS Custom Properties polyfill')
  }

  private loadFlexboxPolyfill(): void {
    // Flexbox polyfill implementation
    console.log('Loading Flexbox polyfill')
  }

  private loadWebFontsPolyfill(): void {
    // Web Fonts polyfill implementation
    console.log('Loading Web Fonts polyfill')
  }

  /**
   * フォント読み込みの最適化
   */
  public optimizeFontLoading(): void {
    // Google Fonts preconnect
    const preconnectLink = document.createElement('link')
    preconnectLink.rel = 'preconnect'
    preconnectLink.href = 'https://fonts.googleapis.com'
    document.head.appendChild(preconnectLink)

    const preconnectGstaticLink = document.createElement('link')
    preconnectGstaticLink.rel = 'preconnect'
    preconnectGstaticLink.href = 'https://fonts.gstatic.com'
    preconnectGstaticLink.crossOrigin = 'anonymous'
    document.head.appendChild(preconnectGstaticLink)

    // Font display optimization
    const style = document.createElement('style')
    style.textContent = `
      @font-face {
        font-family: 'M PLUS Rounded 1c';
        font-display: swap;
        src: url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap');
      }
    `
    document.head.appendChild(style)

    // Font loading detection
    if (this.features.webFonts && 'fonts' in document) {
      document.fonts.ready.then(() => {
        document.documentElement.classList.add('fonts-loaded')
      })
    }
  }

  /**
   * パフォーマンス監視
   */
  public monitorPerformance(): void {
    if ('performance' in window && 'observe' in PerformanceObserver.prototype) {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'paint') {
            console.log(`${entry.name}: ${entry.startTime}ms`)
          }
        })
      })

      observer.observe({ entryTypes: ['paint', 'layout-shift'] })
    }
  }

  /**
   * 互換性情報の取得
   */
  public getCompatibilityInfo(): {
    browser: BrowserInfo
    features: CompatibilityFeatures
    recommendations: string[]
  } {
    const recommendations: string[] = []

    if (!this.features.backdropFilter) {
      recommendations.push(
        'backdrop-filter is not supported. Using fallback styles.'
      )
    }

    if (!this.features.cssGrid) {
      recommendations.push('CSS Grid is not supported. Using flexbox fallback.')
    }

    if (!this.features.customProperties) {
      recommendations.push(
        'CSS Custom Properties are not supported. Using fallback values.'
      )
    }

    if (this.browserInfo.isLowEnd) {
      recommendations.push(
        'Low-end device detected. Performance optimizations applied.'
      )
    }

    return {
      browser: this.browserInfo,
      features: this.features,
      recommendations,
    }
  }
}

// シングルトンインスタンス
let compatibilityInstance: GlassmorphismBrowserCompatibility | null = null

/**
 * ブラウザ互換性の初期化
 */
export const initializeGlassmorphismCompatibility =
  (): GlassmorphismBrowserCompatibility => {
    if (!compatibilityInstance) {
      compatibilityInstance = new GlassmorphismBrowserCompatibility()
    }
    return compatibilityInstance
  }

/**
 * 互換性情報の取得
 */
export const getGlassmorphismCompatibilityInfo = () => {
  if (!compatibilityInstance) {
    compatibilityInstance = new GlassmorphismBrowserCompatibility()
  }
  return compatibilityInstance.getCompatibilityInfo()
}

/**
 * フォント読み込みの最適化
 */
export const optimizeGlassmorphismFontLoading = (): void => {
  if (!compatibilityInstance) {
    compatibilityInstance = new GlassmorphismBrowserCompatibility()
  }
  compatibilityInstance.optimizeFontLoading()
}

export { GlassmorphismBrowserCompatibility }
export type { BrowserInfo, CompatibilityFeatures, FallbackStyles }
