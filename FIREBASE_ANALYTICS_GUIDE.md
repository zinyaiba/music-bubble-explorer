# Firebase Analytics 実装ガイド

## 概要

このアプリケーションでは、Firebase Analyticsを使用してユーザーの行動を追跡しています。
イベント名とパラメータ名は**日本語**で記録されるため、Firebase Analyticsコンソールで直感的に確認できます。

## 実装されているイベント

### 1. 楽曲登録（楽曲登録）

ユーザーが新しい楽曲を登録したとき、または既存の楽曲を更新したときに記録されます。

**イベント名**: `楽曲登録`

**パラメータ**:
- `楽曲名`: 登録された楽曲のタイトル
- `アーティスト`: アーティスト名（カンマ区切り）
- `作曲者`: 作曲者名（カンマ区切り）
- `作詞者`: 作詞者名（カンマ区切り）
- `編曲者`: 編曲者名（カンマ区切り）
- `タグ数`: 登録されたタグの数
- `タグ一覧`: タグ名のリスト（カンマ区切り）
- `カテゴリ`: 発売年代（例: "2024年代"）
- `ユーザー言語`: ユーザーのブラウザ言語設定（例: "ja-JP", "en-US"）
- `タイムゾーン`: ユーザーのタイムゾーン（例: "Asia/Tokyo", "America/New_York"）

**実装場所**: `src/components/SongRegistrationForm.tsx`

**使用例**:
```typescript
analyticsService.logSongRegistration('夜に駆ける', {
  artist: 'YOASOBI',
  composer: 'Ayase',
  lyricist: 'Ayase',
  arranger: 'Ayase',
  tags: ['ポップス', 'アニメ', '人気曲'],
  category: '2019年代',
})
```

### 2. タグ登録（タグ登録）

ユーザーが楽曲にタグを追加したときに記録されます。

**イベント名**: `タグ登録`

**パラメータ**:
- `タグ名`: 登録されたタグの名前
- `関連楽曲数`: このタグが付けられている楽曲の数
- `カテゴリ`: タグのカテゴリ（発売年代など）
- `新規作成`: 新しく作成されたタグかどうか（"はい" / "いいえ"）

**実装場所**: `src/components/TagRegistrationDialog.tsx`

**使用例**:
```typescript
analyticsService.logTagRegistration('バラード', {
  songCount: 15,
  category: '2020年代',
  isNew: false,
})
```

### 3. 楽曲詳細表示（楽曲詳細表示）

ユーザーが楽曲の詳細画面を開いたときに記録されます。

**イベント名**: `楽曲詳細表示`

**パラメータ**:
- `楽曲名`: 表示された楽曲のタイトル
- `アーティスト`: アーティスト名
- `タグ数`: 楽曲に付けられているタグの数

**実装場所**: `src/components/SongDetailView.tsx`

### 4. タグ詳細表示（タグ詳細表示）

ユーザーがタグの詳細画面を開いたときに記録されます。

**イベント名**: `タグ詳細表示`

**パラメータ**:
- `タグ名`: 表示されたタグの名前
- `関連楽曲数`: このタグが付けられている楽曲の数

**実装場所**: `src/components/DetailModal.tsx`

### 5. 人物詳細表示（人物詳細表示）

ユーザーが作詞家・作曲家・編曲家の詳細画面を開いたときに記録されます。

**イベント名**: `人物詳細表示`

**パラメータ**:
- `人物名`: 表示された人物の名前
- `役割`: 人物の役割（"lyricist", "composer", "arranger"）
- `関連楽曲数`: この人物が関わっている楽曲の数

**実装場所**: `src/components/DetailModal.tsx`

### 6. その他のイベント

#### ページ表示（ページ表示）
- `ページ名`: 表示されたページの名前
- `ページタイトル`: ページのタイトル

#### シャボン玉クリック（シャボン玉クリック）
- `種類`: シャボン玉の種類（song, tag, lyricist, composer, arranger）
- `名前`: シャボン玉の名前

#### 検索実行（検索実行）
- `検索種類`: 検索の種類
- `検索キーワード`: 入力された検索キーワード

#### カテゴリフィルタ（カテゴリフィルタ）
- `選択カテゴリ`: 選択されたカテゴリのリスト
- `カテゴリ数`: 選択されたカテゴリの数

#### エラー発生（エラー発生）
- `エラー種類`: エラーの種類
- `エラー内容`: エラーメッセージ

#### セッション開始（セッション開始）
- `タイムスタンプ`: セッション開始時刻

## Firebase Analyticsコンソールでの確認方法

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Analytics」→「イベント」を選択
4. 以下のような日本語イベント名が表示されます：
   - 楽曲登録
   - タグ登録
   - 楽曲詳細表示
   - タグ詳細表示
   - 人物詳細表示
   - ページ表示
   - シャボン玉クリック
   - 検索実行
   - カテゴリフィルタ
   - エラー発生
   - セッション開始

5. 各イベントをクリックすると、パラメータの詳細が確認できます

## 地域別の楽曲登録データを確認する方法

### 方法1: Firebase Analyticsコンソール（推奨・簡単）

1. **Firebase Console** → あなたのプロジェクト → **Analytics** → **イベント**
2. 「楽曲登録」イベントをクリック
3. 画面右上の「ディメンションを追加」をクリック
4. 以下のディメンションを選択：
   - **国**: ユーザーの国を表示
   - **地域**: ユーザーの地域（都道府県レベル）を表示
   - **市区町村**: より詳細な地域情報
