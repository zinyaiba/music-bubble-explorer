import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DebugUI } from '../../components/DebugUI';
import { FPSTracker } from '../fpsTracker';
import { DebugLogger } from '../debugLogger';
import { EnvironmentDetector } from '../environmentDetector';

// Mock EnvironmentDetector
vi.mock('../environmentDetector');

const mockEnvironmentDetector = {
  getInstance: vi.fn(),
  getEnvironmentConfig: vi.fn(),
  detectEnvironment: vi.fn(),
  refreshEnvironmentDetection: vi.fn(),
  shouldLogToConsole: vi.fn(),
};

describe('Debug UI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset singletons
    (EnvironmentDetector.getInstance as any).mockReturnValue(mockEnvironmentDetector);
    (FPSTracker as any).instance = undefined;
    (DebugLogger as any).instance = undefined;

    // Mock environment as development
    mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
      isDevelopment: true,
      showDebugInfo: true,
      showFPS: true,
      showResetButton: true,
      enableConsoleLogging: true,
    });

    mockEnvironmentDetector.detectEnvironment.mockReturnValue({
      isDevelopment: true,
      showDebugInfo: true,
      showFPS: true,
      showResetButton: true,
      enableConsoleLogging: true,
      environmentType: 'development',
      debugForced: false,
      hostname: 'localhost',
      isLocalhost: true,
    });

    mockEnvironmentDetector.shouldLogToConsole.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Development Environment Integration', () => {
    it('should show debug UI in development environment', async () => {
      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /開発者向けデバッグ情報/i })).toBeInTheDocument();
        expect(screen.getByText('Debug Info')).toBeInTheDocument();
        expect(screen.getByText('60.0')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
      });
    });

    it('should show reset button in development environment', async () => {
      const onReset = vi.fn();
      render(<DebugUI fps={60} bubbleCount={10} onReset={onReset} />);

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /アプリケーションの状態をリセット/i });
        expect(resetButton).toBeInTheDocument();
        
        fireEvent.click(resetButton);
        expect(onReset).toHaveBeenCalledTimes(1);
      });
    });

    it('should show environment information when requested', async () => {
      render(<DebugUI fps={60} bubbleCount={10} showEnvironmentInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Environment:')).toBeInTheDocument();
        expect(screen.getByText('Development')).toBeInTheDocument();
      });
    });
  });

  describe('Production Environment Integration', () => {
    beforeEach(() => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: false,
        showDebugInfo: false,
        showFPS: false,
        showResetButton: false,
        enableConsoleLogging: false,
      });
    });

    it('should not show debug UI in production environment', () => {
      const { container } = render(<DebugUI fps={60} bubbleCount={10} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('FPS Tracker Integration', () => {
    it('should integrate with FPS tracker', () => {
      const fpsTracker = FPSTracker.getInstance();
      expect(fpsTracker).toBeDefined();
      
      // Should start tracking in development environment
      fpsTracker.start();
      expect(fpsTracker.isActive()).toBe(true);
    });
  });

  describe('Debug Logger Integration', () => {
    it('should integrate with debug logger', () => {
      const debugLogger = DebugLogger.getInstance();
      expect(debugLogger).toBeDefined();
      
      // Should be enabled in development environment
      expect(debugLogger.isEnabled()).toBe(true);
    });

    it('should log debug information when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      const debugLogger = DebugLogger.getInstance();
      debugLogger.debug('Test debug message');
      
      expect(consoleSpy).toHaveBeenCalledWith('[DEBUG] Test debug message');
      consoleSpy.mockRestore();
    });
  });

  describe('Environment Refresh Integration', () => {
    it('should refresh environment detection when requested', async () => {
      mockEnvironmentDetector.refreshEnvironmentDetection.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
        environmentType: 'development',
        debugForced: false,
        hostname: 'localhost',
        isLocalhost: true,
      });

      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /環境設定を再読み込み/i });
        fireEvent.click(refreshButton);
      });

      expect(mockEnvironmentDetector.refreshEnvironmentDetection).toHaveBeenCalledTimes(1);
    });
  });

  describe('FPS Performance Classes', () => {
    it('should apply correct CSS classes based on FPS values', async () => {
      const { rerender } = render(<DebugUI fps={60} bubbleCount={10} />);

      // High FPS
      await waitFor(() => {
        const fpsValue = screen.getByText('60.0');
        expect(fpsValue).toHaveClass('fps-high');
      });

      // Medium FPS
      rerender(<DebugUI fps={40} bubbleCount={10} />);
      await waitFor(() => {
        const fpsValue = screen.getByText('40.0');
        expect(fpsValue).toHaveClass('fps-medium');
      });

      // Low FPS
      rerender(<DebugUI fps={20} bubbleCount={10} />);
      await waitFor(() => {
        const fpsValue = screen.getByText('20.0');
        expect(fpsValue).toHaveClass('fps-low');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide proper accessibility attributes', async () => {
      render(<DebugUI fps={60} bubbleCount={25} />);

      await waitFor(() => {
        const debugRegion = screen.getByRole('region', { name: /開発者向けデバッグ情報/i });
        expect(debugRegion).toBeInTheDocument();

        const fpsValue = screen.getByLabelText(/フレームレート: 毎秒60フレーム/i);
        expect(fpsValue).toBeInTheDocument();

        const bubbleCount = screen.getByLabelText(/シャボン玉の数: 25個/i);
        expect(bubbleCount).toBeInTheDocument();
      });
    });

    it('should provide proper button accessibility', async () => {
      const onReset = vi.fn();
      render(<DebugUI fps={60} bubbleCount={10} onReset={onReset} />);

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /アプリケーションの状態をリセット/i });
        expect(resetButton).toBeInTheDocument();

        const refreshButton = screen.getByRole('button', { name: /環境設定を再読み込み/i });
        expect(refreshButton).toBeInTheDocument();
      });
    });
  });
});