/**
 * レスポンシブデザインユーティリティ
 * Requirements: 11.1, 12.1 - レスポンシブデザインの調整
 */

export interface ResponsiveBreakpoints {
  mobileSmall: number
  mobile: number
  tablet: number
  desktop: number
  desktopLarge: number
}

export const BREAKPOINTS: ResponsiveBreakpoints = {
  mobileSmall: 480,
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  desktopLarge: 1440
}

/**
 * メディアクエリ文字列を生成
 */
export const mediaQuery = {
  mobileSmall: `(max-width: ${BREAKPOINTS.mobileSmall}px)`,
  mobile: `(max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.tablet + 1}px) and (max-width: ${BREAKPOINTS.desktop}px)`,
  desktopLarge: `(min-width: ${BREAKPOINTS.desktop + 1}px)`,
  
  // 範囲指定
  mobileAndUp: `(min-width: ${BREAKPOINTS.mobile + 1}px)`,
  tabletAndUp: `(min-width: ${BREAKPOINTS.tablet + 1}px)`,
  desktopAndUp: `(min-width: ${BREAKPOINTS.desktop + 1}px)`,
  
  // オリエンテーション
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  
  // タッチデバイス
  touch: '(hover: none) and (pointer: coarse)',
  noTouch: '(hover: hover) and (pointer: fine)',
  
  // 高解像度
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  
  // アクセシビリティ
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(prefers-contrast: high)',
  darkMode: '(prefers-color-scheme: dark)'
}

/**
 * 現在の画面サイズカテゴリを取得
 */
export const getCurrentScreenCategory = (width: number): keyof ResponsiveBreakpoints => {
  if (width <= BREAKPOINTS.mobileSmall) return 'mobileSmall'
  if (width <= BREAKPOINTS.mobile) return 'mobile'
  if (width <= BREAKPOINTS.tablet) return 'tablet'
  if (width <= BREAKPOINTS.desktop) return 'desktop'
  return 'desktopLarge'
}

/**
 * レスポンシブ値の計算
 */
export interface ResponsiveValue<T> {
  mobileSmall?: T
  mobile?: T
  tablet?: T
  desktop?: T
  desktopLarge?: T
  default: T
}

export const getResponsiveValue = <T>(
  values: ResponsiveValue<T>,
  screenCategory: keyof ResponsiveBreakpoints
): T => {
  return values[screenCategory] ?? values.default
}

/**
 * フォントサイズの計算
 */
export const calculateResponsiveFontSize = (
  baseSize: number,
  screenCategory: keyof ResponsiveBreakpoints,
  scaleFactor: number = 1
): number => {
  const scaleFactors: Record<keyof ResponsiveBreakpoints, number> = {
    mobileSmall: 0.85,
    mobile: 0.9,
    tablet: 0.95,
    desktop: 1,
    desktopLarge: 1.1
  }
  
  return baseSize * scaleFactors[screenCategory] * scaleFactor
}

/**
 * スペーシングの計算
 */
export const calculateResponsiveSpacing = (
  baseSpacing: number,
  screenCategory: keyof ResponsiveBreakpoints
): number => {
  const spacingFactors: Record<keyof ResponsiveBreakpoints, number> = {
    mobileSmall: 0.75,
    mobile: 0.85,
    tablet: 0.9,
    desktop: 1,
    desktopLarge: 1.2
  }
  
  return baseSpacing * spacingFactors[screenCategory]
}

/**
 * グリッドカラム数の計算
 */
export const calculateGridColumns = (
  screenCategory: keyof ResponsiveBreakpoints,
  maxColumns: number = 12
): number => {
  const columnCounts: Record<keyof ResponsiveBreakpoints, number> = {
    mobileSmall: Math.min(1, maxColumns),
    mobile: Math.min(2, maxColumns),
    tablet: Math.min(3, maxColumns),
    desktop: Math.min(4, maxColumns),
    desktopLarge: maxColumns
  }
  
  return columnCounts[screenCategory]
}

/**
 * タッチターゲットサイズの計算
 */
export const calculateTouchTargetSize = (
  baseSize: number,
  isTouchDevice: boolean
): number => {
  const minTouchSize = 44 // iOS/Android推奨最小サイズ
  return isTouchDevice ? Math.max(baseSize, minTouchSize) : baseSize
}

/**
 * コンテナ幅の計算
 */
export const calculateContainerWidth = (
  screenWidth: number,
  screenCategory: keyof ResponsiveBreakpoints
): number => {
  const maxWidths: Record<keyof ResponsiveBreakpoints, number> = {
    mobileSmall: screenWidth - 32, // 16px margin on each side
    mobile: screenWidth - 32,
    tablet: Math.min(screenWidth - 64, 800),
    desktop: Math.min(screenWidth - 80, 1000),
    desktopLarge: Math.min(screenWidth - 100, 1200)
  }
  
  return maxWidths[screenCategory]
}