5. パラメータで「楽曲名」を選択すると、地域別にどの楽曲が登録されたか確認できます

### 方法2: カスタムレポート作成

1. **Analytics** → **探索**（Explorations）
2. 「空白」テンプレートを選択
3. ディメンションに以下を追加：
   - 国
   - 地域
   - イベント名
   - 楽曲名（カスタムパラメータ）
   - タイムゾーン（カスタムパラメータ）
4. 指標に「イベント数」を追加
5. フィルタで「イベント名 = 楽曲登録」を設定

### 方法3: BigQueryで詳細分析（高度）

より詳細な分析が必要な場合、BigQueryにエクスポートして分析できます：

1. **Firebase Console** → **プロジェクト設定** → **統合** → **BigQuery**
2. 「リンク」をクリックしてBigQueryを有効化
3. BigQueryコンソールで以下のようなSQLクエリを実行：

```sql
-- 地域別・楽曲別の登録数を集計
SELECT
  geo.country AS 国,
  geo.region AS 地域,
  geo.city AS 市区町村,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = '楽曲名') AS 楽曲名,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'アーティスト') AS アーティスト,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'タイムゾーン') AS タイムゾーン,
  COUNT(*) as 登録回数
FROM
  `your-project-id.analytics_XXXXX.events_*`
WHERE
  event_name = '楽曲登録'
  AND _TABLE_SUFFIX BETWEEN '20241201' AND '20241231'
GROUP BY
  国, 地域, 市区町村, 楽曲名, アーティスト, タイムゾーン
ORDER BY
  登録回数 DESC
LIMIT 100;
```

```sql
-- 国別の人気楽曲トップ10
SELECT
  geo.country AS 国,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = '楽曲名') AS 楽曲名,
  (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'アーティスト') AS アーティスト,
  COUNT(*) as 登録回数
FROM
  `your-project-id.analytics_XXXXX.events_*`
WHERE
  event_name = '楽曲登録'
  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)) 
  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
GROUP BY
  国, 楽曲名, アーティスト
ORDER BY
  国, 登録回数 DESC
LIMIT 10;
```

## カスタムレポートの作成

Firebase Analyticsコンソールで以下のようなカスタムレポートを作成できます：

### 人気楽曲ランキング
- イベント: `楽曲登録`
- ディメンション: `楽曲名`
- 指標: イベント数

### 人気タグランキング
- イベント: `タグ登録`
- ディメンション: `タグ名`
- 指標: イベント数

### アーティスト別登録数
- イベント: `楽曲登録`
- ディメンション: `アーティスト`
- 指標: イベント数

### 年代別楽曲登録数
- イベント: `楽曲登録`
- ディメンション: `カテゴリ`
- 指標: イベント数

## 注意事項

1. **日本語イベント名の制限**: Firebase Analyticsは日本語のイベント名とパラメータ名をサポートしていますが、一部の機能（BigQueryエクスポートなど）では英語名の方が扱いやすい場合があります。

2. **データの反映**: イベントデータは通常24時間以内にコンソールに反映されます。リアルタイムデータは「リアルタイム」タブで確認できます。

3. **プライバシー**: 個人を特定できる情報（PII）は記録しないようにしてください。楽曲名やタグ名は一般的な情報として扱われます。

4. **データ保持期間**: Firebase Analyticsのデータ保持期間はプロジェクト設定で変更できます（デフォルトは2ヶ月）。

## サービスクラスの使用方法

```typescript
import { AnalyticsService } from '@/services/analyticsService'

// シングルトンインスタンスを取得
const analyticsService = AnalyticsService.getInstance()

// 楽曲登録を記録
analyticsService.logSongRegistration('楽曲名', {
  artist: 'アーティスト名',
  composer: '作曲者名',
  lyricist: '作詞者名',
  arranger: '編曲者名',
  tags: ['タグ1', 'タグ2'],
  category: '2024年代',
})

// タグ登録を記録
analyticsService.logTagRegistration('タグ名', {
  songCount: 10,
  category: 'ジャンル',
  isNew: true,
})

// カスタムイベントを記録
analyticsService.logCustomEvent('カスタムイベント名', {
  パラメータ1: '値1',
  パラメータ2: '値2',
})
```

## トラブルシューティング

### イベントが記録されない場合

1. Firebase設定が正しいか確認
   - `.env.local`ファイルにFirebase設定が正しく記載されているか
   - `src/config/firebase.ts`でFirebaseが正しく初期化されているか

2. ブラウザのコンソールでエラーを確認
   - `📊 Firebase Analytics初期化完了` というログが表示されているか

3. Firebase Analyticsが有効になっているか確認
   - Firebase Consoleでプロジェクトの設定を確認

### イベント名が文字化けする場合

Firebase Analyticsは日本語をサポートしていますが、一部のブラウザや環境で問題が発生する可能性があります。その場合は、`analyticsService.ts`のイベント名を英語に変更してください。

## まとめ

このアプリケーションでは、ユーザーの行動を詳細に追跡し、どの楽曲やタグが人気なのか、どのような使い方をされているのかを分析できます。Firebase Analyticsコンソールで日本語のイベント名とパラメータを確認することで、直感的にデータを理解できます。
