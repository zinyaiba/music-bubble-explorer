/**
 * タグ共有サービス
 * X（旧Twitter）への共有テキスト生成とクリップボード操作を担当
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3, 5.1, 5.2, 5.3, 6.1
 */

export interface ShareTextOptions {
  tagName: string
  baseUrl?: string
}

export interface ShareResult {
  success: boolean
  message: string
  shareText?: string
}

/**
 * タグ共有サービス（シングルトン）
 */
export class TagShareService {
  private static instance: TagShareService | null = null

  // XではURLは長さに関係なく23文字としてカウントされる
  private static readonly URL_CHAR_COUNT = 23

  private constructor() {
    // シングルトンパターン
  }

  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): TagShareService {
    if (!TagShareService.instance) {
      TagShareService.instance = new TagShareService()
    }
    return TagShareService.instance
  }

  /**
   * 共有用テキストを生成する
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  generateShareText(options: ShareTextOptions): string {
    const { tagName, baseUrl } = options
    const deepLink = this.generateDeepLink(tagName, baseUrl)

    // 新しいテンプレート形式
    const shareText = `私のおすすめタグはこちら！
#️⃣${tagName}

マロバブでみな実さんの楽曲を探索してみてね🫧
#栗林みな実 #マロバブ

${deepLink}`

    return shareText
  }

  /**
   * ディープリンクURLを生成する
   * Requirements: 5.1, 5.2, 5.3
   */
  generateDeepLink(tagName: string, baseUrl?: string): string {
    const url = baseUrl || this.getCurrentBaseUrl()
    const encodedTagName = this.encodeTagName(tagName)
    return `${url}?tag=${encodedTagName}`
  }

  /**
   * 現在のベースURLを取得
   * Requirements: 5.2
   */
  private getCurrentBaseUrl(): string {
    if (typeof window !== 'undefined') {
      // 現在のURLからクエリパラメータとハッシュを除去
      const { protocol, host, pathname } = window.location
      return `${protocol}//${host}${pathname}`
    }
    // フォールバック（SSR環境など）
    return 'https://example.com/'
  }

  /**
   * タグ名をURLエンコードする
   * Requirements: 2.5, 5.3
   */
  encodeTagName(tagName: string): string {
    return encodeURIComponent(tagName)
  }

  /**
   * URLエンコードされたタグ名をデコードする
   * Requirements: 4.4, 5.3
   */
  decodeTagName(encodedTagName: string): string {
    try {
      return decodeURIComponent(encodedTagName)
    } catch {
      // 不正なエンコーディングの場合はそのまま返す
      return encodedTagName
    }
  }

  /**
   * X用の文字数をカウントする
   * URLは長さに関係なく23文字としてカウントされる
   */
  countTweetLength(text: string): number {
    // URLパターンを検出
    const urlPattern = /https?:\/\/[^\s]+/g
    const urls = text.match(urlPattern) || []

    // URL部分を除いた文字数
    let textWithoutUrls = text
    for (const url of urls) {
      textWithoutUrls = textWithoutUrls.replace(url, '')
    }

    // URL以外の文字数 + URL数 × 23
    return textWithoutUrls.length + urls.length * TagShareService.URL_CHAR_COUNT
  }

  /**
   * テキストをクリップボードにコピーする
   * Requirements: 3.1, 3.3
   */
  async copyToClipboard(text: string): Promise<ShareResult> {
    // Clipboard APIが利用可能かチェック
    if (!navigator.clipboard) {
      return {
        success: false,
        message:
          'クリップボードAPIが利用できません。テキストを手動でコピーしてください。',
        shareText: text,
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      return {
        success: true,
        message: 'コピーしました！Xに貼り付けてね',
      }
    } catch (error) {
      console.error('Clipboard copy failed:', error)
      return {
        success: false,
        message: 'コピーに失敗しました。テキストを手動でコピーしてください。',
        shareText: text,
      }
    }
  }

  /**
   * Web Share APIを使用して共有する（モバイル向け）
   * Requirements: 6.1
   */
  async shareNative(text: string, url: string): Promise<ShareResult> {
    if (!this.isNativeShareAvailable()) {
      return {
        success: false,
        message: 'ネイティブ共有機能が利用できません。',
        shareText: text,
      }
    }

    try {
      await navigator.share({
        text,
        url,
      })
      return {
        success: true,
        message: '共有しました！',
      }
    } catch (error) {
      // ユーザーがキャンセルした場合
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          message: '共有がキャンセルされました。',
        }
      }
      console.error('Native share failed:', error)
      return {
        success: false,
        message: '共有に失敗しました。',
        shareText: text,
      }
    }
  }

  /**
   * Web Share APIが利用可能かチェックする
   */
  isNativeShareAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator
  }

  /**
   * 触覚フィードバックを実行（利用可能な場合）
   * Requirements: 6.3
   */
  triggerHapticFeedback(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      // 短い振動（50ms）
      navigator.vibrate(50)
    }
  }
}

// デフォルトエクスポート
export const tagShareService = TagShareService.getInstance()
