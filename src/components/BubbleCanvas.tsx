import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { BubbleEntity } from '@/types/bubble'
import type { EnhancedBubble } from '@/types/enhancedBubble'

// ErrorHandler import removed - using simple error handling
import { CanvasErrorBoundary } from './ErrorBoundary'
import { CanvasRenderingFallback } from './FallbackComponents'
import { GPUAccelerationHelper } from '@/utils/animationOptimizer'

import { EnhancedBubbleManager } from '@/services/enhancedBubbleManager'
import { EnhancedBubbleBackground } from './EnhancedBubbleBackground'
import { GenreService } from '@/services/genreService'
import { useResponsive } from '@/hooks/useResponsive'
import './EnhancedBubbleBackground.css'

interface BubbleCanvasProps {
  width: number
  height: number
  bubbles: BubbleEntity[]
  onBubbleClick: (bubble: BubbleEntity) => void
  className?: string
  enhancedBubbleManager?: EnhancedBubbleManager // Optional enhanced manager for visual improvements
  backgroundTheme?: 'chestnut' | 'default' // Background theme selection
  backgroundIntensity?: 'subtle' | 'moderate' | 'vibrant' // Background intensity
  performanceMode?: boolean // Enable performance optimizations
  // ジャンルフィルタリング機能の追加
  selectedGenres?: string[] // フィルタリング対象のジャンル
  enableGenreFiltering?: boolean // ジャンルフィルタリング機能の有効/無効
}

/**
 * 仮想化のための可視範囲計算
 */
const calculateVisibleBounds = (
  width: number,
  height: number,
  margin: number = 100
) => ({
  left: -margin,
  right: width + margin,
  top: -margin,
  bottom: height + margin,
})

/**
 * シャボン玉が可視範囲内にあるかチェック
 */
const isBubbleVisible = (
  bubble: BubbleEntity,
  bounds: ReturnType<typeof calculateVisibleBounds>
): boolean => {
  const radius = bubble.getDisplaySize() / 2
  return (
    bubble.x + radius >= bounds.left &&
    bubble.x - radius <= bounds.right &&
    bubble.y + radius >= bounds.top &&
    bubble.y - radius <= bounds.bottom
  )
}

/**
 * BubbleCanvas - HTML5 Canvasを使用したシャボン玉描画コンポーネント
 * パフォーマンス最適化版
 */
