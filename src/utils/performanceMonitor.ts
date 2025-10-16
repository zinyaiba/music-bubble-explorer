/**
 * Performance Monitor System
 * パフォーマンス監視とメトリクス収集
 */

export interface PerformanceMetrics {
  frameRate: number;
  renderTime: number;
  bubbleCount: number;
  cacheHitRate: number;
  memoryUsage: number;
  dirtyRegionCount: number;
  renderEfficiency: number;
}

export interface PerformanceThresholds {
  minFrameRate: number;
  maxRenderTime: number;
  maxMemoryUsage: number;
  minCacheHitRate: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxHistorySize = 100;
  private thresholds: PerformanceThresholds = {
    minFrameRate: 30,
    maxRenderTime: 16.67, // 60fps target
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    minCacheHitRate: 0.7
  };

  private frameStartTime = 0;
  private frameCount = 0;
  private lastFrameTime = 0;

  /**
   * フレーム開始の記録
   */
  startFrame(): void {
    this.frameStartTime = performance.now();
  }

  /**
   * フレーム終了の記録
   */
  endFrame(bubbleCount: number, cacheHitRate: number, dirtyRegionCount: number, renderEfficiency: number): void {
    const now = performance.now();
    const renderTime = now - this.frameStartTime;
    
    // フレームレート計算
    const frameRate = this.lastFrameTime > 0 ? 
      1000 / (now - this.lastFrameTime) : 0;
    
    // メモリ使用量取得（利用可能な場合）
    const memoryUsage = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      frameRate,
      renderTime,
      bubbleCount,
      cacheHitRate,
      memoryUsage,
      dirtyRegionCount,
      renderEfficiency
    };

    this.addMetrics(metrics);
    this.lastFrameTime = now;
    this.frameCount++;
  }

  /**
   * 現在のパフォーマンス状態を取得
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? 
      this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * 平均パフォーマンスメトリクスを取得
   */
  getAverageMetrics(sampleSize = 30): PerformanceMetrics | null {
    if (this.metrics.length === 0) return null;

    const samples = this.metrics.slice(-sampleSize);
    const count = samples.length;

    return {
      frameRate: samples.reduce((sum, m) => sum + m.frameRate, 0) / count,
      renderTime: samples.reduce((sum, m) => sum + m.renderTime, 0) / count,
      bubbleCount: samples.reduce((sum, m) => sum + m.bubbleCount, 0) / count,
      cacheHitRate: samples.reduce((sum, m) => sum + m.cacheHitRate, 0) / count,
      memoryUsage: samples.reduce((sum, m) => sum + m.memoryUsage, 0) / count,
      dirtyRegionCount: samples.reduce((sum, m) => sum + m.dirtyRegionCount, 0) / count,
      renderEfficiency: samples.reduce((sum, m) => sum + m.renderEfficiency, 0) / count
    };
  }

  /**
   * パフォーマンス警告のチェック
   */
  checkPerformanceWarnings(): string[] {
    const current = this.getCurrentMetrics();
    if (!current) return [];

    const warnings: string[] = [];

    if (current.frameRate < this.thresholds.minFrameRate) {
      warnings.push(`Low frame rate: ${current.frameRate.toFixed(1)} fps`);
    }

    if (current.renderTime > this.thresholds.maxRenderTime) {
      warnings.push(`High render time: ${current.renderTime.toFixed(2)} ms`);
    }

    if (current.memoryUsage > this.thresholds.maxMemoryUsage) {
      warnings.push(`High memory usage: ${(current.memoryUsage / 1024 / 1024).toFixed(1)} MB`);
    }

    if (current.cacheHitRate < this.thresholds.minCacheHitRate) {
      warnings.push(`Low cache hit rate: ${(current.cacheHitRate * 100).toFixed(1)}%`);
    }

    return warnings;
  }

  /**
   * パフォーマンス最適化の提案
   */
  getOptimizationSuggestions(): string[] {
    const current = this.getCurrentMetrics();
    const average = this.getAverageMetrics();
    
    if (!current || !average) return [];

    const suggestions: string[] = [];

    // フレームレートが低い場合
    if (average.frameRate < this.thresholds.minFrameRate) {
      suggestions.push('Consider reducing bubble count or visual complexity');
      
      if (average.cacheHitRate < 0.8) {
        suggestions.push('Improve caching strategy for better performance');
      }
      
      if (average.renderEfficiency < 0.7) {
        suggestions.push('Enable selective rendering to reduce unnecessary redraws');
      }
    }

    // メモリ使用量が高い場合
    if (average.memoryUsage > this.thresholds.maxMemoryUsage * 0.8) {
      suggestions.push('Consider implementing memory cleanup or reducing cache size');
    }

    // キャッシュヒット率が低い場合
    if (average.cacheHitRate < this.thresholds.minCacheHitRate) {
      suggestions.push('Optimize caching patterns or increase cache size');
    }

    return suggestions;
  }

  /**
   * パフォーマンス統計のエクスポート
   */
  exportStats() {
    const current = this.getCurrentMetrics();
    const average = this.getAverageMetrics();
    const warnings = this.checkPerformanceWarnings();
    const suggestions = this.getOptimizationSuggestions();

    return {
      current,
      average,
      warnings,
      suggestions,
      thresholds: this.thresholds,
      totalFrames: this.frameCount,
      historySize: this.metrics.length
    };
  }

  /**
   * 閾値の設定
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 履歴のクリア
   */
  clearHistory(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
  }

  private addMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // 履歴サイズ制限
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics.shift();
    }
  }

  private getMemoryUsage(): number {
    // ブラウザがサポートしている場合のメモリ使用量取得
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize || 0;
    }
    return 0;
  }
}

// シングルトンインスタンス
export const performanceMonitor = new PerformanceMonitor();