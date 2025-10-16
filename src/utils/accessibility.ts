/**
 * アクセシビリティユーティリティ
 * Requirements: 10.1, 10.2 - アクセシビリティの向上
 */

/**
 * スクリーンリーダー用のライブリージョンにメッセージを送信
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  // ブラウザ環境でのみ実行
  if (typeof document === 'undefined') {
    return
  }
  
  // 既存のライブリージョンを探す
  let liveRegion = document.getElementById('live-region')
  
  if (!liveRegion) {
    // ライブリージョンが存在しない場合は作成
    liveRegion = document.createElement('div')
    liveRegion.id = 'live-region'
    liveRegion.className = 'sr-only'
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    document.body.appendChild(liveRegion)
  }
  
  // メッセージを設定
  liveRegion.textContent = message
  
  // 一定時間後にクリア
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = ''
    }
  }, 3000)
}

/**
 * フォーカス管理ユーティリティ
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = []
  
  /**
   * 現在のフォーカスを保存し、新しい要素にフォーカスを移動
   */
  static pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus)
    }
    
    element.focus()
  }
  
  /**
   * 前のフォーカス位置に戻る
   */
  static popFocus(): void {
    const previousFocus = this.focusStack.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }
  
  /**
   * フォーカス可能な要素を取得
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ')
    
    return Array.from(container.querySelectorAll(focusableSelectors))
  }
  
  /**
   * 要素内でのフォーカストラップ
   */
  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== 'Tab') return
    
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

/**
 * キーボードナビゲーションヘルパー
 */
export class KeyboardNavigation {
  /**
   * 矢印キーによるリストナビゲーション
   */
  static handleListNavigation(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ): void {
    if (items.length === 0) return
    
    let newIndex = currentIndex
    
    switch (event.key) {
      case 'ArrowDown':
        if (orientation === 'vertical') {
          event.preventDefault()
          newIndex = (currentIndex + 1) % items.length
        }
        break
      case 'ArrowUp':
        if (orientation === 'vertical') {
          event.preventDefault()
          newIndex = (currentIndex - 1 + items.length) % items.length
        }
        break
      case 'ArrowRight':
        if (orientation === 'horizontal') {
          event.preventDefault()
          newIndex = (currentIndex + 1) % items.length
        }
        break
      case 'ArrowLeft':
        if (orientation === 'horizontal') {
          event.preventDefault()
          newIndex = (currentIndex - 1 + items.length) % items.length
        }
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = items.length - 1
        break
    }
    
    if (newIndex !== currentIndex) {
      onIndexChange(newIndex)
      items[newIndex]?.focus()
    }
  }
}

/**
 * アクセシビリティ検証ユーティリティ
 */
export class AccessibilityValidator {
  /**
   * 必要なARIA属性が設定されているかチェック
   */
  static validateAriaAttributes(element: HTMLElement): string[] {
    const issues: string[] = []
    
    // ボタンのチェック
    if (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') {
      if (!element.getAttribute('aria-label') && !element.textContent?.trim()) {
        issues.push('Button missing accessible name')
      }
    }
    
    // モーダルのチェック
    if (element.getAttribute('role') === 'dialog') {
      if (!element.getAttribute('aria-labelledby') && !element.getAttribute('aria-label')) {
        issues.push('Dialog missing accessible name')
      }
      if (!element.getAttribute('aria-modal')) {
        issues.push('Dialog missing aria-modal attribute')
      }
    }
    
    // フォームのチェック
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      const label = document.querySelector(`label[for="${element.id}"]`)
      if (!label && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
        issues.push('Form control missing label')
      }
    }
    
    return issues
  }
  
  /**
   * カラーコントラストの簡易チェック
   */
  static checkColorContrast(element: HTMLElement): boolean {
    const styles = window.getComputedStyle(element)
    const backgroundColor = styles.backgroundColor
    const color = styles.color
    
    // 簡易的なコントラスト比計算（実際の実装ではより詳細な計算が必要）
    // ここでは基本的なチェックのみ
    return backgroundColor !== color
  }
}

/**
 * レスポンシブアクセシビリティヘルパー
 */
