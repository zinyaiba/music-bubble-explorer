import { BubbleEntity } from '@/types/bubble'
import type { MusicDatabase, Song, BubbleType } from '@/types/music'
import { BubbleManager } from './bubbleManager'

/**
 * 役割別シャボン玉の色定義
 * Requirements: 19.2, 19.3 - カテゴリ別色分けシステム
 */
export const CATEGORY_COLORS = {
  song: '#FFB6C1',      // 楽曲 - ピンク
  lyricist: '#B6E5D8',  // 作詞家 - ライトブルー
  composer: '#DDA0DD',  // 作曲家 - ライトパープル
  arranger: '#F0E68C',  // 編曲家 - ライトイエロー
  tag: '#98FB98'        // タグ - ライトグリーン
} as const

/**
 * 人物の役割情報
 * Requirements: 19.1 - 同一人物の複数役割に対する一意シャボン玉生成
 */
export interface PersonRole {
  personName: string
  roles: Set<'lyricist' | 'composer' | 'arranger'>
  songs: string[]
  totalRelatedCount: number
}

/**
 * 役割別シャボン玉の一意識別子
 */
export interface RoleBasedBubbleId {
  personName: string
  role: 'lyricist' | 'composer' | 'arranger'
  uniqueId: string
}

/**
 * 役割別シャボン玉マネージャー
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5 - 役割別シャボン玉システムの実装
 */
export class RoleBasedBubbleManager extends BubbleManager {
  private personRoleMap: Map<string, PersonRole> = new Map()
  private displayedRoleBubbles: Set<string> = new Set()
  protected roleBasedConfig: any

  constructor(musicDatabase: MusicDatabase, config: any) {
    super(musicDatabase, config)
    this.roleBasedConfig = config
    this.buildPersonRoleMap()
    
    // デバッグ: データベースの状態をログ出力
    console.log('🫧 RoleBasedBubbleManager initialized with database:', {
      songs: musicDatabase.songs?.length || 0,
      people: musicDatabase.people?.length || 0,
      tags: musicDatabase.tags?.length || 0,
      maxBubbles: config.maxBubbles
    })
    
    // タグの詳細情報をログ出力
    if (musicDatabase.tags && musicDatabase.tags.length > 0) {
      console.log('🏷️ Available tags:', musicDatabase.tags.map(tag => `${tag.name} (${tag.songs.length} songs)`))
      
      // TagManagerの状態も確認
      const tagManager = this.getTagManager()
      const tagStats = tagManager.getTagStats()
      console.log('🏷️ TagManager stats:', tagStats)
      
      // ランダムタグ取得のテスト
      const testTag = tagManager.getWeightedRandomTag()
      console.log('🏷️ Test random tag:', testTag ? `${testTag.name} (${testTag.songs.length} songs)` : 'null')
    } else {
      console.log('🏷️ No tags found in database')
    }
  }

  /**
   * 人物の役割マップを構築
   * Requirements: 19.1 - 同一人物の複数役割の管理
   */
  private buildPersonRoleMap(): void {
    this.personRoleMap.clear()

    // 全楽曲から人物の役割を抽出
    this.musicDatabase.songs.forEach(song => {
      // 作詞家
      song.lyricists.forEach(lyricist => {
        this.addPersonRole(lyricist, 'lyricist', song.id)
      })

      // 作曲家
      song.composers.forEach(composer => {
        this.addPersonRole(composer, 'composer', song.id)
      })

      // 編曲家
      song.arrangers.forEach(arranger => {
        this.addPersonRole(arranger, 'arranger', song.id)
      })
    })

    console.log('Person role map built:', {
      totalPersons: this.personRoleMap.size,
      multiRolePersons: Array.from(this.personRoleMap.values())
        .filter(person => person.roles.size > 1).length
    })
  }

