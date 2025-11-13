# Requirements Document

## Introduction

このWebアプリケーションは、シャボン玉のアニメーションが常時実行されているため、長時間表示しているとスマートフォンが熱くなり、バッテリー消費が激しくなる問題があります。特にダイアログやモーダルを操作している間もバックグラウンドでアニメーションが継続されているため、不要な処理負荷がかかっています。この機能は、シンプルなアニメーション制御により、モバイルデバイスでの発熱とバッテリー消費を削減することを目的としています。

## Glossary

- **Application**: Music Bubble Explorerアプリケーション全体
- **Bubble Animation**: シャボン玉の動きを表現するrequestAnimationFrameベースのアニメーション
- **Dialog**: モーダルダイアログ、詳細表示パネル、設定画面など、メインコンテンツの上に表示されるオーバーレイUI要素
- **Idle State**: ユーザーが30秒間操作を行っていない状態
- **User Action**: マウス移動、クリック、タッチ、スクロール、キーボード入力などのユーザー操作

## Requirements

### Requirement 1

**User Story:** モバイルユーザーとして、ダイアログを開いている間はシャボン玉のアニメーションが停止してほしい。そうすることで、デバイスの発熱を抑え、バッテリー消費を削減できる。

#### Acceptance Criteria

1. WHEN Dialog が開かれる, THE Application SHALL Bubble Animation を停止する
2. WHEN Dialog が閉じられる, THE Application SHALL Bubble Animation を再開する
3. WHILE Dialog が表示されている, THE Application SHALL requestAnimationFrameの呼び出しを停止する
4. WHILE Dialog が開いている, THE Application SHALL Dialog内のアニメーションとインタラクションを正常に動作させる

### Requirement 2

**User Story:** モバイルユーザーとして、アプリを長時間放置している間はアニメーションが停止してほしい。そうすることで、デバイスの熱を抑え、バッテリー消費を削減できる。

#### Acceptance Criteria

1. WHEN User が30秒間操作を行わない, THE Application SHALL Idle State に移行する
2. WHEN Application が Idle State に移行する, THE Application SHALL Bubble Animation を停止する
3. WHEN User が User Action を実行する, THE Application SHALL Idle State から復帰する
4. WHEN Idle State から復帰する, THE Application SHALL Bubble Animation を再開する
5. WHILE Dialog が開いている, THE Application SHALL Idle State タイマーをリセットしない

### Requirement 3

**User Story:** ユーザーとして、アニメーションの停止と再開がスムーズに行われてほしい。そうすることで、違和感なくアプリを使用できる。

#### Acceptance Criteria

1. WHEN Bubble Animation が停止する, THE Application SHALL 即座にrequestAnimationFrameをキャンセルする
2. WHEN Bubble Animation が再開する, THE Application SHALL 即座にrequestAnimationFrameを開始する
3. WHEN Bubble Animation が再開する, THE Application SHALL シャボン玉の位置を前回停止時の状態から継続する
