# デザイン文書

## 概要

本文書は、UI改善とナビゲーション機能強化のための技術的なデザインアプローチを定義します。主な改善点は、モバイルでのダイアログヘッダー表示問題の修正、シャボン玉詳細からの継続的な探索機能、楽曲管理機能の統合、楽曲一覧メニューの準備です。

## アーキテクチャ

### 全体構成

```
アプリケーション
├── ダイアログシステム
│   ├── モバイル対応ダイアログコンポーネント
│   ├── シャボン玉詳細ダイアログ
│   └── タグ登録ダイアログ（既存）
├── ナビゲーションシステム
│   ├── 下部メニューコンポーネント
│   └── 画面遷移管理
└── 楽曲管理システム
    ├── 統合楽曲管理インターフェース
    ├── 楽曲登録機能（既存）
    └── 楽曲編集機能（既存）
```

## コンポーネントとインターフェース

### 1. モバイル対応ダイアログコンポーネント

**目的**: モバイルデバイスでのダイアログヘッダー表示問題を解決

**アプローチ**:
- ヘッダーコンテンツをダイアログボディ内に統合
- シンプルなCSS調整による実装
- 既存のタグ登録ダイアログの実装は変更しない

**実装方針**:
```javascript
// モバイル検出とヘッダー統合ロジック
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// ダイアログタイプ別の処理
const DialogComponent = ({ type, title, children }) => {
  const shouldIntegrateHeader = isMobile() && type !== 'tag-registration';
  
  return (
    <Dialog>
      {!shouldIntegrateHeader && <DialogHeader>{title}</DialogHeader>}
      <DialogBody>
        {shouldIntegrateHeader && <IntegratedHeader>{title}</IntegratedHeader>}
        {children}
      </DialogBody>
    </Dialog>
  );
};
```

### 2. シャボン玉詳細ダイアログの拡張

**目的**: シャボン玉詳細から継続的な探索を可能にする

**機能**:
- 楽曲情報（タイトル、作詞、作曲、編曲）のクリック可能化
- タグクリック時のタグ詳細画面への遷移
- ダイアログの入れ子表示対応

**実装方針**:
```javascript
// シャボン玉詳細ダイアログコンポーネント
const BubbleDetailDialog = ({ bubbleData, onClose }) => {
  const handleSongClick = (songId) => {
    // 新しいシャボン玉詳細ダイアログを開く
    openBubbleDetailDialog(songId);
  };
  
  const handleTagClick = (tagId) => {
    // タグ詳細画面に遷移
    navigateToTagDetail(tagId);
    onClose();
  };
  
  return (
    <Dialog>
      <DialogContent>
        <ClickableSongInfo onClick={handleSongClick} />
        <ClickableTagList onClick={handleTagClick} />
      </DialogContent>
    </Dialog>
  );
};
```

### 3. 統合楽曲管理システム

**目的**: 楽曲登録と編集機能を一つのインターフェースに統合

**設計原則**:
- 既存機能の完全な保持
- ガラスモーフィズムテーマの継承
- 直感的なユーザーインターフェース

**実装方針**:
```javascript
// 統合楽曲管理コンポーネント
const SongManagementDialog = () => {
  const [mode, setMode] = useState('list'); // 'list', 'register', 'edit'
  const [selectedSong, setSelectedSong] = useState(null);
  
  const renderContent = () => {
    switch(mode) {
      case 'register':
        return <SongRegistrationForm onComplete={() => setMode('list')} />;
      case 'edit':
        return <SongEditForm song={selectedSong} onComplete={() => setMode('list')} />;
      default:
        return <SongListView onRegister={() => setMode('register')} onEdit={(song) => {
          setSelectedSong(song);
          setMode('edit');
        }} />;
    }
  };
  
  return (
    <GlassMorphismDialog>
      {renderContent()}
    </GlassMorphismDialog>
  );
};
```

### 4. ナビゲーションメニューの更新

**目的**: メニュー構成の変更と楽曲一覧ボタンの準備

**変更内容**:
- 楽曲登録・編集ボタンを楽曲管理ボタンに統合
- 楽曲一覧ボタンの追加（非活性状態）
- ボタン順序の調整

**実装方針**:
```javascript
// ナビゲーションメニューコンポーネント
const NavigationMenu = () => {
  const menuItems = [
    { id: 'tag-register', label: 'タグ登録', icon: 'tag-plus', active: true },
    { id: 'tag-list', label: 'タグ一覧', icon: 'tag-list', active: true },
    { id: 'song-list', label: '楽曲一覧', icon: 'music-list', active: false },
    { id: 'song-management', label: '楽曲管理', icon: 'music-edit', active: true }
  ];
  
  return (
    <MenuContainer>
      {menuItems.map(item => (
        <MenuButton 
          key={item.id}
          disabled={!item.active}
          onClick={() => item.active && handleMenuClick(item.id)}
        >
          {item.label}
        </MenuButton>
      ))}
    </MenuContainer>
  );
};
```

## データモデル

### ダイアログ状態管理

