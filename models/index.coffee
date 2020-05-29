import Exoid from 'exoid'
import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/combineLatest'
require 'rxjs/add/observable/of'
require 'rxjs/add/operator/take'

import Auth from './auth'
import Drawer from './drawer'
import Image from './image'
import LoginLink from './login_link'
import OfflineData from './offline_data'
import Overlay from './overlay'
import Time from './time'
import Tooltip from './tooltip'
import User from './user'
import request from '../services/request'

SERIALIZATION_KEY = 'MODEL'
# SERIALIZATION_EXPIRE_TIME_MS = 1000 * 10 # 10 seconds

module.exports = class Model
  constructor: (options) ->
    {serverHeaders, io, @cookie, @portal, lang, userAgent} = options
    serverHeaders ?= {}

    cache = window?[SERIALIZATION_KEY] or {}
    window?[SERIALIZATION_KEY] = null
    # maybe this means less memory used for long caches?
    document?.querySelector('.model')?.innerHTML = ''

    # isExpired = if serialization.expires?
    #   # Because of potential clock skew we check around the value
    #   delta = Math.abs(Date.now() - serialization.expires)
    #   delta > SERIALIZATION_EXPIRE_TIME_MS
    # else
    #   true
    # cache = if isExpired then {} else serialization
    @isFromCache = not _.isEmpty cache

    ioEmit = (event, opts) =>
      accessToken = @cookie.get 'accessToken'
      io.emit event, _.defaults {accessToken, userAgent}, opts

    proxy = (url, opts) =>
      accessToken = @cookie.get 'accessToken'
      proxyHeaders =  _.pick serverHeaders, [
        'cookie'
        'user-agent'
        'accept-language'
        'x-forwarded-for'
      ]
      request url, _.merge {
        responseType: 'json'
        query: if accessToken? then {accessToken} else {}
        headers: if _.isPlainObject opts?.body
          _.merge {
            # Avoid CORS preflight
            'Content-Type': 'text/plain'
          }, proxyHeaders
        else
          proxyHeaders
      }, opts

    if navigator?.onLine
      offlineCache = null
    else
      offlineCache = try
        JSON.parse localStorage?.offlineCache
      catch
        {}

    @initialCache = _.defaults offlineCache, cache.exoid

    @exoid = new Exoid
      ioEmit: ioEmit
      io: io
      cache: @initialCache
      isServerSide: not window?

    @token = new RxBehaviorSubject null

    @overlay = new Overlay()

    @auth = new Auth {@exoid, @cookie, pushToken: @token, lang, userAgent, @portal}

    @offlineData = new OfflineData {@exoid, @portal, @statusBar, lang}

    @image = new Image {@additionalScript}
    @loginLink = new LoginLink {@auth}
    @time = new Time {@auth}
    @user = new User {@auth, proxy, @exoid, @cookie, lang, @overlay, @portal, @router}

    @drawer = new Drawer()
    @tooltip = new Tooltip()
    @portal?.setModels {
      @user, @installOverlay, @overlay
    }

  # after page has loaded, refetch all initial (cached) requestsStream to verify they're still up-to-date
  validateInitialCache: =>
    cache = @initialCache
    @initialCache = null

    # could listen for postMessage from service worker to see if this is from
    # cache, then validate data
    requestsStream = _.map cache, (result, key) =>
      req = try
        JSON.parse key
      catch
        RxObservable.of null

      if req.path
        @auth.stream req.path, req.body, {ignoreCache: true} #, options

    # TODO: seems to use anon cookie for this. not sure how to fix...
    # i guess keep initial cookie stored and run using that?

    # so need to handle the case where the cookie changes between server-side
    # cache and the actual get (when user doesn't exist from exoid, but cookie gets user)

    RxObservable.combineLatest(
      requestsStream, (vals...) -> vals
    )
    .take(1).subscribe (responses) =>
      responses = _.zipWith responses, _.keys(cache), (response, req) ->
        {req, response}
      cacheArray = _.map cache, (response, req) ->
        {req, response}
      # see if our updated responses differ from the cached data.
      changedReqs = _.differenceWith(responses, cacheArray, _.isEqual)
      # update with new values
      _.map changedReqs, ({req, response}) =>
        console.log 'OUTDATED EXOID:', req, 'replacing...', response
        @exoid.setDataCache req, response

      # there's a change this will be invalidated every time
      # eg. if we add some sort of timer / visitCount to user.getMe
      # i'm not sure if that's a bad thing or not. some people always
      # load from cache then update, and this would basically be the same
      unless _.isEmpty changedReqs
        console.log 'invalidating html cache...'
        @portal.call 'cache.deleteHtmlCache'
        # FIXME TODO invalidate in service worker


  wasCached: => @isFromCache

  dispose: =>
    @time.dispose()
    @exoid.disposeAll()

  getSerializationStream: =>
    @exoid.getCacheStream()
    .map (exoidCache) ->
      string = JSON.stringify({
        exoid: exoidCache
        # problem with this is clock skew
        # expires: Date.now() + SERIALIZATION_EXPIRE_TIME_MS
      }).replace /<\/script/gi, '<\\/script'
      "window['#{SERIALIZATION_KEY}']=#{string};"
