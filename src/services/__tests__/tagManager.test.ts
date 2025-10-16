import { describe, it, expect, beforeEach } from 'vitest'
import { TagManager } from '../tagManager'
import { MusicDatabase, Song } from '@/types/music'

describe('TagManager', () => {
  let mockDatabase: MusicDatabase
  let tagManager: TagManager

  const mockSongs: Song[] = [
    {
      id: 'song-1',
      title: 'テスト楽曲1',
      lyricists: ['作詞家A'],
      composers: ['作曲家A'],
      arrangers: ['編曲家A'],
      tags: ['バラード', 'アニメ', '感動']
    },
    {
      id: 'song-2',
      title: 'テスト楽曲2',
      lyricists: ['作詞家B'],
      composers: ['作曲家B'],
      arrangers: [],
      tags: ['ロック', 'アニメ', 'アップテンポ']
    },
    {
      id: 'song-3',
      title: 'テスト楽曲3',
      lyricists: ['作詞家A'],
      composers: ['作曲家C'],
      arrangers: ['編曲家B'],
      tags: ['バラード', '映画', '感動']
    },
    {
      id: 'song-4',
      title: 'テスト楽曲4',
      lyricists: ['作詞家C'],
      composers: ['作曲家A'],
      arrangers: [],
      tags: [] // タグなし
    }
  ]

  beforeEach(() => {
    mockDatabase = {
      songs: mockSongs,
      people: [],
      tags: []
    }
    tagManager = new TagManager(mockDatabase)
  })

  describe('extractTagsFromSongs', () => {
    it('should extract tags from songs correctly', () => {
      const tags = tagManager.extractTagsFromSongs()

      expect(tags).toHaveLength(6) // バラード, アニメ, 感動, ロック, アップテンポ, 映画
      
      const tagNames = tags.map(tag => tag.name)
      expect(tagNames).toContain('バラード')
      expect(tagNames).toContain('アニメ')
      expect(tagNames).toContain('感動')
      expect(tagNames).toContain('ロック')
      expect(tagNames).toContain('アップテンポ')
      expect(tagNames).toContain('映画')
    })

    it('should associate songs with tags correctly', () => {
      const tags = tagManager.extractTagsFromSongs()
      
      const balladTag = tags.find(tag => tag.name === 'バラード')
      expect(balladTag?.songs).toEqual(['song-1', 'song-3'])
      
      const animeTag = tags.find(tag => tag.name === 'アニメ')
      expect(animeTag?.songs).toEqual(['song-1', 'song-2'])
      
      const emotionTag = tags.find(tag => tag.name === '感動')
      expect(emotionTag?.songs).toEqual(['song-1', 'song-3'])
    })

    it('should generate correct tag IDs', () => {
      const tags = tagManager.extractTagsFromSongs()
      
      const balladTag = tags.find(tag => tag.name === 'バラード')
      expect(balladTag?.id).toBe('tag-バラード')
    })

    it('should handle songs without tags', () => {
      const tags = tagManager.extractTagsFromSongs()
      
      // song-4 has no tags, so it shouldn't appear in any tag's songs array
      tags.forEach(tag => {
        expect(tag.songs).not.toContain('song-4')
      })
    })

    it('should update database tags', () => {
      tagManager.extractTagsFromSongs()
      
      expect(mockDatabase.tags).toHaveLength(6)
      expect(mockDatabase.tags?.map(tag => tag.name)).toContain('バラード')
    })
  })

  describe('getTaggedSongs', () => {
    it('should return songs with specified tag', () => {
      const balladSongs = tagManager.getTaggedSongs('バラード')
      
      expect(balladSongs).toHaveLength(2)
      expect(balladSongs.map(song => song.id)).toEqual(['song-1', 'song-3'])
    })

    it('should return empty array for non-existent tag', () => {
      const songs = tagManager.getTaggedSongs('存在しないタグ')
      
      expect(songs).toEqual([])
    })

    it('should return empty array for empty tag name', () => {
      const songs = tagManager.getTaggedSongs('')
      
      expect(songs).toEqual([])
    })
  })

  describe('calculateTagPopularity', () => {
    it('should calculate popularity correctly', () => {
      expect(tagManager.calculateTagPopularity('バラード')).toBe(2)
      expect(tagManager.calculateTagPopularity('アニメ')).toBe(2)
      expect(tagManager.calculateTagPopularity('感動')).toBe(2)
      expect(tagManager.calculateTagPopularity('ロック')).toBe(1)
      expect(tagManager.calculateTagPopularity('アップテンポ')).toBe(1)
      expect(tagManager.calculateTagPopularity('映画')).toBe(1)
    })

    it('should return 0 for non-existent tag', () => {
      expect(tagManager.calculateTagPopularity('存在しないタグ')).toBe(0)
    })
  })

  describe('calculateTagBubbleSize', () => {
    it('should calculate size based on popularity', () => {
      const balladSize = tagManager.calculateTagBubbleSize('バラード') // popularity: 2
      const rockSize = tagManager.calculateTagBubbleSize('ロック') // popularity: 1
      
      expect(balladSize).toBeGreaterThan(rockSize)
      expect(balladSize).toBeGreaterThanOrEqual(45) // minimum size
      expect(balladSize).toBeLessThanOrEqual(130) // maximum size
    })

    it('should return minimum size for non-existent tag', () => {
      const size = tagManager.calculateTagBubbleSize('存在しないタグ')
      
      expect(size).toBe(45) // minimum size
    })

    it('should use logarithmic scale for natural distribution', () => {
      // Test with different popularity levels
      const sizes = [
        tagManager.calculateTagBubbleSize('バラード'), // popularity: 2
        tagManager.calculateTagBubbleSize('ロック') // popularity: 1
      ]
      
      // Sizes should be different and within valid range
      expect(sizes[0]).not.toBe(sizes[1])
      sizes.forEach(size => {
        expect(size).toBeGreaterThanOrEqual(45)
        expect(size).toBeLessThanOrEqual(130)
      })
    })
  })

  describe('getAllTags', () => {
    it('should return all tags', () => {
      const tags = tagManager.getAllTags()
      
      expect(tags).toHaveLength(6)
      expect(tags.map(tag => tag.name)).toContain('バラード')
      expect(tags.map(tag => tag.name)).toContain('アニメ')
    })

    it('should return a copy of tags array', () => {
      const tags1 = tagManager.getAllTags()
      const tags2 = tagManager.getAllTags()
      
      expect(tags1).not.toBe(tags2) // Different array instances
      expect(tags1).toEqual(tags2) // Same content
    })
  })

  describe('getTagById', () => {
    it('should return tag by ID', () => {
      const tag = tagManager.getTagById('tag-バラード')
      
      expect(tag?.name).toBe('バラード')
      expect(tag?.songs).toEqual(['song-1', 'song-3'])
    })

    it('should return undefined for non-existent ID', () => {
      const tag = tagManager.getTagById('tag-存在しない')
      
      expect(tag).toBeUndefined()
    })
  })

  describe('getTagByName', () => {
    it('should return tag by name', () => {
      const tag = tagManager.getTagByName('バラード')
      
      expect(tag?.id).toBe('tag-バラード')
      expect(tag?.songs).toEqual(['song-1', 'song-3'])
    })

    it('should return undefined for non-existent name', () => {
      const tag = tagManager.getTagByName('存在しない')
      
      expect(tag).toBeUndefined()
    })
  })

  describe('getTagsByPopularity', () => {
    it('should return tags sorted by popularity', () => {
      const tags = tagManager.getTagsByPopularity()
      
      expect(tags).toHaveLength(6)
      
      // Check that tags are sorted by song count (descending)
      for (let i = 0; i < tags.length - 1; i++) {
        expect(tags[i].songs.length).toBeGreaterThanOrEqual(tags[i + 1].songs.length)
      }
    })

    it('should not modify original tags array', () => {
      const originalTags = tagManager.getAllTags()
      const sortedTags = tagManager.getTagsByPopularity()
      
      expect(originalTags).not.toBe(sortedTags)
      // Original order should be preserved
      expect(tagManager.getAllTags()).toEqual(originalTags)
    })
  })

  describe('getTagsForSong', () => {
    it('should return tags for specified song', () => {
      const tags = tagManager.getTagsForSong('song-1')
      
      expect(tags).toHaveLength(3)
      expect(tags.map(tag => tag.name)).toContain('バラード')
      expect(tags.map(tag => tag.name)).toContain('アニメ')
      expect(tags.map(tag => tag.name)).toContain('感動')
    })

    it('should return empty array for song without tags', () => {
      const tags = tagManager.getTagsForSong('song-4')
      
      expect(tags).toEqual([])
    })

    it('should return empty array for non-existent song', () => {
      const tags = tagManager.getTagsForSong('non-existent')
      
      expect(tags).toEqual([])
    })
  })

  describe('getTagStats', () => {
    it('should return correct statistics', () => {
      const stats = tagManager.getTagStats()
      
      expect(stats.totalTags).toBe(6)
      expect(stats.averageSongsPerTag).toBeCloseTo(1.5, 1) // Total 9 tag-song associations / 6 tags
      expect(stats.mostPopularTag?.name).toBe('バラード') // or any tag with 2 songs
      expect(stats.mostPopularTag?.songCount).toBe(2)
      expect(stats.leastPopularTag?.songCount).toBe(1)
    })

    it('should handle empty tags', () => {
      const emptyDatabase: MusicDatabase = { songs: [], people: [], tags: [] }
      const emptyTagManager = new TagManager(emptyDatabase)
      
      const stats = emptyTagManager.getTagStats()
      
      expect(stats.totalTags).toBe(0)
      expect(stats.averageSongsPerTag).toBe(0)
      expect(stats.mostPopularTag).toBeNull()
      expect(stats.leastPopularTag).toBeNull()
    })
  })

  describe('updateMusicDatabase', () => {
    it('should update database and re-extract tags', () => {
      const newSongs: Song[] = [
        {
          id: 'new-song',
          title: '新しい楽曲',
          lyricists: ['新作詞家'],
          composers: ['新作曲家'],
          arrangers: [],
          tags: ['新ジャンル', 'テスト']
        }
      ]
      
      const newDatabase: MusicDatabase = {
        songs: newSongs,
        people: [],
        tags: []
      }
      
      tagManager.updateMusicDatabase(newDatabase)
      
      const tags = tagManager.getAllTags()
      expect(tags).toHaveLength(2) // 新ジャンル, テスト
      expect(tags.map(tag => tag.name)).toContain('新ジャンル')
      expect(tags.map(tag => tag.name)).toContain('テスト')
    })
  })

  describe('addTagsFromSong', () => {
    it('should add new tags from song', () => {
      const newSong: Song = {
        id: 'new-song',
        title: '新楽曲',
        lyricists: [],
        composers: [],
        arrangers: [],
        tags: ['新タグ1', '新タグ2', 'バラード'] // バラードは既存
      }
      
      tagManager.addTagsFromSong(newSong)
      
      const tags = tagManager.getAllTags()
      expect(tags.map(tag => tag.name)).toContain('新タグ1')
      expect(tags.map(tag => tag.name)).toContain('新タグ2')
      
      // 既存のバラードタグに新楽曲が追加されているか確認
      const balladTag = tagManager.getTagByName('バラード')
      expect(balladTag?.songs).toContain('new-song')
    })

    it('should handle song without tags', () => {
      const originalTagCount = tagManager.getAllTags().length
      
      const newSong: Song = {
        id: 'no-tags-song',
        title: 'タグなし楽曲',
        lyricists: [],
        composers: [],
        arrangers: [],
        tags: []
      }
      
      tagManager.addTagsFromSong(newSong)
      
      expect(tagManager.getAllTags()).toHaveLength(originalTagCount)
    })
  })

  describe('removeSongFromTags', () => {
    it('should remove song from all tags', () => {
      tagManager.removeSongFromTags('song-1')
      
      const balladTag = tagManager.getTagByName('バラード')
      expect(balladTag?.songs).not.toContain('song-1')
      expect(balladTag?.songs).toContain('song-3') // song-3 should still be there
      
      const animeTag = tagManager.getTagByName('アニメ')
      expect(animeTag?.songs).not.toContain('song-1')
      expect(animeTag?.songs).toContain('song-2') // song-2 should still be there
    })

    it('should remove tags with no songs', () => {
      // Remove all songs that have 'ロック' tag
      tagManager.removeSongFromTags('song-2')
      
      const rockTag = tagManager.getTagByName('ロック')
      expect(rockTag).toBeUndefined() // Should be removed since no songs left
    })

    it('should handle non-existent song ID', () => {
      const originalTagCount = tagManager.getAllTags().length
      
      tagManager.removeSongFromTags('non-existent')
      
      expect(tagManager.getAllTags()).toHaveLength(originalTagCount)
    })
  })

  describe('searchTags', () => {
    it('should find tags by partial name match', () => {
      const results = tagManager.searchTags('ア')
      
      expect(results.map(tag => tag.name)).toContain('アニメ')
      expect(results.map(tag => tag.name)).toContain('アップテンポ')
    })

    it('should be case insensitive', () => {
      const results = tagManager.searchTags('アニメ'.toLowerCase())
      
      expect(results.map(tag => tag.name)).toContain('アニメ')
    })

    it('should return empty array for no matches', () => {
      const results = tagManager.searchTags('存在しない検索語')
      
      expect(results).toEqual([])
    })
  })

  describe('getRelatedTags', () => {
    it('should return tags that appear with target tag', () => {
      const relatedTags = tagManager.getRelatedTags('バラード')
      
      expect(relatedTags.map(tag => tag.name)).toContain('アニメ') // song-1 has both
      expect(relatedTags.map(tag => tag.name)).toContain('感動') // song-1 and song-3 have both
      expect(relatedTags.map(tag => tag.name)).toContain('映画') // song-3 has both
      expect(relatedTags.map(tag => tag.name)).not.toContain('バラード') // Should not include itself
    })

    it('should return empty array for non-existent tag', () => {
      const relatedTags = tagManager.getRelatedTags('存在しない')
      
      expect(relatedTags).toEqual([])
    })

    it('should sort by popularity', () => {
      const relatedTags = tagManager.getRelatedTags('バラード')
      
      // Should be sorted by song count (descending)
      for (let i = 0; i < relatedTags.length - 1; i++) {
        expect(relatedTags[i].songs.length).toBeGreaterThanOrEqual(relatedTags[i + 1].songs.length)
      }
    })
  })

  describe('calculateTagCooccurrence', () => {
    it('should calculate co-occurrence correctly', () => {
      const cooccurrence = tagManager.calculateTagCooccurrence('バラード', '感動')
      
      expect(cooccurrence).toBe(2) // song-1 and song-3 have both tags
    })

    it('should return 0 for non-co-occurring tags', () => {
      const cooccurrence = tagManager.calculateTagCooccurrence('バラード', 'ロック')
      
      expect(cooccurrence).toBe(0) // No songs have both tags
    })

    it('should return 0 for non-existent tags', () => {
      const cooccurrence = tagManager.calculateTagCooccurrence('存在しない1', '存在しない2')
      
      expect(cooccurrence).toBe(0)
    })
  })

  describe('getRandomTag', () => {
    it('should return a random tag', () => {
      const tag = tagManager.getRandomTag()
      
      expect(tag).toBeDefined()
      expect(tagManager.getAllTags().map(t => t.name)).toContain(tag!.name)
    })

    it('should return null for empty tags', () => {
      const emptyDatabase: MusicDatabase = { songs: [], people: [], tags: [] }
      const emptyTagManager = new TagManager(emptyDatabase)
      
      const tag = emptyTagManager.getRandomTag()
      
      expect(tag).toBeNull()
    })
  })

  describe('getWeightedRandomTag', () => {
    it('should return a weighted random tag', () => {
      const tag = tagManager.getWeightedRandomTag()
      
      expect(tag).toBeDefined()
      expect(tagManager.getAllTags().map(t => t.name)).toContain(tag!.name)
    })

    it('should return null for empty tags', () => {
      const emptyDatabase: MusicDatabase = { songs: [], people: [], tags: [] }
      const emptyTagManager = new TagManager(emptyDatabase)
      
      const tag = emptyTagManager.getWeightedRandomTag()
      
      expect(tag).toBeNull()
    })

    it('should fallback to regular random when no popularity', () => {
      // Create database with tags but no songs
      const noSongsDatabase: MusicDatabase = {
        songs: [],
        people: [],
        tags: []
      }
      const noSongsTagManager = new TagManager(noSongsDatabase)
      
      // Add a tag manually after initialization
      noSongsTagManager['tags'] = [{ id: 'tag-test', name: 'test', songs: [] }]
      
      const tag = noSongsTagManager.getWeightedRandomTag()
      
      expect(tag?.name).toBe('test')
    })
  })
})