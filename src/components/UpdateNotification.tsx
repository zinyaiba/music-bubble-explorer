import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { checkForUpdates, applyUpdate } from '../utils/versionManager'

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  max-width: 90%;
  width: 400px;
`

const NotificationCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`

const NotificationText = styled.div`
  font-size: 14px;
  line-height: 1.5;
`

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props =>
    props.$primary
      ? `
    background: white;
    color: #667eea;
    &:hover {
      background: #f0f0f0;
    }
  `
      : `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `}

  &:active {
    transform: scale(0.98);
  }
`

export const UpdateNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const checkUpdate = async () => {
      const hasUpdate = await checkForUpdates()
      if (hasUpdate) {
        setShowNotification(true)
      }
    }

    // 初回チェック
    checkUpdate()

    // Service Workerの更新を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowNotification(true)
      })
    }
  }, [])

  const handleUpdate = () => {
    applyUpdate()
  }

  const handleDismiss = () => {
    setShowNotification(false)
  }

  if (!showNotification) {
    return null
  }

  return (
    <NotificationContainer>
      <NotificationCard>
        <div>
          <NotificationTitle>
            🎉 新しいバージョンが利用可能です
          </NotificationTitle>
          <NotificationText>
            アプリが更新されました。最新の機能を使用するには更新してください。
          </NotificationText>
        </div>
        <ButtonGroup>
          <Button onClick={handleDismiss}>後で</Button>
          <Button $primary onClick={handleUpdate}>
            今すぐ更新
          </Button>
        </ButtonGroup>
      </NotificationCard>
    </NotificationContainer>
  )
}
