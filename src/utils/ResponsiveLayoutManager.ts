import { ScreenSize } from '@/hooks/useResponsive'
import {
  LayoutStatePersistence,
  layoutPersistence,
} from './LayoutStatePersistence'

/**
 * レイアウト状態の管理インターフェース
 */
export interface LayoutState {
  deviceType: 'mobile' | 'tablet' | 'desktop'
  screenSize: {
    width: number
    height: number
  }
  orientation: 'portrait' | 'landscape'
  lastUpdated: number
  isStable: boolean
  userAgent: string
  touchCapable: boolean
}

/**
 * レイアウト復旧設定
 */
export interface LayoutRecoveryConfig {
  maxRetries: number
  retryDelay: number
  enableAutoRecovery: boolean
  preserveUserState: boolean
}

/**
 * 動的レイアウト調整の設定
 */
export interface DynamicLayoutConfig {
  enableOrientationHandling: boolean
  enableResizeHandling: boolean
  resizeDebounceDelay: number
  orientationChangeDelay: number
  autoRecoveryEnabled: boolean
  layoutValidationInterval: number
}

/**
 * レスポンシブレイアウト管理クラス
 * ページリフレッシュ後のレイアウト崩れを防止し、デバイス種別の永続化と状態復元を行う
 */
export class ResponsiveLayoutManager {
  private static instance: ResponsiveLayoutManager | null = null
  private readonly STABILITY_THRESHOLD = 1000 // 1秒間安定していればstableとみなす

  private currentState: LayoutState | null = null
  private stabilityTimer: NodeJS.Timeout | null = null
  private resizeTimer: NodeJS.Timeout | null = null
  private orientationTimer: NodeJS.Timeout | null = null
  private validationTimer: NodeJS.Timeout | null = null
  private persistence: LayoutStatePersistence
  private recoveryConfig: LayoutRecoveryConfig = {
    maxRetries: 3,
    retryDelay: 500,
    enableAutoRecovery: true,
    preserveUserState: true,
  }
  private dynamicConfig: DynamicLayoutConfig = {
    enableOrientationHandling: true,
    enableResizeHandling: true,
    resizeDebounceDelay: 300,
    orientationChangeDelay: 500,
    autoRecoveryEnabled: true,
    layoutValidationInterval: 30000, // 30秒ごとにレイアウトを検証
  }

