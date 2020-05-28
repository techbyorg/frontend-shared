require 'frontend-shared/polyfill'

import {z, render} from 'zorium'
import cookieLib from 'cookie'
import LocationRouter from 'location-router'
import socketIO from 'socket.io-client/dist/socket.io.slim.js'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
require 'rxjs/add/operator/do'

require '../root.styl'

import Environment from './environment'
import DateService from './date'
import RouterService from './router'
import PushService from './push'
import ServiceWorkerService from './service_worker'
import CookieService from './cookie'
import LogService from './log'
import LanguageService from './language'
import PortalService from './portal'
import WindowService from './window'

export default setup = ({$app, Lang, Model, colors, config}) ->
  MAX_ERRORS_LOGGED = 5

  LogService.init()

  ###
  # Model stuff
  ###

  initialCookies = cookieLib.parse(document.cookie)

  isBackendUnavailable = new RxBehaviorSubject false
  currentNotification = new RxBehaviorSubject false

  io = socketIO config.API_HOST, {
    path: (config.API_PATH or '') + '/socket.io'
    # this potentially has negative side effects. firewalls could
    # potentially block websockets, but not long polling.
    # unfortunately, session affinity on kubernetes is a complete pain.
    # behind cloudflare, it seems to unevenly distribute load.
    # the libraries for sticky websocket sessions between cpus
    # also aren't great - it's hard to get the real ip sent to
    # the backend (easy as http-forwarded-for, hard as remote address)
    # and the only library that uses forwarded-for isn't great....
    # see kaiser experiments for how to pass source ip in gke, but
    # it doesn't keep session affinity (for now?) if adding polling
    transports: ['websocket']
  }
  fullLanguage = window.navigator.languages?[0] or window.navigator.language
  language = initialCookies?['language'] or fullLanguage?.substr(0, 2)
  unless language in config.LANGUAGES
    language = 'en'
  userAgent = navigator?.userAgent
  cookie = new CookieService {
    initialCookies
    setCookie: (key, value, options) ->
      document.cookie = cookieLib.serialize \
        key, value, options
  }
  lang = new LanguageService {
    language
    cookie
    # prod uses bundled language json
    files: if config.ENV isnt config.ENVS.PROD then Lang.getLangFiles()
  }
  portal = new PortalService {lang}
  browser = new WindowService {cookie, userAgent}
  model = new Model {
    io, portal, lang, cookie, userAgent
  }

  onOnline = ->
    model.statusBar.close()
    model.exoid.enableInvalidation()
    model.exoid.invalidateAll()
  onOffline = ->
    model.exoid.disableInvalidation()
    model.statusBar.open {
      text: lang.get 'status.offline'
    }

  # TODO: show status bar for translating
  # @isTranslateCardVisibleStreams = new RxReplaySubject 1
  lang.getLanguage().take(1).subscribe (lang) ->
    console.log 'lang', lang
    needTranslations = ['fr', 'es']
    isNeededLanguage = lang in needTranslations
    translation =
      ko: '한국어'
      ja: '日本語'
      zh: '中文'
      de: 'deutsche'
      es: 'español'
      fr: 'français'
      pt: 'português'

    if isNeededLanguage and not cookie.get 'hideTranslateBar'
      model.statusBar.open {
        text: lang.get 'translateBar.request', {
          replacements:
            language: translation[language] or language
          }
        type: 'snack'
        onClose: =>
          cookie.set 'hideTranslateBar', '1'
        action:
          text: lang.get 'general.yes'
          onclick: ->
            ga? 'send', 'event', 'translate', 'click', language
            portal.call 'browser.openWindow',
              url: 'https://crowdin.com/project/FIXME' # FIXME
              target: '_system'
      }


  ###
  # Service workers
  # previously we didn't wait for load event. adding to see if it gets rid of
  # "Failed to register a ServiceWorker: The document is in an invalid state"
  # on some devices. Might be better anyways so initial load can be quicker?
  ###
  window.addEventListener 'load', ->
    ServiceWorkerService.register {model}

  portal.listen()

  ###
  # DOM stuff
  ###

  init = ->
    console.log 'INIIIIIIIT'
    router = new RouterService {
      model, cookie, lang, portal
      router: new LocationRouter()
      host: window.location.host
    }

    # alternative is to find a way for zorium to subscribe to observables
    # to not start with null
    # (flash with whatever obs data is on page going empty for 1 frame), then
    # render after a few ms
    # root = document.getElementById('zorium-root').cloneNode(true)
    requestsStream = router.getStream().publishReplay(1).refCount()
    console.log 'HMR RENDER'
    render (z $app, {
      key: Math.random() # for hmr to work properly
      requestsStream
      model
      router
      portal
      lang
      cookie
      browser
      isBackendUnavailable
      currentNotification
    }), document.body # document.documentElement

    # re-fetch and potentially replace data, in case html is served from cache
    model.validateInitialCache()

    # window.addEventListener 'beforeinstallprompt', (e) ->
    #   e.preventDefault()
    #   model.installOverlay.setPrompt e
    #   return false

    portal.call 'networkInformation.onOffline', onOffline
    portal.call 'networkInformation.onOnline', onOnline

    portal.call 'statusBar.setBackgroundColor', {
      color: colors.getRawColor colors.$primary700
    }

    portal.call 'app.onBack', ->
      router.back({fromNative: true})

    lastVisitDate = cookie.get 'lastVisitDate'
    currentDate = DateService.format new Date(), 'yyyy-mm-dd'
    daysVisited = parseInt cookie.get 'daysVisited'
    if lastVisitDate isnt currentDate
      if isNaN daysVisited
        daysVisited = 0
      cookie.set 'lastVisitDate', currentDate
      daysVisited += 1
      cookie.set 'daysVisited', daysVisited


    # iOS scrolls past header
    # portal.call 'keyboard.disableScroll'
    # portal.call 'keyboard.onShow', ({keyboardHeight}) ->
    #   browser.setKeyboardHeight keyboardHeight
    # portal.call 'keyboard.onHide', ->
    #   browser.setKeyboardHeight 0

    routeHandler = (data) ->
      data ?= {}
      {path, query, source, _isPush, _original, _isDeepLink} = data

      if _isDeepLink
        return router.goPath path

      # ios fcm for now. TODO: figure out how to get it a better way
      if not path and typeof _original?.additionalData?.path is 'string'
        path = JSON.parse _original.additionalData.path

      if query?.accessToken?
        model.auth.setAccessToken query.accessToken

      if _isPush and _original?.additionalData?.foreground
        model.exoid.invalidateAll()
        if Environment.isIos() and Environment.isNativeApp()
          portal.call 'push.setBadgeNumber', {number: 0}

        currentNotification.next {
          title: _original?.additionalData?.title or _original.title
          message: _original?.additionalData?.message or _original.message
          type: _original?.additionalData?.type
          data: {path}
        }
      else if path?
        ga? 'send', 'event', 'hit_from_share', 'hit', JSON.stringify path
        if path?.key
          router.go path.key, path.params
        else if typeof path is 'string'
          router.goPath path # from deeplinks
      # else
      #   router.go()

      if data.logEvent
        {category, action, label} = data.logEvent
        ga? 'send', 'event', category, action, label

    portal.call 'top.onData', (e) ->
      console.log 'top on data', e
      routeHandler e

    (if Environment.isNativeApp()
      portal.call 'top.getData'
    else
      Promise.resolve null)
    .then routeHandler
    .catch (err) ->
      console.log err
      router.go()
    .then ->
      portal.call 'app.isLoaded'

      # untilStable hangs many seconds and the timeout (200ms) doesn't  work
      if model.wasCached()
        new Promise (resolve) ->
          # give time for exoid combinedStreams to resolve
          # (dataStreams are cached, combinedStreams are technically async)
          # so we don't get flicker or no data
          setTimeout resolve, 1 # dropped from 300 to see if it causes any issues
          # z.untilStable $app, {timeout: 200} # arbitrary
      else
        null
    .then ->
      requestsStream.do(({path}) ->
        if window?
          ga? 'send', 'pageview', path
      ).subscribe()

      # nextTick prevents white flash, lets first render happen
      # window.requestAnimationFrame ->
      #   $$root = document.getElementById 'zorium-root'
      #   $$root.parentNode.replaceChild root, $$root

    # window.addEventListener 'resize', app.onResize
    # portal.call 'orientation.onChange', app.onResize

    (if Environment.isNativeApp()
      PushService.register {model, isAlwaysCalled: true}
      .then ->
        PushService.init {model, portal, cookie}
    else
      Promise.resolve null)
    .then ->
      portal.call 'app.onResume', ->
        # console.log 'resume invalidate'
        model.exoid.invalidateAll()
        browser.resume()
        if Environment.isIos() and Environment.isNativeApp()
          portal.call 'push.setBadgeNumber', {number: 0}

  if document.readyState isnt 'complete' and
      not document.getElementById 'zorium-root'
    document.addEventListener 'DOMContentLoaded', init
  else
    init()
  #############################
  # ENABLE WEBPACK HOT RELOAD #
  #############################

  if module.hot
    module.hot.accept()
