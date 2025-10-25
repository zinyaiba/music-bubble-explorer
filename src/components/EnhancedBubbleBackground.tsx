import React, { useMemo, useRef, useEffect } from 'react'
import { useGlassmorphismTheme } from './GlassmorphismThemeProvider'

interface EnhancedBubbleBackgroundProps {
  width: number
  height: number
  theme?: 'chestnut' | 'default'
  intensity?: 'subtle' | 'moderate' | 'vibrant'
  performanceMode?: boolean
  className?: string
}

/**
 * EnhancedBubbleBackground - 栗モチーフを使用した背景デザインコンポーネント
 * Requirements: 4.1, 4.2, 4.3, 4.5 - 視覚的強化とパフォーマンス最適化
 */
export const EnhancedBubbleBackground: React.FC<
  EnhancedBubbleBackgroundProps
> = ({
  width,
  height,
  theme = 'chestnut',
  intensity = 'moderate',
  performanceMode = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glassmorphismTheme = useGlassmorphismTheme()

  // ガラスモーフィズムテーマベースの色パレット
  const glassmorphismColors = useMemo(() => {
    const baseColors = {
      subtle: {
        primary: glassmorphismTheme.colors.primary[100],
        secondary: glassmorphismTheme.colors.primary[200],
        accent: glassmorphismTheme.colors.primary[300],
        highlight: glassmorphismTheme.colors.neutral[50],
        background: glassmorphismTheme.colors.neutral[0],
      },
      moderate: {
        primary: glassmorphismTheme.colors.primary[200],
        secondary: glassmorphismTheme.colors.primary[300],
        accent: glassmorphismTheme.colors.primary[400],
        highlight: glassmorphismTheme.colors.neutral[100],
        background: glassmorphismTheme.colors.primary[50],
      },
      vibrant: {
        primary: glassmorphismTheme.colors.primary[300],
        secondary: glassmorphismTheme.colors.primary[400],
        accent: glassmorphismTheme.colors.primary[500],
        highlight: glassmorphismTheme.colors.primary[100],
        background: glassmorphismTheme.colors.primary[100],
      },
    }
    return baseColors[intensity]
  }, [intensity, glassmorphismTheme])

  // デフォルトテーマの色パレット（ガラスモーフィズム対応）
  const defaultColors = useMemo(
    () => ({
      primary: glassmorphismTheme.colors.primary[100],
      secondary: glassmorphismTheme.colors.primary[50],
      accent: glassmorphismTheme.colors.neutral[100],
      highlight: glassmorphismTheme.colors.neutral[0],
      background: glassmorphismTheme.colors.neutral[50],
    }),
    [glassmorphismTheme]
  )

  // 現在のテーマに基づく色パレット（ガラスモーフィズム対応）
  const colors = theme === 'chestnut' ? glassmorphismColors : defaultColors

  // SVGパターンの生成（ガラスモーフィズム対応の抽象的パターン）
  const glassmorphismPattern = useMemo(() => {
    if (performanceMode) return null

    return `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="glassmorphismPattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <!-- ガラスモーフィズム円形パターン -->
            <circle cx="30" cy="30" r="20" fill="${colors.primary}" opacity="0.03"/>
            <circle cx="30" cy="30" r="12" fill="${colors.secondary}" opacity="0.02"/>
            <circle cx="30" cy="30" r="6" fill="${colors.highlight}" opacity="0.015"/>
            <!-- 光の反射効果 -->
            <ellipse cx="25" cy="25" rx="8" ry="4" fill="${colors.highlight}" opacity="0.01" transform="rotate(-45 25 25)"/>
          </pattern>
          
          <pattern id="bubblePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <!-- シャボン玉風パターン -->
            <circle cx="20" cy="20" r="12" fill="${colors.accent}" opacity="0.015"/>
            <circle cx="20" cy="20" r="8" fill="${colors.highlight}" opacity="0.01"/>
            <!-- ハイライト効果 -->
            <ellipse cx="16" cy="16" rx="4" ry="2" fill="${colors.highlight}" opacity="0.02" transform="rotate(30 16 16)"/>
          </pattern>
        </defs>
      </svg>
    `
  }, [colors, performanceMode])

  // CSS背景グラデーションの生成（ガラスモーフィズム対応）
  const backgroundGradient = useMemo(() => {
    if (theme === 'chestnut') {
      return `
        radial-gradient(circle at 25% 25%, ${colors.background}20 0%, transparent 60%),
        radial-gradient(circle at 75% 75%, ${colors.highlight}15 0%, transparent 60%),
        radial-gradient(circle at 50% 90%, ${colors.accent}10 0%, transparent 60%),
        linear-gradient(135deg, ${colors.primary}08 0%, ${colors.secondary}06 50%, ${colors.background}10 100%)
      `
    } else {
      return `
        radial-gradient(circle at 30% 20%, ${colors.highlight}15 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, ${colors.accent}12 0%, transparent 50%),
        linear-gradient(135deg, ${colors.primary}10 0%, ${colors.secondary}08 100%)
      `
    }
  }, [theme, colors])

  // Canvas描画による高度な背景効果（ガラスモーフィズム対応）
  const drawEnhancedBackground = useMemo(() => {
    if (performanceMode) return null

    return (ctx: CanvasRenderingContext2D) => {
      // ガラスモーフィズム円形パターンの散布
      const circleCount = Math.min(Math.floor((width * height) / 12000), 18)

      for (let i = 0; i < circleCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 20 + Math.random() * 15
        const opacity = 0.008 + Math.random() * 0.007

        ctx.save()
        ctx.globalAlpha = opacity

        // メインの円形
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        gradient.addColorStop(0, colors.highlight)
        gradient.addColorStop(0.5, colors.primary)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // ハイライト効果
        ctx.globalAlpha = opacity * 1.5
        ctx.fillStyle = colors.highlight
        ctx.beginPath()
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      // 小さなシャボン玉風パターン
      const bubbleCount = Math.min(Math.floor((width * height) / 18000), 12)

      for (let i = 0; i < bubbleCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 8 + Math.random() * 8
        const opacity = 0.005 + Math.random() * 0.005

        ctx.save()
        ctx.globalAlpha = opacity

        // シャボン玉の本体
        const bubbleGradient = ctx.createRadialGradient(x, y, 0, x, y, size)
        bubbleGradient.addColorStop(0, colors.accent)
        bubbleGradient.addColorStop(0.7, colors.secondary)
        bubbleGradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = bubbleGradient
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // 光の反射
        ctx.globalAlpha = opacity * 2
        ctx.fillStyle = colors.highlight
        ctx.beginPath()
        ctx.arc(x - size * 0.4, y - size * 0.4, size * 0.25, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }
    }
  }, [width, height, colors, performanceMode])

  // Canvas描画の実行
  useEffect(() => {
    if (performanceMode || !drawEnhancedBackground) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height)

    // 背景効果を描画
    drawEnhancedBackground(ctx)
  }, [width, height, drawEnhancedBackground, performanceMode])

  // パフォーマンス最適化されたスタイル
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: backgroundGradient,
    zIndex: -1,
    pointerEvents: 'none',
    // GPU加速のヒント
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    willChange: performanceMode ? 'auto' : 'transform',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
  }

  // SVGパターンのスタイル（ガラスモーフィズム対応）
  const patternStyle: React.CSSProperties = performanceMode
    ? {}
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: glassmorphismPattern
          ? `url("data:image/svg+xml,${encodeURIComponent(glassmorphismPattern)}")`
          : 'none',
        backgroundRepeat: 'repeat',
        opacity: 0.1,
        mixBlendMode: 'soft-light',
      }

  return (
    <div
      className={`enhanced-bubble-background ${className}`}
      style={containerStyle}
      aria-hidden="true"
    >
      {/* CSS背景グラデーション層 */}
      <div
        className="gradient-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* SVGパターン層（パフォーマンスモード時は非表示） */}
      {!performanceMode && (
        <div className="pattern-layer" style={patternStyle} />
      )}

      {/* Canvas装飾層（パフォーマンスモード時は非表示） */}
      {!performanceMode && (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default EnhancedBubbleBackground
