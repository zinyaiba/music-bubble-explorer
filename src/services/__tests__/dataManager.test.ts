import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataManager } from '../dataManager'
import { Song } from '@/types/music'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('DataManager', () => {
  const mockSong: Song = {
    id: 'test-song-1',
    title: 'テスト楽曲',
    lyricists: ['作詞家A'],
    composers: ['作曲家B'],
    arrangers: ['編曲家C'],
    tags: ['テスト', 'バラード']
  }

  const mockSongs: Song[] = [
    mockSong,
    {
      id: 'test-song-2',
      title: 'テスト楽曲2',
      lyricists: ['作詞家A', '作詞家B'],
      composers: ['作曲家A'],
      arrangers: [],
      tags: ['ロック']
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('saveSong', () => {
    it('should save a new song successfully', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.saveSong(mockSong)
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      
      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      expect(setItemCall[0]).toBe('music-bubble-explorer-data')
      
      const savedData = JSON.parse(setItemCall[1])
      expect(savedData.songs).toHaveLength(1)
      expect(savedData.songs[0]).toEqual(mockSong)
      expect(savedData.version).toBe('1.0.0')
      expect(savedData.lastUpdated).toBeDefined()
      expect(savedData.metadata).toBeDefined()
      expect(savedData.metadata.totalSongs).toBe(1)
    })

    it('should update existing song', () => {
      const existingData = {
        songs: [mockSong],
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z',
        metadata: { totalSongs: 1, totalPeople: 3, createdAt: '2023-01-01T00:00:00.000Z' }
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const updatedSong = { ...mockSong, title: '更新された楽曲' }
      const result = DataManager.saveSong(updatedSong)
      
      expect(result).toBe(true)
      
      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      const savedData = JSON.parse(setItemCall[1])
      expect(savedData.songs).toHaveLength(1)
      expect(savedData.songs[0].title).toBe('更新された楽曲')
    })

    it('should handle save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full')
      })
      
      const result = DataManager.saveSong(mockSong)
      
      expect(result).toBe(false)
    })
  })

  describe('saveSongs', () => {
    it('should save multiple songs successfully', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockLocalStorage.setItem.mockImplementation(() => {}) // Mock successful save
      
      const result = DataManager.saveSongs(mockSongs)
      
      expect(result).toBe(true)
      
      const setItemCall = mockLocalStorage.setItem.mock.calls[0]
      const savedData = JSON.parse(setItemCall[1])
      expect(savedData.songs).toHaveLength(2)
      expect(savedData.metadata.totalSongs).toBe(2)
    })
  })

  describe('loadSongs', () => {
    it('should load songs from storage', () => {
      const existingData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const result = DataManager.loadSongs()
      
      expect(result).toEqual(mockSongs)
    })

    it('should return empty array when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.loadSongs()
      
      expect(result).toEqual([])
    })

    it('should handle corrupted data gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')
      
      const result = DataManager.loadSongs()
      
      expect(result).toEqual([])
    })
  })

  describe('loadMusicDatabase', () => {
    it('should load complete music database', () => {
      const existingData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const result = DataManager.loadMusicDatabase()
      
      expect(result.songs).toEqual(mockSongs)
      expect(result.people).toBeDefined()
      expect(result.tags).toBeDefined()
      expect(result.people.length).toBeGreaterThan(0)
      expect(result.tags.length).toBeGreaterThan(0)
    })

    it('should return empty database when no data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.loadMusicDatabase()
      
      expect(result).toEqual({
        songs: [],
        people: [],
        tags: []
      })
    })
  })

  describe('exportData', () => {
    it('should export data as JSON string', () => {
      const existingData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const result = DataManager.exportData()
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      
      const exportedData = JSON.parse(result)
      expect(exportedData.songs).toEqual(mockSongs)
      expect(exportedData.exportedAt).toBeDefined()
      expect(exportedData.exportVersion).toBe('1.0.0')
    })

    it('should handle export errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      const result = DataManager.exportData()
      
      expect(result).toBe('{}')
    })
  })

  describe('importData', () => {
    it('should import valid JSON data', () => {
      mockLocalStorage.setItem.mockImplementation(() => {}) // Mock successful save
      
      const importData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      
      const result = DataManager.importData(JSON.stringify(importData))
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    it('should reject invalid JSON data', () => {
      const result = DataManager.importData('invalid json')
      
      expect(result).toBe(false)
    })

    it('should reject data with invalid structure', () => {
      const invalidData = {
        songs: 'not an array'
      }
      
      const result = DataManager.importData(JSON.stringify(invalidData))
      
      expect(result).toBe(false)
    })

    it('should create backup before import', () => {
      const existingData = {
        songs: [mockSong],
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const importData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      
      DataManager.importData(JSON.stringify(importData))
      
      // Should call setItem twice: once for backup, once for new data
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2)
      
      const backupCall = mockLocalStorage.setItem.mock.calls.find(call => 
        call[0] === 'music-bubble-explorer-backup'
      )
      expect(backupCall).toBeDefined()
    })
  })

  describe('clearData', () => {
    it('should clear all data', () => {
      const result = DataManager.clearData()
      
      expect(result).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('music-bubble-explorer-data')
    })

    it('should create backup before clearing', () => {
      const existingData = {
        songs: [mockSong],
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      DataManager.clearData()
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'music-bubble-explorer-backup',
        expect.any(String)
      )
    })
  })

  describe('createBackup', () => {
    it('should create backup when data exists', () => {
      const existingData = JSON.stringify({
        songs: [mockSong],
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      })
      mockLocalStorage.getItem.mockReturnValue(existingData)
      mockLocalStorage.setItem.mockImplementation(() => {}) // Mock successful save
      
      const result = DataManager.createBackup()
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'music-bubble-explorer-backup',
        expect.stringMatching(/.*backedUpAt.*/)
      )
    })

    it('should handle no existing data', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.createBackup()
      
      expect(result).toBe(true)
    })
  })

  describe('restoreFromBackup', () => {
    it('should restore data from backup', () => {
      const backupData = {
        data: JSON.stringify({
          songs: [mockSong],
          version: '1.0.0',
          lastUpdated: '2023-01-01T00:00:00.000Z'
        }),
        backedUpAt: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(backupData))
      mockLocalStorage.setItem.mockImplementation(() => {}) // Mock successful save
      
      const result = DataManager.restoreFromBackup()
      
      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'music-bubble-explorer-data',
        backupData.data
      )
    })

    it('should handle no backup data', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.restoreFromBackup()
      
      expect(result).toBe(false)
    })
  })

  describe('getStorageUsage', () => {
    it('should calculate storage usage', () => {
      const testData = JSON.stringify({ songs: [mockSong] })
      mockLocalStorage.getItem.mockReturnValue(testData)
      
      const result = DataManager.getStorageUsage()
      
      expect(result.used).toBeGreaterThan(0)
      expect(result.available).toBe(5 * 1024 * 1024) // 5MB
      expect(result.percentage).toBeGreaterThan(0)
      expect(result.percentage).toBeLessThan(100)
    })

    it('should handle no data', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const result = DataManager.getStorageUsage()
      
      expect(result.used).toBe(0)
      expect(result.available).toBe(5 * 1024 * 1024)
      expect(result.percentage).toBe(0)
    })
  })

  describe('getDataStats', () => {
    it('should return data statistics', () => {
      const existingData = {
        songs: mockSongs,
        version: '1.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingData))
      
      const result = DataManager.getDataStats()
      
      expect(result.songCount).toBe(2)
      expect(result.peopleCount).toBeGreaterThan(0)
      expect(result.storageUsage).toBeDefined()
      expect(result.lastUpdated).toBe('2023-01-01T00:00:00.000Z')
      expect(result.version).toBe('1.0.0')
    })
  })

  describe('data migration', () => {
    it('should migrate data from version 0.0.0 to 1.0.0', () => {
      const oldData = {
        songs: [mockSong],
        version: '0.0.0',
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData))
      
      const result = DataManager.loadSongs()
      
      expect(result).toEqual([mockSong])
      // Migration should have been applied
    })

    it('should handle data without version', () => {
      const oldData = {
        songs: [mockSong],
        lastUpdated: '2023-01-01T00:00:00.000Z'
      }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldData))
      
      const result = DataManager.loadSongs()
      
      expect(result).toEqual([mockSong])
    })
  })
})