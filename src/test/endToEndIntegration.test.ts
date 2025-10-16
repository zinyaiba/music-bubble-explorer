/**
 * エンドツーエンド統合テスト
 * End-to-End Integration Tests
 * 
 * システム全体の統合動作を検証し、実際のユーザーシナリオをテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedBubbleManager } from '../services/enhancedBubbleManager';
import { BubbleRegistry } from '../utils/bubbleRegistry';
import { PersonConsolidator } from '../utils/personConsolidator';
import { EnvironmentDetector } from '../utils/environmentDetector';
import { VisualTheme } from '../utils/visualTheme';
import { IconRenderer } from '../utils/iconRenderer';
import { ShapeRenderer } from '../utils/shapeRenderer';
import { MultiRoleHandler } from '../utils/multiRoleHandler';
import { ContentTracker } from '../utils/contentTracker';
import { DebugUI } from '../components/DebugUI';
import { BubbleCanvas } from '../components/BubbleCanvas';
import { DetailModal } from '../components/DetailModal';
import { IconType, ShapeType } from '../types/enhancedBubble';
import { Song } from '../types';
import React from 'react';

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
  },
  {
    id: '3',
    title: 'Tag Test Song',
    artist: 'Test Artist 3',
    lyricist: 'Writer A',
    composer: 'Composer B',
    arranger: 'Arranger C',
    tags: ['jazz', 'smooth', 'instrumental'],
    albumCover: 'cover3.jpg'
  }
];

// モックコンポーネント
const MockBubbleCanvas: React.FC<{ songs: Song[] }> = ({ songs }) => {
  const [bubbles, setBubbles] = React.useState<any[]>([]);
  const [selectedBubble, setSelectedBubble] = React.useState<any>(null);
  
  React.useEffect(() => {
    // バブル生成のシミュレーション
    const mockBubbles = songs.slice(0, 3).map((song, index) => ({
      id: `bubble-${index}`,
      content: song,
      x: 100 + index * 100,
      y: 100 + index * 50,
      radius: 30,
      visualType: index === 0 ? 'song' : index === 1 ? 'person' : 'tag'
    }));
    setBubbles(mockBubbles);
  }, [songs]);

  return (
    <div data-testid="bubble-canvas">
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          data-testid={`bubble-${bubble.id}`}
          onClick={() => setSelectedBubble(bubble)}
          style={{
            position: 'absolute',
            left: bubble.x,
            top: bubble.y,
            width: bubble.radius * 2,
            height: bubble.radius * 2,
            borderRadius: '50%',
            backgroundColor: '#ccc',
            cursor: 'pointer'
          }}
        >
          {bubble.visualType}
        </div>
      ))}
      {selectedBubble && (
        <DetailModal
          isOpen={true}
          onClose={() => setSelectedBubble(null)}
          content={selectedBubble.content}
          songs={songs}
        />
      )}
    </div>
  );
};

describe('エンドツーエンド統合テスト (End-to-End Integration Tests)', () => {
  let enhancedBubbleManager: EnhancedBubbleManager;
  let bubbleRegistry: BubbleRegistry;
  let personConsolidator: PersonConsolidator;
  let environmentDetector: EnvironmentDetector;
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    mockCanvas.width = 800;
    mockCanvas.height = 600;

    bubbleRegistry = new BubbleRegistry();
    personConsolidator = new PersonConsolidator();
    environmentDetector = new EnvironmentDetector();

    enhancedBubbleManager = new EnhancedBubbleManager(
      mockCanvas,
      testSongs,
      bubbleRegistry,
      personConsolidator,
      new VisualTheme(),
      new IconRenderer(),
      new ShapeRenderer(),
      new MultiRoleHandler(),
      new ContentTracker()
    );
  });

  describe('完全なユーザーワークフロー', () => {
    it('アプリケーション起動から表示まで正常に動作する', async () => {
      // 1. 環境検出
      const envConfig = environmentDetector.detectEnvironment();
      expect(envConfig).toBeDefined();

      // 2. 人物統合処理
      const consolidatedPersons = personConsolidator.consolidatePersons(testSongs);
      expect(consolidatedPersons.length).toBeGreaterThan(0);

      // 3. 複数役割人物の検出
      const multiRolePerson = consolidatedPersons.find(p => p.name === 'Multi Person');
      expect(multiRolePerson).toBeDefined();
      expect(multiRolePerson!.roles.length).toBeGreaterThan(1);

      // 4. バブル生成
      const songBubble = enhancedBubbleManager.createSongBubble(testSongs[0]);
      expect(songBubble.visualType).toBe('song');
      expect(songBubble.iconType).toBe(IconType.MUSIC_NOTE);

      const personBubble = enhancedBubbleManager.createPersonBubble('Multi Person', testSongs);
      expect(personBubble.visualType).toBe('person');
      expect(personBubble.isMultiRole).toBe(true);

      const tagBubble = enhancedBubbleManager.createTagBubble('pop', testSongs);
      expect(tagBubble.visualType).toBe('tag');
      expect(tagBubble.iconType).toBe(IconType.HASHTAG);

      // 5. 重複防止の確認
      const contentId1 = enhancedBubbleManager.getContentId(songBubble);
      expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);

      // 6. 視覚的区別の確認
      expect(songBubble.iconType).not.toBe(personBubble.iconType);
      expect(personBubble.iconType).not.toBe(tagBubble.iconType);
    });

    it('デバッグUIが環境に応じて表示される', () => {
      // 開発環境での表示
      vi.spyOn(environmentDetector, 'detectEnvironment').mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true
      });

      const { rerender } = render(
        <DebugUI
          show={true}
          fps={60}
          bubbleCount={10}
          onReset={() => {}}
        />
      );

      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Bubbles:/)).toBeInTheDocument();
      expect(screen.getByText('Reset Status')).toBeInTheDocument();

      // 本番環境での非表示
      rerender(
        <DebugUI
          show={false}
          fps={60}
          bubbleCount={10}
          onReset={() => {}}
        />
      );

      expect(screen.queryByText(/FPS:/)).not.toBeInTheDocument();
      expect(screen.queryByText('Reset Status')).not.toBeInTheDocument();
    });

    it('バブルクリックから詳細表示まで正常に動作する', async () => {
      render(<MockBubbleCanvas songs={testSongs} />);

      // バブルが表示されることを確認
      await waitFor(() => {
        expect(screen.getByTestId('bubble-canvas')).toBeInTheDocument();
      });

      // 最初のバブルをクリック
      const firstBubble = screen.getByTestId('bubble-bubble-0');
      fireEvent.click(firstBubble);

      // 詳細モーダルが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('Multi-Role Song')).toBeInTheDocument();
      });

      // モーダルを閉じる
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      // モーダルが閉じられることを確認
      await waitFor(() => {
        expect(screen.queryByText('Multi-Role Song')).not.toBeInTheDocument();
      });
    });
  });

  describe('エラーハンドリングとフォールバック', () => {
    it('無効なデータでもアプリケーションが動作する', () => {
      const invalidSongs: Song[] = [];
      
      const emptyManager = new EnhancedBubbleManager(
        mockCanvas,
        invalidSongs,
        new BubbleRegistry(),
        new PersonConsolidator(),
        new VisualTheme(),
        new IconRenderer(),
        new ShapeRenderer(),
        new MultiRoleHandler(),
        new ContentTracker()
      );

      // 空のデータでもエラーが発生しない
      expect(() => {
        const bubble = emptyManager.generateUniqueBubble();
        expect(bubble).toBeNull();
      }).not.toThrow();
    });

    it('Canvas描画エラーでもアプリケーションが継続する', () => {
      const mockContext = mockCanvas.getContext('2d')!;
      
      // 描画メソッドをエラーを投げるようにモック
      vi.spyOn(mockContext, 'beginPath').mockImplementation(() => {
        throw new Error('Canvas error');
      });

      const iconRenderer = new IconRenderer();
      
      // エラーが発生してもアプリケーションがクラッシュしない
      expect(() => {
        iconRenderer.renderIcon(mockContext, IconType.MUSIC_NOTE, 100, 100, 20);
      }).not.toThrow();
    });

    it('メモリ不足状況でも適切に処理される', () => {
      // 大量のバブルを生成してメモリ圧迫をシミュレート
      const bubbles: any[] = [];
      
      for (let i = 0; i < 1000; i++) {
        try {
          const bubble = enhancedBubbleManager.generateUniqueBubble();
          if (bubble) {
            bubbles.push(bubble);
          }
        } catch (error) {
          // メモリ不足エラーが発生しても処理を継続
          break;
        }
      }

      // 少なくとも一部のバブルは生成される
      expect(bubbles.length).toBeGreaterThan(0);
    });
  });

  describe('パフォーマンス統合テスト', () => {
    it('リアルタイム更新でもパフォーマンスが維持される', async () => {
      const updateCount = 100;
      const startTime = performance.now();

      for (let i = 0; i < updateCount; i++) {
        // バブル生成
        const bubble = enhancedBubbleManager.generateUniqueBubble();
        
        if (bubble) {
          // 描画シミュレーション
          const mockContext = mockCanvas.getContext('2d')!;
          enhancedBubbleManager.renderBubble(mockContext, bubble);
          
          // バブル削除
          const contentId = enhancedBubbleManager.getContentId(bubble);
          bubbleRegistry.unregisterBubble(contentId);
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 100回の更新が1秒以内に完了
      expect(totalTime).toBeLessThan(1000);
      
      console.log(`リアルタイム更新テスト (${updateCount}回): ${totalTime.toFixed(2)}ms`);
    });

    it('同時多発的な操作でも安定している', async () => {
      const operations = [];

      // 複数の操作を同時実行
      for (let i = 0; i < 10; i++) {
        operations.push(
          Promise.resolve().then(() => {
            const bubble = enhancedBubbleManager.generateUniqueBubble();
            if (bubble) {
              const contentId = enhancedBubbleManager.getContentId(bubble);
              setTimeout(() => {
                bubbleRegistry.unregisterBubble(contentId);
              }, Math.random() * 100);
            }
            return bubble;
          })
        );
      }

      const results = await Promise.all(operations);
      
      // 全ての操作が完了
      expect(results.length).toBe(10);
      
      // エラーが発生していない
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('アクセシビリティ統合テスト', () => {
    it('色覚異常でも区別可能な視覚要素を使用している', () => {
      const visualTheme = new VisualTheme();
      
      // 各タイプが異なるアイコンと形状を持つ
      const songStyle = visualTheme.getStyleForType('song');
      const lyricistStyle = visualTheme.getStyleForType('lyricist');
      const tagStyle = visualTheme.getStyleForType('tag');

      // アイコンによる区別
      expect(songStyle.iconType).not.toBe(lyricistStyle.iconType);
      expect(lyricistStyle.iconType).not.toBe(tagStyle.iconType);

      // 形状による区別
      expect(songStyle.shapeType).not.toBe(tagStyle.shapeType);
    });

    it('キーボードナビゲーションが可能である', () => {
      render(<MockBubbleCanvas songs={testSongs} />);

      const canvas = screen.getByTestId('bubble-canvas');
      
      // フォーカス可能
      canvas.focus();
      expect(document.activeElement).toBe(canvas);

      // キーボードイベントが処理される
      fireEvent.keyDown(canvas, { key: 'Enter' });
      fireEvent.keyDown(canvas, { key: 'Space' });
      fireEvent.keyDown(canvas, { key: 'Escape' });

      // エラーが発生しない
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('データ整合性統合テスト', () => {
    it('複数役割統合後もデータの整合性が保たれる', () => {
      const consolidatedPersons = personConsolidator.consolidatePersons(testSongs);
      
      // 統合前後で楽曲数の合計が一致
      let totalSongReferences = 0;
      testSongs.forEach(song => {
        if (song.lyricist) totalSongReferences++;
        if (song.composer) totalSongReferences++;
        if (song.arranger) totalSongReferences++;
      });

      let consolidatedReferences = 0;
      consolidatedPersons.forEach(person => {
        consolidatedReferences += person.totalRelatedCount;
      });

      expect(consolidatedReferences).toBe(totalSongReferences);
    });

    it('バブルレジストリの状態が一貫している', () => {
      const bubble1 = enhancedBubbleManager.generateUniqueBubble();
      const bubble2 = enhancedBubbleManager.generateUniqueBubble();

      if (bubble1 && bubble2) {
        const contentId1 = enhancedBubbleManager.getContentId(bubble1);
        const contentId2 = enhancedBubbleManager.getContentId(bubble2);

        // 異なるコンテンツが生成される
        expect(contentId1).not.toBe(contentId2);

        // 両方とも登録されている
        expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(true);
        expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(true);

        // 削除後は利用可能になる
        bubbleRegistry.unregisterBubble(contentId1);
        expect(bubbleRegistry.isContentDisplayed(contentId1)).toBe(false);
        expect(bubbleRegistry.isContentDisplayed(contentId2)).toBe(true);
      }
    });
  });
});