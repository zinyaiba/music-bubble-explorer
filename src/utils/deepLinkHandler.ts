/**
 * ディープリンクハンドラー
 * URLパラメータからタグ情報を解析し、適切な画面遷移を行う
 *
 * Requirements: 4.1, 4.3, 4.4
 */

export interface DeepLinkResult {
  hasTagParam: boolean
  tagName: string | null
  isValid: boolean
  errorMessage?: string
}

/**
 * URLからタグパラメータを解析する
 * Requirements: 4.1, 4.4
 *
 * @param url - 解析対象のURL（省略時は現在のURL）
 * @returns DeepLinkResult - 解析結果
 */
export function parseTagFromUrl(url?: string): DeepLinkResult {
  try {
    // URLを取得（引数がない場合は現在のURLを使用）
    const targetUrl =
      url || (typeof window !== 'undefined' ? window.location.href : '')

    if (!targetUrl) {
      return {
        hasTagParam: false,
        tagName: null,
        isValid: true,
      }
    }

    // URLオブジェクトを作成
    const urlObj = new URL(targetUrl, 'https://example.com')

    // クエリパラメータからtagを取得
    const encodedTagName = urlObj.searchParams.get('tag')

    // ハッシュフラグメントからもチェック（#tag=xxx 形式）
    let hashTagName: string | null = null
    if (urlObj.hash) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1))
      hashTagName = hashParams.get('tag')
    }

    // タグパラメータが見つからない場合
    const rawTagName = encodedTagName || hashTagName
    if (!rawTagName) {
      return {
        hasTagParam: false,
        tagName: null,
        isValid: true,
      }
    }

    // URLデコード（Requirements: 4.4）
    const decodedTagName = decodeTagName(rawTagName)

    // 空文字チェック
    if (!decodedTagName || decodedTagName.trim() === '') {
      return {
        hasTagParam: true,
        tagName: null,
        isValid: false,
        errorMessage: 'タグ名が空です',
      }
    }

    return {
      hasTagParam: true,
      tagName: decodedTagName,
      isValid: true,
    }
  } catch (error) {
    console.error('Failed to parse tag from URL:', error)
    return {
      hasTagParam: false,
      tagName: null,
      isValid: false,
      errorMessage: 'URLの解析に失敗しました',
    }
  }
}

/**
 * URLエンコードされたタグ名をデコードする
 * Requirements: 4.4
 *
 * @param encodedTagName - エンコードされたタグ名
 * @returns デコードされたタグ名
 */
function decodeTagName(encodedTagName: string): string {
  try {
    return decodeURIComponent(encodedTagName)
  } catch {
    // 不正なエンコーディングの場合はそのまま返す
    return encodedTagName
  }
}

/**
 * タグが存在するかチェックする
 * Requirements: 4.3
 *
 * @param tagName - チェック対象のタグ名
 * @param availableTags - 利用可能なタグ名の配列
 * @returns タグが存在する場合はtrue
 */
export function validateTagExists(
  tagName: string,
  availableTags: string[]
): boolean {
  if (!tagName || !availableTags || availableTags.length === 0) {
    return false
  }

  // 大文字小文字を区別せずにチェック（日本語タグも考慮）
  const normalizedTagName = tagName.toLowerCase().trim()
  return availableTags.some(
    tag => tag.toLowerCase().trim() === normalizedTagName
  )
}

/**
 * ディープリンクの初期化処理
 * アプリ起動時にURLパラメータをチェックし、タグが見つかった場合はコールバックを呼び出す
 * Requirements: 4.2, 4.5
 *
 * @param onTagFound - タグが見つかった場合のコールバック
 * @param onError - エラー発生時のコールバック
 * @param availableTags - 利用可能なタグ名の配列
 */
export function initializeDeepLink(
  onTagFound: (tagName: string) => void,
  onError: (message: string) => void,
  availableTags: string[]
): void {
  // URLからタグパラメータを解析
  const result = parseTagFromUrl()

  // タグパラメータがない場合は何もしない
  if (!result.hasTagParam) {
    return
  }

  // 解析エラーの場合
  if (!result.isValid) {
    onError(result.errorMessage || 'URLパラメータが無効です')
    return
  }

  // タグ名がnullの場合（通常は発生しないが念のため）
  if (!result.tagName) {
    onError('タグ名が取得できませんでした')
    return
  }

  // タグが存在するかチェック（Requirements: 4.3）
  if (!validateTagExists(result.tagName, availableTags)) {
    onError('タグが見つかりませんでした')
    return
  }

  // タグが見つかった場合はコールバックを呼び出す（Requirements: 4.2, 4.5）
  onTagFound(result.tagName)
}

/**
 * URLからタグパラメータを削除する
 * ディープリンク処理後にURLをクリーンアップするために使用
 *
 * @returns クリーンアップされたURL
 */
export function clearTagFromUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  const url = new URL(window.location.href)
  url.searchParams.delete('tag')

  // ハッシュからもtagを削除
  if (url.hash) {
    const hashParams = new URLSearchParams(url.hash.substring(1))
    hashParams.delete('tag')
    const newHash = hashParams.toString()
    url.hash = newHash ? `#${newHash}` : ''
  }

  // ブラウザの履歴を更新（リロードなし）
  const cleanUrl = url.toString()
  window.history.replaceState({}, '', cleanUrl)

  return cleanUrl
}
