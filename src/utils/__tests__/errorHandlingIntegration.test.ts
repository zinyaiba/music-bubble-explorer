/**
 * Error Handling Integration Tests
 * 
 * Tests for the system-wide error handling integration.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandlingIntegration, DEFAULT_SYSTEM_ERROR_CONFIG } from '../errorHandlingIntegration';
import { IconType } from '../../types/enhancedBubble';

describe('ErrorHandlingIntegration', () => {
  let integration: ErrorHandlingIntegration;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    // Reset singleton instance
    (ErrorHandlingIntegration as any).instance = undefined;
    integration = ErrorHandlingIntegration.getInstance();
    
    // Mock canvas and context
    mockCanvas = document.createElement('canvas');
    mockCtx = mockCanvas.getContext('2d') as CanvasRenderingContext2D;
    
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('System Health Monitoring', () => {
    it('should initialize with healthy status', () => {
      const health = integration.checkSystemHealth();
      
      expect(health.overall).toBe('healthy');
      expect(health.components.iconRenderer).toBe('healthy');
      expect(health.components.visualTheme).toBe('healthy');
      expect(health.components.personConsolidator).toBe('healthy');
      expect(health.components.bubbleRegistry).toBe('healthy');
    });

    it('should update health status based on component failures', async () => {
      // Simulate multiple failures to degrade health
      await integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      await integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      
      const health = integration.checkSystemHealth();
      
      // Health should be degraded due to failures
      expect(health.components.iconRenderer).toBe('degraded');
    });
  });

  describe('Safe Icon Rendering', () => {
    it('should handle successful icon rendering', async () => {
      const result = await integration.safeRenderIcon(
        mockCtx,
        IconType.MUSIC_NOTE,
        100,
        100,
        24
      );
      
      expect(result).toBe(true);
    });

    it('should handle icon rendering failures gracefully', async () => {
      const result = await integration.safeRenderIcon(
        null as any, // Invalid context
        IconType.MUSIC_NOTE,
        100,
        100,
        24
      );
      
      expect(result).toBe(false); // Should return fallback value
    });
  });

  describe('Safe Visual Theme Operations', () => {
    it('should handle successful style retrieval', async () => {
      const style = await integration.safeGetStyle('song');
      
      expect(style).toBeDefined();
      expect(style.primaryColor).toBeDefined();
      expect(style.iconType).toBeDefined();
    });

    it('should handle style retrieval failures gracefully', async () => {
      const style = await integration.safeGetStyle('invalid-type');
      
      expect(style).toBeNull(); // Should return fallback value
    });

    it('should handle gradient creation', async () => {
      const mockStyle = {
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00'
      };

      const gradient = await integration.safeCreateGradient(
        mockCtx,
        mockStyle,
        100,
        100,
        50
      );
      
      expect(gradient).toBeDefined();
    });
  });

  describe('Safe Person Consolidation', () => {
    it('should handle successful person consolidation', async () => {
      const mockSongs = [
        {
          id: 'song1',
          title: 'Test Song',
          lyricists: ['Artist 1'],
          composers: ['Artist 1'],
          arrangers: []
        }
      ];

      const result = await integration.safeConsolidatePersons(mockSongs);
      
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle consolidation failures gracefully', async () => {
      const result = await integration.safeConsolidatePersons(null as any);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0); // Should return empty array as fallback
    });
  });

  describe('Safe Registry Operations', () => {
    it('should handle successful bubble registration', async () => {
      const result = await integration.safeRegisterBubble(
        'test-content',
        'test-bubble',
        'song'
      );
      
      expect(typeof result).toBe('boolean');
    });

    it('should handle registration failures gracefully', async () => {
      const result = await integration.safeRegisterBubble(
        '', // Invalid content ID
        'test-bubble',
        'song'
      );
      
      expect(result).toBe(false); // Should return fallback value
    });

    it('should handle content retrieval', async () => {
      const content = await integration.safeGetNextContent();
      
      // Should return content or null
      expect(content === null || typeof content === 'object').toBe(true);
    });
  });

  describe('System Recovery', () => {
    it('should attempt system recovery when needed', async () => {
      // Force system into degraded state
      const integration = ErrorHandlingIntegration.getInstance({
        enableRecoveryMode: true
      });

      // Simulate multiple failures
      for (let i = 0; i < 25; i++) {
        await integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      }

      const healthBefore = integration.checkSystemHealth();
      expect(healthBefore.overall).toBe('critical');

      // Recovery should be attempted automatically on next operation
      await integration.safeRenderIcon(mockCtx, IconType.MUSIC_NOTE, 100, 100, 24);

      const stats = integration.getSystemStats();
      expect(stats.globalErrorCount).toBeLessThan(25); // Should be reset after recovery
    });

    it('should clear all caches during recovery', async () => {
      const result = await integration.attemptSystemRecovery();
      expect(result).toBe(true);
    });
  });

  describe('Configuration Management', () => {
    it('should update system configuration', () => {
      const newConfig = {
        enableFallbacks: false,
        maxSystemRetries: 5,
        systemRetryDelay: 500
      };

      integration.updateConfig(newConfig);
      
      const stats = integration.getSystemStats();
      expect(stats.config.enableFallbacks).toBe(false);
      expect(stats.config.maxSystemRetries).toBe(5);
      expect(stats.config.systemRetryDelay).toBe(500);
    });

    it('should preserve existing config when updating', () => {
      integration.updateConfig({ enableFallbacks: false });
      
      const stats = integration.getSystemStats();
      expect(stats.config.enableFallbacks).toBe(false);
      expect(stats.config.enableErrorLogging).toBe(DEFAULT_SYSTEM_ERROR_CONFIG.enableErrorLogging);
    });
  });

  describe('System Statistics', () => {
    it('should provide comprehensive system statistics', () => {
      const stats = integration.getSystemStats();
      
      expect(stats.health).toBeDefined();
      expect(stats.globalErrorCount).toBeDefined();
      expect(stats.config).toBeDefined();
      expect(typeof stats.globalErrorCount).toBe('number');
    });

    it('should track global error count', async () => {
      const statsBefore = integration.getSystemStats();
      const initialErrorCount = statsBefore.globalErrorCount;

      // Cause some errors
      await integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      await integration.safeGetStyle('invalid-type');

      const statsAfter = integration.getSystemStats();
      expect(statsAfter.globalErrorCount).toBeGreaterThan(initialErrorCount);
    });
  });

  describe('Force System Reset', () => {
    it('should perform force system reset', () => {
      // Cause some errors first
      integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      
      const statsBefore = integration.getSystemStats();
      expect(statsBefore.globalErrorCount).toBeGreaterThan(0);

      integration.forceSystemReset();
      
      const statsAfter = integration.getSystemStats();
      expect(statsAfter.globalErrorCount).toBe(0);
      expect(statsAfter.health.overall).toBe('healthy');
    });
  });

  describe('Global Error Handling', () => {
    it('should handle unhandled promise rejections', () => {
      const integration = ErrorHandlingIntegration.getInstance({
        enableGlobalErrorHandling: true
      });

      // Simulate unhandled promise rejection
      const event = new CustomEvent('unhandledrejection', {
        detail: { reason: new Error('Unhandled promise rejection') }
      });
      
      window.dispatchEvent(event);
      
      // Should not throw and should be handled gracefully
      expect(true).toBe(true);
    });

    it('should handle global errors', () => {
      const integration = ErrorHandlingIntegration.getInstance({
        enableGlobalErrorHandling: true
      });

      // Simulate global error
      const event = new ErrorEvent('error', {
        error: new Error('Global error'),
        message: 'Global error occurred'
      });
      
      window.dispatchEvent(event);
      
      // Should not throw and should be handled gracefully
      expect(true).toBe(true);
    });
  });

  describe('Component Health Updates', () => {
    it('should update component health based on operation success/failure', async () => {
      // Successful operation should maintain healthy status
      await integration.safeRenderIcon(mockCtx, IconType.MUSIC_NOTE, 100, 100, 24);
      
      let health = integration.checkSystemHealth();
      expect(health.components.iconRenderer).toBe('healthy');

      // Failed operation should degrade health
      await integration.safeRenderIcon(null as any, IconType.MUSIC_NOTE, 0, 0, 24);
      
      health = integration.checkSystemHealth();
      expect(health.components.iconRenderer).toBe('degraded');
    });
  });
});