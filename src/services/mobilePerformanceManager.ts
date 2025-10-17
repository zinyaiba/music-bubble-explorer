/**
 * Mobile Performance Manager
 * モバイルパフォーマンス強化とチラつき防止システム
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

export interface MobilePerformanceConfig {
  enableGPUAcceleration: boolean;
  enableLayerSeparation: boolean;
  enableDialogProtection: boolean;
  enableFlickerPrevention: boolean;
  animationControlDuringDialog: boolean;
  renderingOptimization: boolean;
}

export interface DialogState {
  isOpen: boolean;
  type: 'modal' | 'form' | 'management' | 'tag-list' | null;
  zIndex: number;
  protectionLayer: HTMLElement | null;
}

export interface PerformanceMetrics {
  flickerEvents: number;
  dialogStabilityScore: number;
  renderingEfficiency: number;
  gpuAccelerationActive: boolean;
  layerSeparationActive: boolean;
}

/**
 * モバイルパフォーマンス管理クラス
 */
export class MobilePerformanceManager {
  private static instance: MobilePerformanceManager | null = null;
  
  private config: MobilePerformanceConfig;
  private dialogState: DialogState;
  private animationPaused: boolean = false;
  private performanceMetrics: PerformanceMetrics;
  private flickerPreventionActive: boolean = false;
  private renderingLayers: Map<string, HTMLElement> = new Map();
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private constructor() {
    this.config = {
      enableGPUAcceleration: true,
      enableLayerSeparation: true,
      enableDialogProtection: true,
      enableFlickerPrevention: true,
      animationControlDuringDialog: true,
      renderingOptimization: true
    };

    this.dialogState = {
      isOpen: false,
      type: null,
      zIndex: 9999,
      protectionLayer: null
    };

    this.performanceMetrics = {
      flickerEvents: 0,
      dialogStabilityScore: 100,
      renderingEfficiency: 100,
      gpuAccelerationActive: false,
      layerSeparationActive: false
    };

    this.initialize();
  }

  /**
   * シングルトンインスタンスの取得
   */
  public static getInstance(): MobilePerformanceManager {
    if (!MobilePerformanceManager.instance) {
      MobilePerformanceManager.instance = new MobilePerformanceManager();
    }
    return MobilePerformanceManager.instance;
  }

  /**
   * 初期化処理
   */
  private initialize(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // GPU加速の適用
    if (this.config.enableGPUAcceleration) {
      this.applyGPUAcceleration();
    }

    // レイヤー分離の設定
    if (this.config.enableLayerSeparation) {
      this.setupLayerSeparation();
    }

    // チラつき防止の設定
    if (this.config.enableFlickerPrevention) {
      this.setupFlickerPrevention();
    }

    // レンダリング最適化の設定
    if (this.config.renderingOptimization) {
      this.setupRenderingOptimization();
    }

    // リサイズ監視の設定
    this.setupResizeObserver();

    console.log('🚀 MobilePerformanceManager initialized with config:', this.config);
  }

  /**
   * GPU加速の適用
   */
  private applyGPUAcceleration(): void {
    const style = document.createElement('style');
    style.textContent = `
      .gpu-accelerated {
        transform: translateZ(0);
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      }

      .gpu-layer {
        transform: translate3d(0, 0, 0);
        will-change: transform, opacity;
        backface-visibility: hidden;
      }

      .animation-optimized {
        transform: translateZ(0);
        will-change: transform, opacity;
        contain: layout style paint;
      }
    `;
    document.head.appendChild(style);

    // 主要な要素にGPU加速を適用
    const bubbleCanvas = document.querySelector('.bubble-canvas');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (bubbleCanvas) {
      bubbleCanvas.classList.add('gpu-accelerated', 'animation-optimized');
    }
    
    if (modalOverlay) {
      modalOverlay.classList.add('gpu-layer');
    }

    this.performanceMetrics.gpuAccelerationActive = true;
  }

  /**
   * レイヤー分離の設定
   */
  private setupLayerSeparation(): void {
    const style = document.createElement('style');
    style.textContent = `
      .layer-separated {
        isolation: isolate;
        contain: layout style paint;
      }

      .dialog-layer {
        position: fixed;
        z-index: 9999;
        isolation: isolate;
        contain: layout style paint size;
        transform: translateZ(0);
      }

      .animation-layer {
        position: relative;
        z-index: 1;
        contain: layout style paint;
        transform: translateZ(0);
      }

      .background-layer {
        position: relative;
        z-index: 0;
        contain: layout style paint;
      }
    `;
    document.head.appendChild(style);

    this.performanceMetrics.layerSeparationActive = true;
  }

