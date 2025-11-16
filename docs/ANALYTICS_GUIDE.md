# Firebase Analytics 使用ガイド

## 概要

このアプリケーションはFirebase Analyticsを使用してユーザーの使用状況を追跡しています。
最大100名程度のユーザーを想定した設計になっています。

## 追跡されるイベント

### 1. セッション管理
- **session_start**: アプリ起動時
  - タイムスタンプ

### 2. ページビュー
- **page_view**: 画面遷移時
  - page_name: 画面名（main, registration, management, tag-list, tag-registration）
  - page_title: 画面タイトル

### 3. シャボン玉インタラクション
- **bubble_click**: シャボン玉クリック時
  - bubble_type: シャボン玉の種類（song, lyricist, composer, arranger, tag）
  - bubble_name: シャボン玉の名前

### 4. 詳細表示
- **song_detail_view**: 楽曲詳細表示時
  - song_title: 楽曲タイトル

- **tag_detail_view**: タグ詳細表示時
  - tag_name: タグ名
  - related_song_count: 関連楽曲数

- **person_detail_view**: 人物詳細表示時
  - person_name: 人物名
  - person_type: 役割（lyricist, composer, arranger）
  - related_song_count: 関連楽曲数

### 5. データ登録
- **song_registration**: 楽曲登録時
  - song_title: 楽曲タイトル
  - has_tag: タグが設定されているか

- **tag_registration**: タグ登録時
  - tag_name: タグ名
  - song_count: 関連楽曲数

### 6. フィルタリング
- **category_filter**: カテゴリフィルタ使用時
  - selected_categories: 選択されたカテゴリ（カンマ区切り）
  - category_count: 選択数

- **search**: 検索・フィルタリング使用時
  - search_type: 検索タイプ
  - search_query: 検索クエリ（オプション）

### 7. エラー
- **error**: エラー発生時
  - error_type: エラータイプ
  - error_message: エラーメッセージ

## ユーザープロパティ

- **device_type**: デバイスタイプ（mobile, tablet, desktop）

## Firebase Consoleでの確認方法

### 1. リアルタイムデータ
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「music-bubble-explorer」を選択
3. 左メニューから「Analytics」→「ダッシュボード」を選択
4. リアルタイムのアクティブユーザー数を確認

### 2. イベント分析
1. 「Analytics」→「イベント」を選択
2. 各イベントの発生回数、ユニークユーザー数を確認
3. 特定のイベントをクリックして詳細を表示

### 3. ユーザー属性
1. 「Analytics」→「ユーザー属性」を選択
2. デバイスタイプ別の分布を確認

### 4. カスタムレポート
1. 「Analytics」→「カスタムレポート」を選択
2. 独自の分析レポートを作成

## よく使う分析例

### アクティブユーザー数の確認
- ダッシュボードで「アクティブユーザー」を確認
- 日次、週次、月次のアクティブユーザー数を表示

### 人気機能の分析
- イベント画面で各イベントの発生回数を比較
- bubble_click、song_detail_view、tag_detail_viewなどの頻度を確認

### ユーザーエンゲージメント
- 平均セッション時間
- セッションあたりのイベント数
- リテンション率（継続率）

### デバイス別の使用状況
- ユーザー属性でdevice_typeを確認
- モバイル vs デスクトップの利用比率

## プライバシーとデータ保護

- 個人を特定できる情報（PII）は収集していません
- 楽曲タイトルやタグ名などのコンテンツ情報のみを収集
- Firebase Analyticsは自動的にIPアドレスを匿名化します
- データは暗号化されてGoogleのサーバーに保存されます

## トラブルシューティング

### Analyticsが動作しない場合

1. **Firebase設定の確認**
   - `src/config/firebase.ts`でFirebaseが正しく初期化されているか確認
   - ブラウザのコンソールで「📊 Firebase Analytics初期化完了」メッセージを確認

2. **ネットワーク接続**
   - インターネット接続を確認
   - ファイアウォールやアドブロッカーがFirebaseをブロックしていないか確認

3. **データの反映時間**
   - リアルタイムデータは数秒で反映
   - 集計データは最大24時間かかる場合があります

## 開発者向け情報

### 新しいイベントの追加方法

1. `src/services/analyticsService.ts`に新しいメソッドを追加:

```typescript
public logCustomEvent(eventName: string, params?: Record<string, any>) {
  if (!this.isEnabled || !this.analytics) return
  
  try {
    logEvent(this.analytics, eventName, params)
  } catch (error) {
    console.warn('📊 イベントログエラー:', error)
  }
}
```

2. コンポーネントで使用:

```typescript
const analyticsService = AnalyticsService.getInstance()
analyticsService.logCustomEvent('my_event', {
  param1: 'value1',
  param2: 123
})
```

### デバッグモード

開発環境では、コンソールにAnalyticsのログが表示されます:
- イベント送信時: `📊 Event logged: event_name`
- エラー時: `📊 イベントログエラー: error_message`

## 参考リンク

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Firebase Console](https://console.firebase.google.com/)
- [Analytics Events Reference](https://firebase.google.com/docs/reference/js/analytics)
