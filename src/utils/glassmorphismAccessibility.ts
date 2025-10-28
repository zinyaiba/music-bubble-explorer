/**
 * Glassmorphism Accessibility Enhancement
 * WCAG 2.1 AA基準の遵守とアクセシビリティ対応
 */

interface AccessibilityConfig {
  enableHighContrast: boolean
  enableReducedMotion: boolean
  enableKeyboardNavigation: boolean
  enableScreenReaderSupport: boolean
  enableFocusManagement: boolean
  debugMode: boolean
}

interface ColorContrastResult {
  ratio: number
  level: 'AA' | 'AAA' | 'FAIL'
  isValid: boolean
}

interface AccessibilityAuditResult {
  element: HTMLElement
  issues: AccessibilityIssue[]
  score: number
  recommendations: string[]
}

interface AccessibilityIssue {
  type: 'contrast' | 'focus' | 'aria' | 'keyboard' | 'semantic'
  severity: 'error' | 'warning' | 'info'
  message: string
  element: HTMLElement
  fix?: () => void
}

class GlassmorphismAccessibilityEnhancer {
  private config: AccessibilityConfig
  private observedElements = new Set<HTMLElement>()
  private focusableElements = new Set<HTMLElement>()
  // private keyboardNavigationEnabled = false
  private highContrastMode = false
  private reducedMotionMode = false

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableHighContrast: true,
      enableReducedMotion: true,
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableFocusManagement: true,
      debugMode: false,
      ...config,
    }

    this.init()
  }

  private init(): void {
    this.detectUserPreferences()
    this.setupKeyboardNavigation()
    this.setupFocusManagement()
    this.enhanceExistingElements()
    this.setupMediaQueryListeners()
  }

  /**
   * ユーザー設定の検出
   */
  private detectUserPreferences(): void {
    // ハイコントラストモードの検出
    this.highContrastMode = window.matchMedia(
      '(prefers-contrast: high)'
    ).matches

    // モーション軽減設定の検出
    this.reducedMotionMode = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (this.config.debugMode) {
      console.log('Accessibility preferences detected:', {
        highContrast: this.highContrastMode,
        reducedMotion: this.reducedMotionMode,
      })
    }
  }

  /**
   * 既存要素のアクセシビリティ強化
   */
  private enhanceExistingElements(): void {
    const glassElements = document.querySelectorAll<HTMLElement>(
      '.glass-card, .glass-button, .glass-input, .glass-modal, [class*="glass-"]'
    )

    glassElements.forEach(element => {
      this.enhanceElement(element)
    })
  }

  /**
   * 個別要素のアクセシビリティ強化
   */
  public enhanceElement(element: HTMLElement): void {
    if (this.observedElements.has(element)) return

    // コントラスト比の確認と修正
    if (this.config.enableHighContrast) {
      this.enhanceColorContrast(element)
    }

    // キーボードナビゲーションの強化
    if (this.config.enableKeyboardNavigation) {
      this.enhanceKeyboardNavigation(element)
    }

    // スクリーンリーダー対応
    if (this.config.enableScreenReaderSupport) {
      this.enhanceScreenReaderSupport(element)
    }

    // フォーカス管理の強化
    if (this.config.enableFocusManagement) {
      this.enhanceFocusManagement(element)
    }

    // モーション軽減対応
    if (this.config.enableReducedMotion) {
      this.enhanceReducedMotion(element)
    }

    this.observedElements.add(element)

    if (this.config.debugMode) {
      console.log('Enhanced accessibility for element:', element)
    }
  }

  /**
   * 色彩コントラストの強化
   */
  private enhanceColorContrast(element: HTMLElement): void {
    const computedStyle = getComputedStyle(element)
    const backgroundColor = computedStyle.backgroundColor
    const color = computedStyle.color

    // コントラスト比の計算
    const contrastResult = this.calculateColorContrast(color, backgroundColor)

    if (!contrastResult.isValid) {
      // コントラスト比が不十分な場合の修正
      this.fixColorContrast(element, contrastResult)
    }

    // ハイコントラストモード対応
    if (this.highContrastMode) {
      this.applyHighContrastStyles(element)
    }
  }

  /**
   * キーボードナビゲーションの強化
   */
  private enhanceKeyboardNavigation(element: HTMLElement): void {
    // インタラクティブ要素の判定
    if (this.isInteractiveElement(element)) {
      // tabindex の設定
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '0')
      }

      // キーボードイベントリスナーの追加
      this.addKeyboardEventListeners(element)

      // フォーカス可能要素として登録
      this.focusableElements.add(element)
    }

    // ARIA属性の設定
    this.setAriaAttributes(element)
  }

  /**
   * スクリーンリーダー対応の強化
   */
  private enhanceScreenReaderSupport(element: HTMLElement): void {
    // 適切なroleの設定
    this.setSemanticRole(element)

    // aria-labelの設定
    this.setAriaLabel(element)

    // aria-describedbyの設定
    this.setAriaDescribedBy(element)

    // ライブリージョンの設定
    this.setLiveRegion(element)
  }

  /**
   * フォーカス管理の強化
   */
  private enhanceFocusManagement(element: HTMLElement): void {
    // フォーカス表示の強化
    this.enhanceFocusVisibility(element)

    // フォーカストラップの設定（モーダル要素の場合）
    if (element.classList.contains('glass-modal')) {
      this.setupFocusTrap(element)
    }

    // フォーカス順序の最適化
    // this.optimizeFocusOrder(element) // TODO: Implement focus order optimization
  }

  /**
   * モーション軽減対応
   */
  private enhanceReducedMotion(element: HTMLElement): void {
    if (this.reducedMotionMode) {
      element.style.transition = 'none'
      element.style.animation = 'none'
      element.style.transform = 'none'
      element.classList.add('reduced-motion')
    }
  }

  /**
   * 色彩コントラスト比の計算
   */
  private calculateColorContrast(
    foreground: string,
    background: string
  ): ColorContrastResult {
    // RGB値の抽出と正規化
    const fgRgb = this.parseColor(foreground)
    const bgRgb = this.parseColor(background)

    if (!fgRgb || !bgRgb) {
      return { ratio: 0, level: 'FAIL', isValid: false }
    }

    // 相対輝度の計算
    const fgLuminance = this.calculateLuminance(fgRgb)
    const bgLuminance = this.calculateLuminance(bgRgb)

    // コントラスト比の計算
    const ratio =
      (Math.max(fgLuminance, bgLuminance) + 0.05) /
      (Math.min(fgLuminance, bgLuminance) + 0.05)

    // WCAG基準の判定
    let level: 'AA' | 'AAA' | 'FAIL'
    let isValid: boolean

    if (ratio >= 7) {
      level = 'AAA'
      isValid = true
    } else if (ratio >= 4.5) {
      level = 'AA'
      isValid = true
    } else {
      level = 'FAIL'
      isValid = false
    }

    return { ratio, level, isValid }
  }

  /**
   * 色彩コントラストの修正
   */
  private fixColorContrast(
    element: HTMLElement,
    contrastResult: ColorContrastResult
  ): void {
    if (contrastResult.ratio < 4.5) {
      // 背景色を調整してコントラストを改善
      const computedStyle = getComputedStyle(element)
      const currentBg = computedStyle.backgroundColor

      if (currentBg.includes('rgba')) {
        // 透明度を調整
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
      } else {
        // 背景色を白に近づける
        element.style.backgroundColor = '#ffffff'
      }

      // テキスト色も調整
      element.style.color = '#1a1a1a'
    }
  }

  /**
   * ハイコントラストスタイルの適用
   */
  private applyHighContrastStyles(element: HTMLElement): void {
    element.style.backgroundColor = '#ffffff'
    element.style.color = '#000000'
    element.style.border = '2px solid #000000'
    element.style.backdropFilter = 'none'
    ;(element.style as any).webkitBackdropFilter = 'none'
    element.classList.add('high-contrast-mode')
  }

  /**
   * キーボードイベントリスナーの追加
   */
  private addKeyboardEventListeners(element: HTMLElement): void {
    element.addEventListener('keydown', event => {
      switch (event.key) {
        case 'Enter':
        case ' ':
          if (
            element.tagName === 'BUTTON' ||
            element.getAttribute('role') === 'button'
          ) {
            event.preventDefault()
            element.click()
          }
          break
        case 'Escape':
          if (element.classList.contains('glass-modal')) {
            this.closeModal(element)
          }
          break
        case 'Tab':
          this.handleTabNavigation(event, element)
          break
      }
    })
  }

  /**
   * ARIA属性の設定
   */
  private setAriaAttributes(element: HTMLElement): void {
    // 基本的なARIA属性の設定
    if (
      element.classList.contains('glass-button') &&
      !element.hasAttribute('role')
    ) {
      element.setAttribute('role', 'button')
    }

    if (
      element.classList.contains('glass-card-interactive') &&
      !element.hasAttribute('role')
    ) {
      element.setAttribute('role', 'button')
    }

    if (
      element.classList.contains('glass-input') &&
      !element.hasAttribute('aria-label')
    ) {
      const label = element.getAttribute('placeholder') || 'Input field'
      element.setAttribute('aria-label', label)
    }
  }

  /**
   * セマンティックロールの設定
   */
  private setSemanticRole(element: HTMLElement): void {
    if (element.classList.contains('glass-modal')) {
      element.setAttribute('role', 'dialog')
      element.setAttribute('aria-modal', 'true')
    }

    if (
      element.classList.contains('glass-card') &&
      this.isInteractiveElement(element)
    ) {
      element.setAttribute('role', 'button')
    }
  }

  /**
   * aria-labelの設定
   */
  private setAriaLabel(element: HTMLElement): void {
    if (
      !element.hasAttribute('aria-label') &&
      !element.hasAttribute('aria-labelledby')
    ) {
      const textContent = element.textContent?.trim()
      if (textContent) {
        element.setAttribute('aria-label', textContent)
      }
    }
  }

  /**
   * aria-describedbyの設定
   */
  private setAriaDescribedBy(element: HTMLElement): void {
    // 説明要素の検索と関連付け
    const description = element.querySelector(
      '.description, .help-text, .error-message'
    )
    if (description && !description.id) {
      const id = `desc-${Math.random().toString(36).substr(2, 9)}`
      description.id = id
      element.setAttribute('aria-describedby', id)
    }
  }

  /**
   * ライブリージョンの設定
   */
  private setLiveRegion(element: HTMLElement): void {
    if (
      element.classList.contains('error-message') ||
      element.classList.contains('status-message')
    ) {
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('aria-atomic', 'true')
    }
  }

  /**
   * フォーカス表示の強化
   */
  private enhanceFocusVisibility(element: HTMLElement): void {
    element.addEventListener('focus', () => {
      element.style.outline = '3px solid #0066cc'
      element.style.outlineOffset = '2px'
      element.classList.add('focused')
    })

    element.addEventListener('blur', () => {
      element.style.outline = ''
      element.style.outlineOffset = ''
      element.classList.remove('focused')
    })
  }

  /**
   * フォーカストラップの設定
   */
  private setupFocusTrap(modal: HTMLElement): void {
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    modal.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    })

    // モーダルが開いたときに最初の要素にフォーカス
    firstElement.focus()
  }

  /**
   * キーボードナビゲーションのセットアップ
   */
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        // this.keyboardNavigationEnabled = true
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      // this.keyboardNavigationEnabled = false
      document.body.classList.remove('keyboard-navigation')
    })
  }

  /**
   * フォーカス管理のセットアップ
   */
  private setupFocusManagement(): void {
    // フォーカス可能要素の管理
    document.addEventListener('focusin', event => {
      const target = event.target as HTMLElement
      if (this.focusableElements.has(target)) {
        target.classList.add('focus-visible')
      }
    })

    document.addEventListener('focusout', event => {
      const target = event.target as HTMLElement
      target.classList.remove('focus-visible')
    })
  }

  /**
   * メディアクエリリスナーのセットアップ
   */
  private setupMediaQueryListeners(): void {
    // ハイコントラストモードの変更監視
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    highContrastQuery.addListener(e => {
      this.highContrastMode = e.matches
      this.updateHighContrastMode()
    })

    // モーション軽減設定の変更監視
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )
    reducedMotionQuery.addListener(e => {
      this.reducedMotionMode = e.matches
      this.updateReducedMotionMode()
    })
  }

  /**
   * ハイコントラストモードの更新
   */
  private updateHighContrastMode(): void {
    this.observedElements.forEach(element => {
      if (this.highContrastMode) {
        this.applyHighContrastStyles(element)
      } else {
        element.classList.remove('high-contrast-mode')
        element.style.backgroundColor = ''
        element.style.color = ''
        element.style.border = ''
        element.style.backdropFilter = ''
        ;(element.style as any).webkitBackdropFilter = ''
      }
    })
  }

  /**
   * モーション軽減モードの更新
   */
  private updateReducedMotionMode(): void {
    this.observedElements.forEach(element => {
      if (this.reducedMotionMode) {
        element.style.transition = 'none'
        element.style.animation = 'none'
        element.classList.add('reduced-motion')
      } else {
        element.style.transition = ''
        element.style.animation = ''
        element.classList.remove('reduced-motion')
      }
    })
  }

  /**
   * アクセシビリティ監査の実行
   */
  public auditElement(element: HTMLElement): AccessibilityAuditResult {
    const issues: AccessibilityIssue[] = []
    let score = 100

    // コントラスト比チェック
    const contrastResult = this.calculateColorContrast(
      getComputedStyle(element).color,
      getComputedStyle(element).backgroundColor
    )

    if (!contrastResult.isValid) {
      issues.push({
        type: 'contrast',
        severity: 'error',
        message: `Color contrast ratio ${contrastResult.ratio.toFixed(2)} is below WCAG AA standard (4.5:1)`,
        element,
        fix: () => this.fixColorContrast(element, contrastResult),
      })
      score -= 30
    }

    // フォーカス管理チェック
    if (
      this.isInteractiveElement(element) &&
      !element.hasAttribute('tabindex')
    ) {
      issues.push({
        type: 'focus',
        severity: 'warning',
        message: 'Interactive element missing tabindex attribute',
        element,
        fix: () => element.setAttribute('tabindex', '0'),
      })
      score -= 15
    }

    // ARIA属性チェック
    if (this.isInteractiveElement(element) && !element.hasAttribute('role')) {
      issues.push({
        type: 'aria',
        severity: 'warning',
        message: 'Interactive element missing role attribute',
        element,
        fix: () => element.setAttribute('role', 'button'),
      })
      score -= 10
    }

    const recommendations = this.generateRecommendations(issues)

    return {
      element,
      issues,
      score,
      recommendations,
    }
  }

  /**
   * ユーティリティメソッド
   */
  private isInteractiveElement(element: HTMLElement): boolean {
    return (
      element.matches(
        'button, input, select, textarea, [role="button"], [tabindex]'
      ) ||
      element.classList.contains('glass-card-interactive') ||
      element.classList.contains('glass-button') ||
      element.style.cursor === 'pointer'
    )
  }

  private parseColor(color: string): [number, number, number] | null {
    // RGB/RGBA色の解析
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
      ]
    }

    // HEX色の解析
    const hexMatch = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16),
      ]
    }

    return null
  }

  private calculateLuminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = []

    if (issues.some(issue => issue.type === 'contrast')) {
      recommendations.push('Improve color contrast to meet WCAG AA standards')
    }

    if (issues.some(issue => issue.type === 'focus')) {
      recommendations.push(
        'Add proper focus management for keyboard navigation'
      )
    }

    if (issues.some(issue => issue.type === 'aria')) {
      recommendations.push('Add appropriate ARIA attributes for screen readers')
    }

    return recommendations
  }

  private closeModal(modal: HTMLElement): void {
    modal.style.display = 'none'
    modal.setAttribute('aria-hidden', 'true')
  }

  private handleTabNavigation(
    _event: KeyboardEvent,
    _element: HTMLElement
  ): void {
    // Tab navigation logic can be implemented here
  }

  /**
   * 破棄処理
   */
  public destroy(): void {
    this.observedElements.clear()
    this.focusableElements.clear()
  }
}

