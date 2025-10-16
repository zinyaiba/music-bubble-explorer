/**
 * ContentTracker - 重複防止アルゴリズムの実装
 * Requirements: 3.1, 3.2, 3.3, 3.4 - 表示中アイテムの追跡、利用可能コンテンツプール管理、重み付き選択、回転戦略
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
 * 表示履歴エントリ
 */
interface DisplayHistoryEntry {
  timestamp: number
  duration: number // 表示時間（ミリ秒）
  bubbleId: string
}

/**
 * 重み付き選択の詳細統計
 */
interface SelectionWeights {
  recencyScore: number
  popularityScore: number
  typeBalanceScore: number
  rotationScore: number
  randomScore: number
  totalWeight: number
}

/**
 * 回転戦略の状態
 */
interface RotationState {
  currentCycle: number
  completedCycles: number
  cycleStartTime: number
  itemsInCurrentCycle: Set<string>
  forcedRotations: number
}

/**
 * ContentTrackerクラス - 高度な重複防止アルゴリズムを実装
 */
export class ContentTracker {
  private displayedContent: Map<string, DisplayedBubbleInfo> = new Map()
  private availableContent: Map<string, ContentItem> = new Map()
  private displayHistory: Map<string, DisplayHistoryEntry[]> = new Map()
  private selectionWeights: Map<string, SelectionWeights> = new Map()
  private originalContentCache: Map<string, ContentItem> = new Map() // 元のコンテンツデータのキャッシュ
  private rotationState: RotationState
  private config: BubbleRegistryConfig
  private typeRotationQueue: Array<'song' | 'person' | 'tag'> = []
  private currentTypeIndex: number = 0

  constructor(config: Partial<BubbleRegistryConfig> = {}) {
    this.config = { ...DEFAULT_REGISTRY_CONFIG, ...config }
    this.rotationState = {
      currentCycle: 0,
      completedCycles: 0,
      cycleStartTime: Date.now(),
      itemsInCurrentCycle: new Set(),
      forcedRotations: 0
    }
    this.initializeTypeRotationQueue()
  }

  /**
   * タイプローテーションキューを初期化
   */
  private initializeTypeRotationQueue(): void {
    // バランスの取れたタイプローテーション
    this.typeRotationQueue = ['song', 'person', 'tag', 'song', 'person', 'tag']
  }

  /**
   * コンテンツプールを初期化
   * Requirements: 3.2 - 利用可能コンテンツプールの管理
   */
  initializeContentPool(
    songs: Song[], 
    people: Person[], 
    tags: Tag[] = [],
    consolidatedPersons: ConsolidatedPerson[] = []
  ): void {
    this.availableContent.clear()
    this.displayHistory.clear()
    this.selectionWeights.clear()
    this.originalContentCache.clear()

    // 楽曲をコンテンツプールに追加
    songs.forEach(song => {
      const relatedCount = song.lyricists.length + song.composers.length + song.arrangers.length
      const contentItem: ContentItem = {
        id: song.id,
        type: 'song',
        name: song.title,
        relatedCount,
        displayCount: 0
      }
      this.availableContent.set(song.id, contentItem)
      this.originalContentCache.set(song.id, { ...contentItem }) // キャッシュに保存
      this.initializeContentWeights(contentItem)
    })

    // 統合された人物をコンテンツプールに追加
    if (consolidatedPersons.length > 0) {
      consolidatedPersons.forEach(person => {
        const contentItem: ContentItem = {
          id: person.name,
          type: 'person',
          name: person.name,
          roles: person.roles,
          relatedCount: person.totalRelatedCount,
          displayCount: 0
        }
        this.availableContent.set(person.name, contentItem)
        this.originalContentCache.set(person.name, { ...contentItem }) // キャッシュに保存
        this.initializeContentWeights(contentItem)
      })
    } else {
      // フォールバック: 通常の人物データを使用
      people.forEach(person => {
        const contentItem: ContentItem = {
          id: person.id,
          type: 'person',
          name: person.name,
          relatedCount: person.songs.length,
          displayCount: 0
        }
        this.availableContent.set(person.id, contentItem)
        this.originalContentCache.set(person.id, { ...contentItem }) // キャッシュに保存
        this.initializeContentWeights(contentItem)
      })
    }

    // タグをコンテンツプールに追加
    tags.forEach(tag => {
      const contentItem: ContentItem = {
        id: tag.id,
        type: 'tag',
        name: tag.name,
        relatedCount: tag.songs.length,
        displayCount: 0
      }
      this.availableContent.set(tag.id, contentItem)
      this.originalContentCache.set(tag.id, { ...contentItem }) // キャッシュに保存
      this.initializeContentWeights(contentItem)
    })

    // 回転状態をリセット
    this.resetRotationState()

    console.log('ContentTracker: Content pool initialized', {
      songs: songs.length,
      people: consolidatedPersons.length || people.length,
      tags: tags.length,
      total: this.availableContent.size
    })
  }

