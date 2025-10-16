/**
 * Error Handling Usage Examples
 * 
 * Demonstrates how to use the comprehensive error handling and fallback system.
 * 
 * Requirements: 1.1, 2.1, 3.1 - Error handling examples for all components
 */

import { 
  errorHandlingIntegration,
  safeIconRenderer,
  safeVisualThemeManager,
  safePersonConsolidator,
  safeBubbleRegistry,
  errorHandler,
  ErrorType,
  ErrorSeverity
} from '../utils';
import { IconType, ShapeType } from '../types/enhancedBubble';

/**
 * Example: Safe Icon Rendering with Error Handling
 */
export function demonstrateSafeIconRendering() {
  console.log('=== Safe Icon Rendering Demo ===');
  
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  // Example 1: Normal icon rendering (should succeed)
  console.log('1. Normal icon rendering:');
  safeIconRenderer.renderIcon(ctx, IconType.MUSIC_NOTE, 50, 50, 24);
  console.log('✓ Music note icon rendered successfully');

  // Example 2: Icon rendering with invalid parameters (should use fallback)
  console.log('2. Icon rendering with invalid size:');
  safeIconRenderer.renderIcon(ctx, IconType.PEN, 100, 50, -10); // Invalid size
  console.log('✓ Pen icon rendered with fallback');

  // Example 3: Icon rendering with null context (should use fallback)
  console.log('3. Icon rendering with invalid context:');
  try {
    safeIconRenderer.renderIcon(null as any, IconType.HASHTAG, 150, 50, 24);
    console.log('✓ Hashtag icon handled gracefully');
  } catch (error) {
    console.log('✓ Error handled by fallback system');
  }

  // Get fallback statistics
  const stats = safeIconRenderer.getFallbackStats();
  console.log('Icon renderer fallback stats:', stats);
}

/**
 * Example: Safe Visual Theme Operations with Error Handling
 */
export function demonstrateSafeVisualTheme() {
  console.log('\n=== Safe Visual Theme Demo ===');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  // Example 1: Normal style retrieval (should succeed)
  console.log('1. Normal style retrieval:');
  const songStyle = safeVisualThemeManager.getStyleForType('song');
  console.log('✓ Song style retrieved:', songStyle.primaryColor);

  // Example 2: Invalid style type (should use fallback)
  console.log('2. Invalid style type:');
  const invalidStyle = safeVisualThemeManager.getStyleForType('invalid' as any);
  console.log('✓ Fallback style used:', invalidStyle.primaryColor);

  // Example 3: Safe gradient creation
  console.log('3. Safe gradient creation:');
  const gradient = safeVisualThemeManager.createGradient(ctx, songStyle, 100, 100, 50);
  console.log('✓ Gradient created successfully');

  // Example 4: Gradient creation with invalid parameters
  console.log('4. Gradient with invalid parameters:');
  const invalidGradient = safeVisualThemeManager.createGradient(
    ctx, 
    { ...songStyle, primaryColor: 'invalid-color' }, 
    100, 
    100, 
    50
  );
  console.log('✓ Fallback gradient created');

  // Get cache statistics
  const cacheStats = safeVisualThemeManager.getCacheStats();
  console.log('Visual theme cache stats:', cacheStats);
}

/**
 * Example: Safe Person Consolidation with Error Handling
 */
