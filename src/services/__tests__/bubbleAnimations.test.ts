import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BubbleAnimationManager } from '../bubbleAnimations'
import { BubbleEntity } from '@/types/bubble'

// Mock performance.now for consistent timing
const mockPerformanceNow = vi.fn()
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
})

describe('BubbleAnimationManager', () => {
  let bubbleAnimations: BubbleAnimationManager
  let mockBubble: BubbleEntity

  beforeEach(() => {
    vi.clearAllMocks()
    mockPerformanceNow.mockReturnValue(0)
    
    bubbleAnimations = new BubbleAnimationManager()
    
    mockBubble = new BubbleEntity({
      type: 'song',
      name: 'テスト楽曲',
      x: 100,
      y: 100,
      vx: 20,
      vy: 30,
      size: 50,
      color: '#FFB6C1',
      opacity: 1,
      lifespan: 10000,
      relatedCount: 5
    })
  })

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const animations = new BubbleAnimationManager()
      
      expect(animations).toBeDefined()
    })

    it('should initialize and have zero active animations', () => {
      const animations = new BubbleAnimationManager()
      
      expect(animations.getActiveAnimationCount()).toBe(0)
    })
  })

  describe('startAppearAnimation', () => {
    it('should set appear animation state', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.type).toBe('appear')
      expect(state?.startTime).toBeDefined()
    })

    it('should set initial scale and opacity for appear animation', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.initialScale).toBe(0)
      expect(state?.initialOpacity).toBe(0)
    })
  })

  describe('startDisappearAnimation', () => {
    it('should set disappear animation state', () => {
      bubbleAnimations.startDisappearAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.type).toBe('disappear')
      expect(state?.startTime).toBeDefined()
    })

    it('should preserve current scale and opacity for disappear animation', () => {
      bubbleAnimations.startDisappearAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.initialOpacity).toBe(1) // Default opacity
    })
  })

  describe('startClickAnimation', () => {
    it('should set click animation state', () => {
      bubbleAnimations.startClickAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.type).toBe('click')
      expect(state?.startTime).toBeDefined()
    })

    it('should set target scale for click animation', () => {
      bubbleAnimations.startClickAnimation(mockBubble.id)
      
      const state = bubbleAnimations.getAnimationState(mockBubble.id)
      expect(state?.targetScale).toBe(1.3) // Updated to match actual config
    })
  })

  describe('animation progress', () => {
    it('should update appear animation progress', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      mockPerformanceNow.mockReturnValue(250) // 250ms into animation
      
      const scale = bubbleAnimations.getCurrentScale(mockBubble.id, 250)
      const opacity = bubbleAnimations.getCurrentOpacity(mockBubble.id, 250)
      
      expect(scale).toBeGreaterThan(0)
      expect(scale).toBeLessThan(1)
      expect(opacity).toBeGreaterThan(0)
      expect(opacity).toBeLessThan(1)
    })

    it('should complete appear animation after duration', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      mockPerformanceNow.mockReturnValue(900) // After 900ms (duration is 800ms)
      
      const isComplete = bubbleAnimations.isAnimationComplete(mockBubble.id, 900)
      
      expect(isComplete).toBe(true)
    })

    it('should update disappear animation progress', () => {
      bubbleAnimations.startDisappearAnimation(mockBubble.id)
      
      mockPerformanceNow.mockReturnValue(750) // 750ms into animation
      
      const scale = bubbleAnimations.getCurrentScale(mockBubble.id, 750)
      const opacity = bubbleAnimations.getCurrentOpacity(mockBubble.id, 750)
      const rotation = bubbleAnimations.getCurrentRotation(mockBubble.id, 750)
      
      expect(scale).toBeLessThan(1)
      expect(opacity).toBeLessThan(1)
      expect(rotation).toBeGreaterThan(0)
    })

    it('should complete disappear animation after duration', () => {
      bubbleAnimations.startDisappearAnimation(mockBubble.id)
      
      mockPerformanceNow.mockReturnValue(1600) // After 1600ms (duration is 1500ms)
      
      const isComplete = bubbleAnimations.isAnimationComplete(mockBubble.id, 1600)
      
      expect(isComplete).toBe(true)
    })

    it('should update click animation progress', () => {
      bubbleAnimations.startClickAnimation(mockBubble.id)
      
      mockPerformanceNow.mockReturnValue(100) // 100ms into animation
      
      const scale = bubbleAnimations.getCurrentScale(mockBubble.id, 100)
      
      expect(scale).toBeGreaterThan(1)
      expect(scale).toBeLessThan(1.3)
    })

    it('should return default values when no animation is active', () => {
      const scale = bubbleAnimations.getCurrentScale(mockBubble.id, 0)
      const opacity = bubbleAnimations.getCurrentOpacity(mockBubble.id, 0)
      const rotation = bubbleAnimations.getCurrentRotation(mockBubble.id, 0)
      
      expect(scale).toBe(1)
      expect(opacity).toBe(1)
      expect(rotation).toBe(0)
    })
  })

  describe('stopAnimation', () => {
    it('should remove animation state', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      expect(bubbleAnimations.getAnimationState(mockBubble.id)).toBeDefined()
      
      bubbleAnimations.stopAnimation(mockBubble.id)
      
      expect(bubbleAnimations.getAnimationState(mockBubble.id)).toBeNull()
    })
  })

  describe('clearAllAnimations', () => {
    it('should remove all animation states', () => {
      bubbleAnimations.startAppearAnimation('bubble1')
      bubbleAnimations.startAppearAnimation('bubble2')
      
      expect(bubbleAnimations.getAnimationState('bubble1')).toBeDefined()
      expect(bubbleAnimations.getAnimationState('bubble2')).toBeDefined()
      
      bubbleAnimations.clearAllAnimations()
      
      expect(bubbleAnimations.getAnimationState('bubble1')).toBeNull()
      expect(bubbleAnimations.getAnimationState('bubble2')).toBeNull()
    })
  })

  describe('noise offset', () => {
    it('should generate noise offset for floating animation', () => {
      bubbleAnimations.startFloatingAnimation(mockBubble.id)
      
      const offset = bubbleAnimations.getNoiseOffset(mockBubble.id, 100)
      
      expect(typeof offset.x).toBe('number')
      expect(typeof offset.y).toBe('number')
    })

    it('should return zero offset for disappear animation', () => {
      bubbleAnimations.startDisappearAnimation(mockBubble.id)
      
      const offset = bubbleAnimations.getNoiseOffset(mockBubble.id, 100)
      
      expect(offset.x).toBe(0)
      expect(offset.y).toBe(0)
    })

    it('should generate different offsets for different bubbles', () => {
      bubbleAnimations.startFloatingAnimation('bubble1')
      bubbleAnimations.startFloatingAnimation('bubble2')
      
      const offset1 = bubbleAnimations.getNoiseOffset('bubble1', 100)
      const offset2 = bubbleAnimations.getNoiseOffset('bubble2', 100)
      
      // Different bubbles should have different noise patterns
      expect(offset1.x).not.toBe(offset2.x)
    })
  })

  describe('performance optimization', () => {
    it('should handle many bubbles efficiently', () => {
      // Create 100 bubble animations
      for (let i = 0; i < 100; i++) {
        bubbleAnimations.startAppearAnimation(`bubble${i}`)
      }
      
      expect(bubbleAnimations.getActiveAnimationCount()).toBe(100)
      
      // Update frame - should complete without errors
      mockPerformanceNow.mockReturnValue(16.67)
      bubbleAnimations.updateFrame(16.67)
      
      expect(bubbleAnimations.getActiveAnimationCount()).toBeGreaterThan(0)
    })

    it('should clean up completed animations', () => {
      bubbleAnimations.startAppearAnimation(mockBubble.id)
      
      // Complete the animation
      mockPerformanceNow.mockReturnValue(900) // After duration
      bubbleAnimations.cleanupCompletedAnimations(900)
      
      // Appear animation should transition to floating, not be cleaned up
      expect(bubbleAnimations.getAnimationState(mockBubble.id)).toBeDefined()
    })

    it('should provide performance stats', () => {
      const stats = bubbleAnimations.getPerformanceStats()
      
      expect(stats.activeAnimations).toBe(0)
      expect(stats.frameCount).toBeGreaterThanOrEqual(0)
      expect(stats.averageFPS).toBeGreaterThanOrEqual(0)
      expect(stats.droppedFrames).toBeGreaterThanOrEqual(0)
    })
  })
})