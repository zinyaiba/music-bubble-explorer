/**
 * パフォーマンスベンチマークテスト
 * Performance Benchmark Tests
 * 
 * システム全体のパフォーマンスを測定し、要求される性能基準を満たしているかを検証
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EnhancedBubbleManager } from '../services/enhancedBubbleManager';
import { BubbleRegistry } from '../utils/bubbleRegistry';
import { PersonConsolidator } from '../utils/personConsolidator';
import { VisualTheme } from '../utils/visualTheme';
import { IconRenderer } from '../utils/iconRenderer';
import { ShapeRenderer } from '../utils/shapeRenderer';
import { MultiRoleHandler } from '../utils/multiRoleHandler';
import { ContentTracker } from '../utils/contentTracker';
import { PerformanceMonitor } from '../utils/performanceMonitor';
import { IconType, ShapeType, EnhancedBubble } from '../types/enhancedBubble';
import { Song } from '../types';

// 大量のテストデータを生成
function generateLargeSongDataset(count: number): Song[] {
  const songs: Song[] = [];
  const artists = ['Artist A', 'Artist B', 'Artist C', 'Artist D', 'Artist E'];
  const lyricists = ['Lyricist 1', 'Lyricist 2', 'Lyricist 3', 'Multi Person'];
  const composers = ['Composer 1', 'Composer 2', 'Composer 3', 'Multi Person'];
  const arrangers = ['Arranger 1', 'Arranger 2', 'Arranger 3', 'Multi Person'];
  const tags = ['pop', 'rock', 'jazz', 'classical', 'electronic', 'folk', 'blues'];

  for (let i = 0; i < count; i++) {
    songs.push({
      id: `song-${i}`,
      title: `Test Song ${i}`,
      artist: artists[i % artists.length],
      lyricist: lyricists[i % lyricists.length],
      composer: composers[i % composers.length],
      arranger: arrangers[i % arrangers.length],
      tags: [
        tags[i % tags.length],
        tags[(i + 1) % tags.length]
      ],
      albumCover: `cover-${i}.jpg`
    });
  }

  return songs;
}

describe('パフォーマンスベンチマークテスト (Performance Benchmark Tests)', () => {
  let performanceMonitor: PerformanceMonitor;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1920;
    mockCanvas.height = 1080;
    mockContext = mockCanvas.getContext('2d')!;
  });

  afterEach(() => {
    performanceMonitor.clearMeasurements();
  });

  describe('データ処理パフォーマンス', () => {
    it('大量楽曲データの人物統合が高速である', () => {
      const largeSongDataset = generateLargeSongDataset(1000);
      const personConsolidator = new PersonConsolidator();

      performanceMonitor.startMeasurement('person-consolidation-1000');
      const consolidatedPersons = personConsolidator.consolidatePersons(largeSongDataset);
      const result = performanceMonitor.endMeasurement('person-consolidation-1000');

      expect(consolidatedPersons.length).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(100); // 100ms以内
      
      console.log(`人物統合処理時間 (1000曲): ${result.duration.toFixed(2)}ms`);
    });

    it('バブルレジストリの大量登録が高速である', () => {
      const bubbleRegistry = new BubbleRegistry();
      const contentCount = 500;

      performanceMonitor.startMeasurement('registry-bulk-registration');
      
      for (let i = 0; i < contentCount; i++) {
        bubbleRegistry.registerBubble(`content-${i}`);
      }
      
      const result = performanceMonitor.endMeasurement('registry-bulk-registration');

      expect(result.duration).toBeLessThan(50); // 50ms以内
      
      console.log(`レジストリ一括登録時間 (500件): ${result.duration.toFixed(2)}ms`);
    });

    it('複数役割検出が大量データでも高速である', () => {
      const largeSongDataset = generateLargeSongDataset(2000);
      const multiRoleHandler = new MultiRoleHandler();

      performanceMonitor.startMeasurement('multi-role-detection-2000');
      
      let multiRoleCount = 0;
      const uniquePersons = new Set<string>();
      largeSongDataset.forEach(song => {
        [song.lyricist, song.composer, song.arranger].forEach(person => {
          if (person) uniquePersons.add(person);
        });
      });

      uniquePersons.forEach(person => {
        if (multiRoleHandler.isMultiRole(person, largeSongDataset)) {
          multiRoleCount++;
        }
      });
      
      const result = performanceMonitor.endMeasurement('multi-role-detection-2000');

      expect(result.duration).toBeLessThan(200); // 200ms以内
      
      console.log(`複数役割検出時間 (2000曲): ${result.duration.toFixed(2)}ms`);
      console.log(`複数役割人物数: ${multiRoleCount}`);
    });
  });

  describe('描画パフォーマンス', () => {
    it('大量アイコン描画が高速である', () => {
      const iconRenderer = new IconRenderer();
      const iconCount = 1000;
      const iconTypes = [
        IconType.MUSIC_NOTE,
        IconType.PEN,
        IconType.MUSIC_SHEET,
        IconType.MIXER,
        IconType.HASHTAG,
        IconType.MULTI_ROLE
      ];

      performanceMonitor.startMeasurement('icon-rendering-1000');
      
      for (let i = 0; i < iconCount; i++) {
        const iconType = iconTypes[i % iconTypes.length];
        const x = (i % 40) * 20;
        const y = Math.floor(i / 40) * 20;
        iconRenderer.renderIcon(mockContext, iconType, x, y, 16);
      }
      
      const result = performanceMonitor.endMeasurement('icon-rendering-1000');

      expect(result.duration).toBeLessThan(500); // 500ms以内
      
      console.log(`アイコン描画時間 (1000個): ${result.duration.toFixed(2)}ms`);
    });

    it('大量形状描画が高速である', () => {
      const shapeRenderer = new ShapeRenderer();
      const shapeCount = 500;
      const shapeTypes = [
        ShapeType.CIRCLE,
        ShapeType.ROUNDED_SQUARE,
        ShapeType.HEXAGON,
        ShapeType.DIAMOND,
        ShapeType.STAR
      ];

      performanceMonitor.startMeasurement('shape-rendering-500');
      
      for (let i = 0; i < shapeCount; i++) {
        const shapeType = shapeTypes[i % shapeTypes.length];
        const testBubble: EnhancedBubble = {
          id: `perf-bubble-${i}`,
          x: (i % 25) * 30,
          y: Math.floor(i / 25) * 30,
          radius: 15,
          vx: 1,
          vy: 1,
          content: { id: `song-${i}`, title: `Song ${i}` } as Song,
          visualType: 'song',
          iconType: IconType.MUSIC_NOTE,
          shapeType: shapeType,
          isMultiRole: false
        };
        
        shapeRenderer.renderShape(mockContext, testBubble);
      }
      
      const result = performanceMonitor.endMeasurement('shape-rendering-500');

      expect(result.duration).toBeLessThan(300); // 300ms以内
      
      console.log(`形状描画時間 (500個): ${result.duration.toFixed(2)}ms`);
    });

    it('複合描画（形状+アイコン）が高速である', () => {
      const shapeRenderer = new ShapeRenderer();
      const iconRenderer = new IconRenderer();
      const bubbleCount = 200;

      performanceMonitor.startMeasurement('composite-rendering-200');
      
      for (let i = 0; i < bubbleCount; i++) {
        const testBubble: EnhancedBubble = {
          id: `composite-bubble-${i}`,
          x: (i % 20) * 40,
          y: Math.floor(i / 20) * 40,
          radius: 20,
          vx: 1,
          vy: 1,
          content: { id: `song-${i}`, title: `Song ${i}` } as Song,
          visualType: 'song',
          iconType: IconType.MUSIC_NOTE,
          shapeType: ShapeType.CIRCLE,
          isMultiRole: false
        };
        
        // 形状を描画
        shapeRenderer.renderShape(mockContext, testBubble);
        
        // アイコンを描画
        iconRenderer.renderIcon(
          mockContext,
          testBubble.iconType,
          testBubble.x,
          testBubble.y,
          testBubble.radius * 0.6
        );
      }
      
      const result = performanceMonitor.endMeasurement('composite-rendering-200');

      expect(result.duration).toBeLessThan(400); // 400ms以内
      
      console.log(`複合描画時間 (200個): ${result.duration.toFixed(2)}ms`);
    });
  });

  describe('統合システムパフォーマンス', () => {
    it('完全なバブル生成パイプラインが高速である', () => {
      const songDataset = generateLargeSongDataset(500);
      const bubbleRegistry = new BubbleRegistry();
      const personConsolidator = new PersonConsolidator();
      const visualTheme = new VisualTheme();
      const iconRenderer = new IconRenderer();
      const shapeRenderer = new ShapeRenderer();
      const multiRoleHandler = new MultiRoleHandler();
      const contentTracker = new ContentTracker();

      const enhancedBubbleManager = new EnhancedBubbleManager(
        mockCanvas,
        songDataset,
        bubbleRegistry,
        personConsolidator,
        visualTheme,
        iconRenderer,
        shapeRenderer,
        multiRoleHandler,
        contentTracker
      );

      performanceMonitor.startMeasurement('full-pipeline-100');
      
      const generatedBubbles: EnhancedBubble[] = [];
      for (let i = 0; i < 100; i++) {
        const bubble = enhancedBubbleManager.generateUniqueBubble();
        if (bubble) {
          generatedBubbles.push(bubble);
        }
      }
      
      const result = performanceMonitor.endMeasurement('full-pipeline-100');

      expect(generatedBubbles.length).toBeGreaterThan(0);
      expect(result.duration).toBeLessThan(1000); // 1秒以内
      
      console.log(`完全パイプライン時間 (100個生成): ${result.duration.toFixed(2)}ms`);
      console.log(`生成成功率: ${(generatedBubbles.length / 100 * 100).toFixed(1)}%`);
    });

    it('メモリ使用量が適切に管理される', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const songDataset = generateLargeSongDataset(1000);
      const bubbleRegistry = new BubbleRegistry();
      const personConsolidator = new PersonConsolidator();
      
      // 大量のデータ処理
      performanceMonitor.startMeasurement('memory-test');
      
      const consolidatedPersons = personConsolidator.consolidatePersons(songDataset);
      
      // バブルを大量生成・削除
      for (let i = 0; i < 200; i++) {
        bubbleRegistry.registerBubble(`test-content-${i}`);
      }
      
      for (let i = 0; i < 200; i++) {
        bubbleRegistry.unregisterBubble(`test-content-${i}`);
      }
      
      const result = performanceMonitor.endMeasurement('memory-test');
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increaseRatio = memoryIncrease / initialMemory;
        
        console.log(`メモリ使用量変化: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        console.log(`メモリ増加率: ${(increaseRatio * 100).toFixed(2)}%`);
        
        // メモリ増加が50%以内であることを確認
        expect(increaseRatio).toBeLessThan(0.5);
      }
      
      expect(result.duration).toBeLessThan(2000); // 2秒以内
    });

    it('並行処理でもパフォーマンスが維持される', async () => {
      const songDataset = generateLargeSongDataset(200);
      const personConsolidator = new PersonConsolidator();
      
      performanceMonitor.startMeasurement('concurrent-processing');
      
      // 複数の処理を並行実行
      const promises = [
        Promise.resolve(personConsolidator.consolidatePersons(songDataset.slice(0, 50))),
        Promise.resolve(personConsolidator.consolidatePersons(songDataset.slice(50, 100))),
        Promise.resolve(personConsolidator.consolidatePersons(songDataset.slice(100, 150))),
        Promise.resolve(personConsolidator.consolidatePersons(songDataset.slice(150, 200)))
      ];
      
      const results = await Promise.all(promises);
      
      const result = performanceMonitor.endMeasurement('concurrent-processing');
      
      expect(results.length).toBe(4);
      results.forEach(consolidatedPersons => {
        expect(consolidatedPersons.length).toBeGreaterThan(0);
      });
      
      expect(result.duration).toBeLessThan(500); // 500ms以内
      
      console.log(`並行処理時間: ${result.duration.toFixed(2)}ms`);
    });
  });

  describe('リアルタイムパフォーマンス', () => {
    it('60FPSでの描画が可能である', () => {
      const targetFPS = 60;
      const frameTime = 1000 / targetFPS; // 16.67ms
      const frameCount = 60; // 1秒分のフレーム
      
      const iconRenderer = new IconRenderer();
      const shapeRenderer = new ShapeRenderer();
      
      const frameTimes: number[] = [];
      
      for (let frame = 0; frame < frameCount; frame++) {
        const frameStart = performance.now();
        
        // 1フレームで描画する要素数（現実的な数）
        const elementsPerFrame = 20;
        
        for (let i = 0; i < elementsPerFrame; i++) {
          const testBubble: EnhancedBubble = {
            id: `frame-bubble-${frame}-${i}`,
            x: Math.random() * mockCanvas.width,
            y: Math.random() * mockCanvas.height,
            radius: 15 + Math.random() * 10,
            vx: 1,
            vy: 1,
            content: { id: `song-${i}`, title: `Song ${i}` } as Song,
            visualType: 'song',
            iconType: IconType.MUSIC_NOTE,
            shapeType: ShapeType.CIRCLE,
            isMultiRole: false
          };
          
          shapeRenderer.renderShape(mockContext, testBubble);
          iconRenderer.renderIcon(
            mockContext,
            testBubble.iconType,
            testBubble.x,
            testBubble.y,
            testBubble.radius * 0.6
          );
        }
        
        const frameEnd = performance.now();
        const frameTime = frameEnd - frameStart;
        frameTimes.push(frameTime);
      }
      
      const averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      const maxFrameTime = Math.max(...frameTimes);
      
      console.log(`平均フレーム時間: ${averageFrameTime.toFixed(2)}ms`);
      console.log(`最大フレーム時間: ${maxFrameTime.toFixed(2)}ms`);
      console.log(`目標フレーム時間: ${frameTime.toFixed(2)}ms`);
      
      // 平均フレーム時間が目標を下回ることを確認
      expect(averageFrameTime).toBeLessThan(frameTime);
      
      // 95%のフレームが目標時間内に完了することを確認
      const framesWithinTarget = frameTimes.filter(time => time < frameTime).length;
      const successRate = framesWithinTarget / frameTimes.length;
      expect(successRate).toBeGreaterThan(0.95);
    });
  });
});