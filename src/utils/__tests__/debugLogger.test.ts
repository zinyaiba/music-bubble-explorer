import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DebugLogger, LogLevel, debugLog, infoLog, warnLog, errorLog, perfLog, groupStart, groupEnd, tableLog, timestampedLog } from '../debugLogger';
import { EnvironmentDetector } from '../environmentDetector';

// Mock EnvironmentDetector
vi.mock('../environmentDetector');

const mockEnvironmentDetector = {
  getInstance: vi.fn(),
  shouldLogToConsole: vi.fn(),
  refreshEnvironmentDetection: vi.fn(),
};

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  group: vi.fn(),
  groupCollapsed: vi.fn(),
  groupEnd: vi.fn(),
  table: vi.fn(),
};

describe('DebugLogger', () => {
  let debugLogger: DebugLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset singleton
    (DebugLogger as any).instance = undefined;
    
    (EnvironmentDetector.getInstance as any).mockReturnValue(mockEnvironmentDetector);
    mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);

    // Mock console methods
    Object.assign(console, mockConsole);

    debugLogger = DebugLogger.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = DebugLogger.getInstance();
      const instance2 = DebugLogger.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Environment-based Logging', () => {
    it('should log when console logging is enabled', () => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
      
      debugLogger.debug('Test message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Test message');
    });

    it('should not log when console logging is disabled', () => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(false);
      
      debugLogger.debug('Test message');
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });
  });

  describe('Debug Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log debug messages without data', () => {
      debugLogger.debug('Debug message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message');
    });

    it('should log debug messages with data', () => {
      const data = { key: 'value' };
      debugLogger.debug('Debug message', data);
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] Debug message', data);
    });
  });

  describe('Info Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log info messages without data', () => {
      debugLogger.info('Info message');
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Info message');
    });

    it('should log info messages with data', () => {
      const data = { key: 'value' };
      debugLogger.info('Info message', data);
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] Info message', data);
    });
  });

  describe('Warning Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log warning messages without data', () => {
      debugLogger.warn('Warning message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warning message');
    });

    it('should log warning messages with data', () => {
      const data = { key: 'value' };
      debugLogger.warn('Warning message', data);
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warning message', data);
    });
  });

  describe('Error Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log error messages without error object', () => {
      debugLogger.error('Error message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message');
    });

    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      debugLogger.error('Error message', error);
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message', error);
    });
  });

  describe('Custom Prefix Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log with custom prefix for debug level', () => {
      debugLogger.log(LogLevel.DEBUG, 'CUSTOM', 'Test message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[CUSTOM] Test message');
    });

    it('should log with custom prefix for info level', () => {
      debugLogger.log(LogLevel.INFO, 'CUSTOM', 'Test message');
      expect(mockConsole.info).toHaveBeenCalledWith('[CUSTOM] Test message');
    });

    it('should log with custom prefix for warn level', () => {
      debugLogger.log(LogLevel.WARN, 'CUSTOM', 'Test message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[CUSTOM] Test message');
    });

    it('should log with custom prefix for error level', () => {
      debugLogger.log(LogLevel.ERROR, 'CUSTOM', 'Test message');
      expect(mockConsole.error).toHaveBeenCalledWith('[CUSTOM] Test message');
    });

    it('should log with custom prefix and data', () => {
      const data = { key: 'value' };
      debugLogger.log(LogLevel.INFO, 'CUSTOM', 'Test message', data);
      expect(mockConsole.info).toHaveBeenCalledWith('[CUSTOM] Test message', data);
    });
  });

  describe('Performance Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log performance timing with end time', () => {
      debugLogger.performance('Test operation', 100, 150);
      expect(mockConsole.info).toHaveBeenCalledWith('[PERF] Test operation: 50.00ms');
    });

    it('should log performance timing without end time (use current time)', () => {
      const mockPerformanceNow = vi.spyOn(performance, 'now').mockReturnValue(200);
      
      debugLogger.performance('Test operation', 100);
      expect(mockConsole.info).toHaveBeenCalledWith('[PERF] Test operation: 100.00ms');
      
      mockPerformanceNow.mockRestore();
    });
  });

  describe('Group Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should start expanded group', () => {
      debugLogger.groupStart('Test Group');
      expect(mockConsole.group).toHaveBeenCalledWith('[GROUP] Test Group');
    });

    it('should start collapsed group', () => {
      debugLogger.groupStart('Test Group', true);
      expect(mockConsole.groupCollapsed).toHaveBeenCalledWith('[GROUP] Test Group');
    });

    it('should end group', () => {
      debugLogger.groupEnd();
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });
  });

  describe('Table Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should log table without label', () => {
      const data = [{ name: 'John', age: 30 }];
      debugLogger.table(data);
      expect(mockConsole.table).toHaveBeenCalledWith(data);
    });

    it('should log table with label', () => {
      const data = [{ name: 'John', age: 30 }];
      debugLogger.table(data, 'User Data');
      expect(mockConsole.info).toHaveBeenCalledWith('[TABLE] User Data:');
      expect(mockConsole.table).toHaveBeenCalledWith(data);
    });
  });

  describe('Timestamped Logging', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should log with timestamp for debug level', () => {
      debugLogger.timestamped(LogLevel.DEBUG, 'Test message');
      expect(mockConsole.debug).toHaveBeenCalledWith('[DEBUG] [2023-01-01T12:00:00.000Z] Test message');
    });

    it('should log with timestamp for info level', () => {
      debugLogger.timestamped(LogLevel.INFO, 'Test message');
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] [2023-01-01T12:00:00.000Z] Test message');
    });

    it('should log with timestamp for warn level', () => {
      debugLogger.timestamped(LogLevel.WARN, 'Test message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] [2023-01-01T12:00:00.000Z] Test message');
    });

    it('should log with timestamp for error level', () => {
      debugLogger.timestamped(LogLevel.ERROR, 'Test message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] [2023-01-01T12:00:00.000Z] Test message');
    });

    it('should log with timestamp and data', () => {
      const data = { key: 'value' };
      debugLogger.timestamped(LogLevel.INFO, 'Test message', data);
      expect(mockConsole.info).toHaveBeenCalledWith('[INFO] [2023-01-01T12:00:00.000Z] Test message', data);
    });
  });

  describe('Status Methods', () => {
    it('should return enabled status', () => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
      expect(debugLogger.isEnabled()).toBe(true);

      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(false);
      expect(debugLogger.isEnabled()).toBe(false);
    });

    it('should refresh environment', () => {
      debugLogger.refreshEnvironment();
      expect(mockEnvironmentDetector.refreshEnvironmentDetection).toHaveBeenCalled();
    });
  });

  describe('Convenience Functions', () => {
    beforeEach(() => {
      mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
    });

    it('should have convenience functions available', () => {
      // Test that convenience functions exist and are functions
      expect(typeof debugLog).toBe('function');
      expect(typeof infoLog).toBe('function');
      expect(typeof warnLog).toBe('function');
      expect(typeof errorLog).toBe('function');
      expect(typeof perfLog).toBe('function');
      expect(typeof groupStart).toBe('function');
      expect(typeof groupEnd).toBe('function');
      expect(typeof tableLog).toBe('function');
      expect(typeof timestampedLog).toBe('function');
    });
  });
});