/**
 * Text Rendering Utility for Bubble Canvas
 * Requirements: 10.5 - シャボン玉文字表示の改善
 */

export interface TextRenderingConfig {
  minFontSize: number
  maxFontSize: number
  contrastRatio: number
  strokeWidth: number
  maxTextWidth: number
  ellipsisThreshold: number
}

export interface TextMetrics {
  fontSize: number
  displayText: string
  textWidth: number
  strokeWidth: number
  fillColor: string
  strokeColor: string
}

export class BubbleTextRenderer {
  private static readonly DEFAULT_CONFIG: TextRenderingConfig = {
    minFontSize: 8,
    maxFontSize: 18,
    contrastRatio: 4.5, // WCAG AA standard
    strokeWidth: 2,
    maxTextWidth: 0.85, // 85% of bubble width
    ellipsisThreshold: 8 // Start checking for ellipsis after 8 characters
  }

  /**
   * 動的フォントサイズを計算
   * Requirements: 10.5 - 動的フォントサイズ計算の実装
   */
  static calculateOptimalFontSize(
    text: string, 
    bubbleSize: number, 
    config: Partial<TextRenderingConfig> = {}
  ): number {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    
    // ベースフォントサイズをバブルサイズに基づいて計算
    const baseFontSize = Math.min(bubbleSize / 5.5, finalConfig.maxFontSize)
    
    // テキストの長さに応じて調整
    const textLength = text.length
    let adjustedFontSize = baseFontSize
    
    if (textLength > 20) {
      adjustedFontSize = baseFontSize * 0.6
    } else if (textLength > 15) {
      adjustedFontSize = baseFontSize * 0.7
    } else if (textLength > 10) {
      adjustedFontSize = baseFontSize * 0.85
    } else if (textLength > 6) {
      adjustedFontSize = baseFontSize * 0.95
    }
    
    // 最小・最大フォントサイズの制限を適用
    return Math.max(finalConfig.minFontSize, Math.min(adjustedFontSize, finalConfig.maxFontSize))
  }

