import { MusicDatabase, Song, Person, Tag } from '@/types/music'
// import { DataManager } from '@/services/dataManager'
import { SharedDataService } from '@/services/sharedDataService'

/**
 * 楽曲データを読み込むサービス（超簡素化版）
 */
export class MusicDataService {
  private static instance: MusicDataService
  private musicDatabase: MusicDatabase

  private constructor() {
    this.musicDatabase = this.initializeDatabase()
    
    // Firebase専用モードの初期化（34.3対応）
    this.initializeFirebaseOnlyMode()
  }

  /**
   * Firebase専用モードの初期化（34.3対応）
   */
  private async initializeFirebaseOnlyMode(): Promise<void> {
    try {
      // ローカルストレージからFirebaseへの移行を実行
      const { DataManager } = await import('@/services/dataManager')
      const migrationResult = await DataManager.migrateToFirebaseOnly()
      
      if (migrationResult.success) {
        // console.log(`🔥 Successfully migrated ${migrationResult.migratedSongs} songs to Firebase-only mode`)
      } else {
        console.warn('🔥 Migration to Firebase-only mode had errors:', migrationResult.errors)
      }
    } catch (error) {
      console.warn('🔥 Failed to initialize Firebase-only mode:', error)
    }
  }

  /**
   * データベースの初期化（34.3対応: Firebase専用）
   */
  private initializeDatabase(): MusicDatabase {
    try {
      // console.log('🔄 Initializing music database (Firebase-only mode)...')

      // Firebase専用モードでは空のデータベースから開始
      // 実際のデータはloadFromFirebase()で読み込む
      const emptyDatabase: MusicDatabase = {
        songs: [],
        people: [],
        tags: []
      }

      // console.log('✅ Empty database initialized, will load from Firebase')
      return emptyDatabase
    } catch (error) {
      console.error('❌ Failed to initialize music database:', error)

      // エラーが発生した場合も空のデータベースを返す
      const emptyDatabase: MusicDatabase = {
        songs: [],
        people: [],
        tags: []
      }

      console.log('🔄 Using empty database due to error')
      return emptyDatabase
    }
  }

  /**
   * 共有データベースから最新データを取得して更新
   */
  public async loadFromSharedDatabase(): Promise<boolean> {
    try {
      // console.log('🔄 Loading from shared database...')
      
      const sharedDataService = SharedDataService.getInstance()
      const sharedDatabase = await sharedDataService.getSharedDatabase()
      
      // 共有データベースからデータを更新
      this.musicDatabase = {
        songs: sharedDatabase.songs || [],
        people: sharedDatabase.people || [],
        tags: sharedDatabase.tags || []
      }

      console.log('✅ Shared database loaded successfully:', {
        songs: this.musicDatabase.songs.length,
        people: this.musicDatabase.people.length,
        tags: this.musicDatabase.tags.length
      })

      return true
    } catch (error) {
      console.error('❌ Failed to load from shared database:', error)
      return false
    }
  }

  /**
   * Firebaseから最新データを取得して更新
   */
  public async loadFromFirebase(): Promise<boolean> {
    try {
      // console.log('🔥 Loading from Firebase...')
      
      const { FirebaseService } = await import('@/services/firebaseService')
      const firebaseService = FirebaseService.getInstance()
      
      // Firebase接続チェック
      const isConnected = await firebaseService.checkConnection()
      if (!isConnected) {
        console.warn('🔥 Firebase not connected, skipping Firebase load')
        return false
      }
      
      // Firebaseからデータを取得
      const firebaseDatabase = await firebaseService.getMusicDatabase()
      
      // Firebaseデータでデータベースを更新
      this.musicDatabase = {
        songs: firebaseDatabase.songs || [],
        people: firebaseDatabase.people || [],
        tags: firebaseDatabase.tags || []
      }

      // console.log('🔥 Firebase database loaded successfully:', {
      //   songs: this.musicDatabase.songs.length,
      //   people: this.musicDatabase.people.length,
      //   tags: this.musicDatabase.tags.length
      // })

      return true
    } catch (error) {
      console.error('🔥 Failed to load from Firebase:', error)
      return false
    }
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): MusicDataService {
    if (!MusicDataService.instance) {
      MusicDataService.instance = new MusicDataService()
    }
    return MusicDataService.instance
  }

