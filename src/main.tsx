import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeLogging } from './config/logConfig'
import { initializeFontSystem } from './utils/fontLoader'
import { initializeGlassmorphismSystem } from './utils/glassmorphismIntegration'

// ログシステムの初期化
initializeLogging()

// フォントシステムの初期化
initializeFontSystem()

// ガラスモーフィズムシステムの初期化
initializeGlassmorphismSystem()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)