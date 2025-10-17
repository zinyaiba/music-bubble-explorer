/**
 * 共有データサービス
 * 全ユーザー間でのデータ共有を管理
 */

import { MusicDatabase, Song } from '@/types/music'

/**
 * データ共有の選択肢
 */
export enum DataSharingMethod {
  LOCAL_ONLY = 'local_only',           // LocalStorageのみ（現在の方式）
  GITHUB_ISSUES = 'github_issues',     // GitHub Issues経由
  FIREBASE = 'firebase',               // Firebase Firestore
  SUPABASE = 'supabase',              // Supabase
  JSON_FILE = 'json_file'             // JSONファイル + GitHub Actions
}

/**
 * 共有データ設定
 */
interface SharedDataConfig {
  method: DataSharingMethod
  githubRepo?: string
  firebaseConfig?: any
  supabaseConfig?: any
}

/**
 * 共有データサービスクラス
 */
export class SharedDataService {
  private static instance: SharedDataService
  private config: SharedDataConfig

  private constructor() {
    // デフォルトはローカルのみ
    this.config = {
      method: DataSharingMethod.LOCAL_ONLY
    }
  }

  public static getInstance(): SharedDataService {
    if (!SharedDataService.instance) {
      SharedDataService.instance = new SharedDataService()
    }
    return SharedDataService.instance
  }

  /**
   * 共有方式を設定
   */
  public configure(config: SharedDataConfig): void {
    this.config = config
    console.log('🔧 Shared data service configured:', config.method)
  }

  /**
   * 楽曲を共有データベースに追加
   */
  public async addSongToShared(song: Song): Promise<boolean> {
    switch (this.config.method) {
      case DataSharingMethod.LOCAL_ONLY:
        return this.addSongLocal(song)
      
      case DataSharingMethod.GITHUB_ISSUES:
        return this.addSongViaGitHubIssues(song)
      
      case DataSharingMethod.FIREBASE:
        return this.addSongViaFirebase(song)
      
      case DataSharingMethod.SUPABASE:
        return this.addSongViaSupabase(song)
      
      case DataSharingMethod.JSON_FILE:
        return this.addSongViaJsonFile(song)
      
      default:
        return this.addSongLocal(song)
    }
  }

  /**
   * 共有データベースから全楽曲を取得
   */
  public async getSharedDatabase(): Promise<MusicDatabase> {
    switch (this.config.method) {
      case DataSharingMethod.LOCAL_ONLY:
        return this.getDatabaseLocal()
      
      case DataSharingMethod.GITHUB_ISSUES:
        return this.getDatabaseFromGitHubIssues()
      
      case DataSharingMethod.FIREBASE:
        return this.getDatabaseFromFirebase()
      
      case DataSharingMethod.SUPABASE:
        return this.getDatabaseFromSupabase()
      
      case DataSharingMethod.JSON_FILE:
        return this.getDatabaseFromJsonFile()
      
      default:
        return this.getDatabaseLocal()
    }
  }

  // Firebase専用（34.3対応: ローカルストレージ排除）
  private async addSongLocal(song: Song): Promise<boolean> {
    // ローカルストレージは使用せず、Firebaseのみを使用
    console.warn('🔥 Local storage disabled, using Firebase only')
    return this.addSongViaFirebase(song)
  }

  private async getDatabaseLocal(): Promise<MusicDatabase> {
    // ローカルストレージは使用せず、Firebaseのみを使用
    console.warn('🔥 Local storage disabled, using Firebase only')
    return this.getDatabaseFromFirebase()
  }

  // GitHub Issues経由（簡単な実装）
  private async addSongViaGitHubIssues(song: Song): Promise<boolean> {
    try {
      // GitHub Issues APIを使用して楽曲データを投稿
      const issueBody = `
## 新しい楽曲登録

**楽曲名:** ${song.title}
**作詞:** ${song.lyricists.join(', ')}
**作曲:** ${song.composers.join(', ')}
**編曲:** ${song.arrangers.join(', ')}
**タグ:** ${song.tags?.join(', ') || 'なし'}

\`\`\`json
${JSON.stringify(song, null, 2)}
\`\`\`
      `

      // 実際のGitHub API呼び出し（要認証）
      // const response = await fetch(`https://api.github.com/repos/${this.config.githubRepo}/issues`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     title: `楽曲登録: ${song.title}`,
      //     body: issueBody,
      //     labels: ['song-registration']
      //   })
      // })

      console.log('📝 GitHub Issues投稿用データ:', issueBody)
      
      // ローカルにも保存
      return this.addSongLocal(song)
    } catch (error) {
      console.error('GitHub Issues投稿エラー:', error)
      return this.addSongLocal(song)
    }
  }

  private async getDatabaseFromGitHubIssues(): Promise<MusicDatabase> {
    try {
      // GitHub Issues APIから楽曲データを取得
      // const response = await fetch(`https://api.github.com/repos/${this.config.githubRepo}/issues?labels=song-registration&state=closed`)
      // const issues = await response.json()
      
      // 現在はローカルデータを返す
      return this.getDatabaseLocal()
    } catch (error) {
      console.error('GitHub Issues取得エラー:', error)
      return this.getDatabaseLocal()
    }
  }