  /**
   * 全楽曲データを取得
   */
  public getAllSongs(): Song[] {
    return this.musicDatabase.songs
  }

  /**
   * 全人物データを取得
   */
  public getAllPeople(): Person[] {
    return this.musicDatabase.people
  }

  /**
   * 全タグデータを取得
   */
  public getAllTags(): Tag[] {
    return this.musicDatabase.tags
  }

  /**
   * 楽曲IDから楽曲データを取得
   */
  public getSongById(id: string): Song | undefined {
    return this.musicDatabase.songs.find(song => song.id === id)
  }

  /**
   * 人物IDから人物データを取得
   */
  public getPersonById(id: string): Person | undefined {
    return this.musicDatabase.people.find(person => person.id === id)
  }

  /**
   * タグIDからタグデータを取得
   */
  public getTagById(id: string): Tag | undefined {
    return this.musicDatabase.tags.find(tag => tag.id === id)
  }

  /**
   * タグ名からタグデータを取得
   */
  public getTagByName(name: string): Tag | undefined {
    return this.musicDatabase.tags.find(tag => tag.name === name)
  }

  /**
   * 楽曲に関連する人物を取得
   */
  public getPeopleForSong(songId: string): Person[] {
    return this.musicDatabase.people.filter(person =>
      person.songs.includes(songId)
    )
  }

  /**
   * 人物に関連する楽曲を取得
   */
  public getSongsForPerson(personId: string): Song[] {
    const person = this.getPersonById(personId)
    if (!person) return []

    return this.musicDatabase.songs.filter(song =>
      person.songs.includes(song.id)
    )
  }

  /**
   * タグの関連楽曲数を取得（シャボン玉サイズ計算用）
   */
  public getRelatedCountForTag(tagName: string): number {
    const tag = this.getTagByName(tagName)
    return tag ? tag.songs.length : 0
  }

  /**
   * 楽曲の関連人物数を取得（シャボン玉サイズ計算用）
   */
  public getRelatedCountForSong(songId: string): number {
    const people = this.getPeopleForSong(songId)
    return people.length
  }

  /**
   * 人物の関連楽曲数を取得（シャボン玉サイズ計算用）
   */
  public getRelatedCountForPerson(personId: string): number {
    const person = this.getPersonById(personId)
    return person ? person.songs.length : 0
  }

  /**
   * 人物の協力者を取得（同じ楽曲に関わった他の人物）
   */
  public getCollaborators(personId: string): Person[] {
    const person = this.getPersonById(personId)
    if (!person) return []

    const collaborators = new Set<string>()

    // この人物が関わった楽曲を取得
    const personSongs = this.getSongsForPerson(personId)

    // 各楽曲について、他の関係者を探す
    personSongs.forEach(song => {
      const relatedPeople = this.getPeopleForSong(song.id)
      relatedPeople.forEach(relatedPerson => {
        if (relatedPerson.id !== personId) {
          collaborators.add(relatedPerson.id)
        }
      })
    })

    // 協力者のPersonオブジェクトを返す
    return Array.from(collaborators)
      .map(id => this.getPersonById(id))
      .filter((person): person is Person => person !== undefined)
  }

  /**
   * タグに関連する楽曲を取得
   */
  public getSongsForTag(tagName: string): Song[] {
    const tag = this.getTagByName(tagName)
    if (!tag) return []

    return this.musicDatabase.songs.filter(song =>
      tag.songs.includes(song.id)
    )
  }

  /**
   * 人物名から人物データを検索（複数の役割を持つ場合は全て取得）
   */
  public getPeopleByName(name: string): Person[] {
    return this.musicDatabase.people.filter(person => person.name === name)
  }

