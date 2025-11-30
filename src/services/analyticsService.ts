/**
 * Firebase Analytics統合サービス
 * ユーザーの使用状況を追跡・分析
 */

import {
  getAnalytics,
  Analytics,
  logEvent,
  setUserProperties,
} from 'firebase/analytics'
import app from '@/config/firebase'

export class AnalyticsService {
  private static instance: AnalyticsService
  private analytics: Analytics | null = null
  private isEnabled: boolean = false

  private constructor() {
    this.initialize()
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Analytics初期化
   */
  private initialize() {
    try {
      if (app) {
        this.analytics = getAnalytics(app)
        this.isEnabled = true
        console.log('📊 Firebase Analytics初期化完了')
      } else {
        console.log('📊 Firebase未設定 - Analytics無効')
      }
    } catch (error) {
      console.warn('📊 Analytics初期化エラー:', error)
      this.isEnabled = false
    }
  }

  /**
   * カスタムイベントをログ
   */
  public logCustomEvent(eventName: string, params?: Record<string, any>) {
    if (!this.isEnabled || !this.analytics) return

    try {
      logEvent(this.analytics, eventName, params)
    } catch (error) {
      console.warn('📊 イベントログエラー:', error)
    }
  }

  /**
   * ページビューをログ
   */
  public logPageView(pageName: string, pageTitle?: string) {
    this.logCustomEvent('ページ表示', {
      ページ名: pageName,
      ページタイトル: pageTitle || pageName,
    })
  }

  /**
   * シャボン玉クリックをログ
   */
  public logBubbleClick(bubbleType: string, bubbleName: string) {
    this.logCustomEvent('シャボン玉クリック', {
      種類: bubbleType,
      名前: bubbleName,
    })
  }

  /**
   * 楽曲登録をログ
   */
  public logSongRegistration(
    songTitle: string,
    songData?: {
      artist?: string
      composer?: string
      lyricist?: string
      arranger?: string
      tags?: string[]
      category?: string
    }
  ) {
    this.logCustomEvent('楽曲登録', {
      楽曲名: songTitle,
      アーティスト: songData?.artist || '未設定',
      作曲者: songData?.composer || '未設定',
      作詞者: songData?.lyricist || '未設定',
      編曲者: songData?.arranger || '未設定',
      タグ数: songData?.tags?.length || 0,
      タグ一覧: songData?.tags?.join(', ') || 'なし',
      カテゴリ: songData?.category || '未設定',
    })
  }

  /**
   * タグ登録をログ
   */
  public logTagRegistration(
    tagName: string,
    tagData?: {
      songCount?: number
      category?: string
      isNew?: boolean
    }
  ) {
    this.logCustomEvent('タグ登録', {
      タグ名: tagName,
      関連楽曲数: tagData?.songCount || 0,
      カテゴリ: tagData?.category || '未設定',
      新規作成: tagData?.isNew ? 'はい' : 'いいえ',
    })
  }

  /**
   * 検索・フィルタリングをログ
   */
  public logSearch(searchType: string, query?: string) {
    this.logCustomEvent('検索実行', {
      検索種類: searchType,
      検索キーワード: query || '',
    })
  }

  /**
   * カテゴリフィルタをログ
   */
  public logCategoryFilter(categories: string[]) {
    this.logCustomEvent('カテゴリフィルタ', {
      選択カテゴリ: categories.join(', '),
      カテゴリ数: categories.length,
    })
  }

  /**
   * 楽曲詳細表示をログ
   */
  public logSongDetailView(
    songTitle: string,
    songData?: {
      artist?: string
      tags?: string[]
    }
  ) {
    this.logCustomEvent('楽曲詳細表示', {
      楽曲名: songTitle,
      アーティスト: songData?.artist || '未設定',
      タグ数: songData?.tags?.length || 0,
    })
  }

  /**
   * タグ詳細表示をログ
   */
  public logTagDetailView(tagName: string, relatedSongCount: number) {
    this.logCustomEvent('タグ詳細表示', {
      タグ名: tagName,
      関連楽曲数: relatedSongCount,
    })
  }

  /**
   * 人物詳細表示をログ
   */
  public logPersonDetailView(
    personName: string,
    personType: string,
    relatedSongCount: number
  ) {
    this.logCustomEvent('人物詳細表示', {
      人物名: personName,
      役割: personType,
      関連楽曲数: relatedSongCount,
    })
  }

  /**
   * エラーをログ
   */
  public logError(errorType: string, errorMessage: string) {
    this.logCustomEvent('エラー発生', {
      エラー種類: errorType,
      エラー内容: errorMessage,
    })
  }

  /**
   * セッション開始をログ
   */
  public logSessionStart() {
    this.logCustomEvent('セッション開始', {
      タイムスタンプ: new Date().toISOString(),
    })
  }

  /**
   * ユーザープロパティを設定
   */
  public setUserProperty(propertyName: string, value: string) {
    if (!this.isEnabled || !this.analytics) return

    try {
      setUserProperties(this.analytics, {
        [propertyName]: value,
      })
    } catch (error) {
      console.warn('📊 ユーザープロパティ設定エラー:', error)
    }
  }

  /**
   * デバイスタイプを設定
   */
  public setDeviceType(isMobile: boolean, isTablet: boolean) {
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
    this.setUserProperty('device_type', deviceType)
  }

  /**
   * Analytics有効状態を取得
   */
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled
  }
}