  /**
   * コンテンツの初期重みを設定
   */
  private initializeContentWeights(contentItem: ContentItem): void {
    const weights: SelectionWeights = {
      recencyScore: 1.0, // 未表示なので最高スコア
      popularityScore: this.calculatePopularityScore(contentItem.relatedCount),
      typeBalanceScore: 1.0,
      rotationScore: 1.0,
      randomScore: Math.random(),
      totalWeight: 0
    }
    weights.totalWeight = this.calculateTotalWeight(weights)
    this.selectionWeights.set(contentItem.id, weights)
  }

  /**
   * 表示中アイテムの追跡機能
   * Requirements: 3.1 - 表示中アイテムの追跡機能
   */
  trackDisplayedItem(contentId: string, bubbleId: string, type: 'song' | 'person' | 'tag'): boolean {
    // 既に表示中かチェック
    if (this.displayedContent.has(contentId)) {
      return false // 重複のため追跡失敗
    }

    // 最大表示数をチェック
    if (this.displayedContent.size >= this.config.maxDisplayedItems) {
      return false // 表示数上限のため追跡失敗
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

    // 回転状態を更新
    this.rotationState.itemsInCurrentCycle.add(contentId)

    // 重みを再計算
    this.recalculateAllWeights()

    return true // 追跡成功
  }

  /**
   * 表示終了時の処理
   * Requirements: 3.3 - シャボン玉が消失する時の処理
   */
  untrackDisplayedItem(bubbleId: string): void {
    // bubbleIdから対応するcontentIdを検索
    let targetContentId: string | null = null
    let displayedInfo: DisplayedBubbleInfo | null = null

    for (const [contentId, info] of this.displayedContent.entries()) {
      if (info.bubbleId === bubbleId) {
        targetContentId = contentId
        displayedInfo = info
        break
      }
    }

    if (!targetContentId || !displayedInfo) {
      return // 該当するシャボン玉が見つからない
    }

    // 表示時間を計算
    const displayDuration = Date.now() - displayedInfo.timestamp

    // 表示履歴に追加
    this.addToDisplayHistory(targetContentId, displayedInfo.timestamp, displayDuration, bubbleId)

    // 表示中リストから削除
    this.displayedContent.delete(targetContentId)

    // クールダウン時間をチェックして利用可能プールに戻す
    if (this.shouldReturnToPool(targetContentId)) {
      this.returnContentToPool(targetContentId, displayedInfo.type)
    }

    // 重みを再計算
    this.recalculateAllWeights()
  }

  /**
   * 表示履歴に追加
   */
  private addToDisplayHistory(contentId: string, timestamp: number, duration: number, bubbleId: string): void {
    const history = this.displayHistory.get(contentId) || []
    history.push({ timestamp, duration, bubbleId })
    
    // 履歴の最大保持数を制限（メモリ効率のため）
    const maxHistoryEntries = 50
    if (history.length > maxHistoryEntries) {
      history.splice(0, history.length - maxHistoryEntries)
    }
    
    this.displayHistory.set(contentId, history)
  }

  /**
   * 重み付き選択アルゴリズム
   * Requirements: 3.4 - 重み付き選択アルゴリズム
   */
  selectNextContent(): ContentItem | null {
    const availableItems = Array.from(this.availableContent.values())
    
    if (availableItems.length === 0) {
      return this.handleEmptyPool()
    }

    if (!this.config.enableWeightedSelection) {
      // シンプルなランダム選択
      return availableItems[Math.floor(Math.random() * availableItems.length)]
    }

    // 重み付き選択の実行
    return this.executeWeightedSelection(availableItems)
  }

  /**
   * 重み付き選択の実行
   */
  private executeWeightedSelection(availableItems: ContentItem[]): ContentItem {
    // 現在のタイプローテーションを考慮
    const preferredType = this.getCurrentPreferredType()
    
    // タイプフィルタリング（優先タイプがある場合）
    let candidateItems = availableItems
    if (preferredType) {
      const preferredItems = availableItems.filter(item => item.type === preferredType)
      if (preferredItems.length > 0) {
        candidateItems = preferredItems
      }
    }

    // 各アイテムの重みを更新
    candidateItems.forEach(item => {
      this.updateContentWeights(item)
    })

    // 重み付きランダム選択
    const weights = candidateItems.map(item => {
      const itemWeights = this.selectionWeights.get(item.id)
      return itemWeights ? itemWeights.totalWeight : 0
    })

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    
    if (totalWeight === 0) {
      // 全ての重みが0の場合はランダム選択
      return candidateItems[Math.floor(Math.random() * candidateItems.length)]
    }

    // 重み付きランダム選択の実行
    let random = Math.random() * totalWeight
    for (let i = 0; i < candidateItems.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        this.updateTypeRotation(candidateItems[i].type)
        return candidateItems[i]
      }
    }

    // フォールバック
    const selectedItem = candidateItems[candidateItems.length - 1]
    this.updateTypeRotation(selectedItem.type)
    return selectedItem
  }

