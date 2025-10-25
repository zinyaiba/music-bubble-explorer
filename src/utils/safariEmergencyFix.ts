/**
 * Safari緊急対策 - ヘッダー強制表示
 * 他の方法が効かない場合の最終手段
 */

// Safari検出 - より厳密に
function isSafariOrIOS(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()

  // Chrome、Edge、Firefoxを除外
  if (
    userAgent.includes('chrome') ||
    userAgent.includes('edg/') ||
    userAgent.includes('edge/') ||
    userAgent.includes('firefox') ||
    userAgent.includes('opera')
  ) {
    return false
  }

  // Safari または iOS デバイスかチェック
  return (
    userAgent.includes('safari') ||
    /iphone|ipad|ipod/.test(userAgent) ||
    (userAgent.includes('webkit') && userAgent.includes('version/'))
  )
}

// 緊急ヘッダー強制表示
export function emergencyHeaderFix(): void {
  if (!isSafariOrIOS()) return

  console.log('🚨 Safari Emergency Header Fix - Starting')

  // 1. 全ての可能なヘッダー要素を検索
  const findAllHeaders = () => {
    const selectors = [
      'header',
      '[role="banner"]',
      '*[class*="Header"]',
      '*[class*="header"]',
      'div[class*="sc-"]', // styled-components
      'section[class*="sc-"]',
      '*[class*="MobileFirst"]',
    ]

    const elements: HTMLElement[] = []

    selectors.forEach(selector => {
      try {
        const found = document.querySelectorAll(selector)
        found.forEach(el => {
          const element = el as HTMLElement
          const rect = element.getBoundingClientRect()

          // ヘッダーらしい要素の条件
          if (
            rect.top <= 150 && // 上部にある
            rect.width > window.innerWidth * 0.5 && // 幅が十分
            rect.height > 20 &&
            rect.height < 300 // 高さが適度
          ) {
            elements.push(element)
          }
        })
      } catch (e) {
        console.warn('Selector failed:', selector, e)
      }
    })

    return elements
  }

  // 2. 強制スタイル適用
  const applyEmergencyStyles = (element: HTMLElement) => {
    const styles = {
      display: 'flex !important',
      position: 'fixed !important',
      top: '0 !important',
      left: '0 !important',
      right: '0 !important',
      width: '100vw !important',
      'z-index': '2147483647 !important',
      visibility: 'visible !important',
      opacity: '1 !important',
      background: 'rgba(255, 255, 255, 0.95) !important',
      'backdrop-filter': 'blur(15px) !important',
      '-webkit-backdrop-filter': 'blur(15px) !important',
      'min-height': '85px !important',
      transform: 'translate3d(0, 0, 0) !important',
      '-webkit-transform': 'translate3d(0, 0, 0) !important',
      'backface-visibility': 'hidden !important',
      '-webkit-backface-visibility': 'hidden !important',
      contain: 'none !important',
      isolation: 'auto !important',
    }

    Object.entries(styles).forEach(([property, value]) => {
      try {
        element.style.setProperty(
          property,
          value.replace(' !important', ''),
          'important'
        )
      } catch (e) {
        console.warn('Style application failed:', property, e)
      }
    })
  }

  // 3. 実行
  const executeEmergencyFix = () => {
    const headers = findAllHeaders()
    console.log('🚨 Found headers for emergency fix:', headers.length)

    headers.forEach((header, index) => {
      console.log(
        `🚨 Fixing header ${index + 1}:`,
        header.tagName,
        header.className
      )
      applyEmergencyStyles(header)
    })

    // 4. CSS注入による追加対策
    if (headers.length === 0) {
      console.log('🚨 No headers found, injecting emergency CSS')
      injectEmergencyCSS()
    }
  }

  // 5. 緊急CSS注入
  const injectEmergencyCSS = () => {
    const existingStyle = document.getElementById('safari-emergency-css')
    if (existingStyle) existingStyle.remove()

    const style = document.createElement('style')
    style.id = 'safari-emergency-css'
    style.textContent = `
      @media (max-width: 900px) {
        /* Safari緊急対策 - 全ての可能なヘッダー */
        header,
        [role="banner"],
        *[class*="Header"],
        *[class*="header"],
        div[class*="sc-"]:first-child,
        body > div:first-child > div:first-child > div:first-child,
        body > div:first-child > div:first-child > header,
        body > div:first-child > div:first-child > div:first-child > header {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100vw !important;
          z-index: 2147483647 !important;
          visibility: visible !important;
          opacity: 1 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(15px) !important;
          -webkit-backdrop-filter: blur(15px) !important;
          min-height: 85px !important;
          transform: translate3d(0, 0, 0) !important;
          -webkit-transform: translate3d(0, 0, 0) !important;
        }
      }
    `
    document.head.appendChild(style)
    console.log('🚨 Emergency CSS injected')
  }

  // 6. 複数回実行
  executeEmergencyFix()
  setTimeout(executeEmergencyFix, 100)
  setTimeout(executeEmergencyFix, 500)
  setTimeout(executeEmergencyFix, 1000)
  setTimeout(executeEmergencyFix, 2000)

  // 7. 定期チェック
  const interval = setInterval(() => {
    const headers = findAllHeaders()
    let needsFix = false

    headers.forEach(header => {
      const style = window.getComputedStyle(header)
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0' ||
        style.position !== 'fixed'
      ) {
        needsFix = true
      }
    })

    if (needsFix) {
      console.log(
        '🚨 Header visibility issue detected, re-applying emergency fix'
      )
      executeEmergencyFix()
    }
  }, 3000)

  // 8. クリーンアップ
  setTimeout(() => {
    clearInterval(interval)
    console.log('🚨 Safari Emergency Fix - Monitoring stopped after 30 seconds')
  }, 30000)

  console.log('🚨 Safari Emergency Header Fix - Completed')
}

// 初期化
export function initSafariEmergencyFix(): void {
  if (typeof window === 'undefined') return

  // DOMContentLoaded後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', emergencyHeaderFix)
  } else {
    emergencyHeaderFix()
  }

  // ページ表示時にも実行
  window.addEventListener('pageshow', emergencyHeaderFix)

  // リサイズ時にも実行
  window.addEventListener('resize', () => {
    setTimeout(emergencyHeaderFix, 100)
  })
}
