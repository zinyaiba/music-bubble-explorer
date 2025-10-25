/**
 * Safari対応：ビューポート高さの動的調整
 * Safariのアドレスバー表示/非表示によるビューポート変化に対応
 */

let viewportHeight = window.innerHeight

function updateViewportHeight() {
  // 現在のビューポート高さを取得
  const currentHeight = window.innerHeight

  // 高さが変わった場合のみ更新
  if (Math.abs(currentHeight - viewportHeight) > 50) {
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

// 初期化
export function initSafariViewportFix(): void {
  if (!isSafari() && !isIOSSafari()) {
    return // Safari以外では何もしない
  }

  // 初期設定
  updateViewportHeight()

  // リサイズイベントリスナー
  let resizeTimer: number
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(updateViewportHeight, 100)
  })

  // オリエンテーション変更対応
  window.addEventListener('orientationchange', () => {
    setTimeout(updateViewportHeight, 500)
  })

  // スクロールイベント（Safariのアドレスバー対応）
  let scrollTimer: number
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(updateViewportHeight, 100)
    },
    { passive: true }
  )

  // ページ表示時の調整
  window.addEventListener('pageshow', updateViewportHeight)

  // フォーカス変更時の調整（キーボード表示対応）
  window.addEventListener('focusin', () => {
    setTimeout(updateViewportHeight, 300)
  })

  window.addEventListener('focusout', () => {
    setTimeout(updateViewportHeight, 300)
  })
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