/**
 * アニメーション設定の調整
 */
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
}

export const getResponsiveAnimationConfig = (
  baseConfig: AnimationConfig,
  screenCategory: keyof ResponsiveBreakpoints,
  prefersReducedMotion: boolean = false
): AnimationConfig => {
  if (prefersReducedMotion) {
    return {
      ...baseConfig,
      duration: 0.01, // ほぼ瞬時
      delay: 0
    }
  }
  
  const durationFactors: Record<keyof ResponsiveBreakpoints, number> = {
    mobileSmall: 0.8,
    mobile: 0.9,
    tablet: 1,
    desktop: 1,
    desktopLarge: 1.1
  }
  
  return {
    ...baseConfig,
    duration: baseConfig.duration * durationFactors[screenCategory]
  }
}

/**
 * パフォーマンス最適化設定
 */
export interface PerformanceConfig {
  maxBubbles: number
  animationFPS: number
  enableGPUAcceleration: boolean
  useVirtualization: boolean
}

export const getPerformanceConfig = (
  screenCategory: keyof ResponsiveBreakpoints,
  isTouchDevice: boolean
): PerformanceConfig => {
  const configs: Record<keyof ResponsiveBreakpoints, PerformanceConfig> = {
    mobileSmall: {
      maxBubbles: 8,
      animationFPS: 30,
      enableGPUAcceleration: true,
      useVirtualization: true
    },
    mobile: {
      maxBubbles: 12,
      animationFPS: 45,
      enableGPUAcceleration: true,
      useVirtualization: true
    },
    tablet: {
      maxBubbles: 16,
      animationFPS: 60,
      enableGPUAcceleration: true,
      useVirtualization: false
    },
    desktop: {
      maxBubbles: 20,
      animationFPS: 60,
      enableGPUAcceleration: true,
      useVirtualization: false
    },
    desktopLarge: {
      maxBubbles: 25,
      animationFPS: 60,
      enableGPUAcceleration: true,
      useVirtualization: false
    }
  }
  
  const config = configs[screenCategory]
  
  // タッチデバイスの場合はパフォーマンスを調整
  if (isTouchDevice) {
    return {
      ...config,
      maxBubbles: Math.max(6, Math.floor(config.maxBubbles * 0.8)),
      animationFPS: Math.min(45, config.animationFPS)
    }
  }
  
  return config
}

/**
 * CSS変数の動的設定
 */
export const setResponsiveCSSVariables = (
  screenCategory: keyof ResponsiveBreakpoints,
  isTouchDevice: boolean
): void => {
  const root = document.documentElement
  
  // フォントサイズ
  const baseFontSize = calculateResponsiveFontSize(16, screenCategory)
  root.style.setProperty('--responsive-font-size', `${baseFontSize}px`)
  
  // スペーシング
  const baseSpacing = calculateResponsiveSpacing(16, screenCategory)
  root.style.setProperty('--responsive-spacing', `${baseSpacing}px`)
  
  // タッチターゲットサイズ
  const touchTargetSize = calculateTouchTargetSize(40, isTouchDevice)
  root.style.setProperty('--touch-target-size', `${touchTargetSize}px`)
  
  // グリッドカラム
  const gridColumns = calculateGridColumns(screenCategory)
  root.style.setProperty('--grid-columns', gridColumns.toString())
  
  // パフォーマンス設定
  const perfConfig = getPerformanceConfig(screenCategory, isTouchDevice)
  root.style.setProperty('--max-bubbles', perfConfig.maxBubbles.toString())
  root.style.setProperty('--animation-fps', perfConfig.animationFPS.toString())
}

/**
 * レスポンシブ初期化
 */
export const initializeResponsiveSystem = (): (() => void) => {
  const updateResponsiveVariables = () => {
    const width = window.innerWidth
    const screenCategory = getCurrentScreenCategory(width)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    setResponsiveCSSVariables(screenCategory, isTouchDevice)
    
    // デバッグ情報（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 Responsive system updated:', {
        width,
        screenCategory,
        isTouchDevice
      })
    }
  }
  
  // 初期設定
  updateResponsiveVariables()
  
  // リサイズ監視
  let resizeTimeout: NodeJS.Timeout
  const debouncedResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(updateResponsiveVariables, 150)
  }
  
  window.addEventListener('resize', debouncedResize)
  window.addEventListener('orientationchange', () => {
    setTimeout(updateResponsiveVariables, 300)
  })
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('resize', debouncedResize)
    window.removeEventListener('orientationchange', updateResponsiveVariables)
    clearTimeout(resizeTimeout)
  }
}