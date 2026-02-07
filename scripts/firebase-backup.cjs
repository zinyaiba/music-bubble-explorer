/**
 * Firebaseバックアップスクリプト
 * Firestoreの全データをJSON形式でエクスポート
 * 
 * 使い方:
 *   node scripts/firebase-backup.cjs
 *   node scripts/firebase-backup.cjs --output backups/custom-name.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const customOutput = outputIndex !== -1 ? args[outputIndex + 1] : null;

// 最新のバックアップファイルを取得
function getLatestBackupFile(backupDir) {
  if (!fs.existsSync(backupDir)) {
    return null;
  }
  
  const files = fs.readdirSync(backupDir)
    .filter(f => f.startsWith('firebase-backup-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  return files.length > 0 ? path.join(backupDir, files[0]) : null;
}

// 前回のバックアップを読み込み
function loadPreviousBackup(backupDir) {
  const latestFile = getLatestBackupFile(backupDir);
  if (!latestFile) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(latestFile, 'utf8');
    return { data: JSON.parse(content), file: latestFile };
  } catch (error) {
    console.warn('⚠️ 前回のバックアップの読み込みに失敗:', error.message);
    return null;
  }
}

// 差分を計算
function calculateDiff(previousBackup, currentBackup) {
  const diff = {
    added: [],
    updated: [],
    deleted: []
  };
  
  if (!previousBackup) {
    return null; // 前回のバックアップがない場合は差分なし
  }
  
  for (const collectionName of Object.keys(currentBackup.collections)) {
    const prevDocs = previousBackup.collections[collectionName] || [];
    const currDocs = currentBackup.collections[collectionName] || [];
    
    const prevMap = new Map(prevDocs.map(d => [d.id, d]));
    const currMap = new Map(currDocs.map(d => [d.id, d]));
    
    // 追加・更新されたドキュメントを検出
    for (const [id, currDoc] of currMap) {
      const prevDoc = prevMap.get(id);
      if (!prevDoc) {
        diff.added.push({ collection: collectionName, id, data: currDoc.data });
      } else if (JSON.stringify(prevDoc.data) !== JSON.stringify(currDoc.data)) {
        diff.updated.push({ 
          collection: collectionName, 
          id, 
          data: currDoc.data,
          changes: getFieldChanges(prevDoc.data, currDoc.data)
        });
      }
    }
    
    // 削除されたドキュメントを検出
    for (const [id, prevDoc] of prevMap) {
      if (!currMap.has(id)) {
        diff.deleted.push({ collection: collectionName, id, data: prevDoc.data });
      }
    }
  }
  
  return diff;
}

// フィールドの変更を取得
function getFieldChanges(prevData, currData) {
  const changes = [];
  const allKeys = new Set([...Object.keys(prevData), ...Object.keys(currData)]);
  
  for (const key of allKeys) {
    const prevVal = JSON.stringify(prevData[key]);
    const currVal = JSON.stringify(currData[key]);
    
    if (prevVal !== currVal) {
      changes.push({
        field: key,
        from: prevData[key],
        to: currData[key]
      });
    }
  }
  
  return changes;
}

// 差分を表示
function displayDiff(diff, previousFile) {
  if (!diff) {
    console.log('\n📋 差分情報: 前回のバックアップがないため、差分は表示できません');
    return;
  }
  
  const hasChanges = diff.added.length > 0 || diff.updated.length > 0 || diff.deleted.length > 0;
  
  console.log('\n' + '═'.repeat(60));
  console.log('📋 前回のバックアップとの差分');
  console.log('   比較元: ' + path.basename(previousFile));
  console.log('═'.repeat(60));
  
  if (!hasChanges) {
    console.log('\n✅ 変更なし - 前回のバックアップと同じ内容です');
    return;
  }
  
  // 追加されたドキュメント
  if (diff.added.length > 0) {
    console.log(`\n🆕 追加 (${diff.added.length}件)`);
    console.log('─'.repeat(40));
    for (const item of diff.added) {
      const title = item.data.title || item.id;
      console.log(`   + [${item.collection}] ${title}`);
      if (item.data.artists) {
        console.log(`     アーティスト: ${item.data.artists.join(', ')}`);
      }
      if (item.data.venueName) {
        console.log(`     会場: ${item.data.venueName}`);
      }
      if (item.data.tourLocation) {
        console.log(`     公演地: ${item.data.tourLocation}`);
      }
    }
  }
  
  // 更新されたドキュメント
  if (diff.updated.length > 0) {
    console.log(`\n📝 更新 (${diff.updated.length}件)`);
    console.log('─'.repeat(40));
    for (const item of diff.updated) {
      const title = item.data.title || item.id;
      console.log(`   ~ [${item.collection}] ${title}`);
      for (const change of item.changes) {
        if (change.field === 'updatedAt') continue; // updatedAtは省略
        const formatted = formatChange(change);
        if (formatted) {
          console.log(`     ${formatted}`);
        }
      }
    }
  }
  
  // 削除されたドキュメント
  if (diff.deleted.length > 0) {
    console.log(`\n🗑️  削除 (${diff.deleted.length}件)`);
    console.log('─'.repeat(40));
    for (const item of diff.deleted) {
      const title = item.data.title || item.id;
      console.log(`   - [${item.collection}] ${title}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 サマリー: +${diff.added.length} 追加 / ~${diff.updated.length} 更新 / -${diff.deleted.length} 削除`);
  console.log('═'.repeat(60));
}

// 値を表示用にフォーマット
function formatValue(value) {
  if (value === undefined) return '(なし)';
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `[${value.join(', ')}]`;
  }
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...';
  }
  return String(value);
}

// 配列の差分を取得（追加・削除のみ）
function getArrayDiff(from, to) {
  const fromSet = new Set(from || []);
  const toSet = new Set(to || []);
  
  const added = [...toSet].filter(x => !fromSet.has(x));
  const removed = [...fromSet].filter(x => !toSet.has(x));
  
  return { added, removed };
}

// 変更内容をフォーマット
function formatChange(change) {
  // tagsフィールドは追加・削除のみ表示
  if (change.field === 'tags') {
    const diff = getArrayDiff(change.from, change.to);
    const parts = [];
    if (diff.added.length > 0) {
      parts.push(`+[${diff.added.join(', ')}]`);
    }
    if (diff.removed.length > 0) {
      parts.push(`-[${diff.removed.join(', ')}]`);
    }
    return parts.length > 0 ? `tags: ${parts.join(' ')}` : null;
  }
  
  // その他のフィールドは従来通り
  const fromStr = formatValue(change.from);
  const toStr = formatValue(change.to);
  return `${change.field}: ${fromStr} → ${toStr}`;
}

// Firebase Admin SDK初期化
function initializeFirebase() {
  try {
    // サービスアカウントキーのパスを環境変数から取得
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(__dirname, '..', 'firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ サービスアカウントキーが見つかりません');
      console.error('   以下のいずれかの方法で設定してください:');
      console.error('   1. firebase-service-account.json をプロジェクトルートに配置');
      console.error('   2. 環境変数 FIREBASE_SERVICE_ACCOUNT_KEY にパスを設定');
      console.error('');
      console.error('   サービスアカウントキーの取得方法:');
      console.error('   1. Firebase Console → プロジェクト設定 → サービスアカウント');
      console.error('   2. 「新しい秘密鍵の生成」をクリック');
      console.error('   3. ダウンロードしたJSONファイルを上記の場所に配置');
      process.exit(1);
    }

    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin SDK初期化完了');
    return admin.firestore();
  } catch (error) {
    console.error('❌ Firebase初期化エラー:', error.message);
    process.exit(1);
  }
}

// Firestoreデータをバックアップ
async function backupFirestore(db) {
  try {
    console.log('🔄 バックアップ開始...');
    
    const collections = ['songs', 'lives']; // バックアップ対象のコレクション
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      collections: {}
    };
    
    for (const collectionName of collections) {
      console.log(`📦 コレクション "${collectionName}" を取得中...`);
      
      const snapshot = await db.collection(collectionName).get();
      const documents = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Timestampを文字列に変換
        const convertedData = convertTimestamps(data);
        
        documents.push({
          id: doc.id,
          data: convertedData
        });
      });
      
      backup.collections[collectionName] = documents;
      console.log(`✅ ${documents.length}件のドキュメントを取得`);
    }
    
    return backup;
  } catch (error) {
    console.error('❌ バックアップエラー:', error.message);
    throw error;
  }
}

// Timestampオブジェクトを文字列に変換
function convertTimestamps(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Timestampオブジェクトの場合
  if (obj._seconds !== undefined && obj._nanoseconds !== undefined) {
    return new Date(obj._seconds * 1000).toISOString();
  }
  
  // 配列の場合
  if (Array.isArray(obj)) {
    return obj.map(item => convertTimestamps(item));
  }
  
  // オブジェクトの場合
  if (typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }
  
  return obj;
}

// バックアップをファイルに保存
function saveBackup(backup, outputPath) {
  try {
    // ディレクトリが存在しない場合は作成
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // JSONファイルとして保存
    fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2), 'utf8');
    
    const stats = fs.statSync(outputPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ バックアップ完了');
    console.log(`📁 保存先: ${outputPath}`);
    console.log(`📊 ファイルサイズ: ${fileSizeInMB} MB`);
    
    // 統計情報を表示
    let totalDocuments = 0;
    for (const [collectionName, documents] of Object.entries(backup.collections)) {
      console.log(`   - ${collectionName}: ${documents.length}件`);
      totalDocuments += documents.length;
    }
    console.log(`📈 合計: ${totalDocuments}件のドキュメント`);
    
  } catch (error) {
    console.error('❌ ファイル保存エラー:', error.message);
    throw error;
  }
}

// メイン処理
async function main() {
  console.log('🔥 Firebaseバックアップツール');
  console.log('================================\n');
  
  // 出力ファイル名を決定
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupDir = path.join(__dirname, '..', 'backups');
  const defaultOutput = path.join(backupDir, `firebase-backup-${timestamp}.json`);
  const outputPath = customOutput || defaultOutput;
  
  try {
    // 前回のバックアップを読み込み
    const previous = loadPreviousBackup(backupDir);
    if (previous) {
      console.log(`📂 前回のバックアップ: ${path.basename(previous.file)}`);
    }
    
    // Firebase初期化
    const db = initializeFirebase();
    
    // バックアップ実行
    const backup = await backupFirestore(db);
    
    // 差分を計算して表示
    const diff = calculateDiff(previous?.data, backup);
    displayDiff(diff, previous?.file);
    
    // ファイルに保存
    saveBackup(backup, outputPath);
    
    console.log('\n✨ すべての処理が完了しました');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ バックアップ失敗:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
main();
