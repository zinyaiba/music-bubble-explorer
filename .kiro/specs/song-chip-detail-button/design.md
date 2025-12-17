# Design Document: Song Chip Detail Button

## Overview

DetailModalにおいて、タグや人物のシャボン玉をタップした際に表示される楽曲チップに、楽曲詳細画面（SongDetailView）への遷移ボタンを追加する機能を実装する。

現在の実装では、楽曲チップ全体をタップすると`onSongClick`が呼ばれ、楽曲のシャボン玉に遷移する動作となっている。本機能では、チップの右端に明示的な遷移ボタンを追加し、そのボタンをタップすることで楽曲詳細画面（SongDetailView）に直接遷移できるようにする。

## Architecture

### コンポーネント構成

```
DetailModal
├── StandardLayout (既存)
└── detail-modal-content
    ├── tag-details / person-details
    │   └── related-list
    │       └── related-item (楽曲チップ)
    │           ├── song-info (既存)
    │           └── SongDetailButton (新規) ← 追加
    └── SongDetailView (条件付きレンダリング)
```

### 状態管理

DetailModalコンポーネントに以下の状態を追加：
- `selectedSongForDetail`: 詳細表示する楽曲のID（null時は非表示）

## Components and Interfaces

### SongDetailButton コンポーネント（新規）

楽曲チップの右端に配置する遷移ボタンコンポーネント。

```typescript
interface SongDetailButtonProps {
  songId: string
  songTitle: string
  onClick: (songId: string) => void
}
```

**責務:**
- 視覚的に識別可能なアイコンの表示
- クリック/タップイベントの処理（イベント伝播の停止を含む）
- キーボードアクセシビリティの提供
- アクセシブルラベルの提供

### DetailModal コンポーネント（既存・修正）

**追加するProps:**
- `onSongDetailClick?: (songId: string) => void` - 楽曲詳細画面への遷移コールバック

**追加する状態:**
- `selectedSongForDetail: string | null` - 詳細表示する楽曲のID

**追加するハンドラ:**
- `handleSongDetailClick(songId: string)` - 遷移ボタンクリック時の処理

## Data Models

既存のデータモデルに変更なし。RelatedData型を使用して楽曲情報を取得する。

```typescript
// 既存のRelatedData型（変更なし）
interface RelatedData {
  id: string
  name: string
  type: 'song' | 'person' | 'tag'
  role?: 'lyricist' | 'composer' | 'arranger' | 'tag'
  details?: Song | Person | Tag
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

分析した受け入れ基準から、以下のプロパティを特定：
- 1.1と3.3は両方とも「楽曲チップに遷移ボタンが存在し、適切な属性を持つ」ことを検証するため、1つのプロパティに統合可能
- 1.2, 2.1, 2.2, 3.2はイベント処理に関する具体的なテストケースであり、exampleテストとして実装

### Properties

**Property 1: 楽曲チップには遷移ボタンとアクセシブルラベルが存在する**

*For any* タグまたは人物タイプのシャボン玉が選択された場合、表示される各楽曲チップには遷移ボタンが含まれ、そのボタンには「楽曲詳細を表示」という意味のaria-label属性が設定されている

**Validates: Requirements 1.1, 3.3**

## Error Handling

### イベント処理エラー
- 遷移ボタンのクリックイベントで`stopPropagation()`を呼び出し、親要素へのイベント伝播を防止
- コールバック関数が未定義の場合は何も実行しない（サイレントフェイル）

### 楽曲データ不在
- 楽曲IDに対応するデータが存在しない場合、SongDetailViewがエラーメッセージを表示（既存の動作）

## Testing Strategy

### Property-Based Testing

**使用ライブラリ:** fast-check

Property-based testingを使用して、様々な入力パターンに対してプロパティが成立することを検証する。各property-based testは最低100回のイテレーションを実行する。

### Unit Tests

以下の具体的なケースをユニットテストで検証：

1. **遷移ボタンクリック時のコールバック呼び出し** (Requirement 1.2)
   - 遷移ボタンをクリックした際に`onSongDetailClick`が正しい引数で呼ばれることを検証

2. **イベント伝播の停止** (Requirement 2.2)
   - 遷移ボタンクリック時に親要素のクリックハンドラが呼ばれないことを検証

3. **チップ本体クリック時の既存動作維持** (Requirement 2.1)
   - 遷移ボタン以外の領域をクリックした際に`onSongClick`が呼ばれることを検証

4. **キーボード操作** (Requirement 3.2)
   - EnterキーとSpaceキーで遷移ボタンが動作することを検証

### Test Annotation Format

各property-based testには以下の形式でコメントを付与：
```typescript
// **Feature: song-chip-detail-button, Property 1: 楽曲チップには遷移ボタンとアクセシブルラベルが存在する**
```
