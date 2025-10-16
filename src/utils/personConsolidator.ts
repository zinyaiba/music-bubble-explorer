import { Song } from '../types/music'
import { ConsolidatedPerson, PersonRole, PersonRoleMap } from '../types/consolidatedPerson'

/**
 * 人物統合システム
 * 同一人物が複数の役割（作詞・作曲・編曲）を持つ場合に統合して管理する
 */
export class PersonConsolidator {
  /**
   * 楽曲データから人物を統合し、複数役割を持つ人物を一つにまとめる
   * @param songs 楽曲データ配列
   * @returns 統合された人物データ配列
   */
  consolidatePersons(songs: Song[]): ConsolidatedPerson[] {
    const personRoleMap = this.buildPersonRoleMap(songs)
    const consolidatedPersons: ConsolidatedPerson[] = []

    for (const [personName, roleData] of Object.entries(personRoleMap)) {
      const roles = this.extractPersonRoles(roleData)
      const allSongs = this.getAllRelatedSongs(roleData)
      
      const consolidatedPerson: ConsolidatedPerson = {
        name: personName,
        roles,
        totalRelatedCount: allSongs.size,
        songs: Array.from(allSongs)
      }
      
      consolidatedPersons.push(consolidatedPerson)
    }

    return consolidatedPersons
  }

  /**
   * 特定の人物の役割を取得する
   * @param personName 人物名
   * @param songs 楽曲データ配列
   * @returns その人物の役割配列
   */
  getPersonRoles(personName: string, songs: Song[]): PersonRole[] {
    const personRoleMap = this.buildPersonRoleMap(songs)
    const roleData = personRoleMap[personName]
    
    if (!roleData) {
      return []
    }
    
    return this.extractPersonRoles(roleData)
  }

  /**
   * 統合された人物の総関連楽曲数を計算する
   * @param person 統合された人物データ
   * @returns 総関連楽曲数
   */
  calculateTotalRelatedCount(person: ConsolidatedPerson): number {
    return person.totalRelatedCount
  }

  /**
   * 楽曲データから人物と役割のマップを構築する
   * @param songs 楽曲データ配列
   * @returns 人物名をキーとした役割マップ
   */
  private buildPersonRoleMap(songs: Song[]): PersonRoleMap {
    const personRoleMap: PersonRoleMap = {}

    songs.forEach(song => {
      // 作詞家を処理
      song.lyricists.forEach(lyricist => {
        this.initializePersonIfNeeded(personRoleMap, lyricist)
        personRoleMap[lyricist].lyricist.add(song.id)
      })

      // 作曲家を処理
      song.composers.forEach(composer => {
        this.initializePersonIfNeeded(personRoleMap, composer)
        personRoleMap[composer].composer.add(song.id)
      })

      // 編曲家を処理
      song.arrangers.forEach(arranger => {
        this.initializePersonIfNeeded(personRoleMap, arranger)
        personRoleMap[arranger].arranger.add(song.id)
      })
    })

    return personRoleMap
  }

  /**
   * 人物が初回登場の場合、マップに初期化する
   * @param personRoleMap 人物役割マップ
   * @param personName 人物名
   */
  private initializePersonIfNeeded(personRoleMap: PersonRoleMap, personName: string): void {
    if (!personRoleMap[personName]) {
      personRoleMap[personName] = {
        lyricist: new Set<string>(),
        composer: new Set<string>(),
        arranger: new Set<string>()
      }
    }
  }

  /**
   * 役割データから PersonRole 配列を抽出する
   * @param roleData 役割データ
   * @returns PersonRole配列
   */
  private extractPersonRoles(roleData: PersonRoleMap[string]): PersonRole[] {
    const roles: PersonRole[] = []

    if (roleData.lyricist.size > 0) {
      roles.push({
        type: 'lyricist',
        songCount: roleData.lyricist.size
      })
    }

    if (roleData.composer.size > 0) {
      roles.push({
        type: 'composer', 
        songCount: roleData.composer.size
      })
    }

    if (roleData.arranger.size > 0) {
      roles.push({
        type: 'arranger',
        songCount: roleData.arranger.size
      })
    }

    return roles
  }

  /**
   * 全ての役割から関連楽曲IDを取得する（重複除去）
   * @param roleData 役割データ
   * @returns 関連楽曲IDのSet
   */
  private getAllRelatedSongs(roleData: PersonRoleMap[string]): Set<string> {
    const allSongs = new Set<string>()
    
    roleData.lyricist.forEach(songId => allSongs.add(songId))
    roleData.composer.forEach(songId => allSongs.add(songId))
    roleData.arranger.forEach(songId => allSongs.add(songId))
    
    return allSongs
  }

  /**
   * 複数の役割を持つ人物かどうかを判定する
   * @param person 統合された人物データ
   * @returns 複数役割を持つ場合true
   */
  isMultiRole(person: ConsolidatedPerson): boolean {
    return person.roles.length > 1
  }

  /**
   * 特定の役割を持つ人物を取得する
   * @param consolidatedPersons 統合された人物配列
   * @param roleType 役割タイプ
   * @returns 指定された役割を持つ人物配列
   */
  getPersonsByRole(consolidatedPersons: ConsolidatedPerson[], roleType: 'lyricist' | 'composer' | 'arranger'): ConsolidatedPerson[] {
    return consolidatedPersons.filter(person => 
      person.roles.some(role => role.type === roleType)
    )
  }

  /**
   * 複数役割を持つ人物のみを取得する
   * @param consolidatedPersons 統合された人物配列
   * @returns 複数役割を持つ人物配列
   */
  getMultiRolePersons(consolidatedPersons: ConsolidatedPerson[]): ConsolidatedPerson[] {
    return consolidatedPersons.filter(person => this.isMultiRole(person))
  }
}