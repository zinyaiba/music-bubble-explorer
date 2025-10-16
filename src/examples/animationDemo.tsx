import React, { useState, useEffect } from 'react'
import { BubbleCanvas } from '@/components/BubbleCanvas'
import { DetailModal } from '@/components/DetailModal'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from '@/services/bubbleManager'
import { BubbleEntity } from '@/types/bubble'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { MusicDataService } from '@/services/musicDataService'

/**
 * アニメーションデモコンポーネント
 * 出現・消失・クリックアニメーションをテストする
 */
export const AnimationDemo: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleEntity[]>([])
  const [selectedBubble, setSelectedBubble] = useState<BubbleEntity | null>(null)
  const musicService = MusicDataService.getInstance()
  const [bubbleManager] = useState(() => {
    // 実際のサンプルデータを使用
    const musicDatabase = {
      songs: musicService.getAllSongs(),
      people: musicService.getAllPeople()
    }
    
    return new BubbleManager(musicDatabase, {
      ...DEFAULT_BUBBLE_CONFIG,
      canvasWidth: 600,
      canvasHeight: 400,
      maxBubbles: 12, // より多くのシャボン玉を表示
      minLifespan: 8000, // 8秒
      maxLifespan: 15000 // 15秒
    })
  })

  /**
   * シャボン玉クリック時のハンドラー
   */
  const handleBubbleClick = (bubble: BubbleEntity) => {
    console.log('🎯 Bubble clicked:', bubble.name, 'Type:', bubble.type)
    
    // クリック時のアニメーション効果を開始
    bubbleManager.triggerClickAnimation(bubble.id)
    
    // 詳細モーダルを表示
    setSelectedBubble(bubble)
  }

  /**
   * モーダルを閉じる
   */
  const handleCloseModal = () => {
    setSelectedBubble(null)
  }

  /**
   * アニメーションループのコールバック
   */
  const animationCallback = (_deltaTime: number, _currentTime: number) => {
    // BubbleManagerの統合更新メソッドを使用
    const updatedBubbles = bubbleManager.updateFrame()
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
   * 手動でシャボン玉を追加（出現アニメーションテスト用）
   */
  const addNewBubble = () => {
    const newBubble = bubbleManager.generateBubble()
    bubbleManager.addBubble(newBubble)
    console.log('✨ New bubble added:', newBubble.name)
  }

  /**
   * すべてのシャボン玉をクリア
   */
  const clearAllBubbles = () => {
    bubbleManager.clearAllBubbles()
    setBubbles([])
    console.log('🧹 All bubbles cleared')
  }

  return (
    <div style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, #E8F4FD 0%, #FFF0F5 100%)',
      minHeight: '100vh'
    }}>
      <h1 style={{ textAlign: 'center', color: '#5A5A5A', marginBottom: '20px' }}>
        シャボン玉ライフサイクルアニメーション デモ
      </h1>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={addNewBubble}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            background: '#98FB98',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✨ 新しいシャボン玉を追加 (出現アニメーション)
        </button>
        
        <button 
          onClick={clearAllBubbles}
          style={{
            padding: '10px 20px',
            margin: '0 10px',
            background: '#FFB6C1',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🧹 すべてクリア
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <BubbleCanvas
          width={600}
          height={400}
          bubbles={bubbles}
          onBubbleClick={handleBubbleClick}
        />
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>機能テスト項目:</h3>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
          <li><strong>出現アニメーション:</strong> 「新しいシャボン玉を追加」ボタンをクリック → フェードイン・スケールアップ</li>
          <li><strong>消失アニメーション:</strong> シャボン玉のライフスパンが80%を超えると自動的に開始 → フェードアウト・スケールダウン</li>
          <li><strong>クリックアニメーション:</strong> シャボン玉をクリック → 拡大してから元のサイズに戻る</li>
          <li><strong>詳細モーダル:</strong> シャボン玉をクリック → 詳細情報モーダルが表示される</li>
          <li><strong>楽曲詳細:</strong> 楽曲シャボン玉をクリック → 作詞家・作曲家・編曲家一覧を表示</li>
          <li><strong>人物詳細:</strong> 人物シャボン玉をクリック → 関連楽曲一覧を表示</li>
        </ul>
        
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
          <p style={{ margin: '5px 0' }}>現在のシャボン玉数: {bubbles.length}</p>
          <p style={{ margin: '5px 0' }}>ライフスパン: 8-15秒</p>
          <p style={{ margin: '5px 0' }}>データ: {musicService.getAllSongs().length}曲, {musicService.getAllPeople().length}人</p>
        </div>
      </div>

      {/* 詳細情報モーダル */}
      <DetailModal
        selectedBubble={selectedBubble}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default AnimationDemo