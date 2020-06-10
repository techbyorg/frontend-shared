// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import Exoid from 'exoid';
import * as _ from 'lodash-es';
import * as Rx from 'rxjs';
import * as rx from 'rxjs/operators';

import Auth from './auth';
import Drawer from './drawer';
import Image from './image';
import LoginLink from './login_link';
import OfflineData from './offline_data';
import Overlay from './overlay';
import StatusBar from './status_bar';
import Time from './time';
import Tooltip from './tooltip';
import User from './user';

const SERIALIZATION_KEY = 'MODEL';
// SERIALIZATION_EXPIRE_TIME_MS = 1000 * 10 # 10 seconds

export default class Model {
  constructor(options) {
    let authCookie, host, io, lang, offlineCache, serverHeaders, userAgent;
    this.validateInitialCache = this.validateInitialCache.bind(this);
    this.wasCached = this.wasCached.bind(this);
    this.dispose = this.dispose.bind(this);
    this.getSerializationStream = this.getSerializationStream.bind(this);
    this.getSerialization = this.getSerialization.bind(this);
    ({
      serverHeaders, io, cookie: this.cookie, portal: this.portal, lang, userAgent, authCookie, host
    } = options);
    if (serverHeaders == null) { serverHeaders = {}; }

    const cache = window?.[SERIALIZATION_KEY] || {};
    if (typeof window !== 'undefined' && window !== null) {
      console.log('using cache', cache);
      window[SERIALIZATION_KEY] = null;
      // maybe this means less memory used for long caches
      const $$el = document.querySelector('.model');
      $$el && ($$el.innerHTML = '');
    }

    // isExpired = if serialization.expires?
    //   # Because of potential clock skew we check around the value
    //   delta = Math.abs(Date.now() - serialization.expires)
    //   delta > SERIALIZATION_EXPIRE_TIME_MS
    // else
    //   true
    // cache = if isExpired then {} else serialization
    this.isFromCache = !_.isEmpty(cache);

    const ioEmit = (event, opts) => {
      const accessToken = this.cookie.get('accessToken');
      return io.emit(event, _.defaults({accessToken, userAgent}, opts));
    };

    const proxy = (url, opts) => {
      const accessToken = this.cookie.get('accessToken');
      const proxyHeaders =  _.pick(serverHeaders, [
        'cookie',
        'user-agent',
        'accept-language',
        'x-forwarded-for'
      ]);
      if (accessToken) {
        url += `?accessToken=${accessToken}`;
      }
      const response = await(window.fetch(url, _.merge({
        responseType: 'json',
        headers: _.isPlainObject(opts?.body) ?
          _.merge({
            // Avoid CORS preflight
            'Content-Type': 'text/plain'
          }, proxyHeaders)
        :
          proxyHeaders
      }, opts)
      )
      );
      return response.json();
    };

    if (navigator?.onLine) {
      offlineCache = null;
    } else {
      offlineCache = (() => { try {
        return JSON.parse(localStorage?.offlineCache);
      } catch (error) {
        return {};
      } })();
    }

    console.log('offline', offlineCache);
    this.initialCache = _.defaults(offlineCache, cache.exoid);
    console.log('init', this.initialCache);

    this.exoid = new Exoid({
      ioEmit,
      io,
      cache: this.initialCache,
      isServerSide: (typeof window === 'undefined' || window === null)
    });

    this.token = new Rx.BehaviorSubject(null);

    this.overlay = new Overlay();

    this.auth = new Auth({
      exoid: this.exoid, cookie: this.cookie, pushToken: this.token, lang, userAgent, portal: this.portal,
      authCookie, host
    });

    this.offlineData = new OfflineData({exoid: this.exoid, portal: this.portal, statusBar: this.statusBar, lang});

    this.image = new Image({additionalScript: this.additionalScript});
    this.loginLink = new LoginLink({auth: this.auth});
    this.statusBar = new StatusBar();
    this.time = new Time({auth: this.auth});
    this.user = new User({auth: this.auth, proxy, exoid: this.exoid, cookie: this.cookie, lang, overlay: this.overlay, portal: this.portal, router: this.router});

    this.drawer = new Drawer();
    this.tooltip = new Tooltip();
    this.portal?.setModels({
      user: this.user, installOverlay: this.installOverlay, overlay: this.overlay
    });
  }

  // after page has loaded, refetch all initial (cached) requestsStream to verify they're still up-to-date
  validateInitialCache() {
    const cache = this.initialCache;
    this.initialCache = null;

    // could listen for postMessage from service worker to see if this is from
    // cache, then validate data
    const requestsStream = _.map(cache, (result, key) => {
      const req = (() => { try {
        return JSON.parse(key);
      } catch (error) {
        return Rx.of(null);
      } })();

      if (req.path) {
        return this.auth.stream(req.body, {ignoreCache: true});
      }
  }); //, options

    // TODO: seems to use anon cookie for this. not sure how to fix...
    // i guess keep initial cookie stored and run using that?

    // so need to handle the case where the cookie changes between server-side
    // cache and the actual get (when user doesn't exist from exoid, but cookie gets user)

    return Rx.combineLatest(
      requestsStream, (...vals) => vals)
    .pipe(rx.take(1)).subscribe(responses => {
      responses = _.zipWith(responses, _.keys(cache), (response, req) => ({
        req,
        response
      }));
      const cacheArray = _.map(cache, (response, req) => ({
        req,
        response
      }));
      // see if our updated responses differ from the cached data.
      const changedReqs = _.differenceWith(responses, cacheArray, _.isEqual);
      // update with new values
      _.map(changedReqs, ({req, response}) => {
        console.log('OUTDATED EXOID:', req, 'replacing...', response);
        return this.exoid.setDataCache(req, response);
      });

      // there's a change this will be invalidated every time
      // eg. if we add some sort of timer / visitCount to user.getMe
      // i'm not sure if that's a bad thing or not. some people always
      // load from cache then update, and this would basically be the same
      if (!_.isEmpty(changedReqs)) {
        console.log('invalidating html cache...');
        return this.portal.call('cache.deleteHtmlCache');
      }
    });
  }
        // FIXME TODO invalidate in service worker


  wasCached() { return this.isFromCache; }

  dispose() {
    this.time.dispose();
    return this.exoid.disposeAll();
  }

  getSerializationStream() {
    return this.exoid.getCacheStream()
    .pipe(rx.map(function(exoidCache) {
      const string = JSON.stringify({
        exoid: exoidCache
      }).replace(/<\/script/gi, '<\\/script');
      return `window['${SERIALIZATION_KEY}']=${string};`;
    })
    );
  }

  // synchronous version for crappy react ssr
  getSerialization() {
    const exoidCache = this.exoid.getSynchronousCache();
    const string = JSON.stringify({
      exoid: exoidCache
    }).replace(/<\/script/gi, '<\\/script');
    return `window['${SERIALIZATION_KEY}']=${string};`;
  }
}
