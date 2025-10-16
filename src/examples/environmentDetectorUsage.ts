/**
 * Example usage of the EnvironmentDetector system
 * This demonstrates how to use environment detection for controlling debug features
 */

import { 
  EnvironmentDetector, 
  getEnvironmentConfig, 
  shouldShowDebugUI, 
  shouldLogToConsole,
  detectEnvironment 
} from '../utils/environmentDetector';

// Example 1: Basic usage with convenience functions
export function basicEnvironmentUsage() {
  console.log('=== Basic Environment Detection ===');
  
  // Simple checks
  if (shouldShowDebugUI()) {
    console.log('Debug UI should be shown');
  }
  
  if (shouldLogToConsole()) {
    console.log('Console logging is enabled');
  }
  
  // Get basic config
  const config = getEnvironmentConfig();
  console.log('Environment Config:', config);
}

// Example 2: Advanced usage with full detection result
export function advancedEnvironmentUsage() {
  console.log('=== Advanced Environment Detection ===');
  
  const result = detectEnvironment();
  
  console.log(`Environment Type: ${result.environmentType}`);
  console.log(`Hostname: ${result.hostname}`);
  console.log(`Is Localhost: ${result.isLocalhost}`);
  console.log(`Debug Forced: ${result.debugForced}`);
  
  // Conditional logic based on environment
  switch (result.environmentType) {
    case 'development':
      console.log('Running in development mode - all debug features enabled');
      break;
    case 'production':
      console.log('Running in production mode - debug features disabled');
      break;
    case 'debug-forced':
      console.log('Debug mode forced via URL parameters');
      break;
  }
}

// Example 3: Using singleton instance directly
export function singletonUsage() {
  console.log('=== Singleton Instance Usage ===');
  
  const detector = EnvironmentDetector.getInstance();
  
  // Get full detection result
  const result = detector.detectEnvironment();
  console.log('Full Detection Result:', result);
  
  // Refresh detection (useful if environment changes)
  const refreshed = detector.refreshEnvironmentDetection();
  console.log('Refreshed Detection:', refreshed);
  
  // Use specific methods
  console.log('Should show debug UI:', detector.shouldShowDebugUI());
  console.log('Should log to console:', detector.shouldLogToConsole());
}

// Example 4: Conditional component rendering
export function conditionalRenderingExample() {
  console.log('=== Conditional Rendering Example ===');
  
  const config = getEnvironmentConfig();
  
  // Example of how you might use this in a React component
  const debugComponents = {
    showFPS: config.showFPS,
    showResetButton: config.showResetButton,
    showDebugInfo: config.showDebugInfo
  };
  
  console.log('Debug Components Config:', debugComponents);
  
  // Example conditional logic
  if (config.showFPS) {
    console.log('Render FPS counter');
  }
  
  if (config.showResetButton) {
    console.log('Render reset button');
  }
  
  if (config.enableConsoleLogging) {
    console.log('Enable detailed console logging');
  }
}

// Example 5: Environment-specific logging
export function environmentLogging(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  if (shouldLogToConsole()) {
    const timestamp = new Date().toISOString();
    const env = detectEnvironment().environmentType;
    
    const logMessage = `[${timestamp}] [${env.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }
}

// Run examples if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('Environment Detector Examples');
  console.log('============================');
  
  basicEnvironmentUsage();
  advancedEnvironmentUsage();
  singletonUsage();
  conditionalRenderingExample();
  
  // Test environment logging
  environmentLogging('This is an info message');
  environmentLogging('This is a warning message', 'warn');
  environmentLogging('This is an error message', 'error');
}