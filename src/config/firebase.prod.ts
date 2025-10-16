/**
 * 本番環境用Firebase設定
 * GitHub Pagesなど環境変数が使えない場合に使用
 */

// 本番環境用Firebase設定
export const prodFirebaseConfig = {
  apiKey: "AIzaSyDkJCEmdaqTmaBYVH3xLtg0HaKwRzSuefA",
  authDomain: "music-bubble-explorer.firebaseapp.com",
  projectId: "music-bubble-explorer",
  storageBucket: "music-bubble-explorer.firebasestorage.app",
  messagingSenderId: "1000893317937",
  appId: "1:1000893317937:web:82904e4282466acee0a610"
}

// 本番環境かどうかを判定
export const isProduction = import.meta.env.PROD

// 環境に応じた設定を取得
export const getFirebaseConfig = () => {
  console.log('🔥 Firebase設定取得開始')
  console.log('🔥 環境情報:', {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
    hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY
  })

  // 環境変数が設定されている場合は環境変数を優先
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    console.log('🔥 環境変数からFirebase設定を取得')
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
    console.log('🔥 環境変数設定:', { ...config, apiKey: config.apiKey ? '設定済み' : '未設定' })
    return config
  }
  
  // 環境変数がない場合は本番用設定を使用（GitHub Pagesなど）
  console.log('🔥 本番用設定からFirebase設定を取得（環境変数なし）')
  console.log('🔥 本番用設定:', { ...prodFirebaseConfig, apiKey: '設定済み' })
  
  // 本番環境で環境変数がない場合は強制的に本番用設定を使用
  if (import.meta.env.PROD && !import.meta.env.VITE_FIREBASE_API_KEY) {
    console.log('🔥 本番環境で環境変数なし - 本番用設定を強制使用')
    return prodFirebaseConfig
  }
  
  return prodFirebaseConfig
}