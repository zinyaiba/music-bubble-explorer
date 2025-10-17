/**
 * Mobile Performance Manager Tests
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MobilePerformanceManager } from '../services/mobilePerformanceManager';

// Mock DOM environment
const mockDocument = {
  createElement: vi.fn(() => ({
    textContent: '',
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    }
  })),
  head: {
    appendChild: vi.fn()
  },
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    classList: {
      add: vi.fn()
    }
  },
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => [])
};

const mockWindow = {
  getComputedStyle: vi.fn(() => ({
    transform: 'none',
    zIndex: '1'
  })),
  matchMedia: vi.fn(() => ({
    matches: false
  })),
  navigator: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  },
  ResizeObserver: vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn()
  }))
};

describe('MobilePerformanceManager', () => {
  let performanceManager: MobilePerformanceManager;

  beforeEach(() => {
    // Setup DOM mocks
    global.document = mockDocument as any;
    global.window = mockWindow as any;
    global.ResizeObserver = mockWindow.ResizeObserver as any;

    // Reset singleton instance
    (MobilePerformanceManager as any).instance = null;
    performanceManager = MobilePerformanceManager.getInstance();
  });

  afterEach(() => {
    performanceManager.cleanup();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = MobilePerformanceManager.getInstance();
      const instance2 = MobilePerformanceManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Configuration Management', () => {
    it('should have default configuration', () => {
      const config = performanceManager.getConfig();
      
      expect(config.enableGPUAcceleration).toBe(true);
      expect(config.enableLayerSeparation).toBe(true);
      expect(config.enableDialogProtection).toBe(true);
      expect(config.enableFlickerPrevention).toBe(true);
      expect(config.animationControlDuringDialog).toBe(true);
      expect(config.renderingOptimization).toBe(true);
    });

    it('should update configuration', () => {
      const newConfig = {
        enableGPUAcceleration: false,
        enableDialogProtection: false
      };

      performanceManager.updateConfig(newConfig);
      const config = performanceManager.getConfig();

      expect(config.enableGPUAcceleration).toBe(false);
      expect(config.enableDialogProtection).toBe(false);
      expect(config.enableLayerSeparation).toBe(true); // Should remain unchanged
    });
  });

  describe('Dialog State Management', () => {
    it('should handle dialog open state', () => {
      performanceManager.handleDialogState(true, 'modal');
      const dialogState = performanceManager.getDialogState();

      expect(dialogState.isOpen).toBe(true);
      expect(dialogState.type).toBe('modal');
    });

    it('should handle dialog close state', () => {
      performanceManager.handleDialogState(true, 'form');
      performanceManager.handleDialogState(false, null);
      const dialogState = performanceManager.getDialogState();

      expect(dialogState.isOpen).toBe(false);
      expect(dialogState.type).toBe(null);
    });

    it('should maintain z-index for dialogs', () => {
      const dialogState = performanceManager.getDialogState();
      expect(dialogState.zIndex).toBe(9999);
    });
  });

  describe('Performance Metrics', () => {
    it('should provide initial performance metrics', () => {
      const metrics = performanceManager.getPerformanceMetrics();

      expect(metrics).toHaveProperty('flickerEvents');
      expect(metrics).toHaveProperty('dialogStabilityScore');
      expect(metrics).toHaveProperty('renderingEfficiency');
      expect(metrics).toHaveProperty('gpuAccelerationActive');
      expect(metrics).toHaveProperty('layerSeparationActive');
    });

    it('should update performance metrics', () => {
      const initialMetrics = performanceManager.getPerformanceMetrics();
      
      // Simulate some performance changes
      performanceManager.updatePerformanceMetrics();
      
      const updatedMetrics = performanceManager.getPerformanceMetrics();
      
      expect(updatedMetrics).toBeDefined();
      expect(typeof updatedMetrics.flickerEvents).toBe('number');
      expect(typeof updatedMetrics.dialogStabilityScore).toBe('number');
      expect(typeof updatedMetrics.renderingEfficiency).toBe('number');
    });
  });

  describe('Mobile Optimizations', () => {
    it('should apply mobile optimizations', () => {
      expect(() => {
        performanceManager.applyMobileOptimizations();
      }).not.toThrow();

      expect(mockDocument.createElement).toHaveBeenCalled();
      expect(mockDocument.head.appendChild).toHaveBeenCalled();
    });

    it('should detect mobile user agent', () => {
      // The mock user agent is set to iPhone
      expect(() => {
        performanceManager.applyMobileOptimizations();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing DOM gracefully', () => {
      global.document = undefined as any;
      global.window = undefined as any;

      expect(() => {
        const manager = MobilePerformanceManager.getInstance();
        manager.handleDialogState(true, 'modal');
      }).not.toThrow();
    });

    it('should handle missing ResizeObserver gracefully', () => {
      global.ResizeObserver = undefined as any;

      expect(() => {
        const manager = MobilePerformanceManager.getInstance();
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      performanceManager.handleDialogState(true, 'modal');
      
      expect(() => {
        performanceManager.cleanup();
      }).not.toThrow();

      const dialogState = performanceManager.getDialogState();
      expect(dialogState.protectionLayer).toBe(null);
    });

    it('should destroy instance properly', () => {
      expect(() => {
        performanceManager.destroy();
      }).not.toThrow();

      // After destroy, getInstance should create a new instance
      const newInstance = MobilePerformanceManager.getInstance();
      expect(newInstance).toBeDefined();
      expect(newInstance).not.toBe(performanceManager);
    });
  });
});

describe('MobilePerformanceManager Integration', () => {
  let performanceManager: MobilePerformanceManager;

  beforeEach(() => {
    global.document = mockDocument as any;
    global.window = mockWindow as any;
    global.ResizeObserver = mockWindow.ResizeObserver as any;

    (MobilePerformanceManager as any).instance = null;
    performanceManager = MobilePerformanceManager.getInstance();
  });

  afterEach(() => {
    performanceManager.cleanup();
    vi.clearAllMocks();
  });

  it('should handle complete dialog lifecycle', () => {
    // Open dialog
    performanceManager.handleDialogState(true, 'form');
    let dialogState = performanceManager.getDialogState();
    expect(dialogState.isOpen).toBe(true);
    expect(dialogState.type).toBe('form');

    // Check performance metrics during dialog
    const metrics = performanceManager.getPerformanceMetrics();
    expect(metrics.dialogStabilityScore).toBeGreaterThanOrEqual(0);

    // Close dialog
    performanceManager.handleDialogState(false, null);
    dialogState = performanceManager.getDialogState();
    expect(dialogState.isOpen).toBe(false);
    expect(dialogState.type).toBe(null);
  });

  it('should maintain performance optimization state', () => {
    const initialConfig = performanceManager.getConfig();
    
    // Apply mobile optimizations
    performanceManager.applyMobileOptimizations();
    
    // Configuration should remain the same
    const configAfterOptimization = performanceManager.getConfig();
    expect(configAfterOptimization).toEqual(initialConfig);
    
    // Performance metrics should be available
    const metrics = performanceManager.getPerformanceMetrics();
    expect(metrics).toBeDefined();
  });
});