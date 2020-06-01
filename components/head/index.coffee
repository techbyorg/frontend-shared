import {z, useContext, useStream} from 'zorium'
import * as _ from 'lodash-es'

import Environment from '../../services/environment'
import fontsCss from './fonts'
import context from '../../context'

export default $head = (props) ->
  {metaHtml, lang, model, cookie, config, colors} = props

  cssColors = colors.default
  cssColors['--drawer-header-500'] ?= cssColors['--primary-500']
  cssColors['--drawer-header-500-text'] ?= cssColors['--primary-500-text']
  cssVariables = _.map(cssColors, (value, key) ->
    "#{key}:#{value}"
  ).join ';'
  cssVariables

  bundlePath = serverData?.bundlePath or
    document?.getElementById('bundle')?.src
  bundleCssPath = serverData?.bundleCssPath or
    document?.getElementById('bundle-css')?.href

  # {modelSerialization} = useStream ->
  #   modelSerialization: unless window?
  #     model.getSerializationStream()

  modelSerialization = not window? and model.getSerialization()

  config.GOOGLE_ANALYTICS_ID = 'UA-27992080-36'

  isInliningSource = config.ENV is config.ENVS.PROD

  return [
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
          ga('create', '#{config.GOOGLE_ANALYTICS_ID}', 'auto');
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

    # scripts
    z 'script#bundle',
      key: 'bundle'
      async: true
      src: bundlePath or "#{config.WEBPACK_DEV_URL}/bundle.js"

    # any conditional scripts need to be at end or else they interfere with others
    # if meta.structuredData
    #   z 'script#structured-data', {
    #     key: 'structured-data'
    #     type: 'application/ld+json'
    #     dangerouslySetInnerHTML:
    #       __html:
    #         JSON.stringify {
    #           'context': 'http://schema.org'
    #           'type': meta.structuredData.type or 'LocalBusiness'
    #           'name': meta.structuredData.name
    #           'aggregateRating': {
    #             'type': 'AggregateRating'
    #             'ratingValue': meta.structuredData.ratingValue
    #             'ratingCount': meta.structuredData.ratingCount
    #           }
    #         }
    #       }
  ]

export getDefaultMeta = ({lang, colors, config}) ->
  {
    title: lang.get 'homePage.title'
    description: lang.get 'homePage.description'
    metas: [
      {
        name: 'viewport'
        content: 'initial-scale=1.0, width=device-width, minimum-scale=1.0,
                  maximum-scale=1.0, user-scalable=0, minimal-ui,
                  viewport-fit=cover'
      }
      # {
      #   'http-equiv': 'Content-Security-Policy'
      #   content: "default-src 'self' file://* *; style-src 'self'" +
      #     " 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      # }
      {name: 'apple-mobile-web-app-capable', content: 'yes'}
      {name: 'theme-color', content: "#{colors.getRawColor colors.$primaryMain}"}
      {name: 'msapplication-tap-highlight', content: 'no'}
    ]
    links: [
      {rel: 'apple-touch-icon', href: "#{config.CDN_URL}/web_icon_256.png"}
      # {rel: 'canonical', href: "#{meta.canonical}"}
      {rel: 'icon', href: config.CDN_URL + '/favicon.png'}
      {rel: 'preconnect', href: 'https://fonts.gstatic.com/'} # faster dns for fonts
      {rel: 'manifest', href: '/manifest.json'}
    ]
    twitter: {}
    openGraph:
      # image: ''
      site_name: config.APP_NAME
  }
