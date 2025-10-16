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
  serverTimestamp
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

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService()
    }
    return FirebaseService.instance
  }

  /**
   * 楽曲をFirestoreに保存
   */
  public async addSong(song: Song, userId?: string): Promise<string | null> {
    try {
      const firebaseSong: FirebaseSong = {
        ...song,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        userId: userId || 'anonymous',
        isPublic: true
      }

      // idフィールドを除外
      const { id, ...songData } = firebaseSong

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), songData)
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
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseSong
        songs.push({
          id: doc.id,
          title: data.title,
          lyricists: data.lyricists,
          composers: data.composers,
          arrangers: data.arrangers,
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        })
      })

      console.log(`🔥 Firebase: ${songs.length}曲を取得しました`)
      return songs
    } catch (error) {
      console.error('🔥 Firebase: 楽曲取得エラー', error)
      return []
    }
  }

  /**
   * 楽曲を更新
   */
  public async updateSong(songId: string, updates: Partial<Song>): Promise<boolean> {
    try {
      const songRef = doc(db, this.COLLECTION_NAME, songId)
      await updateDoc(songRef, {
        ...updates,
        updatedAt: serverTimestamp()
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
      await deleteDoc(doc(db, this.COLLECTION_NAME, songId))
      console.log('🔥 Firebase: 楽曲を削除しました', songId)
      return true
    } catch (error) {
      console.error('🔥 Firebase: 楽曲削除エラー', error)
      return false
    }
  }

  /**
   * タグで楽曲を検索
   */
  public async getSongsByTag(tag: string): Promise<Song[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('tags', 'array-contains', tag),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseSong
        songs.push({
          id: doc.id,
          title: data.title,
          lyricists: data.lyricists,
          composers: data.composers,
          arrangers: data.arrangers,
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        })
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
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const songs: Song[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseSong
        songs.push({
          id: doc.id,
          title: data.title,
          lyricists: data.lyricists,
          composers: data.composers,
          arrangers: data.arrangers,
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        })
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
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const songs: Song[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseSong
        songs.push({
          id: doc.id,
          title: data.title,
          lyricists: data.lyricists,
          composers: data.composers,
          arrangers: data.arrangers,
          tags: data.tags || [],
          notes: data.notes || '',
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
        })
      })

      callback(songs)
    }, (error) => {
      console.error('🔥 Firebase: リアルタイム監視エラー', error)
    })

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
      version: '1.0.0'
    }
  }

  /**
   * 接続状態をチェック
   */
  public async checkConnection(): Promise<boolean> {
    try {
      // 空のクエリを実行して接続をテスト
      const q = query(collection(db, this.COLLECTION_NAME), limit(1))
      await getDocs(q)
      return true
    } catch (error) {
      console.error('🔥 Firebase: 接続エラー', error)
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
        recentSongsCount: recentSongs.length
      }
    } catch (error) {
      console.error('🔥 Firebase: 統計取得エラー', error)
      return {
        totalSongs: 0,
        totalTags: new Set(),
        recentSongsCount: 0
      }
    }
  }
}