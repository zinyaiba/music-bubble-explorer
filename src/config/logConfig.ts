import { LogLevel, ProductionLogger } from '../utils/ProductionLogger'

/**
 * ログ設定管理クラス
 */
export class LogConfigManager {
  private static instance: LogConfigManager
  private logger: ProductionLogger

  private constructor() {
    this.logger = new ProductionLogger()
    this.initializeFromEnvironment()
  }

  /**
   * シングルトンインスタンス取得
   */
  static getInstance(): LogConfigManager {
    if (!LogConfigManager.instance) {
      LogConfigManager.instance = new LogConfigManager()
    }
    return LogConfigManager.instance
  }

  /**
   * 環境変数からログ設定を初期化
   */
  private initializeFromEnvironment(): void {
    // ログレベル設定
    const logLevelStr = import.meta.env.VITE_LOG_LEVEL || 
                       (import.meta.env.PROD ? 'ERROR' : 'DEBUG')
    const logLevel = ProductionLogger.parseLevelFromString(logLevelStr)
    this.logger.setLogLevel(logLevel)

    // 本番環境でのログ出力設定
    const enableProdLogging = import.meta.env.VITE_ENABLE_PROD_LOGGING === 'true'
    this.logger.setProductionLogging(enableProdLogging)

    // デバッグモード設定
    const debugMode = import.meta.env.VITE_DEBUG_MODE === 'true'
    if (debugMode && !import.meta.env.PROD) {
      this.logger.setLogLevel(LogLevel.DEBUG)
    }

    // 開発環境での詳細ログ設定
    if (import.meta.env.DEV) {
      this.setupDevelopmentLogging()
    }

    // 本番環境での最適化設定
    if (import.meta.env.PROD) {
      this.setupProductionLogging()
    }
  }

  /**
   * 開発環境用ログ設定
   */
  private setupDevelopmentLogging(): void {
    // 開発環境では詳細なログを出力
    this.logger.setLogLevel(LogLevel.DEBUG)
    
    // 開発時に不要なログをフィルタリング
    this.logger.addFilterPattern('Firebase.*initialized')
    this.logger.addFilterPattern('React.*DevTools')
  }

  /**
   * 本番環境用ログ設定
   */
  private setupProductionLogging(): void {
    // 本番環境ではエラーのみ出力
    this.logger.setLogLevel(LogLevel.ERROR)
    
    // 本番環境では基本的にログ出力を抑制
    const enableProdLogging = import.meta.env.VITE_ENABLE_PROD_LOGGING === 'true'
    this.logger.setProductionLogging(enableProdLogging)

    // セキュリティ関連の情報をフィルタリング
    this.logger.addFilterPattern('API.*key')
    this.logger.addFilterPattern('token')
    this.logger.addFilterPattern('password')
    this.logger.addFilterPattern('secret')
  }

  /**
   * ロガーインスタンス取得
   */
  getLogger(): ProductionLogger {
    return this.logger
  }

  /**
   * 動的にログレベルを変更
   */
  setLogLevel(level: LogLevel): void {
    this.logger.setLogLevel(level)
  }

  /**
   * デバッグモードの切り替え
   */
  setDebugMode(enabled: boolean): void {
    if (enabled) {
      this.logger.setLogLevel(LogLevel.DEBUG)
    } else {
      const defaultLevel = import.meta.env.PROD ? LogLevel.ERROR : LogLevel.INFO
      this.logger.setLogLevel(defaultLevel)
    }
  }

  /**
   * 現在のログ設定を取得
   */
  getCurrentConfig(): {
    level: LogLevel
    levelName: string
    isProduction: boolean
    debugMode: boolean
  } {
    const config = this.logger.getConfig()
    return {
      level: config.level,
      levelName: ProductionLogger.getLevelName(config.level),
      isProduction: import.meta.env.PROD,
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true'
    }
  }

  /**
   * ログ設定の詳細情報を出力（開発環境のみ）
   */
  logConfigInfo(): void {
    if (import.meta.env.DEV) {
      const config = this.getCurrentConfig()
      this.logger.info('ログ設定情報', {
        logLevel: config.levelName,
        isProduction: config.isProduction,
        debugMode: config.debugMode,
        environment: import.meta.env.MODE
      })
    }
  }
}

/**
 * グローバルログ設定インスタンス
 */
export const logConfig = LogConfigManager.getInstance()

/**
 * グローバルロガー（設定済み）
 */
export const logger = logConfig.getLogger()

/**
 * 環境別ログ設定の初期化
 */
export function initializeLogging(): void {
  const configManager = LogConfigManager.getInstance()
  
  // 開発環境でのみ設定情報を出力
  if (import.meta.env.DEV) {
    configManager.logConfigInfo()
  }
}

/**
 * ログレベルを文字列から設定するヘルパー関数
 */
export function setLogLevelFromString(levelStr: string): void {
  const level = ProductionLogger.parseLevelFromString(levelStr)
  logConfig.setLogLevel(level)
}

/**
 * 開発者向けデバッグ関数（ブラウザコンソールから使用可能）
 */
if (import.meta.env.DEV) {
  // グローバルスコープに開発者向け関数を追加
  (window as any).setLogLevel = setLogLevelFromString;
  (window as any).getLogConfig = () => logConfig.getCurrentConfig();
  (window as any).enableDebugMode = () => logConfig.setDebugMode(true);
  (window as any).disableDebugMode = () => logConfig.setDebugMode(false);
}