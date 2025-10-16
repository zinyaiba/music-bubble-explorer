/**
 * Error Handler System
 * 
 * Comprehensive error handling and fallback functionality for the bubble visual improvements system.
 * Provides graceful degradation when components fail.
 * 
 * Requirements: 1.1, 2.1, 3.1 - Error handling for icon rendering, person consolidation, and registry operations
 */

import { IconType, ShapeType } from '../types/enhancedBubble';

// Safe logger that handles cases where debugLogger might not be available
const safeLogger = {
  info: (message: string, data?: any) => {
    try {
      const { debugLogger } = require('./debugLogger');
      debugLogger?.info?.(message, data);
    } catch {
      console.log(`[INFO] ${message}`, data);
    }
  },
  warn: (message: string, data?: any) => {
    try {
      const { debugLogger } = require('./debugLogger');
      debugLogger?.warn?.(message, data);
    } catch {
      console.warn(`[WARN] ${message}`, data);
    }
  },
  error: (message: string, data?: any) => {
    try {
      const { debugLogger } = require('./debugLogger');
      debugLogger?.error?.(message, data);
    } catch {
      console.error(`[ERROR] ${message}`, data);
    }
  }
};

/**
 * Error types for different system components
 */
export enum ErrorType {
  ICON_RENDERING = 'ICON_RENDERING',
  COLOR_APPLICATION = 'COLOR_APPLICATION',
  PERSON_CONSOLIDATION = 'PERSON_CONSOLIDATION',
  REGISTRY_OPERATION = 'REGISTRY_OPERATION',
  SHAPE_RENDERING = 'SHAPE_RENDERING',
  VISUAL_THEME = 'VISUAL_THEME',
  CANVAS_CONTEXT = 'CANVAS_CONTEXT',
  DATA_LOADING = 'DATA_LOADING',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
  CANVAS_RENDERING = 'CANVAS_RENDERING'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',       // Minor visual issues, fallback available
  MEDIUM = 'MEDIUM', // Functionality degraded but operational
  HIGH = 'HIGH',     // Major functionality loss
  CRITICAL = 'CRITICAL' // System failure
}

/**
 * Error information interface
 */
export interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: number;
  fallbackApplied?: boolean;
}

/**
 * Fallback configuration for different error types
 */
export interface FallbackConfig {
  iconFallback: IconType;
  shapeFallback: ShapeType;
  colorFallback: string;
  gradientFallback: string;
  enableLogging: boolean;
  maxRetries: number;
  retryDelay: number;
}

/**
 * Default fallback configuration
 */
export const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  iconFallback: IconType.MUSIC_NOTE,
  shapeFallback: ShapeType.CIRCLE,
  colorFallback: '#888888',
  gradientFallback: '#CCCCCC',
  enableLogging: true,
  maxRetries: 3,
  retryDelay: 100
};

