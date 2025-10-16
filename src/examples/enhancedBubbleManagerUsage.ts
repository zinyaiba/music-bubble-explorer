/**
 * Enhanced Bubble Manager Usage Example
 * 
 * Demonstrates how to use the EnhancedBubbleManager for visual distinction,
 * unique bubble generation, and integrated rendering.
 */

import { EnhancedBubbleManager } from '../services/enhancedBubbleManager';
import { DEFAULT_BUBBLE_CONFIG } from '../services/bubbleManager';
import type { MusicDatabase } from '../types/music';

// Example music database
const exampleMusicDatabase: MusicDatabase = {
  songs: [
    {
      id: 'song1',
      title: 'Beautiful Song',
      lyricists: ['Alice Johnson'],
      composers: ['Bob Smith'],
      arrangers: ['Charlie Brown'],
      tags: ['pop', 'love']
    },
    {
      id: 'song2', 
      title: 'Rock Anthem',
      lyricists: ['Bob Smith'], // Same person as composer - will be consolidated
      composers: ['Bob Smith'],
      arrangers: ['David Wilson'],
      tags: ['rock', 'energy']
    }
  ],
  people: [
    {
      id: 'person1',
      name: 'Alice Johnson',
      type: 'lyricist',
      songs: ['song1']
    },
    {
      id: 'person2',
      name: 'Bob Smith',
      type: 'composer',
      songs: ['song1', 'song2']
    },
    {
      id: 'person3',
      name: 'Charlie Brown',
      type: 'arranger',
      songs: ['song1']
    },
    {
      id: 'person4',
      name: 'David Wilson',
      type: 'arranger',
      songs: ['song2']
    }
  ],
  tags: [
    {
      id: 'tag1',
      name: 'pop',
      songs: ['song1']
    },
    {
      id: 'tag2',
      name: 'love',
      songs: ['song1']
    },
    {
      id: 'tag3',
      name: 'rock',
      songs: ['song2']
    },
    {
      id: 'tag4',
      name: 'energy',
      songs: ['song2']
    }
  ]
};

/**
 * Example usage of EnhancedBubbleManager
 */
export function demonstrateEnhancedBubbleManager() {
  console.log('=== Enhanced Bubble Manager Demo ===');
  
  // Create enhanced bubble manager
  const manager = new EnhancedBubbleManager(exampleMusicDatabase, {
    ...DEFAULT_BUBBLE_CONFIG,
    maxBubbles: 10
  });
  
  console.log('1. Enhanced systems initialized');
  
  // Get consolidated persons (shows multi-role detection)
  const consolidatedPersons = manager.getConsolidatedPersons();
  console.log('2. Consolidated persons:', consolidatedPersons.map(p => ({
    name: p.name,
    roles: p.roles.map(r => r.type),
    isMultiRole: p.roles.length > 1,
    totalSongs: p.totalRelatedCount
  })));
  
  // Generate unique bubbles
  console.log('3. Generating unique bubbles:');
  const bubbles = [];
  for (let i = 0; i < 5; i++) {
    const bubble = manager.generateUniqueBubble();
    if (bubble) {
      bubbles.push(bubble);
      console.log(`   Bubble ${i + 1}:`, {
        name: bubble.name,
        visualType: bubble.visualType,
        iconType: bubble.iconType,
        shapeType: bubble.shapeType,
        isMultiRole: bubble.isMultiRole,
        roles: bubble.roles?.map(r => r.type)
      });
    }
  }
  
  // Show registry statistics
  const stats = manager.getEnhancedStats();
  console.log('4. Enhanced statistics:', {
    totalBubbles: stats.totalBubbles,
    consolidatedPersons: stats.consolidatedPersons,
    multiRolePersons: stats.multiRolePersons,
    registryStats: stats.registry
  });
  
  // Demonstrate visual style application
  console.log('5. Visual styles applied:');
  bubbles.forEach((bubble, index) => {
    manager.applyVisualStyle(bubble);
    console.log(`   Bubble ${index + 1} style:`, {
      primaryColor: bubble.style.primaryColor,
      secondaryColor: bubble.style.secondaryColor,
      iconType: bubble.iconType,
      shapeType: bubble.shapeType
    });
  });
  
  // Demonstrate rendering (mock canvas context)
  console.log('6. Rendering demonstration:');
  const mockCanvas = document.createElement('canvas');
  const ctx = mockCanvas.getContext('2d');
  
  if (ctx) {
    bubbles.forEach((bubble, index) => {
      console.log(`   Rendering bubble ${index + 1} with integrated icon and shape`);
      manager.renderBubbleWithIcon(bubble, ctx);
    });
  }
  
  // Show duplicate prevention
  console.log('7. Duplicate prevention test:');
  const registry = manager.getBubbleRegistry();
  const availableBefore = registry.getAvailableContent().length;
  
  // Try to generate more bubbles than available content
  let duplicateAttempts = 0;
  for (let i = 0; i < 20; i++) {
    const bubble = manager.generateUniqueBubble();
    if (!bubble) {
      duplicateAttempts++;
    }
  }
  
  const availableAfter = registry.getAvailableContent().length;
  console.log(`   Available content: ${availableBefore} -> ${availableAfter}`);
  console.log(`   Duplicate prevention triggered: ${duplicateAttempts} times`);
  
  // Cleanup
  manager.reset();
  console.log('8. Enhanced systems reset completed');
  
  return {
    manager,
    consolidatedPersons,
    bubbles,
    stats
  };
}

/**
 * Example of canvas rendering with enhanced bubbles
 */
export function demonstrateEnhancedRendering(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const manager = new EnhancedBubbleManager(exampleMusicDatabase, {
    ...DEFAULT_BUBBLE_CONFIG,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    maxBubbles: 8
  });
  
  // Generate and render enhanced bubbles
  const bubbles = [];
  for (let i = 0; i < 6; i++) {
    const bubble = manager.generateUniqueBubble();
    if (bubble) {
      // Position bubbles in a grid
      bubble.x = (i % 3) * 200 + 100;
      bubble.y = Math.floor(i / 3) * 200 + 100;
      bubble.size = 80;
      
      manager.applyVisualStyle(bubble);
      bubbles.push(bubble);
    }
  }
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render each enhanced bubble
  bubbles.forEach(bubble => {
    manager.renderBubbleWithIcon(bubble, ctx);
    
    // Add text label
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(bubble.name, bubble.x, bubble.y + bubble.size/2 + 20);
    ctx.fillText(`${bubble.visualType}${bubble.isMultiRole ? ' (multi)' : ''}`, 
                 bubble.x, bubble.y + bubble.size/2 + 35);
  });
  
  return bubbles;
}

// Export for use in other modules
export { EnhancedBubbleManager };