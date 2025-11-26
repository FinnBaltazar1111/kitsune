const CACHE_NAME = 'kitsune-offline-v4';

// Resources to cache for offline play
const GAME_RESOURCES = [
  // Core game files
  './logos/2020/kitsune/rc7/kitsune20.html',
  './logos/2020/kitsune/rc7/kitsune20.js',
  './logos/2020/kitsune/rc7/kitsune_compiled_deferred_module.js',

  // External libraries
  './gstatic/externally_hosted/cannonjs/cannon.min.js',
  './gstatic/externally_hosted/createjs/createjs-2015.11.26.min.js',
  './gstatic/externally_hosted/expr_eval/dist/bundle.min.js',
  './gstatic/externally_hosted/pixelmplus_font/PixelMplus10-Regular.ttf',

  // Sprites
  './logos/2020/kitsune/rc7/archery-sprite.png',
  './logos/2020/kitsune/rc7/climbing-sprite.png',
  './logos/2020/kitsune/rc7/cutscene-sprite.png',
  './logos/2020/kitsune/rc7/marathon-sprite.png',
  './logos/2020/kitsune/rc7/overworld-sprite.png',
  './logos/2020/kitsune/rc7/pingpong-sprite.png',
  './logos/2020/kitsune/rc7/rugby-sprite.png',
  './logos/2020/kitsune/rc7/skate-sprite.png',
  './logos/2020/kitsune/rc7/swim-sprite.png',
  './logos/2020/kitsune/rc7/shared-sprite.png',
  './logos/2020/kitsune/rc7/preload-sprite.png',

  // CTA images
  './logos/2020/kitsune/rc7/CTA-Archery-174787996-174787824.png',
  './logos/2020/kitsune/rc7/CTA-Closing-174787829-192414335.png',
  './logos/2020/kitsune/rc7/CTA-Marathon-174788017-174787794.png',
  './logos/2020/kitsune/rc7/CTA-Opening-144867217-174787752-174787825-192413481.png',
  './logos/2020/kitsune/rc7/CTA-Rugby-174787947-174787773.png',
  './logos/2020/kitsune/rc7/CTA-Skateboarding-174787927.png',
  './logos/2020/kitsune/rc7/CTA-Swimming-174787828-174787766.png',
  './logos/2020/kitsune/rc7/CTA-TableTennis-174787827-174787820.png',
  './logos/2020/kitsune/rc7/CTA_Climbing-174787997.png',
  './logos/2020/kitsune/rc7/CTA-CenteredPlayButtonFrame1.png',
  './logos/2020/kitsune/rc7/CTA-CenteredPlayButtonFrame2.png',
  './logos/2020/kitsune/rc7/CTA-OffsetPlayButtonFrame1.png',
  './logos/2020/kitsune/rc7/CTA-OffsetPlayButtonFrame2.png',

  // Audio files (MP3 and OGG for compatibility)
  './logos/2020/kitsune/rc7/archery.mp3',
  './logos/2020/kitsune/rc7/archery.ogg',
  './logos/2020/kitsune/rc7/ballad.mp3',
  './logos/2020/kitsune/rc7/ballad.ogg',
  './logos/2020/kitsune/rc7/climbing.mp3',
  './logos/2020/kitsune/rc7/climbing.ogg',
  './logos/2020/kitsune/rc7/disco.mp3',
  './logos/2020/kitsune/rc7/disco.ogg',
  './logos/2020/kitsune/rc7/marathon.mp3',
  './logos/2020/kitsune/rc7/marathon.ogg',
  './logos/2020/kitsune/rc7/overworld.mp3',
  './logos/2020/kitsune/rc7/overworld.ogg',
  './logos/2020/kitsune/rc7/pingpong.mp3',
  './logos/2020/kitsune/rc7/pingpong.ogg',
  './logos/2020/kitsune/rc7/rock.mp3',
  './logos/2020/kitsune/rc7/rock.ogg',
  './logos/2020/kitsune/rc7/rugby.mp3',
  './logos/2020/kitsune/rc7/rugby.ogg',
  './logos/2020/kitsune/rc7/shared.mp3',
  './logos/2020/kitsune/rc7/shared.ogg',
  './logos/2020/kitsune/rc7/skate.mp3',
  './logos/2020/kitsune/rc7/skate.ogg',

  // Video files (intro/outro for each event)
  './logos/2020/kitsune/rc7/intro.mp4',
  './logos/2020/kitsune/rc7/outro.mp4',
  './logos/2020/kitsune/rc7/archeryintro.mp4',
  './logos/2020/kitsune/rc7/archeryoutro.mp4',
  './logos/2020/kitsune/rc7/climbingintro.mp4',
  './logos/2020/kitsune/rc7/climbingoutro.mp4',
  './logos/2020/kitsune/rc7/marathonintro.mp4',
  './logos/2020/kitsune/rc7/marathonoutro.mp4',
  './logos/2020/kitsune/rc7/pingpongintro.mp4',
  './logos/2020/kitsune/rc7/pingpongoutro.mp4',
  './logos/2020/kitsune/rc7/rugbyintro.mp4',
  './logos/2020/kitsune/rc7/rugbyoutro.mp4',
  './logos/2020/kitsune/rc7/skateintro.mp4',
  './logos/2020/kitsune/rc7/skateoutro.mp4',
  './logos/2020/kitsune/rc7/swimintro.mp4',
  './logos/2020/kitsune/rc7/swimoutro.mp4',

  // Localization files (all languages)
  './logos/2020/kitsune/rc7/messages.af.nocache.json',
  './logos/2020/kitsune/rc7/messages.am.nocache.json',
  './logos/2020/kitsune/rc7/messages.ar.nocache.json',
  './logos/2020/kitsune/rc7/messages.az.nocache.json',
  './logos/2020/kitsune/rc7/messages.be.nocache.json',
  './logos/2020/kitsune/rc7/messages.bg.nocache.json',
  './logos/2020/kitsune/rc7/messages.bn.nocache.json',
  './logos/2020/kitsune/rc7/messages.bs.nocache.json',
  './logos/2020/kitsune/rc7/messages.ca.nocache.json',
  './logos/2020/kitsune/rc7/messages.cs.nocache.json',
  './logos/2020/kitsune/rc7/messages.da.nocache.json',
  './logos/2020/kitsune/rc7/messages.de.nocache.json',
  './logos/2020/kitsune/rc7/messages.el.nocache.json',
  './logos/2020/kitsune/rc7/messages.en.nocache.json',
  './logos/2020/kitsune/rc7/messages.en-GB.nocache.json',
  './logos/2020/kitsune/rc7/messages.es.nocache.json',
  './logos/2020/kitsune/rc7/messages.es-419.nocache.json',
  './logos/2020/kitsune/rc7/messages.et.nocache.json',
  './logos/2020/kitsune/rc7/messages.eu.nocache.json',
  './logos/2020/kitsune/rc7/messages.fa.nocache.json',
  './logos/2020/kitsune/rc7/messages.fi.nocache.json',
  './logos/2020/kitsune/rc7/messages.fr.nocache.json',
  './logos/2020/kitsune/rc7/messages.gl.nocache.json',
  './logos/2020/kitsune/rc7/messages.gu.nocache.json',
  './logos/2020/kitsune/rc7/messages.hi.nocache.json',
  './logos/2020/kitsune/rc7/messages.hr.nocache.json',
  './logos/2020/kitsune/rc7/messages.hu.nocache.json',
  './logos/2020/kitsune/rc7/messages.hy.nocache.json',
  './logos/2020/kitsune/rc7/messages.id.nocache.json',
  './logos/2020/kitsune/rc7/messages.is.nocache.json',
  './logos/2020/kitsune/rc7/messages.it.nocache.json',
  './logos/2020/kitsune/rc7/messages.iw.nocache.json',
  './logos/2020/kitsune/rc7/messages.ja.nocache.json',
  './logos/2020/kitsune/rc7/messages.ka.nocache.json',
  './logos/2020/kitsune/rc7/messages.kk.nocache.json',
  './logos/2020/kitsune/rc7/messages.km.nocache.json',
  './logos/2020/kitsune/rc7/messages.kn.nocache.json',
  './logos/2020/kitsune/rc7/messages.ko.nocache.json',
  './logos/2020/kitsune/rc7/messages.ky.nocache.json',
  './logos/2020/kitsune/rc7/messages.lo.nocache.json',
  './logos/2020/kitsune/rc7/messages.lt.nocache.json',
  './logos/2020/kitsune/rc7/messages.lv.nocache.json',
  './logos/2020/kitsune/rc7/messages.mk.nocache.json',
  './logos/2020/kitsune/rc7/messages.ml.nocache.json',
  './logos/2020/kitsune/rc7/messages.mn.nocache.json',
  './logos/2020/kitsune/rc7/messages.mr.nocache.json',
  './logos/2020/kitsune/rc7/messages.ms.nocache.json',
  './logos/2020/kitsune/rc7/messages.my.nocache.json',
  './logos/2020/kitsune/rc7/messages.ne.nocache.json',
  './logos/2020/kitsune/rc7/messages.nl.nocache.json',
  './logos/2020/kitsune/rc7/messages.no.nocache.json',
  './logos/2020/kitsune/rc7/messages.pa.nocache.json',
  './logos/2020/kitsune/rc7/messages.pl.nocache.json',
  './logos/2020/kitsune/rc7/messages.pt-BR.nocache.json',
  './logos/2020/kitsune/rc7/messages.pt-PT.nocache.json',
  './logos/2020/kitsune/rc7/messages.ro.nocache.json',
  './logos/2020/kitsune/rc7/messages.ru.nocache.json',
  './logos/2020/kitsune/rc7/messages.si.nocache.json',
  './logos/2020/kitsune/rc7/messages.sk.nocache.json',
  './logos/2020/kitsune/rc7/messages.sl.nocache.json',
  './logos/2020/kitsune/rc7/messages.sq.nocache.json',
  './logos/2020/kitsune/rc7/messages.sr.nocache.json',
  './logos/2020/kitsune/rc7/messages.sv.nocache.json',
  './logos/2020/kitsune/rc7/messages.sw.nocache.json',
  './logos/2020/kitsune/rc7/messages.ta.nocache.json',
  './logos/2020/kitsune/rc7/messages.te.nocache.json',
  './logos/2020/kitsune/rc7/messages.th.nocache.json',
  './logos/2020/kitsune/rc7/messages.tr.nocache.json',
  './logos/2020/kitsune/rc7/messages.uk.nocache.json',
  './logos/2020/kitsune/rc7/messages.ur.nocache.json',
  './logos/2020/kitsune/rc7/messages.uz.nocache.json',
  './logos/2020/kitsune/rc7/messages.vi.nocache.json',
  './logos/2020/kitsune/rc7/messages.zh-CN.nocache.json',
  './logos/2020/kitsune/rc7/messages.zh-HK.nocache.json',
  './logos/2020/kitsune/rc7/messages.zh-TW.nocache.json',
  './logos/2020/kitsune/rc7/messages.zu.nocache.json',

  // App pages
  './silica/config.html',
  './silica/run.html',
  './silica/icon.png',
  './index.html'
];

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('kitsune-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Map gstatic.com URLs to local paths
function mapGstaticToLocal(url) {
  const gstaticPrefix = 'https://www.gstatic.com/external_hosted/';
  if (url.startsWith(gstaticPrefix)) {
    const localPath = url.replace(gstaticPrefix, '/gstatic/externally_hosted/');
    return localPath;
  }
  return null;
}

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = event.request.url;
  const url = new URL(requestUrl);

  // Handle gstatic.com requests by mapping to local cache
  const localPath = mapGstaticToLocal(requestUrl);

  event.respondWith(
    (async () => {
      // First try direct cache match
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();

      // If this is a gstatic request, find the local cached version
      if (localPath) {
        const matchingKey = keys.find((key) => {
          const keyUrl = new URL(key.url);
          return keyUrl.pathname === localPath ||
                 keyUrl.pathname.endsWith(localPath.replace(/^\//, ''));
        });
        if (matchingKey) {
          return cache.match(matchingKey);
        }
      }

      // Try to match by pathname for local resources
      const pathname = url.pathname;
      const matchingKey = keys.find((key) => {
        const keyUrl = new URL(key.url);
        return keyUrl.pathname === pathname ||
               keyUrl.pathname.endsWith(pathname.replace(/^\//, '')) ||
               pathname.endsWith(keyUrl.pathname.replace(/^.*\//, ''));
      });

      if (matchingKey) {
        return cache.match(matchingKey);
      }

      // Fall back to network
      try {
        return await fetch(event.request);
      } catch (error) {
        // If offline and no cache match, return a simple error
        return new Response('Offline - resource not cached', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Message handler for caching resources
self.addEventListener('message', (event) => {
  if (event.data.action === 'cache-resources') {
    cacheResources(event.source);
  } else if (event.data.action === 'get-cache-status') {
    getCacheStatus(event.source);
  } else if (event.data.action === 'clear-cache') {
    clearCache(event.source);
  }
});

async function cacheResources(client) {
  const cache = await caches.open(CACHE_NAME);
  let cached = 0;
  let failed = 0;
  const total = GAME_RESOURCES.length;

  for (const resource of GAME_RESOURCES) {
    try {
      const response = await fetch(resource);
      if (response.ok) {
        await cache.put(resource, response);
        cached++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }

    client.postMessage({
      type: 'cache-progress',
      cached,
      failed,
      total
    });
  }

  client.postMessage({
    type: 'cache-complete',
    cached,
    failed,
    total
  });
}

async function getCacheStatus(client) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    client.postMessage({
      type: 'cache-status',
      cached: keys.length,
      total: GAME_RESOURCES.length,
      isCached: keys.length >= GAME_RESOURCES.length * 0.9
    });
  } catch (error) {
    client.postMessage({
      type: 'cache-status',
      cached: 0,
      total: GAME_RESOURCES.length,
      isCached: false
    });
  }
}

async function clearCache(client) {
  try {
    await caches.delete(CACHE_NAME);
    client.postMessage({ type: 'cache-cleared', success: true });
  } catch (error) {
    client.postMessage({ type: 'cache-cleared', success: false });
  }
}
