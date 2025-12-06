/**
 * 楽曲フォームのバリデーションユーティリティ
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * URL形式のバリデーション
 */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true } // 空の場合は有効（オプショナルフィールド）
  }

  const urlPattern = /^https?:\/\/.+/
  if (!urlPattern.test(url)) {
    return {
      isValid: false,
      error:
        '有効なURL形式で入力してください（http:// または https:// で始まる必要があります）',
    }
  }

  return { isValid: true }
}

/**
 * URL文字数制限のバリデーション
 */
export function validateUrlLength(
  url: string,
  maxLength: number = 500
): ValidationResult {
  if (!url || url.trim() === '') {
    return { isValid: true }
  }

  if (url.length > maxLength) {
    return {
      isValid: false,
      error: `URLは${maxLength}文字以内で入力してください（現在: ${url.length}文字）`,
    }
  }

  return { isValid: true }
}

/**
 * テキスト文字数制限のバリデーション
 */
export function validateTextLength(
  text: string,
  maxLength: number = 200
): ValidationResult {
  if (!text || text.trim() === '') {
    return { isValid: true }
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `${maxLength}文字以内で入力してください（現在: ${text.length}文字）`,
    }
  }

  return { isValid: true }
}

/**
 * 発売年のバリデーション
 */
export function validateReleaseYear(yearStr: string): ValidationResult {
  if (!yearStr || yearStr.trim() === '') {
    return { isValid: true } // 空の場合は有効（オプショナルフィールド）
  }

  const year = parseInt(yearStr, 10)

  if (isNaN(year)) {
    return {
      isValid: false,
      error: '数値を入力してください',
    }
  }

  if (year < 1000 || year > 9999) {
    return {
      isValid: false,
      error: '1000から9999の範囲で入力してください',
    }
  }

  return { isValid: true }
}

/**
 * 発売日（月日）のバリデーション
 * MMDD形式（ハイフンなし）で入力を受け付ける
 */
export function validateReleaseDate(dateStr: string): ValidationResult {
  if (!dateStr || dateStr.trim() === '') {
    return { isValid: true } // 空の場合は有効（オプショナルフィールド）
  }

  // MMDD形式のチェック（4桁の数字）
  const datePattern = /^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/
  if (!datePattern.test(dateStr)) {
    return {
      isValid: false,
      error: 'MMDD形式で入力してください（例: 0315は3月15日）',
    }
  }

  // 月と日を取得
  const month = parseInt(dateStr.substring(0, 2), 10)
  const day = parseInt(dateStr.substring(2, 4), 10)

  // 月の妥当性チェック
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: '月は01から12の範囲で入力してください',
    }
  }

  // 日の妥当性チェック（簡易版：各月の最大日数）
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (day < 1 || day > daysInMonth[month - 1]) {
    return {
      isValid: false,
      error: `${month}月は01から${daysInMonth[month - 1]}の範囲で入力してください`,
    }
  }

  return { isValid: true }
}

/**
 * アーティスト名のバリデーション（カンマ区切り対応）
 */
export function validateArtists(artistsStr: string): ValidationResult {
  if (!artistsStr || artistsStr.trim() === '') {
    return { isValid: true }
  }

  if (artistsStr.length > 200) {
    return {
      isValid: false,
      error:
        '200文字以内で入力してください（現在: ' + artistsStr.length + '文字）',
    }
  }

  return { isValid: true }
}

/**
 * 楽曲詳細ページURLリストのバリデーション
 * DetailPageUrl型（{url, label}）または文字列配列に対応
 */
export function validateDetailPageUrls(
  urls: Array<{ url: string; label?: string } | string>
): ValidationResult {
  if (!urls || urls.length === 0) {
    return { isValid: true }
  }

  if (urls.length > 10) {
    return {
      isValid: false,
      error: 'URLは最大10個まで登録できます',
    }
  }

  for (let i = 0; i < urls.length; i++) {
    const urlItem = urls[i]
    const url = typeof urlItem === 'string' ? urlItem : urlItem.url

    if (url && url.trim() !== '') {
      const urlValidation = validateUrl(url)
      if (!urlValidation.isValid) {
        return {
          isValid: false,
          error: `URL ${i + 1}: ${urlValidation.error}`,
        }
      }

      const lengthValidation = validateUrlLength(url)
      if (!lengthValidation.isValid) {
        return {
          isValid: false,
          error: `URL ${i + 1}: ${lengthValidation.error}`,
        }
      }
    }

    // ラベルの長さチェック（オプション）
    if (
      typeof urlItem !== 'string' &&
      urlItem.label &&
      urlItem.label.length > 100
    ) {
      return {
        isValid: false,
        error: `URL ${i + 1}: ラベルは100文字以内で入力してください`,
      }
    }
  }

  return { isValid: true }
}

/**
 * カンマ区切り文字列を配列に変換
 */
export function parseCommaSeparated(input: string): string[] {
  if (!input || input.trim() === '') {
    return []
  }

  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

/**
 * 配列をカンマ区切り文字列に変換
 */
export function formatCommaSeparated(items: string[]): string {
  if (!items || items.length === 0) {
    return ''
  }

  return items.join(', ')
}
