/**
 * Firebase接続テストユーティリティ
 */

import { FirebaseService } from '@/services/firebaseService'
import { db } from '@/config/firebase'

export interface FirebaseTestResult {
  isConfigured: boolean
  isConnected: boolean
  error?: string
  details: {
    hasApiKey: boolean
    hasProjectId: boolean
    hasAuthDomain: boolean
    canQueryFirestore: boolean
  }
}

/**
 * Firebase接続をテストする
 */
export async function testFirebaseConnection(): Promise<FirebaseTestResult> {
  const result: FirebaseTestResult = {
    isConfigured: false,
    isConnected: false,
    details: {
      hasApiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
      hasProjectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
      hasAuthDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      canQueryFirestore: false
    }
  }

  try {
    // 設定チェック
    result.isConfigured = result.details.hasApiKey && 
                         result.details.hasProjectId && 
                         result.details.hasAuthDomain

    if (!result.isConfigured) {
      result.error = '環境変数が設定されていません'
      return result
    }

    // データベース接続チェック
    if (!db) {
      result.error = 'Firestoreの初期化に失敗しました'
      return result
    }

    // 実際の接続テスト
    const firebaseService = FirebaseService.getInstance()
    const canConnect = await firebaseService.checkConnection()
    
    result.details.canQueryFirestore = canConnect
    result.isConnected = canConnect

    if (!canConnect) {
      result.error = 'Firestoreへの接続に失敗しました'
    }

  } catch (error) {
    result.error = `接続テストエラー: ${error instanceof Error ? error.message : String(error)}`
  }

  return result
}

/**
 * Firebase設定情報を表示用に取得
 */
export function getFirebaseConfigInfo() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '設定済み' : '未設定',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '未設定',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '未設定',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '未設定',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '未設定',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ? '設定済み' : '未設定'
  }
}