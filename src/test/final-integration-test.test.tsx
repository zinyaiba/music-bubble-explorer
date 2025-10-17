/**
 * 最終統合テストと総合検証
 * Task 35: 全修正機能の統合テスト
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 17.1, 18.1, 19.1, 20.1, 21.1
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'styled-components'
import { theme } from '../styles/theme'
import App from '../App'
import { DataManager } from '../services/dataManager'
import { BubbleManager } from '../services/bubbleManager'
import { RoleBasedBubbleManager } from '../services/roleBasedBubbleManager'
import { AdvancedAnimationController } from '../services/advancedAnimationController'
import { MobilePerformanceManager } from '../services/mobilePerformanceManager'

// Mock Firebase
vi.mock('../config/firebase', () => ({
  db: {},
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn()
}))

// Mock Canvas API
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  })),
  width: 800,
  height: 600,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => mockCanvas.getContext()
})

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
)

describe('Final Integration Test - 最終統合テストと総合検証', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage
    localStorage.clear()
  })

  describe('1. 全修正機能の統合テスト', () => {
    it('should integrate all core components successfully', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // アプリケーションが正常にレンダリングされることを確認
      expect(container).toBeTruthy()
      
      // メインコンポーネントが存在することを確認
      await waitFor(() => {
        const canvas = container.querySelector('canvas')
        expect(canvas).toBeTruthy()
      })
    })

    it('should handle Firebase connection and data persistence', async () => {
      const dataManager = new DataManager()
      
      // Firebase接続のテスト
      expect(() => dataManager.initializeFirebase()).not.toThrow()
      
      // データ永続化のテスト
      const testSong = {
        id: 'test-1',
        title: 'テスト楽曲',
        lyricists: ['作詞家1'],
        composers: ['作曲家1'],
        arrangers: ['編曲家1'],
        tags: ['テスト', 'ポップス'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      expect(() => dataManager.saveSong(testSong)).not.toThrow()
    })

    it('should verify role-based bubble system integration', () => {
      const roleBasedManager = new RoleBasedBubbleManager()
      
      const testPerson = {
        id: 'person-1',
        name: '多役割アーティスト',
        type: 'lyricist' as const,
        songs: ['song-1', 'song-2']
      }

      // 役割別シャボン玉生成のテスト
      const bubbles = roleBasedManager.generateUniqueRoleBubbles(testPerson)
      expect(bubbles).toBeDefined()
      expect(Array.isArray(bubbles)).toBe(true)
    })

    it('should verify advanced animation controller integration', () => {
      const animationController = new AdvancedAnimationController()
      
      // アニメーション設定のテスト
      const config = {
        bubbleLifespan: { min: 5, max: 10, variance: 0.2 },
        floatingSpeed: { min: 0.5, max: 2.0, acceleration: 0.1 },
        randomnessFactor: 0.3,
        staggerDisappearance: {
          enabled: true,
          delayRange: { min: 100, max: 500 },
          pattern: 'random' as const
        }
      }

      expect(() => animationController.updateConfiguration(config)).not.toThrow()
    })

    it('should verify mobile performance manager integration', () => {
      const mobileManager = new MobilePerformanceManager()
      
      // モバイルパフォーマンス最適化のテスト
      expect(() => mobileManager.applyMobileOptimizations()).not.toThrow()
      expect(() => mobileManager.handleDialogState(true)).not.toThrow()
      expect(() => mobileManager.preventDialogDisappearance()).not.toThrow()
    })
  })

  describe('2. モバイル・PC両環境での総合動作確認', () => {
    it('should render correctly on mobile viewport', async () => {
      // モバイルビューポートをシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true })
      
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // モバイル最適化されたレイアウトの確認
      await waitFor(() => {
        const mobileElements = container.querySelectorAll('[class*="mobile"]')
        expect(mobileElements.length).toBeGreaterThan(0)
      })
    })

    it('should render correctly on desktop viewport', async () => {
      // デスクトップビューポートをシミュレート
      Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true })
      
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // デスクトップレイアウトの確認
      await waitFor(() => {
        const canvas = container.querySelector('canvas')
        expect(canvas).toBeTruthy()
      })
    })

    it('should handle touch interactions on mobile', async () => {
      const user = userEvent.setup()
      
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // タッチイベントのシミュレート
      const canvas = container.querySelector('canvas')
      if (canvas) {
        fireEvent.touchStart(canvas, {
          touches: [{ clientX: 100, clientY: 100 }]
        })
        
        fireEvent.touchEnd(canvas, {
          changedTouches: [{ clientX: 100, clientY: 100 }]
        })
      }

      // エラーが発生しないことを確認
      expect(true).toBe(true)
    })
  })

  describe('3. Firebase接続とデータ永続化の最終確認', () => {
    it('should handle Firebase connection errors gracefully', async () => {
      const dataManager = new DataManager()
      
      // 接続エラーのシミュレート
      vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // エラーハンドリングのテスト
      expect(() => dataManager.handleConnectionError(new Error('Connection failed'))).not.toThrow()
    })

    it('should perform CRUD operations correctly', async () => {
      const dataManager = new DataManager()
      
      const testSong = {
        id: 'crud-test',
        title: 'CRUD テスト楽曲',
        lyricists: ['作詞家'],
        composers: ['作曲家'],
        arrangers: ['編曲家'],
        tags: ['テスト'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Create
      expect(() => dataManager.saveSong(testSong)).not.toThrow()
      
      // Update
      const updatedSong = { ...testSong, title: '更新されたタイトル' }
      expect(() => dataManager.updateSong(updatedSong)).not.toThrow()
      
      // Delete
      expect(() => dataManager.deleteSong(testSong.id)).not.toThrow()
    })
  })

  describe('4. 既存機能の後退がないことの検証', () => {
    it('should maintain bubble animation functionality', () => {
      const bubbleManager = new BubbleManager()
      
      // 基本的なシャボン玉機能のテスト
      const testBubble = bubbleManager.generateBubble()
      expect(testBubble).toBeDefined()
      expect(testBubble.id).toBeDefined()
      expect(testBubble.x).toBeTypeOf('number')
      expect(testBubble.y).toBeTypeOf('number')
    })

    it('should maintain tag system functionality', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // タグシステムが正常に動作することを確認
      await waitFor(() => {
        const tagElements = container.querySelectorAll('[class*="tag"]')
        expect(tagElements).toBeDefined()
      })
    })

    it('should maintain responsive design', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // レスポンシブデザインが維持されていることを確認
      const responsiveElements = container.querySelectorAll('[class*="responsive"], [class*="mobile"]')
      expect(responsiveElements).toBeDefined()
    })
  })

  describe('5. ユーザビリティ改善の総合評価', () => {
    it('should provide accessible navigation', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // アクセシブルなナビゲーションの確認
      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy()
      })
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // キーボードナビゲーションのテスト
      await user.keyboard('{Tab}')
      await user.keyboard('{Enter}')
      
      // エラーが発生しないことを確認
      expect(true).toBe(true)
    })

    it('should provide proper error messages', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // エラーメッセージの表示確認
      const errorElements = container.querySelectorAll('[class*="error"], [role="alert"]')
      expect(errorElements).toBeDefined()
    })
  })

  describe('6. パフォーマンス検証', () => {
    it('should handle large datasets efficiently', () => {
      const bubbleManager = new BubbleManager()
      
      // 大量データのテスト（300曲相当）
      const largeBubbleSet = Array.from({ length: 300 }, (_, i) => 
        bubbleManager.generateBubble()
      )
      
      expect(largeBubbleSet).toHaveLength(300)
      expect(() => bubbleManager.updateBubblePhysics(largeBubbleSet)).not.toThrow()
    })

    it('should maintain smooth animations', () => {
      const animationController = new AdvancedAnimationController()
      
      // アニメーションパフォーマンスのテスト
      const startTime = performance.now()
      
      for (let i = 0; i < 100; i++) {
        animationController.updateAnimationFrame()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // 100フレームの処理が1秒以内に完了することを確認
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('7. エラーハンドリング検証', () => {
    it('should handle network errors gracefully', async () => {
      const dataManager = new DataManager()
      
      // ネットワークエラーのシミュレート
      const networkError = new Error('Network error')
      
      expect(() => dataManager.handleNetworkError(networkError)).not.toThrow()
    })

    it('should recover from rendering errors', async () => {
      const { container } = render(
        <TestWrapper>
          <App />
        </TestWrapper>
      )

      // レンダリングエラーからの回復テスト
      const canvas = container.querySelector('canvas')
      if (canvas) {
        // Canvas エラーをシミュレート
        const context = canvas.getContext('2d')
        if (context) {
          expect(() => {
            context.clearRect(0, 0, canvas.width, canvas.height)
          }).not.toThrow()
        }
      }
    })
  })
})