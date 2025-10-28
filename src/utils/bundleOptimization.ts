/**
 * Bundle Optimization Utilities
 * Provides utilities for optimizing bundle size and performance
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface BundleAnalysis {
  totalSize: number
  chunkSizes: Record<string, number>
  recommendations: string[]
  warnings: string[]
}

export class BundleOptimizer {
  private static readonly MAX_CHUNK_SIZE = 500 * 1024 // 500KB
  private static readonly MAX_TOTAL_SIZE = 2 * 1024 * 1024 // 2MB

  /**
   * Analyze bundle composition and provide optimization recommendations
   */
  static analyzeBundleSize(bundleStats: any): BundleAnalysis {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      chunkSizes: {},
      recommendations: [],
      warnings: [],
    }

    // Calculate total size and individual chunk sizes
    if (bundleStats.chunks) {
      bundleStats.chunks.forEach((chunk: any) => {
        const size = chunk.size || 0
        analysis.totalSize += size
        analysis.chunkSizes[chunk.name || 'unknown'] = size

        if (size > this.MAX_CHUNK_SIZE) {
          analysis.warnings.push(
            `Large chunk detected: ${chunk.name} (${Math.round(size / 1024)}KB)`
          )
          analysis.recommendations.push(
            `Consider code splitting for ${chunk.name} chunk`
          )
        }
      })
    }

    // Generate recommendations based on analysis
    if (analysis.totalSize > this.MAX_TOTAL_SIZE) {
      analysis.warnings.push(
        `Total bundle size is large: ${Math.round(analysis.totalSize / 1024 / 1024)}MB`
      )
      analysis.recommendations.push(
        'Consider implementing lazy loading for non-critical components'
      )
    }

    // Check for common optimization opportunities
    this.addOptimizationRecommendations(analysis)

    return analysis
  }

  /**
   * Add common optimization recommendations
   */
  private static addOptimizationRecommendations(
    analysis: BundleAnalysis
  ): void {
    analysis.recommendations.push(
      'Enable tree shaking for unused code elimination',
      'Use dynamic imports for route-based code splitting',
      'Optimize images and assets with proper compression',
      'Consider using a CDN for static assets',
      'Implement service worker for caching strategies'
    )
  }

  /**
   * Generate Vite configuration optimizations
   */
  static generateViteOptimizations(): Record<string, any> {
    return {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor libraries
              vendor: ['react', 'react-dom'],
              motion: ['framer-motion'],
              styled: ['styled-components'],
              firebase: ['firebase'],

              // Glassmorphism system
              glassmorphism: [
                './src/utils/glassmorphismPerformanceOptimizer',
                './src/utils/glassmorphismAccessibility',
                './src/utils/glassmorphismBrowserCompatibility',
              ],

              // Services
              services: [
                './src/services/musicDataService',
                './src/services/dataManager',
                './src/services/sharedDataService',
              ],
            },
          },
        },

        // Compression and minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.warn'],
            passes: 2,
          },
          mangle: {
            safari10: true,
          },
        },

        // Asset optimization
        assetsInlineLimit: 4096, // 4KB
        cssCodeSplit: true,
        sourcemap: false, // Disable for production

        // Chunk size warnings
        chunkSizeWarningLimit: 500,
      },
    }
  }

  /**
   * Performance monitoring utilities
   */
  static measurePerformance(): Promise<PerformanceMetrics> {
    return new Promise(resolve => {
      const metrics: PerformanceMetrics = {
        loadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
      }

      // Measure load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming
        metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
        metrics.domContentLoaded =
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart

        // Measure paint metrics
        const paintEntries = performance.getEntriesByType('paint')
        paintEntries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime
          }
        })

        // Measure LCP if available
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver(list => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            metrics.largestContentfulPaint = lastEntry.startTime
            observer.disconnect()
          })
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
        }

        resolve(metrics)
      })
    })
  }

  /**
   * Memory usage monitoring
   */
  static monitorMemoryUsage(): MemoryUsage | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      }
    }
    return null
  }

  /**
   * Bundle size tracking
   */
  static trackBundleMetrics(): void {
    // Track bundle loading performance
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          console.log(`Asset loaded: ${entry.name} (${entry.duration}ms)`)
        }
      })
    })
    observer.observe({ entryTypes: ['resource'] })
  }
}

export interface PerformanceMetrics {
  loadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
}

export interface MemoryUsage {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  usagePercentage: number
}

/**
 * Lazy loading utilities for code splitting
 */
export class LazyLoadingManager {
  private static loadedModules = new Set<string>()

  /**
   * Dynamically import a module with error handling
   */
  static async loadModule<T>(
    moduleFactory: () => Promise<T>,
    moduleName: string
  ): Promise<T> {
    if (this.loadedModules.has(moduleName)) {
      console.log(`Module ${moduleName} already loaded`)
    }

    try {
      const module = await moduleFactory()
      this.loadedModules.add(moduleName)
      console.log(`Successfully loaded module: ${moduleName}`)
      return module
    } catch (error) {
      console.error(`Failed to load module ${moduleName}:`, error)
      throw error
    }
  }

  /**
   * Preload critical modules
   */
  static async preloadCriticalModules(): Promise<void> {
    const criticalModules: Array<() => Promise<any>> = [
      () => import('../services/musicDataService'),
      () => import('../services/dataManager'),
      () => import('../utils/glassmorphismPerformanceOptimizer'),
    ]

    try {
      await Promise.all(
        criticalModules.map((factory, index) =>
          this.loadModule(factory, `critical-module-${index}`)
        )
      )
      console.log('All critical modules preloaded successfully')
    } catch (error) {
      console.warn('Some critical modules failed to preload:', error)
    }
  }

  /**
   * Load modules on demand based on user interaction
   */
  static setupLazyLoading(): void {
    // Intersection Observer for lazy loading components
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            const moduleName = element.dataset.lazyModule
            if (moduleName) {
              this.loadModuleByName(moduleName)
              observer.unobserve(element)
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    // Observe elements with lazy loading attributes
    document.querySelectorAll('[data-lazy-module]').forEach(element => {
      observer.observe(element)
    })
  }

  private static async loadModuleByName(moduleName: string): Promise<void> {
    const moduleMap: Record<string, () => Promise<any>> = {
      'tag-editing': () => import('../components/TagEditingScreen'),
      'song-selection': () => import('../components/SongSelectionScreen'),
      'glassmorphism-utils': () =>
        import('../utils/glassmorphismBrowserCompatibility'),
    }

    const factory = moduleMap[moduleName]
    if (factory) {
      await this.loadModule(factory, moduleName)
    }
  }
}

/**
 * Asset optimization utilities
 */
export class AssetOptimizer {
  /**
   * Optimize image loading with lazy loading and WebP support
   */
  static optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]')

    const imageObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    images.forEach(img => imageObserver.observe(img))
  }

  /**
   * Preload critical assets
   */
  static preloadCriticalAssets(): void {
    const criticalAssets = [
      '/music-bubble-explorer/assets/css/index.css',
      '/music-bubble-explorer/bubble-icon.svg',
    ]

    criticalAssets.forEach(asset => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = asset
      link.as = asset.endsWith('.css') ? 'style' : 'image'
      document.head.appendChild(link)
    })
  }
}

// Initialize optimization on module load
if (typeof window !== 'undefined') {
  // Initialize lazy loading
  LazyLoadingManager.setupLazyLoading()

  // Optimize assets
  AssetOptimizer.optimizeImages()
  AssetOptimizer.preloadCriticalAssets()

  // Track performance
  BundleOptimizer.trackBundleMetrics()
}