  /**
   * 人物の役割を追加
   */
  private addPersonRole(personName: string, role: 'lyricist' | 'composer' | 'arranger', songId: string): void {
    let personRole = this.personRoleMap.get(personName)
    
    if (!personRole) {
      personRole = {
        personName,
        roles: new Set(),
        songs: [],
        totalRelatedCount: 0
      }
      this.personRoleMap.set(personName, personRole)
    }

    personRole.roles.add(role)
    if (!personRole.songs.includes(songId)) {
      personRole.songs.push(songId)
      personRole.totalRelatedCount = personRole.songs.length
    }
  }

  /**
   * 役割別の一意シャボン玉を生成
   * Requirements: 19.1, 19.2 - 同一人物の複数役割に対する一意シャボン玉生成機能
   */
  generateUniqueRoleBubbles(personName: string): BubbleEntity[] {
    const personRole = this.personRoleMap.get(personName)
    if (!personRole) {
      return []
    }

    const bubbles: BubbleEntity[] = []

    // 各役割に対して個別のシャボン玉を生成
    personRole.roles.forEach(role => {
      const uniqueId = this.createRoleBasedId(personName, role)
      
      // 既に表示されている場合はスキップ
      if (this.displayedRoleBubbles.has(uniqueId)) {
        return
      }

      // 役割別のシャボン玉を生成
      const bubble = this.createRoleBasedBubble(personName, role, personRole)
      if (bubble) {
        bubbles.push(bubble)
        this.displayedRoleBubbles.add(uniqueId)
      }
    })

    return bubbles
  }

  /**
   * 役割別の一意IDを作成
   */
  private createRoleBasedId(personName: string, role: 'lyricist' | 'composer' | 'arranger'): string {
    return `${personName}:${role}`
  }

  /**
   * 役割別シャボン玉を作成
   * Requirements: 19.2, 19.3 - カテゴリ別色分けシステム
   */
  private createRoleBasedBubble(
    personName: string, 
    role: 'lyricist' | 'composer' | 'arranger', 
    _personRole: PersonRole
  ): BubbleEntity | null {
    try {
      // 役割に応じた関連楽曲数を計算
      const roleSpecificSongs = this.getRoleSpecificSongs(personName, role)
      const relatedCount = roleSpecificSongs.length

      // シャボン玉のサイズを計算
      const size = this.calculateBubbleSize(relatedCount)

      // 初期位置と速度を設定
      const margin = size / 2
      const x = margin + Math.random() * (this.roleBasedConfig.canvasWidth - size)
      const y = margin + Math.random() * (this.roleBasedConfig.canvasHeight - size)
      
      const initialSpeed = this.roleBasedConfig.maxVelocity * 0.3
      const angle = Math.random() * Math.PI * 2
      const vx = Math.cos(angle) * initialSpeed * (Math.random() * 0.5 + 0.5)
      const vy = Math.sin(angle) * initialSpeed * (Math.random() * 0.5 + 0.5) - 5

      // 役割に応じた色を選択
      const color = CATEGORY_COLORS[role]

      // ライフスパンを設定
      const lifespan = this.roleBasedConfig.minLifespan + 
        Math.random() * (this.roleBasedConfig.maxLifespan - this.roleBasedConfig.minLifespan)

      // 役割別の一意IDを設定
      const uniqueId = this.createRoleBasedId(personName, role)

      // BubbleEntityを作成
      const bubble = new BubbleEntity({
        type: role,
        name: personName,
        x,
        y,
        vx,
        vy,
        size,
        color,
        opacity: 1,
        lifespan,
        relatedCount
      })

      // 一意IDを設定（BubbleEntityのidを上書き）
      bubble.id = uniqueId

      return bubble
    } catch (error) {
      console.error('Failed to create role-based bubble:', error)
      return null
    }
  }

  /**
   * 指定された人物と役割に関連する楽曲を取得
   */
  private getRoleSpecificSongs(personName: string, role: 'lyricist' | 'composer' | 'arranger'): Song[] {
    return this.musicDatabase.songs.filter(song => {
      switch (role) {
        case 'lyricist':
          return song.lyricists.includes(personName)
        case 'composer':
          return song.composers.includes(personName)
        case 'arranger':
          return song.arrangers.includes(personName)
        default:
          return false
      }
    })
  }