  private constructor() {
    this.persistence = layoutPersistence
    this.initializeLayoutState()
    this.setupEventListeners()
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ResponsiveLayoutManager {
    if (!ResponsiveLayoutManager.instance) {
      ResponsiveLayoutManager.instance = new ResponsiveLayoutManager()
    }
    return ResponsiveLayoutManager.instance
  }

  /**
   * デバイス種別を検出し永続化
   */
  public detectAndPersistDevice(): LayoutState {
    const width = window.innerWidth
    const height = window.innerHeight
    const userAgent = navigator.userAgent
    const touchCapable =
      'ontouchstart' in window || navigator.maxTouchPoints > 0

    // デバイス種別の判定
    let deviceType: 'mobile' | 'tablet' | 'desktop'
    if (width <= 900) {
      deviceType = 'mobile'
    } else if (width <= 1024) {
      deviceType = 'tablet'
    } else {
      deviceType = 'desktop'
    }

    const newState: LayoutState = {
      deviceType,
      screenSize: { width, height },
      orientation: width > height ? 'landscape' : 'portrait',
      lastUpdated: Date.now(),
      isStable: false,
      userAgent,
      touchCapable,
    }

    this.currentState = newState
    this.persistence.saveLayoutState(newState)
    this.markAsStableAfterDelay()

    console.log(
      '📱 Device detected and persisted:',
      deviceType,
      `${width}x${height}`
    )
    return newState
  }

  /**
   * レイアウト状態を復元
   */
  public restoreLayoutState(): LayoutState | null {
    try {
      const restoredState = this.persistence.restoreLayoutState()

      if (!restoredState) {
        console.log('📱 No stored layout state found')
        return this.detectAndPersistDevice()
      }

      // 現在の画面サイズと比較して大きな差異がある場合は再検出
      const currentWidth = window.innerWidth
      const currentHeight = window.innerHeight
      const widthDiff = Math.abs(currentWidth - restoredState.screenSize.width)
      const heightDiff = Math.abs(
        currentHeight - restoredState.screenSize.height
      )

      if (widthDiff > 100 || heightDiff > 100) {
        console.log('📱 Screen size changed significantly, re-detecting')
        return this.detectAndPersistDevice()
      }

      this.currentState = restoredState
      console.log('📱 Layout state restored:', restoredState.deviceType)
      return restoredState
    } catch (error) {
      console.error('📱 Error restoring layout state:', error)
      this.persistence.cleanupInvalidState()
      return this.detectAndPersistDevice()
    }
  }

  /**
   * レイアウトちらつきを防止
   */
  public preventLayoutFlicker(): void {
    // CSSクラスを使用してレイアウトの初期状態を制御
    const body = document.body

    // 初期化中のクラスを追加
    body.classList.add('layout-initializing')

    // レイアウト状態を復元
    const state = this.restoreLayoutState()

    if (state) {
      // デバイス種別に応じたクラスを追加
      body.classList.add(`device-${state.deviceType}`)
      body.classList.add(`orientation-${state.orientation}`)

      if (state.touchCapable) {
        body.classList.add('touch-capable')
      }
    }

    // 短時間後に初期化クラスを削除
    setTimeout(() => {
      body.classList.remove('layout-initializing')
    }, 100)
  }

  /**
   * 現在のレイアウト状態を取得
   */
  public getCurrentState(): LayoutState | null {
    return this.currentState
  }

  /**
   * レイアウト状態を更新
   */
  public updateLayoutState(screenSize: ScreenSize): void {
    if (!this.currentState) {
      this.detectAndPersistDevice()
      return
    }

    const updatedState: LayoutState = {
      ...this.currentState,
      screenSize: {
        width: screenSize.width,
        height: screenSize.height,
      },
      orientation: screenSize.isLandscape ? 'landscape' : 'portrait',
      lastUpdated: Date.now(),
      isStable: false,
    }

    // デバイス種別の再判定
    if (screenSize.isMobile) {
      updatedState.deviceType = 'mobile'
    } else if (screenSize.isTablet) {
      updatedState.deviceType = 'tablet'
    } else {
      updatedState.deviceType = 'desktop'
    }

    this.currentState = updatedState
    this.persistence.saveLayoutState(updatedState)
    this.markAsStableAfterDelay()
  }

  /**
   * レイアウト崩れを検出
   */
  public detectLayoutFailure(): boolean {
    if (!this.currentState) return false

    const currentWidth = window.innerWidth
    const currentHeight = window.innerHeight
    const storedWidth = this.currentState.screenSize.width
    const storedHeight = this.currentState.screenSize.height

    // 画面サイズが大幅に変わっているかチェック
    const widthRatio = currentWidth / storedWidth
    const heightRatio = currentHeight / storedHeight

    // 50%以上の変化があれば崩れとみなす
    const hasSignificantChange =
      widthRatio < 0.5 ||
      widthRatio > 2.0 ||
      heightRatio < 0.5 ||
      heightRatio > 2.0

    if (hasSignificantChange) {
      console.warn('📱 Layout failure detected:', {
        stored: `${storedWidth}x${storedHeight}`,
        current: `${currentWidth}x${currentHeight}`,
        ratios: { width: widthRatio, height: heightRatio },
      })
    }

    return hasSignificantChange
  }

  /**
   * レイアウト復旧を試行
   */
  public async attemptLayoutRecovery(): Promise<boolean> {
    if (!this.recoveryConfig.enableAutoRecovery) {
      return false
    }

    console.log('📱 Attempting layout recovery...')

    for (
      let attempt = 1;
      attempt <= this.recoveryConfig.maxRetries;
      attempt++
    ) {
      try {
        // 現在の状態を再検出
        this.detectAndPersistDevice()

        // 少し待ってから検証
        await new Promise(resolve =>
          setTimeout(resolve, this.recoveryConfig.retryDelay)
        )

        // 復旧が成功したかチェック
        if (!this.detectLayoutFailure()) {
          console.log(`📱 Layout recovery successful on attempt ${attempt}`)
          return true
        }
      } catch (error) {
        console.error(`📱 Layout recovery attempt ${attempt} failed:`, error)
      }
    }

    console.error('📱 Layout recovery failed after all attempts')
    return false
  }

  /**
   * 復旧設定を更新
   */
  public updateRecoveryConfig(config: Partial<LayoutRecoveryConfig>): void {
    this.recoveryConfig = { ...this.recoveryConfig, ...config }
  }

  /**
   * 動的レイアウト設定を更新
   */
  public updateDynamicConfig(config: Partial<DynamicLayoutConfig>): void {
    this.dynamicConfig = { ...this.dynamicConfig, ...config }

    // 設定変更に応じてタイマーを再設定
    if (this.validationTimer) {
      clearInterval(this.validationTimer)
      this.validationTimer = null
    }

    if (
      this.dynamicConfig.autoRecoveryEnabled &&
      this.dynamicConfig.layoutValidationInterval > 0
    ) {
      this.startLayoutValidation()
    }
  }

  /**
   * 画面サイズ変更を処理
   */
  public handleScreenSizeChange(newScreenSize: ScreenSize): void {
    if (!this.dynamicConfig.enableResizeHandling) return

    // デバウンス処理
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
    }

    this.resizeTimer = setTimeout(() => {
      this.processScreenSizeChange(newScreenSize)
    }, this.dynamicConfig.resizeDebounceDelay)
  }

