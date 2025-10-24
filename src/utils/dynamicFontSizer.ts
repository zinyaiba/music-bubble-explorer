/**
 * Dynamic Font Size Adjustment Utility
 * Requirements: 5.3, 5.4 - シャボン玉サイズに応じたフォントサイズ計算、異なる画面サイズでの最適化
 */

export interface ScreenSizeConfig {
  width: number
  height: number
  devicePixelRatio: number
  isMobile: boolean
  isTablet: boolean
  orientation: 'portrait' | 'landscape'
}

export interface DynamicFontConfig {
  baseSize: number
  minSize: number
  maxSize: number
  scaleFactor: number
  screenSizeMultiplier: number
  bubbleSizeMultiplier: number
  textLengthFactor: number
  readabilityPriority: number // 0-1, 1 = maximum readability
}

export interface FontSizeResult {
  fontSize: number
  scalingReason: string
  appliedFactors: {
    screenSize: number
    bubbleSize: number
    textLength: number
    readability: number
  }
  isOptimal: boolean
}

export class DynamicFontSizer {
  private static readonly DEFAULT_CONFIG: DynamicFontConfig = {
    baseSize: 16, // ベースサイズを大きく
    minSize: 10, // 最小サイズを上げる
    maxSize: 28, // 最大サイズを拡大
    scaleFactor: 1.2, // 全体的にスケールアップ
    screenSizeMultiplier: 1.0,
    bubbleSizeMultiplier: 1.0,
    textLengthFactor: 1.0,
    readabilityPriority: 0.9, // 読みやすさを最優先
  }

  /**
   * 画面サイズ情報を取得
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static getScreenSizeConfig(): ScreenSizeConfig {
    const width = window.innerWidth
    const height = window.innerHeight
    const devicePixelRatio = window.devicePixelRatio || 1

    // デバイスタイプの判定
    const isMobile = width <= 768
    const isTablet = width > 768 && width <= 1024
    const orientation = width > height ? 'landscape' : 'portrait'

    return {
      width,
      height,
      devicePixelRatio,
      isMobile,
      isTablet,
      orientation,
    }
  }

  /**
   * 画面サイズに基づくスケーリング係数を計算
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static calculateScreenSizeMultiplier(screenConfig: ScreenSizeConfig): number {
    const { width, height, isMobile, isTablet, orientation, devicePixelRatio } =
      screenConfig

    let multiplier = 1.0

    // デバイスタイプによる調整
    if (isMobile) {
      // モバイルデバイス
      if (orientation === 'portrait') {
        // 縦向きモバイル: 少し大きめのフォント
        multiplier = 1.1
      } else {
        // 横向きモバイル: 標準サイズ
        multiplier = 1.0
      }
    } else if (isTablet) {
      // タブレット: やや大きめ
      multiplier = 1.05
    } else {
      // デスクトップ: 画面サイズに応じて調整
      if (width >= 1920) {
        // 大画面: 大きめのフォント
        multiplier = 1.2
      } else if (width >= 1440) {
        // 中画面: やや大きめ
        multiplier = 1.1
      } else {
        // 小画面: 標準
        multiplier = 1.0
      }
    }

    // 高DPIディスプレイの調整
    if (devicePixelRatio >= 2) {
      multiplier *= 1.05
    }

    // 画面の縦横比による調整
    const aspectRatio = width / height
    if (aspectRatio > 2.0) {
      // 超ワイド画面: 少し大きめ
      multiplier *= 1.1
    } else if (aspectRatio < 0.6) {
      // 超縦長画面: 少し小さめ
      multiplier *= 0.95
    }

    return Math.max(0.8, Math.min(1.5, multiplier))
  }

  /**
   * バブルサイズに基づくスケーリング係数を計算
   * Requirements: 5.3 - シャボン玉サイズに応じたフォントサイズ計算
   */
  static calculateBubbleSizeMultiplier(
    bubbleSize: number,
    screenConfig: ScreenSizeConfig
  ): number {
    const { width, height, isMobile } = screenConfig

    // 画面サイズに対するバブルサイズの相対的な大きさを計算
    const screenDiagonal = Math.sqrt(width * width + height * height)
    const relativeBubbleSize = bubbleSize / screenDiagonal

    let multiplier: number

    if (isMobile) {
      // モバイルでは相対的に大きなフォントを使用
      if (relativeBubbleSize > 0.15) {
        multiplier = 1.3 // 大きなバブル
      } else if (relativeBubbleSize > 0.1) {
        multiplier = 1.2 // 中サイズバブル
      } else if (relativeBubbleSize > 0.05) {
        multiplier = 1.1 // 小サイズバブル
      } else {
        multiplier = 1.0 // 極小バブル
      }
    } else {
      // デスクトップでは標準的なスケーリング
      if (relativeBubbleSize > 0.12) {
        multiplier = 1.2
      } else if (relativeBubbleSize > 0.08) {
        multiplier = 1.1
      } else if (relativeBubbleSize > 0.04) {
        multiplier = 1.0
      } else {
        multiplier = 0.9
      }
    }

    // バブルサイズの絶対値による調整
    if (bubbleSize < 30) {
      multiplier *= 0.9 // 非常に小さなバブル
    } else if (bubbleSize > 150) {
      multiplier *= 1.1 // 非常に大きなバブル
    }

    return Math.max(0.7, Math.min(1.5, multiplier))
  }

