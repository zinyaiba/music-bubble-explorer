import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FPSTracker, startFPSTracking, stopFPSTracking, getCurrentFPS } from '../fpsTracker';
import { EnvironmentDetector } from '../environmentDetector';

// Mock EnvironmentDetector
vi.mock('../environmentDetector');

// Mock performance.now
const mockPerformanceNow = vi.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

// Mock requestAnimationFrame and cancelAnimationFrame
const mockRequestAnimationFrame = vi.fn();
const mockCancelAnimationFrame = vi.fn();
Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});
Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

const mockEnvironmentDetector = {
  getInstance: vi.fn(),
  getEnvironmentConfig: vi.fn(),
  shouldLogToConsole: vi.fn(),
};

describe('FPSTracker', () => {
  let fpsTracker: FPSTracker;
  let currentTime = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    currentTime = 0;
    
    // Reset singleton
    (FPSTracker as any).instance = undefined;
    
    (EnvironmentDetector.getInstance as any).mockReturnValue(mockEnvironmentDetector);
    mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
      isDevelopment: true,
      showDebugInfo: true,
      showFPS: true,
      showResetButton: true,
      enableConsoleLogging: true,
    });
    mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);

    mockPerformanceNow.mockImplementation(() => currentTime);
    mockRequestAnimationFrame.mockImplementation((callback) => {
      // Simulate animation frame
      setTimeout(() => {
        currentTime += 16.67; // ~60 FPS
        callback(currentTime);
      }, 0);
      return 1;
    });

    fpsTracker = FPSTracker.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = FPSTracker.getInstance();
      const instance2 = FPSTracker.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Environment-based Tracking', () => {
    it('should start tracking when showFPS is true', () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
      });

      fpsTracker.start();
      expect(fpsTracker.isActive()).toBe(true);
    });

    it('should not start tracking when showFPS is false', () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: false,
        showDebugInfo: false,
        showFPS: false,
        showResetButton: false,
        enableConsoleLogging: false,
      });

      fpsTracker.start();
      expect(fpsTracker.isActive()).toBe(false);
    });
  });

  describe('FPS Calculation', () => {
    beforeEach(() => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
      });
    });

    it('should calculate FPS correctly', (done) => {
      const callback = vi.fn();
      fpsTracker.addCallback(callback);
      fpsTracker.setUpdateInterval(100); // Update every 100ms for faster testing
      
      fpsTracker.start();
      
      // Simulate multiple frames
      setTimeout(() => {
        expect(callback).toHaveBeenCalled();
        const fps = callback.mock.calls[0][0];
        expect(fps).toBeGreaterThan(0);
        done();
      }, 150);
    });

    it('should return current FPS value', () => {
      const initialFPS = fpsTracker.getCurrentFPS();
      expect(initialFPS).toBe(0);
    });
  });

  describe('Callback Management', () => {
    it('should add and remove callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      fpsTracker.addCallback(callback1);
      fpsTracker.addCallback(callback2);

      fpsTracker.removeCallback(callback1);
      
      // Verify callback2 is still there by checking internal state
      expect(fpsTracker['callbacks'].has(callback1)).toBe(false);
      expect(fpsTracker['callbacks'].has(callback2)).toBe(true);
    });

    it('should clear all callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      fpsTracker.addCallback(callback1);
      fpsTracker.addCallback(callback2);
      fpsTracker.clearCallbacks();

      expect(fpsTracker['callbacks'].size).toBe(0);
    });

    it('should handle callback errors gracefully', (done) => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = vi.fn();

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      fpsTracker.addCallback(errorCallback);
      fpsTracker.addCallback(normalCallback);
      fpsTracker.setUpdateInterval(100);
      fpsTracker.start();

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('FPSTracker: Error in callback:', expect.any(Error));
        expect(normalCallback).toHaveBeenCalled();
        consoleSpy.mockRestore();
        done();
      }, 150);
    });
  });

  describe('Tracking Control', () => {
    beforeEach(() => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
      });
    });

    it('should stop tracking', () => {
      fpsTracker.start();
      expect(fpsTracker.isActive()).toBe(true);

      fpsTracker.stop();
      expect(fpsTracker.isActive()).toBe(false);
    });

    it('should not start tracking if already active', () => {
      fpsTracker.start();
      const firstCallCount = mockRequestAnimationFrame.mock.calls.length;
      
      fpsTracker.start(); // Try to start again
      const secondCallCount = mockRequestAnimationFrame.mock.calls.length;
      
      expect(secondCallCount).toBe(firstCallCount);
    });

    it('should not stop tracking if not active', () => {
      expect(fpsTracker.isActive()).toBe(false);
      
      fpsTracker.stop();
      expect(mockCancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('Reset Functionality', () => {
    it('should reset FPS statistics', () => {
      fpsTracker.reset();
      expect(fpsTracker.getCurrentFPS()).toBe(0);
    });
  });

  describe('Update Interval', () => {
    it('should set update interval with minimum value', () => {
      fpsTracker.setUpdateInterval(50); // Below minimum
      expect(fpsTracker['updateInterval']).toBe(100); // Should be clamped to minimum

      fpsTracker.setUpdateInterval(500); // Above minimum
      expect(fpsTracker['updateInterval']).toBe(500);
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
      });
    });

    it('should start FPS tracking via convenience function', () => {
      startFPSTracking();
      expect(FPSTracker.getInstance().isActive()).toBe(true);
    });

    it('should stop FPS tracking via convenience function', () => {
      startFPSTracking();
      stopFPSTracking();
      expect(FPSTracker.getInstance().isActive()).toBe(false);
    });

    it('should get current FPS via convenience function', () => {
      const fps = getCurrentFPS();
      expect(typeof fps).toBe('number');
    });
  });

  describe('Environment Detection', () => {
    it('should use environment detector for configuration', () => {
      fpsTracker.start();
      expect(mockEnvironmentDetector.getEnvironmentConfig).toHaveBeenCalled();
    });
  });
});