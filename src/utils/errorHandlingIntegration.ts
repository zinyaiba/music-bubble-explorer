/**
 * Error Handling Integration
 * 
 * Central integration point for all error handling and fallback functionality.
 * Provides a unified interface for error-safe operations across the bubble system.
 * 
 * Requirements: 1.1, 2.1, 3.1 - Comprehensive error handling integration
 */

import { safeIconRenderer } from './safeIconRenderer';
import { safeVisualThemeManager } from './safeVisualTheme';
import { safePersonConsolidator } from './safePersonConsolidator';
import { safeBubbleRegistry } from './safeBubbleRegistry';
import { errorHandler, ErrorType } from './errorHandler';
import { DebugLogger } from './debugLogger';

const debugLogger = DebugLogger.getInstance();

/**
 * Error handling configuration for the entire system
 */
export interface SystemErrorConfig {
  enableGlobalErrorHandling: boolean;
  enableFallbacks: boolean;
  enableErrorLogging: boolean;
  enableRecoveryMode: boolean;
  maxSystemRetries: number;
  systemRetryDelay: number;
}

/**
 * Default system error configuration
 */
export const DEFAULT_SYSTEM_ERROR_CONFIG: SystemErrorConfig = {
  enableGlobalErrorHandling: true,
  enableFallbacks: true,
  enableErrorLogging: true,
  enableRecoveryMode: true,
  maxSystemRetries: 3,
  systemRetryDelay: 200
};

/**
 * System health status
 */
export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: {
    iconRenderer: 'healthy' | 'degraded' | 'critical';
    visualTheme: 'healthy' | 'degraded' | 'critical';
    personConsolidator: 'healthy' | 'degraded' | 'critical';
    bubbleRegistry: 'healthy' | 'degraded' | 'critical';
  };
  errorCounts: Record<ErrorType, number>;
  lastHealthCheck: number;
}

/**
 * Error Handling Integration Manager
 * 
 * Manages system-wide error handling, monitoring, and recovery
 */
export class ErrorHandlingIntegration {
  private static instance: ErrorHandlingIntegration;
  private config: SystemErrorConfig;
  private healthStatus: SystemHealth;
  private globalErrorCount: number = 0;
  private lastRecoveryAttempt: number = 0;
  private recoveryInProgress: boolean = false;

