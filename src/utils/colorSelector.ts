import { pastelColors } from '../styles/theme';
import { BubbleType } from '../types/music';

/**
 * シャボン玉の色選択ロジック
 * 要件6.1, 6.2, 6.4に対応
 */

// 各タイプに対応する色のインデックス範囲
const COLOR_RANGES = {
  song: [0, 2], // ピンク、ブルー、パープル系
  lyricist: [3, 5], // イエロー、グリーン、オレンジ系
  composer: [6, 8], // ラベンダー、ピーチ、ミント系
  arranger: [9, 9], // コーラル系
  tag: [10, 12], // グリーン系（タグ専用）
} as const;

/**
 * バブルタイプに基づいて適切なパステルカラーを選択
 * @param type - バブルのタイプ
 * @param seed - 色選択のシード値（同じseedは同じ色を返す）
 * @returns パステルカラーのHEX値
 */
export function selectBubbleColor(type: BubbleType, seed?: string | number): string {
  const range = COLOR_RANGES[type];
  const availableColors = pastelColors.slice(range[0], range[1] + 1);
  
  if (seed !== undefined) {
    // シード値がある場合は決定的な色選択
    const seedNumber = typeof seed === 'string' ? hashString(seed) : seed;
    const index = Math.abs(seedNumber) % availableColors.length;
    return availableColors[index];
  }
  
  // ランダム選択
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
}

/**
 * 文字列をハッシュ値に変換（決定的な色選択用）
 * @param str - ハッシュ化する文字列
 * @returns ハッシュ値
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit整数に変換
  }
  return hash;
}

/**
 * 複数のバブルに対してバランスの取れた色配分を行う
 * @param bubbles - 色を割り当てるバブルの配列
 * @returns 色が割り当てられたバブルの配列
 */
export function assignBalancedColors<T extends { type: BubbleType; name: string }>(
  bubbles: T[]
): (T & { color: string })[] {
  const colorUsageCount = new Map<string, number>();
  
  return bubbles.map(bubble => {
    // 同じ名前には常に同じ色を割り当て
    const color = selectBubbleColor(bubble.type, bubble.name);
    
    // 使用回数をカウント
    const currentCount = colorUsageCount.get(color) || 0;
    colorUsageCount.set(color, currentCount + 1);
    
    return {
      ...bubble,
      color,
    };
  });
}

/**
 * 色の明度を調整（ホバー効果などに使用）
 * @param color - 元の色（HEX形式）
 * @param factor - 明度調整係数（1.0が元の色、1.2で20%明るく、0.8で20%暗く）
 * @returns 調整された色（HEX形式）
 */
export function adjustColorBrightness(color: string, factor: number): string {
  // HEX色をRGBに変換
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // 明度を調整
  const adjustedR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const adjustedG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const adjustedB = Math.min(255, Math.max(0, Math.round(b * factor)));
  
  // HEXに戻す
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(adjustedR)}${toHex(adjustedG)}${toHex(adjustedB)}`;
}

/**
 * 色にアルファ値を追加（透明度設定用）
 * @param color - 元の色（HEX形式）
 * @param alpha - アルファ値（0.0-1.0）
 * @returns RGBA形式の色文字列
 */
export function addAlphaToColor(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * タイプ別の推奨色を取得
 * @param type - バブルタイプ
 * @returns そのタイプで使用可能な色の配列
 */
export function getColorsForType(type: BubbleType): string[] {
  const range = COLOR_RANGES[type];
  return pastelColors.slice(range[0], range[1] + 1);
}

/**
 * 全パステルカラーを取得
 * @returns 全てのパステルカラーの配列
 */
export function getAllPastelColors(): readonly string[] {
  return pastelColors;
}