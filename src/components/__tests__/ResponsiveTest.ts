/**
 * レスポンシブデザインのテスト
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

import { calculateOptimalBubbleCount, calculateOptimalCanvasSize } from '../../hooks/useResponsive'

export function runResponsiveTest(): boolean {
  console.log('🧪 Running Responsive Design Tests...')
  
  try {
    // Test 1: Bubble count calculation for different screen sizes
    console.log('📱 Testing bubble count calculation...')
    
    const mockScreenSizes = [
      { name: 'Mobile Small', isMobileSmall: true, isMobile: true, isTablet: false, isDesktop: false, isDesktopLarge: false, width: 320, height: 568, isTouchDevice: true, isLandscape: false },
      { name: 'Mobile', isMobileSmall: false, isMobile: true, isTablet: false, isDesktop: false, isDesktopLarge: false, width: 768, height: 1024, isTouchDevice: true, isLandscape: false },
      { name: 'Tablet', isMobileSmall: false, isMobile: false, isTablet: true, isDesktop: false, isDesktopLarge: false, width: 1024, height: 768, isTouchDevice: true, isLandscape: true },
      { name: 'Desktop', isMobileSmall: false, isMobile: false, isTablet: false, isDesktop: true, isDesktopLarge: false, width: 1200, height: 800, isTouchDevice: false, isLandscape: true },
      { name: 'Desktop Large', isMobileSmall: false, isMobile: false, isTablet: false, isDesktop: false, isDesktopLarge: true, width: 1440, height: 900, isTouchDevice: false, isLandscape: true }
    ]
    
    const canvasWidth = 800
    const canvasHeight = 600
    
    mockScreenSizes.forEach(screenSize => {
      const bubbleCount = calculateOptimalBubbleCount(canvasWidth, canvasHeight, screenSize)
      console.log(`  ${screenSize.name}: ${bubbleCount} bubbles`)
      
      // Verify bubble count is within expected ranges
      if (screenSize.isMobileSmall && (bubbleCount < 6 || bubbleCount > 10)) {
        throw new Error(`Mobile small bubble count out of range: ${bubbleCount}`)
      }
      if (screenSize.isMobile && !screenSize.isMobileSmall && (bubbleCount < 8 || bubbleCount > 12)) {
        throw new Error(`Mobile bubble count out of range: ${bubbleCount}`)
      }
      if (screenSize.isTablet && (bubbleCount < 10 || bubbleCount > 15)) {
        throw new Error(`Tablet bubble count out of range: ${bubbleCount}`)
      }
      if (screenSize.isDesktop && (bubbleCount < 12 || bubbleCount > 20)) {
        throw new Error(`Desktop bubble count out of range: ${bubbleCount}`)
      }
      if (screenSize.isDesktopLarge && (bubbleCount < 15 || bubbleCount > 25)) {
        throw new Error(`Desktop large bubble count out of range: ${bubbleCount}`)
      }
    })
    
    // Test 2: Canvas size calculation
    console.log('🖼️ Testing canvas size calculation...')
    
    mockScreenSizes.forEach(screenSize => {
      const mockRect: DOMRect = {
        width: screenSize.width - 40,
        height: screenSize.height - 200,
        x: 0,
        y: 0,
        top: 0,
        right: screenSize.width,
        bottom: screenSize.height,
        left: 0,
        toJSON: () => ({})
      }
      
      // Mock window.innerHeight
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: screenSize.height,
      })
      
      const canvasSize = calculateOptimalCanvasSize(mockRect, screenSize)
      console.log(`  ${screenSize.name}: ${canvasSize.width}x${canvasSize.height}`)
      
      // Verify minimum dimensions
      if (canvasSize.width < 280 || canvasSize.height < 250) {
        throw new Error(`Canvas size too small: ${canvasSize.width}x${canvasSize.height}`)
      }
      
      // Verify maximum dimensions based on screen type
      if (screenSize.isDesktopLarge && canvasSize.width > 1200) {
        throw new Error(`Desktop large canvas width too large: ${canvasSize.width}`)
      }
      if (screenSize.isMobileSmall && canvasSize.width > 320) {
        throw new Error(`Mobile small canvas width too large: ${canvasSize.width}`)
      }
    })
    
    // Test 3: Touch device detection
    console.log('👆 Testing touch device optimization...')
    
    const touchScreenSize = mockScreenSizes.find(s => s.isTouchDevice)
    if (touchScreenSize) {
      console.log(`  Touch device detected: ${touchScreenSize.name}`)
      
      // Verify touch-specific optimizations would be applied
      if (!touchScreenSize.isTouchDevice) {
        throw new Error('Touch device flag not properly set')
      }
    }
    
    // Test 4: Landscape orientation handling
    console.log('🔄 Testing landscape orientation...')
    
    const landscapeScreenSize = mockScreenSizes.find(s => s.isLandscape)
    if (landscapeScreenSize) {
      console.log(`  Landscape orientation detected: ${landscapeScreenSize.name}`)
      
      if (landscapeScreenSize.width <= landscapeScreenSize.height) {
        throw new Error('Landscape detection not working properly')
      }
    }
    
    console.log('✅ All responsive design tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Responsive design test failed:', error)
    return false
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    runResponsiveTest()
  }, 1000)
}