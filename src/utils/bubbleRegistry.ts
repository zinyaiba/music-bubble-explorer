/**
 * シャボン玉レジストリシステム
 * Requirements: 3.1, 3.2, 3.3, 3.4 - 重複防止のための一意性チェックと利用可能コンテンツプールの管理
 */

import type { 
  ContentItem, 
  DisplayedBubbleInfo, 
  ContentPoolStats, 
  BubbleRegistryConfig
} from '@/types/bubbleRegistry'
import { DEFAULT_REGISTRY_CONFIG } from '@/types/bubbleRegistry'
import type { Song, Person, Tag } from '@/types/music'
import type { ConsolidatedPerson } from '@/types/consolidatedPerson'

/**
 * シャボン玉レジストリクラス
 * 表示中コンテンツの追跡と重複防止を管理
 */
export class BubbleRegistry {
  private displayedContent: Map<string, DisplayedBubbleInfo> = new Map()
  private availableContent: Map<string, ContentItem> = new Map()
  private contentHistory: Map<string, number[]> = new Map() // 表示履歴（タイムスタンプ配列）
  private config: BubbleRegistryConfig
  private rotationCycle: number = 0

  constructor(config: Partial<BubbleRegistryConfig> = {}) {
    this.config = { ...DEFAULT_REGISTRY_CONFIG, ...config }
  }

  /**
   * 音楽データベースからコンテンツプールを初期化
   * Requirements: 3.2 - 表示されていない楽曲・人物・タグから選択する
   */
  initializeContentPool(
    songs: Song[], 
    people: Person[], 
    tags: Tag[] = [],
    consolidatedPersons: ConsolidatedPerson[] = []
  ): void {
    this.availableContent.clear()

    // 楽曲をコンテンツプールに追加
    songs.forEach(song => {
      const relatedCount = song.lyricists.length + song.composers.length + song.arrangers.length
      this.availableContent.set(song.id, {
        id: song.id,
        type: 'song',
        name: song.title,
        relatedCount,
        displayCount: 0
      })
    })

    // 統合された人物をコンテンツプールに追加（優先）
    if (consolidatedPersons.length > 0) {
      consolidatedPersons.forEach(person => {
        this.availableContent.set(person.name, {
          id: person.name,
          type: 'person',
          name: person.name,
          roles: person.roles,
          relatedCount: person.totalRelatedCount,
          displayCount: 0
        })
      })
    } else {
      // フォールバック: 通常の人物データを使用
      people.forEach(person => {
        this.availableContent.set(person.id, {
          id: person.id,
          type: 'person',
          name: person.name,
          relatedCount: person.songs.length,
          displayCount: 0
        })
      })
    }

    // タグをコンテンツプールに追加
    tags.forEach(tag => {
      this.availableContent.set(tag.id, {
        id: tag.id,
        type: 'tag',
        name: tag.name,
        relatedCount: tag.songs.length,
        displayCount: 0
      })
    })

    console.log('BubbleRegistry: Content pool initialized', {
      songs: songs.length,
      people: consolidatedPersons.length || people.length,
      tags: tags.length,
      total: this.availableContent.size
    })
  }

  /**
   * シャボン玉を登録（表示開始）
   * Requirements: 3.1 - 既に表示中のシャボン玉と重複しないようにチェックする
   */
  registerBubble(contentId: string, bubbleId: string, type: 'song' | 'person' | 'tag'): boolean {
    // 既に表示中かチェック
    if (this.displayedContent.has(contentId)) {
      return false // 重複のため登録失敗
    }

    // 最大表示数をチェック
    if (this.displayedContent.size >= this.config.maxDisplayedItems) {
      return false // 表示数上限のため登録失敗
    }

    const timestamp = Date.now()
    
    // 表示中リストに追加
    this.displayedContent.set(contentId, {
      contentId,
      bubbleId,
      timestamp,
      type
    })

    // 利用可能プールから削除
    const contentItem = this.availableContent.get(contentId)
    if (contentItem) {
      contentItem.lastDisplayed = timestamp
      contentItem.displayCount = (contentItem.displayCount || 0) + 1
      this.availableContent.delete(contentId)
    }

    // 表示履歴を更新
    const history = this.contentHistory.get(contentId) || []
    history.push(timestamp)
    this.contentHistory.set(contentId, history)

    return true // 登録成功
  }

