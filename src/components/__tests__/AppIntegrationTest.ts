/**
 * App Integration Test
 * Tests the main application integration between components and services
 */

import { MusicDataService } from '../../services/musicDataService'
import { BubbleManager, DEFAULT_BUBBLE_CONFIG } from '../../services/bubbleManager'

export function runAppIntegrationTest(): boolean {
  console.log('🧪 Running App Integration Test...')
  
  try {
    // Test 1: MusicDataService initialization
    console.log('  ✓ Testing MusicDataService initialization...')
    const musicService = MusicDataService.getInstance()
    const songs = musicService.getAllSongs()
    const people = musicService.getAllPeople()
    
    if (songs.length === 0) {
      throw new Error('No songs loaded')
    }
    if (people.length === 0) {
      throw new Error('No people loaded')
    }
    
    console.log(`    - Loaded ${songs.length} songs and ${people.length} people`)
    
    // Test 2: BubbleManager initialization
    console.log('  ✓ Testing BubbleManager initialization...')
    const musicDatabase = { songs, people, tags: [] }
    const config = {
      ...DEFAULT_BUBBLE_CONFIG,
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10
    }
    
    const bubbleManager = new BubbleManager(musicDatabase, config)
    
    // Test 3: Bubble generation
    console.log('  ✓ Testing bubble generation...')
    const testBubbles = []
    for (let i = 0; i < 5; i++) {
      const bubble = bubbleManager.generateBubble()
      testBubbles.push(bubble)
      bubbleManager.addBubble(bubble)
    }
    
    if (testBubbles.length !== 5) {
      throw new Error('Failed to generate expected number of bubbles')
    }
    
    console.log(`    - Generated ${testBubbles.length} test bubbles`)
    
    // Test 4: Bubble types validation
    console.log('  ✓ Testing bubble types...')
    const bubbleTypes = testBubbles.map(b => b.type)
    const validTypes = ['song', 'lyricist', 'composer', 'arranger']
    const hasValidTypes = bubbleTypes.every(type => validTypes.includes(type))
    
    if (!hasValidTypes) {
      throw new Error('Invalid bubble types generated')
    }
    
    console.log(`    - All bubble types are valid: ${[...new Set(bubbleTypes)].join(', ')}`)
    
    // Test 5: Bubble physics update
    console.log('  ✓ Testing bubble physics...')
    const updatedBubbles = bubbleManager.updateFrame()
    
    if (updatedBubbles.length === 0) {
      throw new Error('No bubbles after physics update')
    }
    
    console.log(`    - Physics update successful: ${updatedBubbles.length} bubbles active`)
    
    // Test 6: Data relationships
    console.log('  ✓ Testing data relationships...')
    const firstSong = songs[0]
    const relatedPeople = musicService.getPeopleForSong(firstSong.id)
    
    if (relatedPeople.length === 0) {
      throw new Error('No related people found for song')
    }
    
    console.log(`    - Song "${firstSong.title}" has ${relatedPeople.length} related people`)
    
    console.log('✅ App Integration Test PASSED - All components integrated successfully!')
    return true
    
  } catch (error) {
    console.error('❌ App Integration Test FAILED:', error)
    return false
  }
}

// Auto-run test in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    runAppIntegrationTest()
  }, 1000)
}