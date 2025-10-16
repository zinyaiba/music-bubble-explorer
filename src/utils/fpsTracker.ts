/**
 * FPS (Frames Per Second) tracking utility for performance monitoring
 * Only active in development environment or when debug mode is enabled
 */

import { EnvironmentDetector } from './environmentDetector';

export class FPSTracker {
  private static instance: FPSTracker;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private isTracking = false;
  private animationFrameId: number | null = null;
  private callbacks: Set<(fps: number) => void> = new Set();
  private updateInterval = 1000; // Update FPS every 1 second
  private lastUpdateTime = 0;

  /**
   * Get singleton instance of FPSTracker
   */
  public static getInstance(): FPSTracker {
    if (!FPSTracker.instance) {
      FPSTracker.instance = new FPSTracker();
    }
    return FPSTracker.instance;
  }

  /**
   * Start FPS tracking if in development environment
   */
  public start(): void {
    const detector = EnvironmentDetector.getInstance();
    const config = detector.getEnvironmentConfig();

    // Only track FPS in development or when debug is enabled
    if (!config.showFPS) {
      return;
    }

    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastUpdateTime = this.lastTime;
    
    if (config.enableConsoleLogging) {
      console.log('FPSTracker: Started tracking FPS');
    }

    this.tick();
  }

  /**
   * Stop FPS tracking
   */
  public stop(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const detector = EnvironmentDetector.getInstance();
    const config = detector.getEnvironmentConfig();
    
    if (config.enableConsoleLogging) {
      console.log('FPSTracker: Stopped tracking FPS');
    }
  }

  /**
   * Get current FPS value
   */
  public getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * Add callback to be notified of FPS updates
   */
  public addCallback(callback: (fps: number) => void): void {
    this.callbacks.add(callback);
  }

  /**
   * Remove FPS update callback
   */
  public removeCallback(callback: (fps: number) => void): void {
    this.callbacks.delete(callback);
  }

  /**
   * Clear all callbacks
   */
  public clearCallbacks(): void {
    this.callbacks.clear();
  }

  /**
   * Check if FPS tracking is currently active
   */
  public isActive(): boolean {
    return this.isTracking;
  }

  /**
   * Reset FPS tracking statistics
   */
  public reset(): void {
    this.frameCount = 0;
    this.fps = 0;
    this.lastTime = performance.now();
    this.lastUpdateTime = this.lastTime;
  }

  /**
   * Set update interval for FPS calculations (in milliseconds)
   */
  public setUpdateInterval(interval: number): void {
    this.updateInterval = Math.max(100, interval); // Minimum 100ms
  }

  /**
   * Internal tick function for FPS calculation
   */
  private tick = (): void => {
    if (!this.isTracking) {
      return;
    }

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every updateInterval milliseconds
    const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
    
    if (timeSinceLastUpdate >= this.updateInterval) {
      // Calculate FPS based on frame count and time elapsed
      this.fps = (this.frameCount * 1000) / timeSinceLastUpdate;
      
      // Notify all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(this.fps);
        } catch (error) {
          console.warn('FPSTracker: Error in callback:', error);
        }
      });

      // Reset counters
      this.frameCount = 0;
      this.lastUpdateTime = currentTime;
    }

    // Continue tracking
    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

/**
 * Hook for using FPS tracking in React components
 */
export const useFPSTracker = () => {
  const [fps, setFPS] = React.useState(0);
  const [isTracking, setIsTracking] = React.useState(false);

  React.useEffect(() => {
    const tracker = FPSTracker.getInstance();
    
    // Add callback to update FPS state
    const handleFPSUpdate = (newFPS: number) => {
      setFPS(newFPS);
    };

    tracker.addCallback(handleFPSUpdate);
    
    // Start tracking
    tracker.start();
    setIsTracking(tracker.isActive());

    // Cleanup
    return () => {
      tracker.removeCallback(handleFPSUpdate);
      // Don't stop tracking here as other components might be using it
    };
  }, []);

  const startTracking = React.useCallback(() => {
    const tracker = FPSTracker.getInstance();
    tracker.start();
    setIsTracking(tracker.isActive());
  }, []);

  const stopTracking = React.useCallback(() => {
    const tracker = FPSTracker.getInstance();
    tracker.stop();
    setIsTracking(false);
  }, []);

  const resetTracking = React.useCallback(() => {
    const tracker = FPSTracker.getInstance();
    tracker.reset();
  }, []);

  return {
    fps,
    isTracking,
    startTracking,
    stopTracking,
    resetTracking
  };
};

/**
 * Convenience function to start FPS tracking
 */
export function startFPSTracking(): void {
  FPSTracker.getInstance().start();
}

/**
 * Convenience function to stop FPS tracking
 */
export function stopFPSTracking(): void {
  FPSTracker.getInstance().stop();
}

/**
 * Convenience function to get current FPS
 */
export function getCurrentFPS(): number {
  return FPSTracker.getInstance().getCurrentFPS();
}

// Import React for the hook
import React from 'react';