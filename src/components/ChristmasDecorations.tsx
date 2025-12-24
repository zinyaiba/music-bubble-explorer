import React, { useMemo } from 'react'
import { useChristmasTheme } from '../contexts/ChristmasThemeContext'

/**
 * クリスマス装飾コンポーネントのプロパティ
 * Requirements: 2.2, 4.3
 */
export interface ChristmasDecorationsProps {
  /** 装飾を表示するかどうか（外部から制御する場合） */
  isActive?: boolean
}

/**
 * 雪の結晶の設定
 */
interface SnowflakeConfig {
  id: number
  left: string
  animationDelay: string
  fontSize: string
  opacity: number
}

/**
 * 星の設定
 */
interface StarConfig {
  id: number
  left: string
  top: string
  animationDelay: string
  fontSize: string
}

/**
 * オーナメントの設定
 */
interface OrnamentConfig {
  id: number
  left: string
  top: string
  color: string
  animationDelay: string
}

/**
 * 雪の結晶の絵文字リスト
 */
const SNOWFLAKE_EMOJIS = ['❄', '❅', '❆', '✻', '✼']

/**
 * 星の絵文字リスト
 */
const STAR_EMOJIS = ['⭐', '✨', '🌟', '💫', '✦']

/**
 * オーナメントの色リスト
 */
const ORNAMENT_COLORS = [
  'var(--christmas-ornament-red)',
  'var(--christmas-ornament-gold)',
  'var(--christmas-ornament-silver)',
  'var(--christmas-red)',
  'var(--christmas-gold)',
]

/**
 * 雪の結晶の設定を生成
 */
const generateSnowflakes = (count: number): SnowflakeConfig[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 10}s`,
    fontSize: `${0.8 + Math.random() * 1.2}rem`,
    opacity: 0.6 + Math.random() * 0.4,
  }))
}

/**
 * 星の設定を生成
 */
const generateStars = (count: number): StarConfig[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    animationDelay: `${Math.random() * 3}s`,
    fontSize: `${0.6 + Math.random() * 1}rem`,
  }))
}

/**
 * オーナメントの設定を生成
 */
const generateOrnaments = (count: number): OrnamentConfig[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${Math.random() * 15}%`,
    color: ORNAMENT_COLORS[i % ORNAMENT_COLORS.length],
    animationDelay: `${Math.random() * 2}s`,
  }))
}

/**
 * クリスマス装飾コンポーネント
 * 雪の結晶、星、オーナメントの装飾を表示するオーバーレイ
 * Requirements: 2.2, 4.3
 */
export const ChristmasDecorations: React.FC<ChristmasDecorationsProps> = ({
  isActive: externalIsActive,
}) => {
  // コンテキストからクリスマスモード状態を取得
  const { isChristmasMode } = useChristmasTheme()

  // 外部から制御する場合はそちらを優先、そうでなければコンテキストの値を使用
  const isActive =
    externalIsActive !== undefined ? externalIsActive : isChristmasMode

  // 装飾の設定をメモ化（再レンダリング時に位置が変わらないように）
  const snowflakes = useMemo(() => generateSnowflakes(15), [])
  const stars = useMemo(() => generateStars(8), [])
  const ornaments = useMemo(() => generateOrnaments(5), [])

  // 非アクティブ時は何も表示しない
  if (!isActive) {
    return null
  }

  return (
    <div
      className="christmas-decorations"
      aria-hidden="true"
      data-testid="christmas-decorations"
    >
      {/* 雪の結晶 */}
      {snowflakes.map(snowflake => (
        <span
          key={`snowflake-${snowflake.id}`}
          className="christmas-snowflake"
          style={{
            left: snowflake.left,
            animationDelay: snowflake.animationDelay,
            fontSize: snowflake.fontSize,
            opacity: snowflake.opacity,
          }}
        >
          {SNOWFLAKE_EMOJIS[snowflake.id % SNOWFLAKE_EMOJIS.length]}
        </span>
      ))}

      {/* 星 */}
      {stars.map(star => (
        <span
          key={`star-${star.id}`}
          className="christmas-star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.animationDelay,
            fontSize: star.fontSize,
          }}
        >
          {STAR_EMOJIS[star.id % STAR_EMOJIS.length]}
        </span>
      ))}

      {/* オーナメント */}
      {ornaments.map(ornament => (
        <span
          key={`ornament-${ornament.id}`}
          className="christmas-ornament"
          style={{
            left: ornament.left,
            top: ornament.top,
            color: ornament.color,
            animationDelay: ornament.animationDelay,
            fontSize: '1.5rem',
          }}
        >
          🎄
        </span>
      ))}
    </div>
  )
}

export default ChristmasDecorations
