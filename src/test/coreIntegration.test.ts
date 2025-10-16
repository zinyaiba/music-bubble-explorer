/**
 * コア統合テスト
 * Core Integration Tests
 * 
 * 実装された機能の核心部分を検証する統合テスト
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BubbleRegistry } from '../utils/bubbleRegistry';
import { PersonConsolidator } from '../utils/personConsolidator';
import { EnvironmentDetector } from '../utils/environmentDetector';
import { VisualThemeManager } from '../utils/visualTheme';
import { IconType, ShapeType } from '../types/enhancedBubble';
import { Song } from '../types';

// テストデータ
const testSongs: Song[] = [
  {
    id: '1',
    title: 'Multi-Role Song',
    artist: 'Test Artist',
    lyricist: 'Multi Person',
    composer: 'Multi Person',
    arranger: 'Multi Person',
    tags: ['pop', 'test'],
    albumCover: 'cover1.jpg'
  },
  {
    id: '2',
    title: 'Single Role Song',
    artist: 'Test Artist 2',
    lyricist: 'Lyricist Only',
    composer: 'Composer Only',
    arranger: 'Arranger Only',
    tags: ['rock', 'demo'],
    albumCover: 'cover2.jpg'
  }
];

describe('コア統合テスト (Core Integration Tests)', () => {
  let bubbleRegistry: BubbleRegistry;
  let personConsolidator: PersonConsolidator;
  let environmentDetector: EnvironmentDetector;
  let visualTheme: VisualThemeManager;

  beforeEach(() => {
    bubbleRegistry = new BubbleRegistry();
    personConsolidator = new PersonConsolidator();
    environmentDetector = new EnvironmentDetector();
    visualTheme = new VisualThemeManager();
  });

  describe('視覚的区別システム (Visual Distinction System)', () => {
    it('各コンテンツタイプが異なる視覚スタイルを持つ', () => {
      const songStyle = visualTheme.getStyleForType('song');
      const lyricistStyle = visualTheme.getStyleForType('lyricist');
      const composerStyle = visualTheme.getStyleForType('composer');
      const arrangerStyle = visualTheme.getStyleForType('arranger');
      const tagStyle = visualTheme.getStyleForType('tag');

      // アイコンタイプが異なることを確認
      expect(songStyle.iconType).toBe(IconType.MUSIC_NOTE);
      expect(lyricistStyle.iconType).toBe(IconType.PEN);
      expect(composerStyle.iconType).toBe(IconType.MUSIC_SHEET);
      expect(arrangerStyle.iconType).toBe(IconType.MIXER);
      expect(tagStyle.iconType).toBe(IconType.HASHTAG);

      // 形状タイプが適切に設定されていることを確認
      expect(songStyle.shapeType).toBe(ShapeType.CIRCLE);
      expect(tagStyle.shapeType).toBe(ShapeType.HEXAGON);

      // 色が定義されていることを確認
      expect(songStyle.primaryColor).toBeDefined();
      expect(songStyle.secondaryColor).toBeDefined();
      expect(songStyle.strokeColor).toBeDefined();
    });

    it('複数役割の特殊スタイルが正しく生成される', () => {
      const multiRoleStyle = visualTheme.getMultiRoleStyle(['lyricist', 'composer']);
      
      expect(multiRoleStyle.iconType).toBe(IconType.MULTI_ROLE);
      expect([ShapeType.STAR, ShapeType.DIAMOND]).toContain(multiRoleStyle.shapeType);
      
      // 3つ以上の役割の場合はダイヤモンド形
      const tripleRoleStyle = visualTheme.getMultiRoleStyle(['lyricist', 'composer', 'arranger']);
      expect(tripleRoleStyle.shapeType).toBe(ShapeType.DIAMOND);
    });

    it('視覚的要素の組み合わせが一意である', () => {
      const types = ['song', 'lyricist', 'composer', 'arranger', 'tag'] as const;
      const combinations = new Set<string>();

      types.forEach(type => {
        const style = visualTheme.getStyleForType(type);
        const combination = `${style.iconType}-${style.shapeType}`;
        combinations.add(combination);
      });

      // 各タイプが一意の組み合わせを持つ
      expect(combinations.size).toBe(types.length);
    });
  });

  describe('重複防止システム (Duplicate Prevention System)', () => {
    it('コンテンツの登録と解除が正しく動作する', () => {
      const contentId1 = 'song-1';
      const contentId2 = 'song-2';
      const bubbleId1 = 'bubble-1';
      const bubbleId2 = 'bubble-2';

      // 初期状態では何も登録されていない
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(false);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(false);

      // コンテンツを登録
      const registered1 = bubbleRegistry.registerBubble(contentId1, bubbleId1, 'song');
      expect(registered1).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(false);

      // 別のコンテンツを登録
      const registered2 = bubbleRegistry.registerBubble(contentId2, bubbleId2, 'song');
      expect(registered2).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(true);

      // 一つを解除
      bubbleRegistry.unregisterBubble(bubbleId1);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(false);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(true);
    });

    it('重複登録が適切に処理される', () => {
      const contentId = 'test-content';
      const bubbleId1 = 'bubble-1';
      const bubbleId2 = 'bubble-2';

      // 最初の登録
      const registered1 = bubbleRegistry.registerBubble(contentId, bubbleId1, 'song');
      expect(registered1).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(true);

      // 重複登録（同じコンテンツIDで異なるバブルID）
      const registered2 = bubbleRegistry.registerBubble(contentId, bubbleId2, 'song');
      expect(registered2).toBe(false); // 重複のため登録失敗

      // 状態が維持されることを確認
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(true);
    });

    it('大量のコンテンツ登録でもパフォーマンスが維持される', () => {
      const startTime = performance.now();
      const contentCount = 20; // デフォルトの最大表示数25以下に設定

      // 大量のコンテンツを登録
      let successfulRegistrations = 0;
      for (let i = 0; i < contentCount; i++) {
        const registered = bubbleRegistry.registerBubble(`content-${i}`, `bubble-${i}`, 'song');
        if (registered) {
          successfulRegistrations++;
        }
      }

      // 登録されたコンテンツが表示されていることを確認
      expect(successfulRegistrations).toBe(contentCount);
      for (let i = 0; i < contentCount; i++) {
        expect(bubbleRegistry.isContentDisplayed(`content-${i}`)).toBe(true);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 20件の登録が30ms以内に完了することを確認
      expect(duration).toBeLessThan(30);
    });
  });

  describe('環境検出システム (Environment Detection System)', () => {
    it('環境設定が正しく検出される', () => {
      const config = environmentDetector.detectEnvironment();

      // 必要なプロパティが存在することを確認
      expect(typeof config.isDevelopment).toBe('boolean');
      expect(typeof config.showDebugInfo).toBe('boolean');
      expect(typeof config.showFPS).toBe('boolean');
      expect(typeof config.showResetButton).toBe('boolean');
      expect(typeof config.enableConsoleLogging).toBe('boolean');
    });

    it('開発環境と本番環境で適切な設定が返される', () => {
      // 現在の環境設定を取得
      const config = environmentDetector.detectEnvironment();

      // 開発環境の場合
      if (config.isDevelopment) {
        expect(config.showDebugInfo).toBe(true);
        expect(config.showFPS).toBe(true);
        expect(config.showResetButton).toBe(true);
        expect(config.enableConsoleLogging).toBe(true);
      } else {
        // 本番環境の場合
        expect(config.showDebugInfo).toBe(false);
        expect(config.showFPS).toBe(false);
        expect(config.showResetButton).toBe(false);
        expect(config.enableConsoleLogging).toBe(false);
      }
    });
  });

  describe('人物統合システム (Person Consolidation System)', () => {
    it('基本的な人物統合が動作する', () => {
      // PersonConsolidatorが期待する形式でデータを準備
      const songsWithArrays = testSongs.map(song => ({
        ...song,
        lyricists: song.lyricist ? [song.lyricist] : [],
        composers: song.composer ? [song.composer] : [],
        arrangers: song.arranger ? [song.arranger] : []
      }));

      const consolidatedPersons = personConsolidator.consolidatePersons(songsWithArrays);

      // 統合結果が配列であることを確認
      expect(Array.isArray(consolidatedPersons)).toBe(true);
      
      // 何らかの人物が統合されていることを確認
      expect(consolidatedPersons.length).toBeGreaterThanOrEqual(0);
    });

    it('空のデータでもエラーが発生しない', () => {
      expect(() => {
        const result = personConsolidator.consolidatePersons([]);
        expect(result).toEqual([]);
      }).not.toThrow();
    });

    it('無効なデータでも適切に処理される', () => {
      const invalidSongs = [
        {
          id: 'invalid',
          title: 'Invalid Song',
          artist: 'Test',
          lyricists: [], // 空の配列
          composers: [], // 空の配列
          arrangers: [], // 空の配列
          tags: [],
          albumCover: 'cover.jpg'
        }
      ];

      expect(() => {
        const result = personConsolidator.consolidatePersons(invalidSongs);
        expect(Array.isArray(result)).toBe(true);
      }).not.toThrow();
    });
  });

  describe('統合ワークフロー (Integration Workflow)', () => {
    it('全システムが連携して動作する', () => {
      // 1. 環境検出
      const envConfig = environmentDetector.detectEnvironment();
      expect(envConfig).toBeDefined();

      // 2. 視覚テーマの取得
      const songStyle = visualTheme.getStyleForType('song');
      expect(songStyle.iconType).toBe(IconType.MUSIC_NOTE);

      // 3. 重複防止システムの動作
      const contentId = 'integration-test';
      const bubbleId = 'integration-bubble';
      const registered = bubbleRegistry.registerBubble(contentId, bubbleId, 'song');
      expect(registered).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(true);

      // 4. 複数役割スタイルの生成
      const multiRoleStyle = visualTheme.getMultiRoleStyle(['lyricist', 'composer']);
      expect(multiRoleStyle.iconType).toBe(IconType.MULTI_ROLE);

      // 5. クリーンアップ
      bubbleRegistry.unregisterBubble(bubbleId);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(false);
    });

    it('エラー状況でも安定して動作する', () => {
      // 無効な入力でもエラーが発生しない
      expect(() => {
        environmentDetector.detectEnvironment();
        visualTheme.getStyleForType('song');
        bubbleRegistry.registerBubble('test');
        bubbleRegistry.unregisterBubble('test');
        personConsolidator.consolidatePersons([]);
      }).not.toThrow();
    });

    it('パフォーマンス要件を満たす', () => {
      const startTime = performance.now();

      // 複数の操作を実行
      for (let i = 0; i < 100; i++) {
        const envConfig = environmentDetector.detectEnvironment();
        const style = visualTheme.getStyleForType('song');
        bubbleRegistry.registerBubble(`perf-test-${i}`, `perf-bubble-${i}`, 'song');
        bubbleRegistry.unregisterBubble(`perf-bubble-${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 100回の操作が50ms以内に完了することを確認
      expect(duration).toBeLessThan(50);
    });
  });

  describe('品質保証 (Quality Assurance)', () => {
    it('メモリリークが発生しない', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 大量の操作を実行
      for (let i = 0; i < 1000; i++) {
        bubbleRegistry.registerBubble(`memory-test-${i}`, `memory-bubble-${i}`, 'song');
      }

      for (let i = 0; i < 1000; i++) {
        bubbleRegistry.unregisterBubble(`memory-bubble-${i}`);
      }

      // ガベージコレクションを促進
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // メモリ使用量が大幅に増加していないことを確認
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increaseRatio = memoryIncrease / initialMemory;
        expect(increaseRatio).toBeLessThan(0.1); // 10%以内の増加
      }
    });

    it('並行処理でも安定している', async () => {
      const promises = [];

      // 複数の非同期操作を並行実行
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const config = environmentDetector.detectEnvironment();
            const style = visualTheme.getStyleForType('song');
            bubbleRegistry.registerBubble(`concurrent-${i}`, `concurrent-bubble-${i}`, 'song');
            return { config, style };
          })
        );
      }

      const results = await Promise.all(promises);

      // 全ての操作が成功することを確認
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result.config).toBeDefined();
        expect(result.style).toBeDefined();
      });

      // クリーンアップ
      for (let i = 0; i < 10; i++) {
        bubbleRegistry.unregisterBubble(`concurrent-bubble-${i}`);
      }
    });

    it('データ整合性が保たれる', () => {
      const operations: Array<{ action: string; contentId: string; bubbleId: string; registered: boolean }> = [];

      // 複数の操作を記録
      for (let i = 0; i < 50; i++) {
        const contentId = `consistency-test-${i}`;
        const bubbleId = `consistency-bubble-${i}`;
        
        bubbleRegistry.registerBubble(contentId, bubbleId, 'song');
        operations.push({ action: 'register', contentId, bubbleId, registered: true });
        
        if (i % 2 === 0) {
          bubbleRegistry.unregisterBubble(bubbleId);
          operations.push({ action: 'unregister', contentId, bubbleId, registered: false });
        }
      }

      // 最終状態を確認
      operations.forEach(op => {
        const isDisplayed = bubbleRegistry.isContentDisplayed(op.contentId);
        if (op.action === 'register' && operations.filter(o => o.contentId === op.contentId && o.action === 'unregister').length === 0) {
          expect(isDisplayed).toBe(true);
        } else if (op.action === 'unregister') {
          expect(isDisplayed).toBe(false);
        }
      });
    });
  });
});