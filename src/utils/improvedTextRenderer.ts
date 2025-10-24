/**
 * Improved Text Rendering Utility for Bubble Canvas
 * Requirements: 5.1, 5.2, 5.3, 5.4 - より多くの文字数表示、はみ出し許可、読みやすさ向上、動的フォントサイズ調整
 */

import {
  BubbleTextRenderer,
  TextRenderingConfig,
  TextMetrics,
} from './textRenderer'
import { DynamicFontSizer, DynamicFontConfig } from './dynamicFontSizer'

export interface ImprovedTextRenderingConfig extends TextRenderingConfig {
  allowOverflow: boolean
  maxCharacterCount: number
  overflowTolerance: number
  prioritizeReadability: boolean
  useDynamicSizing: boolean
  dynamicFontConfig?: Partial<DynamicFontConfig>
}

export interface ImprovedTextMetrics extends TextMetrics {
  isOverflowing: boolean
  actualTextWidth: number
  overflowAmount: number
  characterCount: number
}

export class ImprovedBubbleTextRenderer extends BubbleTextRenderer {
  private static readonly IMPROVED_DEFAULT_CONFIG: ImprovedTextRenderingConfig =
    {
      minFontSize: 12,
      maxFontSize: 32, // 大幅にフォントサイズを拡大
      contrastRatio: 4.5,
      strokeWidth: 0.8, // 縁取りをさらに薄く
      maxTextWidth: 1.5, // 50%のはみ出しを許可
      ellipsisThreshold: 25, // 25文字まで省略なし
      allowOverflow: true, // はみ出しを許可
      maxCharacterCount: 60, // 大幅に文字数を増加
      overflowTolerance: 0.5, // 50%のはみ出しを許可
      prioritizeReadability: true, // 読みやすさを優先
      useDynamicSizing: true, // 動的フォントサイズ調整を有効化
      dynamicFontConfig: {
        readabilityPriority: 0.95, // 読みやすさを最優先
        scaleFactor: 1.3, // 全体的にかなり大きめに
      },
    }

  /**
   * より多くの文字数を表示できる改善されたフォントサイズ計算
   * Requirements: 5.1, 5.3, 5.4 - より多くの文字数表示、読みやすさ優先、動的フォントサイズ調整
   */
  static calculateImprovedFontSize(
    text: string,
    bubbleSize: number,
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): number {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // 動的フォントサイズ調整が有効な場合
    if (finalConfig.useDynamicSizing) {
      const dynamicConfig = {
        baseSize: Math.min(bubbleSize / 4.5, finalConfig.maxFontSize),
        minSize: finalConfig.minFontSize,
        maxSize: finalConfig.maxFontSize,
        readabilityPriority: finalConfig.prioritizeReadability ? 0.8 : 0.5,
        ...finalConfig.dynamicFontConfig,
      }

      const result = DynamicFontSizer.calculateDynamicFontSize(
        text,
        bubbleSize,
        dynamicConfig
      )
      return result.fontSize
    }

    // 従来の計算方法（フォールバック）
    const baseFontSize = Math.min(bubbleSize / 4.5, finalConfig.maxFontSize)
    const textLength = text.length
    let adjustedFontSize = baseFontSize

    if (finalConfig.prioritizeReadability) {
      // 読みやすさを優先する場合、フォントサイズの縮小を抑制
      if (textLength > 30) {
        adjustedFontSize = baseFontSize * 0.75
      } else if (textLength > 25) {
        adjustedFontSize = baseFontSize * 0.8
      } else if (textLength > 20) {
        adjustedFontSize = baseFontSize * 0.85
      } else if (textLength > 15) {
        adjustedFontSize = baseFontSize * 0.9
      } else if (textLength > 10) {
        adjustedFontSize = baseFontSize * 0.95
      }
    } else {
      // 従来の調整
      if (textLength > 25) {
        adjustedFontSize = baseFontSize * 0.6
      } else if (textLength > 20) {
        adjustedFontSize = baseFontSize * 0.7
      } else if (textLength > 15) {
        adjustedFontSize = baseFontSize * 0.8
      } else if (textLength > 10) {
        adjustedFontSize = baseFontSize * 0.9
      }
    }

    // 最小・最大フォントサイズの制限を適用
    return Math.max(
      finalConfig.minFontSize,
      Math.min(adjustedFontSize, finalConfig.maxFontSize)
    )
  }

