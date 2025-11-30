/**
 * データ移行ユーティリティ
 * 古いデータ形式から新しいデータ形式への変換
 */

import { Song } from '@/types/music'

/**
 * 古い musicServiceEmbed (単数形・文字列) を新しい musicServiceEmbeds (複数形・配列) に変換
 */
export function migrateMusicServiceEmbed(song: any): Song {
  const migratedSong = { ...song }

  // 既に新しい形式の場合はそのまま返す
  if (migratedSong.musicServiceEmbeds) {
    return migratedSong as Song
  }

  // 古い形式の場合、配列に変換
  if (migratedSong.musicServiceEmbed) {
    migratedSong.musicServiceEmbeds = [migratedSong.musicServiceEmbed]
    // 古いフィールドを削除（オプション）
    delete migratedSong.musicServiceEmbed
  }

  return migratedSong as Song
}

/**
 * 複数の楽曲データを一括で移行
 */
export function migrateSongs(songs: any[]): Song[] {
  return songs.map(migrateMusicServiceEmbed)
}

/**
 * データベース全体を移行（必要に応じて使用）
 */
export async function migrateAllSongs(
  getSongs: () => Promise<any[]>,
  updateSong: (song: Song) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const songs = await getSongs()
  let success = 0
  let failed = 0

  for (const song of songs) {
    // 古い形式のデータのみ移行
    if (song.musicServiceEmbed && !song.musicServiceEmbeds) {
      const migratedSong = migrateMusicServiceEmbed(song)
      const result = await updateSong(migratedSong)
      if (result) {
        success++
      } else {
        failed++
      }
    }
  }

  return { success, failed }
}
