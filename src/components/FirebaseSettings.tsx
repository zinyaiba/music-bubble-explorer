/**
 * Firebase設定コンポーネント
 */

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FirebaseService } from '@/services/firebaseService'
import { AuthService } from '@/services/authService'

const Container = styled.div`
  padding: 20px
  background: rgba(255, 255, 255, 0.1)
  border-radius: 12px
  backdrop-filter: blur(10px)
  margin: 20px 0
`

const Title = styled.h3`
  color: #fff
  margin-bottom: 15px
  font-size: 1.2rem
`

const StatusCard = styled.div<{ status: 'connected' | 'disconnected' | 'loading' }>`
  padding: 15px
  border-radius: 8px
  margin: 10px 0
  background: ${props => {
    switch (props.status) {
      case 'connected': return 'rgba(76, 175, 80, 0.2)'
      case 'disconnected': return 'rgba(244, 67, 54, 0.2)'
      case 'loading': return 'rgba(255, 193, 7, 0.2)'
    }
  }}
  border: 1px solid ${props => {
    switch (props.status) {
      case 'connected': return '#4CAF50'
      case 'disconnected': return '#F44336'
      case 'loading': return '#FFC107'
    }
  }}
`

const StatusText = styled.div`
  color: #fff
  font-weight: 500
  margin-bottom: 5px
`

const StatusDetail = styled.div`
  color: rgba(255, 255, 255, 0.8)
  font-size: 0.9rem
`

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  color: white
  border: none
  padding: 10px 20px
  border-radius: 8px
  cursor: pointer
  font-weight: 500
  margin: 5px
  transition: all 0.3s ease

  &:hover {
    transform: translateY(-2px)
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4)
  }

  &:disabled {
    opacity: 0.6
    cursor: not-allowed
    transform: none
  }
`

const StatsGrid = styled.div`
  display: grid
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))
  gap: 15px
  margin: 15px 0
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1)
  padding: 15px
  border-radius: 8px
  text-align: center
`

const StatValue = styled.div`
  font-size: 1.5rem
  font-weight: bold
  color: #fff
  margin-bottom: 5px
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8)
  font-size: 0.9rem
`

interface FirebaseSettingsProps {
  onConnectionChange?: (isConnected: boolean) => void
}

export const FirebaseSettings: React.FC<FirebaseSettingsProps> = ({ 
  onConnectionChange 
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'disconnected'>('loading')
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalTags: 0,
    recentSongsCount: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  const firebaseService = FirebaseService.getInstance()
  const authService = AuthService.getInstance()

  useEffect(() => {
    checkConnection()
    checkAuthStatus()
    loadStats()

    // 認証状態の監視
    const unsubscribe = authService.onAuthStateChange((user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated')
    })

    return unsubscribe
  }, [])

  const checkConnection = async () => {
    setConnectionStatus('loading')
    const isConnected = await firebaseService.checkConnection()
    setConnectionStatus(isConnected ? 'connected' : 'disconnected')
    onConnectionChange?.(isConnected)
  }

  const checkAuthStatus = () => {
    const isAuth = authService.isAuthenticated()
    setAuthStatus(isAuth ? 'authenticated' : 'unauthenticated')
  }

  const loadStats = async () => {
    try {
      const statsData = await firebaseService.getStats()
      setStats({
        totalSongs: statsData.totalSongs,
        totalTags: statsData.totalTags.size,
        recentSongsCount: statsData.recentSongsCount
      })
    } catch (error) {
      console.error('統計取得エラー:', error)
    }
  }

  const handleSignInAnonymously = async () => {
    setIsLoading(true)
    try {
      const user = await authService.signInAnonymously()
      if (user) {
        console.log('匿名ログイン成功')
        await checkConnection()
        await loadStats()
      }
    } catch (error) {
      console.error('匿名ログインエラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await authService.signOut()
      console.log('ログアウト成功')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await checkConnection()
      await loadStats()
    } catch (error) {
      console.error('更新エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Title>🔥 Firebase Firestore設定</Title>
      
      {/* 接続状態 */}
      <StatusCard status={connectionStatus}>
        <StatusText>
          {connectionStatus === 'loading' && '🔄 接続確認中...'}
          {connectionStatus === 'connected' && '✅ Firestoreに接続済み'}
          {connectionStatus === 'disconnected' && '❌ Firestoreに接続できません'}
        </StatusText>
        <StatusDetail>
          {connectionStatus === 'connected' && 'リアルタイムでデータが同期されます'}
          {connectionStatus === 'disconnected' && '環境変数の設定を確認してください'}
        </StatusDetail>
      </StatusCard>

      {/* 認証状態 */}
      <StatusCard status={authStatus === 'authenticated' ? 'connected' : 'disconnected'}>
        <StatusText>
          {authStatus === 'loading' && '🔄 認証確認中...'}
          {authStatus === 'authenticated' && '🔐 認証済み'}
          {authStatus === 'unauthenticated' && '🔓 未認証'}
        </StatusText>
        <StatusDetail>
          {authStatus === 'authenticated' && 'データの保存・取得が可能です'}
          {authStatus === 'unauthenticated' && '匿名ログインでデータを共有できます'}
        </StatusDetail>
      </StatusCard>

      {/* 統計情報 */}
      {connectionStatus === 'connected' && (
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalSongs}</StatValue>
            <StatLabel>総楽曲数</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalTags}</StatValue>
            <StatLabel>タグ数</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.recentSongsCount}</StatValue>
            <StatLabel>今週の新曲</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      {/* 操作ボタン */}
      <div>
        {authStatus === 'unauthenticated' && (
          <Button 
            onClick={handleSignInAnonymously} 
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : '匿名ログイン'}
          </Button>
        )}
        
        {authStatus === 'authenticated' && (
          <Button 
            onClick={handleSignOut} 
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : 'ログアウト'}
          </Button>
        )}
        
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
        >
          {isLoading ? '更新中...' : '状態を更新'}
        </Button>
      </div>

      {/* 設定ガイド */}
      {connectionStatus === 'disconnected' && (
        <StatusCard status="disconnected">
          <StatusText>📋 Firebase設定手順</StatusText>
          <StatusDetail>
            1. Firebase Console でプロジェクトを作成<br/>
            2. Firestore Database を有効化<br/>
            3. .env.local に設定値を追加<br/>
            4. ページを再読み込み
          </StatusDetail>
        </StatusCard>
      )}
    </Container>
  )
}