  /**
   * 重複防止ロジック
   * Requirements: 19.5 - 重複防止ロジックの強化
   */
  preventDuplicateDisplay(bubbles: BubbleEntity[]): BubbleEntity[] {
    const uniqueBubbles: BubbleEntity[] = []
    const seenIds = new Set<string>()

    bubbles.forEach(bubble => {
      // 役割別の一意IDをチェック
      if (bubble.type === 'lyricist' || bubble.type === 'composer' || bubble.type === 'arranger') {
        const uniqueId = this.createRoleBasedId(bubble.name, bubble.type)
        if (!seenIds.has(uniqueId)) {
          seenIds.add(uniqueId)
          uniqueBubbles.push(bubble)
        }
      } else {
        // 楽曲やタグの場合は通常の重複チェック
        if (!seenIds.has(bubble.id)) {
          seenIds.add(bubble.id)
          uniqueBubbles.push(bubble)
        }
      }
    })

    return uniqueBubbles
  }

  /**
   * カテゴリ別色分けを適用
   * Requirements: 19.3 - カテゴリ別色分けシステム
   */
  assignCategoryColors(bubbles: BubbleEntity[]): BubbleEntity[] {
    return bubbles.map(bubble => {
      const updatedBubble = bubble.clone()
      
      // カテゴリに応じた色を設定
      if (CATEGORY_COLORS[bubble.type as keyof typeof CATEGORY_COLORS]) {
        updatedBubble.color = CATEGORY_COLORS[bubble.type as keyof typeof CATEGORY_COLORS]
      }

      return updatedBubble
    })
  }

  /**
   * 改良されたシャボン玉生成（役割別対応）
   * Requirements: 19.1, 19.2 - 役割別一意シャボン玉生成
   */
  generateBubble(): BubbleEntity {
    // データベースが空の場合は例外を投げる
    if (!this.musicDatabase.songs || this.musicDatabase.songs.length === 0) {
      throw new Error('Cannot generate bubble: No songs available in database')
    }

    // より均等な分散のためのタイプ選択（タグの確率を上げる）
    const entityTypes = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const
    
    // タグが存在する場合は確率を調整
    const hasTagsAvailable = this.musicDatabase.tags && this.musicDatabase.tags.length > 0
    let selectedType: typeof entityTypes[number]
    
    if (hasTagsAvailable) {
      // 現在のシャボン玉にタグが含まれているかチェック
      const currentBubbles = this.getBubbles()
      const hasTagBubbles = currentBubbles.some(bubble => bubble.type === 'tag')
      
      if (!hasTagBubbles && Math.random() < 0.5) {
        // タグのシャボン玉がない場合は50%の確率でタグを強制選択
        selectedType = 'tag'
        console.log('🏷️ Forcing tag bubble generation (no tag bubbles currently displayed)')
      } else {
        // 通常の均等分散
        selectedType = entityTypes[Math.floor(Math.random() * entityTypes.length)]
        // ログを制限（開発環境でのみ、10%の確率で表示）
        if (import.meta.env.DEV && Math.random() < 0.1) {
          console.log('🫧 Selected bubble type:', selectedType, '(normal distribution)')
        }
      }
    } else {
      // タグが利用できない場合：楽曲と人物のみ
      const availableTypes = ['song', 'lyricist', 'composer', 'arranger'] as const
      selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
      // ログを制限（開発環境でのみ、10%の確率で表示）
      if (import.meta.env.DEV && Math.random() < 0.1) {
        console.log('🫧 Selected bubble type:', selectedType, '(no tags available)')
      }
    }

    try {
      if (selectedType === 'song') {
        return this.generateSongBubble()
      } else if (selectedType === 'tag') {
        return this.generateTagBubble()
      } else {
        // 人物の場合は役割別シャボン玉を生成
        return this.generatePersonRoleBubble(selectedType)
      }
    } catch (error) {
      console.warn(`Failed to generate ${selectedType} bubble, falling back to song:`, error)
      // エラーが発生した場合は楽曲にフォールバック
      return this.generateSongBubble()
    }
  }

