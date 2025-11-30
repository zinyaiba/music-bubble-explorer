/**
 * Firebase Firestoreサービス
 * 楽曲データの保存・取得を管理
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { Song, MusicDatabase } from '@/types/music'

export interface FirebaseSong extends Omit<Song, 'id' | 'createdAt'> {
  id?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  userId?: string
  isPublic?: boolean
}

/**
 * Firebase Firestoreサービスクラス
 */
export class FirebaseService {
  private static instance: FirebaseService
  private readonly COLLECTION_NAME = 'songs'

  private constructor() {}

  /**
   * Firebaseのタイムスタンプを安全にISO文字列に変換
   */
  private convertTimestampToString(timestamp: any): string {
    try {
      if (timestamp && typeof timestamp.toDate === 'function') {
        // Timestampオブジェクトの場合
        return timestamp.toDate().toISOString()
      } else if (timestamp && typeof timestamp === 'string') {
        // 既に文字列の場合
        return timestamp
      } else if (timestamp && timestamp.seconds) {
        // Timestamp形式のオブジェクトの場合
        return new Date(timestamp.seconds * 1000).toISOString()
      } else {
        // その他の場合は現在時刻を使用
        return new Date().toISOString()
      }
    } catch (error) {
      console.warn('🔥 Firebase: Timestamp変換エラー:', error)
      return new Date().toISOString()
    }
  }

