import Fingerprint from 'fingerprintjs'
import getUuidByString from 'uuid-by-string'

import Environment from '../services/environment'
import PushService from '../services/push'
import GetAppDialog from '../components/get_app_dialog'

if window?
  PortalGun = require('portal-gun').default

urlBase64ToUint8Array = (base64String) ->
  padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  rawData = window.atob(base64)
  outputArray = new Uint8Array(rawData.length)
  i = 0
  while i < rawData.length
    outputArray[i] = rawData.charCodeAt(i)
    i += 1
  outputArray

export default class Portal
  constructor: ({@lang, @iosAppUrl, @googlePlayAppUrl}) ->
    if window?
      @portal = new PortalGun() # TODO: check isParentValid

      @appResumeHandler = null

  PLATFORMS:
    APP: 'app'
    WEB: 'web'

  setModels: (props) =>
    {@user, @installOverlay, @overlay} = props
    null

  call: (args...) =>
    unless window?
      # throw new Error 'Portal called server-side'
      return console.log 'Portal called server-side'

    @portal.call args...
    .catch (err) ->
      # if we don't catch, zorium freaks out if a portal call is in state
      # (infinite errors on page load/route)
      console.log 'missing portal call', args
      unless err.message is 'Method not found'
        console.log err
      null

  callWithError: (args...) =>
    unless window?
      # throw new Error 'Portal called server-side'
      return console.log 'Portal called server-side'

    @portal.call args...

  listen: =>
    unless window?
      throw new Error 'Portal called server-side'

    @portal.listen()

    @portal.on 'auth.getStatus', @authGetStatus
    @portal.on 'share.any', @shareAny
    @portal.on 'env.getPlatform', @getPlatform
    @portal.on 'app.install', @appInstall
    @portal.on 'app.rate', @appRate
    @portal.on 'app.getDeviceId', @appGetDeviceId

    # fallbacks
    @portal.on 'app.onResume', @appOnResume

    # simulate app
    @portal.on 'deepLink.onRoute', @deepLinkOnRoute

    @portal.on 'permissions.check', @permissionsCheck
    @portal.on 'permissions.request', @permissionsRequest

    @portal.on 'top.onData', -> null
    @portal.on 'top.getData', -> null
    @portal.on 'push.register', @pushRegister

    @portal.on 'twitter.share', @twitterShare
    @portal.on 'facebook.share', @facebookShare

    @portal.on 'networkInformation.onOnline', @networkInformationOnOnline
    @portal.on 'networkInformation.onOffline', @networkInformationOnOffline
    @portal.on 'networkInformation.onOnline', @networkInformationOnOnline


    @portal.on 'browser.openWindow', ({url, target, options}) ->
      window.open url, target, options


  ###
  @typedef AuthStatus
  @property {String} accessToken
  @property {String} userId
  ###

  ###
  @returns {Promise<AuthStatus>}
  ###
  authGetStatus: =>
    @model.user.getMe()
    .take(1).toPromise()
    .then (user) ->
      accessToken: user.id # Temporary
      userId: user.id

  shareAny: ({text, imageUrl, url}) =>
    ga? 'send', 'event', 'share_service', 'share_any'

    if navigator.share
      navigator.share {
        title: text
        url: url
      }
    else
      @call 'facebook.share', {text, imageUrl, url}

  getPlatform: ({gameKey} = {}) =>
    userAgent = navigator.userAgent
    switch
      when Environment.isNativeApp(gameKey, {userAgent})
        @PLATFORMS.APP
      else
        @PLATFORMS.WEB

  isChrome: ->
    navigator.userAgent.match /chrome/i

  appRate: =>
    ga? 'send', 'event', 'native', 'rate'

    @call 'browser.openWindow',
      url: if Environment.isIos() \
           then @iosAppUrl \
           else @googlePlayAppUrl
      target: '_system'

  appGetDeviceId: ->
    getUuidByString "#{new Fingerprint().get()}"

  appOnResume: (callback) =>
    if @appResumeHandler
      window.removeEventListener 'visibilitychange', @appResumeHandler

    @appResumeHandler = ->
      unless document.hidden
        callback()

    window.addEventListener 'visibilitychange', @appResumeHandler

  appInstall: =>
    iosAppUrl = @iosAppUrl
    googlePlayAppUrl = @googlePlayAppUrl

    if Environment.isAndroid() and @isChrome() and false # FIXME
      if @installOverlay.prompt
        prompt = @installOverlay.prompt
        @installOverlay.setPrompt null
      else
        @installOverlay.open()

    else if Environment.isIos()
      @call 'browser.openWindow',
        url: iosAppUrl
        target: '_system'

    else if Environment.isAndroid()
      @call 'browser.openWindow',
        url: googlePlayAppUrl
        target: '_system'

    else
      @overlay.open new GetAppDialog {
        model: {@lang, @overlay, portal: this}
        onClose: =>
          @overlay.close()
      }

  permissionsCheck: ({permissions}) ->
    console.log 'webcheck'
    Promise.resolve _.reduce permissions, (obj, permission) ->
      obj[permission] = true
      obj
    , {}

  permissionsRequest: ({permissions}) ->
    console.log 'webreq'
    Promise.resolve true


  twitterShare: ({text}) =>
    @call 'browser.openWindow', {
      url: "https://twitter.com/intent/tweet?text=#{encodeURIComponent text}"
      target: '_system'
    }

  deepLinkOnRoute: (fn) =>
    window.onRoute = (path) ->
      fn {path: path.replace('browser://', '/')}

  # facebookLogin: =>
  #   new Promise (resolve) =>
  #     FB.getLoginStatus (response) =>
  #       if response.status is 'connected'
  #         resolve {
  #           status: response.status
  #           facebookAccessToken: response.authResponse.accessToken
  #           id: response.authResponse.userID
  #         }
  #       else
  #         FB.login (response) ->
  #           resolve {
  #             status: response.status
  #             facebookAccessToken: response.authResponse.accessToken
  #             id: response.authResponse.userID
  #           }

  facebookShare: ({url}) =>
    @call 'browser.openWindow', {
      url:
        "https://www.facebook.com/sharer/sharer.php?u=#{encodeURIComponent url}"
      target: '_system'
    }

  pushRegister: ->
    PushService.registerWeb()
    # navigator.serviceWorker.ready.then (serviceWorkerRegistration) =>
    #   serviceWorkerRegistration.pushManager.subscribe {
    #     userVisibleOnly: true,
    #     applicationServerKey: urlBase64ToUint8Array config.VAPID_PUBLIC_KEY
    #   }
    #   .then (subscription) ->
    #     subscriptionToken = JSON.stringify subscription
    #     {tokenStr: subscriptionToken, sourceType: 'web'}
    #   .catch (err) =>
    #     serviceWorkerRegistration.pushManager.getSubscription()
    #     .then (subscription) ->
    #       subscription.unsubscribe()
    #     .then =>
    #       unless isSecondAttempt
    #         @pushRegister true
    #     .catch (err) ->
    #       console.log err

  networkInformationOnOnline: (fn) ->
    window.addEventListener 'online', fn

  networkInformationOnOffline: (fn) ->
    window.addEventListener 'offline', fn

  handleRouteData: (data, {model, router, notificationStream}) =>
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
        @call 'push.setBadgeNumber', {number: 0}

      notificationStream.next {
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
