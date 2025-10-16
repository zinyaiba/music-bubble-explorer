import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import './App.css'
import './styles/errorStyles.css'

import { ThemeProvider } from './components/ThemeProvider'
import { Layout } from './components/Layout'
import { Navigation } from './components/Navigation'
import { BubbleCanvas } from './components/BubbleCanvas'
import { DetailModal } from './components/DetailModal'
import { MusicDataService } from './services/musicDataService'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from './services/bubbleManager'
import { EnhancedBubbleManager } from './services/enhancedBubbleManager'
import { BubbleEntity } from './types/bubble'
import { Song } from './types/music'
import { useResponsive, calculateOptimalBubbleCount, calculateOptimalCanvasSize } from './hooks/useResponsive'
import { ErrorBoundary, DataLoadingErrorBoundary } from './components/ErrorBoundary'
import { DataLoadingFallback, NetworkErrorFallback, GenericErrorFallback, InlineErrorDisplay } from './components/FallbackComponents'
import { SongRegistrationForm } from './components/SongRegistrationForm'
import { SongManagement } from './components/SongManagement'
import { FirebaseConnectionTest } from './components/FirebaseConnectionTest'
// ErrorHandler import removed - using simple error handling
import { announceToScreenReader, initializeAccessibility } from './utils/accessibility'
import { initializeResponsiveSystem } from './utils/responsiveUtils'
import { MobileOptimizer } from './utils/mobileOptimization'
import { PWAInstallButton, PWAUpdateBanner } from './components/PWAComponents'

import { DebugLogger } from './utils/debugLogger'
import { enableConsoleDebug } from './utils/debugStorage'
import { useFirebase } from './hooks/useFirebase'

/**
 * パフォーマンス最適化されたアプリ統計コンポーネント
 */
const AppStats = React.memo<{ bubbles: BubbleEntity[] }>(({ bubbles }) => {
  const stats = useMemo(() => ({
    total: bubbles.length,
    songs: bubbles.filter(b => b.type === 'song').length,
    people: bubbles.filter(b => b.type !== 'song' && b.type !== 'tag').length,
    tags: bubbles.filter(b => b.type === 'tag').length
  }), [bubbles])

  return (
    <div className="stats" role="region" aria-label="統計情報">
      <span aria-label={`シャボン玉の総数: ${stats.total}個`}>
        <span aria-hidden="true">🫧</span> シャボン玉: {stats.total}個
      </span>
      <span aria-label={`楽曲数: ${stats.songs}曲`}>
        <span aria-hidden="true">🎵</span> 楽曲: {stats.songs}曲
      </span>
      <span aria-label={`人物数: ${stats.people}人`}>
        <span aria-hidden="true">👤</span> 人物: {stats.people}人
      </span>
      <span aria-label={`タグ数: ${stats.tags}個`}>
        <span aria-hidden="true">🏷️</span> タグ: {stats.tags}個
      </span>
    </div>
  )
})

/**
 * パフォーマンス最適化された操作説明コンポーネント
 */
const AppInstructions = React.memo<{ isTouchDevice: boolean }>(({ isTouchDevice }) => (
  <div className="instructions" role="region" aria-label="操作説明">
    <p>
      <span aria-hidden="true">💖</span> 
      キュートなシャボン玉を{isTouchDevice ? 'タップ' : 'クリック'}して栗林みな実さんの楽曲世界を探索しよう！ 
      <span aria-hidden="true">✨</span>
    </p>
    <div className="sr-only">
      シャボン玉をクリックまたはタップすると、楽曲の詳細情報や関連する作詞家、作曲家、編曲家の情報を表示できます。
      キーボードでの操作も可能です。Tabキーで要素を移動し、Enterキーで選択してください。
    </div>
  </div>
))

// 開発環境でのテスト実行は手動で行う
// 自動実行を無効化してサンプルデータの影響を排除