  /**
   * 現在の優先タイプを取得
   */
  private getCurrentPreferredType(): 'song' | 'person' | 'tag' | null {
    if (this.typeRotationQueue.length === 0) {
      return null
    }
    return this.typeRotationQueue[this.currentTypeIndex % this.typeRotationQueue.length]
  }

  /**
   * タイプローテーションを更新
   */
  private updateTypeRotation(selectedType: 'song' | 'person' | 'tag'): void {
    const preferredType = this.getCurrentPreferredType()
    if (selectedType === preferredType) {
      this.currentTypeIndex++
    }
  }

  /**
   * コンテンツの重みを更新
   */
  private updateContentWeights(contentItem: ContentItem): void {
    const now = Date.now()
    const weights: SelectionWeights = {
      recencyScore: this.calculateRecencyScore(contentItem, now),
      popularityScore: this.calculatePopularityScore(contentItem.relatedCount),
      typeBalanceScore: this.calculateTypeBalanceScore(contentItem.type),
      rotationScore: this.calculateRotationScore(contentItem),
      randomScore: Math.random(),
      totalWeight: 0
    }
    
    weights.totalWeight = this.calculateTotalWeight(weights)
    this.selectionWeights.set(contentItem.id, weights)
  }

  /**
   * 最近表示された度合いのスコアを計算
   */
  private calculateRecencyScore(contentItem: ContentItem, now: number): number {
    if (!contentItem.lastDisplayed) {
      return 1.0 // 一度も表示されていない場合は最高スコア
    }

    const timeSinceLastDisplay = now - contentItem.lastDisplayed
    const cooldownRatio = Math.min(timeSinceLastDisplay / this.config.rotationCooldown, 1.0)
    
    // 表示回数も考慮（多く表示されたものは重みを下げる）
    const displayCountPenalty = Math.max(0, 1 - (contentItem.displayCount || 0) * 0.1)
    
    return cooldownRatio * displayCountPenalty
  }

  /**
   * 人気度スコアを計算
   */
  private calculatePopularityScore(relatedCount: number): number {
    // 対数スケールで正規化（1-20の範囲を0-1にマッピング）
    return Math.log(relatedCount + 1) / Math.log(21)
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
    
    return Math.max(0, 1 - Math.abs(typeRatio - idealRatio) * 2)
  }

