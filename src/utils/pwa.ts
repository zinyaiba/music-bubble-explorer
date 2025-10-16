/**
 * PWA関連のユーティリティ関数
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  constructor() {
    this.initializePWA();
    this.setupOnlineOfflineHandlers();
  }

  /**
   * PWAの初期化
   */
  private initializePWA(): void {
    // Service Workerの登録
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        this.registerServiceWorker();
      });
    }

    // インストールプロンプトの処理
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as any;
      this.showInstallButton();
    });

    // アプリがインストールされた時の処理
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  /**
   * Service Workerの登録
   */
  private async registerServiceWorker(): Promise<void> {
    try {
      // 開発環境では一時的にサービスワーカーを無効化
      if (process.env.NODE_ENV === 'development') {
        console.log('Service Worker registration skipped in development');
        return;
      }
      
      // 動的にベースパスを取得
      const basePath = import.meta.env.BASE_URL || '/'
      const swPath = `${basePath}sw.js`.replace(/\/+/g, '/') // 重複スラッシュを除去
      
      // サービスワーカーファイルの存在確認
      const response = await fetch(swPath, { method: 'HEAD' });
      if (!response.ok) {
        console.warn('Service Worker file not found:', swPath);
        return;
      }
      
      const registration = await navigator.serviceWorker.register(swPath);
      console.log('Service Worker registered successfully:', registration);

      // 更新チェック
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New Service Worker available');
              this.showUpdateAvailable();
            }
          });
        }
      });

    } catch (error) {
      console.warn('Service Worker registration failed (this is normal in development):', error);
    }
  }

  /**
   * オンライン/オフライン状態の監視
   */
  private setupOnlineOfflineHandlers(): void {
    window.addEventListener('online', () => {
      console.log('PWA: Back online');
      this.isOnline = true;
      this.showOnlineStatus();
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline');
      this.isOnline = false;
      this.showOfflineStatus();
    });
  }

  /**
   * アプリのインストールを促す
   */
  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  /**
   * インストールボタンの表示
   */
  private showInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
  }

  /**
   * インストールボタンの非表示
   */
  private hideInstallButton(): void {
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  /**
   * アップデート利用可能の通知
   */
  private showUpdateAvailable(): void {
    const updateBanner = document.getElementById('pwa-update-banner');
    if (updateBanner) {
      updateBanner.style.display = 'block';
    }
  }

  /**
   * オンライン状態の表示
   */
  private showOnlineStatus(): void {
    const statusIndicator = document.getElementById('pwa-status-indicator');
    if (statusIndicator) {
      statusIndicator.className = 'pwa-status online';
      statusIndicator.textContent = 'オンライン';
    }
  }

  /**
   * オフライン状態の表示
   */
  private showOfflineStatus(): void {
    const statusIndicator = document.getElementById('pwa-status-indicator');
    if (statusIndicator) {
      statusIndicator.className = 'pwa-status offline';
      statusIndicator.textContent = 'オフライン';
    }
  }

  /**
   * 現在のオンライン状態を取得
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * アプリがインストール済みかチェック
   */
  public isAppInstalled(): boolean {
    return this.isInstalled || window.matchMedia('(display-mode: standalone)').matches;
  }

  /**
   * PWAの機能が利用可能かチェック
   */
  public isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
}

// グローバルインスタンス
export const pwaManager = new PWAManager();