/**
 * Safari対応：ビューポート高さの動的調整
 * Safariのアドレスバー表示/非表示によるビューポート変化に対応
 */

let viewportHeight = window.innerHeight

function updateViewportHeight() {
  // 現在のビューポート高さを取得
  const currentHeight = window.innerHeight

  // 高さが変わった場合のみ更新（閾値を小さくしてより敏感に反応）
  if (Math.abs(currentHeight - viewportHeight) > 10) {
    viewportHeight = currentHeight

    // CSS変数として設定
    document.documentElement.style.setProperty(
      '--vh',
      `${viewportHeight * 0.01}px`
    )
    document.documentElement.style.setProperty(
      '--viewport-height',
      `${viewportHeight}px`
    )

    // Safari専用の追加変数
    document.documentElement.style.setProperty(
      '--safari-viewport-height',
      `${viewportHeight}px`
    )

    // デバッグ用ログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('🍎 Safari viewport updated:', {
        height: viewportHeight,
        vh: `${viewportHeight * 0.01}px`,
        userAgent: navigator.userAgent.includes('Safari'),
      })
    }
  }
}

// Safari検出
function isSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('safari') && !userAgent.includes('chrome')
}

// iOS Safari検出
function isIOSSafari(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent) && userAgent.includes('safari')
}

// Safari専用のヘッダー強制表示
function forceSafariHeaderDisplay(): void {
  // Safari専用のヘッダー要素を強制表示
  const headers = document.querySelectorAll(
    'header, [role="banner"], .mobile-first-header, *[class*="Header"]'
  )

  headers.forEach(header => {
    const element = header as HTMLElement
    if (element) {
      // Safari専用の強制スタイル適用
      element.style.setProperty('display', 'flex', 'important')
      element.style.setProperty('position', 'fixed', 'important')
      element.style.setProperty('top', '0', 'important')
      element.style.setProperty('left', '0', 'important')
      element.style.setProperty('right', '0', 'important')
      element.style.setProperty('width', '100%', 'important')
      element.style.setProperty('z-index', '999999', 'important')
      element.style.setProperty('visibility', 'visible', 'important')
      element.style.setProperty('opacity', '1', 'important')
      element.style.setProperty(
        'transform',
        'translate3d(0, 0, 0)',
        'important'
      )
      element.style.setProperty(
        '-webkit-transform',
        'translate3d(0, 0, 0)',
        'important'
      )
      element.style.setProperty('backface-visibility', 'hidden', 'important')
      element.style.setProperty(
        '-webkit-backface-visibility',
        'hidden',
        'important'
      )

      // Safari専用の背景とボーダー
      element.style.setProperty(
        'background',
        'rgba(255, 255, 255, 0.95)',
        'important'
      )
      element.style.setProperty('backdrop-filter', 'blur(15px)', 'important')
      element.style.setProperty(
        '-webkit-backdrop-filter',
        'blur(15px)',
        'important'
      )
      element.style.setProperty('min-height', '85px', 'important')

      // セーフエリア対応
      element.style.setProperty(
        'padding-top',
        'env(safe-area-inset-top, 0px)',
        'important'
      )
      element.style.setProperty(
        'min-height',
        'calc(85px + env(safe-area-inset-top, 0px))',
        'important'
      )
    }
  })

  console.log(
    '🍎 Safari header force display applied to',
    headers.length,
    'elements'
  )
}

// 初期化
export function initSafariViewportFix(): void {
  // 初期設定（Safari以外でも基本的な設定は行う）
  updateViewportHeight()

  // Safari/iOS Safari専用の追加対応
  if (isSafari() || isIOSSafari()) {
    console.log('🍎 Safari viewport fix initialized')

    // Safari専用のヘッダー強制表示を即座に実行
    forceSafariHeaderDisplay()

    // DOMContentLoaded後にも実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', forceSafariHeaderDisplay)
    } else {
      setTimeout(forceSafariHeaderDisplay, 100)
    }

    // より頻繁な更新でSafariのアドレスバー変化に対応
    let resizeTimer: number
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay() // リサイズ時にもヘッダー強制表示
      }, 50)
    })

    // オリエンテーション変更対応（複数回実行で確実に）
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 100)
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 300)
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 600)
    })

    // スクロールイベント（Safariのアドレスバー対応）
    let scrollTimer: number
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(scrollTimer)
        scrollTimer = window.setTimeout(() => {
          updateViewportHeight()
          // スクロール時は頻繁すぎるのでヘッダー強制表示は控えめに
          if (Math.random() < 0.1) {
            // 10%の確率で実行
            forceSafariHeaderDisplay()
          }
        }, 50)
      },
      { passive: true }
    )

    // ページ表示時の調整（複数回実行）
    window.addEventListener('pageshow', () => {
      updateViewportHeight()
      forceSafariHeaderDisplay()
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 100)
    })

    // フォーカス変更時の調整（キーボード表示対応）
    window.addEventListener('focusin', () => {
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 100)
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 300)
    })

    window.addEventListener('focusout', () => {
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 100)
      setTimeout(() => {
        updateViewportHeight()
        forceSafariHeaderDisplay()
      }, 300)
    })

    // ビジビリティ変更時の調整（タブ切り替え対応）
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          updateViewportHeight()
          forceSafariHeaderDisplay()
        }, 100)
      }
    })

    // タッチ開始時の調整（Safari特有の問題対応）
    window.addEventListener(
      'touchstart',
      () => {
        setTimeout(() => {
          updateViewportHeight()
          // タッチ時は軽めに
          if (Math.random() < 0.2) {
            // 20%の確率で実行
            forceSafariHeaderDisplay()
          }
        }, 50)
      },
      { passive: true }
    )

    // 定期的なヘッダーチェック（Safari専用）
    setInterval(() => {
      const headers = document.querySelectorAll(
        'header, [role="banner"], .mobile-first-header'
      )
      let needsForce = false

      headers.forEach(header => {
        const element = header as HTMLElement
        const computedStyle = window.getComputedStyle(element)
        if (
          computedStyle.display === 'none' ||
          computedStyle.visibility === 'hidden' ||
          computedStyle.opacity === '0'
        ) {
          needsForce = true
        }
      })

      if (needsForce) {
        console.log(
          '🍎 Safari header visibility issue detected, forcing display'
        )
        forceSafariHeaderDisplay()
      }
    }, 2000) // 2秒ごとにチェック
  }
}

// セーフエリア取得
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
    bottom: parseInt(
      style.getPropertyValue('env(safe-area-inset-bottom)') || '0'
    ),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    right: parseInt(
      style.getPropertyValue('env(safe-area-inset-right)') || '0'
    ),
  }
}

// ヘッダー高さ計算（セーフエリア込み）
export function getHeaderHeight(): number {
  const safeAreaTop = getSafeAreaInsets().top
  const baseHeaderHeight = window.innerWidth <= 900 ? 70 : 120
  return baseHeaderHeight + safeAreaTop
}

// フッター高さ計算（セーフエリア込み）
export function getFooterHeight(): number {
  const safeAreaBottom = getSafeAreaInsets().bottom
  const baseFooterHeight = window.innerWidth <= 900 ? 88 : 0
  return baseFooterHeight + safeAreaBottom
}

// 利用可能なメインエリア高さ計算
export function getMainAreaHeight(): number {
  const viewportHeight = window.innerHeight
  const headerHeight = getHeaderHeight()
  const footerHeight = getFooterHeight()

  return Math.max(200, viewportHeight - headerHeight - footerHeight)
}
