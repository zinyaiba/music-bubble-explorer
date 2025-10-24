/**
 * Environment-aware debug logging utility
 * Only logs to console in development environment or when debug mode is enabled
 */

import { EnvironmentDetector } from './environmentDetector';

/**
 * Log levels for different types of debug information
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Debug logger class that respects environment settings
 */
export class DebugLogger {
  private static instance: DebugLogger;
  private environmentDetector: EnvironmentDetector;

  private constructor() {
    this.environmentDetector = EnvironmentDetector.getInstance();
  }

  /**
   * Get singleton instance of DebugLogger
   */
  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  /**
   * Check if logging is enabled based on environment
   */
  private shouldLog(): boolean {
    return this.environmentDetector.shouldLogToConsole();
  }

  /**
   * Log debug information
   */
  public debug(message: string, data?: any): void {
    if (!this.shouldLog()) return;

    if (data !== undefined) {
      console.debug(`[DEBUG] ${message}`, data);
    } else {
      console.debug(`[DEBUG] ${message}`);
    }
  }

  /**
   * Log informational messages
   */
  public info(_message: string, _data?: any): void {
    if (!this.shouldLog()) return;

    // Info logging is currently disabled in production
    // Uncomment below if needed:
    // if (_data !== undefined) {
    //   console.info(`[INFO] ${_message}`, _data);
    // } else {
    //   console.info(`[INFO] ${_message}`);
    // }
  }

  /**
   * Log warning messages
   */
  public warn(message: string, data?: any): void {
    if (!this.shouldLog()) return;

    if (data !== undefined) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  }

  /**
   * Log error messages
   */
  public error(message: string, error?: any): void {
    if (!this.shouldLog()) return;

    if (error !== undefined) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  }

  /**
   * Log with custom prefix
   */
  public log(level: LogLevel, prefix: string, message: string, data?: any): void {
    if (!this.shouldLog()) return;

    const fullMessage = `[${prefix.toUpperCase()}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        if (data !== undefined) {
          console.debug(fullMessage, data);
        } else {
          console.debug(fullMessage);
        }
        break;
      case LogLevel.INFO:
        if (data !== undefined) {
          console.info(fullMessage, data);
        } else {
          console.info(fullMessage);
        }
        break;
      case LogLevel.WARN:
        if (data !== undefined) {
          console.warn(fullMessage, data);
        } else {
          console.warn(fullMessage);
        }
        break;
      case LogLevel.ERROR:
        if (data !== undefined) {
          console.error(fullMessage, data);
        } else {
          console.error(fullMessage);
        }
        break;
    }
  }

  /**
   * Log performance timing information
   */
  public performance(label: string, startTime: number, endTime?: number): void {
    if (!this.shouldLog()) return;

    const actualEndTime = endTime || performance.now();
    const duration = actualEndTime - startTime;
    
    console.info(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
  }

  /**
   * Log group start (collapsible in browser dev tools)
   */
  public groupStart(label: string, collapsed = false): void {
    if (!this.shouldLog()) return;

    if (collapsed) {
      console.groupCollapsed(`[GROUP] ${label}`);
    } else {
      console.group(`[GROUP] ${label}`);
    }
  }

  /**
   * Log group end
   */
  public groupEnd(): void {
    if (!this.shouldLog()) return;
    console.groupEnd();
  }

  /**
   * Log table data (useful for arrays and objects)
   */
  public table(data: any, label?: string): void {
    if (!this.shouldLog()) return;

    if (label) {
      console.info(`[TABLE] ${label}:`);
    }
    console.table(data);
  }

  /**
   * Log with timestamp
   */
  public timestamped(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog()) return;

    const timestamp = new Date().toISOString();
    const timestampedMessage = `[${timestamp}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        this.debug(timestampedMessage, data);
        break;
      case LogLevel.INFO:
        this.info(timestampedMessage, data);
        break;
      case LogLevel.WARN:
        this.warn(timestampedMessage, data);
        break;
      case LogLevel.ERROR:
        this.error(timestampedMessage, data);
        break;
    }
  }

  /**
   * Check if console logging is currently enabled
   */
  public isEnabled(): boolean {
    return this.shouldLog();
  }

  /**
   * Force refresh environment detection
   */
  public refreshEnvironment(): void {
    this.environmentDetector.refreshEnvironmentDetection();
  }
}

/**
 * Convenience functions for common logging operations
 */

const logger = DebugLogger.getInstance();

export const debugLog = (message: string, data?: any): void => {
  logger.debug(message, data);
};

export const infoLog = (message: string, data?: any): void => {
  logger.info(message, data);
};

export const warnLog = (message: string, data?: any): void => {
  logger.warn(message, data);
};

export const errorLog = (message: string, error?: any): void => {
  logger.error(message, error);
};

export const perfLog = (label: string, startTime: number, endTime?: number): void => {
  logger.performance(label, startTime, endTime);
};

export const groupStart = (label: string, collapsed = false): void => {
  logger.groupStart(label, collapsed);
};

export const groupEnd = (): void => {
  logger.groupEnd();
};

export const tableLog = (data: any, label?: string): void => {
  logger.table(data, label);
};

export const timestampedLog = (level: LogLevel, message: string, data?: any): void => {
  logger.timestamped(level, message, data);
};

/**
 * React hook for using debug logger
 */
export const useDebugLogger = () => {
  const [isEnabled, setIsEnabled] = React.useState(false);

  React.useEffect(() => {
    const logger = DebugLogger.getInstance();
    setIsEnabled(logger.isEnabled());
  }, []);

  const refreshLogger = React.useCallback(() => {
    const logger = DebugLogger.getInstance();
    logger.refreshEnvironment();
    setIsEnabled(logger.isEnabled());
  }, []);

  return {
    isEnabled,
    refreshLogger,
    debug: debugLog,
    info: infoLog,
    warn: warnLog,
    error: errorLog,
    perf: perfLog,
    groupStart,
    groupEnd,
    table: tableLog,
    timestamped: timestampedLog
  };
};

// Import React for the hook
import React from 'react';