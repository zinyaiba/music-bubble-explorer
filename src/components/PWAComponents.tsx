import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { pwaManager } from '../utils/pwa';

// PWAインストールボタンのスタイル
const InstallButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #FFB6C1, #DDA0DD);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 182, 193, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  display: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 182, 193, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    bottom: 15px;
    right: 15px;
    padding: 10px 16px;
    font-size: 12px;
  }
`;

// アップデート通知バナーのスタイル
const UpdateBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #98FB98, #B6E5D8);
  color: #2d5a27;
  padding: 12px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  z-index: 1001;
  display: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  button {
    background: #2d5a27;
    color: white;
    border: none;
    border-radius: 15px;
    padding: 6px 12px;
    margin-left: 10px;
    cursor: pointer;
    font-size: 12px;
    transition: background 0.3s ease;

    &:hover {
      background: #1a3317;
    }
  }
`;

// オンライン/オフライン状態インジケーターのスタイル
const StatusIndicator = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 999;
  transition: all 0.3s ease;

  &.online {
    background: rgba(152, 251, 152, 0.9);
    color: #2d5a27;
    border: 2px solid #98FB98;
  }

  &.offline {
    background: rgba(255, 182, 193, 0.9);
    color: #8b0000;
    border: 2px solid #FFB6C1;
  }

  @media (max-width: 768px) {
    top: 15px;
    left: 15px;
    padding: 6px 12px;
    font-size: 11px;
  }
`;

// PWAインストールボタンコンポーネント
export const PWAInstallButton: React.FC = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // インストール可能かチェック
    const checkInstallability = () => {
      const isInstalled = pwaManager.isAppInstalled();
      const isSupported = pwaManager.isPWASupported();
      setShowButton(!isInstalled && isSupported);
    };

    checkInstallability();

    // beforeinstallpromptイベントのリスナー
    const handleBeforeInstallPrompt = () => {
      setShowButton(true);
    };

    // appinstalledイベントのリスナー
    const handleAppInstalled = () => {
      setShowButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const success = await pwaManager.promptInstall();
    if (success) {
      setShowButton(false);
    }
  };

  if (!showButton) return null;

  return (
    <InstallButton id="pwa-install-button" onClick={handleInstall}>
      📱 アプリをインストール
    </InstallButton>
  );
};

// アップデート通知バナーコンポーネント
export const PWAUpdateBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Service Workerの更新チェック
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowBanner(true);
      });
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <UpdateBanner id="pwa-update-banner">
      🎉 新しいバージョンが利用可能です！
      <button onClick={handleUpdate}>更新</button>
      <button onClick={handleDismiss}>後で</button>
    </UpdateBanner>
  );
};

// オンライン/オフライン状態インジケーターコンポーネント
export const PWAStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // デバッグモードが明示的に有効な場合のみ表示
  const shouldShow = new URLSearchParams(window.location.search).get('debug') === 'true';
  
  if (!shouldShow) {
    return null;
  }

  return (
    <StatusIndicator 
      id="pwa-status-indicator" 
      className={`pwa-status ${isOnline ? 'online' : 'offline'}`}
    >
      {isOnline ? '🌐 オンライン' : '📱 オフライン'}
    </StatusIndicator>
  );
};