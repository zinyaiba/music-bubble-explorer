// 300曲のテストデータを生成するスクリプト
const fs = require('fs');
const path = require('path');

// 日本の楽曲タイトルのサンプル
const songTitles = [
  '桜', '津軽海峡冬景色', '贈る言葉', '乾杯', '青春', '糸', '上野駅', '翼をください', '涙そうそう', '島唄',
  '夜空ノムコウ', '世界に一つだけの花', '恋人よ', '卒業写真', '春よ、来い', 'ひとり上手', '津軽海峡冬景色',
  '贈る言葉', '乾杯', '青春', '糸', '上野駅', '翼をください', '涙そうそう', '島唄', '夜空ノムコウ',
  '世界に一つだけの花', '恋人よ', '卒業写真', '青春', '津軽海峡冬景色', '贈る言葉', '乾杯', '青春', '糸',
  '上野駅', '翼をください', '涙そうそう', '島唄', '夜空ノムコウ', '世界に一つだけの花', '恋人よ', '卒業写真',
  '青春', '津軽海峡冬景色', '贈る言葉', '乾杯', '青春', '糸', '上野駅', '翼をください', '涙そうそう', '島唄'
];

// 日本の音楽家名のサンプル
const musicianNames = [
  '森山直太朗', '御徒町凧', '康珍化', '三木たかし', '武田鉄矢', '千葉和臣', '長渕剛', '毛皮のマリーズ',
  '中島みゆき', '荒木とよひさ', '山上路夫', '村井邦彦', '森山良子', 'BEGIN', '宮沢和史', 'THE BOOM',
  'スガシカオ', '川村結花', '新川博', '槇原敬之', '五輪真弓', '荒井由実', '竹内まりや', '松本伊代',
  '中森明菜', '松田聖子', '河合奈保子', '小泉今日子', '菊池桃子', '南野陽子', '浅香唯', '工藤静香',
  '酒井法子', '森高千里', '西田ひかる', '渡辺美奈代', '本田美奈子', '岡田有希子', '石川秀美', '堀ちえみ',
  '早見優', '柏原芳恵', '石野真子', '榊原郁恵', '太田裕美', '竹内まりや', '大貫妙子', '山下智久',
  '福山雅治', '桑田佳祐', '稲葉浩志', '松本孝弘', '長渕剛', '尾崎豊', '浜田省吾', '佐野元春',
  '甲斐よしひろ', '竹内まりや', '松任谷由実', '中島みゆき', '谷江常雄', '飛鳥涼', '康珍化', '阿久悠',
  '松本隆', '売野雅勇', '康珍化', '三木たかし', '筒美京平', '都倉俊一', '平尾昌晃', '遠藤実'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateLargeDataset() {
  const songs = [];
  const peopleMap = new Map();
  
  // 300曲を生成
  for (let i = 1; i <= 300; i++) {
    const songId = `song_${i.toString().padStart(3, '0')}`;
    
    // タイトルを生成（重複を避けるため番号を付加）
    const baseTitle = getRandomElement(songTitles);
    const title = i <= songTitles.length ? baseTitle : `${baseTitle} ${Math.floor(i / songTitles.length) + 1}`;
    
    // 作詞家、作曲家、編曲家をランダムに選択
    const lyricists = getRandomElements(musicianNames, Math.floor(Math.random() * 2) + 1); // 1-2人
    const composers = getRandomElements(musicianNames, Math.floor(Math.random() * 2) + 1); // 1-2人  
    const arrangers = getRandomElements(musicianNames, Math.floor(Math.random() * 2) + 1); // 1-2人
    
    const song = {
      id: songId,
      title,
      lyricists,
      composers,
      arrangers
    };
    
    songs.push(song);
    
    // 人物データを更新
    const updatePeople = (names, type) => {
      names.forEach(name => {
        const personKey = `${name}_${type}`;
        if (!peopleMap.has(personKey)) {
          peopleMap.set(personKey, {
            id: `person_${peopleMap.size + 1}`,
            name,
            type,
            songs: []
          });
        }
        peopleMap.get(personKey).songs.push(songId);
      });
    };
    
    updatePeople(lyricists, 'lyricist');
    updatePeople(composers, 'composer');
    updatePeople(arrangers, 'arranger');
  }
  
  const people = Array.from(peopleMap.values());
  
  console.log(`Generated dataset: ${songs.length} songs, ${people.length} people`);
  
  return { songs, people };
}

// データセットを生成してファイルに保存
const dataset = generateLargeDataset();
const outputPath = path.join(__dirname, '..', 'data', 'largeMusicData.json');
fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
console.log(`Saved large dataset to ${outputPath}`);