/**
 * Spotify埋め込みコードのヘルパー関数
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
 * Spotify埋め込みコードが有効かチェック
 */
export function isValidSpotifyEmbed(embedCode: string): boolean {
  if (!embedCode || typeof embedCode !== 'string') return false

  // iframeタグが含まれているか、またはSpotify URLが含まれているかチェック
  const hasIframe = embedCode.includes('<iframe')
  const hasSpotifyUrl = embedCode.includes('open.spotify.com/embed')

  return hasIframe && hasSpotifyUrl
}

/**
 * テスト用のサンプルSpotify埋め込みコード
 */
export function getSampleSpotifyEmbed(
  trackId: string = '2w6mpaFcHXSd4GYTpozSQS'
): string {
  return `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
}
