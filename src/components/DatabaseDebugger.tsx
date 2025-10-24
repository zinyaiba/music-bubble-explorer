import React, { useState, useEffect } from 'react'
import { MusicDataService } from '@/services/musicDataService'
import { Song, Person, Tag } from '@/types/music'

interface DatabaseDebuggerProps {
  isVisible: boolean
  onClose: () => void
}

export const DatabaseDebugger: React.FC<DatabaseDebuggerProps> = ({
  isVisible,
  onClose
}) => {
  const [songs, setSongs] = useState<Song[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

  useEffect(() => {
    if (isVisible) {
      const musicService = MusicDataService.getInstance()
      setSongs(musicService.getAllSongs())
      setPeople(musicService.getAllPeople())
      setTags(musicService.getAllTags())
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 9999,
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>データベースデバッガー</h2>
          <button onClick={onClose} style={{ fontSize: '20px', background: 'none', border: 'none' }}>×</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>データベース統計</h3>
          <p>楽曲数: {songs.length}</p>
          <p>人物数: {people.length}</p>
          <p>タグ数: {tags.length}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>楽曲一覧</h3>
          {songs.length === 0 ? (
            <p style={{ color: 'red' }}>楽曲データが見つかりません</p>
          ) : (
            <div>
              {songs.slice(0, 5).map(song => (
                <div key={song.id} style={{ 
                  border: '1px solid #ccc', 
                  padding: '10px', 
                  margin: '5px 0',
                  cursor: 'pointer',
                  backgroundColor: selectedSong?.id === song.id ? '#f0f0f0' : 'white'
                }}
                onClick={() => setSelectedSong(song)}
                >
                  <strong>{song.title}</strong>
                  <br />
                  作詞: {song.lyricists?.join(', ') || 'なし'}
                  <br />
                  作曲: {song.composers?.join(', ') || 'なし'}
                  <br />
                  編曲: {song.arrangers?.join(', ') || 'なし'}
                  <br />
                  タグ: {song.tags?.join(', ') || 'なし'}
                </div>
              ))}
              {songs.length > 5 && <p>...他 {songs.length - 5} 曲</p>}
            </div>
          )}
        </div>

        {selectedSong && (
          <div style={{ marginBottom: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '5px' }}>
            <h3>選択された楽曲の詳細</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(selectedSong, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3>人物一覧</h3>
          {people.length === 0 ? (
            <p style={{ color: 'red' }}>人物データが見つかりません</p>
          ) : (
            <div>
              {people.slice(0, 5).map(person => (
                <div key={person.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
                  <strong>{person.name}</strong>
                  <br />
                  関連楽曲: {person.songs?.length || 0} 曲
                </div>
              ))}
              {people.length > 5 && <p>...他 {people.length - 5} 人</p>}
            </div>
          )}
        </div>

        <div>
          <h3>タグ一覧</h3>
          {tags.length === 0 ? (
            <p style={{ color: 'red' }}>タグデータが見つかりません</p>
          ) : (
            <div>
              {tags.slice(0, 5).map(tag => (
                <div key={tag.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px 0' }}>
                  <strong>{tag.name}</strong>
                  <br />
                  関連楽曲: {tag.songs?.length || 0} 曲
                </div>
              ))}
              {tags.length > 5 && <p>...他 {tags.length - 5} タグ</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}