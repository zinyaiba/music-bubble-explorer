import { describe, it, expect } from 'vitest'
import { DataValidator } from '../dataValidation'
import { Song } from '@/types/music'

describe('DataValidator - Extended Song Fields', () => {
  describe('validateSong with extended fields', () => {
    it('should accept song with valid extended fields', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        artists: ['Artist A', 'Artist B'],
        releaseYear: 2024,
        singleName: 'Test Single',
        albumName: 'Test Album',
        jacketImageUrl: 'https://example.com/jacket.jpg',
        detailPageUrls: [
          'https://example.com/song1',
          'https://example.com/song2',
        ],
      }
      expect(DataValidator.validateSong(song)).toBe(true)
    })

    it('should accept song without extended fields', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
      }
      expect(DataValidator.validateSong(song)).toBe(true)
    })

    it('should reject song with invalid releaseYear (too low)', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        releaseYear: 999,
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with invalid releaseYear (too high)', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        releaseYear: 10000,
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with invalid jacketImageUrl', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        jacketImageUrl: 'not-a-valid-url',
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with jacketImageUrl exceeding 500 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500)
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        jacketImageUrl: longUrl,
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with singleName exceeding 200 characters', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        singleName: 'a'.repeat(201),
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with albumName exceeding 200 characters', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        albumName: 'a'.repeat(201),
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with more than 10 detailPageUrls', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        detailPageUrls: Array(11).fill('https://example.com'),
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with invalid URL in detailPageUrls', () => {
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        detailPageUrls: ['https://example.com', 'not-a-url'],
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with detailPageUrl exceeding 500 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500)
      const song: Song = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        detailPageUrls: [longUrl],
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with non-array artists', () => {
      const song: any = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        artists: 'Not an array',
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })

    it('should reject song with non-array detailPageUrls', () => {
      const song: any = {
        id: 'song_001',
        title: 'Test Song',
        lyricists: ['Lyricist A'],
        composers: ['Composer B'],
        arrangers: ['Arranger C'],
        detailPageUrls: 'Not an array',
      }
      expect(DataValidator.validateSong(song)).toBe(false)
    })
  })

  describe('validateUrl', () => {
    it('should accept valid HTTP URL', () => {
      expect(DataValidator.validateUrl('http://example.com')).toBe(true)
    })

    it('should accept valid HTTPS URL', () => {
      expect(DataValidator.validateUrl('https://example.com/path')).toBe(true)
    })

    it('should reject invalid URL', () => {
      expect(DataValidator.validateUrl('not-a-url')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(DataValidator.validateUrl('')).toBe(false)
    })
  })

  describe('validateTextLength', () => {
    it('should accept text within limit', () => {
      expect(DataValidator.validateTextLength('Test', 200)).toBe(true)
    })

    it('should reject text exceeding limit', () => {
      expect(DataValidator.validateTextLength('a'.repeat(201), 200)).toBe(false)
    })
  })

  describe('validateReleaseYear', () => {
    it('should accept valid year 1000', () => {
      expect(DataValidator.validateReleaseYear(1000)).toBe(true)
    })

    it('should accept valid year 9999', () => {
      expect(DataValidator.validateReleaseYear(9999)).toBe(true)
    })

    it('should accept valid year 2024', () => {
      expect(DataValidator.validateReleaseYear(2024)).toBe(true)
    })

    it('should reject year 999', () => {
      expect(DataValidator.validateReleaseYear(999)).toBe(false)
    })

    it('should reject year 10000', () => {
      expect(DataValidator.validateReleaseYear(10000)).toBe(false)
    })

    it('should reject non-number', () => {
      expect(DataValidator.validateReleaseYear('2024' as any)).toBe(false)
    })
  })
})
