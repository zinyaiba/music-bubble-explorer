/**
 * Firebase接続テストコンポーネント
 */

import React, { useState, useEffect } from 'react'
import { testFirebaseConnection, getFirebaseConfigInfo, FirebaseTestResult } from '@/utils/firebaseTest'
import { FirebaseService } from '@/services/firebaseService'

export const FirebaseConnectionTest: React.FC = () => {
  const [testResult, setTestResult] = useState<FirebaseTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [configInfo] = useState(getFirebaseConfigInfo())
  const [dbStats, setDbStats] = useState<{
    totalSongs: number
    totalTags: Set<string>
    recentSongsCount: number
  } | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    try {
      const result = await testFirebaseConnection()
      setTestResult(result)
      
      // 接続成功時はデータベース統計も取得
      if (result.isConnected) {
        await loadDatabaseStats()
      }
    } catch (error) {
      setTestResult({
        isConfigured: false,
        isConnected: false,
        error: `テスト実行エラー: ${error instanceof Error ? error.message : String(error)}`,
        details: {
          hasApiKey: false,
          hasProjectId: false,
          hasAuthDomain: false,
          canQueryFirestore: false
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDatabaseStats = async () => {
    setIsLoadingStats(true)
    try {
      const firebaseService = FirebaseService.getInstance()
      const stats = await firebaseService.getStats()
      setDbStats(stats)
    } catch (error) {
      console.error('Failed to load database stats:', error)
      setDbStats(null)
    } finally {
      setIsLoadingStats(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌'
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Firebase接続テスト</h2>
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '🔄 テスト中...' : '🔄 再テスト'}
        </button>
      </div>

      {/* 設定情報 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">設定情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>API Key: <span className={configInfo.apiKey === '設定済み' ? 'text-green-600' : 'text-red-600'}>{configInfo.apiKey}</span></div>
          <div>Auth Domain: <span className={configInfo.authDomain !== '未設定' ? 'text-green-600' : 'text-red-600'}>{configInfo.authDomain}</span></div>
          <div>Project ID: <span className={configInfo.projectId !== '未設定' ? 'text-green-600' : 'text-red-600'}>{configInfo.projectId}</span></div>
          <div>Storage Bucket: <span className={configInfo.storageBucket !== '未設定' ? 'text-green-600' : 'text-red-600'}>{configInfo.storageBucket}</span></div>
          <div>Messaging Sender ID: <span className={configInfo.messagingSenderId !== '未設定' ? 'text-green-600' : 'text-red-600'}>{configInfo.messagingSenderId}</span></div>
          <div>App ID: <span className={configInfo.appId === '設定済み' ? 'text-green-600' : 'text-red-600'}>{configInfo.appId}</span></div>
        </div>
      </div>

      {/* テスト結果 */}
      {testResult && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">接続テスト結果</h3>
          
          {/* 全体ステータス */}
          <div className="p-4 rounded-lg border-2" style={{
            borderColor: testResult.isConnected ? '#10b981' : '#ef4444',
            backgroundColor: testResult.isConnected ? '#f0fdf4' : '#fef2f2'
          }}>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{testResult.isConnected ? '🟢' : '🔴'}</span>
              <span className={`font-bold ${testResult.isConnected ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.isConnected ? 'Firebase接続成功' : 'Firebase接続失敗'}
              </span>
            </div>
            {testResult.error && (
              <div className="mt-2 text-sm text-red-700">
                エラー: {testResult.error}
              </div>
            )}
          </div>

          {/* 詳細チェック */}
          <div className="space-y-2">
            <h4 className="font-semibold">詳細チェック</h4>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center space-x-2 ${getStatusColor(testResult.details.hasApiKey)}`}>
                <span>{getStatusIcon(testResult.details.hasApiKey)}</span>
                <span>API Key設定</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(testResult.details.hasProjectId)}`}>
                <span>{getStatusIcon(testResult.details.hasProjectId)}</span>
                <span>Project ID設定</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(testResult.details.hasAuthDomain)}`}>
                <span>{getStatusIcon(testResult.details.hasAuthDomain)}</span>
                <span>Auth Domain設定</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(testResult.isConfigured)}`}>
                <span>{getStatusIcon(testResult.isConfigured)}</span>
                <span>Firebase設定完了</span>
              </div>
              <div className={`flex items-center space-x-2 ${getStatusColor(testResult.details.canQueryFirestore)}`}>
                <span>{getStatusIcon(testResult.details.canQueryFirestore)}</span>
                <span>Firestore接続</span>
              </div>
            </div>
          </div>

          {/* データベース統計 */}
          {testResult.isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">データベース統計</h4>
                <div className="flex gap-2">
                  <button
                    onClick={loadDatabaseStats}
                    disabled={isLoadingStats}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isLoadingStats ? '🔄 読み込み中...' : '🔄 更新'}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const firebaseService = FirebaseService.getInstance()
                        const songs = await firebaseService.getAllSongs()
                        console.log('📋 All songs in database:', songs)
                        alert(`データベース内の楽曲:\n${songs.map(s => `- ${s.title} (ID: ${s.id})`).join('\n')}`)
                      } catch (error) {
                        console.error('Failed to list songs:', error)
                        alert('楽曲一覧の取得に失敗しました')
                      }
                    }}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    📋 楽曲一覧
                  </button>
                </div>
              </div>
              
              {dbStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{dbStats.totalSongs}</div>
                    <div className="text-sm text-green-600">楽曲数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{dbStats.totalTags.size}</div>
                    <div className="text-sm text-green-600">タグ数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">{dbStats.recentSongsCount}</div>
                    <div className="text-sm text-green-600">最近の楽曲（7日以内）</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                  統計データを読み込んでください
                </div>
              )}
            </div>
          )}

          {/* 推奨アクション */}
          {!testResult.isConnected && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">推奨アクション</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {!testResult.isConfigured && (
                  <li>• .env.localファイルのFirebase設定を確認してください</li>
                )}
                {testResult.isConfigured && !testResult.details.canQueryFirestore && (
                  <>
                    <li>• Firebase Consoleでプロジェクトが有効になっているか確認してください</li>
                    <li>• Firestoreデータベースが作成されているか確認してください</li>
                    <li>• ネットワーク接続を確認してください</li>
                  </>
                )}
                <li>• 開発サーバーを再起動してみてください</li>
              </ul>
            </div>
          )}

          {/* テスト楽曲追加 */}
          {testResult.isConnected && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">テスト楽曲追加</h4>
              <p className="text-sm text-purple-700 mb-3">
                Firebaseへの保存をテストするために、サンプル楽曲を追加できます。
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const firebaseService = FirebaseService.getInstance()
                      const testSong = {
                        id: `test-${Date.now()}`,
                        title: `テスト楽曲 ${new Date().toLocaleTimeString()}`,
                        lyricists: ['テスト作詞家'],
                        composers: ['テスト作曲家'],
                        arrangers: ['テスト編曲家'],
                        tags: ['テスト', 'Firebase'],
                        notes: 'Firebase接続テスト用の楽曲です',
                        createdAt: new Date().toISOString()
                      }
                      
                      console.log('🔥 Adding test song:', testSong)
                      const result = await firebaseService.addSong(testSong)
                      
                      if (result) {
                        alert(`テスト楽曲が追加されました！ID: ${result}`)
                        await loadDatabaseStats()
                      } else {
                        alert('テスト楽曲の追加に失敗しました')
                      }
                    } catch (error) {
                      console.error('Test song error:', error)
                      alert(`エラー: ${error instanceof Error ? error.message : String(error)}`)
                    }
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                >
                  🧪 テスト楽曲を追加
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      console.log('🗑️ Starting test song deletion...')
                      
                      const firebaseService = FirebaseService.getInstance()
                      const songs = await firebaseService.getAllSongs()
                      console.log('📋 All songs found:', songs)
                      
                      const testSongs = songs.filter(s => 
                        s.title.includes('テスト楽曲') || 
                        s.title.includes('テスト') ||
                        s.lyricists.some(l => l.includes('テスト')) ||
                        s.composers.some(c => c.includes('テスト'))
                      )
                      console.log('🎯 Test songs to delete:', testSongs)
                      
                      if (testSongs.length === 0) {
                        alert('削除対象のテスト楽曲が見つかりませんでした')
                        return
                      }
                      
                      if (!confirm(`${testSongs.length}件のテスト楽曲を削除しますか？\n\n削除対象:\n${testSongs.map(s => `- ${s.title}`).join('\n')}`)) {
                        return
                      }
                      
                      let deletedCount = 0
                      for (const song of testSongs) {
                        console.log('🗑️ Deleting song:', song.title, 'ID:', song.id)
                        const success = await firebaseService.deleteSong(song.id)
                        if (success) {
                          deletedCount++
                          console.log('✅ Successfully deleted:', song.title)
                        } else {
                          console.error('❌ Failed to delete:', song.title)
                        }
                      }
                      
                      alert(`${deletedCount}/${testSongs.length}件のテスト楽曲を削除しました`)
                      await loadDatabaseStats()
                    } catch (error) {
                      console.error('Delete test songs error:', error)
                      alert(`エラー: ${error instanceof Error ? error.message : String(error)}`)
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  🗑️ テスト楽曲削除
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const firebaseService = FirebaseService.getInstance()
                      const songs = await firebaseService.getAllSongs()
                      
                      if (songs.length === 0) {
                        alert('削除する楽曲がありません')
                        return
                      }
                      
                      if (!confirm(`⚠️ 警告: すべての楽曲（${songs.length}件）を削除しますか？\n\nこの操作は取り消せません！\n\n削除対象:\n${songs.map(s => `- ${s.title}`).join('\n')}`)) {
                        return
                      }
                      
                      if (!confirm('本当にすべての楽曲を削除しますか？\n\n最終確認です！')) {
                        return
                      }
                      
                      let deletedCount = 0
                      for (const song of songs) {
                        console.log('🗑️ Deleting song:', song.title, 'ID:', song.id)
                        const success = await firebaseService.deleteSong(song.id)
                        if (success) {
                          deletedCount++
                        }
                      }
                      
                      alert(`${deletedCount}/${songs.length}件の楽曲を削除しました`)
                      await loadDatabaseStats()
                    } catch (error) {
                      console.error('Delete all songs error:', error)
                      alert(`エラー: ${error instanceof Error ? error.message : String(error)}`)
                    }
                  }}
                  className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors"
                >
                  ⚠️ 全楽曲削除
                </button>
              </div>
            </div>
          )}

          {/* Firebase Console リンク */}
          {testResult.isConnected && configInfo.projectId !== '未設定' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Firebase Console</h4>
              <p className="text-sm text-blue-700 mb-3">
                データベースの内容を直接確認するには、Firebase Consoleにアクセスしてください。
              </p>
              <a
                href={`https://console.firebase.google.com/project/${configInfo.projectId}/firestore/data`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔗 Firestoreを開く
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}