  /**
   * データベースが空かどうかをチェック
   */
  public isEmpty(): boolean {
    return this.musicDatabase.songs.length === 0
  }

  /**
   * データベースの妥当性を検証
   * 空のデータベースも有効とする
   */
  public validateDatabase(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // データベース構造の基本的な妥当性のみをチェック
    if (!Array.isArray(this.musicDatabase.songs)) {
      errors.push('Songs array is invalid')
    }

    if (!Array.isArray(this.musicDatabase.people)) {
      errors.push('People array is invalid')
    }

    if (!Array.isArray(this.musicDatabase.tags)) {
      errors.push('Tags array is invalid')
    }

    // 空のデータベースは有効とする
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * データセット情報を取得
   */
  public getDatasetInfo() {
    const songCount = this.musicDatabase.songs.length
    const peopleCount = this.musicDatabase.people.length
    const isLargeDataset = songCount >= 100
    const estimatedBubbleCount = songCount + Math.min(peopleCount, songCount * 2)

    return {
      songCount,
      peopleCount,
      isLargeDataset,
      estimatedBubbleCount
    }
  }

  /**
   * エラーからの復旧を試行
   */
  public async recoverFromError(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to recover from error...')

      // データベースを再初期化
      this.musicDatabase = this.initializeDatabase()

      // 基本的な検証
      const validation = this.validateDatabase()
      if (validation.isValid) {
        console.log('✅ Recovery successful')
        return true
      } else {
        console.warn('⚠️ Recovery partially successful, but validation failed:', validation.errors)
        return false
      }
    } catch (error) {
      console.error('❌ Recovery failed:', error)
      return false
    }
  }

  /**
   * 関連タグを取得（同じ楽曲を共有するタグ）
   */
  public getRelatedTags(tagName: string): Tag[] {
    const targetTag = this.getTagByName(tagName)
    if (!targetTag) return []

    const relatedTags: Tag[] = []
    const allTags = this.getAllTags()

    for (const tag of allTags) {
      if (tag.name === tagName) continue

      // 共通の楽曲があるかチェック
      const hasCommonSongs = tag.songs.some(songId => targetTag.songs.includes(songId))
      if (hasCommonSongs) {
        relatedTags.push(tag)
      }
    }

    return relatedTags.sort((a, b) => b.songs.length - a.songs.length)
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    console.log('🔄 Clearing cache and reinitializing...')
    this.musicDatabase = this.initializeDatabase()
  }

  /**
   * Firebase専用モードかどうかをチェック（34.3対応）
   */
  public isFirebaseOnlyMode(): boolean {
    // ローカルストレージにデータがない場合はFirebase専用モード
    try {
      const { DataManager } = require('@/services/dataManager')
      const localData = DataManager.loadStorageData()
      return localData.songs.length === 0
    } catch (error) {
      return true // エラーの場合もFirebase専用モードとみなす
    }
  }

  /**
   * データベース統計を取得
   */
  public getDatabaseStats() {
    const songs = this.getAllSongs()
    const people = this.getAllPeople()

    // 楽曲あたりの平均協力者数を計算
    const totalCollaborators = songs.reduce((sum, song) => {
      return sum + this.getPeopleForSong(song.id).length
    }, 0)
    const averageCollaboratorsPerSong = songs.length > 0 ? totalCollaborators / songs.length : 0

    // 人物あたりの平均楽曲数を計算
    const totalSongs = people.reduce((sum, person) => sum + person.songs.length, 0)
    const averageSongsPerPerson = people.length > 0 ? totalSongs / people.length : 0

    // 最多楽曲関与者を見つける
    const mostProductivePerson = people.reduce((max, person) => {
      return person.songs.length > (max?.songs.length || 0) ? person : max
    }, null as Person | null)

    return {
      totalSongs: songs.length,
      totalPeople: people.length,
      averageCollaboratorsPerSong,
      averageSongsPerPerson,
      mostProductivePerson: mostProductivePerson ? {
        name: mostProductivePerson.name,
        songCount: mostProductivePerson.songs.length
      } : null
    }
  }
}