Environment = require '../services/environment'
SemverService = require '../services/semver'
config = require '../config'

ONE_DAY_MS = 3600 * 24 * 1000

class PushService
  # constructor: ->
  #   if window? and not Environment.isNativeApp()
  #     @isReady = new Promise (@resolveReady) => null
  #     console.log 'firebase'
  #     @isFirebaseImported = Promise.all [
  #       `import(/* webpackChunkName: "firebase" */'@firebase/app')`
  #       `import(/* webpackChunkName: "firebase" */'@firebase/messaging')`
  #     ]
  #     .then ([firebase, firebaseMessaging]) =>
  #       firebase.initializeApp {
  #         apiKey: config.FIREBASE.API_KEY
  #         authDomain: config.FIREBASE.AUTH_DOMAIN
  #         databaseURL: config.FIREBASE.DATABASE_URL
  #         projectId: config.FIREBASE.PROJECT_ID
  #         messagingSenderId: config.FIREBASE.MESSAGING_SENDER_ID
  #       }
  #       @firebaseMessaging = firebase.messaging()

  setFirebaseServiceWorker: (registration) =>
    if @isFirebaseImported
      @isFirebaseImported.then =>
        @firebaseMessaging?.useServiceWorker registration
        @resolveReady?()

  init: ({model, portal}) ->
    onReply = (reply) ->
      payload = reply.additionalData.payload or reply.additionalData.data
      if payload.conversationId
        model.conversationMessage.create {
          body: reply.additionalData.inlineReply
          conversationId: payload.conversationId
        }
    portal.call 'push.registerAction', {
      action: 'reply'
    }, onReply

  register: ({model, portal, cookie, isAlwaysCalled}) ->
    Promise.all [
      portal.call 'push.register'
      portal.call 'app.getDeviceId'
      .catch (err) -> ''
    ]
    .then ([{token, sourceType} = {}, deviceId]) ->
      if token?
        if not isAlwaysCalled or not cookie.get 'hasPushToken'
          isNativeApp = Environment.isNativeApp()
          sourceType ?= if Environment.isAndroid() and isNativeApp \
                        then 'android' \
                        else if Environment.isIos() and isNativeApp \
                        then 'ios-fcm' \
                        else 'web-fcm'
          model.pushToken.upsert {tokenStr: token, sourceType, deviceId}
          cookie.set 'hasPushToken', 1, {ttlMs: ONE_DAY_MS}

        model.pushToken.setCurrentPushToken token
    .catch (err) ->
      unless err.message is 'Method not found'
        console.log err

  registerWeb: =>
    # if config.ENV is config.ENVS.DEV
    #   return Promise.resolve {
    #     token: navigator?.userAgent, sourceType: 'web-fcm'
    #   }

    @isReady.then =>
      @firebaseMessaging.requestPermission()
      .then =>
        @firebaseMessaging.getToken()
    .then (token) ->
      console.log 'TOKEN', token
      {token, sourceType: 'web-fcm'}

  # subscribeToTopic: ({model, topic, token}) =>
  #   if token
  #     tokenPromise = Promise.resolve token
  #   else
  #     tokenPromise = @firebaseMessaging.getToken()
  #
  #   tokenPromise
  #   .then (token) ->
  #     model.pushTopic.subscribe {topic, token}
  #   .catch (err) ->
  #     console.log 'caught', err


module.exports = new PushService()
