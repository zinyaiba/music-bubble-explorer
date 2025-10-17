/**
 * Mobile Performance Hook
 * MobilePerformanceManagerとReactコンポーネントの統合
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { 
  MobilePerformanceManager, 
  MobilePerformanceConfig, 
  DialogState, 
  PerformanceMetrics 
} from '../services/mobilePerformanceManager';

export interface UseMobilePerformanceOptions {
  enableAutoOptimization?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableDialogProtection?: boolean;
  monitoringInterval?: number;
}

export interface MobilePerformanceHookReturn {
  performanceManager: MobilePerformanceManager;
  performanceMetrics: PerformanceMetrics;
  dialogState: DialogState;
  config: MobilePerformanceConfig;
  handleDialogOpen: (type: 'modal' | 'form' | 'management' | 'tag-list') => void;
  handleDialogClose: () => void;
  updateConfig: (newConfig: Partial<MobilePerformanceConfig>) => void;
  applyMobileOptimizations: () => void;
  isDialogOpen: boolean;
  isPerformanceOptimized: boolean;
}

/**
 * モバイルパフォーマンス管理フック
 */
export function useMobilePerformance(
  options: UseMobilePerformanceOptions = {}
): MobilePerformanceHookReturn {
  const {
    enableAutoOptimization = true,
    enablePerformanceMonitoring = true,
    enableDialogProtection = true,
    monitoringInterval = 1000
  } = options;

  const performanceManagerRef = useRef<MobilePerformanceManager | null>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    flickerEvents: 0,
    dialogStabilityScore: 100,
    renderingEfficiency: 100,
    gpuAccelerationActive: false,
    layerSeparationActive: false
  });
  
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    type: null,
    zIndex: 9999,
    protectionLayer: null
  });
  
  const [config, setConfig] = useState<MobilePerformanceConfig>({
    enableGPUAcceleration: true,
    enableLayerSeparation: true,
    enableDialogProtection: enableDialogProtection,
    enableFlickerPrevention: true,
    animationControlDuringDialog: true,
    renderingOptimization: true
  });

  const [isPerformanceOptimized, setIsPerformanceOptimized] = useState(false);

  /**
   * パフォーマンスマネージャーの初期化
   */
  useEffect(() => {
    if (!performanceManagerRef.current) {
      performanceManagerRef.current = MobilePerformanceManager.getInstance();
    }

    const manager = performanceManagerRef.current;

    // 初期設定の適用
    manager.updateConfig(config);

    // 自動最適化の適用
    if (enableAutoOptimization) {
      manager.applyMobileOptimizations();
      setIsPerformanceOptimized(true);
    }

    // パフォーマンス監視の開始
    if (enablePerformanceMonitoring) {
      startPerformanceMonitoring();
    }

    return () => {
      stopPerformanceMonitoring();
    };
  }, [enableAutoOptimization, enablePerformanceMonitoring, config]);

  /**
   * パフォーマンス監視の開始
   */
  const startPerformanceMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      return;
    }

    monitoringIntervalRef.current = setInterval(() => {
      if (performanceManagerRef.current) {
        const metrics = performanceManagerRef.current.getPerformanceMetrics();
        const dialogState = performanceManagerRef.current.getDialogState();
        
        setPerformanceMetrics(metrics);
        setDialogState(dialogState);
      }
    }, monitoringInterval);
  }, [monitoringInterval]);

  /**
   * パフォーマンス監視の停止
   */
  const stopPerformanceMonitoring = useCallback(() => {
    if (monitoringIntervalRef.current) {
      clearInterval(monitoringIntervalRef.current);
      monitoringIntervalRef.current = null;
    }
  }, []);

  /**
   * ダイアログ開放の処理
   */
  const handleDialogOpen = useCallback((type: 'modal' | 'form' | 'management' | 'tag-list') => {
    if (performanceManagerRef.current) {
      performanceManagerRef.current.handleDialogState(true, type);
      
      // 状態の即座更新
      const newDialogState = performanceManagerRef.current.getDialogState();
      setDialogState(newDialogState);
    }
  }, []);

  /**
   * ダイアログ閉鎖の処理
   */
  const handleDialogClose = useCallback(() => {
    if (performanceManagerRef.current) {
      performanceManagerRef.current.handleDialogState(false, null);
      
      // 状態の即座更新
      const newDialogState = performanceManagerRef.current.getDialogState();
      setDialogState(newDialogState);
    }
  }, []);

  /**
   * 設定の更新
   */
  const updateConfig = useCallback((newConfig: Partial<MobilePerformanceConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    if (performanceManagerRef.current) {
      performanceManagerRef.current.updateConfig(updatedConfig);
    }
  }, [config]);

  /**
   * モバイル最適化の手動適用
   */
  const applyMobileOptimizations = useCallback(() => {
    if (performanceManagerRef.current) {
      performanceManagerRef.current.applyMobileOptimizations();
      setIsPerformanceOptimized(true);
    }
  }, []);

  /**
   * コンポーネントのアンマウント時のクリーンアップ
   */
  useEffect(() => {
    return () => {
      stopPerformanceMonitoring();
      
      // パフォーマンスマネージャーのクリーンアップは行わない
      // （シングルトンのため他のコンポーネントでも使用される可能性がある）
    };
  }, [stopPerformanceMonitoring]);

  return {
    performanceManager: performanceManagerRef.current!,
    performanceMetrics,
    dialogState,
    config,
    handleDialogOpen,
    handleDialogClose,
    updateConfig,
    applyMobileOptimizations,
    isDialogOpen: dialogState.isOpen,
    isPerformanceOptimized
  };
}

/**
 * ダイアログ状態管理のためのシンプルなフック
 */
export function useDialogPerformance() {
  const performanceManager = MobilePerformanceManager.getInstance();
  
  const handleDialogOpen = useCallback((type: 'modal' | 'form' | 'management' | 'tag-list') => {
    performanceManager.handleDialogState(true, type);
  }, [performanceManager]);
  
  const handleDialogClose = useCallback(() => {
    performanceManager.handleDialogState(false, null);
  }, [performanceManager]);
  
  return {
    handleDialogOpen,
    handleDialogClose
  };
}

/**
 * パフォーマンス監視のためのフック
 */
export function usePerformanceMonitoring(interval: number = 1000) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    flickerEvents: 0,
    dialogStabilityScore: 100,
    renderingEfficiency: 100,
    gpuAccelerationActive: false,
    layerSeparationActive: false
  });
  
  useEffect(() => {
    const performanceManager = MobilePerformanceManager.getInstance();
    
    const monitoringInterval = setInterval(() => {
      const currentMetrics = performanceManager.getPerformanceMetrics();
      setMetrics(currentMetrics);
    }, interval);
    
    return () => {
      clearInterval(monitoringInterval);
    };
  }, [interval]);
  
  return metrics;
}