  /**
   * 回転戦略スコアを計算
   */
  private calculateRotationScore(contentItem: ContentItem): number {
    // 現在のサイクルで表示されていないアイテムに高スコア
    if (!this.rotationState.itemsInCurrentCycle.has(contentItem.id)) {
      return 1.0
    }
    
    // 既に表示されたアイテムは低スコア
    return 0.3
  }

  /**
   * 総重みを計算
   */
  private calculateTotalWeight(weights: SelectionWeights): number {
    const config = this.config.weightedConfig
    
    return (
      weights.recencyScore * config.recencyWeight +
      weights.popularityScore * config.popularityWeight +
      weights.typeBalanceScore * config.typeBalanceWeight +
      weights.rotationScore * 0.2 + // 回転戦略の重み
      weights.randomScore * config.randomWeight
    )
  }

  /**
   * 全ての重みを再計算
   */
  private recalculateAllWeights(): void {
    for (const contentItem of this.availableContent.values()) {
      this.updateContentWeights(contentItem)
    }
  }

  /**
   * 回転戦略の実装
   * Requirements: 3.4 - 回転戦略の実装
   */
  private handleEmptyPool(): ContentItem | null {
    if (!this.config.enableRotationStrategy) {
      return null // 回転戦略が無効の場合は新しいシャボン玉を生成しない
    }

    // 表示中のアイテムがない場合は何もしない
    if (this.displayedContent.size === 0) {
      return null
    }

    // 現在のサイクルが完了したかチェック
    if (this.isCurrentCycleComplete()) {
      this.startNewRotationCycle()
    }

    // 最も古い表示中アイテムを強制的に利用可能にする
    const itemToRotate = this.selectItemForForcedRotation()
    if (itemToRotate) {
      // 強制的に登録解除
      this.displayedContent.delete(itemToRotate.contentId)
      
      // 利用可能プールに戻す
      this.returnContentToPool(itemToRotate.contentId, itemToRotate.type)
      
      // 強制回転数をインクリメント
      this.rotationState.forcedRotations++
      
      console.log('ContentTracker: Forced rotation executed', {
        rotationCycle: this.rotationState.currentCycle,
        forcedItem: itemToRotate.contentId,
        totalForcedRotations: this.rotationState.forcedRotations
      })
      
      return this.availableContent.get(itemToRotate.contentId) || null
    }

    return null
  }

  /**
   * 現在のサイクルが完了したかチェック
   */
  private isCurrentCycleComplete(): boolean {
    const totalContent = this.availableContent.size + this.displayedContent.size
    return this.rotationState.itemsInCurrentCycle.size >= totalContent * 0.8 // 80%のアイテムが表示されたら完了
  }

  /**
   * 新しい回転サイクルを開始
   */
  private startNewRotationCycle(): void {
    this.rotationState.completedCycles++
    this.rotationState.currentCycle++
    this.rotationState.cycleStartTime = Date.now()
    this.rotationState.itemsInCurrentCycle.clear()
    
    console.log('ContentTracker: New rotation cycle started', {
      cycle: this.rotationState.currentCycle,
      completedCycles: this.rotationState.completedCycles
    })
  }

  /**
   * 強制回転するアイテムを選択
   */
  private selectItemForForcedRotation(): DisplayedBubbleInfo | null {
    const displayedItems = Array.from(this.displayedContent.values())
    
    if (displayedItems.length === 0) {
      return null
    }

    // 最も古いアイテムを選択（FIFO方式）
    return displayedItems.reduce((oldest, current) => 
      current.timestamp < oldest.timestamp ? current : oldest
    )
  }

  /**
   * コンテンツをプールに戻すかどうかを判定
   */
  private shouldReturnToPool(contentId: string): boolean {
    const history = this.displayHistory.get(contentId)
    if (!history || history.length === 0) {
      return true
    }

    const lastEntry = history[history.length - 1]
    const timeSinceLastDisplay = Date.now() - lastEntry.timestamp
    
    return timeSinceLastDisplay >= this.config.rotationCooldown
  }

  /**
   * コンテンツを利用可能プールに戻す
   */
  private returnContentToPool(contentId: string, _type: 'song' | 'person' | 'tag'): void {
    // 既存のコンテンツアイテムを検索または再構築
    const contentItem = this.reconstructContentItem(contentId, _type)
    
    if (contentItem) {
      this.availableContent.set(contentId, contentItem)
      this.updateContentWeights(contentItem)
    }
  }

