import { describe, it, expect } from 'vitest'
import {
  validateUrl,
  validateUrlLength,
  validateTextLength,
  validateReleaseYear,
  validateArtists,
  validateDetailPageUrls,
  parseCommaSeparated,
  formatCommaSeparated,
} from '../songFormValidation'

describe('songFormValidation', () => {
  describe('validateUrl', () => {
    it('should accept valid HTTP URLs', () => {
      const result = validateUrl('http://example.com')
      expect(result.isValid).toBe(true)
    })

    it('should accept valid HTTPS URLs', () => {
      const result = validateUrl('https://example.com/path')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid URL format', () => {
      const result = validateUrl('not-a-url')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should accept empty string as valid (optional field)', () => {
      const result = validateUrl('')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateUrlLength', () => {
    it('should accept URLs within length limit', () => {
      const result = validateUrlLength('https://example.com', 500)
      expect(result.isValid).toBe(true)
    })

    it('should reject URLs exceeding length limit', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(500)
      const result = validateUrlLength(longUrl, 500)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateTextLength', () => {
    it('should accept text within length limit', () => {
      const result = validateTextLength('Test text', 200)
      expect(result.isValid).toBe(true)
    })

    it('should reject text exceeding length limit', () => {
      const longText = 'a'.repeat(201)
      const result = validateTextLength(longText, 200)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateReleaseYear', () => {
    it('should accept valid 4-digit year', () => {
      const result = validateReleaseYear('2024')
      expect(result.isValid).toBe(true)
    })

    it('should reject non-numeric input', () => {
      const result = validateReleaseYear('abc')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject year below 1000', () => {
      const result = validateReleaseYear('999')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject year above 9999', () => {
      const result = validateReleaseYear('10000')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should accept empty string as valid (optional field)', () => {
      const result = validateReleaseYear('')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateArtists', () => {
    it('should accept comma-separated artists', () => {
      const result = validateArtists('Artist A, Artist B')
      expect(result.isValid).toBe(true)
    })

    it('should reject text exceeding 200 characters', () => {
      const longText = 'a'.repeat(201)
      const result = validateArtists(longText)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateDetailPageUrls', () => {
    it('should accept valid URL array', () => {
      const urls = ['https://example.com', 'http://test.com']
      const result = validateDetailPageUrls(urls)
      expect(result.isValid).toBe(true)
    })

    it('should reject more than 10 URLs', () => {
      const urls = Array(11).fill('https://example.com')
      const result = validateDetailPageUrls(urls)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject invalid URL in array', () => {
      const urls = ['https://example.com', 'not-a-url']
      const result = validateDetailPageUrls(urls)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('parseCommaSeparated', () => {
    it('should parse comma-separated string into array', () => {
      const result = parseCommaSeparated('Item A, Item B, Item C')
      expect(result).toEqual(['Item A', 'Item B', 'Item C'])
    })

    it('should trim whitespace from items', () => {
      const result = parseCommaSeparated('  Item A  ,  Item B  ')
      expect(result).toEqual(['Item A', 'Item B'])
    })

    it('should return empty array for empty string', () => {
      const result = parseCommaSeparated('')
      expect(result).toEqual([])
    })
  })

  describe('formatCommaSeparated', () => {
    it('should format array into comma-separated string', () => {
      const result = formatCommaSeparated(['Item A', 'Item B', 'Item C'])
      expect(result).toBe('Item A, Item B, Item C')
    })

    it('should return empty string for empty array', () => {
      const result = formatCommaSeparated([])
      expect(result).toBe('')
    })
  })
})
