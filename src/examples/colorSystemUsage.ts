import { 
  selectBubbleColor, 
  assignBalancedColors, 
  adjustColorBrightness, 
  addAlphaToColor,
  getColorsForType,
  getAllPastelColors 
} from '../utils/colorSelector';
import { BubbleType } from '../types/music';

/**
 * パステルカラーシステムの使用例
 * 要件6.1, 6.2, 6.4に対応
 */

// 基本的な色選択の例
console.log('=== 基本的な色選択 ===');
const songColor = selectBubbleColor('song', 'My Favorite Song');
const lyricistColor = selectBubbleColor('lyricist', 'Famous Lyricist');
const composerColor = selectBubbleColor('composer', 'Great Composer');
const arrangerColor = selectBubbleColor('arranger', 'Skilled Arranger');

console.log('楽曲の色:', songColor);
console.log('作詞家の色:', lyricistColor);
console.log('作曲家の色:', composerColor);
console.log('編曲家の色:', arrangerColor);

// バランスの取れた色配分の例
console.log('\n=== バランスの取れた色配分 ===');
const sampleBubbles = [
  { type: 'song' as BubbleType, name: '春の歌' },
  { type: 'song' as BubbleType, name: '夏の思い出' },
  { type: 'lyricist' as BubbleType, name: '田中太郎' },
  { type: 'lyricist' as BubbleType, name: '佐藤花子' },
  { type: 'composer' as BubbleType, name: '山田次郎' },
  { type: 'arranger' as BubbleType, name: '鈴木三郎' },
];

const coloredBubbles = assignBalancedColors(sampleBubbles);
coloredBubbles.forEach(bubble => {
  console.log(`${bubble.name} (${bubble.type}): ${bubble.color}`);
});

// 色の調整例
console.log('\n=== 色の調整例 ===');
const baseColor = '#FFB6C1'; // パステルピンク
const brighterColor = adjustColorBrightness(baseColor, 1.3);
const darkerColor = adjustColorBrightness(baseColor, 0.7);
const semiTransparent = addAlphaToColor(baseColor, 0.6);

console.log('元の色:', baseColor);
console.log('明るくした色:', brighterColor);
console.log('暗くした色:', darkerColor);
console.log('半透明にした色:', semiTransparent);

// タイプ別の利用可能な色
console.log('\n=== タイプ別の利用可能な色 ===');
const types: BubbleType[] = ['song', 'lyricist', 'composer', 'arranger'];
types.forEach(type => {
  const colors = getColorsForType(type);
  console.log(`${type}で使用可能な色:`, colors);
});

// 全パステルカラーの表示
console.log('\n=== 全パステルカラー ===');
const allColors = getAllPastelColors();
console.log('利用可能な全パステルカラー:', allColors);

// 実際のシャボン玉データでの使用例
console.log('\n=== 実際のシャボン玉データでの使用例 ===');
const mockBubbleData = [
  { type: 'song' as BubbleType, name: '桜咲く' },
  { type: 'song' as BubbleType, name: '青い空' },
  { type: 'song' as BubbleType, name: '夕焼け小焼け' },
  { type: 'lyricist' as BubbleType, name: '詩人A' },
  { type: 'lyricist' as BubbleType, name: '詩人B' },
  { type: 'composer' as BubbleType, name: '作曲家X' },
  { type: 'composer' as BubbleType, name: '作曲家Y' },
  { type: 'arranger' as BubbleType, name: '編曲家Z' },
];

const finalBubbles = assignBalancedColors(mockBubbleData);
console.log('最終的なシャボン玉の色配分:');
finalBubbles.forEach(bubble => {
  const hoverColor = adjustColorBrightness(bubble.color, 1.2);
  const fadeColor = addAlphaToColor(bubble.color, 0.3);
  
  console.log(`  ${bubble.name}:`);
  console.log(`    通常: ${bubble.color}`);
  console.log(`    ホバー: ${hoverColor}`);
  console.log(`    フェード: ${fadeColor}`);
});

export { 
  songColor, 
  lyricistColor, 
  composerColor, 
  arrangerColor, 
  coloredBubbles, 
  finalBubbles 
};