import { z, renderToString, untilStable } from 'zorium'
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
import { generateStaticHtml as generateStaticMetaHtml } from 'react-metatags-hook'
import { generateStaticHtml as generateStaticCssVariablesHtml } from './use_css_variables'

import $head from '../components/head'
import Environment from './environment'
import RouterService from './router'
import LanguageService from './language'
import CookieService from './cookie'
import WindowService from './window'

const requestPromise = Promise.promisify(request)

const MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS = 10886400000 // 18 weeks
const HEALTHCHECK_TIMEOUT = 200
const RENDER_TO_STRING_TIMEOUT_MS = 300
const BOT_RENDER_TO_STRING_TIMEOUT_MS = 4500

export default function setup (options) {
  const { config, gulpPaths } = options

  Environment.setAppKey(config.APP_KEY)

  const app = express()
  app.use(compress())

  // CSP is disabled because kik lacks support
  // frameguard header is disabled because Native app frames page
  app.disable('x-powered-by')
  app.use(helmet.xssFilter())
  app.use(helmet.hsts({
    // https://hstspreload.appspot.com/
    maxAge: MIN_TIME_REQUIRED_FOR_HSTS_GOOGLE_PRELOAD_MS,
    includeSubDomains: true, // include in Google Chrome
    preload: true, // include in Google Chrome
    force: true
  }))
  app.use(helmet.noSniff())
  app.use(cookieParser())

  app.use('/healthcheck', (req, res, next) => Promise.all([
    Promise.cast(requestPromise(config.API_URL + '/ping'))
      .timeout(HEALTHCHECK_TIMEOUT)
      .reflect()
  ])
    .spread(function (api) {
      const result =
      { api: api.isFulfilled() }

      const isHealthy = _.every(_.values(result))
      if (isHealthy) {
        return res.json({ healthy: isHealthy })
      } else {
        return res.status(500).json(_.defaults({ healthy: isHealthy }, result))
      }
    }).catch(next))

  app.use('/sitemap.txt', (req, res, next) =>
    requestPromise(config.API_URL + '/sitemap', { json: true })
      .then(function (paths) {
        res.setHeader('Content-Type', 'text/plain')
        return res.send((_.map(paths, path =>
          `https://${config.HOST}${path}`)).join('\n')
        )
      })
  )

  app.use('/ping', (req, res) => res.send('pong'))

  app.use('/setCookie', function (req, res) {
    res.statusCode = 302
    res.cookie('first_cookie', '1', { maxAge: 3600 * 24 * 365 * 10 })
    res.setHeader('Location', decodeURIComponent(req.query?.redirectUrl))
    return res.end()
  })

  if (config.ENV === config.ENVS.PROD) {
  // service_worker.js max-age modified in load-balancer
    app.use(express.static(gulpPaths.dist, { maxAge: '4h' }))
  } else { app.use(express.static(gulpPaths.build, { maxAge: '4h' })) }

  app.use(getRouteFn(options))

  return app
  // TODO: support dynamic ssl certs for users to point their domains @ techby
  // // https://stackoverflow.com/questions/12219639/is-it-possible-to-dynamically-return-an-ssl-certificate-in-nodejs
  // https://github.com/http-party/node-http-proxy
  // separate node.js service that's:
  // - a reverse proxy: use SNICallback to grab ssl certs from scylla
  // - API endpoint to generate ssl cert via certbot & store in scylla
  // - cron to renew certs after 45 days
  // - dns.techby.org points to dynamic-reverse-proxy
}

