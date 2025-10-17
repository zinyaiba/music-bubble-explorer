// ブラウザのコンソールで実行するデバッグスクリプト
// 現在のシャボン玉数と設定を確認

console.log('🫧 シャボン玉デバッグ情報:');

// 現在の設定を確認
if (window.getBubbleStats) {
  const stats = window.getBubbleStats();
  console.log('📊 現在の統計:', stats);
}

// DOM上のシャボン玉要素を数える
const bubbleElements = document.querySelectorAll('.bubble, [class*="bubble"]');
console.log('🎯 DOM上のシャボン玉要素数:', bubbleElements.length);

// Canvas上の描画を確認（可能であれば）
const canvas = document.querySelector('canvas');
if (canvas) {
  console.log('🎨 Canvas要素が見つかりました:', canvas.width + 'x' + canvas.height);
}

// 設定ファイルの値を確認
console.log('⚙️ 設定確認のため、以下のコマンドを実行してください:');
console.log('updateBubbleSettings({ maxBubbles: 5 })');
console.log('getBubbleStats()');