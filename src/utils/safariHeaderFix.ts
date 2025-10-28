/**
 * Safari専用ヘッダー位置調整
 * シンプルにヘッダを100px下げるだけ
 */

// Safari検出（最も厳密）
function isSafari(): boolean {
  const ua = navigator.userAgent
  // 真のSafariのみを検出（Chrome開発者ツールのSafariモードも除外）
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

// ヘッダを100px下げる
export function fixSafariHeader(): void {
  if (!isSafari()) return

  const style = document.createElement('style')
  style.id = 'safari-header-offset'
  style.textContent = `
    /* Safari専用：ヘッダーを100px下げて、z-indexを0に固定 */
    header,
    [role="banner"] {
      top: 100px !important;
      position: fixed !important;
      z-index: 0 !important;
    }
    
    /* CSS変数を使用している要素も強制的に0に */
    header[style*="--glass-z-fixed"],
    [role="banner"][style*="--glass-z-fixed"],
    .sc-JuYTaK,
    .sc-gZEZvl {
      z-index: 0 !important;
    }
  `
  document.head.appendChild(style)

  console.log('🍎 Safari header offset applied')
}

// 初期化
export function initSafariHeaderFix(): void {
  if (typeof window === 'undefined') return
  fixSafariHeader()
}
