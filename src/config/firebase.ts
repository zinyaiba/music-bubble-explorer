/**
 * Firebase設定
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Firebase設定（環境変数から取得）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Firebase設定が有効かチェック
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.authDomain && 
                             firebaseConfig.projectId

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null

if (isFirebaseConfigured) {
  try {
    // Firebase初期化
    app = initializeApp(firebaseConfig)
    
    // Firestore初期化
    db = getFirestore(app)
    
    // Auth初期化
    auth = getAuth(app)
    
    console.log('🔥 Firebase初期化完了')
  } catch (error) {
    console.warn('🔥 Firebase初期化エラー:', error)
  }
} else {
  console.log('🔥 Firebase設定が見つかりません - ローカルモードで動作')
}

export { db, auth }
export default app