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
