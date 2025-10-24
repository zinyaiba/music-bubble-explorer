/**
 * Firebase認証サービス
 * 匿名認証とユーザー管理
 */

import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { auth } from '@/config/firebase'

export interface AuthUser {
  uid: string
  isAnonymous: boolean
  displayName?: string
  email?: string
}

/**
 * Firebase認証サービスクラス
 */
export class AuthService {
  private static instance: AuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: ((user: AuthUser | null) => void)[] = []

  private constructor() {
    this.initializeAuth()
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * 認証状態の初期化
   */
  private initializeAuth(): void {
    if (!auth) {
      // Firebase設定が無効な場合は静かに終了
      return
    }
    
    try {
      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            displayName: user.displayName || undefined,
            email: user.email || undefined
          }
          if (import.meta.env.DEV) {
            console.log('🔐 認証状態: ログイン済み', this.currentUser.uid)
          }
        } else {
          this.currentUser = null
          if (import.meta.env.DEV) {
            console.log('🔐 認証状態: 未ログイン')
          }
        }

        // リスナーに通知
        this.authStateListeners.forEach(listener => {
          listener(this.currentUser)
        })
      })
    } catch (error) {
      // 認証状態監視のエラーを警告レベルに変更
      if (import.meta.env.DEV) {
        console.warn('🔐 認証状態監視エラー:', error)
      }
    }
  }

  /**
   * 匿名ログイン
   */
  public async signInAnonymously(): Promise<AuthUser | null> {
    try {
      if (!auth) {
        // Firebase設定が無効な場合は静かに失敗
        return null
      }
      
      // タイムアウト付きで匿名ログインを試行
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      })
      
      const authPromise = signInAnonymously(auth)
      
      const result = await Promise.race([authPromise, timeoutPromise])
      const user = result.user
      
      this.currentUser = {
        uid: user.uid,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName || undefined,
        email: user.email || undefined
      }

      if (import.meta.env.DEV) {
        console.log('🔐 匿名ログイン成功:', this.currentUser.uid)
      }
      return this.currentUser
    } catch (error) {
      // エラーを警告レベルに変更（コンソールを汚さない）
      if (import.meta.env.DEV) {
        // console.warn('🔐 匿名ログインエラー（ローカルモードで継続）:', error)
      }
      return null
    }
  }

  /**
   * ログアウト
   */
  public async signOut(): Promise<boolean> {
    try {
      if (!auth) {
        console.log('🔐 Auth: Firebase設定が無効です')
        return true
      }
      
      await firebaseSignOut(auth)
      this.currentUser = null
      console.log('🔐 ログアウト成功')
      return true
    } catch (error) {
      console.error('🔐 ログアウトエラー:', error)
      return false
    }
  }

  /**
   * 現在のユーザーを取得
   */
  public getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  /**
   * ログイン状態を確認
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * 認証状態の変更を監視
   */
  public onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // 現在の状態を即座に通知
    callback(this.currentUser)

    // アンサブスクライブ関数を返す
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * 自動ログインを試行
   */
  public async ensureAuthenticated(): Promise<AuthUser | null> {
    if (!auth) {
      // Firebase設定が無効な場合はnullを返す
      return null
    }
    
    if (this.currentUser) {
      return this.currentUser
    }

    // 匿名ログインを試行
    return this.signInAnonymously()
  }

  /**
   * ユーザーIDを取得（認証されていない場合は匿名IDを生成）
   */
  public getUserId(): string {
    if (this.currentUser) {
      return this.currentUser.uid
    }

    // 匿名IDを生成（ローカルストレージに保存）
    let anonymousId = localStorage.getItem('anonymous_user_id')
    if (!anonymousId) {
      anonymousId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('anonymous_user_id', anonymousId)
    }

    return anonymousId
  }
}