  /**
   * テキスト長に基づくスケーリング係数を計算
   * Requirements: 5.3 - 読みやすさを優先した表示調整
   */
  static calculateTextLengthFactor(
    text: string,
    readabilityPriority: number
  ): number {
    const textLength = text.length
    let factor: number

    if (readabilityPriority > 0.7) {
      // 読みやすさ優先モード: フォントサイズの縮小を大幅に抑制
      if (textLength <= 8) {
        factor = 1.15 // 短いテキストはより大きく
      } else if (textLength <= 15) {
        factor = 1.1 // 中程度のテキストも大きめに
      } else if (textLength <= 20) {
        factor = 1.05 // 長めのテキストも大きめを維持
      } else if (textLength <= 30) {
        factor = 1.0 // 長いテキストでも標準サイズを維持
      } else {
        factor = 0.95 // 非常に長いテキストでも大幅な縮小は避ける
      }
    } else {
      // 標準モード: より積極的にフォントサイズを調整
      if (textLength <= 5) {
        factor = 1.2
      } else if (textLength <= 10) {
        factor = 1.0
      } else if (textLength <= 15) {
        factor = 0.9
      } else if (textLength <= 20) {
        factor = 0.8
      } else if (textLength <= 25) {
        factor = 0.7
      } else {
        factor = 0.6
      }
    }

    return Math.max(0.6, Math.min(1.3, factor))
  }

