import { IconType } from '../types/enhancedBubble';
import { performanceCache, IconCacheKey } from './performanceCache';

/**
 * IconRenderer - アイコンレンダリングシステム（パフォーマンス最適化版）
 * 各タイプのシャボン玉に対応するアイコンを描画する
 * キャッシュシステムによりアイコンの再描画を最適化
 */
export class IconRenderer {
  /**
   * 音符アイコンの描画実装
   * 楽曲タイプのシャボン玉用
   */
  renderMusicNote(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24; // 基準サイズ24pxからのスケール
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // 音符の符頭（楕円形）
    ctx.beginPath();
    ctx.ellipse(-4, 6, 4, 3, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    // 音符の符幹（縦線）
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -8);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 音符の符尾（旗）
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.quadraticCurveTo(8, -6, 6, -2);
    ctx.quadraticCurveTo(4, -4, 0, -5);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * ペンアイコンの描画実装
   * 作詞家タイプのシャボン玉用
   */
  renderPen(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // ペンの軸
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(6, -6);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // ペン先
    ctx.beginPath();
    ctx.moveTo(6, -6);
    ctx.lineTo(8, -8);
    ctx.lineTo(4, -10);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    // ペンのグリップ部分
    ctx.beginPath();
    ctx.moveTo(-6, 6);
    ctx.lineTo(-4, 4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // インクの線（装飾）
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.quadraticCurveTo(10, -6, 9, -4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * 楽譜アイコンの描画実装
   * 作曲家タイプのシャボン玉用
   */
  renderMusicSheet(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // 楽譜の背景（紙）
    ctx.beginPath();
    ctx.roundRect(-8, -10, 16, 20, 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // 五線譜の線
    for (let i = 0; i < 5; i++) {
      const y = -6 + i * 2;
      ctx.beginPath();
      ctx.moveTo(-6, y);
      ctx.lineTo(6, y);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    
    // 音符（小さな円）
    const notePositions = [
      { x: -4, y: -4 },
      { x: -1, y: -2 },
      { x: 2, y: 0 },
      { x: 5, y: 2 }
    ];
    
    notePositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fill();
    });
    
    ctx.restore();
  }

  /**
   * ミキサーアイコンの描画実装
   * 編曲家タイプのシャボン玉用
   */
  renderMixer(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // ミキサーのベース
    ctx.beginPath();
    ctx.roundRect(-8, -6, 16, 12, 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // フェーダー（3本）
    const faderPositions = [-4, 0, 4];
    const faderHeights = [-2, 1, -1];
    
    faderPositions.forEach((x, index) => {
      // フェーダーのスロット
      ctx.beginPath();
      ctx.moveTo(x, -4);
      ctx.lineTo(x, 4);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // フェーダーのつまみ
      ctx.beginPath();
      ctx.roundRect(x - 1, faderHeights[index] - 1, 2, 2, 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();
    });
    
    // ノブ（2個）
    ctx.beginPath();
    ctx.arc(-5, -8, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(5, -8, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * ハッシュタグアイコンの描画実装
   * タグタイプのシャボン玉用
   */
  renderHashtag(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    // 縦線（2本）
    ctx.beginPath();
    ctx.moveTo(-3, -8);
    ctx.lineTo(-5, 8);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(3, -8);
    ctx.lineTo(1, 8);
    ctx.stroke();
    
    // 横線（2本）
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(8, -1);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-8, 3);
    ctx.lineTo(8, 5);
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * 複数役割アイコンの描画実装
   * 複数の役割を持つ人物のシャボン玉用
   */
  renderMultiRole(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const scale = size / 24;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.7, scale * 0.7); // 少し小さくして複数表示
    
    // 背景円
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();
    
    // 複数のアイコンを小さく配置
    // 音符（上）
    ctx.save();
    ctx.translate(0, -6);
    ctx.scale(0.5, 0.5);
    this.renderMusicNote(ctx, 0, 0, 12);
    ctx.restore();
    
    // ペン（左下）
    ctx.save();
    ctx.translate(-5, 4);
    ctx.scale(0.5, 0.5);
    this.renderPen(ctx, 0, 0, 12);
    ctx.restore();
    
    // 楽譜（右下）
    ctx.save();
    ctx.translate(5, 4);
    ctx.scale(0.5, 0.5);
    this.renderMusicSheet(ctx, 0, 0, 12);
    ctx.restore();
    
    ctx.restore();
  }

  /**
   * 複合アイコンの描画実装
   * 特定の役割組み合わせに応じた複合アイコンを描画
   */
  renderCompositeIcon(
    ctx: CanvasRenderingContext2D, 
    roles: string[], 
    x: number, 
    y: number, 
    size: number
  ): void {
    if (roles.length <= 1) {
      // Single role - use standard icon
      const iconType = this.getRoleIconType(roles[0] || 'lyricist');
      this.renderIcon(ctx, iconType, x, y, size);
      return;
    }

    const scale = size / 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 0.8, scale * 0.8);

    // 背景円（半透明）
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();

    if (roles.length === 2) {
      // 2つの役割 - 左右に配置
      this.renderRoleIconAt(ctx, roles[0], -6, 0, 14);
      this.renderRoleIconAt(ctx, roles[1], 6, 0, 14);
    } else if (roles.length === 3) {
      // 3つの役割 - 三角形配置
      this.renderRoleIconAt(ctx, roles[0], 0, -7, 12);
      this.renderRoleIconAt(ctx, roles[1], -6, 5, 12);
      this.renderRoleIconAt(ctx, roles[2], 6, 5, 12);
    } else {
      // 4つ以上 - デフォルトの複数役割アイコン
      this.renderMultiRole(ctx, 0, 0, size);
    }

    ctx.restore();
  }

  /**
   * 特定位置に役割アイコンを描画
   */
  private renderRoleIconAt(
    ctx: CanvasRenderingContext2D,
    role: string,
    x: number,
    y: number,
    size: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.6, 0.6); // アイコンを小さくスケール

    switch (role) {
      case 'lyricist':
        this.renderPen(ctx, 0, 0, size);
        break;
      case 'composer':
        this.renderMusicSheet(ctx, 0, 0, size);
        break;
      case 'arranger':
        this.renderMixer(ctx, 0, 0, size);
        break;
      default:
        this.renderMusicNote(ctx, 0, 0, size);
    }

    ctx.restore();
  }

  /**
   * 役割に対応するアイコンタイプを取得
   */
  private getRoleIconType(role: string): IconType {
    switch (role) {
      case 'lyricist':
        return IconType.PEN;
      case 'composer':
        return IconType.MUSIC_SHEET;
      case 'arranger':
        return IconType.MIXER;
      default:
        return IconType.MUSIC_NOTE;
    }
  }

  /**
   * 指定されたアイコンタイプに応じてアイコンを描画（キャッシュ最適化版）
   */
  renderIcon(
    ctx: CanvasRenderingContext2D,
    iconType: IconType,
    x: number,
    y: number,
    size: number,
    color: string = 'rgba(255, 255, 255, 0.9)'
  ): void {
    // キャッシュキーを作成
    const cacheKey: IconCacheKey = {
      type: iconType,
      size: Math.round(size),
      color
    };

    // キャッシュからアイコンを取得
    const cachedIcon = performanceCache.getCachedIcon(cacheKey);
    if (cachedIcon) {
      // キャッシュされたImageDataを使用
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = cachedIcon.width;
      tempCanvas.height = cachedIcon.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.putImageData(cachedIcon, 0, 0);
        ctx.drawImage(tempCanvas, x - size/2, y - size/2);
      }
      return;
    }

    // キャッシュにない場合は新規作成
    const iconCanvas = this.createIconCanvas(iconType, size, color);
    if (iconCanvas) {
      // ImageDataとしてキャッシュに保存
      const iconCtx = iconCanvas.getContext('2d');
      if (iconCtx) {
        const imageData = iconCtx.getImageData(0, 0, iconCanvas.width, iconCanvas.height);
        performanceCache.cacheIcon(cacheKey, imageData);
      }
      ctx.drawImage(iconCanvas, x - size/2, y - size/2);
    } else {
      // フォールバック: 直接描画
      this.renderIconDirect(ctx, iconType, x, y, size);
    }
  }

  /**
   * 新しいアイコンキャンバスを作成
   */
  private createIconCanvas(iconType: IconType, size: number, color: string): HTMLCanvasElement | null {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    // アイコンを中央に描画
    const centerX = size / 2;
    const centerY = size / 2;
    
    // 色を設定
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    this.renderIconDirect(ctx, iconType, centerX, centerY, size);
    return canvas;
  }

  /**
   * 直接アイコンを描画（キャッシュなし）
   */
  private renderIconDirect(
    ctx: CanvasRenderingContext2D,
    iconType: IconType,
    x: number,
    y: number,
    size: number
  ): void {
    switch (iconType) {
      case IconType.MUSIC_NOTE:
        this.renderMusicNote(ctx, x, y, size);
        break;
      case IconType.PEN:
        this.renderPen(ctx, x, y, size);
        break;
      case IconType.MUSIC_SHEET:
        this.renderMusicSheet(ctx, x, y, size);
        break;
      case IconType.MIXER:
        this.renderMixer(ctx, x, y, size);
        break;
      case IconType.HASHTAG:
        this.renderHashtag(ctx, x, y, size);
        break;
      case IconType.MULTI_ROLE:
        this.renderMultiRole(ctx, x, y, size);
        break;
      default:
        // フォールバック: シンプルな円
        ctx.beginPath();
        ctx.arc(x, y, size / 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    performanceCache.clearAll();
  }
}

// シングルトンインスタンスをエクスポート
export const iconRenderer = new IconRenderer();