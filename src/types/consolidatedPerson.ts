// 人物統合システムの型定義

export interface PersonRole {
  type: 'lyricist' | 'composer' | 'arranger'
  songCount: number
}

export interface ConsolidatedPerson {
  name: string
  roles: PersonRole[]
  totalRelatedCount: number
  songs: string[] // 関連楽曲ID配列
}

export interface PersonRoleMap {
  [personName: string]: {
    lyricist: Set<string> // song IDs
    composer: Set<string> // song IDs  
    arranger: Set<string> // song IDs
  }
}