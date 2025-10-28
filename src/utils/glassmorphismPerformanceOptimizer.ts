/**
 * Glassmorphism Performance Optimizer
 * GPU加速とレイヤー分離による描画最適化
 */

interface PerformanceConfig {
  enableGPUAcceleration: boolean
  enableLayerSeparation: boolean
  enableBackdropFilterOptimization: boolean
  enableWillChangeOptimization: boolean
  enableContainment: boolean
  debugMode: boolean
}

interface ElementMetrics {
  element: HTMLElement
  hasBackdropFilter: boolean
  isVisible: boolean
  isAnimating: boolean
  layerDepth: number
}

class GlassmorphismPerformanceOptimizer {
  private config: PerformanceConfig
  private observedElements = new Set<HTMLElement>()
  private intersectionObserver: IntersectionObserver | null = null
  private mutationObserver: MutationObserver | null = null
  private animationFrameId: number | null = null
  private performanceMetrics = new Map<HTMLElement, ElementMetrics>()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableGPUAcceleration: true,
      enableLayerSeparation: true,
      enableBackdropFilterOptimization: true,
      enableWillChangeOptimization: true,
      enableContainment: true,
      debugMode: false,
      ...config,
    }

    this.init()
  }

  private init(): void {
    this.setupIntersectionObserver()
    this.setupMutationObserver()
    this.optimizeExistingElements()
    this.setupPerformanceMonitoring()
  }

  /**
   * 既存のガラスモーフィズム要素を最適化
   */
  private optimizeExistingElements(): void {
    const glassElements = document.querySelectorAll<HTMLElement>(
      '.glass-card, .glass-button, .glass-input, .glass-modal, [class*="glass-"]'
    )

    glassElements.forEach(element => {
      this.optimizeElement(element)
    })
  }

  /**
   * 個別要素の最適化
   */
  public optimizeElement(element: HTMLElement): void {
    if (this.observedElements.has(element)) return

    const metrics = this.analyzeElement(element)
    this.performanceMetrics.set(element, metrics)

    // GPU加速の適用
    if (this.config.enableGPUAcceleration) {
      this.applyGPUAcceleration(element, metrics)
    }

    // レイヤー分離の適用
    if (this.config.enableLayerSeparation) {
      this.applyLayerSeparation(element, metrics)
    }

    // backdrop-filter最適化
    if (this.config.enableBackdropFilterOptimization) {
      this.optimizeBackdropFilter(element, metrics)
    }

    // will-change最適化
    if (this.config.enableWillChangeOptimization) {
      this.optimizeWillChange(element, metrics)
    }

    // containment最適化
    if (this.config.enableContainment) {
      this.applyContainment(element, metrics)
    }

    this.observedElements.add(element)
    this.intersectionObserver?.observe(element)

    if (this.config.debugMode) {
      console.log('Optimized glassmorphism element:', element, metrics)
    }
  }

  /**
   * 要素の分析
   */
  private analyzeElement(element: HTMLElement): ElementMetrics {
    const computedStyle = getComputedStyle(element)
    const hasBackdropFilter =
      computedStyle.backdropFilter !== 'none' ||
      (computedStyle as any).webkitBackdropFilter !== 'none'

    const rect = element.getBoundingClientRect()
    const isVisible =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0

    const isAnimating = this.isElementAnimating(element)
    const layerDepth = this.calculateLayerDepth(element)

    return {
      element,
      hasBackdropFilter,
      isVisible,
      isAnimating,
      layerDepth,
    }
  }

  /**
   * GPU加速の適用
   */
  private applyGPUAcceleration(
    element: HTMLElement,
    metrics: ElementMetrics
  ): void {
    const style = element.style

    // 基本的なGPU加速
    style.transform = style.transform || 'translateZ(0)'
    style.backfaceVisibility = 'hidden'
    style.webkitBackfaceVisibility = 'hidden'

    // backdrop-filterを使用している要素には追加の最適化
    if (metrics.hasBackdropFilter) {
      style.isolation = 'isolate'
      style.transformStyle = 'preserve-3d'
    }

    // アニメーション中の要素には追加の最適化
    if (metrics.isAnimating) {
      style.perspective = '1000px'
    }
  }

  /**
   * レイヤー分離の適用
   */
  private applyLayerSeparation(
    element: HTMLElement,
    metrics: ElementMetrics
  ): void {
    const style = element.style

    // レイヤー深度に基づく最適化
    if (metrics.layerDepth > 2) {
      style.zIndex = String(metrics.layerDepth * 10)
      style.isolation = 'isolate'
    }

    // backdrop-filter要素の分離
    if (metrics.hasBackdropFilter) {
      style.isolation = 'isolate'
      style.position = style.position || 'relative'
    }
  }

  /**
   * backdrop-filter最適化
   */
  private optimizeBackdropFilter(
    element: HTMLElement,
    metrics: ElementMetrics
  ): void {
    if (!metrics.hasBackdropFilter) return

    const style = element.style

    // 不要なbackdrop-filterの削除チェック
    if (!metrics.isVisible) {
      style.backdropFilter = 'none'
      ;(style as any).webkitBackdropFilter = 'none'
      return
    }

    // backdrop-filterの最適化
    const computedStyle = getComputedStyle(element)
    const currentFilter =
      computedStyle.backdropFilter ||
      (computedStyle as any).webkitBackdropFilter

    // ぼかし値の最適化（過度なぼかしを制限）
    if (currentFilter.includes('blur(')) {
      const blurMatch = currentFilter.match(/blur\((\d+)px\)/)
      if (blurMatch) {
        const blurValue = parseInt(blurMatch[1])
        if (blurValue > 20) {
          const optimizedFilter = currentFilter.replace(
            /blur\(\d+px\)/,
            'blur(20px)'
          )
          style.backdropFilter = optimizedFilter
          ;(style as any).webkitBackdropFilter = optimizedFilter
        }
      }
    }

    // レイヤー最適化
    style.isolation = 'isolate'
    style.transform = style.transform || 'translate3d(0, 0, 0)'
  }

  /**
   * will-change最適化
   */
  private optimizeWillChange(
    element: HTMLElement,
    metrics: ElementMetrics
  ): void {
    const style = element.style

    if (metrics.isAnimating) {
      // アニメーション中は適切なwill-changeを設定
      if (metrics.hasBackdropFilter) {
        style.willChange = 'transform, backdrop-filter, opacity'
      } else {
        style.willChange = 'transform, opacity'
      }
    } else if (this.isInteractiveElement(element)) {
      // インタラクティブ要素には控えめなwill-changeを設定
      style.willChange = 'transform'
    } else {
      // 静的要素はwill-changeをリセット
      style.willChange = 'auto'
    }
  }

  /**
   * containment最適化
   */
  private applyContainment(
    element: HTMLElement,
    metrics: ElementMetrics
  ): void {
    const style = element.style

    // 適切なcontainmentの適用
    if (metrics.hasBackdropFilter) {
      style.contain = 'layout style paint'
    } else {
      style.contain = 'layout style'
    }

    // 大きな要素にはsize containmentも追加
    const rect = element.getBoundingClientRect()
    if (rect.width > 500 || rect.height > 500) {
      style.contain = 'layout style paint size'
    }
  }

  /**
   * Intersection Observerのセットアップ
   */
  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const element = entry.target as HTMLElement
          const metrics = this.performanceMetrics.get(element)

          if (metrics) {
            metrics.isVisible = entry.isIntersecting

            // 見えない要素のbackdrop-filterを無効化
            if (!entry.isIntersecting && metrics.hasBackdropFilter) {
              element.style.backdropFilter = 'none'
              ;(element.style as any).webkitBackdropFilter = 'none'
            } else if (entry.isIntersecting && metrics.hasBackdropFilter) {
              // 見える要素のbackdrop-filterを復元
              element.style.backdropFilter = ''
              ;(element.style as any).webkitBackdropFilter = ''
            }
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: [0, 0.1, 0.5, 1],
      }
    )
  }

  /**
   * Mutation Observerのセットアップ
   */
  private setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              if (this.isGlassmorphismElement(element)) {
                this.optimizeElement(element)
              }

              // 子要素もチェック
              const glassChildren =
                element.querySelectorAll<HTMLElement>('[class*="glass-"]')
              glassChildren.forEach(child => this.optimizeElement(child))
            }
          })
        }
      })
    })

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  /**
   * パフォーマンス監視のセットアップ
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.debugMode) return

    const monitorPerformance = () => {
      const paintEntries = performance.getEntriesByType('paint')
      const layoutEntries = performance.getEntriesByType('layout-shift')

      if (paintEntries.length > 0 || layoutEntries.length > 0) {
        console.log('Glassmorphism Performance Metrics:', {
          paint: paintEntries,
          layoutShift: layoutEntries,
          optimizedElements: this.observedElements.size,
        })
      }

      this.animationFrameId = requestAnimationFrame(monitorPerformance)
    }

    this.animationFrameId = requestAnimationFrame(monitorPerformance)
  }

  /**
   * ユーティリティメソッド
   */
  private isElementAnimating(element: HTMLElement): boolean {
    const computedStyle = getComputedStyle(element)
    return (
      computedStyle.animationName !== 'none' ||
      computedStyle.transitionProperty !== 'none'
    )
  }

  private calculateLayerDepth(element: HTMLElement): number {
    let depth = 0
    let current = element.parentElement

    while (current) {
      const style = getComputedStyle(current)
      if (
        style.position !== 'static' ||
        style.zIndex !== 'auto' ||
        style.opacity !== '1' ||
        style.transform !== 'none'
      ) {
        depth++
      }
      current = current.parentElement
    }

    return depth
  }

  private isInteractiveElement(element: HTMLElement): boolean {
    return (
      element.matches(
        'button, input, select, textarea, [role="button"], [tabindex]'
      ) ||
      element.classList.contains('glass-card-interactive') ||
      element.style.cursor === 'pointer'
    )
  }

  private isGlassmorphismElement(element: HTMLElement): boolean {
    return (
      element.classList.toString().includes('glass-') ||
      getComputedStyle(element).backdropFilter !== 'none'
    )
  }

  /**
   * 最適化の無効化
   */
  public disableOptimization(element: HTMLElement): void {
    if (!this.observedElements.has(element)) return

    const style = element.style
    style.willChange = 'auto'
    style.transform = ''
    style.backfaceVisibility = ''
    style.isolation = ''
    style.contain = ''

    this.observedElements.delete(element)
    this.performanceMetrics.delete(element)
    this.intersectionObserver?.unobserve(element)
  }

  /**
   * 全体的な最適化の無効化
   */
  public destroy(): void {
    this.intersectionObserver?.disconnect()
    this.mutationObserver?.disconnect()

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.observedElements.forEach(element => {
      this.disableOptimization(element)
    })

    this.observedElements.clear()
    this.performanceMetrics.clear()
  }

  /**
   * パフォーマンス統計の取得
   */
  public getPerformanceStats(): {
    optimizedElements: number
    visibleElements: number
    animatingElements: number
    backdropFilterElements: number
  } {
    let visibleElements = 0
    let animatingElements = 0
    let backdropFilterElements = 0

    this.performanceMetrics.forEach(metrics => {
      if (metrics.isVisible) visibleElements++
      if (metrics.isAnimating) animatingElements++
      if (metrics.hasBackdropFilter) backdropFilterElements++
    })

    return {
      optimizedElements: this.observedElements.size,
      visibleElements,
      animatingElements,
      backdropFilterElements,
    }
  }
}