  /**
   * 楽曲シャボン玉を生成
   */
  private generateSongBubble(): BubbleEntity {
    const song = this.getRandomSongFromDatabase()
    if (!song) {
      throw new Error('Cannot generate bubble: No songs available')
    }

    // 関連楽曲数を計算（作詞家、作曲家、編曲家の合計 + タグ数）
    const peopleCount = song.lyricists.length + song.composers.length + song.arrangers.length
    const tagCount = song.tags ? song.tags.length : 0
    const relatedCount = Math.max(1, peopleCount + tagCount) // 最低1にする
    
    // ログを制限（開発環境でのみ、10%の確率で表示）
    if (import.meta.env.DEV && Math.random() < 0.1) {
      console.log(`🎵 Song bubble: "${song.title}" - people: ${peopleCount}, tags: ${tagCount}, total: ${relatedCount}`)
    }
    
    return this.createBasicBubble('song', song.title, relatedCount, CATEGORY_COLORS.song)
  }

  /**
   * ランダムな楽曲を取得（プライベートメソッドの代替）
   */
  private getRandomSongFromDatabase() {
    const songs = this.musicDatabase.songs
    if (!songs || songs.length === 0) {
      return null
    }
    return songs[Math.floor(Math.random() * songs.length)]
  }

  /**
   * タグシャボン玉を生成
   */
  private generateTagBubble(): BubbleEntity {
    console.log('🏷️ Attempting to generate tag bubble...')
    
    try {
      // まずデータベースから直接タグを確認
      console.log('🏷️ Database tags:', this.musicDatabase.tags?.length || 0)
      
      if (!this.musicDatabase.tags || this.musicDatabase.tags.length === 0) {
        console.log('🏷️ No tags in database, falling back to song')
        return this.generateSongBubble()
      }
      
      // データベースから直接ランダムタグを選択
      const randomTag = this.musicDatabase.tags[Math.floor(Math.random() * this.musicDatabase.tags.length)]
      console.log('🏷️ Selected tag from database:', randomTag.name, 'with', randomTag.songs.length, 'songs')
      
      const relatedCount = Math.max(1, randomTag.songs.length)
      
      // createBasicBubbleを使わずに直接作成（エラー回避）
      const size = 80 // 固定サイズを使用してエラーを回避
      const margin = size / 2
      const x = margin + Math.random() * (this.roleBasedConfig.canvasWidth - size)
      const y = margin + Math.random() * (this.roleBasedConfig.canvasHeight - size)
      
      const initialSpeed = this.roleBasedConfig.maxVelocity * 0.3
      const angle = Math.random() * Math.PI * 2
      const vx = Math.cos(angle) * initialSpeed * (Math.random() * 0.5 + 0.5)
      const vy = Math.sin(angle) * initialSpeed * (Math.random() * 0.5 + 0.5) - 5

      const lifespan = this.roleBasedConfig.minLifespan + 
        Math.random() * (this.roleBasedConfig.maxLifespan - this.roleBasedConfig.minLifespan)

      const bubble = new BubbleEntity({
        type: 'tag',
        name: randomTag.name,
        x,
        y,
        vx,
        vy,
        size,
        color: CATEGORY_COLORS.tag,
        opacity: 1,
        lifespan,
        relatedCount
      })
      
      console.log('🏷️ Successfully created tag bubble:', bubble.name)
      return bubble
      
    } catch (error) {
      console.error('🏷️ Error generating tag bubble:', error)
      console.log('🏷️ Falling back to song bubble')
      return this.generateSongBubble()
    }
  }

