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

    // ランダムにエンティティタイプを選択
    const entityTypes = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const
    const selectedType = entityTypes[Math.floor(Math.random() * entityTypes.length)]

    if (selectedType === 'song') {
      return this.generateSongBubble()
    } else if (selectedType === 'tag') {
      return this.generateTagBubble()
    } else {
      // 人物の場合は役割別シャボン玉を生成
      return this.generatePersonRoleBubble(selectedType)
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

    const relatedCount = song.lyricists.length + song.composers.length + song.arrangers.length
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
    const tag = this.getTagManager().getWeightedRandomTag()
    if (!tag) {
      // タグがない場合は楽曲にフォールバック
      return this.generateSongBubble()
    }

    const relatedCount = tag.songs.length
    return this.createBasicBubble('tag', tag.name, relatedCount, CATEGORY_COLORS.tag)
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
    const relatedCount = roleSpecificSongs.length
    const color = CATEGORY_COLORS[role]

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
    const size = type === 'tag' 
      ? this.getTagManager().calculateTagBubbleSize(name)
      : this.calculateBubbleSize(relatedCount)

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
}