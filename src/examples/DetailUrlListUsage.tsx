/**
 * DetailUrlList コンポーネントの使用例
 *
 * このファイルは、DetailUrlListコンポーネントの使い方を示すサンプルです。
 * SongRegistrationFormに統合する際の参考にしてください。
 */

import React, { useState } from 'react'
import { DetailUrlList } from '@/components/DetailUrlList'

export const DetailUrlListUsageExample: React.FC = () => {
  const [detailPageUrls, setDetailPageUrls] = useState<string[]>([])

  const handleUrlsChange = (newUrls: string[]) => {
    console.log('URLs changed:', newUrls)
    setDetailPageUrls(newUrls)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 空のURLをフィルタリング
    const validUrls = detailPageUrls.filter(url => url.trim() !== '')

    console.log('Submitting URLs:', validUrls)
    // ここでFirebaseに保存する処理を実行
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>DetailUrlList 使用例</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="detail-urls">楽曲詳細ページURL</label>
          <DetailUrlList
            urls={detailPageUrls}
            onChange={handleUrlsChange}
            maxUrls={10}
            disabled={false}
          />
          <div className="help-text">
            楽曲に関する外部Webページのリンクを追加できます（最大10個）
          </div>
        </div>

        <button type="submit" style={{ marginTop: '20px' }}>
          保存
        </button>
      </form>

      <div
        style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3>現在のURL一覧:</h3>
        <pre>{JSON.stringify(detailPageUrls, null, 2)}</pre>
      </div>
    </div>
  )
}

/**
 * SongRegistrationFormへの統合例
 *
 * 1. FormDataインターフェースにdetailPageUrlsを追加:
 *
 * interface SongFormData {
 *   // ... 既存のフィールド
 *   detailPageUrls: string[]
 * }
 *
 * 2. stateの初期化:
 *
 * const [formData, setFormData] = useState<SongFormData>({
 *   // ... 既存のフィールド
 *   detailPageUrls: []
 * })
 *
 * 3. 編集モード時の初期化:
 *
 * useEffect(() => {
 *   if (editingSong) {
 *     setFormData({
 *       // ... 既存のフィールド
 *       detailPageUrls: editingSong.detailPageUrls || []
 *     })
 *   }
 * }, [editingSong])
 *
 * 4. フォームにコンポーネントを追加:
 *
 * <div className="form-group">
 *   <label htmlFor="detail-urls">楽曲詳細ページURL</label>
 *   <DetailUrlList
 *     urls={formData.detailPageUrls}
 *     onChange={(urls) => setFormData(prev => ({ ...prev, detailPageUrls: urls }))}
 *     maxUrls={10}
 *     disabled={isSubmitting}
 *   />
 *   <div className="help-text">
 *     楽曲に関する外部Webページのリンクを追加できます（最大10個）
 *   </div>
 * </div>
 *
 * 5. 保存時の処理:
 *
 * const handleSubmit = async (e: React.FormEvent) => {
 *   e.preventDefault()
 *
 *   // 空のURLをフィルタリング
 *   const validUrls = formData.detailPageUrls.filter(url => url.trim() !== '')
 *
 *   const songToSave: Song = {
 *     // ... 既存のフィールド
 *     detailPageUrls: validUrls
 *   }
 *
 *   await DataManager.saveSong(songToSave)
 * }
 */
