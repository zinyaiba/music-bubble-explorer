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
  // 環境変数が設定されている場合は環境変数を優先
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
  }
  
  // 環境変数がない場合は本番用設定を使用
  return prodFirebaseConfig
}