  /**
   * 人物役割シャボン玉を生成
   */
  private generatePersonRoleBubble(role: 'lyricist' | 'composer' | 'arranger'): BubbleEntity {
    // 指定された役割を持つ人物をランダム選択
    const peopleWithRole = Array.from(this.personRoleMap.values())
      .filter(person => person.roles.has(role))

    if (peopleWithRole.length === 0) {
      // 該当する人物がいない場合は楽曲にフォールバック
      return this.generateSongBubble()
    }

    const randomPerson = peopleWithRole[Math.floor(Math.random() * peopleWithRole.length)]
    const uniqueId = this.createRoleBasedId(randomPerson.personName, role)

    // 既に表示されている場合は別の人物を選択
    if (this.displayedRoleBubbles.has(uniqueId)) {
      const availablePeople = peopleWithRole.filter(person => 
        !this.displayedRoleBubbles.has(this.createRoleBasedId(person.personName, role))
      )
      
      if (availablePeople.length === 0) {
        // 全ての人物が表示済みの場合は楽曲にフォールバック
        return this.generateSongBubble()
      }

      const availablePerson = availablePeople[Math.floor(Math.random() * availablePeople.length)]
      return this.createRoleBasedBubbleFromPerson(availablePerson, role)
    }

    return this.createRoleBasedBubbleFromPerson(randomPerson, role)
  }

  /**
   * PersonRoleからシャボン玉を作成
   */
  private createRoleBasedBubbleFromPerson(personRole: PersonRole, role: 'lyricist' | 'composer' | 'arranger'): BubbleEntity {
    const roleSpecificSongs = this.getRoleSpecificSongs(personRole.personName, role)
    const relatedCount = Math.max(1, roleSpecificSongs.length) // 最低1にする
    const color = CATEGORY_COLORS[role]

    // ログを制限（開発環境でのみ、10%の確率で表示）
    if (import.meta.env.DEV && Math.random() < 0.1) {
      console.log(`👤 Person bubble: "${personRole.personName}" as ${role} - songs: ${roleSpecificSongs.length}`)
    }

    const bubble = this.createBasicBubble(role, personRole.personName, relatedCount, color)
    
    // 役割別の一意IDを設定
    const uniqueId = this.createRoleBasedId(personRole.personName, role)
    bubble.id = uniqueId
    this.displayedRoleBubbles.add(uniqueId)

    return bubble
  }

  /**
   * 基本的なシャボン玉を作成
   */
  private createBasicBubble(type: BubbleType, name: string, relatedCount: number, color: string): BubbleEntity {
    // サイズ計算のデバッグログを制限
    let size: number
    if (type === 'tag') {
      size = this.getTagManager().calculateTagBubbleSize(name)
      // タグの場合は常にログ出力（重要な情報のため）
      if (import.meta.env.DEV) {
        console.log(`🏷️ Tag bubble size: ${name} -> ${size}px (relatedCount: ${relatedCount})`)
      }
    } else {
      size = this.calculateBubbleSize(relatedCount)
      // 他のタイプは10%の確率でのみログ出力
      if (import.meta.env.DEV && Math.random() < 0.1) {
        console.log(`🫧 ${type} bubble size: ${name} -> ${size}px (relatedCount: ${relatedCount})`)
      }
    }

    const margin = size / 2
    const x = margin + Math.random() * (this.roleBasedConfig.canvasWidth - size)
    const y = margin + Math.random() * (this.roleBasedConfig.canvasHeight - size)
    
    const initialSpeed = this.roleBasedConfig.maxVelocity * 0.3
    const angle = Math.random() * Math.PI * 2
    const vx = Math.cos(angle) * initialSpeed * (Math.random() * 0.5 + 0.5)
    const vy = Math.sin(angle) * initialSpeed * (Math.random() * 0.5 + 0.5) - 5

    const lifespan = this.roleBasedConfig.minLifespan + 
      Math.random() * (this.roleBasedConfig.maxLifespan - this.roleBasedConfig.minLifespan)

    return new BubbleEntity({
      type,
      name,
      x,
      y,
      vx,
      vy,
      size,
      color,
      opacity: 1,
      lifespan,
      relatedCount
    })
  }

