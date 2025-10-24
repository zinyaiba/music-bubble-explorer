import React, { useState, useEffect } from 'react'
import { SongSelectionView } from '@/components/SongSelectionView'
import { MusicDataService } from '@/services/MusicDataService'
import { Song } from '@/types/music'

/**
 * SongSelectionViewコンポーネントの使用例
 * 新しい楽曲選択インターフェースの機能をデモンストレーション
 */
export const SongSelectionExample: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 楽曲データの読み込み
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const musicService = MusicDataService.getInstance()

        // Firebaseからデータを読み込み
        await musicService.loadFromFirebase()

        const allSongs = musicService.getAllSongs()
        setSongs(allSongs)
      } catch (error) {
        console.error('楽曲データの読み込みに失敗しました:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSongs()
  }, [])

  // 楽曲選択ハンドラー
  const handleSongSelect = (song: Song) => {
    setSelectedSong(song)
    console.log('選択された楽曲:', song)
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        楽曲データを読み込み中...
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>楽曲選択インターフェース デモ</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>機能一覧:</h2>
        <ul>
          <li>リアルタイム検索（デバウンス処理付き）</li>
          <li>タグによるフィルタリング</li>
          <li>グリッド・リスト表示の切り替え</li>
          <li>ソート機能（タイトル順、新しい順、アーティスト順）</li>
          <li>ページネーション</li>
          <li>モバイル最適化されたタッチ操作</li>
          <li>検索候補の表示</li>
        </ul>
      </div>

      {selectedSong && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h3>選択された楽曲:</h3>
          <p>
            <strong>タイトル:</strong> {selectedSong.title}
          </p>
          {selectedSong.lyricists.length > 0 && (
            <p>
              <strong>作詞:</strong> {selectedSong.lyricists.join(', ')}
            </p>
          )}
          {selectedSong.composers.length > 0 && (
            <p>
              <strong>作曲:</strong> {selectedSong.composers.join(', ')}
            </p>
          )}
          {selectedSong.arrangers.length > 0 && (
            <p>
              <strong>編曲:</strong> {selectedSong.arrangers.join(', ')}
            </p>
          )}
          {selectedSong.tags && selectedSong.tags.length > 0 && (
            <p>
              <strong>タグ:</strong> {selectedSong.tags.join(', ')}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          height: '600px',
          overflow: 'hidden',
        }}
      >
        <SongSelectionView
          songs={songs}
          onSongSelect={handleSongSelect}
          enableAdvancedSearch={true}
        />
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>総楽曲数: {songs.length}件</p>
        <p>このコンポーネントは以下の要件を満たしています:</p>
        <ul style={{ fontSize: '12px' }}>
          <li>要件 1.1: 高い視認性を持つ楽曲一覧表示</li>
          <li>要件 1.4: 検索・フィルタリング機能とモバイル最適化</li>
        </ul>
      </div>
    </div>
  )
}

export default SongSelectionExample