  /**
   * はみ出しを許可する改善されたテキスト処理
   * Requirements: 5.2, 5.3 - はみ出し許可、読みやすさ向上
   */
  static processTextWithOverflow(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number,
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): {
    displayText: string
    isOverflowing: boolean
    actualWidth: number
    overflowAmount: number
  } {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // フォントを設定してテキスト幅を測定
    ctx.font = `${fontSize}px Arial, sans-serif`
    const fullTextWidth = ctx.measureText(text).width

    // はみ出し許可の場合の最大幅を計算（より寛容に）
    const allowedMaxWidth = finalConfig.allowOverflow
      ? maxWidth * (1 + finalConfig.overflowTolerance)
      : maxWidth

    // テキストが許可された最大幅に収まる場合（文字数制限を優先しない）
    if (fullTextWidth <= allowedMaxWidth) {
      return {
        displayText: text,
        isOverflowing: fullTextWidth > maxWidth,
        actualWidth: fullTextWidth,
        overflowAmount: Math.max(0, fullTextWidth - maxWidth),
      }
    }

    // 文字数制限をチェック（幅制限の後に）
    if (text.length > finalConfig.maxCharacterCount) {
      // 文字数制限を超える場合は省略
      const truncatedText =
        text.substring(0, finalConfig.maxCharacterCount - 1) + '…'
      const truncatedWidth = ctx.measureText(truncatedText).width

      return {
        displayText: truncatedText,
        isOverflowing: truncatedWidth > maxWidth,
        actualWidth: truncatedWidth,
        overflowAmount: Math.max(0, truncatedWidth - maxWidth),
      }
    }

    // はみ出しが許可されていない場合、または許可範囲を超える場合は省略
    const ellipsisWidth = ctx.measureText('…').width
    const availableWidth = allowedMaxWidth - ellipsisWidth

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

    const finalText = text.substring(0, bestLength) + '…'
    const finalWidth = ctx.measureText(finalText).width

    return {
      displayText: finalText,
      isOverflowing: finalWidth > maxWidth,
      actualWidth: finalWidth,
      overflowAmount: Math.max(0, finalWidth - maxWidth),
    }
  }

  /**
   * 改善されたテキストメトリクス計算
   * Requirements: 5.1, 5.2, 5.3 - 統合された改善機能
   */
  static calculateImprovedTextMetrics(
    ctx: CanvasRenderingContext2D,
    text: string,
    bubbleSize: number,
    backgroundColor: string,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag',
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): ImprovedTextMetrics {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // 改善されたフォントサイズを計算
    const fontSize = this.calculateImprovedFontSize(
      text,
      bubbleSize,
      finalConfig
    )

    // 基本の最大テキスト幅を計算
    const baseMaxTextWidth = bubbleSize * 0.85 // 基本幅は85%

    // はみ出しを考慮したテキスト処理
    const textProcessResult = this.processTextWithOverflow(
      ctx,
      text,
      baseMaxTextWidth,
      fontSize,
      finalConfig
    )

    // 色を計算（親クラスのメソッドを使用）
    const { fillColor, strokeColor } = this.calculateOptimalTextColor(
      backgroundColor,
      bubbleType
    )

    // 縁取り幅を計算
    const strokeWidth = this.calculateStrokeWidth(fontSize, bubbleType)

    return {
      fontSize,
      displayText: textProcessResult.displayText,
      textWidth: textProcessResult.actualWidth,
      strokeWidth,
      fillColor,
      strokeColor,
      isOverflowing: textProcessResult.isOverflowing,
      actualTextWidth: textProcessResult.actualWidth,
      overflowAmount: textProcessResult.overflowAmount,
      characterCount: textProcessResult.displayText.length,
    }
  }

