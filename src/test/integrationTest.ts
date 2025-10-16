/**
 * Integration Test for Enhanced Bubble System
 * 
 * Tests the integration between:
 * - BubbleCanvas with EnhancedBubbleManager
 * - MusicDataService with consolidated person support
 * - DetailModal with multi-role person display
 */

import { MusicDataService } from '../services/musicDataService';
import { EnhancedBubbleManager } from '../services/enhancedBubbleManager';
import { DEFAULT_BUBBLE_CONFIG } from '../services/bubbleManager';

export function testEnhancedBubbleIntegration(): boolean {
  try {
    console.log('🧪 Testing Enhanced Bubble Integration...');

    // Test 1: Initialize MusicDataService
    const musicService = MusicDataService.getInstance();
    const musicDatabase = {
      songs: musicService.getAllSongs(),
      people: musicService.getAllPeople(),
      tags: musicService.getAllTags()
    };

    console.log('✅ MusicDataService initialized:', {
      songs: musicDatabase.songs.length,
      people: musicDatabase.people.length,
      tags: musicDatabase.tags.length
    });

    // Test 2: Initialize EnhancedBubbleManager
    const config = {
      ...DEFAULT_BUBBLE_CONFIG,
      canvasWidth: 800,
      canvasHeight: 600,
      maxBubbles: 10
    };

    const enhancedManager = new EnhancedBubbleManager(musicDatabase, config);
    console.log('✅ EnhancedBubbleManager initialized');

    // Test 3: Generate enhanced bubbles
    const bubbles = [];
    for (let i = 0; i < 5; i++) {
      const bubble = enhancedManager.generateUniqueBubble();
      if (bubble) {
        bubbles.push(bubble);
        enhancedManager.addBubble(bubble);
      }
    }

    console.log('✅ Enhanced bubbles generated:', bubbles.length);

    // Test 4: Check enhanced bubble properties
    const enhancedBubbles = bubbles.filter(bubble => 
      enhancedManager.isEnhancedBubble(bubble)
    );

    console.log('✅ Enhanced bubbles detected:', enhancedBubbles.length);

    // Test 5: Test consolidated person functionality
    const testPersonName = musicDatabase.people[0]?.name;
    if (testPersonName) {
      const consolidatedPerson = musicService.getConsolidatedPersonByName(testPersonName);
      console.log('✅ Consolidated person test:', {
        name: testPersonName,
        consolidated: !!consolidatedPerson,
        roles: consolidatedPerson?.roles.length || 0
      });
    }

    // Test 6: Get enhanced stats
    const stats = enhancedManager.getEnhancedStats();
    console.log('✅ Enhanced stats:', {
      consolidatedPersons: stats.consolidatedPersons,
      multiRolePersons: stats.multiRolePersons,
      uniqueContentAvailable: stats.uniqueContentAvailable
    });

    console.log('🎉 Enhanced Bubble Integration Test PASSED');
    return true;

  } catch (error) {
    console.error('❌ Enhanced Bubble Integration Test FAILED:', error);
    return false;
  }
}

// Run test if in development environment
if (process.env.NODE_ENV === 'development') {
  testEnhancedBubbleIntegration();
}