  /**
   * FirebaseSongをSongに変換
   */
  private convertFirebaseSongToSong(doc: any): Song {
    const data = doc.data() as FirebaseSong
    const song: Song = {
      id: doc.id,
      title: data.title || '',
      lyricists: data.lyricists || [],
      composers: data.composers || [],
      arrangers: data.arrangers || [],
      tags: data.tags || [],
      notes: data.notes || '',
      createdAt: this.convertTimestampToString(data.createdAt),
    }

    // 拡張フィールド - 値が存在する場合のみ追加
    if (data.artists) song.artists = data.artists
    if (data.releaseYear) song.releaseYear = data.releaseYear
    if (data.singleName) song.singleName = data.singleName
    if (data.albumName) song.albumName = data.albumName

    if (data.musicServiceEmbed) song.musicServiceEmbed = data.musicServiceEmbed

    if (data.detailPageUrls) song.detailPageUrls = data.detailPageUrls

    return song
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService()
    }
    return FirebaseService.instance
  }

  /**
   * Firebase設定が有効かチェック
   */
  private isFirebaseAvailable(): boolean {
    return db !== null
  }

  /**
   * 楽曲をFirestoreに保存
   */
  public async addSong(song: Song, userId?: string): Promise<string | null> {
    try {
      if (!this.isFirebaseAvailable() || !db) {
        console.log('🔥 Firebase: 設定が無効です')
        return null
      }

      // 重複チェック: 同じタイトルの楽曲が既に存在するかチェック
      const existingQuery = query(
        collection(db!, this.COLLECTION_NAME),
        where('title', '==', song.title.trim())
      )

      const existingSnapshot = await getDocs(existingQuery)
      if (!existingSnapshot.empty) {
        console.warn(
          '🔥 Firebase: 同じタイトルの楽曲が既に存在します:',
          song.title
        )
        // 既存の楽曲のIDを返す
        return existingSnapshot.docs[0].id
      }

      const firebaseSong: FirebaseSong = {
        ...song,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        userId: userId || 'anonymous',
        isPublic: true,
      }

      // idフィールドを除外し、undefinedフィールドも除外
      const { id: _id, ...songData } = firebaseSong

      // Firestoreはundefinedを受け付けないため、undefinedフィールドを削除
      const cleanedSongData = Object.fromEntries(
        Object.entries(songData).filter(([_, value]) => value !== undefined)
      )

      const docRef = await addDoc(
        collection(db!, this.COLLECTION_NAME),
        cleanedSongData
      )
      console.log('🔥 Firebase: 楽曲を保存しました', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('🔥 Firebase: 楽曲保存エラー', error)
      return null
    }
  }

  /**
   * 全ての楽曲を取得
   */
  public async getAllSongs(): Promise<Song[]> {
    try {
      if (!this.isFirebaseAvailable() || !db) {
        console.log('🔥 Firebase: 設定が無効です')
        return []
      }

      // シンプルなクエリに変更（インデックス不要）
      const q = query(
        collection(db!, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach(doc => {
        const data = doc.data() as FirebaseSong
        // isPublicがtrueまたは未設定の楽曲のみを含める
        if (data.isPublic !== false) {
          songs.push(this.convertFirebaseSongToSong(doc))
        }
      })

      // console.log(`🔥 Firebase: ${songs.length}曲を取得しました`)
      return songs
    } catch (error) {
      console.error('🔥 Firebase: 楽曲取得エラー', error)
      return []
    }
  }

  /**
   * 楽曲を更新
   */
  public async updateSong(
    songId: string,
    updates: Partial<Song>
  ): Promise<boolean> {
    try {
      if (!this.isFirebaseAvailable() || !db) {
        console.log('🔥 Firebase: 設定が無効です')
        return false
      }

      const songRef = doc(db!, this.COLLECTION_NAME, songId)

      // Firestoreはundefinedを受け付けないため、undefinedフィールドを削除
      const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      await updateDoc(songRef, {
        ...cleanedUpdates,
        updatedAt: serverTimestamp(),
      })

      console.log('🔥 Firebase: 楽曲を更新しました', songId)
      return true
    } catch (error) {
      console.error('🔥 Firebase: 楽曲更新エラー', error)
      return false
    }
  }

  /**
   * 楽曲を削除
   */
  public async deleteSong(songId: string): Promise<boolean> {
    try {
      // console.log('🔥 Firebase: 削除開始', songId)

      if (!this.isFirebaseAvailable() || !db) {
        console.log('🔥 Firebase: 設定が無効です')
        return false
      }

      if (!songId || songId.trim() === '') {
        console.error('🔥 Firebase: 無効なsongId', songId)
        return false
      }

      const docRef = doc(db!, this.COLLECTION_NAME, songId)
      console.log('🔥 Firebase: ドキュメント参照作成', docRef.path)

      await deleteDoc(docRef)
      // console.log('🔥 Firebase: 楽曲を削除しました', songId)
      return true
    } catch (error) {
      console.error('🔥 Firebase: 楽曲削除エラー', error)
      console.error('🔥 Firebase: エラー詳細', {
        songId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
      return false
    }
  }

  /**
   * タグで楽曲を検索
   */
  public async getSongsByTag(tag: string): Promise<Song[]> {
    try {
      // シンプルなクエリに変更（インデックス不要）
      const q = query(
        collection(db!, this.COLLECTION_NAME),
        where('tags', 'array-contains', tag)
      )

      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach(doc => {
        const data = doc.data() as FirebaseSong
        // isPublicがtrueまたは未設定の楽曲のみを含める
        if (data.isPublic !== false) {
          songs.push(this.convertFirebaseSongToSong(doc))
        }
      })

      return songs
    } catch (error) {
      console.error('🔥 Firebase: タグ検索エラー', error)
      return []
    }
  }

  /**
   * 最新の楽曲を取得（制限付き）
   */
  public async getRecentSongs(limitCount: number = 10): Promise<Song[]> {
    try {
      if (!this.isFirebaseAvailable() || !db) {
        console.log('🔥 Firebase: 設定が無効です')
        return []
      }

      // シンプルなクエリに変更（インデックス不要）
      const q = query(
        collection(db!, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )

      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach(doc => {
        const data = doc.data() as FirebaseSong
        // isPublicがtrueまたは未設定の楽曲のみを含める
        if (data.isPublic !== false) {
          songs.push(this.convertFirebaseSongToSong(doc))
        }
      })

      return songs
    } catch (error) {
      console.error('🔥 Firebase: 最新楽曲取得エラー', error)
      return []
    }
  }

  /**
   * リアルタイムで楽曲データを監視
   */
  public subscribeToSongs(callback: (songs: Song[]) => void): () => void {
    // シンプルなクエリに変更（インデックス不要）
    const q = query(
      collection(db!, this.COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      querySnapshot => {
        const songs: Song[] = []

        querySnapshot.forEach(doc => {
          const data = doc.data() as FirebaseSong
          // isPublicがtrueまたは未設定の楽曲のみを含める
          if (data.isPublic !== false) {
            songs.push(this.convertFirebaseSongToSong(doc))
          }
        })

        callback(songs)
      },
      error => {
        console.error('🔥 Firebase: リアルタイム監視エラー', error)
      }
    )

    return unsubscribe
  }

  /**
   * MusicDatabase形式でデータを取得
   */
  public async getMusicDatabase(): Promise<MusicDatabase> {
    const songs = await this.getAllSongs()

    return {
      songs,
      people: [], // Firebaseでは楽曲データのみを管理
      tags: [],
      lastUpdated: new Date().toISOString(),
      version: '1.0.0',
    }
  }

  /**
   * 接続状態をチェック
   */
  public async checkConnection(): Promise<boolean> {
    try {
      // Firebase設定が無効な場合は静かに失敗
      if (!db) {
        return false
      }

      if (!this.isFirebaseAvailable()) {
        return false
      }

      // 空のクエリを実行して接続をテスト（タイムアウト付き）
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      })

      const connectionPromise = (async () => {
        const q = query(collection(db!, this.COLLECTION_NAME), limit(1))
        await getDocs(q)
        return true
      })()

      await Promise.race([connectionPromise, timeoutPromise])
      return true
    } catch (error) {
      console.error('🔥 Firebase: 接続エラー', error)
      console.error('🔥 Firebase: エラー詳細:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined,
      })
      return false
    }
  }

  /**
   * 統計情報を取得
   */
  public async getStats(): Promise<{
    totalSongs: number
    totalTags: Set<string>
    recentSongsCount: number
  }> {
    try {
      const songs = await this.getAllSongs()
      const allTags = new Set<string>()

      songs.forEach(song => {
        song.tags?.forEach(tag => allTags.add(tag))
      })

      const recentSongs = songs.filter(song => {
        const songDate = new Date(song.createdAt || '')
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return songDate > weekAgo
      })

      return {
        totalSongs: songs.length,
        totalTags: allTags,
        recentSongsCount: recentSongs.length,
      }
    } catch (error) {
      console.error('🔥 Firebase: 統計取得エラー', error)
      return {
        totalSongs: 0,
        totalTags: new Set(),
        recentSongsCount: 0,
      }
    }
  }
}
