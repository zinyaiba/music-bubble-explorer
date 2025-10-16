import { Song, Person } from '@/types/music'
import { MusicDataService } from '@/services/musicDataService'

/**
 * 楽曲と人物の関連性を計算するユーティリティクラス
 */
export class RelationshipCalculator {
  private musicService: MusicDataService

  constructor() {
    this.musicService = MusicDataService.getInstance()
  }

  /**
   * シャボン玉のサイズを計算（関連データ数に基づく）
   */
  calculateBubbleSize(
    type: 'song' | 'lyricist' | 'composer' | 'arranger',
    id: string,
    minSize: number = 40,
    maxSize: number = 120
  ): number {
    let relatedCount = 0

    if (type === 'song') {
      relatedCount = this.musicService.getRelatedCountForSong(id)
    } else {
      relatedCount = this.musicService.getRelatedCountForPerson(id)
    }

    // 関連数を正規化（最大20件で最大サイズとする）
    const normalizedCount = Math.min(relatedCount / 20, 1)
    return Math.round(minSize + (maxSize - minSize) * normalizedCount)
  }

  /**
   * 人物間の協力関係の強さを計算
   */
  calculateCollaborationStrength(personId1: string, personId2: string): number {
    const person1 = this.musicService.getPersonById(personId1)
    const person2 = this.musicService.getPersonById(personId2)

    if (!person1 || !person2) return 0

    const commonSongs = person1.songs.filter(songId => person2.songs.includes(songId))
    const totalSongs = new Set([...person1.songs, ...person2.songs]).size

    // ジャッカード係数を使用（共通楽曲数 / 全楽曲数）
    return totalSongs > 0 ? commonSongs.length / totalSongs : 0
  }

  /**
   * 楽曲の複雑さを計算（関わった人数とその多様性）
   */
  calculateSongComplexity(songId: string): {
    totalPeople: number
    roleVariety: number
    complexity: number
  } {
    const people = this.musicService.getPeopleForSong(songId)
    const roles = new Set(people.map(person => person.type))
    
    const totalPeople = people.length
    const roleVariety = roles.size
    
    // 複雑さ = 人数 × 役割の多様性
    const complexity = totalPeople * roleVariety

    return {
      totalPeople,
      roleVariety,
      complexity
    }
  }

  /**
   * 人物の影響力を計算（関わった楽曲数と協力者数）
   */
  calculatePersonInfluence(personId: string): {
    songCount: number
    collaboratorCount: number
    influence: number
  } {
    const songCount = this.musicService.getRelatedCountForPerson(personId)
    const collaborators = this.musicService.getCollaborators(personId)
    const collaboratorCount = collaborators.length

    // 影響力 = 楽曲数 + 協力者数の重み付け平均
    const influence = songCount * 0.7 + collaboratorCount * 0.3

    return {
      songCount,
      collaboratorCount,
      influence
    }
  }

  /**
   * 楽曲ジャンルの推定（協力者のパターンから）
   */
  estimateSongGenre(songId: string): {
    isCollaborative: boolean
    isSoloWork: boolean
    hasSpecializedRoles: boolean
  } {
    const people = this.musicService.getPeopleForSong(songId)
    const roles = people.map(person => person.type)
    const uniqueNames = new Set(people.map(person => person.name))

    const isCollaborative = uniqueNames.size > 1
    const isSoloWork = uniqueNames.size === 1
    const hasSpecializedRoles = new Set(roles).size === roles.length

    return {
      isCollaborative,
      isSoloWork,
      hasSpecializedRoles
    }
  }

  /**
   * 関連性の高い楽曲を推薦
   */
  getRelatedSongs(songId: string, limit: number = 5): Song[] {
    const targetSong = this.musicService.getSongById(songId)
    if (!targetSong) return []

    const targetPeople = this.musicService.getPeopleForSong(songId)
    const allSongs = this.musicService.getAllSongs()

    // 共通の人物が多い楽曲を計算
    const songScores = allSongs
      .filter(song => song.id !== songId)
      .map(song => {
        const songPeople = this.musicService.getPeopleForSong(song.id)
        const commonPeople = targetPeople.filter(targetPerson =>
          songPeople.some(songPerson => songPerson.name === targetPerson.name)
        )
        
        return {
          song,
          score: commonPeople.length
        }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return songScores.map(item => item.song)
  }

  /**
   * 関連性の高い人物を推薦
   */
  getRelatedPeople(personId: string, limit: number = 5): Person[] {
    const targetPerson = this.musicService.getPersonById(personId)
    if (!targetPerson) return []

    const collaborators = this.musicService.getCollaborators(personId)
    
    // 協力関係の強さでソート
    const peopleScores = collaborators
      .map((collaborator: Person) => ({
        person: collaborator,
        score: this.calculateCollaborationStrength(personId, collaborator.id)
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)

    return peopleScores.map((item: any) => item.person)
  }
}