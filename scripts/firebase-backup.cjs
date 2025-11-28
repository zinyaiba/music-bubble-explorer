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
    
    const collections = ['songs']; // バックアップ対象のコレクション
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
  const defaultOutput = path.join(__dirname, '..', 'backups', `firebase-backup-${timestamp}.json`);
  const outputPath = customOutput || defaultOutput;
  
  try {
    // Firebase初期化
    const db = initializeFirebase();
    
    // バックアップ実行
    const backup = await backupFirestore(db);
    
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
