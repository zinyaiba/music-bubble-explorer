/**
 * ブラウザ検出ユーティリティ
 * iOSのChromeブラウザを検出するための関数を提供
 */

/**
 * iOSのChromeブラウザかどうかを判定
 * UAに「CriOS」が含まれている場合にtrueを返す
 * @returns iOSのChromeブラウザの場合true
 */
export const isIOSChrome = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }
  const userAgent = navigator.userAgent
  return userAgent.includes('CriOS')
}

/**
 * iOSのSafariブラウザかどうかを判定
 * @returns iOSのSafariブラウザの場合true
 */
export const isIOSSafari = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isSafari = userAgent.includes('safari') && !userAgent.includes('crios')
  return isIOS && isSafari
}
