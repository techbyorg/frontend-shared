{z, renderToString} = require 'zorium'
express = require 'express'
_every = require 'lodash/every'
_values = require 'lodash/values'
_defaults = require 'lodash/defaults'
_map = require 'lodash/map'
compress = require 'compression'
helmet = require 'helmet'
Promise = require 'bluebird'
cookieParser = require 'cookie-parser'
fs = require 'fs'
socketIO = require 'socket.io-client'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

RouterService = require './router'
LanguageService = require './language'
CookieService = require './cookie'
WindowService = require './window'
request = require './request'

MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS = 10886400000 # 18 weeks
HEALTHCHECK_TIMEOUT = 200
RENDER_TO_STRING_TIMEOUT_MS = 1200
BOT_RENDER_TO_STRING_TIMEOUT_MS = 4500

export default setup = ({$app, Lang, Model, gulpPaths, config}) ->
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
      Promise.cast(request(config.API_URL + '/ping'))
        .timeout HEALTHCHECK_TIMEOUT
        .reflect()
    ]
    .spread (api) ->
      result =
        api: api.isFulfilled()

      isHealthy = _every _values result
      if isHealthy
        res.json {healthy: isHealthy}
      else
        res.status(500).json _defaults {healthy: isHealthy}, result
    .catch next

  app.use '/sitemap.txt', (req, res, next) ->
    request(config.API_URL + '/sitemap', {json: true})
    .then (paths) ->
      res.setHeader 'Content-Type', 'text/plain'
      res.send (_map paths, (path) -> "https://#{config.HOST}#{path}").join "\n"

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

    io = socketIO config.API_HOST, {
      path: (config.API_PATH or '') + '/socket.io'
      timeout: 5000
      transports: ['websocket']
    }
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
      serverHeaders: req.headers
    }
    router = new RouterService {
      model, cookie, lang, host
      router: null
    }
    requestsStream = new RxBehaviorSubject(req)

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

    onError = (err) ->
      console.log 'CAUGGGHTTT'
      console.log Date.now() - start
      io.disconnect()
      model.dispose()
      disposable?.unsubscribe()
      if err?.message?.indexOf('Timeout') is -1
        console.log err
      if err.html
        if err.html.indexOf('<HEAD') is -1
          res.redirect 302, '/'
        else
          res.send '<!DOCTYPE html>' + err.html
      else
        if config.ENV is config.ENVS.PROD and req.path isnt '/'
          res.redirect 302, '/'
        else
          next err

    try
      html = await renderToString (z $app, {
        requestsStream, model, lang, cookie, browser, serverData, router, isCrawler
      }), {
        timeout: if isCrawler \
                 then BOT_RENDER_TO_STRING_TIMEOUT_MS \
                 else RENDER_TO_STRING_TIMEOUT_MS
      }
      console.log Date.now() - start
      io.disconnect()
      model.dispose()
      disposable = null
      # console.log html
      if html.indexOf('<HEAD') is -1
        console.log 'redir'
        res.redirect 302, '/'
      else
        console.log 'send'
        res.send '<!DOCTYPE html>' + html
    catch err
      onError err
