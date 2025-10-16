/**
 * Firebase設定
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Firebase設定（環境変数または本番用設定から取得）
import { getFirebaseConfig } from './firebase.prod'

const firebaseConfig = getFirebaseConfig()

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
    console.log('🔥 Firebase設定:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      environment: import.meta.env.MODE,
      hasEnvVars: !!import.meta.env.VITE_FIREBASE_API_KEY
    })
  } catch (error) {
    console.warn('🔥 Firebase初期化エラー:', error)
  }
} else {
  console.log('🔥 Firebase設定が見つかりません - ローカルモードで動作')
  console.log('🔥 設定状況:', {
    apiKey: firebaseConfig.apiKey ? '設定済み' : '未設定',
    authDomain: firebaseConfig.authDomain ? '設定済み' : '未設定',
    projectId: firebaseConfig.projectId ? '設定済み' : '未設定',
    environment: import.meta.env.MODE
  })
}

export { db, auth }
export default app