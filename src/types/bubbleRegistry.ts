/**
 * シャボン玉レジストリシステムの型定義
 * Requirements: 3.1, 3.2, 3.3, 3.4 - 重複防止のための一意性管理
 */

import type { PersonRole } from './consolidatedPerson'

/**
 * コンテンツアイテムの基本インターフェース
 */
export interface ContentItem {
  id: string
  type: 'song' | 'person' | 'tag'
  name: string
  roles?: PersonRole[]
  relatedCount: number
  lastDisplayed?: number // 最後に表示された時刻（タイムスタンプ）
  displayCount?: number // 表示回数
}

/**
 * 表示中のシャボン玉情報
 */
export interface DisplayedBubbleInfo {
  contentId: string
  bubbleId: string
  timestamp: number
  type: 'song' | 'person' | 'tag'
}

/**
 * コンテンツプールの統計情報
 */
export interface ContentPoolStats {
  totalContent: number
  availableContent: number
  displayedContent: number
  songCount: number
  personCount: number
  tagCount: number
  rotationCycle: number // 全コンテンツが一巡するまでの回数
}

/**
 * 重み付き選択のための設定
 */
export interface WeightedSelectionConfig {
  recencyWeight: number // 最近表示されたものの重み（低いほど選ばれにくい）
  popularityWeight: number // 人気度（関連数）の重み
  typeBalanceWeight: number // タイプバランスの重み
  randomWeight: number // ランダム要素の重み
}

/**
 * レジストリの設定オプション
 */
export interface BubbleRegistryConfig {
  maxDisplayedItems: number // 同時表示可能な最大アイテム数
  rotationCooldown: number // 再表示までのクールダウン時間（ミリ秒）
  enableWeightedSelection: boolean // 重み付き選択を有効にするか
  weightedConfig: WeightedSelectionConfig
  enableRotationStrategy: boolean // 回転戦略を有効にするか
}

/**
 * デフォルトの重み付き選択設定
 */
export const DEFAULT_WEIGHTED_CONFIG: WeightedSelectionConfig = {
  recencyWeight: 0.3,
  popularityWeight: 0.4,
  typeBalanceWeight: 0.2,
  randomWeight: 0.1
}

/**
 * デフォルトのレジストリ設定
 */
export const DEFAULT_REGISTRY_CONFIG: BubbleRegistryConfig = {
  maxDisplayedItems: 25,
  rotationCooldown: 30000, // 30秒
  enableWeightedSelection: true,
  weightedConfig: DEFAULT_WEIGHTED_CONFIG,
  enableRotationStrategy: true
}