export class ResponsiveAccessibility {
  /**
   * タッチデバイス用のアクセシビリティ調整
   */
  static adjustForTouchDevice(): void {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof navigator === 'undefined') {
      return
    }
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    if (isTouchDevice) {
      // タッチターゲットサイズの調整
      document.documentElement.style.setProperty('--min-touch-target', '44px')
      
      // ホバー効果の無効化
      document.documentElement.classList.add('touch-device')
    }
  }
  
  /**
   * 画面サイズに応じたアクセシビリティ調整
   */
  static adjustForScreenSize(): void {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined' || typeof document === 'undefined' || !window.matchMedia) {
      return
    }
    
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    
    // mediaQueryが正常に作成されたかチェック
    if (!mediaQuery) {
      return
    }
    
    const handleScreenSizeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e && typeof e.matches === 'boolean' && e.matches) {
        // モバイル向け調整
        document.documentElement.classList.add('mobile-layout')
        
        // フォントサイズの調整
        document.documentElement.style.setProperty('--base-font-size', '16px')
      } else {
        // デスクトップ向け調整
        document.documentElement.classList.remove('mobile-layout')
        
        // フォントサイズのリセット
        document.documentElement.style.removeProperty('--base-font-size')
      }
    }
    
    // 初期チェック
    handleScreenSizeChange(mediaQuery)
    
    // 変更の監視
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleScreenSizeChange)
    } else if (mediaQuery.addListener) {
      // 古いブラウザ対応
      mediaQuery.addListener(handleScreenSizeChange)
    }
  }
}

/**
 * グローバルキーボードナビゲーション
 */
export class GlobalKeyboardNavigation {
  private static isInitialized = false
  
  /**
   * グローバルキーボードイベントの初期化
   */
  static initialize(): void {
    if (this.isInitialized) return
    
    document.addEventListener('keydown', this.handleGlobalKeyDown)
    this.isInitialized = true
  }
  
  /**
   * グローバルキーボードイベントのクリーンアップ
   */
  static cleanup(): void {
    document.removeEventListener('keydown', this.handleGlobalKeyDown)
    this.isInitialized = false
  }
  
  /**
   * グローバルキーボードイベントハンドラ
   */
  private static handleGlobalKeyDown = (event: KeyboardEvent): void => {
    // Escキーでモーダルを閉じる
    if (event.key === 'Escape') {
      const openModal = document.querySelector('[role="dialog"][aria-modal="true"]')
      if (openModal) {
        const closeButton = openModal.querySelector('[aria-label*="閉じる"], .close-button, [data-close]')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
          event.preventDefault()
        }
      }
    }
    
    // Alt + 数字キーでナビゲーション
    if (event.altKey && !event.ctrlKey && !event.shiftKey) {
      switch (event.key) {
        case '1':
          // メインビューに移動
          const mainButton = document.querySelector('[aria-current="page"], [data-view="main"]')
          if (mainButton instanceof HTMLElement) {
            mainButton.click()
            event.preventDefault()
          }
          break
        case '2':
          // 楽曲登録フォームを開く
          const registrationButton = document.querySelector('[data-view="registration"], [aria-controls="song-registration-form"]')
          if (registrationButton instanceof HTMLElement) {
            registrationButton.click()
            event.preventDefault()
          }
          break
        case '3':
          // 楽曲管理を開く
          const managementButton = document.querySelector('[data-view="management"], [aria-controls="song-management"]')
          if (managementButton instanceof HTMLElement) {
            managementButton.click()
            event.preventDefault()
          }
          break
      }
    }
    
    // Ctrl + / でヘルプ表示
    if (event.ctrlKey && event.key === '/') {
      announceToScreenReader('キーボードショートカット: Alt+1でメインビュー、Alt+2で楽曲登録、Alt+3で楽曲管理、Escでモーダルを閉じる')
      event.preventDefault()
    }
  }
}

/**
 * アクセシビリティ初期化
 */
export const initializeAccessibility = (): (() => void) | void => {
  // ブラウザ環境でのみ実行
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  
  // レスポンシブアクセシビリティの設定
  ResponsiveAccessibility.adjustForTouchDevice()
  ResponsiveAccessibility.adjustForScreenSize()
  
  // グローバルキーボードナビゲーションの初期化
  GlobalKeyboardNavigation.initialize()
  
  // 開発環境でのアクセシビリティ検証
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Accessibility features initialized')
    
    // 定期的なアクセシビリティチェック
    setTimeout(() => {
      const issues: string[] = []
      document.querySelectorAll('button, [role="button"], [role="dialog"], input, textarea, select').forEach(element => {
        const elementIssues = AccessibilityValidator.validateAriaAttributes(element as HTMLElement)
        issues.push(...elementIssues)
      })
      
      if (issues.length > 0) {
        console.warn('⚠️ Accessibility issues found:', issues)
      } else {
        console.log('✅ No accessibility issues detected')
      }
    }, 2000)
  }
  
  // クリーンアップ関数を返す
  return () => {
    GlobalKeyboardNavigation.cleanup()
  }
}