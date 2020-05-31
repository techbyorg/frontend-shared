import {z, useContext, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Environment from '../../services/environment'
import fontsCss from './fonts'
import context from '../../context'

DEFAULT_IMAGE = 'https://fdn.uno/d/images/web_icon_256.png'

export default $head = (props) ->
  {meta, requestsStream, serverData, entity} = props
  {router, lang, model, browser, cookie, config, colors} = useContext context

  console.log 'render head'

  # TODO: memoize???
  _getCssVariables = (entity) ->
    cssColors = colors.default
    cssColors['--drawer-header-500'] ?= cssColors['--primary-500']
    cssColors['--drawer-header-500-text'] ?= cssColors['--primary-500-text']
    cssVariables = _.map(cssColors, (value, key) ->
      "#{key}:#{value}"
    ).join ';'
    cssVariables

  route = requestsStream.pipe rx.map ({route}) ->
    route
  path = requestsStream.pipe rx.map ({req}) ->
    req.path
  requestsStreamAndLanguage = Rx.combineLatest(
    requestsStream, lang.getLanguage(), (vals...) -> vals
  )
  meta = requestsStreamAndLanguage.pipe rx.switchMap ([{$page}, language]) ->
    meta = $page?.getMeta?()
    if meta?.map
      meta
    else
      Rx.of meta

  lastEntitySlug = null
  bundlePath = serverData?.bundlePath or
    document?.getElementById('bundle')?.src
  bundleCssPath = serverData?.bundleCssPath or
    document?.getElementById('bundle-css')?.href

  {meta, serverData, path, route, routeKey, entity, additionalCss,
    cssVariables} = useStream ->
    meta: meta
    serverData: serverData
    route: route
    path: path
    # entity: entity
    routeKey: route.pipe rx.map (route) ->
      if route?.src
        routeKey = lang.getRouteKeyByValue route.src
    # modelSerialization: unless window?
    #   # model.getSerializationStream()
    #   model.getSerialization() # synchronous since react ssr sucks atm
    cssVariables: _getCssVariables entity

  modelSerialization = not window? and model.getSerialization()

  gaId = 'UA-27992080-36'
  gaSampleRate = 100

  paths = _.mapValues lang.getAllPathsByRouteKey(routeKey), (path) ->
    pathVars = path.match /:([a-zA-Z0-9-]+)/g
    _.map pathVars, (pathVar) ->
      path = path.replace pathVar, route.params[pathVar.substring(1)]
    path

  userAgent = browser.getUserAgent()

  meta = _.merge {
    title: lang.get 'meta.defaultTitle'
    icon256: "#{config.CDN_URL}/web_icon_256.png"
    twitter:
      siteHandle: '' # TODO
      creatorHandle: '' # TODO
      # title: undefined
      # description: undefined
      # # min 280 x 150 < 1MB
      # image: 'https://fdn.uno/d/images/web_icon_1024.png'

    openGraph:
      title: undefined
      url: undefined
      description: undefined
      siteName: '' # TODO
      image: DEFAULT_IMAGE

    ios:
      # min 152 x 152
      icon: undefined

    canonical: "https://#{config.HOST}#{path or ''}"
    themeColor: colors.getRawColor colors.$primaryMain
    # reccomended 32 x 32 png
    # favicon: config.CDN_URL + '/favicon.png'
    # FIXME
    favicon: 'https://www.techby.org/assets/favicon-eec4bba32550de64c3ba12e7acaa5ef6573b23096d6cb083f72f35bae35d7f7a.png'
    manifestUrl: '/manifest.json'
  }, meta

  meta.title = "#{meta.title} | TechBy"

  meta = _.merge {
    # twitter:
    #   title: meta.title
    #   description: meta.description
    openGraph:
      title: meta.title
      url: meta.canonical
      description: meta.description
    ios:
      icon: meta.icon256
  }, meta

  {twitter, openGraph, ios} = meta

  isInliningSource = config.ENV is config.ENVS.PROD
  webpackDevUrl = config.WEBPACK_DEV_URL
  isNative = Environment.isNativeApp({userAgent})
  host = serverData?.req?.headers.host or window?.location?.host


  z 'head',
    z 'title', "#{meta.title}"
    # mobile
    z 'meta',
      name: 'viewport'
      content: 'initial-scale=1.0, width=device-width, minimum-scale=1.0,
                maximum-scale=1.0, user-scalable=0, minimal-ui,
                viewport-fit=cover'

    if meta.description
      z 'meta', {name: 'description', content: "#{meta.description}"}

    # FIXME
    # z 'meta',
    #   'http-equiv': 'Content-Security-Policy'
    #   content: "default-src 'self' file://* *; style-src 'self'" +
    #     " 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"


    # Twitter card
    z 'meta', {
      name: 'twitter:card'
      content: if openGraph.image and openGraph.image isnt DEFAULT_IMAGE \
               then 'summary_large_image' \
               else 'summary'
    }
    z 'meta', {name: 'twitter:site', content: "#{twitter.siteHandle}"}
    z 'meta', {name: 'twitter:creator', content: "#{twitter.creatorHandle}"}
    # z 'meta', {
    #   name: 'twitter:title'
    #   content: "#{twitter.title or meta.title}"
    # }
    # z 'meta', {
    #   name: 'twitter:description'
    #   content: "#{twitter.description or meta.description}"
    # }
    # z 'meta', {name: 'twitter:image', content: "#{twitter.image}"}

    # Open Graph
    z 'meta', {property: 'og:title', content: "#{openGraph.title}"}
    z 'meta', {property: 'og:type', content: 'website'}
    if openGraph.url
      z 'meta', {property: 'og:url', content: "#{openGraph.url}"}
    z 'meta', {property: 'og:image', content: "#{openGraph.image}"}
    if openGraph.description
      z 'meta', {
        property: 'og:description', content: "#{openGraph.description}"
      }
    z 'meta', {property: 'og:site_name', content: "#{openGraph.siteName}"}

    # iOS
    z 'meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}
    z 'link#apple-touch-icon', {rel: 'apple-touch-icon', href: "#{ios.icon}"}

    # misc
    if meta.canonical
      z 'link#canonical', {rel: 'canonical', href: "#{meta.canonical}"}
    z 'meta', {name: 'theme-color', content: "#{meta.themeColor}"}
    z 'link#favicon', {rel: 'icon', href: "#{meta.favicon}"}
    z 'meta', {name: 'msapplication-tap-highlight', content: 'no'}
    z 'link#gfonts-preconnect', { # faster dns for fonts
      rel: 'preconnect'
      href: 'https://fonts.gstatic.com/'
    }


    # Android
    z 'link#manifest', {rel: 'manifest', href: "#{meta.manifestUrl}"}

    # serialization
    z 'script#model.model',
      key: 'model'
      dangerouslySetInnerHTML:
        __html: modelSerialization or ''


    z 'script#ga1',
      key: 'ga1'
      dangerouslySetInnerHTML:
        __html: "
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};
          ga.l=+new Date;
          ga('create', '#{gaId}', 'auto', {
            sampleRate: #{gaSampleRate}
          });
          window.addEventListener('error', function(e) {
            ga(
              'send', 'event', 'error', e.message, e.filename + ':  ' + e.lineno
            );
          });
        "
    z 'script#ga2',
      key: 'ga2'
      async: true
      src: 'https://www.google-analytics.com/analytics.js'

    z 'style#fonts', {key: 'fonts'}, fontsCss

    # styles
    z 'style#css-variables',
      key: 'css-variables'
      dangerouslySetInnerHTML:
        __html:
          ":root {#{cssVariables or cookie.get 'cachedCssVariables'}}"
    if isInliningSource
      z 'link#bundle-css',
        rel: 'stylesheet'
        type: 'text/css'
        href: bundleCssPath
    else
      null

    # z 'link'
    _.map additionalCss, (href) ->
      z "link##{_.kebabCase(href)}",
        key: href
        rel: 'stylesheet'
        href: href

    # scripts
    z 'script#bundle',
      key: 'bundle'
      async: true
      src: bundlePath or "#{config.WEBPACK_DEV_URL}/bundle.js"

    # any conditional scripts need to be at end or else they interfere with others
    if meta.structuredData
      z 'script#structured-data', {
        key: 'structured-data'
        type: 'application/ld+json'
        dangerouslySetInnerHTML:
          __html:
            JSON.stringify {
              'context': 'http://schema.org'
              'type': meta.structuredData.type or 'LocalBusiness'
              'name': meta.structuredData.name
              'aggregateRating': {
                'type': 'AggregateRating'
                'ratingValue': meta.structuredData.ratingValue
                'ratingCount': meta.structuredData.ratingCount
              }
            }
          }