  /**
   * 動的フォントサイズを計算
   * Requirements: 5.3, 5.4 - 統合された動的フォントサイズ調整
   */
  static calculateDynamicFontSize(
    text: string,
    bubbleSize: number,
    config: Partial<DynamicFontConfig> = {}
  ): FontSizeResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config }
    const screenConfig = this.getScreenSizeConfig()

    // 各種スケーリング係数を計算
    const screenSizeMultiplier =
      this.calculateScreenSizeMultiplier(screenConfig)
    const bubbleSizeMultiplier = this.calculateBubbleSizeMultiplier(
      bubbleSize,
      screenConfig
    )
    const textLengthFactor = this.calculateTextLengthFactor(
      text,
      finalConfig.readabilityPriority
    )

    // 読みやすさ係数（読みやすさ優先度に基づく）
    const readabilityFactor = 1 + (finalConfig.readabilityPriority - 0.5) * 0.2

    // 基本フォントサイズから開始
    let fontSize = finalConfig.baseSize

    // 各係数を適用
    fontSize *= finalConfig.scaleFactor
    fontSize *= screenSizeMultiplier * finalConfig.screenSizeMultiplier
    fontSize *= bubbleSizeMultiplier * finalConfig.bubbleSizeMultiplier
    fontSize *= textLengthFactor * finalConfig.textLengthFactor
    fontSize *= readabilityFactor

    // 最小・最大値の制限を適用
    const constrainedFontSize = Math.max(
      finalConfig.minSize,
      Math.min(finalConfig.maxSize, fontSize)
    )

    // 最適性の判定
    const isOptimal = constrainedFontSize === fontSize

    // スケーリング理由の決定
    let scalingReason = 'optimal'
    if (constrainedFontSize === finalConfig.minSize) {
      scalingReason = 'minimum_size_limit'
    } else if (constrainedFontSize === finalConfig.maxSize) {
      scalingReason = 'maximum_size_limit'
    } else if (screenConfig.isMobile) {
      scalingReason = 'mobile_optimized'
    } else if (text.length > 20) {
      scalingReason = 'long_text_adjusted'
    } else if (bubbleSize < 50) {
      scalingReason = 'small_bubble_adjusted'
    }

    return {
      fontSize: Math.round(constrainedFontSize * 10) / 10, // 小数点1桁で丸める
      scalingReason,
      appliedFactors: {
        screenSize: screenSizeMultiplier,
        bubbleSize: bubbleSizeMultiplier,
        textLength: textLengthFactor,
        readability: readabilityFactor,
      },
      isOptimal,
    }
  }

  /**
   * 複数のテキストに対して一貫したフォントサイズを計算
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static calculateConsistentFontSizes(
    texts: Array<{ text: string; bubbleSize: number }>,
    config: Partial<DynamicFontConfig> = {}
  ): Array<FontSizeResult> {
    const results = texts.map(({ text, bubbleSize }) =>
      this.calculateDynamicFontSize(text, bubbleSize, config)
    )

    // 一貫性のためのフォントサイズ調整
    const avgFontSize =
      results.reduce((sum, result) => sum + result.fontSize, 0) / results.length
    const maxVariation = Math.max(
      ...results.map(r => Math.abs(r.fontSize - avgFontSize))
    )

    // 変動が大きすぎる場合は調整
    if (maxVariation > avgFontSize * 0.3) {
      const adjustmentFactor = 0.8
      return results.map(result => ({
        ...result,
        fontSize:
          Math.round(
            (result.fontSize * adjustmentFactor +
              avgFontSize * (1 - adjustmentFactor)) *
              10
          ) / 10,
        scalingReason: result.scalingReason + '_consistency_adjusted',
      }))
    }

    return results
  }

  /**
   * リアルタイムでフォントサイズを更新
   * Requirements: 5.4 - 異なる画面サイズでの最適化
   */
  static createDynamicFontSizeUpdater(
    callback: (fontSize: number) => void,
    text: string,
    bubbleSize: number,
    config: Partial<DynamicFontConfig> = {}
  ): () => void {
    let lastScreenConfig = this.getScreenSizeConfig()

    const updateFontSize = () => {
      const currentScreenConfig = this.getScreenSizeConfig()

      // 画面設定が変更された場合のみ更新
      if (
        currentScreenConfig.width !== lastScreenConfig.width ||
        currentScreenConfig.height !== lastScreenConfig.height ||
        currentScreenConfig.orientation !== lastScreenConfig.orientation
      ) {
        const result = this.calculateDynamicFontSize(text, bubbleSize, config)
        callback(result.fontSize)
        lastScreenConfig = currentScreenConfig
      }
    }

    // 初回実行
    updateFontSize()

    // リサイズイベントリスナーを追加
    window.addEventListener('resize', updateFontSize)
    window.addEventListener('orientationchange', updateFontSize)

    // クリーンアップ関数を返す
    return () => {
      window.removeEventListener('resize', updateFontSize)
      window.removeEventListener('orientationchange', updateFontSize)
    }
  }
}
