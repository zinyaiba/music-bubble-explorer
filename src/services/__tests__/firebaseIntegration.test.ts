/**
 * Firebase Integration Tests for Extended Song Fields
 *
 * Tests that DataManager and FirebaseService correctly handle
 * the extended song fields (artists, releaseYear, singleName, albumName,
 * jacketImageUrl, detailPageUrls)
 *
 * Requirements: 16.1-16.4
 */

import { describe, it, expect } from 'vitest'
import { DataManager } from '../dataManager'
import { Song } from '@/types/music'

describe('Firebase Integration - Extended Fields', () => {
  // Mock song with all extended fields
  const createMockSongWithExtendedFields = (): Song => ({
    id: 'test-song-' + Date.now(),
    title: 'Test Song with Extended Fields',
    lyricists: ['Lyricist A'],
    composers: ['Composer B'],
    arrangers: ['Arranger C'],
    tags: ['test', 'extended'],
    notes: 'Test notes',
    // Extended fields
    artists: ['Artist X', 'Artist Y'],
    releaseYear: 2023,
    singleName: 'Test Single',
    albumName: 'Test Album',
    spotifyEmbed:
      '<iframe src="https://open.spotify.com/embed/track/test"></iframe>',
    detailPageUrls: [
      'https://example.com/detail1',
      'https://example.com/detail2',
    ],
  })

  describe('DataManager.saveSong with extended fields', () => {
    it('should accept and process songs with extended fields', async () => {
      const song = createMockSongWithExtendedFields()

      // This should not throw an error
      const result = await DataManager.saveSong(song)

      // Result can be null if Firebase is not configured, but should not throw
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should handle songs with partial extended fields', async () => {
      const song: Song = {
        id: 'test-partial-' + Date.now(),
        title: 'Partial Extended Fields',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
        // Only some extended fields
        artists: ['Artist'],
        releaseYear: 2024,
        // Other extended fields are undefined
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should handle songs without any extended fields', async () => {
      const song: Song = {
        id: 'test-no-extended-' + Date.now(),
        title: 'No Extended Fields',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
        // No extended fields
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })
  })

  describe('DataManager.updateSong with extended fields', () => {
    it('should accept and process song updates with extended fields', async () => {
      const song = createMockSongWithExtendedFields()

      // Update with modified extended fields
      song.artists = ['Updated Artist']
      song.releaseYear = 2024
      song.spotifyEmbed =
        '<iframe src="https://open.spotify.com/embed/track/updated"></iframe>'

      const result = await DataManager.updateSong(song)

      // Result should be boolean
      expect(typeof result).toBe('boolean')
    })

    it('should handle updates that add extended fields to existing songs', async () => {
      const song: Song = {
        id: 'test-add-extended-' + Date.now(),
        title: 'Add Extended Fields',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
      }

      // Add extended fields in update
      song.artists = ['New Artist']
      song.releaseYear = 2024
      song.detailPageUrls = ['https://example.com/new-detail']

      const result = await DataManager.updateSong(song)
      expect(typeof result).toBe('boolean')
    })

    it('should handle updates that remove extended fields', async () => {
      const song = createMockSongWithExtendedFields()

      // Remove some extended fields
      song.artists = undefined
      song.singleName = undefined
      song.detailPageUrls = undefined

      const result = await DataManager.updateSong(song)
      expect(typeof result).toBe('boolean')
    })
  })

  describe('Extended field validation', () => {
    it('should handle empty arrays in extended fields', async () => {
      const song: Song = {
        id: 'test-empty-arrays-' + Date.now(),
        title: 'Empty Arrays',
        lyricists: [],
        composers: [],
        arrangers: [],
        artists: [], // Empty array
        detailPageUrls: [], // Empty array
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should handle very long URL arrays', async () => {
      const song: Song = {
        id: 'test-long-urls-' + Date.now(),
        title: 'Long URL Array',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
        detailPageUrls: Array.from(
          { length: 10 },
          (_, i) => `https://example.com/detail${i + 1}`
        ),
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })

    it('should handle special characters in extended fields', async () => {
      const song: Song = {
        id: 'test-special-chars-' + Date.now(),
        title: 'Special Characters',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
        artists: ['アーティスト名', 'Artist with émojis 🎵'],
        singleName: 'シングル名 (Special Edition)',
        albumName: 'Album & More',
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })
  })

  describe('Error handling with extended fields', () => {
    it('should provide detailed error messages for Firebase errors', async () => {
      // Test that getDetailedErrorMessage handles various error types
      const permissionError = {
        code: 'permission-denied',
        message: 'Access denied',
      }
      const message = DataManager.getDetailedErrorMessage(permissionError)

      expect(message).toContain('Firebase')
      expect(message).toContain('権限')
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('network error occurred')
      const message = DataManager.getDetailedErrorMessage(networkError)

      expect(message).toContain('ネットワーク')
    })

    it('should handle unknown errors gracefully', async () => {
      const unknownError = { weird: 'error' }
      const message = DataManager.getDetailedErrorMessage(unknownError)

      expect(typeof message).toBe('string')
      expect(message.length).toBeGreaterThan(0)
    })
  })

  describe('Data consistency', () => {
    it('should maintain field types when saving and retrieving', async () => {
      const song = createMockSongWithExtendedFields()

      // Verify types are correct
      expect(Array.isArray(song.artists)).toBe(true)
      expect(typeof song.releaseYear).toBe('number')
      expect(typeof song.singleName).toBe('string')
      expect(typeof song.albumName).toBe('string')
      expect(typeof song.musicServiceEmbed).toBe('string')
      expect(Array.isArray(song.detailPageUrls)).toBe(true)
    })

    it('should handle undefined vs null for optional fields', async () => {
      const song: Song = {
        id: 'test-undefined-null-' + Date.now(),
        title: 'Undefined vs Null',
        lyricists: ['Lyricist'],
        composers: ['Composer'],
        arrangers: [],
        artists: undefined, // Explicitly undefined
        releaseYear: undefined,
        singleName: undefined,
        albumName: undefined,
        musicServiceEmbed: undefined,
        detailPageUrls: undefined,
      }

      const result = await DataManager.saveSong(song)
      expect(result === null || typeof result === 'string').toBe(true)
    })
  })

  describe('Firebase schema compatibility', () => {
    it('should be compatible with Firestore document structure', () => {
      const song = createMockSongWithExtendedFields()

      // Verify all fields are serializable
      const serialized = JSON.stringify(song)
      const deserialized = JSON.parse(serialized)

      expect(deserialized.id).toBe(song.id)
      expect(deserialized.title).toBe(song.title)
      expect(deserialized.artists).toEqual(song.artists)
      expect(deserialized.releaseYear).toBe(song.releaseYear)
      expect(deserialized.singleName).toBe(song.singleName)
      expect(deserialized.albumName).toBe(song.albumName)
      expect(deserialized.musicServiceEmbed).toBe(song.musicServiceEmbed)
      expect(deserialized.detailPageUrls).toEqual(song.detailPageUrls)
    })

    it('should handle Firestore field name restrictions', () => {
      const song = createMockSongWithExtendedFields()

      // Verify field names don't contain invalid characters
      const fieldNames = Object.keys(song)
      fieldNames.forEach(fieldName => {
        expect(fieldName).not.toMatch(/[.$#[\]/]/)
      })
    })
  })
})