  /**
   * コンテンツアイテムを再構築
   */
  private reconstructContentItem(contentId: string, _type: 'song' | 'person' | 'tag'): ContentItem | null {
    // キャッシュから元のデータを取得
    const originalItem = this.originalContentCache.get(contentId)
    if (!originalItem) {
      return null // 元のデータが見つからない場合
    }

    const history = this.displayHistory.get(contentId)
    const displayCount = history ? history.length : 0
    const lastDisplayed = history && history.length > 0 ? 
      history[history.length - 1].timestamp : undefined
    
    // 元のデータをベースに表示履歴を更新
    return {
      ...originalItem,
      displayCount,
      lastDisplayed
    }
  }

  /**
   * 回転状態をリセット
   */
  private resetRotationState(): void {
    this.rotationState = {
      currentCycle: 0,
      completedCycles: 0,
      cycleStartTime: Date.now(),
      itemsInCurrentCycle: new Set(),
      forcedRotations: 0
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): ContentPoolStats & {
    rotationStats: RotationState
    averageDisplayDuration: number
    selectionEfficiency: number
  } {
    const baseStats = this.getBaseStats()
    const averageDisplayDuration = this.calculateAverageDisplayDuration()
    const selectionEfficiency = this.calculateSelectionEfficiency()
    
    return {
      ...baseStats,
      rotationStats: { ...this.rotationState },
      averageDisplayDuration,
      selectionEfficiency
    }
  }

  /**
   * 基本統計情報を取得
   */
  private getBaseStats(): ContentPoolStats {
    const availableItems = Array.from(this.availableContent.values())
    const displayedItems = Array.from(this.displayedContent.values())
    
    return {
      totalContent: this.availableContent.size + this.displayedContent.size,
      availableContent: availableItems.length,
      displayedContent: displayedItems.length,
      songCount: availableItems.filter(item => item.type === 'song').length,
      personCount: availableItems.filter(item => item.type === 'person').length,
      tagCount: availableItems.filter(item => item.type === 'tag').length,
      rotationCycle: this.rotationState.currentCycle
    }
  }

  /**
   * 平均表示時間を計算
   */
  private calculateAverageDisplayDuration(): number {
    let totalDuration = 0
    let totalEntries = 0
    
    for (const history of this.displayHistory.values()) {
      for (const entry of history) {
        totalDuration += entry.duration
        totalEntries++
      }
    }
    
    return totalEntries > 0 ? totalDuration / totalEntries : 0
  }

  /**
   * 選択効率を計算
   */
  private calculateSelectionEfficiency(): number {
    const totalSelections = this.rotationState.itemsInCurrentCycle.size
    const totalContent = this.availableContent.size + this.displayedContent.size
    
    return totalContent > 0 ? totalSelections / totalContent : 0
  }

  /**
   * 設定を更新
   */
  updateConfig(newConfig: Partial<BubbleRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.recalculateAllWeights()
  }

  /**
   * トラッカーをリセット
   */
  reset(): void {
    this.displayedContent.clear()
    this.availableContent.clear()
    this.displayHistory.clear()
    this.selectionWeights.clear()
    this.originalContentCache.clear()
    this.resetRotationState()
    this.currentTypeIndex = 0
    
    console.log('ContentTracker: Reset completed')
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo(): {
    displayedContent: DisplayedBubbleInfo[]
    availableContent: ContentItem[]
    rotationState: RotationState
    typeRotationQueue: Array<'song' | 'person' | 'tag'>
    currentTypeIndex: number
    selectionWeights: Map<string, SelectionWeights>
  } {
    return {
      displayedContent: Array.from(this.displayedContent.values()),
      availableContent: Array.from(this.availableContent.values()),
      rotationState: { ...this.rotationState },
      typeRotationQueue: [...this.typeRotationQueue],
      currentTypeIndex: this.currentTypeIndex,
      selectionWeights: new Map(this.selectionWeights)
    }
  }
}