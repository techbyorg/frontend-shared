import * as _ from 'lodash-es'

import Environment from '../services/environment'

export default class Cache
  constructor: ({@host}) ->
    @isRecording = false
    @cachesFiles =
      deploy: {
        version: '|HASH|'
        files: [
          'https://fdn.uno/d/scripts/bundle_|HASH|_en.js'
          # 'https://fdn.uno/d/scripts/vendors~firebase_bundle_|HASH|.js'
          'https://fdn.uno/d/scripts/bundle_|HASH|.css'
          # 'http://localhost:50341/bundle.js'
        ]
      }
      html: {
        version: '|HASH|'
        files: [
          '/cache-shell'
        ]
      }
      # sprites: {
      #   version: 3 # bump when changing
      #   files: [
      #     'https://fdn.uno/d/images/maps/sprite_2019_12_04.json'
      #     'https://fdn.uno/d/images/maps/sprite_2019_12_04.png'
      #     'https://fdn.uno/d/images/maps/sprite_2019_12_04@2x.json'
      #     'https://fdn.uno/d/images/maps/sprite_2019_12_04@2x.png'
      #   ]
      # }

  updateCache: ({files, version}, cacheName) ->
    caches.open "#{cacheName}:#{version}"
    .then (cache) ->
      # if any of these fail, all fail
      console.log 'add', "#{cacheName}:#{version}", files
      cache.addAll files

  fetchViaNetwork: (request) =>
    fetch(request)
    .then (response) =>
      if @isRecording and request.method is 'GET'
        caches.open 'recorded'
        .then (cache) ->
          cache.put(request, response.clone())
          response
      else
        response

  onInstall: (event) =>
    event.waitUntil(
      Promise.all _.map @cachesFiles, @updateCache
      # .then notifyClients
      .then ->
        console.log 'caches installed'
        self.skipWaiting()
    )

  clearByCacheName: (cacheName) ->
    caches.delete cacheName

  getSizeByCacheName: (cacheName) ->
    caches.open cacheName
    .then (cache) ->
      cache.keys().then (keys) ->
        Promise.all _.map keys, (key) ->
          cache.match(key).then (response) ->
            response.clone().blob().then (blob) -> blob.size
        .then (sizes) ->
          _.sum sizes

  # grab from normal stores (can't use caches.match, because we want to avoid
  # the recorded cache)
  getCacheMatch: (request) =>
    Promise.all _.map @cachesFiles, ({version}, cacheName) ->
      caches.open("#{cacheName}:#{version}")
      .then (cache) ->
        cache.match request
    .then (matches) ->
      _.find matches, (match) -> Boolean match

  onFetch: (event) =>
    # xhr upload progress listener doesn't work w/o this
    # https://github.com/w3c/ServiceWorker/issues/1141
    if event.request.method is 'POST' and event.request.url.match(
        /\/upload[^a-zA-Z]/i
    )
      return

    request = event.request
    # console.log 'fetch'
    # console.log event.request.url
    if event.request.url.match /(:\/\/techby.org|localhost:50340)([^\.]*)$/i
      request = "https://#{@host}/cache-shell"
      # request = 'https://staging.techby.org/cache-shell'
      # request = 'http://localhost:50340/cache-shell'

    event.respondWith(
      @getCacheMatch request
      .catch (err) ->
        console.log 'cache match err', err
        null
      .then (response) =>
        response or @fetchViaNetwork event.request
      .catch (err) -> # throws when offline
        console.log 'fetch err.....', err
        return caches.open('recorded') # user-recorded requestsStream for offline mode
        .then (cache) ->
          cache.match event.request
          .then (recordedCache) ->
            unless recordedCache
              console.log 'throwing'
              throw err
            recordedCache
    )

  onActivate: (event) =>
    cacheKeys = _.map @cachesFiles, ({version}, cacheName) ->
      "#{cacheName}:#{version}"
    caches.keys().then (keys) ->
      Promise.all(
        _.map keys, (key) ->
          if cacheKeys.indexOf(key) is -1
            caches.delete key
      )
    # set this worker as the active worker for all clients
    event.waitUntil(
      self.clients.claim()
    )

  listen: =>
    self.addEventListener 'install', @onInstall

    self.addEventListener 'fetch', @onFetch

    self.addEventListener 'activate', @onActivate
