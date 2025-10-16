import React, { useState, useEffect } from 'react'
import { BubbleCanvas } from '@/components/BubbleCanvas'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from '@/services/bubbleManager'
import { BubbleEntity } from '@/types/bubble'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import type { MusicDatabase } from '@/types/music'

// サンプルデータ
const sampleMusicDatabase: MusicDatabase = {
  songs: [
    {
      id: '1',
      title: '春の歌',
      lyricists: ['田中太郎'],
      composers: ['佐藤花子'],
      arrangers: ['鈴木次郎']
    },
    {
      id: '2', 
      title: '夏の思い出',
      lyricists: ['田中太郎', '山田美咲'],
      composers: ['佐藤花子'],
      arrangers: ['鈴木次郎', '高橋健一']
    },
    {
      id: '3',
      title: '秋の風',
      lyricists: ['山田美咲'],
      composers: ['佐藤花子', '高橋健一'],
      arrangers: ['鈴木次郎']
    }
  ],
  people: [
    {
      id: '1',
      name: '田中太郎',
      type: 'lyricist',
      songs: ['1', '2']
    },
    {
      id: '2',
      name: '佐藤花子', 
      type: 'composer',
      songs: ['1', '2', '3']
    },
    {
      id: '3',
      name: '鈴木次郎',
      type: 'arranger', 
      songs: ['1', '2', '3']
    },
    {
      id: '4',
      name: '山田美咲',
      type: 'lyricist',
      songs: ['2', '3']
    },
    {
      id: '5',
      name: '高橋健一',
      type: 'composer',
      songs: ['2', '3']
    }
  ]
}

/**
 * BubbleCanvas使用例コンポーネント
 */
export const BubbleCanvasExample: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleEntity[]>([])
  const [bubbleManager] = useState(() => new BubbleManager(sampleMusicDatabase, {
    ...DEFAULT_BUBBLE_CONFIG,
    canvasWidth: 800,
    canvasHeight: 600,
    maxBubbles: 15
  }))
  const [selectedBubble, setSelectedBubble] = useState<BubbleEntity | null>(null)

  /**
   * シャボン玉クリック時のハンドラー
   */
  const handleBubbleClick = (bubble: BubbleEntity) => {
    console.log('Bubble clicked:', bubble.name, bubble.type)
    setSelectedBubble(bubble)
    
    // クリック時のアニメーション効果を開始
    bubbleManager.triggerClickAnimation(bubble.id)
  }

  /**
   * アニメーションループのコールバック
   */
  const animationCallback = (_deltaTime: number, _currentTime: number) => {
    // BubbleManagerの統合更新メソッドを使用
    const updatedBubbles = bubbleManager.updateFrame()
    
    // 状態を更新（Reactの再レンダリングをトリガー）
    setBubbles(updatedBubbles)
  }

  // アニメーションループを開始
  useAnimationLoop(animationCallback, true)

  /**
   * 初期シャボン玉の生成
   */
  useEffect(() => {
    bubbleManager.maintainBubbleCount()
    setBubbles(bubbleManager.getBubbles())
  }, [bubbleManager])

  /**
   * 選択されたシャボン玉の詳細情報を表示
   */
  const renderBubbleDetails = () => {
    if (!selectedBubble) return null

    const relatedInfo = selectedBubble.type === 'song' 
      ? sampleMusicDatabase.songs.find(s => s.title === selectedBubble.name)
      : sampleMusicDatabase.people.find(p => p.name === selectedBubble.name)

    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxWidth: '300px',
        zIndex: 10
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          {selectedBubble.name}
        </h3>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
          タイプ: {selectedBubble.type === 'song' ? '楽曲' : 
                   selectedBubble.type === 'lyricist' ? '作詞家' :
                   selectedBubble.type === 'composer' ? '作曲家' : '編曲家'}
        </p>
        <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
          関連数: {selectedBubble.relatedCount}
        </p>
        <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '14px' }}>
          サイズ: {Math.round(selectedBubble.size)}px
        </p>
        
        {selectedBubble.type === 'song' && relatedInfo && 'lyricists' in relatedInfo && (
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>関連する人物:</p>
            <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '12px' }}>
              {relatedInfo.lyricists.map(name => <li key={name}>作詞: {name}</li>)}
              {relatedInfo.composers.map(name => <li key={name}>作曲: {name}</li>)}
              {relatedInfo.arrangers.map(name => <li key={name}>編曲: {name}</li>)}
            </ul>
          </div>
        )}
        
        {selectedBubble.type !== 'song' && relatedInfo && 'songs' in relatedInfo && (
          <div>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px' }}>関連する楽曲:</p>
            <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '12px' }}>
              {relatedInfo.songs.map(songId => {
                const song = sampleMusicDatabase.songs.find(s => s.id === songId)
                return song ? <li key={songId}>{song.title}</li> : null
              })}
            </ul>
          </div>
        )}
        
        <button 
          onClick={() => setSelectedBubble(null)}
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: '#FFB6C1',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          閉じる
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'relative', 
      padding: '20px',
      background: 'linear-gradient(135deg, #E8F4FD 0%, #FFF0F5 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', color: '#5A5A5A', marginBottom: '20px' }}>
        Music Bubble Explorer - Canvas Demo
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BubbleCanvas
          width={800}
          height={600}
          bubbles={bubbles}
          onBubbleClick={handleBubbleClick}
        />
      </div>
      
      {renderBubbleDetails()}
      
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>操作方法:</p>
        <ul style={{ margin: '0', paddingLeft: '16px', fontSize: '12px' }}>
          <li>シャボン玉をクリックして詳細表示</li>
          <li>シャボン玉は自動的に浮遊します</li>
          <li>サイズは関連データ数に比例</li>
        </ul>
      </div>
    </div>
  )
}

export default BubbleCanvasExample