  private constructor(config: Partial<SystemErrorConfig> = {}) {
    this.config = { ...DEFAULT_SYSTEM_ERROR_CONFIG, ...config };
    this.healthStatus = this.initializeHealthStatus();
    
    if (this.config.enableGlobalErrorHandling) {
      this.setupGlobalErrorHandling();
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<SystemErrorConfig>): ErrorHandlingIntegration {
    if (!ErrorHandlingIntegration.instance) {
      ErrorHandlingIntegration.instance = new ErrorHandlingIntegration(config);
    }
    return ErrorHandlingIntegration.instance;
  }

  /**
   * Safe icon rendering with system-level error handling
   */
  async safeRenderIcon(
    ctx: CanvasRenderingContext2D,
    iconType: any,
    x: number,
    y: number,
    size: number,
    color?: string
  ): Promise<boolean> {
    return this.executeWithSystemErrorHandling(
      'iconRenderer',
      async () => {
        safeIconRenderer.renderIcon(ctx, iconType, x, y, size, color);
        return true;
      },
      false
    );
  }

  /**
   * Safe visual theme operations with system-level error handling
   */
  async safeGetStyle(type: any): Promise<any> {
    return this.executeWithSystemErrorHandling(
      'visualTheme',
      async () => {
        return safeVisualThemeManager.getStyleForType(type);
      },
      null
    );
  }

  /**
   * Safe gradient creation with system-level error handling
   */
  async safeCreateGradient(
    ctx: CanvasRenderingContext2D,
    style: any,
    x: number,
    y: number,
    radius: number
  ): Promise<CanvasGradient | null> {
    return this.executeWithSystemErrorHandling(
      'visualTheme',
      async () => {
        return safeVisualThemeManager.createGradient(ctx, style, x, y, radius);
      },
      null
    );
  }

  /**
   * Safe person consolidation with system-level error handling
   */
  async safeConsolidatePersons(songs: any[]): Promise<any[]> {
    return this.executeWithSystemErrorHandling(
      'personConsolidator',
      async () => {
        return safePersonConsolidator.consolidatePersons(songs);
      },
      []
    );
  }

  /**
   * Safe registry operations with system-level error handling
   */
  async safeRegisterBubble(
    contentId: string,
    bubbleId: string,
    type: 'song' | 'person' | 'tag'
  ): Promise<boolean> {
    return this.executeWithSystemErrorHandling(
      'bubbleRegistry',
      async () => {
        return safeBubbleRegistry.registerBubble(contentId, bubbleId, type);
      },
      false
    );
  }

  /**
   * Safe registry content retrieval with system-level error handling
   */
  async safeGetNextContent(): Promise<any> {
    return this.executeWithSystemErrorHandling(
      'bubbleRegistry',
      async () => {
        return safeBubbleRegistry.getNextUniqueContent();
      },
      null
    );
  }

  /**
   * Execute operation with system-level error handling
   */
  private async executeWithSystemErrorHandling<T>(
    component: keyof SystemHealth['components'],
    operation: () => Promise<T> | T,
    fallbackValue: T
  ): Promise<T> {
    const operationKey = `${component}-${Date.now()}`;

    try {
      // Check if recovery is needed
      if (this.shouldAttemptRecovery()) {
        await this.attemptSystemRecovery();
      }

      // Execute operation with retry mechanism
      const result = await errorHandler.retryOperation(
        operationKey,
        operation,
        this.config.maxSystemRetries
      );

      if (result !== null) {
        // Update component health on success
        this.updateComponentHealth(component, 'healthy');
        return result;
      } else {
        throw new Error('Operation returned null after retries');
      }

    } catch (error) {
      this.globalErrorCount++;
      this.updateComponentHealth(component, 'degraded');

      if (this.config.enableErrorLogging) {
        debugLogger.error('System-level operation failed', {
          component,
          error: error instanceof Error ? error.message : String(error),
          globalErrorCount: this.globalErrorCount
        });
      }

      if (this.config.enableFallbacks) {
        return fallbackValue;
      } else {
        throw error;
      }
    }
  }

  /**
   * Check system health
   */
  checkSystemHealth(): SystemHealth {
    const now = Date.now();
    
    // Update error counts from error handler
    const errorStats = errorHandler.getErrorStats();
    this.healthStatus.errorCounts = errorStats.errorsByType;

    // Determine overall health
    const componentHealthValues = Object.values(this.healthStatus.components);
    const criticalCount = componentHealthValues.filter(h => h === 'critical').length;
    const degradedCount = componentHealthValues.filter(h => h === 'degraded').length;

    if (criticalCount > 0) {
      this.healthStatus.overall = 'critical';
    } else if (degradedCount > 1) {
      this.healthStatus.overall = 'degraded';
    } else {
      this.healthStatus.overall = 'healthy';
    }

    this.healthStatus.lastHealthCheck = now;
    return { ...this.healthStatus };
  }

  /**
   * Attempt system recovery
   */
  async attemptSystemRecovery(): Promise<boolean> {
    if (this.recoveryInProgress) {
      return false;
    }

    this.recoveryInProgress = true;
    this.lastRecoveryAttempt = Date.now();

    try {
      debugLogger.info('Attempting system recovery');

      // Clear caches to free up memory and reset state
      this.clearAllCaches();

      // Reset error handler state
      errorHandler.clearErrorHistory();

      // Reset component health to healthy
      Object.keys(this.healthStatus.components).forEach(component => {
        this.updateComponentHealth(component as keyof SystemHealth['components'], 'healthy');
      });

      // Reset global error count
      this.globalErrorCount = 0;

      debugLogger.info('System recovery completed successfully');
      return true;

    } catch (error) {
      debugLogger.error('System recovery failed', { error });
      return false;
    } finally {
      this.recoveryInProgress = false;
    }
  }

  /**
   * Clear all component caches
   */
  clearAllCaches(): void {
    try {
      safeIconRenderer.clearCache();
      safeVisualThemeManager.clearAllCaches();
      safePersonConsolidator.clearCaches();
      // Registry doesn't have a cache clear method, but we could reset it if needed
      
      debugLogger.info('All component caches cleared');
    } catch (error) {
      debugLogger.warn('Failed to clear some caches', { error });
    }
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError(event.reason, 'unhandledrejection');
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, 'error');
    });
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(error: any, source: string): void {
    this.globalErrorCount++;

    if (this.config.enableErrorLogging) {
      debugLogger.error('Global error caught', {
        source,
        error: error instanceof Error ? error.message : String(error),
        globalErrorCount: this.globalErrorCount
      });
    }

    // Update overall system health
    if (this.globalErrorCount > 10) {
      this.healthStatus.overall = 'critical';
    } else if (this.globalErrorCount > 5) {
      this.healthStatus.overall = 'degraded';
    }
  }

  /**
   * Initialize health status
   */
  private initializeHealthStatus(): SystemHealth {
    return {
      overall: 'healthy',
      components: {
        iconRenderer: 'healthy',
        visualTheme: 'healthy',
        personConsolidator: 'healthy',
        bubbleRegistry: 'healthy'
      },
      errorCounts: {} as Record<ErrorType, number>,
      lastHealthCheck: Date.now()
    };
  }

  /**
   * Update component health
   */
  private updateComponentHealth(
    component: keyof SystemHealth['components'],
    health: 'healthy' | 'degraded' | 'critical'
  ): void {
    this.healthStatus.components[component] = health;
  }

  /**
   * Check if system recovery should be attempted
   */
  private shouldAttemptRecovery(): boolean {
    if (!this.config.enableRecoveryMode) {
      return false;
    }

    if (this.recoveryInProgress) {
      return false;
    }

    // Don't attempt recovery too frequently
    const timeSinceLastRecovery = Date.now() - this.lastRecoveryAttempt;
    if (timeSinceLastRecovery < 30000) { // 30 seconds
      return false;
    }

    // Attempt recovery if system is in critical state
    return this.healthStatus.overall === 'critical' || this.globalErrorCount > 20;
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    health: SystemHealth;
    globalErrorCount: number;
    recoveryAttempts: number;
    lastRecoveryAttempt: number;
    config: SystemErrorConfig;
  } {
    return {
      health: this.checkSystemHealth(),
      globalErrorCount: this.globalErrorCount,
      recoveryAttempts: this.lastRecoveryAttempt > 0 ? 1 : 0, // Simplified
      lastRecoveryAttempt: this.lastRecoveryAttempt,
      config: { ...this.config }
    };
  }

  /**
   * Update system configuration
   */
  updateConfig(newConfig: Partial<SystemErrorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update error handler config if needed
    errorHandler.updateConfig({
      enableLogging: this.config.enableErrorLogging,
      maxRetries: this.config.maxSystemRetries,
      retryDelay: this.config.systemRetryDelay
    });
  }

  /**
   * Force system reset (emergency function)
   */
  forceSystemReset(): void {
    try {
      debugLogger.warn('Force system reset initiated');
      
      // Reset all components
      this.clearAllCaches();
      safeBubbleRegistry.reset();
      errorHandler.clearErrorHistory();
      
      // Reset internal state
      this.globalErrorCount = 0;
      this.lastRecoveryAttempt = 0;
      this.recoveryInProgress = false;
      this.healthStatus = this.initializeHealthStatus();
      
      debugLogger.info('Force system reset completed');
    } catch (error) {
      debugLogger.error('Force system reset failed', { error });
    }
  }
}

// Export singleton instance
export const errorHandlingIntegration = ErrorHandlingIntegration.getInstance();