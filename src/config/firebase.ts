/**
 * Firebase設定
 */

import { initializeApp, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Firebase設定（環境変数または本番用設定から取得）
import { getFirebaseConfig } from './firebase.prod'

// GitHub Pages用の直接設定
const githubPagesConfig = {
  apiKey: "AIzaSyDkJCEmdaqTmaBYVH3xLtg0HaKwRzSuefA",
  authDomain: "music-bubble-explorer.firebaseapp.com",
  projectId: "music-bubble-explorer",
  storageBucket: "music-bubble-explorer.firebasestorage.app",
  messagingSenderId: "1000893317937",
  appId: "1:1000893317937:web:82904e4282466acee0a610"
}

// 設定の取得
let firebaseConfig
try {
  firebaseConfig = getFirebaseConfig()
  
  // 設定が空の場合はGitHub Pages用設定を使用
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.log('🔥 Firebase: 設定が空のため、GitHub Pages用設定を使用')
    firebaseConfig = githubPagesConfig
  }
} catch (error) {
  console.warn('🔥 Firebase: 設定取得エラー、GitHub Pages用設定を使用:', error)
  firebaseConfig = githubPagesConfig
}

console.log('🔥 Firebase設定確認:', firebaseConfig)

// Firebase設定が有効かチェック
const isFirebaseConfigured = firebaseConfig.apiKey && 
                             firebaseConfig.authDomain && 
                             firebaseConfig.projectId

// ログ出力を制限（エラーを防ぐため）
if (import.meta.env.DEV) {
  console.log('🔥 Firebase設定状況:', {
    isConfigured: isFirebaseConfigured,
    apiKey: firebaseConfig.apiKey ? '設定済み' : '未設定',
    authDomain: firebaseConfig.authDomain ? '設定済み' : '未設定',
    projectId: firebaseConfig.projectId ? '設定済み' : '未設定'
  })
}

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
    
    if (import.meta.env.DEV) {
      console.log('🔥 Firebase初期化完了')
    }
  } catch (error) {
    // エラーを警告レベルに変更（コンソールを汚さない）
    if (import.meta.env.DEV) {
      console.warn('🔥 Firebase初期化エラー（ローカルモードで継続）:', error)
    }
    // エラーが発生してもnullのままにして、後続の処理でローカルモードになるようにする
    app = null
    db = null
    auth = null
  }
} else {
  if (import.meta.env.DEV) {
    console.log('🔥 Firebase設定が見つかりません - ローカルモードで動作')
  }
}

export { db, auth }
export default app