/**
 * Error Handler Class
 * 
 * Centralized error handling and fallback management system
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: FallbackConfig;
  private errorHistory: ErrorInfo[] = [];
  private retryAttempts: Map<string, number> = new Map();

  private constructor(config: Partial<FallbackConfig> = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<FallbackConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle icon rendering errors with fallback
   */
  handleIconRenderingError(
    error: Error,
    context: {
      iconType: IconType;
      x: number;
      y: number;
      size: number;
      ctx: CanvasRenderingContext2D;
    }
  ): boolean {
    const errorInfo: ErrorInfo = {
      type: ErrorType.ICON_RENDERING,
      severity: ErrorSeverity.LOW,
      message: `Icon rendering failed for ${context.iconType}: ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    try {
      // Apply fallback: render simple circle
      this.renderFallbackIcon(context.ctx, context.x, context.y, context.size);
      errorInfo.fallbackApplied = true;
      
      if (this.config.enableLogging) {
        safeLogger.warn('Icon rendering fallback applied', {
          originalIcon: context.iconType,
          fallback: 'simple circle'
        });
      }
      
      return true;
    } catch (fallbackError) {
      this.handleCriticalError(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), 'Icon fallback rendering failed');
      return false;
    }
  }

  /**
   * Handle color application errors with fallback
   */
  handleColorApplicationError(
    error: Error,
    context: {
      originalColor: string;
      ctx: CanvasRenderingContext2D;
      element: 'fill' | 'stroke' | 'gradient';
    }
  ): string {
    const errorInfo: ErrorInfo = {
      type: ErrorType.COLOR_APPLICATION,
      severity: ErrorSeverity.LOW,
      message: `Color application failed for ${context.element}: ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    // Return fallback color based on element type
    const fallbackColor = context.element === 'gradient' 
      ? this.config.gradientFallback 
      : this.config.colorFallback;

    errorInfo.fallbackApplied = true;

    if (this.config.enableLogging) {
      safeLogger.warn('Color application fallback applied', {
        originalColor: context.originalColor,
        fallbackColor,
        element: context.element
      });
    }

    return fallbackColor;
  }

  /**
   * Handle person consolidation errors with fallback
   */
  handlePersonConsolidationError(
    error: Error,
    context: {
      personName: string;
      operation: 'consolidate' | 'getRoles' | 'calculateCount';
      inputData?: any;
    }
  ): any {
    const errorInfo: ErrorInfo = {
      type: ErrorType.PERSON_CONSOLIDATION,
      severity: ErrorSeverity.MEDIUM,
      message: `Person consolidation failed for ${context.personName}: ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    // Apply fallback based on operation type
    let fallbackResult: any;

    switch (context.operation) {
      case 'consolidate':
        fallbackResult = this.createFallbackConsolidatedPerson(context.personName);
        break;
      case 'getRoles':
        fallbackResult = [{ type: 'lyricist', songCount: 1 }]; // Default single role
        break;
      case 'calculateCount':
        fallbackResult = 1; // Default count
        break;
      default:
        fallbackResult = null;
    }

    errorInfo.fallbackApplied = true;

    if (this.config.enableLogging) {
      safeLogger.warn('Person consolidation fallback applied', {
        personName: context.personName,
        operation: context.operation,
        fallbackResult
      });
    }

    return fallbackResult;
  }

  /**
   * Handle registry operation errors with fallback
   */
  handleRegistryError(
    error: Error,
    context: {
      operation: 'register' | 'unregister' | 'getNext' | 'initialize';
      contentId?: string;
      bubbleId?: string;
    }
  ): any {
    const errorInfo: ErrorInfo = {
      type: ErrorType.REGISTRY_OPERATION,
      severity: ErrorSeverity.MEDIUM,
      message: `Registry operation failed (${context.operation}): ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    // Apply fallback based on operation type
    let fallbackResult: any;

    switch (context.operation) {
      case 'register':
        fallbackResult = false; // Registration failed, allow duplicate
        break;
      case 'unregister':
        fallbackResult = true; // Assume successful unregistration
        break;
      case 'getNext':
        fallbackResult = this.createFallbackContentItem();
        break;
      case 'initialize':
        fallbackResult = true; // Assume successful initialization
        break;
      default:
        fallbackResult = null;
    }

    errorInfo.fallbackApplied = true;

    if (this.config.enableLogging) {
      safeLogger.warn('Registry operation fallback applied', {
        operation: context.operation,
        contentId: context.contentId,
        fallbackResult
      });
    }

    return fallbackResult;
  }

  /**
   * Handle shape rendering errors with fallback
   */
  handleShapeRenderingError(
    error: Error,
    context: {
      shapeType: ShapeType;
      x: number;
      y: number;
      radius: number;
      ctx: CanvasRenderingContext2D;
    }
  ): boolean {
    const errorInfo: ErrorInfo = {
      type: ErrorType.SHAPE_RENDERING,
      severity: ErrorSeverity.LOW,
      message: `Shape rendering failed for ${context.shapeType}: ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    try {
      // Apply fallback: render simple circle
      this.renderFallbackShape(context.ctx, context.x, context.y, context.radius);
      errorInfo.fallbackApplied = true;
      
      if (this.config.enableLogging) {
        safeLogger.warn('Shape rendering fallback applied', {
          originalShape: context.shapeType,
          fallback: ShapeType.CIRCLE
        });
      }
      
      return true;
    } catch (fallbackError) {
      this.handleCriticalError(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), 'Shape fallback rendering failed');
      return false;
    }
  }

  /**
   * Handle canvas context errors
   */
  handleCanvasContextError(
    error: Error,
    context: {
      operation: string;
      canvasElement?: HTMLCanvasElement;
    }
  ): CanvasRenderingContext2D | null {
    const errorInfo: ErrorInfo = {
      type: ErrorType.CANVAS_CONTEXT,
      severity: ErrorSeverity.HIGH,
      message: `Canvas context error (${context.operation}): ${error.message}`,
      originalError: error,
      context,
      timestamp: Date.now()
    };

    this.logError(errorInfo);

    // Try to create a new canvas context as fallback
    if (context.canvasElement) {
      try {
        const fallbackCtx = context.canvasElement.getContext('2d');
        if (fallbackCtx) {
          errorInfo.fallbackApplied = true;
          
          if (this.config.enableLogging) {
            safeLogger.warn('Canvas context fallback applied');
          }
          
          return fallbackCtx;
        }
      } catch (fallbackError) {
        this.handleCriticalError(fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), 'Canvas context fallback failed');
      }
    }

    return null;
  }

  /**
   * Retry mechanism for failed operations
   */
  async retryOperation<T>(
    operationKey: string,
    operation: () => Promise<T> | T,
    maxRetries: number = this.config.maxRetries
  ): Promise<T | null> {
    const currentAttempts = this.retryAttempts.get(operationKey) || 0;

    if (currentAttempts >= maxRetries) {
      if (this.config.enableLogging) {
        safeLogger.error('Max retry attempts reached', { operationKey, attempts: currentAttempts });
      }
      return null;
    }

    try {
      const result = await Promise.resolve(operation());
      this.retryAttempts.delete(operationKey); // Reset on success
      return result;
    } catch (error) {
      this.retryAttempts.set(operationKey, currentAttempts + 1);
      
      if (this.config.enableLogging) {
        safeLogger.warn('Operation retry', {
          operationKey,
          attempt: currentAttempts + 1,
          maxRetries,
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
      
      return this.retryOperation(operationKey, operation, maxRetries);
    }
  }

  /**
   * Render fallback icon (simple circle)
   */
  private renderFallbackIcon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size / 4, 0, Math.PI * 2);
    ctx.fillStyle = this.config.colorFallback;
    ctx.fill();
    ctx.strokeStyle = this.config.colorFallback;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Render fallback shape (simple circle)
   */
  private renderFallbackShape(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.colorFallback;
    ctx.fill();
    ctx.strokeStyle = this.config.colorFallback;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Create fallback consolidated person
   */
  private createFallbackConsolidatedPerson(personName: string): any {
    return {
      name: personName,
      roles: [{ type: 'lyricist', songCount: 1 }],
      totalRelatedCount: 1,
      songs: []
    };
  }

  /**
   * Create fallback content item
   */
  private createFallbackContentItem(): any {
    return {
      id: 'fallback-content',
      type: 'song',
      name: 'Unknown Content',
      relatedCount: 1,
      displayCount: 0
    };
  }

  /**
   * Handle critical errors that cannot be recovered
   */
  private handleCriticalError(error: Error, context: string): void {
    const errorInfo: ErrorInfo = {
      type: ErrorType.CANVAS_CONTEXT,
      severity: ErrorSeverity.CRITICAL,
      message: `Critical error in ${context}: ${error.message}`,
      originalError: error,
      timestamp: Date.now(),
      fallbackApplied: false
    };

    this.logError(errorInfo);

    if (this.config.enableLogging) {
      safeLogger.error('Critical error occurred', {
        context,
        error: error.message,
        stack: error.stack
      });
    }
  }

  /**
   * Log error to history and console
   */
  private logError(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);

    // Keep only recent errors (last 100)
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
    }

    if (this.config.enableLogging) {
      const logLevel = this.getLogLevel(errorInfo.severity);
      safeLogger[logLevel]('Error handled', {
        type: errorInfo.type,
        severity: errorInfo.severity,
        message: errorInfo.message,
        fallbackApplied: errorInfo.fallbackApplied,
        context: errorInfo.context
      });
    }
  }

  /**
   * Get appropriate log level for error severity
   */
  private getLogLevel(severity: ErrorSeverity): 'info' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'info';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'warn';
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorType, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorInfo[];
  } {
    const errorsByType = {} as Record<ErrorType, number>;
    const errorsBySeverity = {} as Record<ErrorSeverity, number>;

    // Initialize counters
    Object.values(ErrorType).forEach(type => {
      errorsByType[type] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      errorsBySeverity[severity] = 0;
    });

    // Count errors
    this.errorHistory.forEach(error => {
      errorsByType[error.type]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: this.errorHistory.slice(-10) // Last 10 errors
    };
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.retryAttempts.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<FallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): FallbackConfig {
    return { ...this.config };
  }

  /**
   * Handle general errors
   */
  static handleError(error: Error, type: ErrorType, context?: any): AppError {
    const instance = ErrorHandler.getInstance();
    const appError: AppError = {
      type,
      message: error.message,
      context,
      timestamp: Date.now(),
      severity: 'medium'
    };
    
    const errorInfo: ErrorInfo = {
      type: appError.type,
      severity: appError.severity === 'low' ? ErrorSeverity.LOW : 
                appError.severity === 'medium' ? ErrorSeverity.MEDIUM :
                appError.severity === 'high' ? ErrorSeverity.HIGH : ErrorSeverity.CRITICAL,
      message: appError.message,
      context: appError.context,
      timestamp: appError.timestamp
    };
    instance.errorHistory.push(errorInfo);
    safeLogger.error(`Error handled: ${type}`, { error: error.message, context });
    
    return appError;
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error, context?: any): AppError {
    return ErrorHandler.handleError(error, ErrorType.DATA_LOADING, { ...context, errorType: 'network' });
  }

  /**
   * Handle data loading errors
   */
  static handleDataLoadingError(error: Error, context?: any): AppError {
    return ErrorHandler.handleError(error, ErrorType.DATA_LOADING, { ...context, errorType: 'data_loading' });
  }

  /**
   * Handle canvas errors
   */
  static handleCanvasError(error: Error, context?: any): AppError {
    return ErrorHandler.handleError(error, ErrorType.CANVAS_RENDERING, { ...context, errorType: 'canvas' });
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.DATA_LOADING:
        return 'データの読み込みに失敗しました。ネットワーク接続を確認してください。';
      case ErrorType.CANVAS_RENDERING:
        return '描画処理でエラーが発生しました。ページを再読み込みしてください。';
      case ErrorType.ICON_RENDERING:
        return 'アイコンの表示に問題があります。';
      default:
        return 'エラーが発生しました。しばらく待ってから再試行してください。';
    }
  }

  /**
   * Get recovery actions
   */
  static getRecoveryActions(error: AppError): Array<{label: string, action: () => void}> {
    const actions = [];
    
    switch (error.type) {
      case ErrorType.DATA_LOADING:
        actions.push({
          label: '再読み込み',
          action: () => window.location.reload()
        });
        break;
      case ErrorType.CANVAS_RENDERING:
        actions.push({
          label: 'リセット',
          action: () => window.location.reload()
        });
        break;
      default:
        actions.push({
          label: '再試行',
          action: () => window.location.reload()
        });
    }
    
    return actions;
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Additional exports for compatibility
export interface AppError {
  type: ErrorType;
  message: string;
  context?: any;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Safe execution wrapper
export function safeExecute<T>(
  operation: () => T,
  errorType: ErrorType,
  context?: any
): T | null {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.handleError(error as Error, errorType, context);
    return null;
  }
}

// Execute with retry
export function executeWithRetry<T>(
  operation: () => T,
  maxRetries: number = 3,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: any
): T | null {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxRetries) {
        ErrorHandler.handleError(lastError, errorType, { ...context, attempt });
        return null;
      }
      // Wait before retry
      if (typeof setTimeout !== 'undefined') {
        setTimeout(() => {}, Math.pow(2, attempt) * 100);
      }
    }
  }
  
  return null;
}

// Safe canvas operation
export function safeCanvasOperation<T>(
  operation: (ctx: CanvasRenderingContext2D) => T,
  ctx: CanvasRenderingContext2D | null,
  fallback?: T
): T | null {
  if (!ctx) {
    return fallback || null;
  }
  
  try {
    return operation(ctx);
  } catch (error) {
    ErrorHandler.handleCanvasError(error as Error, { operation: 'canvas_operation' });
    return fallback || null;
  }
}

