/**
 * ログレベル定義
 */
export enum LogLevel {
  NONE = 0,     // ログ出力なし
  ERROR = 1,    // エラーのみ
  WARN = 2,     // 警告以上
  INFO = 3,     // 情報以上
  DEBUG = 4,    // 全てのログ
}

/**
 * ログ設定インターフェース
 */
export interface LogConfig {
  level: LogLevel
  enableConsole: boolean
  enableProduction: boolean
  filterPatterns: string[]
}

/**
 * ログフィルタールール
 */
export interface LogFilterRule {
  pattern: string
  action: 'include' | 'exclude'
  level: LogLevel
}

/**
 * 本番環境対応ログ出力クラス
 * 環境に応じてログレベルを制御し、不要なログ出力を抑制する
 */
export class ProductionLogger {
  private config: LogConfig
  private isProduction: boolean

  constructor(config?: Partial<LogConfig>) {
    this.isProduction = process.env.NODE_ENV === 'production'
    
    // デフォルト設定
    const defaultConfig: LogConfig = {
      level: this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG,
      enableConsole: true,
      enableProduction: false,
      filterPatterns: []
    }

    this.config = { ...defaultConfig, ...config }
  }

  /**
   * ログレベル設定を更新
   */
  setLogLevel(level: LogLevel): void {
    this.config.level = level
  }

  /**
   * 本番環境でのログ出力を有効/無効化
   */
  setProductionLogging(enabled: boolean): void {
    this.config.enableProduction = enabled
  }

  /**
   * フィルターパターンを追加
   */
  addFilterPattern(pattern: string): void {
    if (!this.config.filterPatterns.includes(pattern)) {
      this.config.filterPatterns.push(pattern)
    }
  }

  /**
   * メッセージがフィルターに引っかかるかチェック
   */
  private shouldFilter(message: string): boolean {
    return this.config.filterPatterns.some(pattern => {
      try {
        return new RegExp(pattern).test(message)
      } catch {
        return message.includes(pattern)
      }
    })
  }

  /**
   * ログ出力可能かチェック
   */
  private canLog(level: LogLevel): boolean {
    // 本番環境でログが無効化されている場合
    if (this.isProduction && !this.config.enableProduction) {
      return level === LogLevel.ERROR
    }

    // コンソール出力が無効化されている場合
    if (!this.config.enableConsole) {
      return false
    }

    // ログレベルチェック
    return level <= this.config.level
  }

  /**
   * 汎用ログ出力メソッド
   */
  log(level: LogLevel, message: string, data?: any): void {
    if (!this.canLog(level)) {
      return
    }

    if (this.shouldFilter(message)) {
      return
    }

    const timestamp = new Date().toISOString()
    const levelName = LogLevel[level]
    const prefix = `[${timestamp}] [${levelName}]`

    switch (level) {
      case LogLevel.ERROR:
        if (data) {
          console.error(prefix, message, data)
        } else {
          console.error(prefix, message)
        }
        break
      case LogLevel.WARN:
        if (data) {
          console.warn(prefix, message, data)
        } else {
          console.warn(prefix, message)
        }
        break
      case LogLevel.INFO:
        if (data) {
          console.info(prefix, message, data)
        } else {
          console.info(prefix, message)
        }
        break
      case LogLevel.DEBUG:
        if (data) {
          console.log(prefix, message, data)
        } else {
          console.log(prefix, message)
        }
        break
    }
  }

  /**
   * エラーログ出力
   */
  error(message: string, error?: Error | any): void {
    this.log(LogLevel.ERROR, message, error)
  }

  /**
   * 警告ログ出力
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data)
  }

  /**
   * 情報ログ出力
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data)
  }

  /**
   * デバッグログ出力
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data)
  }

  /**
   * 現在の設定を取得
   */
  getConfig(): LogConfig {
    return { ...this.config }
  }

  /**
   * ログレベルの文字列表現を取得
   */
  static getLevelName(level: LogLevel): string {
    return LogLevel[level]
  }

  /**
   * 文字列からログレベルを取得
   */
  static parseLevelFromString(levelStr: string): LogLevel {
    const upperStr = levelStr.toUpperCase()
    switch (upperStr) {
      case 'NONE': return LogLevel.NONE
      case 'ERROR': return LogLevel.ERROR
      case 'WARN': return LogLevel.WARN
      case 'INFO': return LogLevel.INFO
      case 'DEBUG': return LogLevel.DEBUG
      default: return LogLevel.INFO
    }
  }
}

/**
 * グローバルロガーインスタンス
 */
export const logger = new ProductionLogger()

/**
 * 環境変数からログレベルを設定
 */
export function configureLoggerFromEnv(): void {
  const logLevel = import.meta.env.VITE_LOG_LEVEL || 
                   (process.env.NODE_ENV === 'production' ? 'ERROR' : 'DEBUG')
  
  const level = ProductionLogger.parseLevelFromString(logLevel)
  logger.setLogLevel(level)

  // 本番環境での詳細制御
  if (process.env.NODE_ENV === 'production') {
    const enableProdLogging = import.meta.env.VITE_ENABLE_PROD_LOGGING === 'true'
    logger.setProductionLogging(enableProdLogging)
  }
}

// 初期化時に環境変数から設定を読み込み
configureLoggerFromEnv()