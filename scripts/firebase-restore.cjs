/**
 * Firebaseリストアスクリプト
 * バックアップファイルからFirestoreにデータを復元
 * 
 * 使い方:
 *   node scripts/firebase-restore.cjs backups/firebase-backup-2024-11-29.json
 *   node scripts/firebase-restore.cjs backups/firebase-backup-2024-11-29.json --merge
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const backupFile = args[0];
const mergeMode = args.includes('--merge');

if (!backupFile) {
  console.error('❌ バックアップファイルを指定してください');
  console.error('使い方: node scripts/firebase-restore.cjs <backup-file>');
  console.error('例: node scripts/firebase-restore.cjs backups/firebase-backup-2024-11-29.json');
  process.exit(1);
}

// Firebase Admin SDK初期化
function initializeFirebase() {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 
                               path.join(__dirname, '..', 'firebase-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ サービスアカウントキーが見つかりません');
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

// バックアップファイルを読み込み
function loadBackup(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ファイルが見つかりません: ${filePath}`);
      process.exit(1);
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const backup = JSON.parse(content);
    
    console.log('✅ バックアップファイル読み込み完了');
    console.log(`📅 バックアップ日時: ${backup.timestamp}`);
    console.log(`📦 バージョン: ${backup.version}`);
    
    return backup;
  } catch (error) {
    console.error('❌ ファイル読み込みエラー:', error.message);
    process.exit(1);
  }
}

// Firestoreにデータを復元
async function restoreFirestore(db, backup) {
  try {
    console.log('🔄 リストア開始...');
    
    if (!mergeMode) {
      console.log('⚠️  警告: 既存のデータを削除してから復元します');
      console.log('   マージモードで実行する場合は --merge オプションを使用してください');
      
      // 確認プロンプト（本番環境では要注意）
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('📝 マージモード: 既存のデータは保持されます');
    }
    
    let totalRestored = 0;
    
    for (const [collectionName, documents] of Object.entries(backup.collections)) {
      console.log(`\n📦 コレクション "${collectionName}" を復元中...`);
      
      if (!mergeMode) {
        // 既存のドキュメントを削除
        const existingDocs = await db.collection(collectionName).get();
        console.log(`🗑️  既存の${existingDocs.size}件のドキュメントを削除中...`);
        
        const batch = db.batch();
        existingDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      
      // バックアップからドキュメントを復元
      console.log(`📝 ${documents.length}件のドキュメントを復元中...`);
      
      for (const doc of documents) {
        const docRef = db.collection(collectionName).doc(doc.id);
        await docRef.set(doc.data, { merge: mergeMode });
        totalRestored++;
        
        // 進捗表示
        if (totalRestored % 10 === 0) {
          process.stdout.write(`\r   復元済み: ${totalRestored}件`);
        }
      }
      
      console.log(`\n✅ コレクション "${collectionName}" の復元完了`);
    }
    
    console.log(`\n✅ リストア完了: ${totalRestored}件のドキュメント`);
    
  } catch (error) {
    console.error('❌ リストアエラー:', error.message);
    throw error;
  }
}

// メイン処理
async function main() {
  console.log('🔥 Firebaseリストアツール');
  console.log('================================\n');
  
  try {
    // Firebase初期化
    const db = initializeFirebase();
    
    // バックアップファイル読み込み
    const backup = loadBackup(backupFile);
    
    // データを復元
    await restoreFirestore(db, backup);
    
    console.log('\n✨ すべての処理が完了しました');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ リストア失敗:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
main();
