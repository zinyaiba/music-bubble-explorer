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
    this.logCustomEvent('page_view', {
      page_name: pageName,
      page_title: pageTitle || pageName,
    })
  }

  /**
   * シャボン玉クリックをログ
   */
  public logBubbleClick(bubbleType: string, bubbleName: string) {
    this.logCustomEvent('bubble_click', {
      bubble_type: bubbleType,
      bubble_name: bubbleName,
    })
  }

  /**
   * 楽曲登録をログ
   */
  public logSongRegistration(songTitle: string, hasTag: boolean) {
    this.logCustomEvent('song_registration', {
      song_title: songTitle,
      has_tag: hasTag,
    })
  }

  /**
   * タグ登録をログ
   */
  public logTagRegistration(tagName: string, songCount: number) {
    this.logCustomEvent('tag_registration', {
      tag_name: tagName,
      song_count: songCount,
    })
  }

  /**
   * 検索・フィルタリングをログ
   */
  public logSearch(searchType: string, query?: string) {
    this.logCustomEvent('search', {
      search_type: searchType,
      search_query: query,
    })
  }

  /**
   * カテゴリフィルタをログ
   */
  public logCategoryFilter(categories: string[]) {
    this.logCustomEvent('category_filter', {
      selected_categories: categories.join(','),
      category_count: categories.length,
    })
  }

  /**
   * 楽曲詳細表示をログ
   */
  public logSongDetailView(songTitle: string) {
    this.logCustomEvent('song_detail_view', {
      song_title: songTitle,
    })
  }

  /**
   * タグ詳細表示をログ
   */
  public logTagDetailView(tagName: string, relatedSongCount: number) {
    this.logCustomEvent('tag_detail_view', {
      tag_name: tagName,
      related_song_count: relatedSongCount,
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
    this.logCustomEvent('person_detail_view', {
      person_name: personName,
      person_type: personType,
      related_song_count: relatedSongCount,
    })
  }

  /**
   * エラーをログ
   */
  public logError(errorType: string, errorMessage: string) {
    this.logCustomEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
    })
  }

  /**
   * セッション開始をログ
   */
  public logSessionStart() {
    this.logCustomEvent('session_start', {
      timestamp: new Date().toISOString(),
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
