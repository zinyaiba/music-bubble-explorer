import React, { useCallback } from 'react'
import './SongDetailButton.css'

/**
 * SongDetailButton Props
 * 楽曲詳細画面への遷移ボタンのプロパティ
 */
export interface SongDetailButtonProps {
  /** 楽曲ID */
  songId: string
  /** 楽曲タイトル（アクセシビリティ用） */
  songTitle: string
  /** クリック時のコールバック */
  onClick: (songId: string) => void
}

/**
 * SongDetailButton コンポーネント
 * 楽曲チップの右端に配置する、楽曲詳細画面への遷移ボタン
 *
 * Requirements: 1.1, 1.3, 2.2, 3.2, 3.3
 * - 視覚的に識別可能なアイコンの表示 (1.3)
 * - クリック/タップイベントの処理（イベント伝播の停止を含む）(2.2)
 * - キーボードアクセシビリティの提供 (3.2)
 * - アクセシブルラベルの提供 (3.3)
 */
export const SongDetailButton: React.FC<SongDetailButtonProps> = ({
  songId,
  songTitle,
  onClick,
}) => {
  /**
   * クリックイベントハンドラ
   * イベント伝播を停止し、コールバックを実行
   * Requirements: 2.2
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onClick(songId)
    },
    [songId, onClick]
  )

  /**
   * キーボードイベントハンドラ
   * Enter/Spaceキーで遷移を実行
   * Requirements: 3.2
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        onClick(songId)
      }
    },
    [songId, onClick]
  )

  return (
    <button
      type="button"
      className="song-detail-button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label="楽曲詳細を表示"
      title={`${songTitle}の詳細を表示`}
    >
      <span className="song-detail-button-icon" aria-hidden="true">
        ➡️
      </span>
    </button>
  )
}

export default SongDetailButton
