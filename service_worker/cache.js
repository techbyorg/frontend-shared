import * as _ from 'lodash-es'

export default class Cache {
  constructor ({ host }) {
    this.host = host
    this.isRecording = false
    this.cachesFiles = {
      deploy: {
        version: '|HASH|',
        files: [
          'https://tdn.one/d/scripts/bundle_|HASH|_en.js',
          // 'https://tdn.one/d/scripts/vendors~firebase_bundle_|HASH|.js'
          'https://tdn.one/d/scripts/bundle_|HASH|.css'
          // 'http://localhost:50341/bundle.js'
        ]
      },
      html: {
        version: '|HASH|',
        files: [
          '/cache-shell'
        ]
      }
    }
  }

  updateCache = ({ files, version }, cacheName) => {
    return caches.open(`${cacheName}:${version}`)
      .then(function (cache) {
      // if any of these fail, all fail
        console.log('add', `${cacheName}:${version}`, files)
        return cache.addAll(files)
      })
  }

  fetchViaNetwork = (request) => {
    return fetch(request)
      .then(response => {
        if (this.isRecording && (request.method === 'GET')) {
          return caches.open('recorded')
            .then(function (cache) {
              cache.put(request, response.clone())
              return response
            })
        } else {
          return response
        }
      })
  }

  onInstall = (event) => {
    return event.waitUntil(
      Promise.all(_.map(this.cachesFiles, this.updateCache))
      // .then notifyClients
        .then(function () {
          console.log('caches installed')
          return self.skipWaiting()
        })
    )
  }

  clearByCacheName = (cacheName) => {
    return caches.delete(cacheName)
  }

  getSizeByCacheName = (cacheName) => {
    return caches.open(cacheName)
      .then((cache) =>
        cache.keys().then((keys) =>
          Promise.all(_.map(keys, (key) =>
            cache.match(key).then((response) =>
              response.clone().blob().then((blob) =>
                blob.size
              )
            )
          )).then(sizes => _.sum(sizes))
        )
      )
  }

  // grab from normal stores (can't use caches.match, because we want to avoid
  // the recorded cache)
  getCacheMatch = (request) => {
    return Promise.all(
      _.map(this.cachesFiles, ({ version }, cacheName) =>
        caches.open(`${cacheName}:${version}`)
          .then(cache => cache.match(request))
      )
    ).then(matches => _.find(matches, match => Boolean(match)))
  }

  onFetch = (event) => {
    // xhr upload progress listener doesn't work w/o this
    // https://github.com/w3c/ServiceWorker/issues/1141
    if ((event.request.method === 'POST') && event.request.url.match(
      /\/upload[^a-zA-Z]/i
    )) {
      return
    }

    let {
      request
    } = event
    // console.log 'fetch'
    // console.log event.request.url
    const regex = new RegExp(
      `((://|.)${self.location.host})([^.]*)$`, 'i'
    )
    if (event.request.url.match(regex)) {
      request = `https://${this.host}/cache-shell`
    }
    // request = 'https://staging.techby.org/cache-shell'
    // request = 'http://localhost:50340/cache-shell'

    return event.respondWith(
      this.getCacheMatch(request)
        .catch(function (err) {
          console.log('cache match err', err)
          return null
        }).then(response => {
          return response || this.fetchViaNetwork(event.request)
        }).catch(function (err) { // throws when offline
          console.log('fetch err', err, 'url:', event.request.url)
          return caches.open('recorded') // user-recorded requestsStream for offline mode
            .then(cache => cache.match(event.request)
              .then(function (recordedCache) {
                if (!recordedCache) {
                  console.log('throwing')
                  throw err
                }
                return recordedCache
              }))
        })
    )
  }

  onActivate = (event) => {
    const cacheKeys = _.map(this.cachesFiles, ({ version }, cacheName) =>
      `${cacheName}:${version}`
    )
    caches.keys().then(keys => Promise.all(
      _.map(keys, function (key) {
        if (cacheKeys.indexOf(key) === -1) {
          return caches.delete(key)
        }
      })
    ))
    // set this worker as the active worker for all clients
    return event.waitUntil(
      self.clients.claim()
    )
  }

  listen = () => {
    self.addEventListener('install', this.onInstall)

    self.addEventListener('fetch', this.onFetch)

    return self.addEventListener('activate', this.onActivate)
  }
}
