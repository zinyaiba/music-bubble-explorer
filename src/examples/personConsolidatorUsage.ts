import { PersonConsolidator } from '../utils/personConsolidator'
import { Song } from '../types/music'

/**
 * PersonConsolidator の使用例
 */

// サンプルデータ
const sampleSongs: Song[] = [
  {
    id: '1',
    title: '春の歌',
    lyricists: ['田中太郎', '佐藤花子'],
    composers: ['田中太郎'],
    arrangers: ['山田次郎']
  },
  {
    id: '2', 
    title: '夏の思い出',
    lyricists: ['佐藤花子'],
    composers: ['田中太郎', '鈴木一郎'],
    arrangers: ['田中太郎']
  },
  {
    id: '3',
    title: '秋の風景',
    lyricists: ['高橋美咲'],
    composers: ['鈴木一郎'],
    arrangers: ['山田次郎', '田中太郎']
  }
]

// PersonConsolidator の使用例
export function demonstratePersonConsolidation(): void {
  const consolidator = new PersonConsolidator()
  
  console.log('=== 人物統合システムのデモンストレーション ===')
  
  // 1. 人物を統合
  const consolidatedPersons = consolidator.consolidatePersons(sampleSongs)
  
  console.log('\n1. 統合された人物一覧:')
  consolidatedPersons.forEach(person => {
    console.log(`名前: ${person.name}`)
    console.log(`役割: ${person.roles.map(r => `${r.type}(${r.songCount}曲)`).join(', ')}`)
    console.log(`総関連楽曲数: ${person.totalRelatedCount}`)
    console.log(`関連楽曲ID: [${person.songs.join(', ')}]`)
    console.log(`複数役割: ${consolidator.isMultiRole(person) ? 'はい' : 'いいえ'}`)
    console.log('---')
  })
  
  // 2. 特定の人物の役割を取得
  console.log('\n2. 田中太郎の役割:')
  const tanakaRoles = consolidator.getPersonRoles('田中太郎', sampleSongs)
  tanakaRoles.forEach(role => {
    console.log(`- ${role.type}: ${role.songCount}曲`)
  })
  
  // 3. 複数役割を持つ人物を取得
  console.log('\n3. 複数役割を持つ人物:')
  const multiRolePersons = consolidator.getMultiRolePersons(consolidatedPersons)
  multiRolePersons.forEach(person => {
    console.log(`- ${person.name}: ${person.roles.map(r => r.type).join(', ')}`)
  })
  
  // 4. 作曲家の人物を取得
  console.log('\n4. 作曲家として活動している人物:')
  const composers = consolidator.getPersonsByRole(consolidatedPersons, 'composer')
  composers.forEach(person => {
    const composerRole = person.roles.find(r => r.type === 'composer')
    console.log(`- ${person.name}: ${composerRole?.songCount}曲`)
  })
  
  // 5. 統計情報
  console.log('\n5. 統計情報:')
  console.log(`総人物数: ${consolidatedPersons.length}`)
  console.log(`複数役割を持つ人物数: ${multiRolePersons.length}`)
  console.log(`作詞家数: ${consolidator.getPersonsByRole(consolidatedPersons, 'lyricist').length}`)
  console.log(`作曲家数: ${consolidator.getPersonsByRole(consolidatedPersons, 'composer').length}`)
  console.log(`編曲家数: ${consolidator.getPersonsByRole(consolidatedPersons, 'arranger').length}`)
}

// 実行例（コメントアウト）
// demonstratePersonConsolidation()