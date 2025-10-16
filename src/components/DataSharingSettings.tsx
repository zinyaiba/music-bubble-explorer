import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { SharedDataService, DataSharingMethod } from '@/services/sharedDataService'
import { FirebaseSettings } from './FirebaseSettings'

interface DataSharingSettingsProps {
  isVisible: boolean
  onClose: () => void
}

/**
 * データ共有設定コンポーネント
 */
export const DataSharingSettings: React.FC<DataSharingSettingsProps> = ({
  isVisible,
  onClose
}) => {
  const [selectedMethod, setSelectedMethod] = useState<DataSharingMethod>(DataSharingMethod.FIREBASE)
  const [githubRepo, setGithubRepo] = useState('')
  const [firebaseConnected, setFirebaseConnected] = useState(false)
  
  const sharedDataService = SharedDataService.getInstance()
  const availableMethods = sharedDataService.getAvailableMethods()

  /**
   * 設定を保存
   */
  const handleSaveSettings = useCallback(() => {
    sharedDataService.configure({
      method: selectedMethod,
      githubRepo: githubRepo || undefined
    })
    
    console.log('✅ Data sharing settings saved:', selectedMethod)
    onClose()
  }, [selectedMethod, githubRepo, onClose])

  /**
   * 背景クリックでモーダルを閉じる
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  if (!isVisible) return null

  return (
    <SettingsOverlay onClick={handleBackdropClick}>
      <SettingsContainer>
        <SettingsHeader>
          <SettingsTitle>🌐 データ共有設定</SettingsTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </SettingsHeader>

        <SettingsBody>
          <Description>
            楽曲データの共有方式を選択してください。<br/>
            現在は「ローカルストレージのみ」で動作しています。
          </Description>

          <MethodsContainer>
            {availableMethods.map((method) => (
              <MethodCard
                key={method.method}
                $isSelected={selectedMethod === method.method}
                onClick={() => setSelectedMethod(method.method)}
              >
                <MethodHeader>
                  <MethodRadio
                    type="radio"
                    name="sharing-method"
                    checked={selectedMethod === method.method}
                    onChange={() => setSelectedMethod(method.method)}
                  />
                  <MethodName>{method.name}</MethodName>
                </MethodHeader>
                
                <MethodDescription>{method.description}</MethodDescription>
                
                <ProsCons>
                  <ProsConsSection>
                    <ProsConsTitle>✅ メリット</ProsConsTitle>
                    <ProsConsList>
                      {method.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ProsConsList>
                  </ProsConsSection>
                  
                  <ProsConsSection>
                    <ProsConsTitle>⚠️ デメリット</ProsConsTitle>
                    <ProsConsList>
                      {method.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ProsConsList>
                  </ProsConsSection>
                </ProsCons>
                
                <SetupInfo>
                  <strong>設定:</strong> {method.setup}
                </SetupInfo>
              </MethodCard>
            ))}
          </MethodsContainer>

          {selectedMethod === DataSharingMethod.GITHUB_ISSUES && (
            <ConfigSection>
              <ConfigTitle>GitHub設定</ConfigTitle>
              <ConfigInput
                type="text"
                placeholder="例: username/repository-name"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
              />
              <ConfigNote>
                GitHubリポジトリ名を「ユーザー名/リポジトリ名」の形式で入力してください
              </ConfigNote>
            </ConfigSection>
          )}

          {selectedMethod === DataSharingMethod.FIREBASE && (
            <ConfigSection>
              <FirebaseSettings 
                onConnectionChange={setFirebaseConnected}
              />
            </ConfigSection>
          )}

          <CurrentStatus>
            <StatusTitle>📊 現在の状況</StatusTitle>
            <StatusInfo>
              {selectedMethod === DataSharingMethod.LOCAL_ONLY && (
                <>
                  • データ保存場所: ブラウザのLocalStorage<br/>
                  • 共有範囲: 個人のみ<br/>
                  • 他のユーザーとの共有: なし
                </>
              )}
              {selectedMethod === DataSharingMethod.FIREBASE && (
                <>
                  • データ保存場所: Firebase Firestore + LocalStorage<br/>
                  • 共有範囲: 全ユーザー（リアルタイム同期）<br/>
                  • 接続状態: {firebaseConnected ? '✅ 接続済み' : '❌ 未接続'}
                </>
              )}
              {selectedMethod === DataSharingMethod.GITHUB_ISSUES && (
                <>
                  • データ保存場所: GitHub Issues + LocalStorage<br/>
                  • 共有範囲: 全ユーザー（手動承認）<br/>
                  • リポジトリ: {githubRepo || '未設定'}
                </>
              )}
            </StatusInfo>
          </CurrentStatus>
        </SettingsBody>

        <SettingsFooter>
          <CancelButton onClick={onClose}>
            キャンセル
          </CancelButton>
          <SaveButton onClick={handleSaveSettings}>
            設定を保存
          </SaveButton>
        </SettingsFooter>
      </SettingsContainer>
    </SettingsOverlay>
  )
}

// スタイル定義
const SettingsOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
`

const SettingsContainer = styled.div`
  background: linear-gradient(135deg, #fff0f8 0%, #ffe8f0 100%);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(255, 105, 180, 0.3);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border: 3px solid #ffb6c1;
`

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 2px solid #ffb6c1;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%);
`

const SettingsTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #5a5a5a;
  margin: 0;
`

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 2px solid #fff;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(255, 105, 180, 0.3);
  }
`

const SettingsBody = styled.div`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
`

const Description = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 24px;
`

const MethodsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`

const MethodCard = styled.div<{ $isSelected: boolean }>`
  border: 2px solid ${props => props.$isSelected ? '#ff69b4' : '#e0e0e0'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$isSelected ? 'rgba(255, 105, 180, 0.05)' : 'white'};

  &:hover {
    border-color: #ff69b4;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
  }
`

const MethodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`

const MethodRadio = styled.input`
  width: 18px;
  height: 18px;
`

const MethodName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #5a5a5a;
  margin: 0;
`

const MethodDescription = styled.p`
  color: #666;
  margin: 8px 0 16px 30px;
  font-size: 14px;
`

const ProsCons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
  margin-left: 30px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`

const ProsConsSection = styled.div``

const ProsConsTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #5a5a5a;
`

const ProsConsList = styled.ul`
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: #666;
  
  li {
    margin-bottom: 4px;
  }
`

const SetupInfo = styled.div`
  margin-left: 30px;
  font-size: 13px;
  color: #666;
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 12px;
  border-radius: 6px;
`

const ConfigSection = styled.div`
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`

const ConfigTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #5a5a5a;
  margin: 0 0 12px 0;
`

const ConfigInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 8px;

  &:focus {
    outline: none;
    border-color: #ff69b4;
  }
`

const ConfigNote = styled.p`
  font-size: 12px;
  color: #666;
  margin: 0;
`

const CurrentStatus = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
`

const StatusTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #5a5a5a;
  margin: 0 0 12px 0;
`

const StatusInfo = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`

const SettingsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 2px solid #ffb6c1;
  background: rgba(255, 255, 255, 0.3);
`

const FooterButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`

const CancelButton = styled(FooterButton)`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e0e0;
  color: #666;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: #8a8a8a;
  }
`

const SaveButton = styled(FooterButton)`
  background: #ff69b4;
  border: 1px solid #ff69b4;
  color: white;

  &:hover {
    background: #ff1493;
    border-color: #ff1493;
  }
`