function App() {
  // Responsive hook for screen size detection
  const screenSize = useResponsive()
  
  // State management
  const [bubbles, setBubbles] = useState<BubbleEntity[]>([])
  const [selectedBubble, setSelectedBubble] = useState<BubbleEntity | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasDataError, setHasDataError] = useState(false)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showSongManagement, setShowSongManagement] = useState(false)
  const [currentView, setCurrentView] = useState<'main' | 'registration' | 'management' | 'firebase-test'>('main')
  const [showFirebaseTest, setShowFirebaseTest] = useState(false)

  const [debugLogger] = useState(() => DebugLogger.getInstance())

  // Firebase integration
  const { } = useFirebase() // Firebase hook for initialization

  // Service instances
  const musicServiceRef = useRef<MusicDataService | null>(null)
  const bubbleManagerRef = useRef<BubbleManager | null>(null)
  const enhancedBubbleManagerRef = useRef<EnhancedBubbleManager | null>(null)
  const animationFrameRef = useRef<number | null>(null)


  /**
   * Initialize accessibility and responsive features
   */
  useEffect(() => {
    const cleanupAccessibility = initializeAccessibility()
    const cleanupResponsive = initializeResponsiveSystem()
    
    // モバイル最適化の初期化
    const mobileConfig = MobileOptimizer.initialize()
    debugLogger.info('Mobile optimization initialized', mobileConfig)
    
    // 共有データサービスの初期化
    const initializeSharedDataService = async () => {
      try {
        const { SharedDataService } = await import('./services/sharedDataService')
        const { SHARING_CONFIG } = await import('./config/sharing')
        
        const sharedService = SharedDataService.getInstance()
        sharedService.configure({
          method: SHARING_CONFIG.method,
          githubRepo: SHARING_CONFIG.github.repo
        })
        
        debugLogger.info('Shared data service initialized', SHARING_CONFIG.method)
      } catch (error) {
        console.warn('Failed to initialize shared data service:', error)
      }
    }
    
    initializeSharedDataService()
    
    // 開発環境でデバッグ機能を有効化
    if (process.env.NODE_ENV === 'development') {
      enableConsoleDebug()
    }
    
    return () => {
      cleanupAccessibility?.()
      cleanupResponsive()
    }
  }, [debugLogger])



  /**
   * Initialize services and data（エラーハンドリング強化版）
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setHasDataError(false)
        setHasNetworkError(false)

        // Initialize MusicDataService
        const musicService = MusicDataService.getInstance()

        // Firebaseからデータを読み込み
        try {
          const firebaseLoaded = await musicService.loadFromFirebase()
          if (firebaseLoaded) {
            debugLogger.info('🔥 Data loaded from Firebase successfully')
          } else {
            debugLogger.info('📁 Firebase not available, using local data')
          }
        } catch (error) {
          debugLogger.warn('🔥 Firebase load failed, using local data:', error)
        }

        musicServiceRef.current = musicService

        // データベースが空でもエラーではない（正常状態）
        // if (musicService.isEmpty()) {
        //   setHasDataError(true)
        //   throw new Error('Music database is empty')
        // }

        // Validate database integrity
        const validation = musicService.validateDatabase()
        if (!validation.isValid) {
          setHasDataError(true)
          throw new Error(`Database validation failed: ${validation.errors.join(', ')}`)
        }
        
        // Get music database
        const musicDatabase = {
          songs: musicService.getAllSongs(),
          people: musicService.getAllPeople(),
          tags: musicService.getAllTags()
        }

        // Initialize BubbleManager with responsive canvas size and bubble count
        const maxBubbles = calculateOptimalBubbleCount(canvasSize.width, canvasSize.height, screenSize)
        
        const config = {
          ...DEFAULT_BUBBLE_CONFIG,
          canvasWidth: canvasSize.width,
          canvasHeight: canvasSize.height,
          maxBubbles
        }

        // Initialize Enhanced Bubble Manager for visual improvements
        const enhancedBubbleManager = new EnhancedBubbleManager(musicDatabase, config)

        enhancedBubbleManagerRef.current = enhancedBubbleManager
        bubbleManagerRef.current = enhancedBubbleManager as BubbleManager // Use enhanced manager as base manager

        // Generate initial enhanced bubbles
        const initialBubbles: BubbleEntity[] = []
        
        // データベースが空でない場合のみシャボン玉を生成
        if (musicDatabase.songs.length > 0 || musicDatabase.people.length > 0 || musicDatabase.tags.length > 0) {
          for (let i = 0; i < config.maxBubbles; i++) {
            try {
              const bubble = enhancedBubbleManager.generateUniqueBubble()
              if (bubble) {
                initialBubbles.push(bubble)
                enhancedBubbleManager.addBubble(bubble)
              } else {
                // 利用可能なコンテンツがない場合はループを終了
                break
              }
            } catch (error) {
              console.warn(`Failed to generate bubble ${i}:`, error)
            }
          }
        } else {
          console.log('📭 Database is empty, no bubbles to generate')
        }

        setBubbles(initialBubbles)
        setIsLoading(false)
        setRetryCount(0) // Reset retry count on success

        // データセット情報をログ出力
        const datasetInfo = musicService.getDatasetInfo()
        const enhancedStats = enhancedBubbleManager.getEnhancedStats()
        debugLogger.info('App initialized successfully with enhanced bubbles', {
          songs: musicDatabase.songs.length,
          people: musicDatabase.people.length,
          initialBubbles: initialBubbles.length,
          consolidatedPersons: enhancedStats.consolidatedPersons,
          multiRolePersons: enhancedStats.multiRolePersons,
          isLargeDataset: datasetInfo.isLargeDataset,
          estimatedBubbleCount: datasetInfo.estimatedBubbleCount
        })

        // 大量データセットの場合はパフォーマンス警告を表示
        if (datasetInfo.isLargeDataset) {
          debugLogger.info('🚀 Large dataset detected - Performance optimizations enabled')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        
        // Determine error type
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setHasNetworkError(true)
        } else if (errorMessage.includes('database') || errorMessage.includes('data')) {
          setHasDataError(true)
        }
        
        console.error('App initialization error:', err)
        
        setError(errorMessage)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [canvasSize, screenSize, retryCount])

  /**
   * Handle window resize for responsive canvas with device-specific optimizations
   */
  useEffect(() => {
    const handleResize = () => {
      // テスト環境での安全性チェック
      if (typeof document === 'undefined') {
        return
      }
      
      const container = document.querySelector('.bubble-container')
      if (container) {
        const rect = container.getBoundingClientRect()
        const optimalSize = calculateOptimalCanvasSize(rect, screenSize)
        setCanvasSize(optimalSize)
      }
    }

    // Initial size calculation with delay for DOM rendering
    const initialResize = () => {
      setTimeout(handleResize, 100)
    }
    
    initialResize()
    
    // Debounced resize handler for performance
    let resizeTimeout: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(handleResize, 150)
    }
    
    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 300) // Extra delay for orientation change
    })
    
    return () => {
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [screenSize])

  /**
   * Animation loop
   */
  useEffect(() => {
    if (!bubbleManagerRef.current || isLoading) return

    const animate = () => {
      // テスト環境での安全性チェック
      if (typeof window === 'undefined' || !bubbleManagerRef.current) {
        return
      }
      
      try {
        const updatedBubbles = bubbleManagerRef.current.updateFrame()
        setBubbles([...updatedBubbles])
        animationFrameRef.current = requestAnimationFrame(animate)
      } catch (error) {
        console.warn('Animation frame error:', error)
      }
    }

    // requestAnimationFrameが利用可能かチェック
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrameRef.current && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isLoading])

  /**
   * Handle bubble click (最適化版)
   */
  const handleBubbleClick = useCallback((bubble: BubbleEntity) => {
    if (!bubbleManagerRef.current) return

    // Trigger click animation
    bubbleManagerRef.current.triggerClickAnimation(bubble.id)
    
    // Set selected bubble for modal
    setSelectedBubble(bubble)

    debugLogger.debug('Bubble clicked', {
      type: bubble.type,
      name: bubble.name,
      relatedCount: bubble.relatedCount
    })
  }, [])

  /**
   * Handle modal close (最適化版)
   */
  const handleModalClose = useCallback(() => {
    setSelectedBubble(null)
  }, [])

  /**
   * Handle view changes
   */
  const handleViewChange = useCallback((view: 'main' | 'registration' | 'management' | 'firebase-test') => {
    setCurrentView(view)
  }, [])

  /**
   * Handle song registration form toggle with accessibility announcements
   */
  const handleToggleRegistrationForm = useCallback(() => {
    setShowRegistrationForm(prev => {
      const newState = !prev
      
      // Update current view
      setCurrentView(newState ? 'registration' : 'main')
      
      // Add visual feedback class
      const button = document.querySelector('.add-song-button')
      if (button) {
        button.classList.add(newState ? 'form-opening' : 'form-closing')
        setTimeout(() => {
          button.classList.remove('form-opening', 'form-closing')
        }, newState ? 600 : 300)
      }
      
      // Announce state change for screen readers
      const announcement = newState ? '楽曲登録フォームを開きました' : '楽曲登録フォームを閉じました'
      announceToScreenReader(announcement)
      return newState
    })
  }, [])

  /**
   * Handle song registration form close with accessibility announcements
   */
  const handleRegistrationFormClose = useCallback(() => {
    setShowRegistrationForm(false)
    setCurrentView('main')
    announceToScreenReader('楽曲登録フォームを閉じました')
  }, [])

  /**
   * Handle song management toggle with accessibility announcements
   */
  const handleToggleSongManagement = useCallback(() => {
    setShowSongManagement(prev => {
      const newState = !prev
      
      // Update current view
      setCurrentView(newState ? 'management' : 'main')
      
      // Announce state change for screen readers
      const announcement = newState ? '楽曲管理画面を開きました' : '楽曲管理画面を閉じました'
      announceToScreenReader(announcement)
      return newState
    })
  }, [])

  /**
   * Handle song management close with accessibility announcements
   */
  const handleSongManagementClose = useCallback(() => {
    setShowSongManagement(false)
    setCurrentView('main')
    announceToScreenReader('楽曲管理画面を閉じました')
  }, [])

  /**
   * Handle Firebase test toggle with accessibility announcements
   */
  const handleToggleFirebaseTest = useCallback(() => {
    setShowFirebaseTest(prev => {
      const newState = !prev
      
      // Update current view
      setCurrentView(newState ? 'firebase-test' : 'main')
      
      // Announce state change for screen readers
      const announcement = newState ? 'Firebase接続テストを開きました' : 'Firebase接続テストを閉じました'
      announceToScreenReader(announcement)
      return newState
    })
  }, [])

  /**
   * Handle Firebase test close with accessibility announcements
   */
  const handleFirebaseTestClose = useCallback(() => {
    setShowFirebaseTest(false)
    setCurrentView('main')
    announceToScreenReader('Firebase接続テストを閉じました')
  }, [])



  /**
   * Handle new song added
   */
  const handleSongAdded = useCallback(async (song: Song) => {
    // Refresh the enhanced bubble manager with new data
    if (enhancedBubbleManagerRef.current && musicServiceRef.current) {
      // Firebaseから最新データを再読み込み
      try {
        await musicServiceRef.current.loadFromFirebase()
        debugLogger.info('🔥 Reloaded data from Firebase after song addition')
      } catch (error) {
        debugLogger.warn('🔥 Firebase reload failed, using local cache:', error)
        // Clear cache and reload local data
        musicServiceRef.current.clearCache()
      }
      
      // Get updated music database
      const musicDatabase = {
        songs: musicServiceRef.current.getAllSongs(),
        people: musicServiceRef.current.getAllPeople(),
        tags: musicServiceRef.current.getAllTags()
      }
      
      // Update enhanced bubble manager with new data
      enhancedBubbleManagerRef.current.updateMusicDatabase(musicDatabase)
      
      debugLogger.info('Song added and enhanced bubbles updated', song.title)
    }
  }, [debugLogger])

  /**
   * Handle song updated
   */
  const handleSongUpdated = useCallback((song: Song) => {
    // Refresh the enhanced bubble manager with updated data
    if (enhancedBubbleManagerRef.current && musicServiceRef.current) {
      // Clear cache and reload data
      musicServiceRef.current.clearCache()
      
      // Get updated music database
      const musicDatabase = {
        songs: musicServiceRef.current.getAllSongs(),
        people: musicServiceRef.current.getAllPeople(),
        tags: musicServiceRef.current.getAllTags()
      }
      
      // Update enhanced bubble manager with new data
      enhancedBubbleManagerRef.current.updateMusicDatabase(musicDatabase)
      
      debugLogger.info('Song updated and enhanced bubbles refreshed', song.title)
    }
  }, [debugLogger])

  /**
   * Handle song deleted
   */
  const handleSongDeleted = useCallback((songId: string) => {
    // Refresh the enhanced bubble manager with updated data
    if (enhancedBubbleManagerRef.current && musicServiceRef.current) {
      // Clear cache and reload data
      musicServiceRef.current.clearCache()
      
      // Get updated music database
      const musicDatabase = {
        songs: musicServiceRef.current.getAllSongs(),
        people: musicServiceRef.current.getAllPeople(),
        tags: musicServiceRef.current.getAllTags()
      }
      
      // Update enhanced bubble manager with updated data
      enhancedBubbleManagerRef.current.updateMusicDatabase(musicDatabase)
      
      debugLogger.info('Song deleted and enhanced bubbles refreshed', songId)
    }
  }, [debugLogger])

  /**
   * Update enhanced bubble manager config when canvas size changes
   */
  useEffect(() => {
    if (enhancedBubbleManagerRef.current) {
      try {
        enhancedBubbleManagerRef.current.updateConfig({
          canvasWidth: canvasSize.width,
          canvasHeight: canvasSize.height
        })
      } catch (error) {
        console.warn('Failed to update enhanced bubble manager config:', error)
      }
    }
  }, [canvasSize])

  /**
   * エラーからの復旧を試行
   */
  const handleRetry = useCallback(async () => {
    if (isRecovering) return
    
    setIsRecovering(true)
    setError(null)
    
    try {
      if (hasDataError && musicServiceRef.current) {
        // データエラーからの復旧を試行
        const recovered = await musicServiceRef.current.recoverFromError()
        if (recovered) {
          setRetryCount(prev => prev + 1) // useEffectを再実行
        } else {
          throw new Error('Failed to recover from data error')
        }
      } else {
        // 一般的な再試行
        setRetryCount(prev => prev + 1)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Recovery failed'
      setError(errorMessage)
      console.error('Recovery error:', err)
    } finally {
      setIsRecovering(false)
    }
  }, [hasDataError, hasNetworkError, retryCount, isRecovering])

  /**
   * ページ再読み込み
   */
  const handleReload = useCallback(() => {
    window.location.reload()
  }, [])



  /**
   * エラー状態をクリア
   */
  const handleClearError = useCallback(() => {
    setError(null)
    setHasDataError(false)
    setHasNetworkError(false)
  }, [])

  if (isLoading) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="App">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{isRecovering ? 'エラーからの復旧を試行中...' : '楽曲データを読み込んでいます...'}</p>
            </div>
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }

  if (error) {
    // エラータイプに応じて適切なフォールバック表示を選択
    let fallbackComponent
    
    if (hasNetworkError) {
      fallbackComponent = (
        <NetworkErrorFallback
          error={{ message: error, type: 'network' as any, timestamp: Date.now(), severity: 'medium' as any }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    } else if (hasDataError) {
      fallbackComponent = (
        <DataLoadingFallback
          error={{ message: error, type: 'data_loading' as any, timestamp: Date.now(), severity: 'medium' as any }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    } else {
      fallbackComponent = (
        <GenericErrorFallback
          error={{ message: error, type: 'unknown' as any, timestamp: Date.now(), severity: 'medium' as any }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    }

    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="App">
            {fallbackComponent}
          </div>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Layout
          className="App"
          header={
            <>
              <div className="header-text">
                <h1>栗林みな実 Bubble World</h1>
                <p>栗林みな実さんの楽曲世界をキュートなシャボン玉で探索しよう💕</p>
              </div>
            </>
          }
          navigation={
            <Navigation
              currentView={currentView}
              onViewChange={handleViewChange}
              showRegistrationForm={showRegistrationForm}
              showSongManagement={showSongManagement}
              showFirebaseTest={showFirebaseTest}
              onToggleRegistrationForm={handleToggleRegistrationForm}
              onToggleSongManagement={handleToggleSongManagement}
              onToggleFirebaseTest={handleToggleFirebaseTest}
            />
          }
        >
          <a href="#main-content" className="skip-to-main">
            メインコンテンツにスキップ
          </a>

          {/* エラー状態の軽微な警告表示 */}
          {retryCount > 0 && (
            <InlineErrorDisplay
              message={`復旧を${retryCount}回試行しました。問題が続く場合はページを再読み込みしてください。`}
              onDismiss={handleClearError}
            />
          )}

          <DataLoadingErrorBoundary>
            <div className="bubble-container">
              <BubbleCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                bubbles={bubbles}
                onBubbleClick={handleBubbleClick}
                className="main-canvas"
                enhancedBubbleManager={enhancedBubbleManagerRef.current || undefined}
              />
            </div>

            <div className="app-info" role="complementary" aria-label="アプリケーション情報">
              <AppStats bubbles={bubbles} />
              <AppInstructions isTouchDevice={screenSize.isTouchDevice} />
            </div>
          </DataLoadingErrorBoundary>

          <DetailModal
            selectedBubble={selectedBubble}
            onClose={handleModalClose}
          />

          <SongRegistrationForm
            id="song-registration-form"
            isVisible={showRegistrationForm}
            onClose={handleRegistrationFormClose}
            onSongAdded={handleSongAdded}
          />

          <SongManagement
            isVisible={showSongManagement}
            onClose={handleSongManagementClose}
            onSongUpdated={handleSongUpdated}
            onSongDeleted={handleSongDeleted}
          />

          {/* Firebase接続テスト（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && showFirebaseTest && (
            <div className="modal-overlay" onClick={handleFirebaseTestClose}>
              <div className="modal-content firebase-test-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Firebase接続テスト</h2>
                  <button 
                    className="modal-close-button"
                    onClick={handleFirebaseTestClose}
                    aria-label="Firebase接続テストを閉じる"
                  >
                    ×
                  </button>
                </div>
                <FirebaseConnectionTest />
              </div>
            </div>
          )}

          {/* PWA Components */}
          <PWAInstallButton />
          <PWAUpdateBanner />

          {/* Live region for screen reader announcements */}
          <div 
            id="live-region" 
            className="live-region" 
            aria-live="polite" 
            aria-atomic="true"
          />
        </Layout>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App