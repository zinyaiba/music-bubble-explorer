/**
 * Safari専用レイアウト調整
 * ヘッダーを100px下げ、シャボン玉領域との重複を防ぐ
 */

// Safari検出
function isSafari(): boolean {
  const ua = navigator.userAgent

  // return true
  return (
    ua.includes('Safari') &&
    ua.includes('Version') &&
    !ua.includes('Chrome') &&
    !ua.includes('Chromium') &&
    !ua.includes('Edge') &&
    !ua.includes('Edg') &&
    !ua.includes('OPR') &&
    !ua.includes('Opera') &&
    !ua.includes('CriOS') &&
    !ua.includes('FxiOS')
  )
}

// Safari専用レイアウト調整
export function fixSafariHeader(): void {
  if (!isSafari()) return

  const style = document.createElement('style')
  style.id = 'safari-header-offset'
  style.textContent = `
    /* Safari専用：ヘッダーを100px下げる */
    header,
    [role="banner"] {
      top: 100px !important;
    }
    
    /* Safari専用：シャボン玉領域に上部マージンを追加 */
    .bubble-container,
    .bubble-area-maximized,
    .mobile-first-bubble-area {
      margin-top: 100px !important;
      padding-top: 20px !important;
    }
    
    /* Safari専用：レイアウト調整 */
    .scrollable-main-section {
      padding-top: 100px !important;
    }
    
    .content-wrapper {
      margin-top: 100px !important;
    }
  `
  document.head.appendChild(style)
}

// 初期化
export function initSafariHeaderFix(): void {
  if (typeof window === 'undefined') return
  fixSafariHeader()
}
