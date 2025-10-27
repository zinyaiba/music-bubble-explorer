import React from 'react'

interface CollisionDetectionSettingsProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  bubbleCount: number
  performanceMode: boolean
}

/**
 * シャボン玉の重なり防止機能の設定コンポーネント
 */
export const CollisionDetectionSettings: React.FC<
  CollisionDetectionSettingsProps
> = ({ enabled, onToggle, bubbleCount, performanceMode }) => {
  const isRecommended = bubbleCount <= 30 && !performanceMode
  const performanceWarning = bubbleCount > 50

  return (
    <div className="collision-detection-settings">
      <div className="setting-item">
        <label className="setting-label">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => onToggle(e.target.checked)}
            className="setting-checkbox"
          />
          <span className="setting-text">シャボン玉の重なりを防ぐ</span>
        </label>

        <div className="setting-description">
          <p className="description-text">
            シャボン玉同士が重ならないように自動で位置を調整します
          </p>

          {/* 推奨状態の表示 */}
          {isRecommended && (
            <div className="recommendation recommended">
              ✅ 現在の設定では軽快に動作します（{bubbleCount}個のシャボン玉）
            </div>
          )}

          {/* パフォーマンス警告 */}
          {performanceWarning && (
            <div className="recommendation warning">
              ⚠️ シャボン玉が多いため処理が重くなる可能性があります（
              {bubbleCount}個）
            </div>
          )}

          {/* パフォーマンスモードの説明 */}
          {performanceMode && (
            <div className="recommendation info">
              ℹ️
              パフォーマンスモードでは30個以上のシャボン玉がある場合、この機能は自動的に無効になります
            </div>
          )}
        </div>
      </div>

      <style>{`
        .collision-detection-settings {
          padding: 16px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .setting-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #8B5CF6;
        }

        .setting-text {
          font-size: 16px;
          color: rgba(0, 0, 0, 0.8);
        }

        .setting-description {
          margin-left: 26px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .description-text {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
          margin: 0;
        }

        .recommendation {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .recommendation.recommended {
          background: rgba(34, 197, 94, 0.1);
          color: #059669;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .recommendation.warning {
          background: rgba(245, 158, 11, 0.1);
          color: #D97706;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .recommendation.info {
          background: rgba(59, 130, 246, 0.1);
          color: #2563EB;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  )
}