// シングルトンインスタンス
let optimizerInstance: GlassmorphismPerformanceOptimizer | null = null

/**
 * グローバルな最適化の初期化
 */
export const initializeGlassmorphismOptimization = (
  config?: Partial<PerformanceConfig>
): void => {
  if (optimizerInstance) {
    optimizerInstance.destroy()
  }

  optimizerInstance = new GlassmorphismPerformanceOptimizer(config)
}

/**
 * 個別要素の最適化
 */
export const optimizeGlassmorphismElement = (element: HTMLElement): void => {
  if (!optimizerInstance) {
    initializeGlassmorphismOptimization()
  }

  optimizerInstance?.optimizeElement(element)
}

/**
 * 最適化の無効化
 */
export const disableGlassmorphismOptimization = (
  element?: HTMLElement
): void => {
  if (element && optimizerInstance) {
    optimizerInstance.disableOptimization(element)
  } else if (optimizerInstance) {
    optimizerInstance.destroy()
    optimizerInstance = null
  }
}

/**
 * パフォーマンス統計の取得
 */
export const getGlassmorphismPerformanceStats = () => {
  return (
    optimizerInstance?.getPerformanceStats() || {
      optimizedElements: 0,
      visibleElements: 0,
      animatingElements: 0,
      backdropFilterElements: 0,
    }
  )
}

export { GlassmorphismPerformanceOptimizer }
export type { PerformanceConfig, ElementMetrics }