  /**
   * シャボン玉削除時の処理（役割別対応）
   */
  removeBubble(id: string): void {
    // 表示済みリストから削除
    this.displayedRoleBubbles.delete(id)
    
    // 親クラスの削除処理を呼び出し
    super.removeBubble(id)
  }

  /**
   * 音楽データベース更新時の処理（役割別対応）
   */
  updateMusicDatabase(newMusicDatabase: MusicDatabase): void {
    // 親クラスの更新処理を呼び出し
    super.updateMusicDatabase(newMusicDatabase)
    
    // 役割マップを再構築
    this.buildPersonRoleMap()
    
    // 表示済みリストをクリア
    this.displayedRoleBubbles.clear()
  }

  /**
   * 役割別統計情報を取得
   */
  getRoleBasedStats() {
    const baseStats = this.getStats()
    
    const multiRolePersons = Array.from(this.personRoleMap.values())
      .filter(person => person.roles.size > 1)

    const roleDistribution = {
      lyricistOnly: 0,
      composerOnly: 0,
      arrangerOnly: 0,
      multiRole: multiRolePersons.length
    }

    this.personRoleMap.forEach(person => {
      if (person.roles.size === 1) {
        const role = Array.from(person.roles)[0]
        switch (role) {
          case 'lyricist':
            roleDistribution.lyricistOnly++
            break
          case 'composer':
            roleDistribution.composerOnly++
            break
          case 'arranger':
            roleDistribution.arrangerOnly++
            break
        }
      }
    })

    return {
      ...baseStats,
      totalPersons: this.personRoleMap.size,
      displayedRoleBubbles: this.displayedRoleBubbles.size,
      roleDistribution,
      multiRolePersons: multiRolePersons.map(person => ({
        name: person.personName,
        roles: Array.from(person.roles),
        songCount: person.songs.length
      }))
    }
  }

  /**
   * 表示済みシャボン玉をクリア
   */
  clearDisplayedBubbles(): void {
    this.displayedRoleBubbles.clear()
    super.clearAllBubbles()
  }

  /**
   * 設定を更新（オーバーライド）
   */
  updateConfig(newConfig: Partial<any>): void {
    this.roleBasedConfig = { ...this.roleBasedConfig, ...newConfig }
    super.updateConfig(newConfig)
  }

  /**
   * シャボン玉設定を更新
   */
  updateBubbleSettings(newSettings: any): void {
    super.updateBubbleSettings(newSettings)
  }

  /**
   * アニメーションフレーム更新（役割別対応・制限強化版）
   */
  updateFrame(): BubbleEntity[] {
    try {
      const updatedBubbles = super.updateFrame()
      
      // 役割別シャボン玉の制限を厳格に適用
      if (updatedBubbles.length > this.roleBasedConfig.maxBubbles) {
        // ログを制限（重要な情報だが頻繁すぎるため）
        if (import.meta.env.DEV && Math.random() < 0.2) {
          console.log(`🫧 Role-based bubble count exceeded: ${updatedBubbles.length} > ${this.roleBasedConfig.maxBubbles}`)
        }
        
        // 超過分を削除（古いものから）
        const excessCount = updatedBubbles.length - this.roleBasedConfig.maxBubbles
        for (let i = 0; i < excessCount; i++) {
          const bubbleToRemove = updatedBubbles.shift()
          if (bubbleToRemove) {
            try {
              this.removeBubble(bubbleToRemove.id)
            } catch (error) {
              console.warn('Error removing excess bubble:', error)
            }
          }
        }
      }
      
      return updatedBubbles.slice(0, this.roleBasedConfig.maxBubbles)
    } catch (error) {
      // エラーが発生した場合は親クラスの結果をそのまま返す
      console.warn('Error in role-based updateFrame, falling back to parent:', error)
      return super.updateFrame()
    }
  }
}