```javascript
// ダイアログ状態の型定義
interface DialogState {
  type: 'bubble-detail' | 'tag-registration' | 'song-management';
  isOpen: boolean;
  data?: any;
  parentDialog?: DialogState;
}

// ダイアログスタック管理
class DialogManager {
  private dialogStack: DialogState[] = [];
  
  openDialog(type: string, data?: any) {
    const newDialog: DialogState = {
      type,
      isOpen: true,
      data,
      parentDialog: this.getCurrentDialog()
    };
    this.dialogStack.push(newDialog);
  }
  
  closeDialog() {
    this.dialogStack.pop();
  }
  
  getCurrentDialog(): DialogState | null {
    return this.dialogStack[this.dialogStack.length - 1] || null;
  }
}
```

### 楽曲管理データ構造

```javascript
// 楽曲データの型定義
interface Song {
  id: string;
  title: string;
  lyrics?: string;
  composer?: string;
  arranger?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 楽曲管理操作
interface SongManagementOperations {
  createSong(songData: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<Song>;
  updateSong(id: string, updates: Partial<Song>): Promise<Song>;
  deleteSong(id: string): Promise<void>;
  getSongs(): Promise<Song[]>;
  getSongById(id: string): Promise<Song | null>;
}
```

## エラーハンドリング

### ダイアログ表示エラー

```javascript
// モバイルダイアログエラーハンドリング
const handleDialogError = (error: Error, dialogType: string) => {
  console.error(`Dialog error for ${dialogType}:`, error);
  
  // フォールバック表示
  if (isMobile() && dialogType !== 'tag-registration') {
    // ヘッダー統合モードで再試行
    return renderDialogWithIntegratedHeader();
  }
  
  // 通常のエラー表示
  showErrorMessage('ダイアログの表示に問題が発生しました');
};
```

### ナビゲーションエラー

```javascript
// 画面遷移エラーハンドリング
const handleNavigationError = (error: Error, targetScreen: string) => {
  console.error(`Navigation error to ${targetScreen}:`, error);
  
  // ユーザーフレンドリーなエラーメッセージ
  showErrorMessage('画面の遷移に失敗しました。もう一度お試しください。');
  
  // 必要に応じてホーム画面に戻る
  if (error.name === 'CriticalNavigationError') {
    navigateToHome();
  }
};
```

## テスト戦略

### 1. モバイルダイアログテスト

```javascript
// モバイル表示テスト
describe('Mobile Dialog Display', () => {
  beforeEach(() => {
    // モバイルユーザーエージェントを模擬
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true
    });
  });
  
  test('should integrate header into body on mobile', () => {
    const dialog = render(<BubbleDetailDialog />);
    expect(dialog.getByTestId('integrated-header')).toBeInTheDocument();
  });
  
  test('should not affect tag registration dialog', () => {
    const dialog = render(<TagRegistrationDialog />);
    expect(dialog.getByTestId('traditional-header')).toBeInTheDocument();
  });
});
```

### 2. ナビゲーション機能テスト

```javascript
// ナビゲーションテスト
describe('Navigation Menu', () => {
  test('should show correct button order', () => {
    const menu = render(<NavigationMenu />);
    const buttons = menu.getAllByRole('button');
    
    expect(buttons[0]).toHaveTextContent('タグ登録');
    expect(buttons[1]).toHaveTextContent('タグ一覧');
    expect(buttons[2]).toHaveTextContent('楽曲一覧');
    expect(buttons[3]).toHaveTextContent('楽曲管理');
  });
  
  test('should disable song list button', () => {
    const menu = render(<NavigationMenu />);
    const songListButton = menu.getByText('楽曲一覧');
    
    expect(songListButton).toBeDisabled();
  });
});
```

### 3. 楽曲管理統合テスト

```javascript
// 楽曲管理テスト
describe('Song Management Integration', () => {
  test('should provide both registration and editing functionality', () => {
    const management = render(<SongManagementDialog />);
    
    // 登録機能の確認
    fireEvent.click(management.getByText('新規登録'));
    expect(management.getByTestId('song-registration-form')).toBeInTheDocument();
    
    // 編集機能の確認
    fireEvent.click(management.getByText('編集'));
    expect(management.getByTestId('song-edit-form')).toBeInTheDocument();
  });
});
```

## パフォーマンス考慮事項

### 1. ダイアログレンダリング最適化

- ダイアログの遅延読み込み
- 不要なダイアログの自動クリーンアップ
- メモ化による再レンダリング防止

### 2. モバイル最適化

- タッチイベントの最適化
- スクロール性能の向上
- メモリ使用量の監視

### 3. 楽曲データ管理

- 楽曲リストの仮想化
- 検索機能の最適化
- キャッシュ戦略の実装

## セキュリティ考慮事項

### 1. データ検証

- 楽曲データの入力検証
- XSS攻撃の防止
- SQLインジェクション対策

### 2. 認証・認可

- 楽曲編集権限の確認
- セッション管理
- CSRF対策

## 実装優先順位

1. **高優先度**: モバイルダイアログヘッダー修正
2. **中優先度**: ナビゲーションメニュー更新
3. **中優先度**: 楽曲管理統合
4. **低優先度**: シャボン玉詳細探索機能拡張

この設計により、要件で定義されたすべての機能を効率的かつ保守性の高い方法で実装できます。