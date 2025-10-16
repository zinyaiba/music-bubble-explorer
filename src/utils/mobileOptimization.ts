/**
 * Mobile Optimization Utilities
 * Requirements: 9.2, 9.3, 4.1, 4.2, 4.3, 4.4
 */

export interface MobileOptimizationConfig {
  maxBubbles: number
  animationFPS: number
  touchTargetSize: number
  enableGPUAcceleration: boolean
  enableReducedMotion: boolean
}

export class MobileOptimizer {
  private static config: MobileOptimizationConfig = {
    maxBubbles: 20,
    animationFPS: 60,
    touchTargetSize: 44,
    enableGPUAcceleration: true,
    enableReducedMotion: false
  }

  /**
   * デバイスタイプの検出
   */
  static detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'

    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    
    if (isMobile && !isTablet) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }

  /**
   * 画面サイズに基づく最適化設定の取得
   */
  static getOptimizedConfig(): MobileOptimizationConfig {
    if (typeof window === 'undefined') return this.config

    const deviceType = this.detectDeviceType()
    const screenWidth = window.innerWidth
    const pixelRatio = window.devicePixelRatio || 1

    // デバイスタイプ別の最適化
    switch (deviceType) {
      case 'mobile':
        return {
          maxBubbles: screenWidth < 400 ? 15 : 20,
          animationFPS: pixelRatio > 2 ? 30 : 60,
          touchTargetSize: 48,
          enableGPUAcceleration: true,
          enableReducedMotion: this.shouldReduceMotion()
        }
      
      case 'tablet':
        return {
          maxBubbles: 30,
          animationFPS: 60,
          touchTargetSize: 44,
          enableGPUAcceleration: true,
          enableReducedMotion: this.shouldReduceMotion()
        }
      
      default:
        return {
          maxBubbles: 40,
          animationFPS: 60,
          touchTargetSize: 40,
          enableGPUAcceleration: true,
          enableReducedMotion: this.shouldReduceMotion()
        }
    }
  }

  /**
   * モーション削減設定の確認
   */
  static shouldReduceMotion(): boolean {
    if (typeof window === 'undefined') return false
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * タッチデバイスの検出
   */
  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false
    
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  /**
   * パフォーマンス監視
   */
  static monitorPerformance(): {
    fps: number
    memoryUsage: number
    isLowPerformance: boolean
  } {
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return { fps: 60, memoryUsage: 0, isLowPerformance: false }
    }

    // FPS計算（簡易版）
    let fps = 60
    if ('requestAnimationFrame' in window) {
      let lastTime = performance.now()
      let frameCount = 0
      
      const measureFPS = () => {
        const currentTime = performance.now()
        frameCount++
        
        if (currentTime - lastTime >= 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
          frameCount = 0
          lastTime = currentTime
        }
      }
      
      // 短時間のFPS測定
      for (let i = 0; i < 10; i++) {
        requestAnimationFrame(measureFPS)
      }
    }

    // メモリ使用量（利用可能な場合）
    let memoryUsage = 0
    if ('memory' in performance) {
      const memory = (performance as any).memory
      memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
    }

    // 低パフォーマンスデバイスの判定
    const isLowPerformance = fps < 30 || memoryUsage > 0.8

    return { fps, memoryUsage, isLowPerformance }
  }

  /**
   * 動的パフォーマンス調整
   */
  static adjustPerformance(): MobileOptimizationConfig {
    const baseConfig = this.getOptimizedConfig()
    const performance = this.monitorPerformance()

    if (performance.isLowPerformance) {
      return {
        ...baseConfig,
        maxBubbles: Math.max(baseConfig.maxBubbles * 0.6, 10),
        animationFPS: Math.max(baseConfig.animationFPS * 0.5, 30),
        enableReducedMotion: true
      }
    }

    return baseConfig
  }

  /**
   * CSS変数の動的設定
   */
  static applyCSSOptimizations(config: MobileOptimizationConfig): void {
    if (typeof document === 'undefined') return

    const root = document.documentElement

    root.style.setProperty('--max-bubbles', config.maxBubbles.toString())
    root.style.setProperty('--animation-fps', config.animationFPS.toString())
    root.style.setProperty('--touch-target-size', `${config.touchTargetSize}px`)

    if (config.enableGPUAcceleration) {
      root.classList.add('gpu-accelerated')
    }

    if (config.enableReducedMotion) {
      root.classList.add('reduced-motion')
    }
  }

  /**
   * ビューポート最適化
   */
  static optimizeViewport(): void {
    if (typeof document === 'undefined') return

    // ビューポートメタタグの確認・追加
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta')
      viewportMeta.name = 'viewport'
      document.head.appendChild(viewportMeta)
    }

    // モバイル最適化されたビューポート設定
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'

    // iOS Safari対応
    const iosMeta = document.createElement('meta')
    iosMeta.name = 'apple-mobile-web-app-capable'
    iosMeta.content = 'yes'
    document.head.appendChild(iosMeta)

    const iosStatusBar = document.createElement('meta')
    iosStatusBar.name = 'apple-mobile-web-app-status-bar-style'
    iosStatusBar.content = 'default'
    document.head.appendChild(iosStatusBar)
  }

  /**
   * 初期化
   */
  static initialize(): MobileOptimizationConfig {
    const config = this.adjustPerformance()
    this.applyCSSOptimizations(config)
    this.optimizeViewport()
    
    // パフォーマンス監視の開始
    if (typeof window !== 'undefined') {
      let monitoringInterval: NodeJS.Timeout
      
      const startMonitoring = () => {
        monitoringInterval = setInterval(() => {
          const currentPerformance = this.monitorPerformance()
          if (currentPerformance.isLowPerformance) {
            const adjustedConfig = this.adjustPerformance()
            this.applyCSSOptimizations(adjustedConfig)
          }
        }, 5000) // 5秒ごとにチェック
      }

      // ページ読み込み完了後に監視開始
      if (document.readyState === 'complete') {
        startMonitoring()
      } else {
        window.addEventListener('load', startMonitoring)
      }

      // クリーンアップ
      window.addEventListener('beforeunload', () => {
        if (monitoringInterval) {
          clearInterval(monitoringInterval)
        }
      })
    }

    return config
  }
}

/**
 * レスポンシブブレークポイント
 */
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
} as const

/**
 * 現在のブレークポイントを取得
 */
export function getCurrentBreakpoint(): keyof typeof BREAKPOINTS {
  if (typeof window === 'undefined') return 'desktop'
  
  const width = window.innerWidth
  
  if (width < BREAKPOINTS.mobile) return 'mobile'
  if (width < BREAKPOINTS.tablet) return 'tablet'
  return 'desktop'
}

/**
 * メディアクエリマッチャー
 */
export function createMediaQueryMatcher(query: string): {
  matches: boolean
  addListener: (callback: (e: MediaQueryListEvent) => void) => void
  removeListener: (callback: (e: MediaQueryListEvent) => void) => void
} {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {}
    }
  }

  const mediaQuery = window.matchMedia(query)
  
  return {
    matches: mediaQuery.matches,
    addListener: (callback) => {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', callback)
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(callback)
      }
    },
    removeListener: (callback) => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', callback)
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(callback)
      }
    }
  }
}