  /**
   * テキストの省略表示を処理
   * Requirements: 10.5 - 長いテキストの省略表示対応
   */
  static truncateText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number,
    config: Partial<TextRenderingConfig> = {}
  ): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    
    // 短いテキストはそのまま返す
    if (text.length <= finalConfig.ellipsisThreshold) {
      return text
    }
    
    // フォントを設定してテキスト幅を測定
    ctx.font = `${fontSize}px Arial, sans-serif`
    const fullTextWidth = ctx.measureText(text).width
    
    // テキストが収まる場合はそのまま返す
    if (fullTextWidth <= maxWidth) {
      return text
    }
    
    // 省略記号の幅を測定
    const ellipsisWidth = ctx.measureText('…').width
    const availableWidth = maxWidth - ellipsisWidth
    
    // 二分探索で最適な文字数を見つける
    let left = 1
    let right = text.length - 1
    let bestLength = 1
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const truncatedText = text.substring(0, mid)
      const truncatedWidth = ctx.measureText(truncatedText).width
      
      if (truncatedWidth <= availableWidth) {
        bestLength = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    
    return text.substring(0, bestLength) + '…'
  }

  /**
   * 色コントラストを改善した文字色を計算
   * Requirements: 10.5 - 文字の色コントラスト改善
   */
  static calculateOptimalTextColor(
    backgroundColor: string,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'
  ): { fillColor: string; strokeColor: string } {
    
    // バブルタイプに応じた基本色を設定
    let baseFillColor: string
    
    switch (bubbleType) {
      case 'tag':
        baseFillColor = '#0D4F1C' // 濃い緑色（タグ専用）
        break
      case 'song':
        baseFillColor = '#2C1810' // 濃い茶色
        break
      case 'lyricist':
        baseFillColor = '#1A1A2E' // 濃い紫
        break
      case 'composer':
        baseFillColor = '#0F3460' // 濃い青
        break
      case 'arranger':
        baseFillColor = '#16213E' // 濃い紺
        break
      default:
        baseFillColor = '#2C2C2C' // デフォルト
    }
    
    // 背景色の明度を計算してコントラストを調整
    const bgLuminance = this.calculateLuminance(backgroundColor)
    
    // 明るい背景の場合はより濃い色を使用
    const fillColor = bgLuminance > 0.5 ? this.darkenColor(baseFillColor, 0.2) : baseFillColor
    
    // 縁取り色は常に白または黒で最大コントラストを確保
    const strokeColor = bgLuminance > 0.5 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)'
    
    return { fillColor, strokeColor }
  }

  /**
   * 縁取り幅を動的に計算
   * Requirements: 10.5 - 文字の縁取り効果追加
   */
  static calculateStrokeWidth(fontSize: number, bubbleType: string): number {
    const baseStrokeWidth = Math.max(1, fontSize / 8)
    
    // タグの場合は少し太めの縁取り
    if (bubbleType === 'tag') {
      return Math.max(1.5, fontSize / 6)
    }
    
    return baseStrokeWidth
  }

  /**
   * 完全なテキストメトリクスを計算
   * Requirements: 10.5 - 統合されたテキスト表示改善
   */
  static calculateTextMetrics(
    ctx: CanvasRenderingContext2D,
    text: string,
    bubbleSize: number,
    backgroundColor: string,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag',
    config: Partial<TextRenderingConfig> = {}
  ): TextMetrics {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    
    // フォントサイズを計算
    const fontSize = this.calculateOptimalFontSize(text, bubbleSize, config)
    
    // 最大テキスト幅を計算
    const maxTextWidth = bubbleSize * finalConfig.maxTextWidth
    
    // テキストを省略処理
    const displayText = this.truncateText(ctx, text, maxTextWidth, fontSize, config)
    
    // 実際のテキスト幅を測定
    ctx.font = `${fontSize}px Arial, sans-serif`
    const textWidth = ctx.measureText(displayText).width
    
    // 色を計算
    const { fillColor, strokeColor } = this.calculateOptimalTextColor(backgroundColor, bubbleType)
    
    // 縁取り幅を計算
    const strokeWidth = this.calculateStrokeWidth(fontSize, bubbleType)
    
    return {
      fontSize,
      displayText,
      textWidth,
      strokeWidth,
      fillColor,
      strokeColor
    }
  }

  /**
   * テキストを描画
   * Requirements: 10.5 - 改善されたテキスト描画
   */
  static renderText(
    ctx: CanvasRenderingContext2D,
    metrics: TextMetrics,
    x: number,
    y: number,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'
  ): void {
    // フォントを設定
    const fontWeight = bubbleType === 'tag' ? 'bold' : 'normal'
    ctx.font = `${fontWeight} ${metrics.fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 縁取りを描画（複数層で視認性向上）
    ctx.strokeStyle = metrics.strokeColor
    ctx.lineWidth = metrics.strokeWidth
    ctx.strokeText(metrics.displayText, x, y)
    
    // タグの場合は追加の縁取り効果
    if (bubbleType === 'tag') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = metrics.strokeWidth * 0.7
      ctx.strokeText(metrics.displayText, x, y)
    }
    
    // テキスト本体を描画
    ctx.fillStyle = metrics.fillColor
    ctx.fillText(metrics.displayText, x, y)
  }

  /**
   * 色の輝度を計算（WCAG基準）
   */
  private static calculateLuminance(color: string): number {
    // 簡易的な輝度計算（実際のプロジェクトではより正確な計算を推奨）
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    return 0.299 * r + 0.587 * g + 0.114 * b
  }

  /**
   * 色を暗くする
   */
  private static darkenColor(color: string, factor: number): string {
    const hex = color.replace('#', '')
    const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor))
    const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor))
    const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor))
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
}