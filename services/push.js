import Environment from '../services/environment';
import SemverService from '../services/semver';

const ONE_DAY_MS = 3600 * 24 * 1000;

class PushService {
  constructor() {
    this.setFirebaseServiceWorker = this.setFirebaseServiceWorker.bind(this);
    this.registerWeb = this.registerWeb.bind(this);
  }

  setFirebaseInfo(firebaseInfo) { this.firebaseInfo = firebaseInfo; return null; }
  // constructor: ->
  //   if window? and not Environment.isNativeApp()
  //     @isReady = new Promise (@resolveReady) => null
  //     console.log 'firebase'
  //     @isFirebaseImported = Promise.all [
  //       `import(/* webpackChunkName: "firebase" */'@firebase/app')`
  //       `import(/* webpackChunkName: "firebase" */'@firebase/messaging')`
  //     ]
  //     .then ([firebase, firebaseMessaging]) =>
  //       firebase.initializeApp firebaseInfo
  //       @firebaseMessaging = firebase.messaging()

  setFirebaseServiceWorker(registration) {
    if (this.isFirebaseImported) {
      return this.isFirebaseImported.then(() => {
        this.firebaseMessaging?.useServiceWorker(registration);
        return this.resolveReady?.();
      });
    }
  }

  init({model, portal}) {
    const onReply = function(reply) {
      const payload = reply.additionalData.payload || reply.additionalData.data;
      if (payload.conversationId) {
        return model.conversationMessage.create({
          body: reply.additionalData.inlineReply,
          conversationId: payload.conversationId
        });
      }
    };
    return portal.call('push.registerAction', {
      action: 'reply'
    }, onReply);
  }

  register({model, portal, cookie, isAlwaysCalled}) {
    return Promise.all([
      portal.call('push.register'),
      portal.call('app.getDeviceId')
      .catch(err => '')
    ])
    .then(function(...args) {
      let array = args[0], val = array[0], {token, sourceType} = val != null ? val : {}, deviceId = array[1];
      if (token != null) {
        if (!isAlwaysCalled || !cookie.get('hasPushToken')) {
          const isNativeApp = Environment.isNativeApp();
          if (sourceType == null) { sourceType = Environment.isAndroid() && isNativeApp 
                        ? 'android' 
                        : Environment.isIos() && isNativeApp 
                        ? 'ios-fcm' 
                        : 'web-fcm'; }
          model.pushToken.upsert({tokenStr: token, sourceType, deviceId});
          cookie.set('hasPushToken', 1, {ttlMs: ONE_DAY_MS});
        }

        return model.pushToken.setCurrentPushToken(token);
      }}).catch(function(err) {
      if (err.message !== 'Method not found') {
        return console.log(err);
      }
    });
  }

  registerWeb() {
    return this.isReady.then(() => {
      return this.firebaseMessaging.requestPermission()
      .then(() => {
        return this.firebaseMessaging.getToken();
      });
  }).then(function(token) {
      console.log('TOKEN', token);
      return {token, sourceType: 'web-fcm'};});
  }
}

  // subscribeToTopic: ({model, topic, token}) =>
  //   if token
  //     tokenPromise = Promise.resolve token
  //   else
  //     tokenPromise = @firebaseMessaging.getToken()
  //
  //   tokenPromise
  //   .then (token) ->
  //     model.pushTopic.subscribe {topic, token}
  //   .catch (err) ->
  //     console.log 'caught', err


export default new PushService();
