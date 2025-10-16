import React, { useState, useEffect, useCallback } from 'react';
import { EnvironmentDetector } from '../utils/environmentDetector';
import type { EnvironmentConfig } from '../types/environment';

/**
 * Props for the DebugUI component
 */
interface DebugUIProps {
  /** Current FPS value to display */
  fps?: number;
  /** Current number of bubbles */
  bubbleCount?: number;
  /** Callback function when reset button is clicked */
  onReset?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show detailed environment information */
  showEnvironmentInfo?: boolean;
}

/**
 * Debug UI component that shows development information based on environment
 * Only displays in development environment or when debug mode is forced
 */
export const DebugUI: React.FC<DebugUIProps> = ({
  fps = 0,
  bubbleCount = 0,
  onReset,
  className = '',
  showEnvironmentInfo = false
}) => {
  const [environmentConfig, setEnvironmentConfig] = useState<EnvironmentConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Initialize environment detection and determine visibility
   */
  useEffect(() => {
    const detector = EnvironmentDetector.getInstance();
    const config = detector.getEnvironmentConfig();
    
    setEnvironmentConfig(config);
    setIsVisible(config.showDebugInfo);

    // Log environment detection result if console logging is enabled
    if (config.enableConsoleLogging) {
      const fullResult = detector.detectEnvironment();
      console.log('DebugUI Environment Detection:', {
        environmentType: fullResult.environmentType,
        isDevelopment: config.isDevelopment,
        showDebugInfo: config.showDebugInfo,
        debugForced: fullResult.debugForced,
        hostname: fullResult.hostname
      });
    }
  }, []);

  /**
   * Handle reset button click with logging
   */
  const handleReset = useCallback(() => {
    if (environmentConfig?.enableConsoleLogging) {
      console.log('DebugUI: Reset button clicked');
    }
    
    onReset?.();
  }, [onReset, environmentConfig]);

  /**
   * Handle environment refresh
   */
  const handleRefreshEnvironment = useCallback(() => {
    const detector = EnvironmentDetector.getInstance();
    const newConfig = detector.refreshEnvironmentDetection();
    
    setEnvironmentConfig(detector.getEnvironmentConfig());
    setIsVisible(newConfig.showDebugInfo);

    if (newConfig.enableConsoleLogging) {
      console.log('DebugUI: Environment refreshed:', newConfig);
    }
  }, []);

  // Don't render anything if not visible
  if (!isVisible || !environmentConfig) {
    return null;
  }

  return (
    <div 
      className={`debug-ui ${className}`}
      role="region"
      aria-label="開発者向けデバッグ情報"
    >
      <div className="debug-header">
        <h3>Debug Info</h3>
        <button
          type="button"
          onClick={handleRefreshEnvironment}
          className="debug-refresh-btn"
          title="環境設定を再読み込み"
          aria-label="環境設定を再読み込み"
        >
          🔄
        </button>
      </div>

      <div className="debug-content">
        {/* FPS Display */}
        {environmentConfig.showFPS && (
          <div className="debug-item fps-display">
            <span className="debug-label">FPS:</span>
            <span 
              className={`debug-value fps-value ${fps < 30 ? 'fps-low' : fps < 50 ? 'fps-medium' : 'fps-high'}`}
              aria-label={`フレームレート: 毎秒${fps}フレーム`}
            >
              {fps.toFixed(1)}
            </span>
          </div>
        )}

        {/* Bubble Count Display */}
        <div className="debug-item bubble-count">
          <span className="debug-label">Bubbles:</span>
          <span 
            className="debug-value"
            aria-label={`シャボン玉の数: ${bubbleCount}個`}
          >
            {bubbleCount}
          </span>
        </div>

        {/* Environment Information */}
        {showEnvironmentInfo && (
          <div className="debug-item environment-info">
            <span className="debug-label">Environment:</span>
            <span className="debug-value">
              {environmentConfig.isDevelopment ? 'Development' : 'Production'}
            </span>
          </div>
        )}

        {/* Reset Button */}
        {environmentConfig.showResetButton && onReset && (
          <div className="debug-item reset-section">
            <button
              type="button"
              onClick={handleReset}
              className="debug-reset-btn"
              aria-label="アプリケーションの状態をリセット"
            >
              Reset Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook for using debug UI functionality
 */
export const useDebugUI = () => {
  const [environmentConfig, setEnvironmentConfig] = useState<EnvironmentConfig | null>(null);

  useEffect(() => {
    const detector = EnvironmentDetector.getInstance();
    const config = detector.getEnvironmentConfig();
    setEnvironmentConfig(config);
  }, []);

  /**
   * Log debug information if console logging is enabled
   */
  const debugLog = useCallback((message: string, data?: any) => {
    if (environmentConfig?.enableConsoleLogging) {
      if (data !== undefined) {
        console.log(`[DEBUG] ${message}`, data);
      } else {
        console.log(`[DEBUG] ${message}`);
      }
    }
  }, [environmentConfig]);

  /**
   * Log warning information if console logging is enabled
   */
  const debugWarn = useCallback((message: string, data?: any) => {
    if (environmentConfig?.enableConsoleLogging) {
      if (data !== undefined) {
        console.warn(`[DEBUG] ${message}`, data);
      } else {
        console.warn(`[DEBUG] ${message}`);
      }
    }
  }, [environmentConfig]);

  /**
   * Log error information if console logging is enabled
   */
  const debugError = useCallback((message: string, error?: any) => {
    if (environmentConfig?.enableConsoleLogging) {
      if (error !== undefined) {
        console.error(`[DEBUG] ${message}`, error);
      } else {
        console.error(`[DEBUG] ${message}`);
      }
    }
  }, [environmentConfig]);

  return {
    shouldShowDebugUI: environmentConfig?.showDebugInfo ?? false,
    shouldLogToConsole: environmentConfig?.enableConsoleLogging ?? false,
    debugLog,
    debugWarn,
    debugError,
    environmentConfig
  };
};

export default DebugUI;