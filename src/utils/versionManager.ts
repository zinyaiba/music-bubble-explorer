/**
 * バージョン管理とキャッシュ更新を制御するユーティリティ
 */

const CURRENT_VERSION = '1.0.2' // package.jsonと同期 - キャッシュバスティング強化
const VERSION_KEY = 'app_version'
const LAST_CHECK_KEY = 'version_last_check'
const CHECK_INTERVAL = 1000 * 60 * 60 // 1時間ごとにチェック

/**
 * 保存されているバージョンを取得
 */
export function getStoredVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_KEY)
  } catch (error) {
    console.error('Failed to get stored version:', error)
    return null
  }
}

/**
 * 現在のバージョンを保存
 */
export function setStoredVersion(version: string): void {
  try {
    localStorage.setItem(VERSION_KEY, version)
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString())
  } catch (error) {
    console.error('Failed to set stored version:', error)
  }
}

/**
 * バージョンチェックが必要かどうか
 */
export function shouldCheckVersion(): boolean {
  try {
    const lastCheck = localStorage.getItem(LAST_CHECK_KEY)
    if (!lastCheck) return true

    const timeSinceLastCheck = Date.now() - parseInt(lastCheck, 10)
    return timeSinceLastCheck > CHECK_INTERVAL
  } catch (error) {
    return true
  }
}

/**
 * バージョンが変更されたかチェック
 */
export function hasVersionChanged(): boolean {
  const storedVersion = getStoredVersion()
  return storedVersion !== null && storedVersion !== CURRENT_VERSION
}

/**
 * Service Workerからバージョンを取得
 */
export async function getServiceWorkerVersion(): Promise<string | null> {
  if (!('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    if (!registration.active) {
      return null
    }

    return new Promise(resolve => {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = event => {
        resolve(event.data.version || null)
      }

      if (registration.active) {
        registration.active.postMessage({ type: 'GET_VERSION' }, [
          messageChannel.port2,
        ])
      } else {
        resolve(null)
      }

      // タイムアウト
      setTimeout(() => resolve(null), 1000)
    })
  } catch (error) {
    console.error('Failed to get service worker version:', error)
    return null
  }
}

/**
 * アプリケーションの更新をチェックして必要なら通知
 */
export async function checkForUpdates(): Promise<boolean> {
  // バージョンチェックが必要か確認
  if (!shouldCheckVersion()) {
    return false
  }

  const storedVersion = getStoredVersion()

  // 初回起動
  if (storedVersion === null) {
    setStoredVersion(CURRENT_VERSION)
    return false
  }

  // バージョンが変更された
  if (storedVersion !== CURRENT_VERSION) {
    console.log(`Version updated: ${storedVersion} -> ${CURRENT_VERSION}`)
    return true
  }

  // Service Workerのバージョンもチェック
  const swVersion = await getServiceWorkerVersion()
  if (swVersion && swVersion !== CURRENT_VERSION) {
    console.log(
      `Service Worker version mismatch: ${swVersion} vs ${CURRENT_VERSION}`
    )
    return true
  }

  return false
}

/**
 * 更新を適用（ページリロード）
 */
export function applyUpdate(): void {
  setStoredVersion(CURRENT_VERSION)

  // Service Workerに新しいバージョンへの切り替えを指示
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
  }

  // ページをリロード
  window.location.reload()
}

/**
 * キャッシュをクリア
 */
export async function clearAllCaches(): Promise<void> {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }
}

/**
 * 強制的に最新バージョンに更新
 */
export async function forceUpdate(): Promise<void> {
  await clearAllCaches()

  // Service Workerを登録解除
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map(reg => reg.unregister()))
  }

  // LocalStorageをクリア（ユーザーデータは保持）
  try {
    const keysToKeep = ['songs', 'tags', 'user_role', 'user_name']
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }

  setStoredVersion(CURRENT_VERSION)
  window.location.reload()
}

export { CURRENT_VERSION }
