import React, { useMemo, useRef, useEffect } from 'react'

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

  // 栗モチーフの色パレット
  const chestnutColors = useMemo(() => {
    const baseColors = {
      subtle: {
        primary: '#8B4513', // サドルブラウン
        secondary: '#D2691E', // チョコレート
        accent: '#DEB887', // バーリーウッド
        highlight: '#F5DEB3', // ウィート
        background: '#FFF8DC', // コーンシルク
      },
      moderate: {
        primary: '#A0522D', // シエナ
        secondary: '#CD853F', // ペルー
        accent: '#DAA520', // ゴールデンロッド
        highlight: '#F0E68C', // カーキ
        background: '#FFFACD', // レモンシフォン
      },
      vibrant: {
        primary: '#B22222', // ファイアブリック
        secondary: '#DC143C', // クリムゾン
        accent: '#FF6347', // トマト
        highlight: '#FFB6C1', // ライトピンク
        background: '#FFF0F5', // ラベンダーブラッシュ
      },
    }
    return baseColors[intensity]
  }, [intensity])

  // デフォルトテーマの色パレット
  const defaultColors = useMemo(
    () => ({
      primary: '#E8F4FD',
      secondary: '#FFF0F5',
      accent: '#F0F8FF',
      highlight: '#FFFFFF',
      background: '#FAFAFA',
    }),
    []
  )

  // 現在のテーマに基づく色パレット
  const colors = theme === 'chestnut' ? chestnutColors : defaultColors

  // SVGパターンの生成（栗の形状モチーフ）
  const chestnutPattern = useMemo(() => {
    if (performanceMode) return null

    return `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="chestnutPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <!-- 栗の形状 -->
            <ellipse cx="25" cy="35" rx="12" ry="15" fill="${colors.primary}" opacity="0.1"/>
            <ellipse cx="25" cy="32" rx="8" ry="10" fill="${colors.secondary}" opacity="0.08"/>
            <!-- 栗のとげとげ -->
            <path d="M25,20 L27,15 L23,15 Z" fill="${colors.accent}" opacity="0.06"/>
            <path d="M20,25 L15,23 L15,27 Z" fill="${colors.accent}" opacity="0.06"/>
            <path d="M30,25 L35,23 L35,27 Z" fill="${colors.accent}" opacity="0.06"/>
          </pattern>
          
          <pattern id="leafPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <!-- 葉っぱの形状 -->
            <ellipse cx="15" cy="15" rx="8" ry="4" fill="${colors.highlight}" opacity="0.05" transform="rotate(45 15 15)"/>
            <ellipse cx="15" cy="15" rx="6" ry="3" fill="${colors.accent}" opacity="0.03" transform="rotate(-30 15 15)"/>
          </pattern>
        </defs>
      </svg>
    `
  }, [colors, performanceMode])

  // CSS背景グラデーションの生成
  const backgroundGradient = useMemo(() => {
    if (theme === 'chestnut') {
      return `
        radial-gradient(circle at 20% 30%, ${colors.background}40 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, ${colors.highlight}30 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, ${colors.accent}20 0%, transparent 50%),
        linear-gradient(135deg, ${colors.primary}15 0%, ${colors.secondary}10 50%, ${colors.background}20 100%)
      `
    } else {
      return `
        linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)
      `
    }
  }, [theme, colors])

  // Canvas描画による高度な背景効果（パフォーマンスモード時は無効）
  const drawEnhancedBackground = useMemo(() => {
    if (performanceMode) return null

    return (ctx: CanvasRenderingContext2D) => {
      // 栗の散布パターン
      const chestnutCount = Math.min(Math.floor((width * height) / 10000), 20)

      for (let i = 0; i < chestnutCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 15 + Math.random() * 10
        const opacity = 0.03 + Math.random() * 0.02

        ctx.save()
        ctx.globalAlpha = opacity

        // 栗の本体
        ctx.fillStyle = colors.primary
        ctx.beginPath()
        ctx.ellipse(x, y, size * 0.6, size * 0.8, 0, 0, Math.PI * 2)
        ctx.fill()

        // 栗のハイライト
        ctx.fillStyle = colors.highlight
        ctx.beginPath()
        ctx.ellipse(
          x - size * 0.2,
          y - size * 0.3,
          size * 0.3,
          size * 0.4,
          0,
          0,
          Math.PI * 2
        )
        ctx.fill()

        ctx.restore()
      }

      // 葉っぱの散布パターン
      const leafCount = Math.min(Math.floor((width * height) / 15000), 15)

      for (let i = 0; i < leafCount; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = 8 + Math.random() * 6
        const rotation = Math.random() * Math.PI * 2
        const opacity = 0.02 + Math.random() * 0.015

        ctx.save()
        ctx.globalAlpha = opacity
        ctx.translate(x, y)
        ctx.rotate(rotation)

        // 葉っぱの形状
        ctx.fillStyle = colors.accent
        ctx.beginPath()
        ctx.ellipse(0, 0, size, size * 0.5, 0, 0, Math.PI * 2)
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

  // SVGパターンのスタイル（パフォーマンスモード時は無効）
  const patternStyle: React.CSSProperties = performanceMode
    ? {}
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: chestnutPattern
          ? `url("data:image/svg+xml,${encodeURIComponent(chestnutPattern)}")`
          : 'none',
        backgroundRepeat: 'repeat',
        opacity: 0.4,
        mixBlendMode: 'multiply',
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
