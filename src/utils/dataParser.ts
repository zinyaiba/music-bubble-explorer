import { MusicDatabase, Song, Person, Tag } from '@/types/music'
import { DataValidator } from './dataValidation'

/**
 * 楽曲データのパースと変換を行うユーティリティクラス
 */
export class DataParser {
  /**
   * JSONデータをMusicDatabaseに変換
   */
  static parseJsonToMusicDatabase(jsonData: any): MusicDatabase {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Invalid JSON data format')
    }

    const songs: Song[] = this.parseSongs(jsonData.songs || [])
    const people: Person[] = this.parsePeople(jsonData.people || [])
    const tags: Tag[] = this.extractTagsFromSongs(songs)

    const database: MusicDatabase = { songs, people, tags }
    
    // データの整合性を検証
    const validation = DataValidator.validateMusicDatabase(database)
    if (!validation.isValid) {
      console.warn('Data validation warnings:', validation.errors)
    }

    return database
  }

  /**
   * 楽曲データの配列をパース
   */
  private static parseSongs(songsData: any[]): Song[] {
    if (!Array.isArray(songsData)) {
      throw new Error('Songs data must be an array')
    }

    return songsData.map((songData, index) => {
      try {
        return this.parseSong(songData)
      } catch (error) {
        console.error(`Error parsing song at index ${index}:`, error)
        throw error
      }
    })
  }

  /**
   * 単一の楽曲データをパース
   */
  private static parseSong(songData: any): Song {
    if (!songData || typeof songData !== 'object') {
      throw new Error('Invalid song data format')
    }

    const song: Song = {
      id: this.validateString(songData.id, 'Song ID'),
      title: this.validateString(songData.title, 'Song title'),
      lyricists: this.validateStringArray(songData.lyricists, 'Lyricists'),
      composers: this.validateStringArray(songData.composers, 'Composers'),
      arrangers: this.validateStringArray(songData.arrangers, 'Arrangers'),
      tags: songData.tags ? this.validateStringArray(songData.tags, 'Tags') : []
    }

    return song
  }

  /**
   * 人物データの配列をパース
   */
  private static parsePeople(peopleData: any[]): Person[] {
    if (!Array.isArray(peopleData)) {
      throw new Error('People data must be an array')
    }

    return peopleData.map((personData, index) => {
      try {
        return this.parsePerson(personData)
      } catch (error) {
        console.error(`Error parsing person at index ${index}:`, error)
        throw error
      }
    })
  }

  /**
   * 単一の人物データをパース
   */
  private static parsePerson(personData: any): Person {
    if (!personData || typeof personData !== 'object') {
      throw new Error('Invalid person data format')
    }

    const validTypes = ['lyricist', 'composer', 'arranger']
    if (!validTypes.includes(personData.type)) {
      throw new Error(`Invalid person type: ${personData.type}`)
    }

    const person: Person = {
      id: this.validateString(personData.id, 'Person ID'),
      name: this.validateString(personData.name, 'Person name'),
      type: personData.type as 'lyricist' | 'composer' | 'arranger',
      songs: this.validateStringArray(personData.songs, 'Person songs')
    }

    return person
  }

  /**
   * 文字列の検証
   */
  private static validateString(value: any, fieldName: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error(`${fieldName} must be a non-empty string`)
    }
    return value.trim()
  }

  /**
   * 文字列配列の検証
   */
  private static validateStringArray(value: any, fieldName: string): string[] {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`)
    }

    return value.map((item, index) => {
      if (typeof item !== 'string') {
        throw new Error(`${fieldName}[${index}] must be a string`)
      }
      return item.trim()
    }).filter(item => item.length > 0)
  }

  /**
   * CSVデータからMusicDatabaseに変換（将来の拡張用）
   */
  static parseCsvToMusicDatabase(csvData: string): MusicDatabase {
    // 基本的なCSVパース実装（簡易版）
    const lines = csvData.split('\n').filter(line => line.trim().length > 0)
    
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim())
    const songs: Song[] = []
    const peopleMap = new Map<string, Person>()

    lines.slice(1).forEach((line, index) => {
      try {
        const values = line.split(',').map(v => v.trim())
        
        if (values.length !== headers.length) {
          throw new Error(`Row ${index + 2} has ${values.length} columns, expected ${headers.length}`)
        }

        const rowData: Record<string, string> = {}
        headers.forEach((header, i) => {
          rowData[header] = values[i]
        })

        // 楽曲データの作成
        const song: Song = {
          id: rowData.id || `song_${index + 1}`,
          title: rowData.title || '',
          lyricists: rowData.lyricists ? rowData.lyricists.split(';') : [],
          composers: rowData.composers ? rowData.composers.split(';') : [],
          arrangers: rowData.arrangers ? rowData.arrangers.split(';') : [],
          tags: rowData.tags ? rowData.tags.split(';') : undefined
        }

        songs.push(song)

        // 人物データの作成
        this.extractPeopleFromSong(song, peopleMap)

      } catch (error) {
        console.error(`Error parsing CSV row ${index + 2}:`, error)
        throw error
      }
    })

    const people = Array.from(peopleMap.values())
    const tags = this.extractTagsFromSongs(songs)

    return {
      songs,
      people,
      tags
    }
  }

  /**
   * 楽曲データから人物データを抽出
   */
  private static extractPeopleFromSong(song: Song, peopleMap: Map<string, Person>): void {
    const addPerson = (name: string, type: 'lyricist' | 'composer' | 'arranger') => {
      const key = `${name}_${type}`
      
      if (!peopleMap.has(key)) {
        peopleMap.set(key, {
          id: `person_${peopleMap.size + 1}`,
          name,
          type,
          songs: []
        })
      }
      
      const person = peopleMap.get(key)!
      if (!person.songs.includes(song.id)) {
        person.songs.push(song.id)
      }
    }

    song.lyricists.forEach(name => addPerson(name, 'lyricist'))
    song.composers.forEach(name => addPerson(name, 'composer'))
    song.arrangers.forEach(name => addPerson(name, 'arranger'))
  }

  /**
   * 楽曲データからタグデータを抽出
   */
  private static extractTagsFromSongs(songs: Song[]): Tag[] {
    const tagMap = new Map<string, Set<string>>()

    // 全楽曲からタグを収集
    songs.forEach(song => {
      if (song.tags && song.tags.length > 0) {
        song.tags.forEach(tagName => {
          if (!tagMap.has(tagName)) {
            tagMap.set(tagName, new Set())
          }
          tagMap.get(tagName)!.add(song.id)
        })
      }
    })

    // TagMapからTag配列を生成
    return Array.from(tagMap.entries()).map(([tagName, songIds]) => ({
      id: `tag-${tagName}`,
      name: tagName,
      songs: Array.from(songIds)
    }))
  }

  /**
   * データベースを正規化（重複の除去、関連性の整理）
   */
  static normalizeMusicDatabase(database: MusicDatabase): MusicDatabase {
    const normalizedSongs = [...database.songs]
    const normalizedPeople = [...database.people]

    // 楽曲IDの重複チェック
    const songIds = new Set<string>()
    const uniqueSongs = normalizedSongs.filter(song => {
      if (songIds.has(song.id)) {
        console.warn(`Duplicate song ID found: ${song.id}`)
        return false
      }
      songIds.add(song.id)
      return true
    })

    // 人物IDの重複チェック
    const personIds = new Set<string>()
    const uniquePeople = normalizedPeople.filter(person => {
      if (personIds.has(person.id)) {
        console.warn(`Duplicate person ID found: ${person.id}`)
        return false
      }
      personIds.add(person.id)
      return true
    })

    // 存在しない楽曲IDの参照を削除
    const validSongIds = new Set(uniqueSongs.map(song => song.id))
    uniquePeople.forEach(person => {
      person.songs = person.songs.filter(songId => {
        if (!validSongIds.has(songId)) {
          console.warn(`Person ${person.name} references non-existent song: ${songId}`)
          return false
        }
        return true
      })
    })

    // タグを抽出
    const tags = this.extractTagsFromSongs(uniqueSongs)

    return {
      songs: uniqueSongs,
      people: uniquePeople,
      tags
    }
  }
}