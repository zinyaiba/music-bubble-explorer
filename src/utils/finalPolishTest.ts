/**
 * 最終ポリッシュテストスクリプト
 * 手動でテスト実行するためのユーティリティ
 */

import { runFinalPolish } from './finalPolish'
import { runPerformanceTest300Songs } from './performanceTest300Songs'

/**
 * 手動テスト実行関数
 */
export async function runManualFinalPolishTest() {
  console.log('🎨 Starting Manual Final Polish Test...')
  console.log('=====================================')
  
  try {
    // 1. 300曲データセットパフォーマンステスト
    console.log('\n1. 300-Song Dataset Performance Test')
    console.log('------------------------------------')
    const performanceResult = await runPerformanceTest300Songs()
    
    console.log(`✅ Dataset: ${performanceResult.datasetInfo.songCount} songs`)
    console.log(`✅ Performance: ${performanceResult.success ? 'PASS' : 'FAIL'}`)
    console.log(`✅ FPS: ${performanceResult.performanceMetrics.fps.toFixed(1)}`)
    console.log(`✅ Memory: ${performanceResult.performanceMetrics.memoryUsage.toFixed(1)}MB`)
    
    // 2. 最終ポリッシュテスト
    console.log('\n2. Final Polish Comprehensive Test')
    console.log('----------------------------------')
    const polishResult = await runFinalPolish()
    
    console.log(`✅ Overall Status: ${polishResult.overallStatus}`)
    console.log(`✅ Overall Score: ${polishResult.overallScore}/100`)
    console.log(`✅ Integration: ${polishResult.integrationTests.passed ? 'PASS' : 'FAIL'}`)
    console.log(`✅ Performance: ${polishResult.performanceTests.passed ? 'PASS' : 'FAIL'}`)
    console.log(`✅ Accessibility: ${polishResult.accessibilityCheck.passed ? 'PASS' : 'FAIL'}`)
    console.log(`✅ Dataset: ${polishResult.datasetVerification.passed ? 'PASS' : 'FAIL'}`)
    console.log(`✅ Components: ${polishResult.componentIntegration.passed ? 'PASS' : 'FAIL'}`)
    
    // 3. キーボードナビゲーションテスト
    console.log('\n3. Keyboard Navigation Test')
    console.log('---------------------------')
    testKeyboardNavigation()
    
    // 4. アクセシビリティ機能テスト
    console.log('\n4. Accessibility Features Test')
    console.log('------------------------------')
    testAccessibilityFeatures()
    
    // 5. レスポンシブデザインテスト
    console.log('\n5. Responsive Design Test')
    console.log('-------------------------')
    testResponsiveDesign()
    
    console.log('\n🎉 Manual Final Polish Test Complete!')
    console.log('====================================')
    
    return {
      performanceResult,
      polishResult,
      overallSuccess: polishResult.overallStatus === 'PASS' && performanceResult.success
    }
    
  } catch (error) {
    console.error('❌ Manual test failed:', error)
    return {
      performanceResult: null,
      polishResult: null,
      overallSuccess: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * キーボードナビゲーションテスト
 */
function testKeyboardNavigation() {
  const canvas = document.querySelector('canvas')
  if (canvas) {
    console.log('✅ Canvas found for keyboard navigation')
    
    // tabindex確認
    const tabIndex = canvas.getAttribute('tabindex')
    if (tabIndex === '0') {
      console.log('✅ Canvas is focusable (tabindex="0")')
    } else {
      console.log('❌ Canvas is not focusable')
    }
    
    // ARIA属性確認
    const ariaLabel = canvas.getAttribute('aria-label')
    if (ariaLabel && ariaLabel.includes('矢印キー')) {
      console.log('✅ Canvas has keyboard navigation instructions in aria-label')
    } else {
      console.log('❌ Canvas lacks keyboard navigation instructions')
    }
    
    // キーボードイベントハンドラー確認
    const hasKeyHandler = canvas.onkeydown !== null
    if (hasKeyHandler) {
      console.log('✅ Canvas has keyboard event handler')
    } else {
      console.log('❌ Canvas lacks keyboard event handler')
    }
  } else {
    console.log('❌ Canvas not found')
  }
  
  // Live region確認
  const liveRegion = document.getElementById('canvas-announcements')
  if (liveRegion) {
    console.log('✅ ARIA live region found for announcements')
  } else {
    console.log('❌ ARIA live region not found')
  }
}

/**
 * アクセシビリティ機能テスト
 */
function testAccessibilityFeatures() {
  // ARIA属性の確認
  const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]')
  console.log(`✅ Found ${ariaElements.length} elements with ARIA attributes`)
  
  // フォーカス可能要素の確認
  const focusableElements = document.querySelectorAll('[tabindex="0"], button, [role="button"]')
  console.log(`✅ Found ${focusableElements.length} focusable elements`)
  
  // セマンティックHTML確認
  const semanticElements = document.querySelectorAll('main, header, nav, section, article')
  console.log(`✅ Found ${semanticElements.length} semantic HTML elements`)
  
  // スクリーンリーダー用コンテンツ確認
  const srOnlyElements = document.querySelectorAll('.sr-only')
  console.log(`✅ Found ${srOnlyElements.length} screen reader only elements`)
  
  // モーダルアクセシビリティ確認
  const modalElements = document.querySelectorAll('[role="dialog"]')
  console.log(`✅ Found ${modalElements.length} modal elements with proper role`)
}

/**
 * レスポンシブデザインテスト
 */
function testResponsiveDesign() {
  // ビューポートメタタグ確認
  const viewportMeta = document.querySelector('meta[name="viewport"]')
  if (viewportMeta) {
    console.log('✅ Viewport meta tag present')
  } else {
    console.log('❌ Viewport meta tag missing')
  }
  
  // CSS Grid/Flexbox使用確認
  const gridElements = document.querySelectorAll('[style*="grid"], [style*="flex"]')
  console.log(`✅ Found ${gridElements.length} elements using CSS Grid/Flexbox`)
  
  // メディアクエリ確認（簡易）
  const hasMediaQueries = Array.from(document.styleSheets).some(sheet => {
    try {
      return Array.from(sheet.cssRules).some(rule => 
        rule instanceof CSSMediaRule
      )
    } catch {
      return false
    }
  })
  
  if (hasMediaQueries) {
    console.log('✅ Media queries detected in stylesheets')
  } else {
    console.log('⚠️ Media queries not detected (may be in external files)')
  }
  
  // タッチ操作最適化確認
  const canvas = document.querySelector('canvas')
  if (canvas) {
    const touchAction = window.getComputedStyle(canvas).touchAction
    if (touchAction === 'manipulation') {
      console.log('✅ Touch action optimized for mobile')
    } else {
      console.log('⚠️ Touch action not optimized')
    }
  }
}

/**
 * ブラウザコンソールから実行可能にする
 */
if (typeof window !== 'undefined') {
  (window as any).runManualFinalPolishTest = runManualFinalPolishTest
  console.log('💡 Run "runManualFinalPolishTest()" in browser console to test final polish features')
}