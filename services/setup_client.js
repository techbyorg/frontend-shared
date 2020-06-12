import { z, render } from 'zorium'
import cookieLib from 'cookie'
import LocationRouter from 'location-router'
import socketIO from 'socket.io-client/dist/socket.io.slim.js'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Environment from './environment'
import DateService from './date'
import RouterService from './router'
import ServiceWorkerService from './service_worker'
import CookieService from './cookie'
import LogService from './log'
import LanguageService from './language'
import PortalService from './portal'
import WindowService from './window'

require('frontend-shared/polyfill')

require('../root.styl')

export default function setup ({ $app, Lang, Model, colors, config }) {
  LogService.init({ apiUrl: config.API_URL })

  Environment.setAppKey(config.APP_KEY)

  // PushService.setFirebaseInfo {
  //   apiKey: config.FIREBASE.API_KEY
  //   authDomain: config.FIREBASE.AUTH_DOMAIN
  //   databaseURL: config.FIREBASE.DATABASE_URL
  //   projectId: config.FIREBASE.PROJECT_ID
  //   messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID
  // }

  /*
   * Model stuff
   */

  const initialCookies = cookieLib.parse(document.cookie)

  const isBackendUnavailable = new Rx.BehaviorSubject(false)
  const currentNotification = new Rx.BehaviorSubject(false)

  const io = socketIO(config.API_HOST, {
    path: (config.API_PATH || '') + '/socket.io',
    // this potentially has negative side effects. firewalls could
    // potentially block websockets, but not long polling.
    // unfortunately, session affinity on kubernetes is a complete pain.
    // behind cloudflare, it seems to unevenly distribute load.
    // the libraries for sticky websocket sessions between cpus
    // also aren't great - it's hard to get the real ip sent to
    // the backend (easy as http-forwarded-for, hard as remote address)
    // and the only library that uses forwarded-for isn't great....
    // see kaiser experiments for how to pass source ip in gke, but
    // it doesn't keep session affinity (for now?) if adding polling
    transports: ['websocket']
  })
  const fullLanguage = window.navigator.languages?.[0] || window.navigator.language
  let language = initialCookies?.['language'] || fullLanguage?.substr(0, 2)
  if (!Array.from(config.LANGUAGES).includes(language)) {
    language = 'en'
  }
  const userAgent = globalThis?.navigator?.userAgent
  const cookie = new CookieService({
    initialCookies,
    host: config.HOST,
    setCookie (key, value, options) {
      document.cookie = cookieLib.serialize(key, value, options)
    }
  })
  const lang = new LanguageService({
    language,
    cookie,
    // prod uses bundled language json
    files: config.ENV === config.ENVS.PROD
      ? window.languageStrings
      : Lang.getLangFiles()
  })
  const portal = new PortalService({
    lang,
    iosAppUrl: config.IOS_APP_URL,
    googlePlayAppUrl: config.GOOGLE_PLAY_APP_URL
  })
  const browser = new WindowService({ cookie, userAgent })
  const model = new Model({
    io,
    portal,
    lang,
    cookie,
    userAgent,
    authCookie: config.AUTH_COOKIE,
    apiUrl: config.API_URL,
    host: config.HOST
  })

  function onOnline () {
    model.statusBar.close()
    model.exoid.enableInvalidation()
    return model.exoid.invalidateAll()
  }

  function onOffline () {
    model.exoid.disableInvalidation()
    return model.statusBar.open({
      text: lang.get('status.offline')
    })
  }

  // TODO: show status bar for translating
  // @isTranslateCardVisibleStreams = new Rx.ReplaySubject 1
  lang.getLanguage().pipe(rx.take(1)).subscribe(function (lang) {
    console.log('lang', lang)
    const needTranslations = ['fr', 'es']
    const isNeededLanguage = Array.from(needTranslations).includes(lang)
    const translation = {
      ko: '한국어',
      ja: '日本語',
      zh: '中文',
      de: 'deutsche',
      es: 'español',
      fr: 'français',
      pt: 'português'
    }

    if (isNeededLanguage && !cookie.get('hideTranslateBar')) {
      return model.statusBar.open({
        text: lang.get('translateBar.request', {
          replacements: {
            language: translation[language] || language
          }
        }),
        type: 'snack',
        onClose: () => {
          return cookie.set('hideTranslateBar', '1')
        },
        action: {
          text: lang.get('general.yes'),
          onclick () {
            globalThis?.window?.ga?.('send', 'event', 'translate', 'click', language)
            return portal.call('browser.openWindow', {
              url: 'https://crowdin.com/project/FIXME', // FIXME
              target: '_system'
            }
            )
          }
        }
      })
    }
  })

  /*
   * Service workers
   * previously we didn't wait for load event. adding to see if it gets rid of
   * "Failed to register a ServiceWorker: The document is in an invalid state"
   * on some devices. Might be better anyways so initial load can be quicker?
   */
  window.addEventListener('load', () => ServiceWorkerService.register({ model, lang }))

  portal.listen()

  /*
   * DOM stuff
   */

  function init () {
    console.log('INIIIIIIIT')
    const router = new RouterService({
      model,
      cookie,
      lang,
      portal,
      router: new LocationRouter(),
      host: window.location.host
    })

    // alternative is to find a way for zorium to subscribe to observables
    // to not start with null
    // (flash with whatever obs data is on page going empty for 1 frame), then
    // render after a few ms
    // root = document.getElementById('zorium-root').cloneNode(true)
    const requestsStream = router.getStream().pipe(
      rx.publishReplay(1), rx.refCount()
    )
    console.log('HMR RENDER')
    render((z($app, {
      key: Math.random(), // for hmr to work properly
      requestsStream,
      model,
      router,
      portal,
      lang,
      cookie,
      browser,
      isBackendUnavailable,
      currentNotification,
      config,
      colors
    })), document.body) // document.documentElement

    // re-fetch and potentially replace data, in case html is served from cache
    model.validateInitialCache()

    // window.addEventListener 'beforeinstallprompt', (e) ->
    //   e.preventDefault()
    //   model.installOverlay.setPrompt e
    //   return false

    portal.call('networkInformation.onOffline', onOffline)
    portal.call('networkInformation.onOnline', onOnline)

    portal.call('statusBar.setBackgroundColor', {
      color: colors.getRawColor(colors.$primary700)
    })

    portal.call('app.onBack', () => router.back({ fromNative: true }))

    const lastVisitDate = cookie.get('lastVisitDate')
    const currentDate = DateService.format(new Date(), 'yyyy-mm-dd')
    let daysVisited = parseInt(cookie.get('daysVisited'))
    if (lastVisitDate !== currentDate) {
      if (isNaN(daysVisited)) {
        daysVisited = 0
      }
      cookie.set('lastVisitDate', currentDate)
      daysVisited += 1
      cookie.set('daysVisited', daysVisited)
    }

    // iOS scrolls past header
    // portal.call 'keyboard.disableScroll'
    // portal.call 'keyboard.onShow', ({keyboardHeight}) ->
    //   browser.setKeyboardHeight keyboardHeight
    // portal.call 'keyboard.onHide', ->
    //   browser.setKeyboardHeight 0

    function routeHandler (data) {
      if (data == null) { data = {} }
      let { path, query, _isPush, _original, _isDeepLink } = data

      if (_isDeepLink) {
        return router.goPath(path)
      }

      // ios fcm for now. TODO: figure out how to get it a better way
      if (!path && (typeof _original?.additionalData?.path === 'string')) {
        path = JSON.parse(_original.additionalData.path)
      }

      if (query?.accessToken != null) {
        model.auth.setAccessToken(query.accessToken)
      }

      if (_isPush && _original?.additionalData?.foreground) {
        model.exoid.invalidateAll()
        if (Environment.isIos() && Environment.isNativeApp()) {
          portal.call('push.setBadgeNumber', { number: 0 })
        }

        currentNotification.next({
          title: _original?.additionalData?.title || _original.title,
          message: _original?.additionalData?.message || _original.message,
          type: _original?.additionalData?.type,
          data: { path }
        })
      } else if (path != null) {
        globalThis?.window?.ga?.('send', 'event', 'hit_from_share', 'hit', JSON.stringify(path))
        if (path?.key) {
          router.go(path.key, path.params)
        } else if (typeof path === 'string') {
          router.goPath(path) // from deeplinks
        }
      }
      // else
      //   router.go()

      if (data.logEvent) {
        const { category, action, label } = data.logEvent
        return globalThis?.window?.ga?.('send', 'event', category, action, label)
      }
    }

    portal.call('top.onData', function (e) {
      console.log('top on data', e)
      return routeHandler(e)
    });

    (Environment.isNativeApp()
      ? portal.call('top.getData')
      : Promise.resolve(null))
      .then(routeHandler)
      .catch(function (err) {
        console.log(err)
        return router.go()
      }).then(function () {
        portal.call('app.isLoaded')

        // untilStable hangs many seconds and the timeout (200ms) doesn't  work
        if (model.wasCached()) {
          return new Promise(resolve => // give time for exoid combinedStreams to resolve
          // (dataStreams are cached, combinedStreams are technically async)
          // so we don't get flicker or no data
            setTimeout(resolve, 1)) // dropped from 300 to see if it causes any issues
          // z.untilStable $app, {timeout: 200} # arbitrary
        } else {
          return null
        }
      }).then(() => requestsStream.pipe(rx.tap(function ({ path }) {
        if (typeof window !== 'undefined' && window !== null) {
          return globalThis?.window?.ga?.('send', 'pageview', path)
        }
      })).subscribe())

    // nextTick prevents white flash, lets first render happen
    // window.requestAnimationFrame ->
    //   $$root = document.getElementById 'zorium-root'
    //   $$root.parentNode.replaceChild root, $$root

    // window.addEventListener 'resize', app.onResize
    // portal.call 'orientation.onChange', app.onResize

    // (if Environment.isNativeApp()
    //   PushService.register {model, isAlwaysCalled: true}
    //   .then ->
    //     PushService.init {model, portal, cookie}
    // else
    //   Promise.resolve null)
    return Promise.resolve(null)
      .then(() => portal.call('app.onResume', function () {
      // console.log 'resume invalidate'
        model.exoid.invalidateAll()
        browser.resume()
        if (Environment.isIos() && Environment.isNativeApp()) {
          return portal.call('push.setBadgeNumber', { number: 0 })
        }
      }))
  }

  if ((document.readyState !== 'complete') &&
      !document.getElementById('zorium-root')) {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
  // ############################
  // ENABLE WEBPACK HOT RELOAD #
  // ############################

  if (module.hot) {
    return module.hot.accept()
  }
}
