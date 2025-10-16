import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EnvironmentDetector, getEnvironmentConfig, shouldShowDebugUI, shouldLogToConsole } from '../environmentDetector';

describe('EnvironmentDetector', () => {
  let detector: EnvironmentDetector;
  let originalWindow: any;
  let originalProcess: any;

  beforeEach(() => {
    // Store original globals
    originalWindow = global.window;
    originalProcess = global.process;
    
    // Reset singleton instance
    (EnvironmentDetector as any).instance = undefined;
    detector = EnvironmentDetector.getInstance();
    
    // Clear cached config
    detector.refreshEnvironmentDetection();
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.process = originalProcess;
    vi.restoreAllMocks();
  });

  describe('Environment Detection', () => {
    it('should detect development environment on localhost', () => {
      // Mock window
      global.window = {
        location: {
          hostname: 'localhost',
          search: ''
        }
      } as any;

      // Mock process
      global.process = {
        env: {
          NODE_ENV: 'development'
        }
      } as any;

      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();

      expect(config.isDevelopment).toBe(true);
      expect(config.showDebugInfo).toBe(true);
      expect(config.showFPS).toBe(true);
      expect(config.showResetButton).toBe(true);
      expect(config.enableConsoleLogging).toBe(true);
      expect(config.environmentType).toBe('development');
      expect(config.isLocalhost).toBe(true);
    });

    it('should detect production environment on production domain', () => {
      // Mock window
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: ''
        }
      } as any;

      // Mock process
      global.process = {
        env: {
          NODE_ENV: 'production'
        }
      } as any;

      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();

      expect(config.isDevelopment).toBe(false);
      expect(config.showDebugInfo).toBe(false);
      expect(config.showFPS).toBe(false);
      expect(config.showResetButton).toBe(false);
      expect(config.enableConsoleLogging).toBe(false);
      expect(config.environmentType).toBe('production');
      expect(config.isLocalhost).toBe(false);
    });

    it('should force debug mode with URL parameter', () => {
      // Mock window
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: '?debug=true'
        }
      } as any;

      // Mock process
      global.process = {
        env: {
          NODE_ENV: 'production'
        }
      } as any;

      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();

      expect(config.isDevelopment).toBe(false);
      expect(config.showDebugInfo).toBe(true);
      expect(config.showFPS).toBe(true);
      expect(config.showResetButton).toBe(true);
      expect(config.enableConsoleLogging).toBe(true);
      expect(config.environmentType).toBe('debug-forced');
      expect(config.debugForced).toBe(true);
    });

    it('should detect localhost variations', () => {
      const localhostVariations = ['localhost', '127.0.0.1', '192.168.1.100', '10.0.0.1'];

      localhostVariations.forEach(hostname => {
        global.window = {
          location: {
            hostname,
            search: ''
          }
        } as any;
        
        detector.refreshEnvironmentDetection();
        const config = detector.detectEnvironment();
        expect(config.isLocalhost).toBe(true);
        expect(config.isDevelopment).toBe(true);
      });
    });

    it('should detect development domains', () => {
      const devDomains = ['dev.myapp.com', 'staging.myapp.com', 'test.myapp.com'];

      devDomains.forEach(hostname => {
        global.window = {
          location: {
            hostname,
            search: ''
          }
        } as any;
        
        detector.refreshEnvironmentDetection();
        const config = detector.detectEnvironment();
        expect(config.isDevelopment).toBe(true);
      });
    });
  });

  describe('URL Parameter Detection', () => {
    it('should detect debug=true parameter', () => {
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: '?debug=true'
        }
      } as any;
      
      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();
      expect(config.debugForced).toBe(true);
    });

    it('should detect debug=1 parameter', () => {
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: '?debug=1'
        }
      } as any;
      
      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();
      expect(config.debugForced).toBe(true);
    });

    it('should detect dev parameter', () => {
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: '?dev'
        }
      } as any;
      
      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();
      expect(config.debugForced).toBe(true);
    });

    it('should detect development parameter', () => {
      global.window = {
        location: {
          hostname: 'myapp.com',
          search: '?development'
        }
      } as any;
      
      detector.refreshEnvironmentDetection();
      const config = detector.detectEnvironment();
      expect(config.debugForced).toBe(true);
    });
  });

  describe('Convenience Functions', () => {
    it('should return correct environment config', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          search: ''
        }
      } as any;

      global.process = {
        env: {
          NODE_ENV: 'development'
        }
      } as any;

      const config = getEnvironmentConfig();

      expect(config.isDevelopment).toBe(true);
      expect(config.showDebugInfo).toBe(true);
      expect(config.showFPS).toBe(true);
      expect(config.showResetButton).toBe(true);
      expect(config.enableConsoleLogging).toBe(true);
    });

    it('should return correct debug UI visibility', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          search: ''
        }
      } as any;

      global.process = {
        env: {
          NODE_ENV: 'development'
        }
      } as any;

      expect(shouldShowDebugUI()).toBe(true);
    });

    it('should return correct console logging setting', () => {
      global.window = {
        location: {
          hostname: 'localhost',
          search: ''
        }
      } as any;

      global.process = {
        env: {
          NODE_ENV: 'development'
        }
      } as any;

      expect(shouldLogToConsole()).toBe(true);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EnvironmentDetector.getInstance();
      const instance2 = EnvironmentDetector.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should cache configuration', () => {
      const config1 = detector.detectEnvironment();
      const config2 = detector.detectEnvironment();

      expect(config1).toBe(config2); // Same object reference due to caching
    });

    it('should refresh cache when requested', () => {
      const config1 = detector.detectEnvironment();
      const config2 = detector.refreshEnvironmentDetection();

      expect(config1).not.toBe(config2); // Different object reference after refresh
      expect(config1).toEqual(config2); // But same content
    });
  });
});