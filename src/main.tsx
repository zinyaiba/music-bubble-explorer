import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeLogging } from './config/logConfig'
import { initializeFontSystem } from './utils/fontLoader'
import { initializeGlassmorphismSystem } from './utils/glassmorphismIntegration'
import { setStoredVersion, CURRENT_VERSION } from './utils/versionManager'

// ログシステムの初期化
initializeLogging()

// フォントシステムの初期化
initializeFontSystem()

// ガラスモーフィズムシステムの初期化
initializeGlassmorphismSystem()

// バージョン管理の初期化
setStoredVersion(CURRENT_VERSION)

// プルトゥリフレッシュを無効化（モバイルブラウザ対策）
let lastTouchY = 0
document.addEventListener(
  'touchstart',
  e => {
    lastTouchY = e.touches[0].clientY
  },
  { passive: true }
)

document.addEventListener(
  'touchmove',
  e => {
    const touchY = e.touches[0].clientY
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop

    // ページ最上部で下にスワイプした場合のみブロック
    if (scrollTop <= 0 && touchY > lastTouchY) {
      e.preventDefault()
    }
  },
  { passive: false }
)

// Service Workerの登録
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swPath = import.meta.env.BASE_URL + 'sw.js'
    navigator.serviceWorker
      .register(swPath)
      .then(registration => {
        console.log('Service Worker registered:', registration)

        // 更新をチェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('New service worker available')
              }
            })
          }
        })
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