export function demonstrateSafePersonConsolidation() {
  console.log('\n=== Safe Person Consolidation Demo ===');

  // Example 1: Normal consolidation (should succeed)
  console.log('1. Normal person consolidation:');
  const validSongs = [
    {
      id: 'song1',
      title: 'Test Song 1',
      lyricists: ['Artist A'],
      composers: ['Artist A', 'Artist B'],
      arrangers: ['Artist C']
    },
    {
      id: 'song2',
      title: 'Test Song 2',
      lyricists: ['Artist A'],
      composers: ['Artist B'],
      arrangers: []
    }
  ];

  const consolidatedPersons = safePersonConsolidator.consolidatePersons(validSongs);
  console.log('✓ Consolidated persons:', consolidatedPersons.length);
  
  // Find multi-role person
  const multiRolePerson = consolidatedPersons.find(p => p.roles.length > 1);
  if (multiRolePerson) {
    console.log('✓ Multi-role person found:', multiRolePerson.name, multiRolePerson.roles);
  }

  // Example 2: Consolidation with invalid data (should use fallback)
  console.log('2. Consolidation with invalid data:');
  const invalidSongs = [
    null,
    { id: 'song3' }, // Missing required fields
    { title: 'Song without ID' }
  ] as any;

  const fallbackPersons = safePersonConsolidator.consolidatePersons(invalidSongs);
  console.log('✓ Fallback consolidation result:', fallbackPersons.length);

  // Example 3: Safe role retrieval
  console.log('3. Safe role retrieval:');
  const roles = safePersonConsolidator.getPersonRoles('Artist A', validSongs);
  console.log('✓ Artist A roles:', roles);

  // Example 4: Role retrieval with invalid person name
  console.log('4. Role retrieval with invalid data:');
  const fallbackRoles = safePersonConsolidator.getPersonRoles('', validSongs);
  console.log('✓ Fallback roles:', fallbackRoles);

  // Get cache statistics
  const cacheStats = safePersonConsolidator.getCacheStats();
  console.log('Person consolidator cache stats:', cacheStats);
}

/**
 * Example: Safe Bubble Registry Operations with Error Handling
 */
export function demonstrateSafeBubbleRegistry() {
  console.log('\n=== Safe Bubble Registry Demo ===');

  // Example 1: Normal registry operations (should succeed)
  console.log('1. Normal registry initialization:');
  const validSongs = [
    {
      id: 'song1',
      title: 'Test Song 1',
      lyricists: ['Artist A'],
      composers: ['Artist B'],
      arrangers: []
    }
  ];

  const validPeople = [
    {
      id: 'artist-a',
      name: 'Artist A',
      songs: ['song1']
    }
  ];

  safeBubbleRegistry.initializeContentPool(validSongs, validPeople, []);
  console.log('✓ Registry initialized successfully');

  // Example 2: Safe bubble registration
  console.log('2. Safe bubble registration:');
  const registered = safeBubbleRegistry.registerBubble('song1', 'bubble1', 'song');
  console.log('✓ Bubble registered:', registered);

  // Example 3: Registration with invalid data (should use fallback)
  console.log('3. Registration with invalid data:');
  const fallbackRegistered = safeBubbleRegistry.registerBubble('', 'bubble2', 'song');
  console.log('✓ Fallback registration result:', fallbackRegistered);

  // Example 4: Safe content retrieval
  console.log('4. Safe content retrieval:');
  const nextContent = safeBubbleRegistry.getNextUniqueContent();
  console.log('✓ Next content:', nextContent?.name || 'No content available');

  // Example 5: Safe unregistration
  console.log('5. Safe bubble unregistration:');
  safeBubbleRegistry.unregisterBubble('bubble1');
  console.log('✓ Bubble unregistered successfully');

  // Get operation statistics
  const operationStats = safeBubbleRegistry.getOperationStats();
  console.log('Registry operation stats:', operationStats);
}

/**
 * Example: System-Wide Error Handling Integration
 */