  /**
   * オリエンテーション変更を処理
   */
  public handleOrientationChange(): void {
    if (!this.dynamicConfig.enableOrientationHandling) return

    // オリエンテーション変更は特別な遅延を設ける
    if (this.orientationTimer) {
      clearTimeout(this.orientationTimer)
    }

    this.orientationTimer = setTimeout(() => {
      this.processOrientationChange()
    }, this.dynamicConfig.orientationChangeDelay)
  }

  /**
   * レイアウト崩れの自動検出と修正
   */
  public performLayoutValidation(): boolean {
    try {
      // レイアウト崩れを検出
      if (this.detectLayoutFailure()) {
        console.warn('📱 Layout failure detected during validation')

        if (this.dynamicConfig.autoRecoveryEnabled) {
          this.attemptLayoutRecovery().then(success => {
            if (!success) {
              console.warn('📱 Auto recovery failed during validation')
            }
          })
        }
        return false
      }

      // DOM要素の整合性をチェック
      if (this.validateDOMIntegrity()) {
        return true
      }

      console.warn('📱 DOM integrity check failed')
      if (this.dynamicConfig.autoRecoveryEnabled) {
        this.attemptLayoutRecovery().then(success => {
          if (!success) {
            console.warn('📱 Auto recovery failed during DOM validation')
          }
        })
      }

      return false
    } catch (error) {
      console.error('📱 Error during layout validation:', error)
      return false
    }
  }

  /**
   * レイアウト状態の強制同期
   */
  public forceSyncLayoutState(): void {
    console.log('📱 Forcing layout state synchronization')

    const currentScreenSize = {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth <= 900,
      isTablet: window.innerWidth > 900 && window.innerWidth <= 1024,
      isDesktop: window.innerWidth > 1024,
      isDesktopLarge: window.innerWidth > 1200,
      isMobileSmall: window.innerWidth <= 480,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isLandscape: window.innerWidth > window.innerHeight,
    } as ScreenSize

    this.updateLayoutState(currentScreenSize)

    // DOM要素の状態も同期
    this.syncDOMState()

    // フッタの位置を修正
    this.fixFooterPosition()
  }

  /**
   * フッタナビゲーションの位置を修正
   */
  public fixFooterPosition(): void {
    try {
      // 複数のセレクターでナビゲーション要素を検索
      const navigationElement =
        document.querySelector('[class*="NavigationSection"]') ||
        document.querySelector('[class*="MobileNavigation"]') ||
        document.querySelector(
          'div[style*="position: fixed"][style*="bottom: 0"]'
        )

      if (!navigationElement || !this.currentState) return

      if (this.currentState.deviceType === 'mobile') {
        const element = navigationElement as HTMLElement
        const rect = element.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        console.log('📱 Footer position check:', {
          bottom: rect.bottom,
          top: rect.top,
          viewportHeight,
          isVisible: rect.bottom <= viewportHeight && rect.top < viewportHeight,
        })

        // フッタが見切れている場合の修正
        if (
          rect.bottom > viewportHeight ||
          rect.top >= viewportHeight ||
          rect.height === 0
        ) {
          console.log('📱 Fixing footer position - footer is cut off or hidden')

          // フッタの強制修正
          element.style.position = 'fixed'
          element.style.bottom = '0'
          element.style.left = '0'
          element.style.right = '0'
          element.style.zIndex = '9999'
          element.style.transform = 'translateZ(0)'
          element.style.visibility = 'visible'
          element.style.display = 'flex'
          element.style.minHeight =
            'calc(88px + env(safe-area-inset-bottom, 0px))'

          // メインコンテンツの調整
          const scrollableContainer = document.querySelector(
            '[class*="ScrollableContainer"]'
          )
          if (scrollableContainer) {
            const containerElement = scrollableContainer as HTMLElement
            containerElement.style.bottom = '0'
            containerElement.style.paddingBottom =
              'calc(108px + env(safe-area-inset-bottom, 0px))'
            containerElement.style.boxSizing = 'border-box'
          }

          console.log('📱 Footer position fixed')
        } else {
          console.log('📱 Footer position is correct')
        }
      }
    } catch (error) {
      console.error('📱 Failed to fix footer position:', error)
    }
  }

