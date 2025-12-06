// アプリバージョン - package.jsonと同期させること
const APP_VERSION = '1.0.2';
const CACHE_NAME = `music-bubble-explorer-v${APP_VERSION}`;
const BASE_PATH = self.location.pathname.replace(/\/[^\/]*$/, '');
const STATIC_CACHE_URLS = [
  BASE_PATH + '/',
  BASE_PATH + '/index.html',
  BASE_PATH + '/manifest.json',
  BASE_PATH + '/icons/icon-192x192.png',
  BASE_PATH + '/icons/icon-512x512.png'
];

// バージョン情報をクライアントに通知
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// インストール時のキャッシュ
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// アクティベーション時の古いキャッシュ削除
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// フェッチイベントの処理（Network Firstストラテジー - キャッシュバスティング優先）
self.addEventListener('fetch', (event) => {
  // GET リクエストのみ処理
  if (event.request.method !== 'GET') {
    return;
  }

  // Chrome拡張機能のリクエストは無視
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // HTMLファイルとJSファイルは常にネットワークから取得（キャッシュバスティング）
  const isNavigationRequest = event.request.mode === 'navigate' || 
                              event.request.destination === 'document' ||
                              event.request.url.match(/\.(html|js|css)$/);

  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // レスポンスが有効な場合はキャッシュを更新
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('Service Worker: Network fetch failed, falling back to cache', error);
          // ネットワークエラー時のみキャッシュから返す
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // オフライン時のフォールバック
            if (event.request.destination === 'document') {
              return caches.match(BASE_PATH + '/index.html') || caches.match(BASE_PATH + '/');
            }
            return new Response('', {
              status: 408,
              statusText: 'Request Timeout'
            });
          });
        })
    );
  } else {
    // 画像やフォントなどの静的リソースはキャッシュファースト
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)) {
                  cache.put(event.request, responseToCache);
                }
              });

              return response;
            })
            .catch((error) => {
              console.error('Service Worker: Fetch failed', error);
              return new Response('', {
                status: 408,
                statusText: 'Request Timeout'
              });
            });
        })
    );
  }
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // バックグラウンドでのデータ同期処理
      Promise.resolve()
    );
  }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Music Bubble Explorer', options)
  );
});