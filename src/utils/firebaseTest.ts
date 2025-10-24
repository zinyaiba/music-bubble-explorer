/**
 * Firebase接続テストユーティリティ
 */

import { FirebaseService } from '@/services/firebaseService'
import { db } from '@/config/firebase'
import { logger } from '../config/logConfig'

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
  // 直接設定を使用
  const config = {
    apiKey: "AIzaSyDkJCEmdaqTmaBYVH3xLtg0HaKwRzSuefA",
    authDomain: "music-bubble-explorer.firebaseapp.com",
    projectId: "music-bubble-explorer",
    storageBucket: "music-bubble-explorer.firebasestorage.app",
    messagingSenderId: "1000893317937",
    appId: "1:1000893317937:web:82904e4282466acee0a610"
  }

  const result: FirebaseTestResult = {
    isConfigured: false,
    isConnected: false,
    details: {
      hasApiKey: !!config.apiKey,
      hasProjectId: !!config.projectId,
      hasAuthDomain: !!config.authDomain,
      canQueryFirestore: false
    }
  }

  try {
    // 設定チェック
    result.isConfigured = result.details.hasApiKey && 
                         result.details.hasProjectId && 
                         result.details.hasAuthDomain
    
    logger.debug('Firebase設定チェック結果', result.details)

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
  // 直接Firebase設定を確認
  const actualConfig = {
    apiKey: "AIzaSyDkJCEmdaqTmaBYVH3xLtg0HaKwRzSuefA",
    authDomain: "music-bubble-explorer.firebaseapp.com",
    projectId: "music-bubble-explorer",
    storageBucket: "music-bubble-explorer.firebasestorage.app",
    messagingSenderId: "1000893317937",
    appId: "1:1000893317937:web:82904e4282466acee0a610"
  }

  logger.debug('Firebase設定確認', actualConfig)

  return {
    apiKey: actualConfig.apiKey ? '設定済み' : '未設定',
    authDomain: actualConfig.authDomain || '未設定',
    projectId: actualConfig.projectId || '未設定',
    storageBucket: actualConfig.storageBucket || '未設定',
    messagingSenderId: actualConfig.messagingSenderId || '未設定',
    appId: actualConfig.appId ? '設定済み' : '未設定'
  }
}