  // Firebase Firestore
  private async addSongViaFirebase(song: Song): Promise<boolean> {
    try {
      const { FirebaseService } = await import('./firebaseService')
      const firebaseService = FirebaseService.getInstance()
      
      const firebaseId = await firebaseService.addSong(song)
      
      if (firebaseId) {
        console.log('🔥 Firebase保存成功:', firebaseId)
        return true
      } else {
        console.warn('🔥 Firebase保存失敗')
        return false
      }
    } catch (error) {
      console.error('Firebase保存エラー:', error)
      // Firebase専用モードではフォールバックなし
      return false
    }
  }

  private async getDatabaseFromFirebase(): Promise<MusicDatabase> {
    try {
      const { FirebaseService } = await import('./firebaseService')
      const firebaseService = FirebaseService.getInstance()
      
      // 接続チェック
      const isConnected = await firebaseService.checkConnection()
      if (!isConnected) {
        console.warn('🔥 Firebase接続失敗、ローカルデータを使用')
        return this.getDatabaseLocal()
      }

      const firebaseDatabase = await firebaseService.getMusicDatabase()
      console.log(`🔥 Firebase: ${firebaseDatabase.songs.length}曲を取得`)
      
      // Firebase専用モードではFirebaseデータのみを返す
      return {
        songs: firebaseDatabase.songs,
        people: [], // TODO: Implement people merging
        tags: [], // TODO: Implement tags merging
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    } catch (error) {
      console.error('Firebase取得エラー:', error)
      // Firebase専用モードではエラー時は空のデータベースを返す
      return {
        songs: [],
        people: [],
        tags: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      }
    }
  }

  // Supabase（要設定）
  private async addSongViaSupabase(song: Song): Promise<boolean> {
    try {
      // Supabase SDKを使用してデータベースに保存
      // const { data, error } = await supabase
      //   .from('songs')
      //   .insert([song])
      
      console.log('🚀 Supabase保存予定:', song)
      
      // ローカルにも保存
      return this.addSongLocal(song)
    } catch (error) {
      console.error('Supabase保存エラー:', error)
      return this.addSongLocal(song)
    }
  }

  private async getDatabaseFromSupabase(): Promise<MusicDatabase> {
    try {
      // Supabase SDKを使用してデータベースから取得
      // const { data: songs, error } = await supabase
      //   .from('songs')
      //   .select('*')
      
      // 現在はローカルデータを返す
      return this.getDatabaseLocal()
    } catch (error) {
      console.error('Supabase取得エラー:', error)
      return this.getDatabaseLocal()
    }
  }

  // JSONファイル + GitHub Actions（静的だが無料）
  private async addSongViaJsonFile(song: Song): Promise<boolean> {
    try {
      // GitHub APIを使用してJSONファイルを更新
      // Pull Requestを作成してデータを追加
      
      console.log('📄 JSONファイル更新予定:', song)
      
      // ローカルにも保存
      return this.addSongLocal(song)
    } catch (error) {
      console.error('JSONファイル更新エラー:', error)
      return this.addSongLocal(song)
    }
  }

  private async getDatabaseFromJsonFile(): Promise<MusicDatabase> {
    try {
      // GitHubの公開JSONファイルから取得
      // const response = await fetch(`https://raw.githubusercontent.com/${this.config.githubRepo}/main/data/shared-music.json`)
      // const sharedData = await response.json()
      
      // 現在はローカルデータを返す
      return this.getDatabaseLocal()
    } catch (error) {
      console.error('JSONファイル取得エラー:', error)
      return this.getDatabaseLocal()
    }
  }

  /**
   * 利用可能な共有方式の説明を取得
   */
  public getAvailableMethods(): Array<{
    method: DataSharingMethod
    name: string
    description: string
    pros: string[]
    cons: string[]
    setup: string
  }> {
    return [
      {
        method: DataSharingMethod.LOCAL_ONLY,
        name: 'ローカルストレージのみ',
        description: '現在の方式。ブラウザのLocalStorageに保存',
        pros: ['設定不要', '高速', 'プライベート'],
        cons: ['ユーザー間で共有されない', 'ブラウザ依存'],
        setup: '設定不要（現在の方式）'
      },
      {
        method: DataSharingMethod.GITHUB_ISSUES,
        name: 'GitHub Issues',
        description: 'GitHub Issuesに楽曲データを投稿',
        pros: ['無料', '簡単', '透明性'],
        cons: ['手動承認が必要', 'リアルタイムではない'],
        setup: 'GitHubリポジトリの設定が必要'
      },
      {
        method: DataSharingMethod.FIREBASE,
        name: 'Firebase Firestore',
        description: 'Googleのリアルタイムデータベース',
        pros: ['リアルタイム同期', '高機能', 'スケーラブル'],
        cons: ['有料（制限あり）', '設定が複雑'],
        setup: 'Firebaseプロジェクトの作成と設定が必要'
      },
      {
        method: DataSharingMethod.SUPABASE,
        name: 'Supabase',
        description: 'オープンソースのFirebase代替',
        pros: ['オープンソース', 'PostgreSQL', '無料枠あり'],
        cons: ['比較的新しい', '設定が必要'],
        setup: 'Supabaseプロジェクトの作成と設定が必要'
      },
      {
        method: DataSharingMethod.JSON_FILE,
        name: 'JSONファイル + GitHub Actions',
        description: '静的JSONファイルをGitHub Actionsで更新',
        pros: ['完全無料', '透明性', 'バージョン管理'],
        cons: ['リアルタイムではない', '設定が複雑'],
        setup: 'GitHub ActionsとPull Request自動化の設定が必要'
      }
    ]
  }
}