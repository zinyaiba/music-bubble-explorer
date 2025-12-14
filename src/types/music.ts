// 楽曲詳細ページURLの型定義
export interface DetailPageUrl {
  url: string
  label?: string // 別名（オプション）
}

// 楽曲データの型定義
export interface Song {
  id: string
  title: string
  lyricists: string[]
  composers: string[]
  arrangers: string[]
  tags?: string[]
  notes?: string
  createdAt?: string
  updatedAt?: string

  // 拡張フィールド
  artists?: string[] // アーティスト名（複数対応）
  releaseYear?: number // 発売年（4桁の数値）
  releaseDate?: string // 発売日（月日、MMDD形式、例: 0315）
  singleName?: string // 収録シングル名
  albumName?: string // 収録アルバム名
  musicServiceEmbed?: string // 音楽サービス埋め込みコード（Spotify、Apple Music、YouTube等のiframe）
  detailPageUrls?: DetailPageUrl[] // 楽曲詳細ページURL（複数、ラベル付き）
}

// 人物データの型定義
export interface Person {
  id: string
  name: string
  type: 'lyricist' | 'composer' | 'arranger'
  songs: string[] // song IDs
}

// タグデータの型定義
export interface Tag {
  id: string
  name: string
  songs: string[] // song IDs
}

// 音楽データベースの型定義
export interface MusicDatabase {
  songs: Song[]
  people: Person[]
  tags: Tag[]
  lastUpdated?: string
  version?: string
}

// バブルタイプの型定義
export type BubbleType = 'song' | 'lyricist' | 'composer' | 'arranger' | 'tag'

// シャボン玉の型定義
export interface Bubble {
  id: string
  type: BubbleType
  name: string
  x: number
  y: number
  vx: number // velocity x
  vy: number // velocity y
  size: number
  color: string
  opacity: number
  lifespan: number
  relatedCount: number // サイズ決定用
}

// 関連データの型定義
export interface RelatedData {
  id: string
  name: string
  type: 'song' | 'person'
  details?: Song | Person
}
