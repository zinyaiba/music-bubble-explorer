/**
 * Safari ヘッダー修正 - 最もシンプルで確実な方法
 */

// Safari検出（最もシンプル）
function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

// iOS検出
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// ヘッダー強制表示（最もシンプル）
export function fixSafariHeader(): void {
  if (!isSafari() && !isIOS()) {
    console.log('🌐 Not Safari/iOS, skipping header fix')
    return
  }

  console.log('🍎 Safari/iOS detected, applying header fix')

  // 1. 直接的なCSS注入
  const injectHeaderCSS = () => {
    const existingStyle = document.getElementById('safari-header-fix')
    if (existingStyle) existingStyle.remove()

    const style = document.createElement('style')
    style.id = 'safari-header-fix'
    style.textContent = `
      /* Safari専用ヘッダー修正 */
      @media (max-width: 900px) {
        header,
        [role="banner"] {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          z-index: 999999 !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(15px) !important;
          -webkit-backdrop-filter: blur(15px) !important;
          min-height: 85px !important;
          padding-top: env(safe-area-inset-top, 0px) !important;
          min-height: calc(85px + env(safe-area-inset-top, 0px)) !important;
        }
      }
    `
    document.head.appendChild(style)
    console.log('🍎 Safari header CSS injected')
  }

  // 2. 直接的なDOM操作
  const forceHeaderDisplay = () => {
    const headers = document.querySelectorAll('header, [role="banner"]')
    console.log('🍎 Found headers:', headers.length)

    headers.forEach((header, index) => {
      const element = header as HTMLElement
      console.log(
        `🍎 Fixing header ${index + 1}:`,
        element.tagName,
        element.className
      )

      if (window.innerWidth <= 900) {
        // 強制スタイル適用
        element.style.display = 'flex'
        element.style.position = 'fixed'
        element.style.top = '0'
        element.style.left = '0'
        element.style.right = '0'
        element.style.width = '100%'
        element.style.zIndex = '999999'
        element.style.visibility = 'visible'
        element.style.opacity = '1'
        element.style.background = 'rgba(255, 255, 255, 0.95)'
        element.style.backdropFilter = 'blur(15px)'
        element.style.minHeight = '85px'

        // セーフエリア対応
        element.style.paddingTop = 'env(safe-area-inset-top, 0px)'

        console.log('🍎 Header styles applied to:', element.tagName)
      }
    })
  }

  // 3. 実行
  const execute = () => {
    injectHeaderCSS()
    forceHeaderDisplay()
  }

  // 4. 複数回実行
  execute()
  setTimeout(execute, 100)
  setTimeout(execute, 500)
  setTimeout(execute, 1000)

  // 5. DOMContentLoaded後にも実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', execute)
  }

  // 6. ページ表示時にも実行
  window.addEventListener('pageshow', execute)

  // 7. リサイズ時にも実行
  window.addEventListener('resize', () => {
    setTimeout(execute, 100)
  })

  console.log('🍎 Safari header fix completed')
}

// 初期化
export function initSafariHeaderFix(): void {
  if (typeof window === 'undefined') return

  // 即座に実行
  fixSafariHeader()

  // 定期的なチェック（Safari専用）
  if (isSafari() || isIOS()) {
    const interval = setInterval(() => {
      const headers = document.querySelectorAll('header, [role="banner"]')
      let needsFix = false

      headers.forEach(header => {
        const element = header as HTMLElement
        const style = window.getComputedStyle(element)

        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0' ||
          (style.position !== 'fixed' && window.innerWidth <= 900)
        ) {
          needsFix = true
        }
      })

      if (needsFix) {
        console.log('🍎 Header visibility issue detected, re-applying fix')
        fixSafariHeader()
      }
    }, 2000)

    // 10秒後に監視停止
    setTimeout(() => {
      clearInterval(interval)
      console.log('🍎 Safari header monitoring stopped')
    }, 10000)
  }
}
