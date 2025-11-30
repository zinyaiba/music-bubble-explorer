/**
 * 音楽サービス埋め込みコードのヘルパー関数
 * Spotify、Apple Music、YouTube等に対応
 */

/**
 * Spotify埋め込みコードからトラックIDを抽出
 */
export function extractSpotifyTrackId(embedCode: string): string | null {
  if (!embedCode) return null

  const match = embedCode.match(
    /open\.spotify\.com\/embed\/track\/([a-zA-Z0-9]+)/
  )
  return match ? match[1] : null
}

/**
 * Apple Music埋め込みコードからアルバム/曲IDを抽出
 */
export function extractAppleMusicId(embedCode: string): string | null {
  if (!embedCode) return null

  const match = embedCode.match(/embed\.music\.apple\.com\/[^/]+\/([^"?]+)/)
  return match ? match[1] : null
}

/**
 * YouTube埋め込みコードから動画IDを抽出
 */
export function extractYouTubeVideoId(embedCode: string): string | null {
  if (!embedCode) return null

  const match = embedCode.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

/**
 * 音楽サービス埋め込みコードが有効かチェック
 */
export function isValidMusicServiceEmbed(embedCode: string): boolean {
  if (!embedCode || typeof embedCode !== 'string') return false

  const hasIframe = embedCode.includes('<iframe')
  const hasSpotify = embedCode.includes('open.spotify.com/embed')
  const hasAppleMusic = embedCode.includes('embed.music.apple.com')
  const hasYouTube = embedCode.includes('youtube.com/embed')

  return hasIframe && (hasSpotify || hasAppleMusic || hasYouTube)
}

/**
 * 埋め込みコードの音楽サービスを判定
 */
export function detectMusicService(
  embedCode: string
): 'spotify' | 'applemusic' | 'youtube' | 'unknown' {
  if (!embedCode) return 'unknown'

  if (embedCode.includes('open.spotify.com/embed')) return 'spotify'
  if (embedCode.includes('embed.music.apple.com')) return 'applemusic'
  if (embedCode.includes('youtube.com/embed')) return 'youtube'

  return 'unknown'
}

/**
 * テスト用のサンプルSpotify埋め込みコード
 */
export function getSampleSpotifyEmbed(
  trackId: string = '2w6mpaFcHXSd4GYTpozSQS'
): string {
  return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
}

/**
 * テスト用のサンプルApple Music埋め込みコード
 */
export function getSampleAppleMusicEmbed(
  albumId: string = 'album/test/1234567890'
): string {
  return `<iframe allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" frameborder="0" height="450" style="width:100%;max-width:660px;overflow:hidden;border-radius:10px;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="https://embed.music.apple.com/jp/${albumId}"></iframe>`
}

/**
 * テスト用のサンプルYouTube埋め込みコード
 */
export function getSampleYouTubeEmbed(videoId: string = 'dQw4w9WgXcQ'): string {
  return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
}
