import React, { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import './styles/errorStyles.css'

import { ThemeProvider } from './components/ThemeProvider'
import { MobileFirstLayout } from './components/MobileFirstLayout'
import { MobileFirstHeader } from './components/MobileFirstHeader'
import { MobileFirstNavigation } from './components/MobileFirstNavigation'

import { BubbleCanvas } from './components/BubbleCanvas'
import { DetailModal } from './components/DetailModal'
import { DatabaseDebugger } from './components/DatabaseDebugger'
import { MusicDataService } from './services/musicDataService'
import { BubbleManager, createBubbleConfig } from './services/bubbleManager'
import { EnhancedBubbleManager } from './services/enhancedBubbleManager'
import { RoleBasedBubbleManager } from './services/roleBasedBubbleManager'
import { ColorLegend } from './components/ColorLegend'
import { useRoleBasedBubbles } from './hooks/useRoleBasedBubbles'
import { BubbleEntity } from './types/bubble'
import { Song, MusicDatabase } from './types/music'
import {
  useResponsive,
  calculateOptimalCanvasSize,
} from './hooks/useResponsive'
import {
  ErrorBoundary,
  DataLoadingErrorBoundary,
} from './components/ErrorBoundary'
import {
  DataLoadingFallback,
  NetworkErrorFallback,
  GenericErrorFallback,
  InlineErrorDisplay,
} from './components/FallbackComponents'
import { SongRegistrationForm } from './components/SongRegistrationForm'
import { SongManagement } from './components/SongManagement'
import { TagRegistrationDialog } from './components/TagRegistrationDialog'

import { EnhancedTagList } from './components/EnhancedTagList'
import { UnifiedDialogLayout } from './components/UnifiedDialogLayout'
// ErrorHandler import removed - using simple error handling
import {
  announceToScreenReader,
  initializeAccessibility,
} from './utils/accessibility'
import { initializeResponsiveSystem } from './utils/responsiveUtils'
import { MobileOptimizer } from './utils/mobileOptimization'
import { PWAInstallButton, PWAUpdateBanner } from './components/PWAComponents'

import { DebugLogger } from './utils/debugLogger'
import { enableConsoleDebug } from './utils/debugStorage'
import { useFirebase } from './hooks/useFirebase'
import { getCurrentBubbleSettings } from './config/bubbleSettings'

// Import mobile performance CSS
import './styles/mobilePerformance.css'
// Import mobile-first CSS
import './styles/mobileFirst.css'

/**
 * パフォーマンス最適化された操作説明コンポーネント
 */
const AppInstructions = React.memo<{ isTouchDevice: boolean }>(
  ({ isTouchDevice }) => (
    <div className="instructions" role="region" aria-label="操作説明">
      <p>
        <span aria-hidden="true">🌰</span>
        シャボン玉を{isTouchDevice ? 'タップ' : 'クリック'}
        して栗林みな実さんの楽曲を探検しよう！
        <span aria-hidden="true">🌰</span>
      </p>
      <p>
        <span aria-hidden="true">🌰</span>
        メニューから楽曲にタグ付けをしてね！
        <span aria-hidden="true">🌰</span>
      </p>
      <p>
        <span aria-hidden="true">🌰</span>
        たくさん知ってほしいからよぉ
        <span aria-hidden="true">🌰</span>
      </p>
      <div className="sr-only">
        シャボン玉をクリックまたはタップすると、楽曲の詳細情報や関連する作詞家、作曲家、編曲家の情報を表示できます。
        キーボードでの操作も可能です。Tabキーで要素を移動し、Enterキーで選択してください。
      </div>
    </div>
  )
)

// 開発環境でのテスト実行は手動で行う
// 自動実行を無効化してサンプルデータの影響を排除

function App() {
  // Responsive hook for screen size detection
  const screenSize = useResponsive()

  // State management
  const [bubbles, setBubbles] = useState<BubbleEntity[]>([])
  const [selectedBubble, setSelectedBubble] = useState<BubbleEntity | null>(
    null
  )
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasDataError, setHasDataError] = useState(false)
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRecovering, setIsRecovering] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showSongManagement, setShowSongManagement] = useState(false)
  const [currentView, setCurrentView] = useState<
    'main' | 'registration' | 'management' | 'tag-list' | 'tag-registration'
  >('main')

  const [showTagList, setShowTagList] = useState(false)
  const [showTagRegistration, setShowTagRegistration] = useState(false)
  const [showDatabaseDebugger, setShowDatabaseDebugger] = useState(false)

  const [debugLogger] = useState(() => DebugLogger.getInstance())

  // Firebase integration
  useFirebase() // Firebase hook for initialization

  // Service instances
  const musicServiceRef = useRef<MusicDataService | null>(null)
  const bubbleManagerRef = useRef<BubbleManager | null>(null)
  const enhancedBubbleManagerRef = useRef<EnhancedBubbleManager | null>(null)
  const roleBasedBubbleManagerRef = useRef<RoleBasedBubbleManager | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // 開発者ツール用の設定更新関数をwindowオブジェクトに追加
  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as any).updateBubbleSettings = (settings: any) => {
        if (roleBasedBubbleManagerRef.current) {
          roleBasedBubbleManagerRef.current.updateBubbleSettings(settings)
        }
        if (enhancedBubbleManagerRef.current) {
          enhancedBubbleManagerRef.current.updateBubbleSettings?.(settings)
        }
        console.log('Bubble settings updated via dev tools:', settings)
      }
      ;(window as any).getBubbleStats = () => {
        if (roleBasedBubbleManagerRef.current) {
          return roleBasedBubbleManagerRef.current.getStats()
        }
        return null
      }

      // タグ強制生成機能を追加
      ;(window as any).forceGenerateTagBubble = () => {
        if (roleBasedBubbleManagerRef.current) {
          try {
            // 現在のシャボン玉をクリア
            roleBasedBubbleManagerRef.current.clearAllBubbles()

            // タグシャボン玉を強制生成
            const tagBubble = (
              roleBasedBubbleManagerRef.current as any
            ).generateTagBubble()
            roleBasedBubbleManagerRef.current.addBubble(tagBubble)

            console.log('🏷️ Force generated tag bubble:', tagBubble.name)
            return tagBubble
          } catch (error) {
            console.error('Failed to force generate tag bubble:', error)
            return null
          }
        }
        return null
      }

      // データベース状態確認機能を追加
      ;(window as any).checkDatabase = () => {
        if (musicServiceRef.current) {
          const songs = musicServiceRef.current.getAllSongs()
          const people = musicServiceRef.current.getAllPeople()
          const tags = musicServiceRef.current.getAllTags()

          console.log('📊 Database status:', {
            songs: songs.length,
            people: people.length,
            tags: tags.length,
          })

          if (tags.length > 0) {
            console.log(
              '🏷️ Available tags:',
              tags.map(tag => `${tag.name} (${tag.songs.length} songs)`)
            )
          } else {
            console.log('🏷️ No tags found in database')

            // 楽曲にタグが設定されているかチェック
            const songsWithTags = songs.filter(
              song => song.tags && song.tags.length > 0
            )
            console.log('🎵 Songs with tags:', songsWithTags.length)

            if (songsWithTags.length > 0) {
              console.log(
                '🎵 Sample songs with tags:',
                songsWithTags.slice(0, 3).map(song => ({
                  title: song.title,
                  tags: song.tags,
                }))
              )
            }
          }

          return {
            songs: songs.length,
            people: people.length,
            tags: tags.length,
          }
        }
        return null
      }

      // ログレベル制御機能を追加
      ;(window as any).setLogLevel = (
        level: 'none' | 'minimal' | 'normal' | 'verbose'
      ) => {
        switch (level) {
          case 'none':
            // 全てのログを無効化
            console.log = () => {}
            console.warn = () => {}
            break
          case 'minimal':
            // エラーと重要な情報のみ
            console.log('🔇 Log level set to minimal')
            break
          case 'normal':
            // デフォルト（現在の設定）
            console.log('🔊 Log level set to normal')
            break
          case 'verbose':
            // 全てのログを有効化
            console.log('📢 Log level set to verbose - all logs enabled')
            break
        }
      }

      // データベースデバッガーを開く機能を追加
      ;(window as any).openDatabaseDebugger = () => {
        setShowDatabaseDebugger(true)
        console.log('🔍 Database debugger opened')
      }

      // 使用方法をコンソールに表示
      console.log(`
🫧 シャボン玉設定の変更方法:

1. 開発者ツールのコンソールで以下のコマンドを実行:
   updateBubbleSettings({ maxBubbles: 5 })

2. 利用可能な設定:
   - maxBubbles: シャボン玉の最大数
   - minSize, maxSize: サイズ範囲
   - minVelocity, maxVelocity: 速度
   - minLifespan, maxLifespan: ライフスパン
   - buoyancyStrength: 浮力の強さ
   - windStrength: 風の強さ

3. 現在の統計を確認:
   getBubbleStats()

4. タグシャボン玉を強制生成:
   forceGenerateTagBubble()

5. データベース状態を確認:
   checkDatabase()

6. ログレベルを制御:
   setLogLevel('none')     // ログを無効化
   setLogLevel('minimal')  // 最小限のログ
   setLogLevel('normal')   // 通常のログ（デフォルト）
   setLogLevel('verbose')  // 全てのログ

7. データベースデバッガーを開く:
   openDatabaseDebugger()  // データベースの内容を確認

例: updateBubbleSettings({ maxBubbles: 5, minSize: 60, maxSize: 120 })
      `)
    }
  }, [])

  // Role-based bubble system state
  const [showColorLegend] = useState(true)
  const [musicDatabase, setMusicDatabase] = useState<MusicDatabase>({
    songs: [],
    people: [],
    tags: [],
  })

  // Role-based bubble system integration
  // 設定ファイルのmaxBubbles値を使用（レスポンシブ計算は無視）
  const configMaxBubbles = getCurrentBubbleSettings().maxBubbles
  const { legendItems } = useRoleBasedBubbles(
    musicDatabase,
    canvasSize.width,
    canvasSize.height,
    configMaxBubbles
  )

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
        const { SharedDataService } = await import(
          './services/sharedDataService'
        )
        const { SHARING_CONFIG } = await import('./config/sharing')

        const sharedService = SharedDataService.getInstance()
        sharedService.configure({
          method: SHARING_CONFIG.method,
          githubRepo: SHARING_CONFIG.github.repo,
        })

        debugLogger.info(
          'Shared data service initialized',
          SHARING_CONFIG.method
        )
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
          throw new Error(
            `Database validation failed: ${validation.errors.join(', ')}`
          )
        }

        // Get music database
        const musicDatabaseData = {
          songs: musicService.getAllSongs(),
          people: musicService.getAllPeople(),
          tags: musicService.getAllTags(),
        }

        // Update state for role-based bubble system
        setMusicDatabase(musicDatabaseData)

        // Initialize BubbleManager with canvas size
        // 設定ファイルのmaxBubbles値を厳密に適用（レスポンシブ計算は無視）
        const config = createBubbleConfig(canvasSize.width, canvasSize.height)
        // config.maxBubblesは設定ファイルの値をそのまま使用

        // デバッグ: 設定値をログ出力
        console.log('🫧 App initialization - Bubble config:', {
          maxBubbles: config.maxBubbles,
          canvasSize: `${config.canvasWidth}x${config.canvasHeight}`,
          settingsSource: 'bubbleSettings.ts',
        })

        // Initialize Role-Based Bubble Manager (Requirements: 19.1, 19.2, 19.3, 19.4, 19.5)
        const roleBasedBubbleManager = new RoleBasedBubbleManager(
          musicDatabaseData,
          config
        )

        // Initialize Enhanced Bubble Manager for visual improvements
        const enhancedBubbleManager = new EnhancedBubbleManager(
          musicDatabaseData,
          config
        )

        roleBasedBubbleManagerRef.current = roleBasedBubbleManager
        enhancedBubbleManagerRef.current = enhancedBubbleManager
        bubbleManagerRef.current = roleBasedBubbleManager as BubbleManager // Use role-based manager as primary manager

        // Generate initial role-based bubbles (Requirements: 19.1, 19.2)
        const initialBubbles: BubbleEntity[] = []

        // データベースが空でない場合のみシャボン玉を生成
        if (
          musicDatabaseData.songs.length > 0 ||
          musicDatabaseData.people.length > 0 ||
          musicDatabaseData.tags.length > 0
        ) {
          for (let i = 0; i < config.maxBubbles; i++) {
            try {
              const bubble = roleBasedBubbleManager.generateBubble()
              if (bubble) {
                initialBubbles.push(bubble)
                roleBasedBubbleManager.addBubble(bubble)
              } else {
                // 利用可能なコンテンツがない場合はループを終了
                break
              }
            } catch (error) {
              console.warn(`Failed to generate role-based bubble ${i}:`, error)
            }
          }

          // Apply category colors and prevent duplicates (Requirements: 19.3, 19.5)
          const coloredBubbles =
            roleBasedBubbleManager.assignCategoryColors(initialBubbles)
          const uniqueBubbles =
            roleBasedBubbleManager.preventDuplicateDisplay(coloredBubbles)

          setBubbles(uniqueBubbles)

          // デバッグ: 実際に生成されたシャボン玉数をログ出力
          const bubbleTypeCount = uniqueBubbles.reduce(
            (acc, bubble) => {
              acc[bubble.type] = (acc[bubble.type] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )

          console.log('🫧 Generated bubbles:', {
            requested: config.maxBubbles,
            generated: initialBubbles.length,
            afterColorAndUnique: uniqueBubbles.length,
            managerBubbles: roleBasedBubbleManager.getBubbles().length,
            typeDistribution: bubbleTypeCount,
          })
        } else {
          console.log('📭 Database is empty, no bubbles to generate')
          setBubbles(initialBubbles)
        }

        setIsLoading(false)
        setRetryCount(0) // Reset retry count on success

        // データセット情報をログ出力
        const datasetInfo = musicService.getDatasetInfo()
        const roleBasedStats = roleBasedBubbleManager.getRoleBasedStats()
        debugLogger.info(
          'App initialized successfully with role-based bubbles',
          {
            songs: musicDatabaseData.songs.length,
            people: musicDatabaseData.people.length,
            tags: musicDatabaseData.tags.length,
            initialBubbles: initialBubbles.length,
            totalPersons: roleBasedStats.totalPersons,
            multiRolePersons: roleBasedStats.multiRolePersons.length,
            displayedRoleBubbles: roleBasedStats.displayedRoleBubbles,
            isLargeDataset: datasetInfo.isLargeDataset,
            estimatedBubbleCount: datasetInfo.estimatedBubbleCount,
          }
        )

        // 大量データセットの場合はパフォーマンス警告を表示
        if (datasetInfo.isLargeDataset) {
          debugLogger.info(
            '🚀 Large dataset detected - Performance optimizations enabled'
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'

        // Determine error type
        if (
          errorMessage.includes('network') ||
          errorMessage.includes('fetch')
        ) {
          setHasNetworkError(true)
        } else if (
          errorMessage.includes('database') ||
          errorMessage.includes('data')
        ) {
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
   * Handle window resize for responsive canvas with mobile-first optimizations
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

        // Mobile-first canvas size calculation
        let optimalSize
        if (screenSize.isMobile) {
          // モバイル: コンテナサイズを最大限活用
          const headerHeight = screenSize.isLandscape ? 45 : 50
          const navigationHeight = 60
          const padding = 8

          optimalSize = {
            width: Math.max(300, rect.width - padding * 2),
            height: Math.max(
              200,
              window.innerHeight - headerHeight - navigationHeight - padding * 3
            ),
          }
        } else {
          // デスクトップ/タブレット: 従来の計算方法
          optimalSize = calculateOptimalCanvasSize(rect, screenSize)
        }

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

    let frameCount = 0
    const animate = () => {
      // テスト環境での安全性チェック
      if (typeof window === 'undefined' || !bubbleManagerRef.current) {
        return
      }

      try {
        const updatedBubbles = bubbleManagerRef.current.updateFrame()
        setBubbles([...updatedBubbles])

        // デバッグ: 5秒ごとにシャボン玉数をログ出力（パフォーマンス配慮）
        frameCount++
        if (frameCount % 300 === 0) {
          // 60fps * 5秒 = 300フレーム
          if (import.meta.env.DEV) {
            console.log('🫧 Animation frame bubble count:', {
              bubbles: updatedBubbles.length,
              maxBubbles: bubbleManagerRef.current.getBubbles().length,
              frameCount,
            })
          }
        }

        animationFrameRef.current = requestAnimationFrame(animate)
      } catch (error) {
        // エラーが発生してもアニメーションを継続（画面のちらつきを防ぐ）
        console.warn('Animation frame error (continuing):', error)

        // エラーが発生した場合でも次のフレームを予約
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    // requestAnimationFrameが利用可能かチェック
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (
        animationFrameRef.current &&
        typeof window !== 'undefined' &&
        typeof window.cancelAnimationFrame === 'function'
      ) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isLoading])

  /**
   * Handle bubble click (最適化版)
   */
  const handleBubbleClick = useCallback(
    (bubble: BubbleEntity) => {
      if (!bubbleManagerRef.current) return

      // Trigger click animation
      bubbleManagerRef.current.triggerClickAnimation(bubble.id)

      // Set selected bubble for modal
      setSelectedBubble(bubble)

      debugLogger.debug('Bubble clicked', {
        type: bubble.type,
        name: bubble.name,
        relatedCount: bubble.relatedCount,
      })
    },
    [debugLogger]
  )

  /**
   * Handle modal close (最適化版)
   */
  const handleModalClose = useCallback(() => {
    setSelectedBubble(null)
  }, [])

  /**
   * Handle view changes
   */
  const handleViewChange = useCallback(
    (
      view:
        | 'main'
        | 'registration'
        | 'management'
        | 'tag-list'
        | 'tag-registration'
    ) => {
      setCurrentView(view)
    },
    []
  )

  /**
   * Handle song registration form toggle with accessibility announcements
   */
  const handleToggleRegistrationForm = useCallback(() => {
    console.log('🎵 App: handleToggleRegistrationForm called')

    const newState = !showRegistrationForm
    console.log('🎵 App: Setting showRegistrationForm to:', newState)

    setShowRegistrationForm(newState)
    setCurrentView(newState ? 'registration' : 'main')

    // Announce state change for screen readers
    const announcement = newState
      ? '楽曲登録フォームを開きました'
      : '楽曲登録フォームを閉じました'
    announceToScreenReader(announcement)
  }, [showRegistrationForm])

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
    console.log('📝 App: handleToggleSongManagement called')

    const newState = !showSongManagement
    console.log('📝 App: Setting showSongManagement to:', newState)

    setShowSongManagement(newState)
    setCurrentView(newState ? 'management' : 'main')

    // Announce state change for screen readers
    const announcement = newState
      ? '楽曲編集画面を開きました'
      : '楽曲編集画面を閉じました'
    announceToScreenReader(announcement)
  }, [showSongManagement])

  /**
   * Handle song management close with accessibility announcements
   */
  const handleSongManagementClose = useCallback(() => {
    setShowSongManagement(false)
    setCurrentView('main')
    announceToScreenReader('楽曲編集画面を閉じました')
  }, [])

  /**
   * Handle tag list toggle with accessibility announcements
   */
  const handleToggleTagList = useCallback(() => {
    console.log('🏷️ App: handleToggleTagList called')

    const newState = !showTagList
    console.log('🏷️ App: Setting showTagList to:', newState)

    setShowTagList(newState)
    setCurrentView(newState ? 'tag-list' : 'main')

    // Announce state change for screen readers
    const announcement = newState
      ? 'タグ一覧画面を開きました'
      : 'タグ一覧画面を閉じました'
    announceToScreenReader(announcement)
  }, [showTagList])

  /**
   * Handle tag list close with accessibility announcements
   */
  const handleTagListClose = useCallback(() => {
    setShowTagList(false)
    setCurrentView('main')
    announceToScreenReader('タグ一覧画面を閉じました')
  }, [])

  /**
   * Handle tag registration toggle with accessibility announcements
   */
  const handleToggleTagRegistration = useCallback(() => {
    console.log('🏷️➕ App: handleToggleTagRegistration called')

    const newState = !showTagRegistration
    console.log('🏷️➕ App: Setting showTagRegistration to:', newState)

    setShowTagRegistration(newState)
    setCurrentView(newState ? 'tag-registration' : 'main')

    // Announce state change for screen readers
    const announcement = newState
      ? 'タグ登録画面を開きました'
      : 'タグ登録画面を閉じました'
    announceToScreenReader(announcement)
  }, [showTagRegistration])

  /**
   * Handle tag registration close with accessibility announcements
   */
  const handleTagRegistrationClose = useCallback(() => {
    setShowTagRegistration(false)
    setCurrentView('main')
    announceToScreenReader('タグ登録画面を閉じました')
  }, [])

  /**
   * Handle tags registered
   */
  const handleTagsRegistered = useCallback(
    async (songId: string, tags: string[]) => {
      // Refresh the role-based bubble manager with updated data
      if (roleBasedBubbleManagerRef.current && musicServiceRef.current) {
        // Firebaseから最新データを再読み込み
        try {
          await musicServiceRef.current.loadFromFirebase()
          debugLogger.info(
            '🔥 Reloaded data from Firebase after tag registration'
          )
        } catch (error) {
          debugLogger.warn(
            '🔥 Firebase reload failed, using local cache:',
            error
          )
          // Clear cache and reload local data
          musicServiceRef.current.clearCache()
        }

        // Get updated music database
        const updatedMusicDatabase = {
          songs: musicServiceRef.current.getAllSongs(),
          people: musicServiceRef.current.getAllPeople(),
          tags: musicServiceRef.current.getAllTags(),
        }

        // Update state and managers
        setMusicDatabase(updatedMusicDatabase)

        // Update role-based bubble manager with new data
        roleBasedBubbleManagerRef.current.updateMusicDatabase(
          updatedMusicDatabase
        )

        // Update enhanced bubble manager as well
        if (enhancedBubbleManagerRef.current) {
          enhancedBubbleManagerRef.current.updateMusicDatabase(
            updatedMusicDatabase
          )
        }

        debugLogger.info('Tags registered and role-based bubbles updated', {
          songId,
          tags,
        })
      }
    },
    [debugLogger]
  )

  const handleDatabaseDebuggerClose = useCallback(() => {
    setShowDatabaseDebugger(false)
  }, [])

  /**
   * Handle new song added
   */
  const handleSongAdded = useCallback(
    async (song: Song) => {
      // Refresh the role-based bubble manager with new data
      if (roleBasedBubbleManagerRef.current && musicServiceRef.current) {
        // Firebaseから最新データを再読み込み
        try {
          await musicServiceRef.current.loadFromFirebase()
          debugLogger.info('🔥 Reloaded data from Firebase after song addition')
        } catch (error) {
          debugLogger.warn(
            '🔥 Firebase reload failed, using local cache:',
            error
          )
          // Clear cache and reload local data
          musicServiceRef.current.clearCache()
        }

        // Get updated music database
        const updatedMusicDatabase = {
          songs: musicServiceRef.current.getAllSongs(),
          people: musicServiceRef.current.getAllPeople(),
          tags: musicServiceRef.current.getAllTags(),
        }

        // Update state and managers
        setMusicDatabase(updatedMusicDatabase)

        // Update role-based bubble manager with new data
        roleBasedBubbleManagerRef.current.updateMusicDatabase(
          updatedMusicDatabase
        )

        // Update enhanced bubble manager as well
        if (enhancedBubbleManagerRef.current) {
          enhancedBubbleManagerRef.current.updateMusicDatabase(
            updatedMusicDatabase
          )
        }

        debugLogger.info(
          'Song added and role-based bubbles updated',
          song.title
        )
      }
    },
    [debugLogger]
  )

  /**
   * Handle song updated
   */
  const handleSongUpdated = useCallback(
    (song: Song) => {
      // Refresh the role-based bubble manager with updated data
      if (roleBasedBubbleManagerRef.current && musicServiceRef.current) {
        // Clear cache and reload data
        musicServiceRef.current.clearCache()

        // Get updated music database
        const updatedMusicDatabase = {
          songs: musicServiceRef.current.getAllSongs(),
          people: musicServiceRef.current.getAllPeople(),
          tags: musicServiceRef.current.getAllTags(),
        }

        // Update state and managers
        setMusicDatabase(updatedMusicDatabase)

        // Update role-based bubble manager with new data
        roleBasedBubbleManagerRef.current.updateMusicDatabase(
          updatedMusicDatabase
        )

        // Update enhanced bubble manager as well
        if (enhancedBubbleManagerRef.current) {
          enhancedBubbleManagerRef.current.updateMusicDatabase(
            updatedMusicDatabase
          )
        }

        debugLogger.info(
          'Song updated and role-based bubbles refreshed',
          song.title
        )
      }
    },
    [debugLogger]
  )

  /**
   * Handle song deleted
   */
  const handleSongDeleted = useCallback(
    (songId: string) => {
      // Refresh the role-based bubble manager with updated data
      if (roleBasedBubbleManagerRef.current && musicServiceRef.current) {
        // Clear cache and reload data
        musicServiceRef.current.clearCache()

        // Get updated music database
        const updatedMusicDatabase = {
          songs: musicServiceRef.current.getAllSongs(),
          people: musicServiceRef.current.getAllPeople(),
          tags: musicServiceRef.current.getAllTags(),
        }

        // Update state and managers
        setMusicDatabase(updatedMusicDatabase)

        // Update role-based bubble manager with updated data
        roleBasedBubbleManagerRef.current.updateMusicDatabase(
          updatedMusicDatabase
        )

        // Update enhanced bubble manager as well
        if (enhancedBubbleManagerRef.current) {
          enhancedBubbleManagerRef.current.updateMusicDatabase(
            updatedMusicDatabase
          )
        }

        debugLogger.info(
          'Song deleted and role-based bubbles refreshed',
          songId
        )
      }
    },
    [debugLogger]
  )

  /**
   * Update bubble manager configs when canvas size changes
   */
  useEffect(() => {
    if (roleBasedBubbleManagerRef.current) {
      try {
        roleBasedBubbleManagerRef.current.updateConfig({
          canvasWidth: canvasSize.width,
          canvasHeight: canvasSize.height,
        })
      } catch (error) {
        console.warn(
          'Failed to update role-based bubble manager config:',
          error
        )
      }
    }

    if (enhancedBubbleManagerRef.current) {
      try {
        enhancedBubbleManagerRef.current.updateConfig({
          canvasWidth: canvasSize.width,
          canvasHeight: canvasSize.height,
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
      const errorMessage =
        err instanceof Error ? err.message : 'Recovery failed'
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
              <p>
                {isRecovering
                  ? 'エラーからの復旧を試行中...'
                  : '楽曲データを読み込んでいます...'}
              </p>
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
          error={{
            message: error,
            type: 'network' as any,
            timestamp: Date.now(),
            severity: 'medium' as any,
          }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    } else if (hasDataError) {
      fallbackComponent = (
        <DataLoadingFallback
          error={{
            message: error,
            type: 'data_loading' as any,
            timestamp: Date.now(),
            severity: 'medium' as any,
          }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    } else {
      fallbackComponent = (
        <GenericErrorFallback
          error={{
            message: error,
            type: 'unknown' as any,
            timestamp: Date.now(),
            severity: 'medium' as any,
          }}
          onRetry={handleRetry}
          onReload={handleReload}
        />
      )
    }

    return (
      <ErrorBoundary>
        <ThemeProvider>
          <div className="App">{fallbackComponent}</div>
        </ThemeProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MobileFirstLayout
          className="App mobile-first-container"
          header={
            <MobileFirstHeader>
              {/* デスクトップではヘッダーにナビゲーションを表示 */}
              <MobileFirstNavigation
                currentView={currentView}
                onViewChange={handleViewChange}
                showRegistrationForm={showRegistrationForm}
                showSongManagement={showSongManagement}
                showTagList={showTagList}
                showTagRegistration={showTagRegistration}
                onToggleRegistrationForm={handleToggleRegistrationForm}
                onToggleSongManagement={handleToggleSongManagement}
                onToggleTagList={handleToggleTagList}
                onToggleTagRegistration={handleToggleTagRegistration}
              />
            </MobileFirstHeader>
          }
          navigation={
            /* モバイルでのみ最下部にナビゲーションを表示 */
            screenSize.isMobile ? (
              <MobileFirstNavigation
                currentView={currentView}
                onViewChange={handleViewChange}
                showRegistrationForm={showRegistrationForm}
                showSongManagement={showSongManagement}
                showTagList={showTagList}
                showTagRegistration={showTagRegistration}
                onToggleRegistrationForm={handleToggleRegistrationForm}
                onToggleSongManagement={handleToggleSongManagement}
                onToggleTagList={handleToggleTagList}
                onToggleTagRegistration={handleToggleTagRegistration}
              />
            ) : null
          }
        >
          {/* エラー状態の軽微な警告表示 */}
          {retryCount > 0 && (
            <InlineErrorDisplay
              message={`復旧を${retryCount}回試行しました。問題が続く場合はページを再読み込みしてください。`}
              onDismiss={handleClearError}
            />
          )}

          <DataLoadingErrorBoundary>
            <div className="bubble-container mobile-first-bubble-area bubble-area-maximized">
              <BubbleCanvas
                width={canvasSize.width}
                height={canvasSize.height}
                bubbles={bubbles}
                onBubbleClick={handleBubbleClick}
                className="main-canvas"
                enhancedBubbleManager={
                  enhancedBubbleManagerRef.current || undefined
                }
              />

              {/* Color Legend for role-based bubbles (Requirements: 19.3, 19.4) */}
              <ColorLegend
                position="bottom-right"
                isVisible={showColorLegend && bubbles.length > 0}
                showCounts={true}
                categories={legendItems}
              />
            </div>

            <div
              className="app-info"
              role="complementary"
              aria-label="アプリケーション情報"
            >
              <AppInstructions isTouchDevice={screenSize.isTouchDevice} />
            </div>
          </DataLoadingErrorBoundary>

          <DetailModal
            selectedBubble={selectedBubble}
            onClose={handleModalClose}
          />

          <DatabaseDebugger
            isVisible={showDatabaseDebugger}
            onClose={handleDatabaseDebuggerClose}
          />

          <UnifiedDialogLayout
            isVisible={showRegistrationForm}
            onClose={handleRegistrationFormClose}
            title="🎵 楽曲登録"
            className="song-registration-dialog"
            size="standard"
            mobileOptimized={true}
          >
            <SongRegistrationForm
              isVisible={true}
              onClose={handleRegistrationFormClose}
              onSongAdded={handleSongAdded}
            />
          </UnifiedDialogLayout>

          <UnifiedDialogLayout
            isVisible={showSongManagement}
            onClose={handleSongManagementClose}
            title="📝 楽曲編集"
            className="song-management-dialog"
            size="large"
            mobileOptimized={true}
          >
            <SongManagement
              isVisible={true}
              onClose={handleSongManagementClose}
              onSongUpdated={handleSongUpdated}
              onSongDeleted={handleSongDeleted}
            />
          </UnifiedDialogLayout>

          <UnifiedDialogLayout
            isVisible={showTagList}
            onClose={handleTagListClose}
            title="🏷️ タグ一覧"
            className="tag-list-dialog"
            size="standard"
            mobileOptimized={true}
          >
            <EnhancedTagList isVisible={true} onClose={handleTagListClose} />
          </UnifiedDialogLayout>

          <UnifiedDialogLayout
            isVisible={showTagRegistration}
            onClose={handleTagRegistrationClose}
            title="🏷️➕ タグ登録"
            className="tag-registration-dialog"
            size="standard"
            mobileOptimized={true}
          >
            <TagRegistrationDialog
              isVisible={true}
              onClose={handleTagRegistrationClose}
              onTagsRegistered={handleTagsRegistered}
            />
          </UnifiedDialogLayout>

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
        </MobileFirstLayout>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
