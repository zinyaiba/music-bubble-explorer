// デバッグ用: 楽曲データの状況を確認するスクリプト

// LocalStorageからデータを読み込み
const storageKey = 'music-bubble-explorer-data'
const data = localStorage.getItem(storageKey)

console.log('=== LocalStorage Data Debug ===')
console.log('Storage Key:', storageKey)
console.log('Raw Data:', data)

if (data) {
  try {
    const parsedData = JSON.parse(data)
    console.log('Parsed Data:', parsedData)
    
    if (parsedData.songs) {
      console.log('Songs Count:', parsedData.songs.length)
      console.log('First 3 Songs:', parsedData.songs.slice(0, 3))
      
      // IDの確認
      parsedData.songs.forEach((song, index) => {
        console.log(`Song ${index + 1}:`, {
          id: song.id,
          title: song.title,
          hasId: !!song.id,
          idType: typeof song.id
        })
      })
    }
  } catch (error) {
    console.error('Failed to parse data:', error)
  }
} else {
  console.log('No data found in localStorage')
}

// Firebaseからのデータも確認
console.log('=== Firebase Data Check ===')
// Firebase関連のデータがあるかチェック
const firebaseKeys = Object.keys(localStorage).filter(key => key.includes('firebase') || key.includes('Firebase'))
console.log('Firebase related keys:', firebaseKeys)