  /**
   * チラつき防止の設定
   */
  private setupFlickerPrevention(): void {
    const style = document.createElement('style');
    style.textContent = `
      .flicker-prevention {
        backface-visibility: hidden;
        transform: translateZ(0);
        will-change: auto;
        contain: layout style paint;
      }

      .stable-rendering {
        transform: translate3d(0, 0, 0);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        -webkit-transform: translate3d(0, 0, 0);
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
      }

      .dialog-stable {
        position: fixed !important;
        transform: translate3d(0, 0, 0) !important;
        backface-visibility: hidden !important;
        will-change: auto !important;
      }
    `;
    document.head.appendChild(style);

    this.flickerPreventionActive = true;
  }

  /**
   * レンダリング最適化の設定
   */
  private setupRenderingOptimization(): void {
    const style = document.createElement('style');
    style.textContent = `
      .rendering-optimized {
        contain: layout style paint size;
        content-visibility: auto;
        contain-intrinsic-size: 0 500px;
      }

      .animation-container {
        contain: layout style paint;
        transform: translateZ(0);
        will-change: transform;
      }

      .dialog-container {
        contain: layout style paint size;
        isolation: isolate;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * リサイズ監視の設定
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.handleElementResize(entry);
      }
    });

    // 主要な要素を監視
    const bubbleContainer = document.querySelector('.bubble-container');
    if (bubbleContainer) {
      this.resizeObserver.observe(bubbleContainer);
    }
  }

  /**
   * 要素のリサイズ処理
   */
  private handleElementResize(entry: ResizeObserverEntry): void {
    const element = entry.target as HTMLElement;
    
    // リサイズ時のチラつき防止
    if (this.flickerPreventionActive) {
      element.style.willChange = 'auto';
      
      // 短時間後にwill-changeをリセット
      setTimeout(() => {
        element.style.willChange = '';
      }, 100);
    }
  }

  /**
   * ダイアログ状態の管理
   */
  public handleDialogState(isOpen: boolean, type: 'modal' | 'form' | 'management' | 'tag-list' | null = null): void {
    const wasOpen = this.dialogState.isOpen;
    
    this.dialogState.isOpen = isOpen;
    this.dialogState.type = type;

    if (isOpen && !wasOpen) {
      this.onDialogOpen();
    } else if (!isOpen && wasOpen) {
      this.onDialogClose();
    }
  }

  /**
   * ダイアログ開放時の処理
   */
  private onDialogOpen(): void {
    if (this.config.enableDialogProtection) {
      this.createDialogProtectionLayer();
    }

    if (this.config.animationControlDuringDialog) {
      this.pauseAnimationsDuringDialog();
    }

    // ダイアログの安定化
    this.stabilizeDialog();
  }

  /**
   * ダイアログ閉鎖時の処理
   */
  private onDialogClose(): void {
    if (this.dialogState.protectionLayer) {
      this.removeDialogProtectionLayer();
    }

    if (this.config.animationControlDuringDialog) {
      this.resumeAnimationsAfterDialog();
    }
  }

  /**
   * ダイアログ保護レイヤーの作成
   */
  private createDialogProtectionLayer(): void {
    if (this.dialogState.protectionLayer) {
      return;
    }

    const protectionLayer = document.createElement('div');
    protectionLayer.className = 'dialog-protection-layer';
    protectionLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: ${this.dialogState.zIndex - 1};
      pointer-events: none;
      background: transparent;
      isolation: isolate;
      contain: layout style paint size;
      transform: translateZ(0);
    `;

    document.body.appendChild(protectionLayer);
    this.dialogState.protectionLayer = protectionLayer;
  }

  /**
   * ダイアログ保護レイヤーの削除
   */
  private removeDialogProtectionLayer(): void {
    if (this.dialogState.protectionLayer && typeof document !== 'undefined') {
      document.body.removeChild(this.dialogState.protectionLayer);
      this.dialogState.protectionLayer = null;
    }
  }