  /**
   * シャボン玉の登録を解除（表示終了）
   * Requirements: 3.3 - シャボン玉が消失する時にその内容を再度選択可能なプールに戻す
   */
  unregisterBubble(bubbleId: string): void {
    // bubbleIdから対応するcontentIdを検索
    let targetContentId: string | null = null
    for (const [contentId, info] of this.displayedContent.entries()) {
      if (info.bubbleId === bubbleId) {
        targetContentId = contentId
        break
      }
    }

    if (!targetContentId) {
      return // 該当するシャボン玉が見つからない
    }

    // 表示中リストから削除
    const displayedInfo = this.displayedContent.get(targetContentId)
    this.displayedContent.delete(targetContentId)

    // クールダウン時間をチェックして利用可能プールに戻す
    if (displayedInfo && this.shouldReturnToPool(targetContentId)) {
      // 利用可能プールに戻す（コンテンツアイテムを再構築）
      this.returnContentToPool(targetContentId, displayedInfo.type)
    }
  }

  /**
   * コンテンツが表示中かチェック
   * Requirements: 3.1 - 重複防止のための一意性チェック
   */
  isContentDisplayed(contentId: string): boolean {
    return this.displayedContent.has(contentId)
  }

  /**
   * 利用可能なコンテンツプールを取得
   * Requirements: 3.2 - 利用可能コンテンツプールの管理
   */
  getAvailableContent(): ContentItem[] {
    return Array.from(this.availableContent.values())
  }

  /**
   * 次の一意なコンテンツを取得
   * Requirements: 3.2, 3.4 - 重み付き選択アルゴリズムと回転戦略
   */
  getNextUniqueContent(): ContentItem | null {
    const availableItems = this.getAvailableContent()
    
    if (availableItems.length === 0) {
      // 利用可能なコンテンツがない場合の処理
      return this.handleEmptyPool()
    }

    if (this.config.enableWeightedSelection) {
      return this.selectWeightedContent(availableItems)
    } else {
      // シンプルなランダム選択
      return availableItems[Math.floor(Math.random() * availableItems.length)]
    }
  }

  /**
   * 重み付き選択アルゴリズム
   * Requirements: 3.4 - 重み付き選択アルゴリズム
   */
  private selectWeightedContent(availableItems: ContentItem[]): ContentItem {
    const weights = availableItems.map(item => this.calculateContentWeight(item))
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    if (totalWeight === 0) {
      // 全ての重みが0の場合はランダム選択
      return availableItems[Math.floor(Math.random() * availableItems.length)]
    }

    // 重み付きランダム選択
    let random = Math.random() * totalWeight
    for (let i = 0; i < availableItems.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return availableItems[i]
      }
    }

