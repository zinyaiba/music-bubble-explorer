import {
  selectBubbleColor,
  assignBalancedColors,
  adjustColorBrightness,
  addAlphaToColor,
  getColorsForType,
  getAllPastelColors,
} from '../colorSelector';
import { BubbleType } from '../../types/music';

/**
 * シンプルなテストフレームワーク（再利用）
 */
class SimpleTest {
  private testCount = 0
  private passCount = 0
  private failCount = 0

  test(name: string, testFn: () => void): void {
    this.testCount++
    try {
      testFn()
      this.passCount++
      console.log(`✅ ${name}`)
    } catch (error) {
      this.failCount++
      console.error(`❌ ${name}:`, error)
    }
  }

  expect(actual: any): {
    toBe: (expected: any) => void
    toEqual: (expected: any) => void
    toBeTruthy: () => void
    toBeFalsy: () => void
    toContain: (expected: any) => void
    toHaveLength: (expected: number) => void
    toThrow: () => void
    toMatch: (pattern: RegExp) => void
    toBeGreaterThan: (expected: number) => void
    not: {
      toBe: (expected: any) => void
    }
  } {
    return {
      toBe: (expected: any) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`)
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`)
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`)
        }
      },
      toBeFalsy: () => {
        if (actual) {
          throw new Error(`Expected ${actual} to be falsy`)
        }
      },
      toContain: (expected: any) => {
        if (!actual.includes(expected)) {
          throw new Error(`Expected ${actual} to contain ${expected}`)
        }
      },
      toHaveLength: (expected: number) => {
        if (actual.length !== expected) {
          throw new Error(`Expected length ${actual.length} to be ${expected}`)
        }
      },
      toThrow: () => {
        let threw = false
        try {
          if (typeof actual === 'function') {
            actual()
          }
        } catch {
          threw = true
        }
        if (!threw) {
          throw new Error('Expected function to throw an error')
        }
      },
      toMatch: (pattern: RegExp) => {
        if (!pattern.test(actual)) {
          throw new Error(`Expected ${actual} to match ${pattern}`)
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (actual <= expected) {
          throw new Error(`Expected ${actual} to be greater than ${expected}`)
        }
      },
      not: {
        toBe: (expected: any) => {
          if (actual === expected) {
            throw new Error(`Expected ${actual} not to be ${expected}`)
          }
        }
      }
    }
  }

  summary(): void {
    console.log(`\n📊 テスト結果: ${this.passCount}/${this.testCount} 成功`)
    if (this.failCount > 0) {
      console.log(`❌ ${this.failCount} 件のテストが失敗しました`)
    } else {
      console.log('🎉 すべてのテストが成功しました！')
    }
  }
}

/**
 * ColorSelectorのユニットテスト
 */
export function runColorSelectorTests(): void {
  console.log('=== ColorSelector ユニットテスト開始 ===')
  const test = new SimpleTest()

  // selectBubbleColor テスト
  test.test('同じシードで一貫した色を返す', () => {
    const color1 = selectBubbleColor('song', 'test-song');
    const color2 = selectBubbleColor('song', 'test-song');
    test.expect(color1).toBe(color2);
  });

  test.test('異なるタイプで異なる色を返す', () => {
    const songColor = selectBubbleColor('song', 'test');
    const lyricistColor = selectBubbleColor('lyricist', 'test');
    const composerColor = selectBubbleColor('composer', 'test');
    const arrangerColor = selectBubbleColor('arranger', 'test');

    // 異なるタイプは異なる色範囲から選択されるべき
    const colors = [songColor, lyricistColor, composerColor, arrangerColor];
    const uniqueColors = new Set(colors);
    test.expect(uniqueColors.size).toBeGreaterThan(1);
  });

  test.test('有効なHEX色を返す', () => {
    const types: BubbleType[] = ['song', 'lyricist', 'composer', 'arranger'];
    
    types.forEach(type => {
      const color = selectBubbleColor(type);
      test.expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  test.test('数値シードを処理する', () => {
    const color1 = selectBubbleColor('song', 123);
    const color2 = selectBubbleColor('song', 123);
    test.expect(color1).toBe(color2);
  });

  // assignBalancedColors テスト
  test.test('全てのバブルに色を割り当てる', () => {
    const bubbles = [
      { type: 'song' as BubbleType, name: 'Song 1' },
      { type: 'lyricist' as BubbleType, name: 'Lyricist 1' },
      { type: 'composer' as BubbleType, name: 'Composer 1' },
    ];

    const result = assignBalancedColors(bubbles);
    
    test.expect(result).toHaveLength(3);
    result.forEach(bubble => {
      test.expect(bubble.color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  test.test('同じ名前に一貫した色を割り当てる', () => {
    const bubbles = [
      { type: 'song' as BubbleType, name: 'Same Song' },
      { type: 'song' as BubbleType, name: 'Same Song' },
      { type: 'lyricist' as BubbleType, name: 'Same Person' },
      { type: 'lyricist' as BubbleType, name: 'Same Person' },
    ];

    const result = assignBalancedColors(bubbles);
    
    test.expect(result[0].color).toBe(result[1].color);
    test.expect(result[2].color).toBe(result[3].color);
  });

  // adjustColorBrightness テスト
  test.test('係数 > 1 で色を明るくする', () => {
    const originalColor = '#808080'; // Gray
    const brighterColor = adjustColorBrightness(originalColor, 1.5);
    
    test.expect(brighterColor).toMatch(/^#[0-9A-F]{6}$/i);
    test.expect(brighterColor).not.toBe(originalColor);
  });

  test.test('係数 < 1 で色を暗くする', () => {
    const originalColor = '#808080'; // Gray
    const darkerColor = adjustColorBrightness(originalColor, 0.5);
    
    test.expect(darkerColor).toMatch(/^#[0-9A-F]{6}$/i);
    test.expect(darkerColor).not.toBe(originalColor);
  });

  test.test('エッジケースを処理する', () => {
    // 白色のテスト
    const white = adjustColorBrightness('#FFFFFF', 1.5);
    test.expect(white).toBe('#ffffff');
    
    // 黒色のテスト
    const black = adjustColorBrightness('#000000', 0.5);
    test.expect(black).toBe('#000000');
  });

  // addAlphaToColor テスト
  test.test('HEXをアルファ付きRGBAに変換する', () => {
    const result = addAlphaToColor('#FF0000', 0.5);
    test.expect(result).toBe('rgba(255, 0, 0, 0.5)');
  });

  test.test('異なるアルファ値を処理する', () => {
    const color = '#00FF00';
    
    const transparent = addAlphaToColor(color, 0);
    test.expect(transparent).toBe('rgba(0, 255, 0, 0)');
    
    const opaque = addAlphaToColor(color, 1);
    test.expect(opaque).toBe('rgba(0, 255, 0, 1)');
  });

  // getColorsForType テスト
  test.test('タイプ別に異なる色配列を返す', () => {
    const songColors = getColorsForType('song');
    const lyricistColors = getColorsForType('lyricist');
    
    test.expect(Array.isArray(songColors)).toBeTruthy();
    test.expect(Array.isArray(lyricistColors)).toBeTruthy();
    test.expect(songColors.length).toBeGreaterThan(0);
    test.expect(lyricistColors.length).toBeGreaterThan(0);
  });

  test.test('全タイプで有効なHEX色を返す', () => {
    const types: BubbleType[] = ['song', 'lyricist', 'composer', 'arranger'];
    
    types.forEach(type => {
      const colors = getColorsForType(type);
      colors.forEach(color => {
        test.expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  // getAllPastelColors テスト
  test.test('全パステルカラーを返す', () => {
    const colors = getAllPastelColors();
    
    test.expect(Array.isArray(colors)).toBeTruthy();
    test.expect(colors.length).toBe(10); // 定義された10色
    
    colors.forEach(color => {
      test.expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  test.summary()
  console.log('=== ColorSelector ユニットテスト終了 ===\n')
}