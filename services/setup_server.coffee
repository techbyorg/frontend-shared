import {z, renderToString, untilStable} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import express from 'express'
import compress from 'compression'
import helmet from 'helmet'
import Promise from 'bluebird'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import socketIO from 'socket.io-client'
import request from 'xhr-request'

import Environment from './environment'
import RouterService from './router'
import LanguageService from './language'
import CookieService from './cookie'
import WindowService from './window'

requestPromise = Promise.promisify request

MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS = 10886400000 # 18 weeks
HEALTHCHECK_TIMEOUT = 200
RENDER_TO_STRING_TIMEOUT_MS = 1200
BOT_RENDER_TO_STRING_TIMEOUT_MS = 4500

export default setup = ({$app, Lang, Model, gulpPaths, config, colors}) ->
  Environment.setAppKey config.APP_KEY

  app = express()
  app.use compress()

  # CSP is disabled because kik lacks support
  # frameguard header is disabled because Native app frames page
  app.disable 'x-powered-by'
  app.use helmet.xssFilter()
  app.use helmet.hsts
    # https://hstspreload.appspot.com/
    maxAge: MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS
    includeSubDomains: true # include in Google Chrome
    preload: true # include in Google Chrome
    force: true
  app.use helmet.noSniff()
  app.use cookieParser()

  app.use '/healthcheck', (req, res, next) ->
    Promise.all [
      Promise.cast(requestPromise(config.API_URL + '/ping'))
        .timeout HEALTHCHECK_TIMEOUT
        .reflect()
    ]
    .spread (api) ->
      result =
        api: api.isFulfilled()

      isHealthy = _.every _.values result
      if isHealthy
        res.json {healthy: isHealthy}
      else
        res.status(500).json _.defaults {healthy: isHealthy}, result
    .catch next

  app.use '/sitemap.txt', (req, res, next) ->
    requestPromise(config.API_URL + '/sitemap', {json: true})
    .then (paths) ->
      res.setHeader 'Content-Type', 'text/plain'
      res.send (_.map paths, (path) -> "https://#{config.HOST}#{path}").join "\n"

  app.use '/ping', (req, res) ->
    res.send 'pong'

  app.use '/setCookie', (req, res) ->
    res.statusCode = 302
    res.cookie 'first_cookie', '1', {maxAge: 3600 * 24 * 365 * 10}
    res.setHeader 'Location', decodeURIComponent req.query?.redirect_url
    res.end()

  if config.ENV is config.ENVS.PROD
  # service_worker.js max-age modified in load-balancer
  then app.use express.static(gulpPaths.dist, {maxAge: '4h'})
  else app.use express.static(gulpPaths.build, {maxAge: '4h'})

  stats = JSON.parse \
    fs.readFileSync gulpPaths.dist + '/stats.json', 'utf-8'

  app.use (req, res, next) ->
    userAgent = req.headers['user-agent']
    host = req.headers.host
    accessToken = req.query.accessToken

    # could potentially keep this connection open?
    # would reduce response time ~100ms
    # would need to namespace per user though instead of 'exoid'
    io = socketIO config.API_HOST, {
      path: (config.API_PATH or '') + '/socket.io'
      timeout: 5000
      transports: ['websocket']
    }
    start = Date.now()
    fullLanguage = req.headers?['accept-language']
    language = req.query?.lang or
      req.cookies?['language'] or
      fullLanguage?.substr(0, 2)
    unless language in config.LANGUAGES
      language = 'en'
    cookie = new CookieService {
      host
      initialCookies: req.cookies
      setCookie: (key, value, options) ->
        res.cookie key, value, options
    }
    lang = new LanguageService {language, cookie, files: Lang.getLangFiles()}
    browser = new WindowService {cookie, userAgent}
    model = new Model {
      io
      lang
      cookie
      userAgent
      authCookie: config.AUTH_COOKIE
      apiUrl: config.API_URL
      serverHeaders: req.headers
    }
    router = new RouterService {
      model, cookie, lang, host
      router: null
    }
    requestsStream = new Rx.BehaviorSubject(req)

    # for client to access
    cookie.set(
      'ip'
      req.headers?['x-forwarded-for'] or req.connection.remoteAddress
    )

    if config.ENV is config.ENVS.PROD
      scriptsCdnUrl = config.SCRIPTS_CDN_URL
      bundlePath = "#{scriptsCdnUrl}/bundle_#{stats.hash}_#{language}.js"
      bundleCssPath = "#{scriptsCdnUrl}/bundle_#{stats.hash}.css"
    else
      bundlePath = null
      bundleCssPath = null

    serverData = {req, res, bundlePath, bundleCssPath}
    userAgent = req.headers?['user-agent']
    isFacebookCrawler = userAgent?.indexOf('facebookexternalhit') isnt -1 or
        userAgent?.indexOf('Facebot') isnt -1
    isOtherBot = userAgent?.indexOf('bot') isnt -1
    isCrawler = isFacebookCrawler or isOtherBot
    start = Date.now()

    $tree = z $app, {
      requestsStream, model, lang, cookie, browser,
      serverData, router, isCrawler, config, colors
    }
    timeout = if isCrawler \
              then BOT_RENDER_TO_STRING_TIMEOUT_MS \
              else RENDER_TO_STRING_TIMEOUT_MS

    try
      # wait for initial models to load so we have exoid cache we can use
      # in 2nd render. ideal solution is what zorium does with dyo
      # https://github.com/Zorium/zorium/blob/dyo/src/index.coffee
      # but react async server-side rendering sucks atm (5/2020)
      cache = await untilStable $tree, {timeout}
    catch err
      console.log err
      cache = err.cache
    exoidCache = await model.exoid.getCacheStream().pipe(rx.take(1)).toPromise()
    model.exoid.setSynchronousCache exoidCache
    html = renderToString $tree, {cache}
    console.log 'rendered', Date.now() - start
    io.disconnect()
    model.dispose()
    disposable = null
    # console.log html
    if not html and req.path isnt '/'
      console.log 'redir'
      res.redirect 302, '/'
    else
      console.log 'send'
      res.send '<!DOCTYPE html>' + html
