import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DebugUI, useDebugUI } from '../DebugUI';
import { EnvironmentDetector } from '../../utils/environmentDetector';

// Mock EnvironmentDetector
vi.mock('../../utils/environmentDetector');

const mockEnvironmentDetector = {
  getInstance: vi.fn(),
  getEnvironmentConfig: vi.fn(),
  detectEnvironment: vi.fn(),
  refreshEnvironmentDetection: vi.fn(),
};

describe('DebugUI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (EnvironmentDetector.getInstance as any).mockReturnValue(mockEnvironmentDetector);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Environment-based visibility', () => {
    it('should render when showDebugInfo is true', async () => {
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

      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /開発者向けデバッグ情報/i })).toBeInTheDocument();
      });
    });

    it('should not render when showDebugInfo is false', () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: false,
        showDebugInfo: false,
        showFPS: false,
        showResetButton: false,
        enableConsoleLogging: false,
      });

      const { container } = render(<DebugUI fps={60} bubbleCount={10} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('FPS Display', () => {
    beforeEach(() => {
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
    });

    it('should display FPS when showFPS is true', async () => {
      render(<DebugUI fps={60.5} bubbleCount={10} />);

      await waitFor(() => {
        expect(screen.getByText('60.5')).toBeInTheDocument();
        expect(screen.getByText('FPS:')).toBeInTheDocument();
      });
    });

    it('should apply correct CSS class based on FPS value', async () => {
      const { rerender } = render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        const fpsValue = screen.getByText('60.0');
        expect(fpsValue).toHaveClass('fps-high');
      });

      rerender(<DebugUI fps={40} bubbleCount={10} />);
      await waitFor(() => {
        const fpsValue = screen.getByText('40.0');
        expect(fpsValue).toHaveClass('fps-medium');
      });

      rerender(<DebugUI fps={20} bubbleCount={10} />);
      await waitFor(() => {
        const fpsValue = screen.getByText('20.0');
        expect(fpsValue).toHaveClass('fps-low');
      });
    });

    it('should not display FPS when showFPS is false', async () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: false,
        showResetButton: true,
        enableConsoleLogging: true,
      });

      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        expect(screen.queryByText('FPS:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Bubble Count Display', () => {
    beforeEach(() => {
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
    });

    it('should display bubble count', async () => {
      render(<DebugUI fps={60} bubbleCount={25} />);

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('Bubbles:')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Button', () => {
    beforeEach(() => {
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
    });

    it('should display reset button when showResetButton is true', async () => {
      const onReset = vi.fn();
      render(<DebugUI fps={60} bubbleCount={10} onReset={onReset} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /アプリケーションの状態をリセット/i })).toBeInTheDocument();
      });
    });

    it('should call onReset when reset button is clicked', async () => {
      const onReset = vi.fn();
      render(<DebugUI fps={60} bubbleCount={10} onReset={onReset} />);

      await waitFor(() => {
        const resetButton = screen.getByRole('button', { name: /アプリケーションの状態をリセット/i });
        fireEvent.click(resetButton);
      });

      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should not display reset button when showResetButton is false', async () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: true,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: false,
        enableConsoleLogging: true,
      });

      render(<DebugUI fps={60} bubbleCount={10} onReset={vi.fn()} />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /アプリケーションの状態をリセット/i })).not.toBeInTheDocument();
      });
    });

    it('should not display reset button when onReset is not provided', async () => {
      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /アプリケーションの状態をリセット/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Environment Information', () => {
    beforeEach(() => {
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
    });

    it('should display environment info when showEnvironmentInfo is true', async () => {
      render(<DebugUI fps={60} bubbleCount={10} showEnvironmentInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Environment:')).toBeInTheDocument();
        expect(screen.getByText('Development')).toBeInTheDocument();
      });
    });

    it('should display Production for production environment', async () => {
      mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
        isDevelopment: false,
        showDebugInfo: true,
        showFPS: true,
        showResetButton: true,
        enableConsoleLogging: true,
      });

      render(<DebugUI fps={60} bubbleCount={10} showEnvironmentInfo={true} />);

      await waitFor(() => {
        expect(screen.getByText('Production')).toBeInTheDocument();
      });
    });

    it('should not display environment info when showEnvironmentInfo is false', async () => {
      render(<DebugUI fps={60} bubbleCount={10} showEnvironmentInfo={false} />);

      await waitFor(() => {
        expect(screen.queryByText('Environment:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Environment Refresh', () => {
    beforeEach(() => {
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
    });

    it('should call refreshEnvironmentDetection when refresh button is clicked', async () => {
      render(<DebugUI fps={60} bubbleCount={10} />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /環境設定を再読み込み/i });
        fireEvent.click(refreshButton);
      });

      expect(mockEnvironmentDetector.refreshEnvironmentDetection).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useDebugUI Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (EnvironmentDetector.getInstance as any).mockReturnValue(mockEnvironmentDetector);
  });

  it('should return correct debug UI state', () => {
    mockEnvironmentDetector.getEnvironmentConfig.mockReturnValue({
      isDevelopment: true,
      showDebugInfo: true,
      showFPS: true,
      showResetButton: true,
      enableConsoleLogging: true,
    });

    const TestComponent = () => {
      const { shouldShowDebugUI, shouldLogToConsole } = useDebugUI();
      return (
        <div>
          <span data-testid="show-debug">{shouldShowDebugUI.toString()}</span>
          <span data-testid="log-console">{shouldLogToConsole.toString()}</span>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('show-debug')).toHaveTextContent('true');
    expect(screen.getByTestId('log-console')).toHaveTextContent('true');
  });
});