export const BubbleCanvas: React.FC<BubbleCanvasProps> = React.memo(
  ({
    width,
    height,
    bubbles,
    onBubbleClick,
    className,
    enhancedBubbleManager,
    backgroundTheme = 'chestnut',
    backgroundIntensity = 'moderate',
    performanceMode = false,
    selectedGenres = [],
    enableGenreFiltering = false,
  }) => {
    const screenSize = useResponsive()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [, setIsAnimating] = useState(true)
    const [hasCanvasError, setHasCanvasError] = useState(false)
    const [canvasErrorMessage, setCanvasErrorMessage] = useState<string>('')
    const [selectedBubbleIndex, setSelectedBubbleIndex] = useState<number>(-1)
    const [filteringAnimation, setFilteringAnimation] = useState<
      Map<string, number>
    >(new Map())

    // パフォーマンス最適化: 可視範囲の計算をメモ化
    const visibleBounds = useMemo(
      () => calculateVisibleBounds(width, height),
      [width, height]
    )

    // ジャンルフィルタリング: 選択されたジャンルに基づいてシャボン玉をフィルタリング
    const genreFilteredBubbles = useMemo(() => {
      if (!enableGenreFiltering || selectedGenres.length === 0) {
        return bubbles
      }

      const genreService = GenreService.getInstance()
      return genreService.filterBubblesByGenres(bubbles, selectedGenres)
    }, [bubbles, selectedGenres, enableGenreFiltering])

    // パフォーマンス最適化: 可視範囲内のシャボン玉のみをフィルタリング
    const visibleBubbles = useMemo(
      () =>
        genreFilteredBubbles.filter(bubble =>
          isBubbleVisible(bubble, visibleBounds)
        ),
      [genreFilteredBubbles, visibleBounds]
    )

    // ジャンルフィルタリングアニメーション効果（簡素化）
    useEffect(() => {
      if (!enableGenreFiltering) return

      const newAnimationMap = new Map<string, number>()

      bubbles.forEach(bubble => {
        const isVisible = genreFilteredBubbles.includes(bubble)
        // アニメーションを簡素化：即座に切り替え
        newAnimationMap.set(bubble.id, isVisible ? 1 : 0)
      })

      setFilteringAnimation(newAnimationMap)
    }, [genreFilteredBubbles, bubbles, enableGenreFiltering])

    // 背景描画は EnhancedBubbleBackground コンポーネントに移行
    // Canvas描画最適化: 透明な背景を使用してシャボン玉の視認性を維持

    /**
     * Check if bubble is enhanced bubble with visual improvements
     */
    const isEnhancedBubble = useCallback(
      (bubble: BubbleEntity): boolean => {
        return enhancedBubbleManager?.isEnhancedBubble(bubble) ?? false
      },
      [enhancedBubbleManager]
    )

    /**
     * シャボン玉を描画する関数（改善版 - GPU加速対応 + Enhanced Bubble支援 + ジャンルフィルタリング）
     * Requirements: 7.3, 7.4 - GPU加速と回転効果
     * Requirements: 1.1 - Enhanced bubble visual distinction
     * Requirements: 4.2, 4.4 - ジャンルベースのシャボン玉表示制御とアニメーション付きフィルタリング効果
     */
    const drawBubble = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        bubble: BubbleEntity,
        isSelected: boolean = false
      ) => {
        // Check if this is an enhanced bubble with visual improvements
        if (isEnhancedBubble(bubble) && enhancedBubbleManager) {
          // Use enhanced rendering for visual distinction
          enhancedBubbleManager.renderBubbleWithIcon(
            bubble as EnhancedBubble,
            ctx
          )

          // Add selection highlight if needed
          if (isSelected) {
            const radius = bubble.getDisplaySize() / 2
            ctx.strokeStyle = '#FF6B6B'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.arc(bubble.x, bubble.y, radius + 5, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([]) // リセット
          }
          return
        }

        // Fallback to standard bubble rendering
        const { x, y, color } = bubble

        // アニメーション適用後のサイズ、透明度を取得
        const displaySize = bubble.getDisplaySize()
        let displayOpacity = bubble.getDisplayOpacity()
        const radius = displaySize / 2

        // ジャンルフィルタリングの適用（アニメーション簡素化）
        if (enableGenreFiltering) {
          const filterOpacity = filteringAnimation.get(bubble.id) ?? 1
          if (filterOpacity < 0.1) {
            return // 非表示のバブルは描画をスキップ
          }
          displayOpacity *= filterOpacity
        }

        // Canvas描画最適化: 透明度が非常に低い場合はスキップ
        if (displayOpacity < 0.01) return

        // 状態を保存（回転効果は無効化してパフォーマンス向上）
        ctx.save()

        // 透明度を設定
        ctx.globalAlpha = displayOpacity

        // ガラスモーフィズム効果のグラデーション
        const gradient = ctx.createRadialGradient(
          x - radius * 0.3, // ハイライト位置（左上寄り）
          y - radius * 0.3,
          0,
          x,
          y,
          radius
        )

        // ガラスモーフィズムのグラデーション設定
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)') // 中心は透明な白
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)') // 内側のガラス効果
        gradient.addColorStop(0.4, `${color}60`) // メインカラー（透明度60%）
        gradient.addColorStop(0.8, `${color}40`) // 外側のメインカラー（透明度40%）
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)') // 外側は薄い影

        // Canvas描画最適化: パスの再利用
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        // シャボン玉の本体を描画（ガラスモーフィズム）
        ctx.fillStyle = gradient
        ctx.fill()

        // ガラスモーフィズムの境界線（非常に薄く）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()

        // ガラスモーフィズムのハイライト効果
        if (radius > 20) {
          const highlightGradient = ctx.createRadialGradient(
            x - radius * 0.4,
            y - radius * 0.4,
            0,
            x - radius * 0.4,
            y - radius * 0.4,
            radius * 0.5
          )
          highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
          highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)')
          highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

          ctx.beginPath()
          ctx.arc(
            x - radius * 0.35,
            y - radius * 0.35,
            radius * 0.3,
            0,
            Math.PI * 2
          )
          ctx.fillStyle = highlightGradient
          ctx.fill()
        }

        // 改善されたテキスト描画（統一フォント + 柔らかい色）
        if (displaySize > 35) {
          ctx.globalAlpha = displayOpacity * 0.9

          // タグの場合は#プレフィックスを追加
          const displayName =
            bubble.type === 'tag' ? `#${bubble.name}` : bubble.name

          // フォントサイズを計算
          const fontSize = Math.max(10, Math.min(20, displaySize * 0.25))
          
          // 日本語・英語・タグに応じたフォント設定
          const isTag = bubble.type === 'tag'
          const hasEnglish = /[a-zA-Z]/.test(displayName)
          const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(displayName)
          
          let fontWeight = '500' // 通常：500
          let needsLetterSpacing = false
          
          if (isTag || (hasEnglish && !hasJapanese)) {
            fontWeight = '600' // 英字部分：600
            needsLetterSpacing = true // 英字のletter-spacingを広め
          }
          
          ctx.font = `${fontWeight} ${fontSize}px "M PLUS Rounded 1c", "Poppins", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          // 柔らかい黒色でテキストを描画
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
          
          // 英字の場合は文字間隔を手動で調整
          if (needsLetterSpacing && displayName.length > 1) {
            // 文字間隔を広げて描画（簡易実装）
            const chars = displayName.split('')
            const totalWidth = ctx.measureText(displayName).width
            const spacing = fontSize * 0.05 // 0.05em相当
            const adjustedWidth = totalWidth + (chars.length - 1) * spacing
            
            let startX = x - adjustedWidth / 2
            chars.forEach((char, index) => {
              const charWidth = ctx.measureText(char).width
              ctx.fillText(char, startX + charWidth / 2, y)
              startX += charWidth + spacing
            })
          } else {
            // 通常の描画
            ctx.fillText(displayName, x, y)
          }
        }

        // キーボード選択時のハイライト表示
        if (isSelected) {
          ctx.strokeStyle = '#FF6B6B'
          ctx.lineWidth = 3
          ctx.setLineDash([5, 5])
          ctx.beginPath()
          ctx.arc(x, y, displaySize / 2 + 5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([]) // リセット
        }

        // 透明度をリセット
        ctx.globalAlpha = 1

        // 状態を復元
        ctx.restore()
      },
      [
        enableGenreFiltering,
        filteringAnimation,
        isEnhancedBubble,
        enhancedBubbleManager,
      ]
    )

    /**
     * キーボードナビゲーション処理（強化版）
     */
    const handleCanvasKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLCanvasElement>) => {
        if (visibleBubbles.length === 0) return

        // 現在選択されているバブルのインデックス
        const currentIndex = selectedBubbleIndex
        let newIndex = currentIndex

        switch (event.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            event.preventDefault()
            newIndex =
              currentIndex < visibleBubbles.length - 1 ? currentIndex + 1 : 0
            setSelectedBubbleIndex(newIndex)
            // アクセシビリティ: 選択されたバブルの情報を読み上げ
            announceSelectedBubble(visibleBubbles[newIndex])
            break
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault()
            newIndex =
              currentIndex > 0 ? currentIndex - 1 : visibleBubbles.length - 1
            setSelectedBubbleIndex(newIndex)
            announceSelectedBubble(visibleBubbles[newIndex])
            break
          case 'Enter':
          case ' ':
            event.preventDefault()
            if (currentIndex >= 0 && currentIndex < visibleBubbles.length) {
              const selectedBubble = visibleBubbles[currentIndex]
              onBubbleClick(selectedBubble)
              // アクセシビリティ: クリック操作の確認
              announceAction(`${selectedBubble.name}の詳細を表示します`)
            }
            break
          case 'Home':
            event.preventDefault()
            setSelectedBubbleIndex(0)
            announceSelectedBubble(visibleBubbles[0])
            break
          case 'End':
            event.preventDefault()
            newIndex = visibleBubbles.length - 1
            setSelectedBubbleIndex(newIndex)
            announceSelectedBubble(visibleBubbles[newIndex])
            break
          case 'Escape':
            event.preventDefault()
            // フォーカスをリセット
            setSelectedBubbleIndex(-1)
            announceAction('選択をクリアしました')
            break
          case '?':
          case 'h':
            event.preventDefault()
            // ヘルプ情報の表示
            announceAction(
              '矢印キーで移動、EnterまたはSpaceで選択、Escapeでクリア、?でヘルプ'
            )
            break
        }

        // 選択されたバブルが画面外にある場合の処理
        if (
          newIndex !== currentIndex &&
          newIndex >= 0 &&
          newIndex < visibleBubbles.length
        ) {
          const selectedBubble = visibleBubbles[newIndex]
          // 必要に応じてスクロールやズーム調整を行う
          ensureBubbleVisible(selectedBubble)
        }
      },
      [visibleBubbles, selectedBubbleIndex, onBubbleClick]
    )

    /**
     * アクセシビリティ: 選択されたバブルの情報を音声で通知
     */
    const announceSelectedBubble = useCallback((bubble: BubbleEntity) => {
      if (!bubble) return

      const typeLabel =
        bubble.type === 'song'
          ? '楽曲'
          : bubble.type === 'lyricist'
            ? '作詞家'
            : bubble.type === 'composer'
              ? '作曲家'
              : '編曲家'

      const message = `${typeLabel}: ${bubble.name}を選択しました。関連データ${bubble.relatedCount}件`
      announceAction(message)
    }, [])

    /**
     * アクセシビリティ: 操作の結果を音声で通知
     */
    const announceAction = useCallback((message: string) => {
      // ARIA live region を使用して音声読み上げ
      const liveRegion = document.getElementById('canvas-announcements')
      if (liveRegion) {
        liveRegion.textContent = message
        // 短時間後にクリア
        setTimeout(() => {
          liveRegion.textContent = ''
        }, 3000)
      }
    }, [])

    /**
     * 選択されたバブルが見える位置にあることを確認
     */
    const ensureBubbleVisible = useCallback((bubble: BubbleEntity) => {
      // 現在の実装では特別な処理は不要だが、
      // 将来的にズームやパン機能を追加する場合に使用
      console.log(`Ensuring bubble ${bubble.name} is visible`)
    }, [])

    /**
     * Canvas全体を描画する関数（エラーハンドリング強化版）
     */
    const draw = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) {
        setCanvasErrorMessage('Canvas要素が見つかりません')
        setHasCanvasError(true)
        return
      }

      try {
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.warn('Failed to get canvas context')
          return false
        }

        // Canvas描画最適化: 透明背景でクリア（背景は別コンポーネントで処理）
        ctx.clearRect(0, 0, width, height)

        // 仮想化: 可視範囲内のシャボン玉のみを描画
        visibleBubbles.forEach((bubble, index) => {
          try {
            const isSelected = index === selectedBubbleIndex
            drawBubble(ctx, bubble, isSelected)

            // Handle enhanced bubble lifecycle if available
            if (isEnhancedBubble(bubble) && enhancedBubbleManager) {
              enhancedBubbleManager.handleBubbleLifecycle(
                bubble as EnhancedBubble
              )
            }
          } catch (error) {
            console.warn('Bubble rendering error:', error, {
              bubbleId: bubble.id,
              bubbleName: bubble.name,
              bubbleType: bubble.type,
            })
          }
        })

        // エラー状態から復旧
        if (hasCanvasError) {
          setHasCanvasError(false)
          setCanvasErrorMessage('')
        }
      } catch (error) {
        console.error('Canvas rendering error:', error)
        setCanvasErrorMessage('Canvas描画に失敗しました')
        setHasCanvasError(true)
      }
    }, [
      width,
      height,
      visibleBubbles,
      drawBubble,
      bubbles.length,
      hasCanvasError,
      selectedGenres,
      enableGenreFiltering,
    ])

    // アニメーションループは親コンポーネントで管理されるため削除

    /**
     * Get coordinates from mouse or touch event
     */
    const getEventCoordinates = useCallback(
      (
        event:
          | React.MouseEvent<HTMLCanvasElement>
          | React.TouchEvent<HTMLCanvasElement>
      ) => {
        const canvas = canvasRef.current
        if (!canvas) return null

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        let clientX: number, clientY: number

        if ('touches' in event) {
          // Touch event
          if (event.touches.length > 0) {
            clientX = event.touches[0].clientX
            clientY = event.touches[0].clientY
          } else if (event.changedTouches.length > 0) {
            clientX = event.changedTouches[0].clientX
            clientY = event.changedTouches[0].clientY
          } else {
            return null
          }
        } else {
          // Mouse event
          clientX = event.clientX
          clientY = event.clientY
        }

        const x = (clientX - rect.left) * scaleX
        const y = (clientY - rect.top) * scaleY

        return { x, y }
      },
      []
    )

    /**
     * クリック/タッチイベントハンドラー（最適化版）
     */
    const handleCanvasClick = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getEventCoordinates(event)
        if (!coords) return

        // パフォーマンス最適化: 可視範囲内のシャボン玉のみをチェック
        for (let i = visibleBubbles.length - 1; i >= 0; i--) {
          const bubble = visibleBubbles[i]
          if (bubble.containsPoint(coords.x, coords.y)) {
            onBubbleClick(bubble)
            break
          }
        }
      },
      [visibleBubbles, onBubbleClick, getEventCoordinates]
    )

    /**
     * タッチイベントハンドラー（モバイル最適化版 - 34.1対応）
     * Requirements: 1.1, 1.2, 1.3, 1.4 - モバイルダイアログ表示の修正
     */
    const handleTouchStart = useCallback(
      (event: React.TouchEvent<HTMLCanvasElement>) => {
        // Prevent default to avoid scrolling and zooming
        event.preventDefault()

        const coords = getEventCoordinates(event)
        if (!coords) return

        // パフォーマンス最適化: 可視範囲内のシャボン玉のみをチェック
        for (let i = visibleBubbles.length - 1; i >= 0; i--) {
          const bubble = visibleBubbles[i]
          // タッチ操作では少し大きめの判定エリアを使用
          const touchRadius = Math.max(bubble.getDisplaySize() / 2, 20)
          const distance = Math.sqrt(
            Math.pow(coords.x - bubble.x, 2) + Math.pow(coords.y - bubble.y, 2)
          )

          if (distance <= touchRadius) {
            onBubbleClick(bubble)
            break
          }
        }
      },
      [visibleBubbles, onBubbleClick, getEventCoordinates]
    )

    /**
     * タッチエンドイベントハンドラー（モバイル最適化版 - 34.1対応）
     * 長押し不要でのダイアログ表示実装
     */
    const handleTouchEnd = useCallback(
      (event: React.TouchEvent<HTMLCanvasElement>) => {
        // Prevent default to avoid click event duplication
        event.preventDefault()

        // Touch end handling is already covered by touchStart
        // This prevents double-firing of events
      },
      []
    )

    /**
     * タッチキャンセルイベントハンドラー（モバイル最適化版 - 34.1対応）
     */
    const handleTouchCancel = useCallback(
      (event: React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault()
        // Reset any touch state if needed
      },
      []
    )

    /**
     * マウスホバー効果のためのマウス移動ハンドラー（デスクトップのみ、最適化版）
     */
    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        // タッチデバイスではホバー効果を無効化
        if ('ontouchstart' in window) return

        const coords = getEventCoordinates(event)
        if (!coords) return

        // パフォーマンス最適化: 可視範囲内のシャボン玉のみをチェック
        let isHovering = false
        for (let i = visibleBubbles.length - 1; i >= 0; i--) {
          const bubble = visibleBubbles[i]
          if (bubble.containsPoint(coords.x, coords.y)) {
            isHovering = true
            break
          }
        }

        // カーソルスタイルを変更（デスクトップのみ）
        const canvas = canvasRef.current
        if (canvas) {
          canvas.style.cursor = isHovering ? 'pointer' : 'default'
        }
      },
      [visibleBubbles, getEventCoordinates]
    )

    /**
     * アニメーションの開始/停止を制御
     */
    const toggleAnimation = useCallback(() => {
      setIsAnimating(prev => !prev)
    }, [])

    // Suppress unused variable warning - keeping for future use
    void toggleAnimation

    /**
     * Canvas エラーからの復旧を試行
     */
    const handleCanvasRetry = useCallback(() => {
      setHasCanvasError(false)
      setCanvasErrorMessage('')

      // Canvas要素の再初期化を試行
      setTimeout(() => {
        draw()
      }, 100)
    }, [draw])

    /**
     * 可視シャボン玉が更新された時に再描画（最適化版）
     */
    useEffect(() => {
      draw()
    }, [draw])

    /**
     * Canvas サイズが変更された時に再描画とGPU最適化
     */
    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas) {
        // GPU加速を適用（Requirements: 7.3）
        GPUAccelerationHelper.optimizeCanvasPerformance(canvas)
      }
      draw()
    }, [draw, width, height])

    /**
     * 初期化時にGPU加速を設定
     */
    useEffect(() => {
      const canvas = canvasRef.current
      if (canvas) {
        GPUAccelerationHelper.optimizeCanvasPerformance(canvas)
      }
    }, [])

    // Canvas エラー時のフォールバック表示
    if (hasCanvasError) {
      return (
        <div className={className} style={{ position: 'relative' }}>
          <CanvasRenderingFallback
            error={{
              message: canvasErrorMessage,
              type: 'canvas' as any,
              timestamp: Date.now(),
              severity: 'medium' as any,
            }}
            onRetry={handleCanvasRetry}
            onReload={() => window.location.reload()}
          />
        </div>
      )
    }

    return (
      <CanvasErrorBoundary
        onError={error => {
          setCanvasErrorMessage(error.message)
          setHasCanvasError(true)
        }}
      >
        <div className={className} style={{ position: 'relative' }}>
          {/* Enhanced Background Layer - 栗モチーフ背景 */}
          <EnhancedBubbleBackground
            width={width}
            height={height}
            theme={backgroundTheme}
            intensity={backgroundIntensity}
            performanceMode={performanceMode}
            className="bubble-canvas-background"
          />

          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            role="img"
            aria-label={`音楽シャボン玉キャンバス。${bubbles.length}個のシャボン玉が表示されています。矢印キーで移動、EnterまたはSpaceで選択できます。`}
            aria-describedby="canvas-instructions canvas-announcements"
            tabIndex={0}
            onKeyDown={handleCanvasKeyDown}
            className="bubble-canvas gpu-accelerated animation-optimized flicker-prevention stable-rendering mobile-touch-optimized bubble-canvas-improved"
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              minWidth: screenSize.isMobile ? '280px' : '400px',
              minHeight: screenSize.isMobile ? '480px' : '300px',
              visibility: 'visible',
              opacity: 1,
              // ガラスモーフィズム効果を適用
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              touchAction: 'manipulation', // Optimize for touch
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              // GPU加速のヒント（Requirements: 7.3 - GPU加速の適用）
              transform: 'translateZ(0)', // GPU層を強制作成
              WebkitTransform: 'translateZ(0)',
              willChange: performanceMode ? 'auto' : 'transform', // ブラウザに変更予定を通知
              WebkitBackfaceVisibility: 'hidden', // 裏面を非表示にして最適化
              backfaceVisibility: 'hidden',
              WebkitPerspective: '1000px', // 3D変換を有効化
              perspective: '1000px',
              // レイヤー順序を確保
              position: 'relative',
              zIndex: 1,
            }}
          />

          {/* アクセシビリティ: キーボード操作の詳細説明 */}
          <div id="canvas-instructions" className="sr-only">
            矢印キーでシャボン玉を選択、EnterまたはSpaceキーで詳細表示、
            Homeキーで最初、Endキーで最後、Escapeキーで選択解除、
            ?キーまたはhキーでヘルプ表示。 現在{visibleBubbles.length}
            個のシャボン玉が表示されています。
          </div>

          {/* アクセシビリティ: 動的な通知用のlive region */}
          <div
            id="canvas-announcements"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />

          {/* 選択されたバブルの視覚的インジケーター */}
          {selectedBubbleIndex >= 0 &&
            selectedBubbleIndex < visibleBubbles.length && (
              <div
                className="selected-bubble-indicator sr-only"
                aria-live="polite"
              >
                選択中: {visibleBubbles[selectedBubbleIndex]?.name}
              </div>
            )}
        </div>
      </CanvasErrorBoundary>
    )
  },
  (prevProps, nextProps) => {
    // React.memo用のカスタム比較関数（パフォーマンス最適化）
    return (
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.bubbles.length === nextProps.bubbles.length &&
      prevProps.onBubbleClick === nextProps.onBubbleClick &&
      prevProps.className === nextProps.className &&
      prevProps.backgroundTheme === nextProps.backgroundTheme &&
      prevProps.backgroundIntensity === nextProps.backgroundIntensity &&
      prevProps.performanceMode === nextProps.performanceMode &&
      JSON.stringify(prevProps.selectedGenres) ===
        JSON.stringify(nextProps.selectedGenres) &&
      prevProps.enableGenreFiltering === nextProps.enableGenreFiltering &&
      // シャボン玉の位置やサイズが大きく変わった場合のみ再描画
      prevProps.bubbles.every((bubble, index) => {
        const nextBubble = nextProps.bubbles[index]
        if (!nextBubble) return false

        // 位置の変化が小さい場合はスキップ（微細な動きを無視）
        const positionDiff =
          Math.abs(bubble.x - nextBubble.x) + Math.abs(bubble.y - nextBubble.y)
        const sizeDiff = Math.abs(
          bubble.getDisplaySize() - nextBubble.getDisplaySize()
        )
        const opacityDiff = Math.abs(
          bubble.getDisplayOpacity() - nextBubble.getDisplayOpacity()
        )

        return positionDiff < 1 && sizeDiff < 1 && opacityDiff < 0.01
      })
    )
  }
)

export default BubbleCanvas
