import { describe, it, expect } from 'vitest'
import { PersonConsolidator } from '../personConsolidator'
import { Song } from '../../types/music'
import { ConsolidatedPerson } from '../../types/consolidatedPerson'

describe('PersonConsolidator', () => {
  const consolidator = new PersonConsolidator()

  const sampleSongs: Song[] = [
    {
      id: '1',
      title: '春の歌',
      lyricists: ['田中太郎', '佐藤花子'],
      composers: ['田中太郎'],
      arrangers: ['山田次郎']
    },
    {
      id: '2',
      title: '夏の思い出',
      lyricists: ['佐藤花子'],
      composers: ['田中太郎', '鈴木一郎'],
      arrangers: ['田中太郎']
    },
    {
      id: '3',
      title: '秋の風景',
      lyricists: ['高橋美咲'],
      composers: ['鈴木一郎'],
      arrangers: ['山田次郎', '田中太郎']
    }
  ]

  describe('consolidatePersons', () => {
    it('should consolidate persons with multiple roles correctly', () => {
      const result = consolidator.consolidatePersons(sampleSongs)
      
      // 田中太郎は作詞・作曲・編曲の3つの役割を持つ
      const tanaka = result.find(p => p.name === '田中太郎')
      expect(tanaka).toBeDefined()
      expect(tanaka!.roles).toHaveLength(3)
      expect(tanaka!.roles.map(r => r.type)).toContain('lyricist')
      expect(tanaka!.roles.map(r => r.type)).toContain('composer')
      expect(tanaka!.roles.map(r => r.type)).toContain('arranger')
      expect(tanaka!.totalRelatedCount).toBe(3) // 3曲に関連
      expect(tanaka!.songs).toEqual(['1', '2', '3'])
    })

    it('should handle persons with single role correctly', () => {
      const result = consolidator.consolidatePersons(sampleSongs)
      
      // 高橋美咲は作詞のみ
      const takahashi = result.find(p => p.name === '高橋美咲')
      expect(takahashi).toBeDefined()
      expect(takahashi!.roles).toHaveLength(1)
      expect(takahashi!.roles[0].type).toBe('lyricist')
      expect(takahashi!.roles[0].songCount).toBe(1)
      expect(takahashi!.totalRelatedCount).toBe(1)
      expect(takahashi!.songs).toEqual(['3'])
    })

    it('should calculate song counts correctly for each role', () => {
      const result = consolidator.consolidatePersons(sampleSongs)
      
      const tanaka = result.find(p => p.name === '田中太郎')!
      const lyricistRole = tanaka.roles.find(r => r.type === 'lyricist')
      const composerRole = tanaka.roles.find(r => r.type === 'composer')
      const arrangerRole = tanaka.roles.find(r => r.type === 'arranger')
      
      expect(lyricistRole!.songCount).toBe(1) // 1曲で作詞
      expect(composerRole!.songCount).toBe(2) // 2曲で作曲
      expect(arrangerRole!.songCount).toBe(2) // 2曲で編曲
    })

    it('should return empty array for empty songs', () => {
      const result = consolidator.consolidatePersons([])
      expect(result).toEqual([])
    })
  })

  describe('getPersonRoles', () => {
    it('should return correct roles for existing person', () => {
      const roles = consolidator.getPersonRoles('田中太郎', sampleSongs)
      
      expect(roles).toHaveLength(3)
      expect(roles.map(r => r.type)).toContain('lyricist')
      expect(roles.map(r => r.type)).toContain('composer')
      expect(roles.map(r => r.type)).toContain('arranger')
    })

    it('should return empty array for non-existing person', () => {
      const roles = consolidator.getPersonRoles('存在しない人', sampleSongs)
      expect(roles).toEqual([])
    })
  })

  describe('calculateTotalRelatedCount', () => {
    it('should return the total related count', () => {
      const person: ConsolidatedPerson = {
        name: 'テスト',
        roles: [],
        totalRelatedCount: 5,
        songs: ['1', '2', '3', '4', '5']
      }
      
      const count = consolidator.calculateTotalRelatedCount(person)
      expect(count).toBe(5)
    })
  })

  describe('isMultiRole', () => {
    it('should return true for person with multiple roles', () => {
      const person: ConsolidatedPerson = {
        name: 'マルチ',
        roles: [
          { type: 'lyricist', songCount: 1 },
          { type: 'composer', songCount: 2 }
        ],
        totalRelatedCount: 2,
        songs: ['1', '2']
      }
      
      expect(consolidator.isMultiRole(person)).toBe(true)
    })

    it('should return false for person with single role', () => {
      const person: ConsolidatedPerson = {
        name: 'シングル',
        roles: [
          { type: 'lyricist', songCount: 1 }
        ],
        totalRelatedCount: 1,
        songs: ['1']
      }
      
      expect(consolidator.isMultiRole(person)).toBe(false)
    })
  })

  describe('getPersonsByRole', () => {
    it('should return persons with specified role', () => {
      const consolidatedPersons = consolidator.consolidatePersons(sampleSongs)
      const composers = consolidator.getPersonsByRole(consolidatedPersons, 'composer')
      
      const composerNames = composers.map(p => p.name)
      expect(composerNames).toContain('田中太郎')
      expect(composerNames).toContain('鈴木一郎')
      expect(composerNames).not.toContain('高橋美咲') // 作詞のみ
    })
  })

  describe('getMultiRolePersons', () => {
    it('should return only persons with multiple roles', () => {
      const consolidatedPersons = consolidator.consolidatePersons(sampleSongs)
      const multiRolePersons = consolidator.getMultiRolePersons(consolidatedPersons)
      
      // 田中太郎は複数役割、佐藤花子は作詞のみ、高橋美咲は作詞のみ
      expect(multiRolePersons.some(p => p.name === '田中太郎')).toBe(true)
      expect(multiRolePersons.every(p => p.roles.length > 1)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle songs with empty person arrays', () => {
      const emptySongs: Song[] = [
        {
          id: '1',
          title: 'Empty Song',
          lyricists: [],
          composers: [],
          arrangers: []
        }
      ]
      
      const result = consolidator.consolidatePersons(emptySongs)
      expect(result).toEqual([])
    })

    it('should handle duplicate person names correctly', () => {
      const duplicateSongs: Song[] = [
        {
          id: '1',
          title: 'Song 1',
          lyricists: ['田中太郎', '田中太郎'], // 重複
          composers: ['田中太郎'],
          arrangers: []
        }
      ]
      
      const result = consolidator.consolidatePersons(duplicateSongs)
      const tanaka = result.find(p => p.name === '田中太郎')
      
      expect(tanaka).toBeDefined()
      expect(tanaka!.roles.find(r => r.type === 'lyricist')!.songCount).toBe(1) // 重複は除去される
    })
  })
})