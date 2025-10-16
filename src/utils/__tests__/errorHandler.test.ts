/**
 * Error Handler Tests
 * 
 * Comprehensive tests for the error handling and fallback functionality.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorHandler, ErrorType, ErrorSeverity, DEFAULT_FALLBACK_CONFIG } from '../errorHandler';
import { IconType, ShapeType } from '../../types/enhancedBubble';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockCanvas: HTMLCanvasElement;
  let mockCtx: CanvasRenderingContext2D;

  beforeEach(() => {
    // Reset singleton instance
    (ErrorHandler as any).instance = undefined;
    errorHandler = ErrorHandler.getInstance();
    
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

  describe('Icon Rendering Error Handling', () => {
    it('should handle icon rendering errors with fallback', () => {
      const error = new Error('Icon rendering failed');
      const context = {
        iconType: IconType.MUSIC_NOTE,
        x: 100,
        y: 100,
        size: 24,
        ctx: mockCtx
      };

      const result = errorHandler.handleIconRenderingError(error, context);
      
      expect(result).toBe(true);
      
      const stats = errorHandler.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType[ErrorType.ICON_RENDERING]).toBe(1);
    });

    it('should return false when fallback rendering fails', () => {
      const error = new Error('Icon rendering failed');
      const invalidCtx = null as any;
      const context = {
        iconType: IconType.MUSIC_NOTE,
        x: 100,
        y: 100,
        size: 24,
        ctx: invalidCtx
      };

      const result = errorHandler.handleIconRenderingError(error, context);
      
      expect(result).toBe(false);
    });
  });

  describe('Color Application Error Handling', () => {
    it('should handle color application errors with fallback', () => {
      const error = new Error('Invalid color');
      const context = {
        originalColor: 'invalid-color',
        ctx: mockCtx,
        element: 'fill' as const
      };

      const result = errorHandler.handleColorApplicationError(error, context);
      
      expect(result).toBe(DEFAULT_FALLBACK_CONFIG.colorFallback);
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType[ErrorType.COLOR_APPLICATION]).toBe(1);
    });

    it('should return gradient fallback for gradient elements', () => {
      const error = new Error('Gradient creation failed');
      const context = {
        originalColor: 'linear-gradient(invalid)',
        ctx: mockCtx,
        element: 'gradient' as const
      };

      const result = errorHandler.handleColorApplicationError(error, context);
      
      expect(result).toBe(DEFAULT_FALLBACK_CONFIG.gradientFallback);
    });
  });

  describe('Person Consolidation Error Handling', () => {
    it('should handle consolidation errors with fallback', () => {
      const error = new Error('Consolidation failed');
      const context = {
        personName: 'Test Person',
        operation: 'consolidate' as const
      };

      const result = errorHandler.handlePersonConsolidationError(error, context);
      
      expect(result).toBeDefined();
      expect(result.name).toBe('Test Person');
      expect(result.roles).toEqual([{ type: 'lyricist', songCount: 1 }]);
    });

    it('should handle role retrieval errors with fallback', () => {
      const error = new Error('Role retrieval failed');
      const context = {
        personName: 'Test Person',
        operation: 'getRoles' as const
      };

      const result = errorHandler.handlePersonConsolidationError(error, context);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual({ type: 'lyricist', songCount: 1 });
    });

    it('should handle count calculation errors with fallback', () => {
      const error = new Error('Count calculation failed');
      const context = {
        personName: 'Test Person',
        operation: 'calculateCount' as const
      };

      const result = errorHandler.handlePersonConsolidationError(error, context);
      
      expect(result).toBe(1);
    });
  });

  describe('Registry Error Handling', () => {
    it('should handle registration errors with fallback', () => {
      const error = new Error('Registration failed');
      const context = {
        operation: 'register' as const,
        contentId: 'test-content',
        bubbleId: 'test-bubble'
      };

      const result = errorHandler.handleRegistryError(error, context);
      
      expect(result).toBe(false);
    });

    it('should handle unregistration errors with fallback', () => {
      const error = new Error('Unregistration failed');
      const context = {
        operation: 'unregister' as const,
        bubbleId: 'test-bubble'
      };

      const result = errorHandler.handleRegistryError(error, context);
      
      expect(result).toBe(true);
    });

    it('should handle getNext errors with fallback content', () => {
      const error = new Error('GetNext failed');
      const context = {
        operation: 'getNext' as const
      };

      const result = errorHandler.handleRegistryError(error, context);
      
      expect(result).toBeDefined();
      expect(result.id).toBe('fallback-content');
      expect(result.type).toBe('song');
    });
  });

  describe('Shape Rendering Error Handling', () => {
    it('should handle shape rendering errors with fallback', () => {
      const error = new Error('Shape rendering failed');
      const context = {
        shapeType: ShapeType.HEXAGON,
        x: 100,
        y: 100,
        radius: 50,
        ctx: mockCtx
      };

      const result = errorHandler.handleShapeRenderingError(error, context);
      
      expect(result).toBe(true);
      
      const stats = errorHandler.getErrorStats();
      expect(stats.errorsByType[ErrorType.SHAPE_RENDERING]).toBe(1);
    });
  });

  describe('Canvas Context Error Handling', () => {
    it('should handle canvas context errors', () => {
      const error = new Error('Context creation failed');
      const context = {
        operation: 'getContext',
        canvasElement: mockCanvas
      };

      const result = errorHandler.handleCanvasContextError(error, context);
      
      // Should return a valid context or null
      expect(result === null || result instanceof CanvasRenderingContext2D).toBe(true);
    });
  });

  describe('Retry Mechanism', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Operation failed');
        }
        return 'success';
      };

      const result = await errorHandler.retryOperation('test-op', operation, 3);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should return null after max retries', async () => {
      const operation = () => {
        throw new Error('Always fails');
      };

      const result = await errorHandler.retryOperation('test-op', operation, 2);
      
      expect(result).toBe(null);
    });

    it('should handle async operations', async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 2) {
          throw new Error('Async operation failed');
        }
        return 'async success';
      };

      const result = await errorHandler.retryOperation('test-async-op', operation, 3);
      
      expect(result).toBe('async success');
      expect(attempts).toBe(2);
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics correctly', () => {
      // Generate some errors
      errorHandler.handleIconRenderingError(new Error('Icon error'), {
        iconType: IconType.MUSIC_NOTE,
        x: 0, y: 0, size: 24, ctx: mockCtx
      });

      errorHandler.handleColorApplicationError(new Error('Color error'), {
        originalColor: 'invalid',
        ctx: mockCtx,
        element: 'fill'
      });

      errorHandler.handleColorApplicationError(new Error('Another color error'), {
        originalColor: 'invalid2',
        ctx: mockCtx,
        element: 'stroke'
      });

      const stats = errorHandler.getErrorStats();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType[ErrorType.ICON_RENDERING]).toBe(1);
      expect(stats.errorsByType[ErrorType.COLOR_APPLICATION]).toBe(2);
      expect(stats.errorsBySeverity[ErrorSeverity.LOW]).toBe(3);
    });

    it('should clear error history', () => {
      // Generate an error
      errorHandler.handleIconRenderingError(new Error('Test error'), {
        iconType: IconType.MUSIC_NOTE,
        x: 0, y: 0, size: 24, ctx: mockCtx
      });

      expect(errorHandler.getErrorStats().totalErrors).toBe(1);

      errorHandler.clearErrorHistory();
      
      expect(errorHandler.getErrorStats().totalErrors).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        colorFallback: '#FF0000',
        enableLogging: false,
        maxRetries: 5
      };

      errorHandler.updateConfig(newConfig);
      
      const config = errorHandler.getConfig();
      expect(config.colorFallback).toBe('#FF0000');
      expect(config.enableLogging).toBe(false);
      expect(config.maxRetries).toBe(5);
    });

    it('should preserve existing config when updating', () => {
      const originalConfig = errorHandler.getConfig();
      
      errorHandler.updateConfig({ colorFallback: '#FF0000' });
      
      const updatedConfig = errorHandler.getConfig();
      expect(updatedConfig.colorFallback).toBe('#FF0000');
      expect(updatedConfig.shapeFallback).toBe(originalConfig.shapeFallback);
      expect(updatedConfig.enableLogging).toBe(originalConfig.enableLogging);
    });
  });

  describe('Error Severity Handling', () => {
    it('should handle different error severities appropriately', () => {
      // Low severity error
      errorHandler.handleIconRenderingError(new Error('Minor icon issue'), {
        iconType: IconType.MUSIC_NOTE,
        x: 0, y: 0, size: 24, ctx: mockCtx
      });

      // Medium severity error
      errorHandler.handlePersonConsolidationError(new Error('Consolidation issue'), {
        personName: 'Test',
        operation: 'consolidate'
      });

      const stats = errorHandler.getErrorStats();
      expect(stats.errorsBySeverity[ErrorSeverity.LOW]).toBe(1);
      expect(stats.errorsBySeverity[ErrorSeverity.MEDIUM]).toBe(1);
    });
  });
});