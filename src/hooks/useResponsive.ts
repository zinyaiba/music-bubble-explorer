import { useState, useEffect } from 'react'

interface ScreenSize {
  width: number
  height: number
  isMobileSmall: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isDesktopLarge: boolean
  isTouchDevice: boolean
  isLandscape: boolean
}

/**
 * レスポンシブデザイン用のカスタムフック
 * 画面サイズとデバイス情報を提供
 */
export const useResponsive = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        isMobileSmall: false,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        isDesktopLarge: false,
        isTouchDevice: false,
        isLandscape: false,
      }
    }

    const width = window.innerWidth
    const height = window.innerHeight
    
    return {
      width,
      height,
      isMobileSmall: width <= 480,
      isMobile: width <= 900, // より広い範囲をモバイルとして扱う
      isTablet: width > 900 && width <= 1024,
      isDesktop: width > 1024 && width <= 1200,
      isDesktopLarge: width > 1200,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isLandscape: width > height,
    }
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobileSmall: width <= 480,
        isMobile: width <= 900, // より広い範囲をモバイルとして扱う
        isTablet: width > 900 && width <= 1024,
        isDesktop: width > 1024 && width <= 1200,
        isDesktopLarge: width > 1200,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isLandscape: width > height,
      })
    }

    // Debounced resize handler for performance
    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(updateScreenSize, 100)
    }

    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateScreenSize, 300) // Extra delay for orientation change
    })

    return () => {
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', updateScreenSize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return screenSize
}

/**
 * 画面サイズに基づいて最適なシャボン玉数を計算
 */
export const calculateOptimalBubbleCount = (
  canvasWidth: number,
  canvasHeight: number,
  screenSize: ScreenSize
): number => {
  const canvasArea = canvasWidth * canvasHeight
  
  if (screenSize.isDesktopLarge) {
    return Math.min(25, Math.max(15, Math.floor(canvasArea / 25000)))
  } else if (screenSize.isDesktop) {
    return Math.min(20, Math.max(12, Math.floor(canvasArea / 28000)))
  } else if (screenSize.isTablet) {
    return Math.min(15, Math.max(10, Math.floor(canvasArea / 30000)))
  } else if (screenSize.isMobile && !screenSize.isMobileSmall) {
    return Math.min(12, Math.max(8, Math.floor(canvasArea / 35000)))
  } else {
    return Math.min(10, Math.max(6, Math.floor(canvasArea / 40000)))
  }
}

/**
 * 画面サイズに基づいて最適なキャンバスサイズを計算
 */
export const calculateOptimalCanvasSize = (
  containerRect: DOMRect,
  screenSize: ScreenSize
): { width: number; height: number } => {
  const viewportHeight = window.innerHeight
  
  let width: number
  let height: number
  
  if (screenSize.isDesktopLarge) {
    width = Math.min(1200, containerRect.width - 40)
    height = Math.min(800, viewportHeight - 250)
  } else if (screenSize.isDesktop) {
    width = Math.min(1000, containerRect.width - 40)
    height = Math.min(700, viewportHeight - 220)
  } else if (screenSize.isTablet) {
    width = Math.min(800, containerRect.width - 30)
    height = Math.min(600, viewportHeight - 200)
  } else if (screenSize.isMobile && !screenSize.isMobileSmall) {
    width = Math.min(480, containerRect.width - 20)
    height = Math.min(500, viewportHeight - 180)
  } else {
    width = Math.min(320, containerRect.width - 16)
    height = Math.min(400, viewportHeight - 160)
  }
  
  // Ensure minimum dimensions
  width = Math.max(280, width)
  height = Math.max(250, height)
  
  // Adjust for landscape orientation on mobile
  if (screenSize.isMobile && screenSize.isLandscape) {
    height = Math.min(height, viewportHeight - 120)
  }
  
  return { width, height }
}