  /**
   * ダイアログの安定化（34.1対応: モバイルダイアログ表示の修正）
   */
  private stabilizeDialog(): void {
    if (typeof document === 'undefined') {
      return;
    }

    // 少し遅延してダイアログ要素を取得
    setTimeout(() => {
      if (typeof document === 'undefined') {
        return;
      }

      // より広範囲のダイアログ要素を対象にする
      const dialogElements = document.querySelectorAll(
        '.modal-overlay, .modal-content, .form-modal, .simple-dialog-overlay, .simple-dialog'
      );
      
      dialogElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.classList.add('dialog-stable', 'layer-separated', 'mobile-dialog-stable');
        
        // モバイル専用の最適化クラスを追加
        if (this.isMobileDevice()) {
          htmlElement.classList.add('mobile-touch-optimized');
        }
        
        // z-indexの確保
        if (htmlElement.classList.contains('modal-overlay') || 
            htmlElement.classList.contains('simple-dialog-overlay')) {
          htmlElement.style.zIndex = this.dialogState.zIndex.toString();
        }
        
        // モバイルでの表示一貫性確保
        if (this.isMobileDevice()) {
          htmlElement.style.position = 'fixed';
          htmlElement.style.transform = 'translate3d(0, 0, 0)';
          htmlElement.style.backfaceVisibility = 'hidden';
          htmlElement.style.willChange = 'auto';
        }
      });
    }, 10);
  }

  /**
   * モバイルデバイスの検出
   */
  private isMobileDevice(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
  }

  /**
   * ダイアログ表示中のアニメーション制御
   */
  private pauseAnimationsDuringDialog(): void {
    if (this.animationPaused || typeof document === 'undefined') {
      return;
    }

    const animationElements = document.querySelectorAll('.bubble-canvas, .animation-container');
    
    animationElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.animationPlayState = 'paused';
      htmlElement.style.willChange = 'auto';
    });

    this.animationPaused = true;
  }

  /**
   * ダイアログ閉鎖後のアニメーション再開
   */
  private resumeAnimationsAfterDialog(): void {
    if (!this.animationPaused || typeof document === 'undefined') {
      return;
    }

    const animationElements = document.querySelectorAll('.bubble-canvas, .animation-container');
    
    animationElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.animationPlayState = 'running';
      htmlElement.style.willChange = 'transform';
    });

    this.animationPaused = false;
  }

  /**
   * モバイル最適化の適用
   */
  public applyMobileOptimizations(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // モバイルデバイスの検出
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .mobile-optimized {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        .mobile-dialog {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
          will-change: auto;
        }

        .mobile-animation {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }
      }
    `;
    document.head.appendChild(style);

    // モバイル最適化クラスの適用
    document.body.classList.add('mobile-optimized');
  }

  /**
   * パフォーマンスメトリクスの更新
   */
  public updatePerformanceMetrics(): void {
    // チラつきイベントの検出
    this.detectFlickerEvents();
    
    // ダイアログ安定性スコアの計算
    this.calculateDialogStabilityScore();
    
    // レンダリング効率の計算
    this.calculateRenderingEfficiency();
  }

  /**
   * チラつきイベントの検出
   */
  private detectFlickerEvents(): void {
    // 簡易的なチラつき検出（実装例）
    const dialogElements = document.querySelectorAll('.modal-overlay, .modal-content');
    
    dialogElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const transform = computedStyle.transform;
      
      // transformが頻繁に変更される場合はチラつきの可能性
      if (transform && transform !== 'none' && !transform.includes('translate3d')) {
        this.performanceMetrics.flickerEvents++;
      }
    });
  }

  /**
   * ダイアログ安定性スコアの計算
   */
  private calculateDialogStabilityScore(): void {
    if (!this.dialogState.isOpen) {
      this.performanceMetrics.dialogStabilityScore = 100;
      return;
    }

    const dialogElements = document.querySelectorAll('.modal-overlay, .modal-content');
    let stabilityScore = 100;

    dialogElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const rect = htmlElement.getBoundingClientRect();
      
      // 要素が画面外にある場合はスコアを減点
      if (rect.width === 0 || rect.height === 0) {
        stabilityScore -= 20;
      }
      
      // z-indexが適切でない場合はスコアを減点
      const zIndex = parseInt(window.getComputedStyle(htmlElement).zIndex || '0');
      if (zIndex < this.dialogState.zIndex - 100) {
        stabilityScore -= 10;
      }
    });

    this.performanceMetrics.dialogStabilityScore = Math.max(0, stabilityScore);
  }

  /**
   * レンダリング効率の計算
   */
  private calculateRenderingEfficiency(): void {
    let efficiency = 100;

    // GPU加速が無効な場合は効率を減点
    if (!this.performanceMetrics.gpuAccelerationActive) {
      efficiency -= 20;
    }

    // レイヤー分離が無効な場合は効率を減点
    if (!this.performanceMetrics.layerSeparationActive) {
      efficiency -= 15;
    }

    // チラつきイベントが多い場合は効率を減点
    if (this.performanceMetrics.flickerEvents > 5) {
      efficiency -= 30;
    }

    this.performanceMetrics.renderingEfficiency = Math.max(0, efficiency);
  }

  /**
   * 設定の更新
   */
  public updateConfig(newConfig: Partial<MobilePerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 設定変更に応じて再初期化
    this.initialize();
  }

  /**
   * パフォーマンスメトリクスの取得
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    this.updatePerformanceMetrics();
    return { ...this.performanceMetrics };
  }

  /**
   * ダイアログ状態の取得
   */
  public getDialogState(): DialogState {
    return { ...this.dialogState };
  }

  /**
   * 設定の取得
   */
  public getConfig(): MobilePerformanceConfig {
    return { ...this.config };
  }

  /**
   * クリーンアップ
   */
  public cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.dialogState.protectionLayer) {
      this.removeDialogProtectionLayer();
    }

    this.renderingLayers.clear();
  }

  /**
   * デストラクタ
   */
  public destroy(): void {
    this.cleanup();
    MobilePerformanceManager.instance = null;
  }
}

// シングルトンインスタンスのエクスポート
export const mobilePerformanceManager = MobilePerformanceManager.getInstance();