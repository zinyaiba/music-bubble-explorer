/**
 * シャボン玉の設定ファイル
 * このファイルを編集してシャボン玉の動作をカスタマイズできます
 */

export interface BubbleSettings {
  // 基本設定
  maxBubbles: number // 最大シャボン玉数
  minLifespan: number // 最小ライフスパン（ミリ秒）
  maxLifespan: number // 最大ライフスパン（ミリ秒）

  // 速度設定
  minVelocity: number // 最小速度
  maxVelocity: number // 最大速度

  // サイズ設定
  minSize: number // 最小サイズ
  maxSize: number // 最大サイズ

  // 物理設定
  buoyancyStrength: number // 浮力の強さ
  airResistance: number // 空気抵抗
  windStrength: number // 風の強さ

  // アニメーション設定
  breathingFrequency: number // 呼吸効果の周波数
  breathingAmplitude: number // 呼吸効果の振幅
  noiseIntensity: number // ノイズの強度
}

/**
 * デフォルトのシャボン玉設定
 * 値を変更してシャボン玉の動作をカスタマイズしてください
 */
export const DEFAULT_BUBBLE_SETTINGS: BubbleSettings = {
  // 基本設定
  maxBubbles: 7, // シャボン玉の最大数（パフォーマンスに影響）
  minLifespan: 5, // 5秒 - シャボン玉が消えるまでの最短時間
  maxLifespan: 15, // 10秒 - シャボン玉が消えるまでの最長時間

  // 速度設定（値を大きくすると速く動く）
  minVelocity: 100, // 最小速度
  maxVelocity: 150, // 最大速度

  // サイズ設定
  minSize: 80, // 最小サイズ（ピクセル）
  maxSize: 150, // 最大サイズ（ピクセル）

  // 物理設定（値を大きくすると効果が強くなる）
  buoyancyStrength: 80, // 浮力の強さ（上向きの力）
  airResistance: 0.999, // 空気抵抗（0.9-0.999の範囲、小さいほど抵抗が大きい）
  windStrength: 40, // 風の強さ

  // アニメーション設定
  breathingFrequency: 0.8, // 呼吸効果の周波数（大きいほど速く点滅）
  breathingAmplitude: 0.06, // 呼吸効果の振幅（大きいほど透明度変化が大きい）
  noiseIntensity: 12, // ノイズの強度（大きいほど揺れが大きい）
}

/**
 * ゆっくりとした動きの設定
 */
export const SLOW_BUBBLE_SETTINGS: BubbleSettings = {
  ...DEFAULT_BUBBLE_SETTINGS,
  minVelocity: 3,
  maxVelocity: 15,
  buoyancyStrength: 8,
  windStrength: 4,
  breathingFrequency: 0.5,
}

/**
 * 活発な動きの設定
 */
export const ACTIVE_BUBBLE_SETTINGS: BubbleSettings = {
  ...DEFAULT_BUBBLE_SETTINGS,
  minVelocity: 15,
  maxVelocity: 50,
  buoyancyStrength: 25,
  windStrength: 15,
  breathingFrequency: 1.2,
}

/**
 * 静かな動きの設定
 */
export const CALM_BUBBLE_SETTINGS: BubbleSettings = {
  ...DEFAULT_BUBBLE_SETTINGS,
  minVelocity: 5,
  maxVelocity: 20,
  buoyancyStrength: 10,
  windStrength: 5,
  noiseIntensity: 6,
  breathingFrequency: 0.6,
}

/**
 * 設定プリセット
 */
export const BUBBLE_PRESETS = {
  default: DEFAULT_BUBBLE_SETTINGS,
  slow: SLOW_BUBBLE_SETTINGS,
  active: ACTIVE_BUBBLE_SETTINGS,
  calm: CALM_BUBBLE_SETTINGS,
} as const

export type BubblePreset = keyof typeof BUBBLE_PRESETS

/**
 * 現在の設定を取得
 */
let currentSettings: BubbleSettings = { ...DEFAULT_BUBBLE_SETTINGS }

/**
 * 設定を更新
 */
export function updateBubbleSettings(
  newSettings: Partial<BubbleSettings>
): BubbleSettings {
  currentSettings = { ...currentSettings, ...newSettings }
  return currentSettings
}

/**
 * 現在の設定を取得
 */
export function getCurrentBubbleSettings(): BubbleSettings {
  return { ...currentSettings }
}

/**
 * プリセットを適用
 */
export function applyBubblePreset(preset: BubblePreset): BubbleSettings {
  currentSettings = { ...BUBBLE_PRESETS[preset] }
  return currentSettings
}

/**
 * 設定をリセット
 */
export function resetBubbleSettings(): BubbleSettings {
  currentSettings = { ...DEFAULT_BUBBLE_SETTINGS }
  return currentSettings
}