function getRouteFn ({ $app, config, colors, Lang, Model, gulpPaths }) {
  return async function route (req, res, next) {
    const stats = JSON.parse(
      fs.readFileSync(gulpPaths.dist + '/stats.json', 'utf-8')
    )

    let bundleCssPath, bundlePath, cache
    let userAgent = req.headers['user-agent']
    const host = req.headers.host
    // config.HOST doesn't work since we allow custom domains (eg data.upchieve.org)
    // const host = config.HOST // req.headers.host is wrong sometimes for cookie?
    // const { accessToken } = req.query

    // could potentially keep this connection open?
    // would reduce response time ~100ms
    // would need to namespace per user though instead of 'exoid'
    const io = socketIO(config.API_HOST, {
      path: (config.API_PATH || '') + '/socket.io',
      timeout: 5000,
      transports: ['websocket']
    })
    let start = Date.now()
    const fullLanguage = req.headers?.['accept-language']
    let language = req.query?.lang ||
      req.cookies?.['language'] ||
      fullLanguage?.substr(0, 2)
    if (!Array.from(config.LANGUAGES).includes(language)) {
      language = 'en'
    }
    const cookie = new CookieService({
      host,
      initialCookies: req.cookies,
      setCookie (key, value, options) {
        return res.cookie(key, value, options)
      }
    })
    const lang = new LanguageService({
      language, cookie, files: Lang.getLangFiles()
    })
    const browser = new WindowService({ cookie, userAgent })
    const model = new Model({
      io,
      lang,
      cookie,
      userAgent,
      authCookie: config.AUTH_COOKIE,
      apiUrl: config.API_URL,
      host: config.HOST,
      serverHeaders: req.headers
    })
    const router = new RouterService({
      model,
      cookie,
      lang,
      host,
      router: null
    })
    const requestsStream = new Rx.BehaviorSubject(req)

    // for client to access
    cookie.set(
      'ip',
      req.headers?.['x-forwarded-for'] || req.connection.remoteAddress
    )

    if (config.ENV === config.ENVS.PROD) {
      const scriptsCdnUrl = config.SCRIPTS_CDN_URL
      bundlePath = `${scriptsCdnUrl}/bundle_${stats.hash}_${language}.js`
      bundleCssPath = `${scriptsCdnUrl}/bundle_${stats.hash}.css`
    } else {
      bundlePath = null
      bundleCssPath = null
    }

    const serverData = { req, res, bundlePath, bundleCssPath }
    userAgent = req.headers?.['user-agent']
    const isFacebookCrawler = (userAgent?.indexOf('facebookexternalhit') !== -1) ||
        (userAgent?.indexOf('Facebot') !== -1)
    const isOtherBot = userAgent?.indexOf('bot') !== -1
    const isCrawler = isFacebookCrawler || isOtherBot
    start = Date.now()

    const $tree = z($app, {
      requestsStream,
      model,
      lang,
      cookie,
      browser,
      serverData,
      router,
      isCrawler,
      config,
      colors
    })
    const timeout = isCrawler
      ? BOT_RENDER_TO_STRING_TIMEOUT_MS
      : RENDER_TO_STRING_TIMEOUT_MS

    try {
      // wait for initial models to load so we have exoid cache we can use
      // in 2nd render. ideal solution is what zorium does with dyo
      // https://github.com/Zorium/zorium/blob/dyo/src/index.coffee
      // but react async server-side rendering sucks atm (5/2020)
      cache = await (untilStable($tree, { timeout }))
    } catch (err) {
      console.log(err)
      cache = err?.cache
    }
    const exoidCache = await (Promise.race([
      model.exoid.getCacheStream().pipe(rx.take(1)).toPromise(),
      new Promise(resolve => setTimeout(resolve, 100))
    ]))
    model.exoid.setSynchronousCache(exoidCache)

    const bodyHtml = renderToString($tree, { cache })
    const metaHtml = generateStaticMetaHtml()
    const cssVariablesHtml = generateStaticCssVariablesHtml()
    const headHtml = renderToString(z($head, {
      serverData, metaHtml, lang, model, cookie, config, colors, router
    }))
    const html = `<html><head>${metaHtml}${cssVariablesHtml}${headHtml}</head><body>${bodyHtml}</body></html>`
    console.log('rendered', Date.now() - start)
    io.disconnect()
    model.dispose()
    // console.log html
    if (!html && (req.path !== '/')) {
      console.log('redir')
      return res.redirect(302, '/')
    } else {
      console.log('send')
      return res.send('<!DOCTYPE html>' + html)
    }
  }
}
