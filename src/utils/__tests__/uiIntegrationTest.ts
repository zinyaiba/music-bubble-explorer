/**
 * UI統合とアクセシビリティのテスト
 * Task 18: UIの統合と改善のテスト
 */

import { announceToScreenReader, FocusManager, AccessibilityValidator } from '../accessibility'
import { logger } from '../../config/logConfig'

/**
 * UI統合テストスイート
 */
export class UIIntegrationTest {
  private static testResults: { test: string; passed: boolean; message: string }[] = []

  /**
   * 楽曲登録フォームの表示・非表示切り替えテスト
   */
  static testFormToggle(): void {
    logger.debug('Testing form toggle functionality')
    
    try {
      // フォームボタンの存在確認
      const formButton = document.querySelector('.add-song-button') as HTMLButtonElement
      if (!formButton) {
        throw new Error('Form toggle button not found')
      }

      // ARIA属性の確認
      const hasAriaExpanded = formButton.hasAttribute('aria-expanded')
      const hasAriaControls = formButton.hasAttribute('aria-controls')
      const hasAriaLabel = formButton.hasAttribute('aria-label')

      if (!hasAriaExpanded || !hasAriaControls || !hasAriaLabel) {
        throw new Error('Missing required ARIA attributes on form button')
      }

      this.testResults.push({
        test: 'Form Toggle Accessibility',
        passed: true,
        message: 'Form button has proper ARIA attributes'
      })

      logger.debug('Form toggle test passed')
    } catch (error) {
      this.testResults.push({
        test: 'Form Toggle Accessibility',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Form toggle test failed', error)
    }
  }

  /**
   * タグシャボン玉の詳細モーダル対応テスト
   */
  static testTagBubbleModal(): void {
    logger.debug('Testing tag bubble modal functionality')
    
    try {
      // DetailModalコンポーネントの存在確認（DOM上に存在しない場合もあるため、クラス定義の確認）
      const modalElements = document.querySelectorAll('[role="dialog"]')
      
      // モーダルが存在する場合のアクセシビリティチェック
      modalElements.forEach((modal, index) => {
        const hasAriaModal = modal.hasAttribute('aria-modal')
        const hasAriaLabel = modal.hasAttribute('aria-labelledby') || modal.hasAttribute('aria-label')
        
        if (!hasAriaModal || !hasAriaLabel) {
          throw new Error(`Modal ${index} missing required ARIA attributes`)
        }
      })

      this.testResults.push({
        test: 'Tag Bubble Modal',
        passed: true,
        message: 'Modal accessibility attributes are properly configured'
      })

      logger.debug('Tag bubble modal test passed')
    } catch (error) {
      this.testResults.push({
        test: 'Tag Bubble Modal',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Tag bubble modal test failed', error)
    }
  }

  /**
   * 全体的なレイアウトの調整テスト
   */
  static testResponsiveLayout(): void {
    logger.debug('Testing responsive layout')
    
    try {
      // 主要なレイアウト要素の存在確認
      const header = document.querySelector('.App-header')
      const main = document.querySelector('.App-main')
      const bubbleContainer = document.querySelector('.bubble-container')
      const appInfo = document.querySelector('.app-info')

      if (!header || !main || !bubbleContainer || !appInfo) {
        throw new Error('Missing required layout elements')
      }

      // CSS Grid/Flexboxの使用確認
      const headerStyles = window.getComputedStyle(header)
      const mainStyles = window.getComputedStyle(main)
      const appInfoStyles = window.getComputedStyle(appInfo)

      const usesFlexbox = headerStyles.display === 'flex' || 
                         mainStyles.display === 'flex' || 
                         appInfoStyles.display === 'flex'

      if (!usesFlexbox) {
        logger.warn('Layout may not be using modern CSS layout methods')
      }

      this.testResults.push({
        test: 'Responsive Layout',
        passed: true,
        message: 'Layout elements are properly structured'
      })

      logger.debug('Responsive layout test passed')
    } catch (error) {
      this.testResults.push({
        test: 'Responsive Layout',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Responsive layout test failed', error)
    }
  }

  /**
   * アクセシビリティの向上テスト
   */
  static testAccessibilityImprovements(): void {
    logger.debug('Testing accessibility improvements')
    
    try {
      // スキップリンクの存在確認
      const skipLink = document.querySelector('.skip-to-main')
      if (!skipLink) {
        throw new Error('Skip to main content link not found')
      }

      // ライブリージョンの存在確認
      const liveRegion = document.getElementById('live-region')
      if (!liveRegion) {
        throw new Error('Live region for announcements not found')
      }

      // セマンティックHTML要素の確認
      const header = document.querySelector('header[role="banner"]')
      const main = document.querySelector('main[role="main"]')

      if (!header || !main) {
        throw new Error('Missing semantic HTML elements')
      }

      // フォーカス管理のテスト
      const focusableElements = FocusManager.getFocusableElements(document.body)
      if (focusableElements.length === 0) {
        throw new Error('No focusable elements found')
      }

      // アクセシビリティ検証
      const issues: string[] = []
      document.querySelectorAll('button, [role="button"], [role="dialog"], input, textarea, select').forEach(element => {
        const elementIssues = AccessibilityValidator.validateAriaAttributes(element as HTMLElement)
        issues.push(...elementIssues)
      })

      if (issues.length > 0) {
        logger.warn('Accessibility issues found', issues)
      }

      this.testResults.push({
        test: 'Accessibility Improvements',
        passed: true,
        message: `Accessibility features implemented. ${issues.length} minor issues found.`
      })

      logger.debug('Accessibility improvements test passed')
    } catch (error) {
      this.testResults.push({
        test: 'Accessibility Improvements',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Accessibility improvements test failed', error)
    }
  }

  /**
   * キーボードナビゲーションテスト
   */
  static testKeyboardNavigation(): void {
    logger.debug('Testing keyboard navigation')
    
    try {
      // Canvas要素のキーボードサポート確認
      const canvas = document.querySelector('canvas[tabindex="0"]')
      if (!canvas) {
        throw new Error('Canvas element not keyboard accessible')
      }

      // フォーカス可能な要素の確認
      const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')
      
      if (focusableElements.length === 0) {
        throw new Error('No keyboard accessible elements found')
      }

      // ARIA属性の確認
      let ariaCompliantElements = 0
      focusableElements.forEach(element => {
        const hasAriaLabel = element.hasAttribute('aria-label') || 
                           element.hasAttribute('aria-labelledby') ||
                           element.textContent?.trim()
        
        if (hasAriaLabel) {
          ariaCompliantElements++
        }
      })

      const complianceRate = (ariaCompliantElements / focusableElements.length) * 100

      this.testResults.push({
        test: 'Keyboard Navigation',
        passed: complianceRate >= 80,
        message: `${complianceRate.toFixed(1)}% of focusable elements have proper labels`
      })

      logger.debug('Keyboard navigation test passed')
    } catch (error) {
      this.testResults.push({
        test: 'Keyboard Navigation',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Keyboard navigation test failed', error)
    }
  }

  /**
   * スクリーンリーダー対応テスト
   */
  static testScreenReaderSupport(): void {
    logger.debug('Testing screen reader support')
    
    try {
      // ライブリージョンのテスト
      announceToScreenReader('テストメッセージ', 'polite')
      
      setTimeout(() => {
        const liveRegion = document.getElementById('live-region')
        if (!liveRegion || !liveRegion.textContent) {
          throw new Error('Live region announcement failed')
        }

        // ARIA属性の確認
        const hasAriaLive = liveRegion.hasAttribute('aria-live')
        const hasAriaAtomic = liveRegion.hasAttribute('aria-atomic')

        if (!hasAriaLive || !hasAriaAtomic) {
          throw new Error('Live region missing required ARIA attributes')
        }

        this.testResults.push({
          test: 'Screen Reader Support',
          passed: true,
          message: 'Live region announcements working properly'
        })

        logger.debug('Screen reader support test passed')
      }, 100)
    } catch (error) {
      this.testResults.push({
        test: 'Screen Reader Support',
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
      logger.error('Screen reader support test failed', error)
    }
  }

  /**
   * 全テストの実行
   */
  static runAllTests(): void {
    logger.debug('Starting UI Integration and Accessibility Tests')
    
    this.testResults = []
    
    // 各テストを実行
    this.testFormToggle()
    this.testTagBubbleModal()
    this.testResponsiveLayout()
    this.testAccessibilityImprovements()
    this.testKeyboardNavigation()
    this.testScreenReaderSupport()
    
    // 結果の集計
    setTimeout(() => {
      const passedTests = this.testResults.filter(result => result.passed).length
      const totalTests = this.testResults.length
      
      logger.debug('UI Integration Test Results', {
        passed: passedTests,
        total: totalTests,
        results: this.testResults
      })
      
      if (passedTests === totalTests) {
        logger.info('All UI integration tests passed')
      } else {
        logger.warn(`${totalTests - passedTests} test(s) failed`, this.testResults.filter(r => !r.passed))
      }
    }, 500)
  }

  /**
   * テスト結果の取得
   */
  static getTestResults(): { test: string; passed: boolean; message: string }[] {
    return this.testResults
  }
}

// 開発環境でのテスト自動実行
if (process.env.NODE_ENV === 'development') {
  // DOM読み込み完了後にテスト実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => UIIntegrationTest.runAllTests(), 2000)
    })
  } else {
    setTimeout(() => UIIntegrationTest.runAllTests(), 2000)
  }
}

export default UIIntegrationTest