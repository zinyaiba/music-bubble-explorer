/**
 * Safari専用ヘッダー位置調整
 * シンプルにヘッダを100px下げるだけ
 */

// Safari検出
function isSafari(): boolean {
  const ua = navigator.userAgent
  return (
    ua.includes('Safari') &&
    !ua.includes('Chrome') &&
    !ua.includes('Edge') &&
    !ua.includes('Edg')
  )
}

// ヘッダを100px下げる
export function fixSafariHeader(): void {
  if (!isSafari()) return

  const style = document.createElement('style')
  style.textContent = `
    header {
      top: 100px !important;
    }
  `
  document.head.appendChild(style)
}

// 初期化
export function initSafariHeaderFix(): void {
  if (typeof window === 'undefined') return
  fixSafariHeader()
}
