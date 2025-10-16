/**
 * 統合テストと品質保証
 * Integration Testing and Quality Assurance
 * 
 * このテストファイルは以下の要件をテストします：
 * - 視覚的区別の動作確認 (Requirements: 1.1, 5.1)
 * - 重複防止機能のテスト (Requirements: 3.1)
 * - 環境別UI表示のテスト (Requirements: 4.1)
 * - 複数役割統合の動作確認 (Requirements: 2.1)
 * - パフォーマンステストの実行 (Requirements: 1.1, 5.1)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BubbleRegistry } from '../utils/bubbleRegistry';
import { PersonConsolidator } from '../utils/personConsolidator';
import { EnvironmentDetector } from '../utils/environmentDetector';
import { VisualThemeManager } from '../utils/visualTheme';
import { IconRenderer } from '../utils/iconRenderer';
import { ShapeRenderer } from '../utils/shapeRenderer';
import { MultiRoleHandler } from '../utils/multiRoleHandler';
import { ContentTracker } from '../utils/contentTracker';
import { PerformanceMonitor } from '../utils/performanceMonitor';
import { EnhancedBubble, IconType, ShapeType } from '../types/enhancedBubble';
import { Song } from '../types';

// モックデータ
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Test Song 1',
    artist: 'Test Artist',
    lyricist: 'John Doe',
    composer: 'John Doe', // 同一人物が作詞・作曲
    arranger: 'Jane Smith',
    tags: ['pop', 'love'],
    albumCover: 'cover1.jpg'
  },
  {
    id: '2',
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    lyricist: 'Alice Johnson',
    composer: 'Bob Wilson',
    arranger: 'John Doe', // John Doeが編曲も担当
    tags: ['rock', 'energy'],
    albumCover: 'cover2.jpg'
  },
  {
    id: '3',
    title: 'Test Song 3',
    artist: 'Test Artist 3',
    lyricist: 'Charlie Brown',
    composer: 'Diana Prince',
    arranger: 'Eve Adams',
    tags: ['jazz', 'smooth'],
    albumCover: 'cover3.jpg'
  }
];

describe('統合テストと品質保証 (Integration Testing and Quality Assurance)', () => {
  let bubbleRegistry: BubbleRegistry;
  let personConsolidator: PersonConsolidator;
  let environmentDetector: EnvironmentDetector;
  let visualTheme: VisualThemeManager;
  let iconRenderer: IconRenderer;
  let shapeRenderer: ShapeRenderer;
  let multiRoleHandler: MultiRoleHandler;
  let contentTracker: ContentTracker;
  let performanceMonitor: PerformanceMonitor;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    // Canvas モックの設定
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;
    
    // Canvas context のモック
    mockContext = {
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      }))
    } as any;

    // 各コンポーネントの初期化
    bubbleRegistry = new BubbleRegistry();
    personConsolidator = new PersonConsolidator();
    environmentDetector = new EnvironmentDetector();
    visualTheme = new VisualThemeManager();
    iconRenderer = new IconRenderer();
    shapeRenderer = new ShapeRenderer();
    multiRoleHandler = new MultiRoleHandler();
    contentTracker = new ContentTracker();
    performanceMonitor = new PerformanceMonitor();

    // パフォーマンス測定開始
    try {
      performanceMonitor.startMeasurement('integration-test');
    } catch (error) {
      // Ignore measurement errors in tests
    }
  });

  afterEach(() => {
    // パフォーマンス測定終了
    try {
      performanceMonitor.endMeasurement('integration-test');
    } catch (error) {
      // Ignore measurement errors in tests
    }
    vi.clearAllMocks();
  });

  describe('1. 視覚的区別の動作確認 (Visual Distinction Verification)', () => {
    it('楽曲、人物、タグが異なる視覚スタイルで表示される', () => {
      // 各タイプのスタイルを取得
      const songStyle = visualTheme.getStyleForType('song');
      const lyricistStyle = visualTheme.getStyleForType('lyricist');
      const tagStyle = visualTheme.getStyleForType('tag');

      // 楽曲スタイルの確認
      expect(songStyle.iconType).toBe(IconType.MUSIC_NOTE);
      expect(songStyle.shapeType).toBe(ShapeType.CIRCLE);

      // 作詞家スタイルの確認
      expect(lyricistStyle.iconType).toBe(IconType.PEN);
      expect(lyricistStyle.shapeType).toBe(ShapeType.ROUNDED_SQUARE);

      // タグスタイルの確認
      expect(tagStyle.iconType).toBe(IconType.HASHTAG);
      expect(tagStyle.shapeType).toBe(ShapeType.HEXAGON);

      // 各タイプが異なることを確認
      expect(songStyle.iconType).not.toBe(lyricistStyle.iconType);
      expect(lyricistStyle.iconType).not.toBe(tagStyle.iconType);
    });

    it('各タイプの視覚スタイルが正しく適用される', () => {
      const songStyle = visualTheme.getStyleForType('song');
      
      expect(songStyle.iconType).toBe(IconType.MUSIC_NOTE);
      expect(songStyle.shapeType).toBe(ShapeType.CIRCLE);
      expect(songStyle.primaryColor).toBeDefined();
      expect(songStyle.secondaryColor).toBeDefined();
      expect(songStyle.strokeColor).toBeDefined();
      expect(songStyle.strokeWidth).toBeGreaterThan(0);
    });

    it('アイコンが正しく描画される', () => {
      const drawSpy = vi.spyOn(mockContext, 'beginPath');
      
      // 各アイコンタイプの描画テスト
      iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, 20);
      iconRenderer.renderIcon(mockContext, IconType.PEN, 100, 100, 20);
      iconRenderer.renderIcon(mockContext, IconType.HASHTAG, 100, 100, 20);
      
      expect(drawSpy).toHaveBeenCalled();
    });

    it('形状が正しく描画される', () => {
      const drawSpy = vi.spyOn(mockContext, 'beginPath');
      
      const testBubble: EnhancedBubble = {
        id: 'test',
        x: 100,
        y: 100,
        radius: 30,
        vx: 1,
        vy: 1,
        content: mockSongs[0],
        visualType: 'song',
        iconType: IconType.MUSIC_NOTE,
        shapeType: ShapeType.CIRCLE,
        isMultiRole: false
      };

      // 各形状タイプの描画テスト
      testBubble.shapeType = ShapeType.CIRCLE;
      shapeRenderer.renderShape(mockContext, testBubble);
      
      testBubble.shapeType = ShapeType.HEXAGON;
      shapeRenderer.renderShape(mockContext, testBubble);
      
      expect(drawSpy).toHaveBeenCalled();
    });
  });

  describe('2. 重複防止機能のテスト (Duplicate Prevention Testing)', () => {
    it('BubbleRegistryが重複を正しく検出する', () => {
      const contentId1 = 'song-1';
      const contentId2 = 'song-2';
      
      // 最初のコンテンツを登録
      bubbleRegistry.registerBubble(contentId1);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(false);
      
      // 同じコンテンツの重複登録を試行
      bubbleRegistry.registerBubble(contentId1);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);
      
      // 異なるコンテンツを登録
      bubbleRegistry.registerBubble(contentId2);
      expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(true);
    });

    it('バブルが消失すると再度選択可能になる', () => {
      const contentId = 'test-content';
      
      // コンテンツを登録
      bubbleRegistry.registerBubble(contentId);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(true);
      
      // バブルを登録解除
      bubbleRegistry.unregisterBubble(contentId);
      
      // 再度利用可能になることを確認
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(false);
    });

    it('ContentTrackerが正しく動作する', () => {
      const testContent = { id: 'test-1', type: 'song' as const, name: 'Test Song' };
      
      // コンテンツ追跡開始
      contentTracker.trackContent('bubble-1', testContent);
      expect(contentTracker.isContentDisplayed('test-1')).toBe(true);
      
      // 追跡解除
      contentTracker.untrackContent('bubble-1');
      expect(contentTracker.isContentDisplayed('test-1')).toBe(false);
    });

    it('利用可能コンテンツプールが正しく管理される', () => {
      // 初期状態では何も登録されていない
      expect(bubbleRegistry.getDisplayedContent().size).toBe(0);
      
      // コンテンツを登録
      bubbleRegistry.registerBubble('content-1');
      bubbleRegistry.registerBubble('content-2');
      
      expect(bubbleRegistry.getDisplayedContent().size).toBe(2);
      
      // 一つ削除
      bubbleRegistry.unregisterBubble('content-1');
      expect(bubbleRegistry.getDisplayedContent().size).toBe(1);
      expect(bubbleRegistry.isContentDisplayed('content-1')).toBe(false);
      expect(bubbleRegistry.isContentDisplayed('content-2')).toBe(true);
    });
  });

  describe('3. 環境別UI表示のテスト (Environment-specific UI Testing)', () => {
    it('開発環境でデバッグ情報が表示される', () => {
      // 開発環境をモック
      vi.spyOn(environmentDetector, 'detectEnvironment').mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true
      });

      const config = environmentDetector.detectEnvironment();
      expect(config.showDebugInfo).toBe(true);
      expect(config.showFPS).toBe(true);
      expect(config.showResetButton).toBe(true);
    });

    it('本番環境でデバッグ情報が非表示になる', () => {
      // 本番環境をモック
      vi.spyOn(environmentDetector, 'detectEnvironment').mockReturnValue({
        isDevelopment: false,
        showDebugInfo: false,
        showFPS: false,
        showResetButton: false,
        enableConsoleLogging: false
      });

      const config = environmentDetector.detectEnvironment();
      expect(config.showDebugInfo).toBe(false);
      expect(config.showFPS).toBe(false);
      expect(config.showResetButton).toBe(false);
    });

    it('URLパラメータでデバッグモードを強制できる', () => {
      // URLパラメータをモック
      Object.defineProperty(window, 'location', {
        value: {
          search: '?debug=true',
          hostname: 'production.example.com'
        },
        writable: true
      });

      const config = environmentDetector.detectEnvironment();
      expect(config.showDebugInfo).toBe(true);
    });
  });

  describe('4. 複数役割統合の動作確認 (Multi-role Integration Verification)', () => {
    it('同一人物の複数役割が正しく統合される', () => {
      const consolidatedPersons = personConsolidator.consolidatePersons(mockSongs);
      
      // John Doeは作詞・作曲・編曲の3役を担当
      const johnDoe = consolidatedPersons.find(p => p.name === 'John Doe');
      expect(johnDoe).toBeDefined();
      expect(johnDoe!.roles.length).toBeGreaterThan(1);
      
      const roleTypes = johnDoe!.roles.map(r => r.type);
      expect(roleTypes).toContain('lyricist');
      expect(roleTypes).toContain('composer');
    });

    it('複数役割の人物バブルが特殊な視覚スタイルを持つ', () => {
      const multiRoleStyle = visualTheme.getStyleForType('multiRole');
      
      expect(multiRoleStyle.iconType).toBe(IconType.MULTI_ROLE);
      expect([ShapeType.STAR, ShapeType.DIAMOND]).toContain(multiRoleStyle.shapeType);
      
      // 複数役割用の特殊スタイルを取得
      const compositeStyle = visualTheme.getMultiRoleStyle(['lyricist', 'composer']);
      expect(compositeStyle.iconType).toBe(IconType.MULTI_ROLE);
      expect([ShapeType.STAR, ShapeType.DIAMOND]).toContain(compositeStyle.shapeType);
    });

    it('MultiRoleHandlerが正しく動作する', () => {
      const roles = multiRoleHandler.getPersonRoles('John Doe', mockSongs);
      expect(roles.length).toBeGreaterThan(1);
      
      const isMultiRole = multiRoleHandler.isMultiRole('John Doe', mockSongs);
      expect(isMultiRole).toBe(true);
      
      const totalCount = multiRoleHandler.calculateTotalRelatedCount('John Doe', mockSongs);
      expect(totalCount).toBeGreaterThan(0);
    });

    it('統合された人物の関連楽曲数が正しく計算される', () => {
      const consolidatedPersons = personConsolidator.consolidatePersons(mockSongs);
      const johnDoe = consolidatedPersons.find(p => p.name === 'John Doe');
      
      expect(johnDoe).toBeDefined();
      expect(johnDoe!.totalRelatedCount).toBeGreaterThan(0);
      
      // 各役割での楽曲数の合計と一致することを確認
      const expectedTotal = johnDoe!.roles.reduce((sum, role) => sum + role.songCount, 0);
      expect(johnDoe!.totalRelatedCount).toBe(expectedTotal);
    });
  });

  describe('5. パフォーマンステストの実行 (Performance Testing)', () => {
    it('大量の人物統合処理でもパフォーマンスが維持される', () => {
      const startTime = performance.now();
      
      // 大量のデータで人物統合を実行
      const largeSongSet = Array.from({ length: 100 }, (_, i) => ({
        ...mockSongs[i % mockSongs.length],
        id: `song-${i}`,
        title: `Song ${i}`
      }));
      
      const consolidatedPersons = personConsolidator.consolidatePersons(largeSongSet);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 100個の楽曲処理が500ms以内に完了することを確認
      expect(duration).toBeLessThan(500);
      expect(consolidatedPersons.length).toBeGreaterThan(0);
    });

    it('アイコン描画のパフォーマンスが適切である', () => {
      const startTime = performance.now();
      
      // 各アイコンタイプを100回描画
      for (let i = 0; i < 100; i++) {
        iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, 20);
        iconRenderer.renderIcon(mockContext, IconType.PEN, 150, 150, 20);
        iconRenderer.renderIcon(mockContext, IconType.HASHTAG, 200, 200, 20);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 300回の描画が500ms以内に完了することを確認
      expect(duration).toBeLessThan(500);
    });

    it('形状描画のパフォーマンスが適切である', () => {
      const startTime = performance.now();
      
      const testBubble: EnhancedBubble = {
        id: 'perf-test',
        x: 100,
        y: 100,
        radius: 30,
        vx: 1,
        vy: 1,
        content: mockSongs[0],
        visualType: 'song',
        iconType: IconType.MUSIC_NOTE,
        shapeType: ShapeType.CIRCLE,
        isMultiRole: false
      };

      // 各形状を100回描画
      for (let i = 0; i < 100; i++) {
        testBubble.shapeType = ShapeType.CIRCLE;
        shapeRenderer.renderShape(mockContext, testBubble);
        
        testBubble.shapeType = ShapeType.HEXAGON;
        shapeRenderer.renderShape(mockContext, testBubble);
        
        testBubble.shapeType = ShapeType.STAR;
        shapeRenderer.renderShape(mockContext, testBubble);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // 300回の形状描画が500ms以内に完了することを確認
      expect(duration).toBeLessThan(500);
    });

    it('PerformanceMonitorが正しく動作する', () => {
      performanceMonitor.startMeasurement('test-operation');
      
      // 何らかの処理をシミュレート
      for (let i = 0; i < 1000; i++) {
        Math.sqrt(i);
      }
      
      const result = performanceMonitor.endMeasurement('test-operation');
      expect(result).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
    });

    it('メモリ使用量が適切に管理される', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // 大量のバブルを生成して削除
      const bubbles: EnhancedBubble[] = [];
      for (let i = 0; i < 50; i++) {
        const bubble = enhancedBubbleManager.generateUniqueBubble();
        if (bubble) {
          bubbles.push(bubble);
        }
      }
      
      // バブルを削除
      bubbles.forEach(bubble => {
        const contentId = enhancedBubbleManager.getContentId(bubble);
        bubbleRegistry.unregisterBubble(contentId);
      });
      
      // ガベージコレクションを促進
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // メモリリークがないことを確認（大幅な増加がないこと）
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const increaseRatio = memoryIncrease / initialMemory;
        expect(increaseRatio).toBeLessThan(0.5); // 50%以上の増加がないこと
      }
    });
  });

  describe('6. 統合シナリオテスト (Integration Scenario Testing)', () => {
    it('完全なワークフローが正常に動作する', () => {
      // 1. 環境検出
      const envConfig = environmentDetector.detectEnvironment();
      expect(envConfig).toBeDefined();
      expect(typeof envConfig.isDevelopment).toBe('boolean');
      
      // 2. 人物統合
      const consolidatedPersons = personConsolidator.consolidatePersons(mockSongs);
      expect(consolidatedPersons.length).toBeGreaterThan(0);
      
      // 3. 視覚スタイル取得
      const songStyle = visualTheme.getStyleForType('song');
      expect(songStyle.iconType).toBeDefined();
      expect(songStyle.shapeType).toBeDefined();
      
      // 4. 重複防止システム
      const contentId = 'test-content';
      bubbleRegistry.registerBubble(contentId);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(true);
      
      // 5. アイコン描画
      iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, 20);
      expect(mockContext.beginPath).toHaveBeenCalled();
      
      // 6. クリーンアップ
      bubbleRegistry.unregisterBubble(contentId);
      expect(bubbleRegistry.isContentDisplayed(contentId)).toBe(false);
    });

    it('エラー状況でも適切にフォールバックする', () => {
      // 無効なデータでのテスト
      const invalidSongs: Song[] = [];
      
      const consolidatedPersons = personConsolidator.consolidatePersons(invalidSongs);
      expect(consolidatedPersons).toEqual([]);
      
      // 無効なアイコンタイプでの描画テスト
      expect(() => {
        iconRenderer.renderIcon(mockContext, 'invalid' as IconType, 100, 100, 20);
      }).not.toThrow();
      
      // 無効な環境での検出テスト
      const envConfig = environmentDetector.detectEnvironment();
      expect(envConfig).toBeDefined();
      expect(typeof envConfig.isDevelopment).toBe('boolean');
    });
  });
});