    // フォールバック
    return availableItems[availableItems.length - 1]
  }

  /**
   * コンテンツの重みを計算
   */
  private calculateContentWeight(item: ContentItem): number {
    const config = this.config.weightedConfig
    const now = Date.now()
    
    // 最近表示された度合い（低いほど重みが高い）
    const recencyScore = this.calculateRecencyScore(item, now)
    
    // 人気度スコア（関連数に基づく）
    const popularityScore = Math.log(item.relatedCount + 1) / Math.log(20) // 正規化
    
    // タイプバランススコア
    const typeBalanceScore = this.calculateTypeBalanceScore(item.type)
    
    // ランダム要素
    const randomScore = Math.random()

    // 重み付き合計
    const totalWeight = 
      recencyScore * config.recencyWeight +
      popularityScore * config.popularityWeight +
      typeBalanceScore * config.typeBalanceWeight +
      randomScore * config.randomWeight

    return Math.max(0, totalWeight)
  }

  /**
   * 最近表示された度合いのスコアを計算
   */
  private calculateRecencyScore(item: ContentItem, now: number): number {
    if (!item.lastDisplayed) {
      return 1.0 // 一度も表示されていない場合は最高スコア
    }

    const timeSinceLastDisplay = now - item.lastDisplayed
    const cooldownRatio = Math.min(timeSinceLastDisplay / this.config.rotationCooldown, 1.0)
    
    return cooldownRatio // 0.0（直近表示）〜 1.0（十分時間が経過）
  }

  /**
   * タイプバランススコアを計算
   */
  private calculateTypeBalanceScore(type: 'song' | 'person' | 'tag'): number {
    const displayedTypes = Array.from(this.displayedContent.values())
    const typeCount = displayedTypes.filter(item => item.type === type).length
    const totalDisplayed = displayedTypes.length
    
    if (totalDisplayed === 0) {
      return 1.0
    }

    // 表示中のタイプの割合が低いほど高スコア
    const typeRatio = typeCount / totalDisplayed
    const idealRatio = 1 / 3 // 理想的には各タイプが1/3ずつ
    
    return Math.max(0, 1 - Math.abs(typeRatio - idealRatio))
  }

  /**
   * 利用可能プールが空の場合の処理
   * Requirements: 3.4 - 全てのコンテンツが表示中の場合の処理
   */
  private handleEmptyPool(): ContentItem | null {
    if (!this.config.enableRotationStrategy) {
      return null // 回転戦略が無効の場合は新しいシャボン玉を生成しない
    }

    // 最も古い表示中アイテムを強制的に利用可能にする
    const oldestItem = this.findOldestDisplayedItem()
    if (oldestItem) {
      // 強制的に登録解除
      this.displayedContent.delete(oldestItem.contentId)
      
      // 利用可能プールに戻す
      this.returnContentToPool(oldestItem.contentId, oldestItem.type)
      
      // 回転サイクルをインクリメント
      this.rotationCycle++
      
      console.log('BubbleRegistry: Forced rotation due to empty pool', {
        rotationCycle: this.rotationCycle,
        forcedItem: oldestItem.contentId
      })
      
      return this.availableContent.get(oldestItem.contentId) || null
    }

    return null
  }

  /**
   * 最も古い表示中アイテムを検索
   */
  private findOldestDisplayedItem(): DisplayedBubbleInfo | null {
    let oldest: DisplayedBubbleInfo | null = null
    
    for (const item of this.displayedContent.values()) {
      if (!oldest || item.timestamp < oldest.timestamp) {
        oldest = item
      }
    }
    
    return oldest
  }

  /**
   * コンテンツをプールに戻すかどうかを判定
   */
  private shouldReturnToPool(contentId: string): boolean {
    const history = this.contentHistory.get(contentId)
    if (!history || history.length === 0) {
      return true
    }

    const lastDisplayed = history[history.length - 1]
    const timeSinceLastDisplay = Date.now() - lastDisplayed
    
    return timeSinceLastDisplay >= this.config.rotationCooldown
  }

  /**
   * コンテンツを利用可能プールに戻す
   */
  private returnContentToPool(contentId: string, type: 'song' | 'person' | 'tag'): void {
    // 既存のコンテンツアイテムを検索または再構築
    let contentItem = this.findContentItemById(contentId, type)
    
    if (contentItem) {
      this.availableContent.set(contentId, contentItem)
    }
  }

  /**
   * IDとタイプからコンテンツアイテムを検索
   */
  private findContentItemById(contentId: string, type: 'song' | 'person' | 'tag'): ContentItem | null {
    // 履歴から基本情報を復元（実際の実装では外部データソースから取得）
    const history = this.contentHistory.get(contentId)
    const displayCount = history ? history.length : 0
    const lastDisplayed = history && history.length > 0 ? history[history.length - 1] : undefined
    
    // 基本的なコンテンツアイテムを作成（実際の実装では詳細データが必要）
    return {
      id: contentId,
      type,
      name: contentId, // 実際の実装では適切な名前を設定
      relatedCount: 1, // 実際の実装では適切な関連数を設定
      displayCount,
      lastDisplayed
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): ContentPoolStats {
    const availableItems = this.getAvailableContent()
    const displayedItems = Array.from(this.displayedContent.values())
    
    return {
      totalContent: this.availableContent.size + this.displayedContent.size,
      availableContent: availableItems.length,
      displayedContent: displayedItems.length,
      songCount: availableItems.filter(item => item.type === 'song').length,
      personCount: availableItems.filter(item => item.type === 'person').length,
      tagCount: availableItems.filter(item => item.type === 'tag').length,
      rotationCycle: this.rotationCycle
    }
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<BubbleRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * レジストリをリセット
   */
  reset(): void {
    this.displayedContent.clear()
    this.availableContent.clear()
    this.contentHistory.clear()
    this.rotationCycle = 0
    
    console.log('BubbleRegistry: Reset completed')
  }

  /**
   * 表示中のコンテンツ一覧を取得（デバッグ用）
   */
  getDisplayedContent(): DisplayedBubbleInfo[] {
    return Array.from(this.displayedContent.values())
  }

  /**
   * 特定のタイプのコンテンツ数を取得
   */
  getContentCountByType(type: 'song' | 'person' | 'tag'): { available: number; displayed: number } {
    const availableCount = this.getAvailableContent().filter(item => item.type === type).length
    const displayedCount = Array.from(this.displayedContent.values()).filter(item => item.type === type).length
    
    return { available: availableCount, displayed: displayedCount }
  }

  /**
   * コンテンツの表示履歴を取得
   */
  getContentHistory(contentId: string): number[] {
    return this.contentHistory.get(contentId) || []
  }
}