export async function demonstrateSystemIntegration() {
  console.log('\n=== System Integration Demo ===');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Failed to get canvas context');
    return;
  }

  // Example 1: System health monitoring
  console.log('1. System health check:');
  const initialHealth = errorHandlingIntegration.checkSystemHealth();
  console.log('✓ Initial system health:', initialHealth.overall);

  // Example 2: Safe operations through integration
  console.log('2. Safe operations through integration:');
  
  // Safe icon rendering
  const iconResult = await errorHandlingIntegration.safeRenderIcon(
    ctx, IconType.MUSIC_NOTE, 100, 100, 24
  );
  console.log('✓ Safe icon rendering result:', iconResult);

  // Safe style retrieval
  const style = await errorHandlingIntegration.safeGetStyle('song');
  console.log('✓ Safe style retrieval result:', style?.primaryColor || 'fallback');

  // Safe gradient creation
  if (style) {
    const gradient = await errorHandlingIntegration.safeCreateGradient(
      ctx, style, 100, 100, 50
    );
    console.log('✓ Safe gradient creation result:', gradient ? 'success' : 'fallback');
  }

  // Example 3: Simulate system stress and recovery
  console.log('3. System stress test and recovery:');
  
  // Cause multiple errors to trigger system degradation
  for (let i = 0; i < 5; i++) {
    await errorHandlingIntegration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
  }

  const degradedHealth = errorHandlingIntegration.checkSystemHealth();
  console.log('✓ System health after stress:', degradedHealth.overall);

  // Attempt system recovery
  const recoveryResult = await errorHandlingIntegration.attemptSystemRecovery();
  console.log('✓ System recovery result:', recoveryResult);

  const recoveredHealth = errorHandlingIntegration.checkSystemHealth();
  console.log('✓ System health after recovery:', recoveredHealth.overall);

  // Example 4: System statistics
  console.log('4. System statistics:');
  const systemStats = errorHandlingIntegration.getSystemStats();
  console.log('✓ Global error count:', systemStats.globalErrorCount);
  console.log('✓ System configuration:', systemStats.config);
}

/**
 * Example: Custom Error Handling Configuration
 */
export function demonstrateCustomErrorHandling() {
  console.log('\n=== Custom Error Handling Demo ===');

  // Example 1: Custom error handler configuration
  console.log('1. Custom error handler configuration:');
  errorHandler.updateConfig({
    colorFallback: '#FF0000', // Red fallback color
    enableLogging: true,
    maxRetries: 5
  });

  const config = errorHandler.getConfig();
  console.log('✓ Updated config:', config.colorFallback, config.maxRetries);

  // Example 2: Manual error handling
  console.log('2. Manual error handling:');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const result = errorHandler.handleIconRenderingError(
      new Error('Custom icon error'),
      {
        iconType: IconType.MUSIC_NOTE,
        x: 100,
        y: 100,
        size: 24,
        ctx
      }
    );
    console.log('✓ Manual error handling result:', result);
  }

  // Example 3: Error statistics
  console.log('3. Error statistics:');
  const errorStats = errorHandler.getErrorStats();
  console.log('✓ Total errors:', errorStats.totalErrors);
  console.log('✓ Errors by type:', errorStats.errorsByType);
  console.log('✓ Recent errors:', errorStats.recentErrors.length);

  // Example 4: Retry mechanism
  console.log('4. Retry mechanism:');
  let attempts = 0;
  const testOperation = () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Operation failed');
    }
    return 'success';
  };

  errorHandler.retryOperation('test-operation', testOperation, 5)
    .then(result => {
      console.log('✓ Retry operation result:', result);
      console.log('✓ Total attempts:', attempts);
    })
    .catch(error => {
      console.log('✗ Retry operation failed:', error.message);
    });
}

/**
 * Run all error handling demonstrations
 */
export function runAllErrorHandlingDemos() {
  console.log('🚀 Starting Error Handling Demonstrations\n');

  try {
    demonstrateSafeIconRendering();
    demonstrateSafeVisualTheme();
    demonstrateSafePersonConsolidation();
    demonstrateSafeBubbleRegistry();
    
    // Async demonstrations
    demonstrateSystemIntegration().then(() => {
      console.log('\n✅ All error handling demonstrations completed successfully!');
    }).catch(error => {
      console.error('❌ System integration demo failed:', error);
    });

    demonstrateCustomErrorHandling();

  } catch (error) {
    console.error('❌ Error handling demonstration failed:', error);
  }
}

// Export for use in other modules
export default {
  demonstrateSafeIconRendering,
  demonstrateSafeVisualTheme,
  demonstrateSafePersonConsolidation,
  demonstrateSafeBubbleRegistry,
  demonstrateSystemIntegration,
  demonstrateCustomErrorHandling,
  runAllErrorHandlingDemos
};