  /**
   * 一定時間後に状態を安定とマーク
   */
  private markAsStableAfterDelay(): void {
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer)
    }

    this.stabilityTimer = setTimeout(() => {
      if (this.currentState) {
        this.currentState.isStable = true
        this.persistence.saveLayoutState(this.currentState)
        console.log('📱 Layout state marked as stable')
      }
    }, this.STABILITY_THRESHOLD)
  }

  /**
   * レイアウト状態の初期化
   */
  private initializeLayoutState(): void {
    // ページ読み込み時にレイアウトちらつきを防止
    if (typeof window !== 'undefined') {
      this.preventLayoutFlicker()
    }
  }

  /**
   * 画面サイズ変更の実際の処理
   */
  private processScreenSizeChange(newScreenSize: ScreenSize): void {
    console.log(
      '📱 Processing screen size change:',
      `${newScreenSize.width}x${newScreenSize.height}`
    )

    // 現在の状態と比較
    if (this.currentState) {
      const widthDiff = Math.abs(
        newScreenSize.width - this.currentState.screenSize.width
      )
      const heightDiff = Math.abs(
        newScreenSize.height - this.currentState.screenSize.height
      )

      // 小さな変更は無視
      if (widthDiff < 10 && heightDiff < 10) {
        return
      }
    }

    // レイアウト状態を更新
    this.updateLayoutState(newScreenSize)

    // レイアウト崩れをチェック
    setTimeout(() => {
      if (this.detectLayoutFailure()) {
        console.log(
          '📱 Layout failure detected after resize, attempting recovery'
        )
        this.attemptLayoutRecovery()
      }
    }, 100)
  }

  /**
   * オリエンテーション変更の実際の処理
   */
  private processOrientationChange(): void {
    console.log('📱 Processing orientation change')

    const currentWidth = window.innerWidth
    const currentHeight = window.innerHeight
    const newOrientation =
      currentWidth > currentHeight ? 'landscape' : 'portrait'

    if (this.currentState && this.currentState.orientation !== newOrientation) {
      console.log(
        `📱 Orientation changed: ${this.currentState.orientation} → ${newOrientation}`
      )

      // 状態を更新
      this.currentState.orientation = newOrientation
      this.currentState.screenSize = {
        width: currentWidth,
        height: currentHeight,
      }
      this.currentState.lastUpdated = Date.now()
      this.currentState.isStable = false

      this.persistence.saveLayoutState(this.currentState)

      // DOM状態を同期
      this.syncDOMState()

      // 安定性タイマーを再開
      this.markAsStableAfterDelay()

      // レイアウト検証
      setTimeout(() => {
        this.performLayoutValidation()
      }, 200)
    }
  }

  /**
   * DOM要素の整合性を検証
   */
  private validateDOMIntegrity(): boolean {
    try {
      const body = document.body

      // 基本的なDOM要素の存在確認
      const mainContainer =
        document.querySelector('[class*="LayoutContainer"]') ||
        document.querySelector('main') ||
        document.querySelector('#root > div')

      if (!mainContainer) {
        console.warn('📱 Main container not found')
        return false
      }

      // フッタナビゲーションの位置確認
      const navigationElement = document.querySelector(
        '[class*="NavigationSection"]'
      )
      if (navigationElement && this.currentState?.deviceType === 'mobile') {
        const rect = navigationElement.getBoundingClientRect()
        const viewportHeight = window.innerHeight

        // フッタが画面外に出ている場合は修正
        if (rect.bottom > viewportHeight) {
          console.warn('📱 Footer navigation is cut off, fixing position')
          const element = navigationElement as HTMLElement
          element.style.position = 'fixed'
          element.style.bottom = '0'
          element.style.zIndex = '9999'
        }
      }

      // レイアウト関連のクラスが適切に設定されているかチェック
      if (this.currentState) {
        const expectedDeviceClass = `device-${this.currentState.deviceType}`
        const expectedOrientationClass = `orientation-${this.currentState.orientation}`

        if (!body.classList.contains(expectedDeviceClass)) {
          console.warn(`📱 Missing device class: ${expectedDeviceClass}`)
          body.classList.add(expectedDeviceClass)
        }

        if (!body.classList.contains(expectedOrientationClass)) {
          console.warn(
            `📱 Missing orientation class: ${expectedOrientationClass}`
          )
          body.classList.add(expectedOrientationClass)
        }
      }

      return true
    } catch (error) {
      console.error('📱 DOM integrity validation failed:', error)
      return false
    }
  }

  /**
   * DOM状態を現在のレイアウト状態と同期
   */
  private syncDOMState(): void {
    if (!this.currentState) return

    try {
      const body = document.body

      // 古いクラスを削除
      body.classList.remove('device-mobile', 'device-tablet', 'device-desktop')
      body.classList.remove('orientation-portrait', 'orientation-landscape')

      // 新しいクラスを追加
      body.classList.add(`device-${this.currentState.deviceType}`)
      body.classList.add(`orientation-${this.currentState.orientation}`)

      if (this.currentState.touchCapable) {
        body.classList.add('touch-capable')
      } else {
        body.classList.remove('touch-capable')
      }

      console.log('📱 DOM state synchronized with layout state')
    } catch (error) {
      console.error('📱 Failed to sync DOM state:', error)
    }
  }

  /**
   * レイアウト検証タイマーを開始
   */
  private startLayoutValidation(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer)
    }

    this.validationTimer = setInterval(() => {
      this.performLayoutValidation()
    }, this.dynamicConfig.layoutValidationInterval)

    console.log(
      `📱 Layout validation started (interval: ${this.dynamicConfig.layoutValidationInterval}ms)`
    )
  }

  /**
   * イベントリスナーの設定
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return

    // ページ離脱時に状態を保存
    window.addEventListener('beforeunload', () => {
      if (this.currentState) {
        this.persistence.saveLayoutState(this.currentState)
      }
    })

    // ページ可視性変更時の処理
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.currentState) {
        // ページが再表示された時にレイアウト崩れをチェック
        setTimeout(() => {
          if (this.detectLayoutFailure()) {
            this.attemptLayoutRecovery()
          }
        }, 100)
      }
    })

    // リサイズイベントの処理
    let resizeTimeout: NodeJS.Timeout
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const screenSize = {
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth <= 900,
          isTablet: window.innerWidth > 900 && window.innerWidth <= 1024,
          isDesktop: window.innerWidth > 1024,
          isDesktopLarge: window.innerWidth > 1200,
          isMobileSmall: window.innerWidth <= 480,
          isTouchDevice:
            'ontouchstart' in window || navigator.maxTouchPoints > 0,
          isLandscape: window.innerWidth > window.innerHeight,
        } as ScreenSize

        this.handleScreenSizeChange(screenSize)
      }, 100)
    })

    // オリエンテーション変更の処理
    window.addEventListener('orientationchange', () => {
      this.handleOrientationChange()
    })

    // 定期的なレイアウト検証を開始
    if (this.dynamicConfig.autoRecoveryEnabled) {
      this.startLayoutValidation()
    }
  }

  /**
   * インスタンスを破棄
   */
  public destroy(): void {
    // 全てのタイマーをクリア
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer)
      this.stabilityTimer = null
    }

    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = null
    }

    if (this.orientationTimer) {
      clearTimeout(this.orientationTimer)
      this.orientationTimer = null
    }

    if (this.validationTimer) {
      clearInterval(this.validationTimer)
      this.validationTimer = null
    }

    ResponsiveLayoutManager.instance = null
    console.log('📱 ResponsiveLayoutManager destroyed')
  }
}

/**
 * ResponsiveLayoutManagerのシングルトンインスタンスを取得
 */
export const getLayoutManager = (): ResponsiveLayoutManager => {
  return ResponsiveLayoutManager.getInstance()
}

/**
 * レイアウト状態を復元するヘルパー関数
 */
export const restoreLayoutState = (): LayoutState | null => {
  return getLayoutManager().restoreLayoutState()
}

/**
 * レイアウトちらつきを防止するヘルパー関数
 */
export const preventLayoutFlicker = (): void => {
  getLayoutManager().preventLayoutFlicker()
}
