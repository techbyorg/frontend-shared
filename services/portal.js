import Fingerprint from 'fingerprintjs'
import getUuidByString from 'uuid-by-string'
import * as _ from 'lodash-es'

import Environment from '../services/environment'
import GetAppDialog from '../components/get_app_dialog'
import PortalGun from 'portal-gun'

let Portal

export default Portal = (function () {
  Portal = class Portal {
    static initClass () {
      this.prototype.PLATFORMS = {
        APP: 'app',
        WEB: 'web'
      }
    }

    constructor ({ lang, iosAppUrl, googlePlayAppUrl }) {
      this.setModels = this.setModels.bind(this)
      this.call = this.call.bind(this)
      this.callWithError = this.callWithError.bind(this)
      this.listen = this.listen.bind(this)
      this.authGetStatus = this.authGetStatus.bind(this)
      this.shareAny = this.shareAny.bind(this)
      this.getPlatform = this.getPlatform.bind(this)
      this.appRate = this.appRate.bind(this)
      this.appOnResume = this.appOnResume.bind(this)
      this.appInstall = this.appInstall.bind(this)
      this.twitterShare = this.twitterShare.bind(this)
      this.deepLinkOnRoute = this.deepLinkOnRoute.bind(this)
      this.facebookShare = this.facebookShare.bind(this)
      this.handleRouteData = this.handleRouteData.bind(this)
      this.lang = lang
      this.iosAppUrl = iosAppUrl
      this.googlePlayAppUrl = googlePlayAppUrl
      if (typeof window !== 'undefined' && window !== null) {
        this.portal = new PortalGun() // TODO: check isParentValid

        this.appResumeHandler = null
      }
    }

    setModels (props) {
      ({ user: this.user, installOverlay: this.installOverlay, overlay: this.overlay } = props)
      return null
    }

    call (...args) {
      if (typeof window === 'undefined' || window === null) {
        // throw new Error 'Portal called server-side'
        return console.log('Portal called server-side')
      }

      return this.portal.call(...Array.from(args || []))
        .catch(function (err) {
        // if we don't catch, zorium freaks out if a portal call is in state
        // (infinite errors on page load/route)
          console.log('missing portal call', args)
          if (err.message !== 'Method not found') {
            console.log(err)
          }
          return null
        })
    }

    callWithError (...args) {
      if (typeof window === 'undefined' || window === null) {
        // throw new Error 'Portal called server-side'
        return console.log('Portal called server-side')
      }

      return this.portal.call(...Array.from(args || []))
    }

    listen () {
      if (typeof window === 'undefined' || window === null) {
        throw new Error('Portal called server-side')
      }

      this.portal.listen()

      this.portal.on('auth.getStatus', this.authGetStatus)
      this.portal.on('share.any', this.shareAny)
      this.portal.on('env.getPlatform', this.getPlatform)
      this.portal.on('app.install', this.appInstall)
      this.portal.on('app.rate', this.appRate)
      this.portal.on('app.getDeviceId', this.appGetDeviceId)

      // fallbacks
      this.portal.on('app.onResume', this.appOnResume)

      // simulate app
      this.portal.on('deepLink.onRoute', this.deepLinkOnRoute)

      this.portal.on('permissions.check', this.permissionsCheck)
      this.portal.on('permissions.request', this.permissionsRequest)

      this.portal.on('top.onData', () => null)
      this.portal.on('top.getData', () => null)
      this.portal.on('push.register', this.pushRegister)

      this.portal.on('twitter.share', this.twitterShare)
      this.portal.on('facebook.share', this.facebookShare)

      this.portal.on('networkInformation.onOnline', this.networkInformationOnOnline)
      this.portal.on('networkInformation.onOffline', this.networkInformationOnOffline)
      this.portal.on('networkInformation.onOnline', this.networkInformationOnOnline)

      return this.portal.on('browser.openWindow', ({ url, target, options }) => window.open(url, target, options))
    }

    /*
    @typedef AuthStatus
    @property {String} accessToken
    @property {String} userId
    */

    /*
    @returns {Promise<AuthStatus>}
    */
    authGetStatus () {
      return this.model.user.getMe()
        .take(1).toPromise()
        .then(user => ({
        // Temporary
          accessToken: user.id,

          userId: user.id
        }))
    }

    shareAny ({ text, imageUrl, url }) {
      globalThis?.window?.ga?.('send', 'event', 'share_service', 'share_any')

      if (navigator.share) {
        return navigator.share({
          title: text,
          url
        })
      } else {
        return this.call('facebook.share', { text, imageUrl, url })
      }
    }

    getPlatform (param) {
      if (param == null) { param = {} }
      const { gameKey } = param
      const {
        userAgent
      } = navigator
      switch (false) {
        case !Environment.isNativeApp(gameKey, { userAgent }):
          return this.PLATFORMS.APP
        default:
          return this.PLATFORMS.WEB
      }
    }

    isChrome () {
      return navigator.userAgent.match(/chrome/i)
    }

    appRate () {
      globalThis?.window?.ga?.('send', 'event', 'native', 'rate')

      return this.call('browser.openWindow', {
        url: Environment.isIos()
          ? this.iosAppUrl
          : this.googlePlayAppUrl,
        target: '_system'
      }
      )
    }

    appGetDeviceId () {
      return getUuidByString(`${new Fingerprint().get()}`)
    }

    appOnResume (callback) {
      if (this.appResumeHandler) {
        window.removeEventListener('visibilitychange', this.appResumeHandler)
      }

      this.appResumeHandler = function () {
        if (!document.hidden) {
          return callback()
        }
      }

      return window.addEventListener('visibilitychange', this.appResumeHandler)
    }

    appInstall () {
      const {
        iosAppUrl
      } = this
      const {
        googlePlayAppUrl
      } = this

      // if (Environment.isAndroid() && this.isChrome()) { // FIXME
      //   if (this.installOverlay.prompt) {
      //     return this.installOverlay.setPrompt(null)
      //   } else {
      //     return this.installOverlay.open()
      //   }
      // } else if (Environment.isIos()) {
      if (Environment.isIos()) {
        return this.call('browser.openWindow', {
          url: iosAppUrl,
          target: '_system'
        }
        )
      } else if (Environment.isAndroid()) {
        return this.call('browser.openWindow', {
          url: googlePlayAppUrl,
          target: '_system'
        }
        )
      } else {
        return this.overlay.open(new GetAppDialog({
          model: { lang: this.lang, overlay: this.overlay, portal: this },
          onClose: () => {
            return this.overlay.close()
          }
        }))
      }
    }

    permissionsCheck ({ permissions }) {
      console.log('webcheck')
      return Promise.resolve(_.reduce(permissions, function (obj, permission) {
        obj[permission] = true
        return obj
      }
      , {}))
    }

    permissionsRequest ({ permissions }) {
      console.log('webreq')
      return Promise.resolve(true)
    }

    twitterShare ({ text }) {
      return this.call('browser.openWindow', {
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        target: '_system'
      })
    }

    deepLinkOnRoute (fn) {
      window.onRoute = path => fn({ path: path.replace('browser://', '/') })
    }

    // facebookLogin: =>
    //   new Promise (resolve) =>
    //     FB.getLoginStatus (response) =>
    //       if response.status is 'connected'
    //         resolve {
    //           status: response.status
    //           facebookAccessToken: response.authResponse.accessToken
    //           id: response.authResponse.userID
    //         }
    //       else
    //         FB.login (response) ->
    //           resolve {
    //             status: response.status
    //             facebookAccessToken: response.authResponse.accessToken
    //             id: response.authResponse.userID
    //           }

    facebookShare ({ url }) {
      return this.call('browser.openWindow', {
        url:
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        target: '_system'
      })
    }

    pushRegister () {
      return null
    }
    // PushService.registerWeb()
    // navigator.serviceWorker.ready.then (serviceWorkerRegistration) =>
    //   serviceWorkerRegistration.pushManager.subscribe {
    //     userVisibleOnly: true,
    //     applicationServerKey: urlBase64ToUint8Array config.VAPID_PUBLIC_KEY
    //   }
    //   .then (subscription) ->
    //     subscriptionToken = JSON.stringify subscription
    //     {tokenStr: subscriptionToken, sourceType: 'web'}
    //   .catch (err) =>
    //     serviceWorkerRegistration.pushManager.getSubscription()
    //     .then (subscription) ->
    //       subscription.unsubscribe()
    //     .then =>
    //       unless isSecondAttempt
    //         @pushRegister true
    //     .catch (err) ->
    //       console.log err

    networkInformationOnOnline (fn) {
      return window.addEventListener('online', fn)
    }

    networkInformationOnOffline (fn) {
      return window.addEventListener('offline', fn)
    }

    handleRouteData (data, { model, router, notificationStream }) {
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
          this.call('push.setBadgeNumber', { number: 0 })
        }

        notificationStream.next({
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
  }
  Portal.initClass()
  return Portal
})()
