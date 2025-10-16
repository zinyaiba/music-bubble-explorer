/**
 * Environment configuration interface for controlling debug features
 * and environment-specific behavior
 */
export interface EnvironmentConfig {
  /** Whether the application is running in development mode */
  isDevelopment: boolean;
  
  /** Whether to show debug information in the UI */
  showDebugInfo: boolean;
  
  /** Whether to display FPS counter */
  showFPS: boolean;
  
  /** Whether to show the Reset Status button */
  showResetButton: boolean;
  
  /** Whether to enable console logging for debugging */
  enableConsoleLogging: boolean;
}

/**
 * Environment detection result with additional metadata
 */
export interface EnvironmentDetectionResult extends EnvironmentConfig {
  /** The detected environment type */
  environmentType: 'development' | 'production' | 'debug-forced';
  
  /** Whether debug mode was forced via URL parameters */
  debugForced: boolean;
  
  /** The hostname where the application is running */
  hostname: string;
  
  /** Whether running on localhost */
  isLocalhost: boolean;
}