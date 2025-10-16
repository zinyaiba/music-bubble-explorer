/**
 * Performance Cache System
 * アイコンキャッシュシステムとグラデーションパターンのキャッシュを提供
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface IconCacheKey {
  type: string;
  size: number;
  color: string;
}

export interface GradientCacheKey {
  colors: string[];
  direction: number;
  width: number;
  height: number;
}

export class PerformanceCache {
  private iconCache = new Map<string, CacheEntry<ImageData>>();
  private gradientCache = new Map<string, CacheEntry<CanvasGradient>>();
  private shapeCache = new Map<string, CacheEntry<Path2D>>();
  private maxCacheSize = 100;
  private maxAge = 5 * 60 * 1000; // 5分

  /**
   * アイコンキャッシュの管理
   */
  cacheIcon(key: IconCacheKey, imageData: ImageData): void {
    const cacheKey = this.generateIconCacheKey(key);
    this.addToCache(this.iconCache, cacheKey, imageData);
  }

  getCachedIcon(key: IconCacheKey): ImageData | null {
    const cacheKey = this.generateIconCacheKey(key);
    return this.getFromCache(this.iconCache, cacheKey);
  }

  /**
   * グラデーションキャッシュの管理
   */
  cacheGradient(key: GradientCacheKey, gradient: CanvasGradient): void {
    const cacheKey = this.generateGradientCacheKey(key);
    this.addToCache(this.gradientCache, cacheKey, gradient);
  }

  getCachedGradient(key: GradientCacheKey): CanvasGradient | null {
    const cacheKey = this.generateGradientCacheKey(key);
    return this.getFromCache(this.gradientCache, cacheKey);
  }

  /**
   * 形状キャッシュの管理
   */
  cacheShape(key: string, path: Path2D): void {
    this.addToCache(this.shapeCache, key, path);
  }

  getCachedShape(key: string): Path2D | null {
    return this.getFromCache(this.shapeCache, key);
  }

  /**
   * キャッシュの統計情報
   */
  getCacheStats() {
    return {
      iconCache: {
        size: this.iconCache.size,
        hitRate: this.calculateHitRate(this.iconCache)
      },
      gradientCache: {
        size: this.gradientCache.size,
        hitRate: this.calculateHitRate(this.gradientCache)
      },
      shapeCache: {
        size: this.shapeCache.size,
        hitRate: this.calculateHitRate(this.shapeCache)
      }
    };
  }

  /**
   * キャッシュのクリーンアップ
   */
  cleanup(): void {
    this.cleanupCache(this.iconCache);
    this.cleanupCache(this.gradientCache);
    this.cleanupCache(this.shapeCache);
  }

  /**
   * 全キャッシュのクリア
   */
  clearAll(): void {
    this.iconCache.clear();
    this.gradientCache.clear();
    this.shapeCache.clear();
  }

  private generateIconCacheKey(key: IconCacheKey): string {
    return `${key.type}_${key.size}_${key.color}`;
  }

  private generateGradientCacheKey(key: GradientCacheKey): string {
    return `${key.colors.join('_')}_${key.direction}_${key.width}_${key.height}`;
  }

  private addToCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    // キャッシュサイズ制限チェック
    if (cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed(cache);
    }

    const now = Date.now();
    cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now
    });
  }

  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) {
      return null;
    }

    // 有効期限チェック
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      cache.delete(key);
      return null;
    }

    // アクセス統計更新
    entry.accessCount++;
    entry.lastAccessed = now;

    return entry.data;
  }

  private evictLeastRecentlyUsed<T>(cache: Map<string, CacheEntry<T>>): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  private calculateHitRate<T>(cache: Map<string, CacheEntry<T>>): number {
    let totalAccess = 0;
    let totalEntries = 0;

    for (const entry of cache.values()) {
      totalAccess += entry.accessCount;
      totalEntries++;
    }

    return totalEntries > 0 ? totalAccess / totalEntries : 0;
  }

  private cleanupCache<T>(cache: Map<string, CacheEntry<T>>): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));
  }
}

// シングルトンインスタンス
export const performanceCache = new PerformanceCache();