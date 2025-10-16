/**
 * Firebase統合フック
 */

import { useState, useEffect, useCallback } from 'react'
import { FirebaseService } from '@/services/firebaseService'
import { AuthService } from '@/services/authService'
import { SharedDataService, DataSharingMethod } from '@/services/sharedDataService'
import { Song } from '@/types/music'

export interface FirebaseState {
  isConnected: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  stats: {
    totalSongs: number
    totalTags: number
    recentSongsCount: number
  }
}

export const useFirebase = () => {
  const [state, setState] = useState<FirebaseState>({
    isConnected: false,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    stats: {
      totalSongs: 0,
      totalTags: 0,
      recentSongsCount: 0
    }
  })

  const firebaseService = FirebaseService.getInstance()
  const authService = AuthService.getInstance()
  const sharedDataService = SharedDataService.getInstance()

  /**
   * Firebase接続状態をチェック
   */
  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await firebaseService.checkConnection()
      setState(prev => ({ ...prev, isConnected, error: null }))
      return isConnected
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: errorMessage 
      }))
      return false
    }
  }, [firebaseService])

  /**
   * 統計情報を更新
   */
  const updateStats = useCallback(async () => {
    try {
      const stats = await firebaseService.getStats()
      setState(prev => ({
        ...prev,
        stats: {
          totalSongs: stats.totalSongs,
          totalTags: stats.totalTags.size,
          recentSongsCount: stats.recentSongsCount
        }
      }))
    } catch (error) {
      console.error('統計更新エラー:', error)
    }
  }, [firebaseService])

  /**
   * Firebase初期化
   */
  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // 接続チェック
      const isConnected = await checkConnection()
      
      if (isConnected) {
        // 匿名認証を試行
        const user = await authService.ensureAuthenticated()
        const isAuthenticated = user !== null

        // 統計情報を取得
        await updateStats()

        // 共有データサービスをFirebaseに設定
        sharedDataService.configure({
          method: DataSharingMethod.FIREBASE
        })

        setState(prev => ({
          ...prev,
          isAuthenticated,
          isLoading: false,
          error: null
        }))

        console.log('🔥 Firebase初期化完了')
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Firebase接続に失敗しました'
        }))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      console.error('🔥 Firebase初期化エラー:', error)
    }
  }, [checkConnection, updateStats, authService, sharedDataService])

  /**
   * 楽曲を追加
   */
  const addSong = useCallback(async (song: Song): Promise<boolean> => {
    try {
      if (!state.isAuthenticated) {
        console.warn('未認証のため、ローカルのみに保存します')
      }

      const success = await sharedDataService.addSongToShared(song)
      
      if (success) {
        // 統計情報を更新
        await updateStats()
      }

      return success
    } catch (error) {
      console.error('楽曲追加エラー:', error)
      return false
    }
  }, [state.isAuthenticated, sharedDataService, updateStats])

  /**
   * リアルタイム監視を開始
   */
  const subscribeToSongs = useCallback((callback: (songs: Song[]) => void) => {
    if (!state.isConnected) {
      console.warn('Firebase未接続のため、リアルタイム監視を開始できません')
      return () => {}
    }

    return firebaseService.subscribeToSongs((songs) => {
      callback(songs)
      // 統計情報も更新
      updateStats()
    })
  }, [state.isConnected, firebaseService, updateStats])

  /**
   * 手動で状態を更新
   */
  const refresh = useCallback(async () => {
    await initialize()
  }, [initialize])

  // 初期化
  useEffect(() => {
    initialize()

    // 認証状態の監視
    const unsubscribe = authService.onAuthStateChange((user) => {
      setState(prev => ({
        ...prev,
        isAuthenticated: user !== null
      }))
    })

    return unsubscribe
  }, [initialize, authService])

  return {
    ...state,
    initialize,
    checkConnection,
    updateStats,
    addSong,
    subscribeToSongs,
    refresh
  }
}