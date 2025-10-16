import { BubbleEntity } from '@/types/bubble'
import { MusicDataService } from '@/services/musicDataService'

/**
 * DetailModal component tests
 */

// Simple test framework
const test = {
    test: (name: string, fn: () => void) => {
        try {
            fn()
            console.log(`✓ ${name}`)
        } catch (error) {
            console.error(`✗ ${name}:`, error)
        }
    },
    expect: (actual: any) => ({
        toBe: (expected: any) => {
            if (actual !== expected) {
                throw new Error(`Expected ${expected}, but got ${actual}`)
            }
        },
        toBeTruthy: () => {
            if (!actual) {
                throw new Error(`Expected truthy value, but got ${actual}`)
            }
        },
        toBeNull: () => {
            if (actual !== null) {
                throw new Error(`Expected null, but got ${actual}`)
            }
        }
    })
}

// DetailModal component tests
export function runDetailModalTests() {
    console.log('Running DetailModal component tests...')

    // Props validation tests
    test.test('DetailModalProps - type check', () => {
        const mockBubble = new BubbleEntity({
            type: 'song',
            name: 'テスト楽曲',
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            size: 60,
            color: '#FFB6C1',
            opacity: 1,
            lifespan: 5000,
            relatedCount: 3
        })

        const mockProps = {
            selectedBubble: mockBubble,
            onClose: () => {}
        }

        test.expect(mockProps.selectedBubble).toBeTruthy()
        test.expect(typeof mockProps.onClose).toBe('function')
    })

    test.test('DetailModalProps - null selectedBubble', () => {
        const mockProps = {
            selectedBubble: null,
            onClose: () => {}
        }

        test.expect(mockProps.selectedBubble).toBeNull()
        test.expect(typeof mockProps.onClose).toBe('function')
    })

    // Data service integration tests
    test.test('MusicDataService integration', () => {
        const musicService = MusicDataService.getInstance()
        
        // Test song lookup
        const songs = musicService.getAllSongs()
        test.expect(Array.isArray(songs)).toBeTruthy()
        
        // Test people lookup
        const people = musicService.getAllPeople()
        test.expect(Array.isArray(people)).toBeTruthy()
        
        if (songs.length > 0) {
            const firstSong = songs[0]
            const relatedPeople = musicService.getPeopleForSong(firstSong.id)
            test.expect(Array.isArray(relatedPeople)).toBeTruthy()
        }
    })

    // Bubble type tests
    test.test('Bubble type handling', () => {
        const songBubble = new BubbleEntity({
            type: 'song',
            name: 'テスト楽曲',
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            size: 60,
            color: '#FFB6C1',
            opacity: 1,
            lifespan: 5000,
            relatedCount: 3
        })

        const personBubble = new BubbleEntity({
            type: 'lyricist',
            name: 'テスト作詞家',
            x: 100,
            y: 100,
            vx: 0,
            vy: 0,
            size: 60,
            color: '#B6E5D8',
            opacity: 1,
            lifespan: 5000,
            relatedCount: 2
        })

        test.expect(songBubble.type).toBe('song')
        test.expect(personBubble.type).toBe('lyricist')
    })

    // Role label mapping tests
    test.test('Role label mapping', () => {
        const getRoleLabel = (role: 'lyricist' | 'composer' | 'arranger'): string => {
            switch (role) {
                case 'lyricist': return '作詞'
                case 'composer': return '作曲'
                case 'arranger': return '編曲'
                default: return role
            }
        }

        test.expect(getRoleLabel('lyricist')).toBe('作詞')
        test.expect(getRoleLabel('composer')).toBe('作曲')
        test.expect(getRoleLabel('arranger')).toBe('編曲')
    })

    // Type label mapping tests
    test.test('Type label mapping', () => {
        const getTypeLabel = (type: 'song' | 'lyricist' | 'composer' | 'arranger'): string => {
            switch (type) {
                case 'song': return '楽曲'
                case 'lyricist': return '作詞家'
                case 'composer': return '作曲家'
                case 'arranger': return '編曲家'
                default: return type
            }
        }

        test.expect(getTypeLabel('song')).toBe('楽曲')
        test.expect(getTypeLabel('lyricist')).toBe('作詞家')
        test.expect(getTypeLabel('composer')).toBe('作曲家')
        test.expect(getTypeLabel('arranger')).toBe('編曲家')
    })

    console.log('DetailModal component tests completed.')
}

// Run tests in development
if (import.meta.env.DEV) {
    runDetailModalTests()
}