  /**
   * 改善されたテキスト描画（はみ出し対応）
   * Requirements: 5.2, 5.3 - はみ出し許可、読みやすさ向上
   */
  static renderImprovedText(
    ctx: CanvasRenderingContext2D,
    metrics: ImprovedTextMetrics,
    x: number,
    y: number,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'
  ): void {
    // フォントを設定
    const fontWeight = bubbleType === 'tag' ? 'bold' : 'normal'
    ctx.font = `${fontWeight} ${metrics.fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // はみ出している場合も自然な表示を維持
    // 背景の追加描画は行わず、テキストのみで表現

    // 縁取りを描画（より薄く自然に）
    const adjustedStrokeWidth = Math.max(0.5, metrics.strokeWidth * 0.6) // 縁取りを薄く

    // 薄い縁取りで視認性を確保
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)' // より薄い白い縁取り
    ctx.lineWidth = adjustedStrokeWidth
    ctx.strokeText(metrics.displayText, x, y)

    // タグの場合も縁取りを控えめに
    if (bubbleType === 'tag') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = adjustedStrokeWidth * 0.8
      ctx.strokeText(metrics.displayText, x, y)
    }

    // テキスト本体を描画
    ctx.fillStyle = metrics.fillColor
    ctx.fillText(metrics.displayText, x, y)
  }

  /**
   * 設定の妥当性をチェック
   */
  static validateConfig(
    config: Partial<ImprovedTextRenderingConfig>
  ): ImprovedTextRenderingConfig {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // 設定値の妥当性チェック
    if (
      finalConfig.overflowTolerance < 0 ||
      finalConfig.overflowTolerance > 0.5
    ) {
      console.warn(
        'overflowTolerance should be between 0 and 0.5, using default value'
      )
      finalConfig.overflowTolerance =
        this.IMPROVED_DEFAULT_CONFIG.overflowTolerance
    }

    if (finalConfig.maxCharacterCount < 5) {
      console.warn(
        'maxCharacterCount should be at least 5, using default value'
      )
      finalConfig.maxCharacterCount =
        this.IMPROVED_DEFAULT_CONFIG.maxCharacterCount
    }

    if (finalConfig.maxTextWidth > 2.0) {
      console.warn('maxTextWidth should not exceed 2.0, using default value')
      finalConfig.maxTextWidth = this.IMPROVED_DEFAULT_CONFIG.maxTextWidth
    }

    return finalConfig
  }

  /**
   * 画面サイズ変更に対応するリアルタイムフォントサイズ更新
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static createResponsiveFontSizeUpdater(
    text: string,
    bubbleSize: number,
    callback: (fontSize: number) => void,
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): () => void {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    if (!finalConfig.useDynamicSizing) {
      // 動的サイズ調整が無効な場合は何もしない
      return () => {}
    }

    const dynamicConfig = {
      baseSize: Math.min(bubbleSize / 4.5, finalConfig.maxFontSize),
      minSize: finalConfig.minFontSize,
      maxSize: finalConfig.maxFontSize,
      readabilityPriority: finalConfig.prioritizeReadability ? 0.8 : 0.5,
      ...finalConfig.dynamicFontConfig,
    }

    return DynamicFontSizer.createDynamicFontSizeUpdater(
      callback,
      text,
      bubbleSize,
      dynamicConfig
    )
  }

  /**
   * 複数のバブルに対して一貫したフォントサイズを計算
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static calculateConsistentFontSizes(
    bubbles: Array<{ text: string; bubbleSize: number }>,
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): Array<{ fontSize: number; scalingInfo: any }> {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    if (!finalConfig.useDynamicSizing) {
      // 動的サイズ調整が無効な場合は従来の方法
      return bubbles.map(({ text, bubbleSize }) => ({
        fontSize: this.calculateImprovedFontSize(text, bubbleSize, config),
        scalingInfo: { method: 'traditional' },
      }))
    }

    const dynamicConfig = {
      minSize: finalConfig.minFontSize,
      maxSize: finalConfig.maxFontSize,
      readabilityPriority: finalConfig.prioritizeReadability ? 0.8 : 0.5,
      ...finalConfig.dynamicFontConfig,
    }

    const results = DynamicFontSizer.calculateConsistentFontSizes(
      bubbles.map(({ text, bubbleSize }) => ({ text, bubbleSize })),
      dynamicConfig
    )

    return results.map(result => ({
      fontSize: result.fontSize,
      scalingInfo: {
        method: 'dynamic',
        reason: result.scalingReason,
        factors: result.appliedFactors,
        isOptimal: result.isOptimal,
      },
    }))
  }

  /**
   * スマートなテキスト分割
   * 日本語、英語、数字の境界を適切に処理
   */
  private static smartTextSplit(text: string): string[] {
    // 複数の分割パターンを組み合わせ
    const patterns = [
      /(\s+)/, // スペース
      /(?=[A-Z][a-z])/, // 大文字+小文字の前（iPhone → i|Phone）
      /(?<=[a-z])(?=[A-Z])/, // 小文字の後、大文字の前（littlePromise → little|Promise）
      /(?<=\d)(?=[A-Za-z])/, // 数字の後、文字の前（track1Song → track1|Song）
      /(?<=[A-Za-z])(?=\d)/, // 文字の後、数字の前（song2 → song|2）
      /(?<=[ひらがな])(?=[カタカナ])/u, // ひらがなの後、カタカナの前
      /(?<=[カタカナ])(?=[ひらがな])/u, // カタカナの後、ひらがなの前
      /(?<=[ひらがなカタカナ])(?=[A-Za-z])/u, // 日本語の後、英語の前
      /(?<=[A-Za-z])(?=[ひらがなカタカナ])/u, // 英語の後、日本語の前
      /(?<=[。、！？])(?=.)/u, // 句読点の後
      /(?<=の)(?=.)/u, // 「の」の後で分割可能
      /(?<=と)(?=.)/u, // 「と」の後で分割可能
    ]

    let words = [text]

    // 各パターンで順次分割
    for (const pattern of patterns) {
      const newWords: string[] = []
      for (const word of words) {
        const split = word.split(pattern).filter(w => w.length > 0)
        newWords.push(...split)
      }
      words = newWords
    }

    // 空文字や空白のみの要素を除去
    return words.filter(word => word.trim().length > 0)
  }

  /**
   * 改行対応のテキスト処理
   * Requirements: 5.1, 5.2 - より多くの文字数表示、改行による表示改善
   */
  static processTextWithLineBreaks(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number,
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): {
    lines: string[]
    isMultiLine: boolean
    totalHeight: number
    maxLineWidth: number
    isOverflowing: boolean
  } {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // フォントを設定
    ctx.font = `${fontSize}px Arial, sans-serif`

    // はみ出し許可の場合の最大幅を計算
    const allowedMaxWidth = finalConfig.allowOverflow
      ? maxWidth * (1 + finalConfig.overflowTolerance)
      : maxWidth

    // より柔軟な単語境界で分割を試みる
    const words = this.smartTextSplit(text)

    const lines: string[] = []
    let currentLine = ''
    let maxLineWidth = 0

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      const testLine = currentLine + word
      const testWidth = ctx.measureText(testLine).width

      // 改行の判定
      if (testWidth <= allowedMaxWidth || currentLine === '') {
        currentLine = testLine
        maxLineWidth = Math.max(maxLineWidth, testWidth)
      } else {
        // より自然な改行位置を探す（将来の拡張用）
        // const naturalBreakPoint = this.findNaturalBreakPoint(words, i)

        // 現在の行を確定して新しい行を開始
        lines.push(currentLine)
        currentLine = word

        maxLineWidth = Math.max(maxLineWidth, ctx.measureText(word).width)
      }
    }

    // 最後の行を追加
    if (currentLine) {
      lines.push(currentLine)
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width)
    }

    // 行数制限（シャボン玉のサイズに応じて）
    const maxLines = Math.min(
      3,
      Math.max(1, Math.floor(maxWidth / (fontSize * 1.2)))
    )

    if (lines.length > maxLines) {
      // 行数制限を超える場合は省略
      const truncatedLines = lines.slice(0, maxLines - 1)
      const lastLine = lines[maxLines - 1]

      // 最後の行に省略記号を追加
      let truncatedLastLine = lastLine

      while (
        ctx.measureText(truncatedLastLine + '…').width > allowedMaxWidth &&
        truncatedLastLine.length > 1
      ) {
        truncatedLastLine = truncatedLastLine.slice(0, -1)
      }

      truncatedLines.push(truncatedLastLine + '…')

      return {
        lines: truncatedLines,
        isMultiLine: truncatedLines.length > 1,
        totalHeight: truncatedLines.length * fontSize * 1.2,
        maxLineWidth: Math.max(
          ...truncatedLines.map(line => ctx.measureText(line).width)
        ),
        isOverflowing: maxLineWidth > maxWidth,
      }
    }

    return {
      lines,
      isMultiLine: lines.length > 1,
      totalHeight: lines.length * fontSize * 1.2,
      maxLineWidth,
      isOverflowing: maxLineWidth > maxWidth,
    }
  }

  /**
   * 複数行対応のテキストメトリクス計算
   */
  static calculateMultiLineTextMetrics(
    ctx: CanvasRenderingContext2D,
    text: string,
    bubbleSize: number,
    backgroundColor: string,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag',
    config: Partial<ImprovedTextRenderingConfig> = {}
  ): ImprovedTextMetrics & {
    lines: string[]
    isMultiLine: boolean
    totalHeight: number
    lineHeight: number
  } {
    const finalConfig = { ...this.IMPROVED_DEFAULT_CONFIG, ...config }

    // 改善されたフォントサイズを計算
    const fontSize = this.calculateImprovedFontSize(
      text,
      bubbleSize,
      finalConfig
    )

    // 基本の最大テキスト幅を計算
    const baseMaxTextWidth = bubbleSize * 0.85

    // 改行を考慮したテキスト処理
    const lineBreakResult = this.processTextWithLineBreaks(
      ctx,
      text,
      baseMaxTextWidth,
      fontSize,
      finalConfig
    )

    // 色を計算（親クラスのメソッドを使用）
    const { fillColor, strokeColor } = this.calculateOptimalTextColor(
      backgroundColor,
      bubbleType
    )

    // 縁取り幅を計算
    const strokeWidth = this.calculateStrokeWidth(fontSize, bubbleType)

    // 表示テキストを結合（単行表示用）
    const displayText = lineBreakResult.lines.join(' ')

    return {
      fontSize,
      displayText,
      textWidth: lineBreakResult.maxLineWidth,
      strokeWidth,
      fillColor,
      strokeColor,
      isOverflowing: lineBreakResult.isOverflowing,
      actualTextWidth: lineBreakResult.maxLineWidth,
      overflowAmount: Math.max(
        0,
        lineBreakResult.maxLineWidth - baseMaxTextWidth
      ),
      characterCount: displayText.length,
      lines: lineBreakResult.lines,
      isMultiLine: lineBreakResult.isMultiLine,
      totalHeight: lineBreakResult.totalHeight,
      lineHeight: fontSize * 1.2,
    }
  }

  /**
   * 複数行対応のテキスト描画
   */
  static renderMultiLineText(
    ctx: CanvasRenderingContext2D,
    metrics: ImprovedTextMetrics & {
      lines: string[]
      isMultiLine: boolean
      totalHeight: number
      lineHeight: number
    },
    x: number,
    y: number,
    bubbleType: 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'
  ): void {
    // フォントを設定
    const fontWeight = bubbleType === 'tag' ? 'bold' : 'normal'
    ctx.font = `${fontWeight} ${metrics.fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 複数行の場合の開始Y座標を調整
    const startY = metrics.isMultiLine
      ? y - metrics.totalHeight / 2 + metrics.lineHeight / 2
      : y

    // 縁取りを描画（より薄く自然に）
    const adjustedStrokeWidth = Math.max(0.5, metrics.strokeWidth * 0.6)

    metrics.lines.forEach((line, index) => {
      const lineY = startY + index * metrics.lineHeight

      // 薄い縁取りで視認性を確保
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = adjustedStrokeWidth
      ctx.strokeText(line, x, lineY)

      // タグの場合も縁取りを控えめに
      if (bubbleType === 'tag') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = adjustedStrokeWidth * 0.8
        ctx.strokeText(line, x, lineY)
      }

      // テキスト本体を描画
      ctx.fillStyle = metrics.fillColor
      ctx.fillText(line, x, lineY)
    })
  }
}
