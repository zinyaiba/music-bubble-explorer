import type { EnvironmentConfig, EnvironmentDetectionResult } from '../types/environment';

/**
 * Environment detector class for automatically determining development vs production
 * environment and managing debug features accordingly
 */
export class EnvironmentDetector {
  private static instance: EnvironmentDetector;
  private cachedConfig: EnvironmentDetectionResult | null = null;

  /**
   * Get singleton instance of EnvironmentDetector
   */
  public static getInstance(): EnvironmentDetector {
    if (!EnvironmentDetector.instance) {
      EnvironmentDetector.instance = new EnvironmentDetector();
    }
    return EnvironmentDetector.instance;
  }

  /**
   * Detect the current environment and return configuration
   */
  public detectEnvironment(): EnvironmentDetectionResult {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const hostname = this.getHostname();
    const isLocalhost = this.isLocalhostEnvironment(hostname);
    const debugForced = this.isDebugModeForced();
    const isDevelopment = this.isDevelopmentEnvironment(hostname, debugForced);

    const config: EnvironmentDetectionResult = {
      isDevelopment,
      showDebugInfo: debugForced, // Only show when explicitly forced, not in development
      showFPS: debugForced, // Only show when explicitly forced, not in development
      showResetButton: debugForced, // Only show when explicitly forced, not in development
      enableConsoleLogging: isDevelopment || debugForced,
      environmentType: debugForced ? 'debug-forced' : (isDevelopment ? 'development' : 'production'),
      debugForced,
      hostname,
      isLocalhost
    };

    this.cachedConfig = config;
    return config;
  }

  /**
   * Get basic environment configuration without additional metadata
   */
  public getEnvironmentConfig(): EnvironmentConfig {
    const result = this.detectEnvironment();
    return {
      isDevelopment: result.isDevelopment,
      showDebugInfo: result.showDebugInfo,
      showFPS: result.showFPS,
      showResetButton: result.showResetButton,
      enableConsoleLogging: result.enableConsoleLogging
    };
  }

  /**
   * Check if debug UI should be shown
   */
  public shouldShowDebugUI(): boolean {
    return this.detectEnvironment().showDebugInfo;
  }

  /**
   * Check if console logging should be enabled
   */
  public shouldLogToConsole(): boolean {
    return this.detectEnvironment().enableConsoleLogging;
  }

  /**
   * Force refresh of environment detection (clears cache)
   */
  public refreshEnvironmentDetection(): EnvironmentDetectionResult {
    this.cachedConfig = null;
    return this.detectEnvironment();
  }

  /**
   * Get the current hostname
   */
  private getHostname(): string {
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    return 'unknown';
  }

  /**
   * Check if running on localhost
   */
  private isLocalhostEnvironment(hostname: string): boolean {
    return hostname === 'localhost' || 
           hostname === '127.0.0.1' || 
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.includes('local');
  }

  /**
   * Check if debug mode is forced via URL parameters
   */
  private isDebugModeForced(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('debug') === 'true' || 
             urlParams.get('debug') === '1' ||
             urlParams.has('dev') ||
             urlParams.has('development');
    } catch (error) {
      // Fallback for test environments or other edge cases
      return false;
    }
  }

  /**
   * Determine if running in development environment
   */
  private isDevelopmentEnvironment(hostname: string, _debugForced: boolean): boolean {
    // Check NODE_ENV first
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.NODE_ENV === 'development') {
          return true;
        }
        if (process.env.NODE_ENV === 'production') {
          return false; // Production is production, even if debug is forced
        }
      }
    } catch (error) {
      // Continue with other checks if process is not available
    }

    // Check hostname-based detection
    if (this.isLocalhostEnvironment(hostname)) {
      return true;
    }

    // Check for development-specific domains
    if (hostname.includes('dev.') || 
        hostname.includes('staging.') || 
        hostname.includes('test.')) {
      return true;
    }

    // Default to production if none of the above
    return false;
  }
}

/**
 * Convenience function to get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return EnvironmentDetector.getInstance().getEnvironmentConfig();
}

/**
 * Convenience function to check if debug UI should be shown
 */
export function shouldShowDebugUI(): boolean {
  return EnvironmentDetector.getInstance().shouldShowDebugUI();
}

/**
 * Convenience function to check if console logging should be enabled
 */
export function shouldLogToConsole(): boolean {
  return EnvironmentDetector.getInstance().shouldLogToConsole();
}

/**
 * Convenience function to get full environment detection result
 */
export function detectEnvironment(): EnvironmentDetectionResult {
  return EnvironmentDetector.getInstance().detectEnvironment();
}