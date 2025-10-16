import { iconRenderer } from '../utils/iconRenderer';
import { IconType } from '../types/enhancedBubble';

/**
 * IconRenderer使用例
 * 各種アイコンの描画方法を示すサンプルコード
 */

// Canvas要素の取得（実際の使用時）
function getCanvasContext(): CanvasRenderingContext2D | null {
  const canvas = document.getElementById('bubbleCanvas') as HTMLCanvasElement;
  return canvas?.getContext('2d') || null;
}

/**
 * 基本的なアイコン描画の例
 */
export function basicIconRendering() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  // シングルトンインスタンスを使用
  const renderer = iconRenderer;

  // 各種アイコンを描画
  renderer.renderMusicNote(ctx, 100, 100, 24);    // 音符アイコン
  renderer.renderPen(ctx, 200, 100, 24);          // ペンアイコン
  renderer.renderMusicSheet(ctx, 300, 100, 24);   // 楽譜アイコン
  renderer.renderMixer(ctx, 400, 100, 24);        // ミキサーアイコン
  renderer.renderHashtag(ctx, 500, 100, 24);      // ハッシュタグアイコン
  renderer.renderMultiRole(ctx, 600, 100, 24);    // 複数役割アイコン
}

/**
 * アイコンタイプによる動的描画の例
 */
export function dynamicIconRendering() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  
  // アイコンタイプの配列
  const iconTypes = [
    IconType.MUSIC_NOTE,
    IconType.PEN,
    IconType.MUSIC_SHEET,
    IconType.MIXER,
    IconType.HASHTAG,
    IconType.MULTI_ROLE
  ];

  // 各アイコンタイプを順番に描画
  iconTypes.forEach((iconType, index) => {
    const x = 100 + index * 80;
    const y = 200;
    const size = 32;
    
    renderer.renderIcon(ctx, iconType, x, y, size);
  });
}

/**
 * サイズ違いのアイコン描画例
 */
export function scaledIconRendering() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  const sizes = [16, 24, 32, 48];
  
  sizes.forEach((size, index) => {
    const x = 100 + index * 80;
    const y = 300;
    
    // 音符アイコンを異なるサイズで描画
    renderer.renderMusicNote(ctx, x, y, size);
  });
}

/**
 * シャボン玉内でのアイコン描画例
 */
export function bubbleIconRendering() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  
  // シャボン玉の描画
  const bubbleX = 300;
  const bubbleY = 400;
  const bubbleRadius = 40;
  
  // シャボン玉の背景
  ctx.beginPath();
  ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 107, 157, 0.8)'; // ピンクのグラデーション
  ctx.fill();
  
  // シャボン玉の境界線
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // シャボン玉内にアイコンを描画
  const iconSize = bubbleRadius * 0.6; // シャボン玉の60%のサイズ
  renderer.renderMusicNote(ctx, bubbleX, bubbleY, iconSize);
}

/**
 * 複数役割アイコンの詳細例
 */
export function multiRoleIconExample() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  
  // 複数役割を持つ人物のシャボン玉
  const x = 500;
  const y = 400;
  const radius = 50;
  
  // 虹色グラデーションの背景
  const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  gradient.addColorStop(0, '#FF6B9D');
  gradient.addColorStop(0.25, '#4ECDC4');
  gradient.addColorStop(0.5, '#A8E6CF');
  gradient.addColorStop(0.75, '#FFD93D');
  gradient.addColorStop(1, '#B8A9FF');
  
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // 複数役割アイコンを描画
  renderer.renderMultiRole(ctx, x, y, radius * 0.8);
}

/**
 * アイコンのアニメーション例（回転）
 */
export function animatedIconExample() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  let rotation = 0;
  
  function animate() {
    if (!ctx) return;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 回転を適用してアイコンを描画
    ctx.save();
    ctx.translate(400, 500);
    ctx.rotate(rotation);
    
    renderer.renderMixer(ctx, 0, 0, 48);
    
    ctx.restore();
    
    rotation += 0.02;
    requestAnimationFrame(animate);
  }
  
  animate();
}

/**
 * エラーハンドリングの例
 */
export function iconRenderingWithErrorHandling() {
  const ctx = getCanvasContext();
  if (!ctx) return;

  const renderer = iconRenderer;
  
  try {
    // 無効なアイコンタイプでの描画テスト
    renderer.renderIcon(ctx, 'invalid' as IconType, 100, 100, 24);
  } catch (error) {
    console.warn('アイコン描画エラー:', error);
    
    // フォールバック: デフォルトの円を描画
    ctx.beginPath();
    ctx.arc(100, 100, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
}

// 使用例の実行
export function runIconRendererExamples() {
  console.log('IconRenderer使用例を実行中...');
  
  basicIconRendering();
  dynamicIconRendering();
  scaledIconRendering();
  bubbleIconRendering();
  multiRoleIconExample();
  iconRenderingWithErrorHandling();
  
  // アニメーション例は最後に実行（無限ループのため）
  // animatedIconExample();
  
  console.log('IconRenderer使用例完了');
}