// シングルトンインスタンス
let accessibilityInstance: GlassmorphismAccessibilityEnhancer | null = null

/**
 * アクセシビリティ強化の初期化
 */
export const initializeGlassmorphismAccessibility = (
  config?: Partial<AccessibilityConfig>
): void => {
  if (accessibilityInstance) {
    accessibilityInstance.destroy()
  }

  accessibilityInstance = new GlassmorphismAccessibilityEnhancer(config)
}

/**
 * 個別要素のアクセシビリティ強化
 */
export const enhanceGlassmorphismAccessibility = (
  element: HTMLElement
): void => {
  if (!accessibilityInstance) {
    initializeGlassmorphismAccessibility()
  }

  accessibilityInstance?.enhanceElement(element)
}

/**
 * アクセシビリティ監査の実行
 */
export const auditGlassmorphismAccessibility = (
  element: HTMLElement
): AccessibilityAuditResult => {
  if (!accessibilityInstance) {
    initializeGlassmorphismAccessibility()
  }

  return (
    accessibilityInstance?.auditElement(element) || {
      element,
      issues: [],
      score: 0,
      recommendations: [],
    }
  )
}

export { GlassmorphismAccessibilityEnhancer }
export type {
  AccessibilityConfig,
  AccessibilityAuditResult,
  AccessibilityIssue,
}
