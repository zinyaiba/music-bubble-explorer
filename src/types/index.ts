// Music data types
export type { Song, Person, MusicDatabase, Bubble, RelatedData } from './music'

// ============================================
// Live Management Types
// ============================================

/**
 * ライブ種別
 * - tour: ツアー
 * - solo: 単独公演
 * - festival: フェス
 */
export type LiveType = 'tour' | 'solo' | 'festival'

/**
 * ライブ種別の表示名マッピング
 */
export const LIVE_TYPE_LABELS: Record<LiveType, string> = {
  tour: 'ツアー',
  solo: '単独公演',
  festival: 'フェス',
}

/**
 * セトリ項目
 * セトリ内の1曲を表すエンティティ
 */
export interface SetlistItem {
  /** 楽曲ID（既存楽曲の場合） */
  songId?: string
  /** 楽曲名（フリー入力または既存楽曲から取得） */
  songTitle: string
  /** 演奏順序（1から開始） */
  order: number
  /** 日替わり曲フラグ */
  isDailySong: boolean
}

/**
 * ライブデータ
 * 音楽公演イベントを表すデータエンティティ
 */
export interface Live {
  /** ライブID */
  id: string
  /** ライブ種別 */
  liveType: LiveType
  /** 公演名 */
  title: string
  /** 会場名 */
  venueName: string
  /** 日時（ISO 8601形式） */
  dateTime: string
  /** 公演地（ツアーの場合のみ） */
  tourLocation?: string
  /** セトリ */
  setlist: SetlistItem[]
  /** 作成日時 */
  createdAt?: string
  /** 更新日時 */
  updatedAt?: string
}

// Bubble entity class
export { BubbleEntity } from './bubble'

// Environment configuration types
export type {
  EnvironmentConfig,
  EnvironmentDetectionResult,
} from './environment'

// Enhanced bubble types and visual system
export type {
  EnhancedBubble,
  PersonRole,
  BubbleStyle,
  VisualTheme,
  ContentItem as EnhancedContentItem,
  ConsolidatedPerson,
} from './enhancedBubble'
export { IconType, ShapeType } from './enhancedBubble'

// Bubble registry types
export type {
  ContentItem,
  DisplayedBubbleInfo,
  ContentPoolStats,
  BubbleRegistryConfig,
  WeightedSelectionConfig,
} from './bubbleRegistry'
export {
  DEFAULT_REGISTRY_CONFIG,
  DEFAULT_WEIGHTED_CONFIG,
} from './bubbleRegistry'
