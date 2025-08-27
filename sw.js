/**
 * Service Worker for GURAY's HYPERTROPHY Fitness App
 * Offline support and caching functionality
 */

const CACHE_NAME = 'guray-fitness-v1.0.0';
const urlsToCache = [
  '/main.html',
  '/js/data-manager.js',
  '/js/fitness-app.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Service Worker kurulumu
self.addEventListener('install', function(event) {
  console.log('Service Worker kurulumu başlatıldı');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('Cache ekleme hatası:', error);
      })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', function(event) {
  console.log('Service Worker aktif edildi');
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch olayları - Cache-first stratejisi
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache'de varsa cache'den döndür
        if (response) {
          return response;
        }

        // Cache'de yoksa network'ten al
        return fetch(event.request).then(function(response) {
          // Geçerli response kontrolü
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Response'u clone et (stream'lar bir kez okunabilir)
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function(error) {
          console.error('Fetch hatası:', error);
          
          // Offline durumunda temel HTML döndür
          if (event.request.destination === 'document') {
            return caches.match('/main.html');
          }
        });
      })
  );
});

// Background Sync için
self.addEventListener('sync', function(event) {
  console.log('Background sync tetiklendi:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push bildirimleri için
self.addEventListener('push', function(event) {
  console.log('Push bildirimi alındı:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni bildirim!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Uygulamayı Aç',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('GURAY Fitness', options)
  );
});

// Bildirim tıklama olayları
self.addEventListener('notificationclick', function(event) {
  console.log('Bildirim tıklandı:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/main.html'));
  } else if (event.action === 'close') {
    // Bildirim kapatıldı
  } else {
    // Varsayılan eylem - uygulamayı aç
    event.waitUntil(clients.openWindow('/main.html'));
  }
});

// Background sync işlevi
async function doBackgroundSync() {
  try {
    // Offline durumunda kaydedilen verileri senkronize et
    const pendingData = await getStoredPendingData();
    
    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        try {
          await syncDataToServer(data);
          await removePendingData(data.id);
        } catch (error) {
          console.error('Veri senkronizasyon hatası:', error);
        }
      }
    }
  } catch (error) {
    console.error('Background sync hatası:', error);
  }
}

// Offline durumunda kaydedilen verileri getir
async function getStoredPendingData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('FitnessAppDB', 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['pendingSync'], 'readonly');
      const store = transaction.objectStore('pendingSync');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = function() {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = function() {
        resolve([]);
      };
    };
    
    request.onerror = function() {
      resolve([]);
    };
  });
}

// Veriyi sunucuya senkronize et (gelecekte backend eklendiğinde)
async function syncDataToServer(data) {
  // Bu kısım backend API'si eklendiğinde implement edilecek
  console.log('Veri sunucuya senkronize edildi:', data);
  return Promise.resolve();
}

// Bekleyen veriyi sil
async function removePendingData(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('FitnessAppDB', 1);
    
    request.onsuccess = function(event) {
      const db = event.target.result;
      const transaction = db.transaction(['pendingSync'], 'readwrite');
      const store = transaction.objectStore('pendingSync');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = function() {
        resolve(true);
      };
      
      deleteRequest.onerror = function() {
        resolve(false);
      };
    };
    
    request.onerror = function() {
      resolve(false);
    };
  });
}

// Connectivity durumu değişikliği
self.addEventListener('online', function(event) {
  console.log('İnternet bağlantısı geri geldi');
  // Background sync tetikle
  self.registration.sync.register('background-sync');
});

self.addEventListener('offline', function(event) {
  console.log('İnternet bağlantısı kesildi');
});