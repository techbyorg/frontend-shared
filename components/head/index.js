import { z } from 'zorium'
import * as _ from 'lodash-es'

import fontsCss from './fonts'

export default function $head (props) {
  const { serverData, model, config } = props

  const bundlePath = serverData?.bundlePath ||
    globalThis?.document?.getElementById('bundle')?.src
  const bundleCssPath = serverData?.bundleCssPath ||
    globalThis?.document?.getElementById('bundle-css')?.href

  // {modelSerialization} = useStream ->
  //   modelSerialization: unless globalThis?.window?
  //     model.getSerializationStream()

  const modelSerialization = !globalThis?.window && model.getSerialization()

  const isInliningSource = config.ENV === config.ENVS.PROD

  console.log('serial', modelSerialization)

  return [
    z('script#model.model', {
      key: 'model',
      dangerouslySetInnerHTML: {
        __html: modelSerialization || ''
      }
    }),

    z('script#ga1', {
      key: 'ga1',
      dangerouslySetInnerHTML: {
        __html: `\
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)}; \
ga.l=+new Date; \
ga('create', '${config.GOOGLE_ANALYTICS_ID}', 'auto'); \
window.addEventListener('error', function(e) { \
ga( \
'send', 'event', 'error', e.message, e.filename + ':  ' + e.lineno \
); \
});\
`
      }
    }),
    z('script#ga2', {
      key: 'ga2',
      async: true,
      src: 'https://www.google-analytics.com/analytics.js'
    }),

    z('style#fonts', { key: 'fonts' }, fontsCss),

    // styles
    isInliningSource &&
      z('link#bundle-css', {
        rel: 'stylesheet',
        type: 'text/css',
        href: bundleCssPath
      }),

    // scripts
    z('script#bundle', {
      key: 'bundle',
      async: true,
      src: bundlePath || `${config.WEBPACK_DEV_URL}/bundle.js`
    })
  ]
}

export function getDefaultMeta ({ lang, colors, config }) {
  return {
    title: lang.get('homePage.title'),
    description: lang.get('homePage.description'),

    metas: [
      {
        name: 'viewport',
        content: 'initial-scale=1.0, width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, minimal-ui, viewport-fit=cover'
      },
      // {
      //   'http-equiv': 'Content-Security-Policy'
      //   content: "default-src 'self' file://* *; style-src 'self'" +
      //     " 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      // }
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'theme-color', content: `${colors.getRawColor(colors.$primaryMain)}` },
      { name: 'msapplication-tap-highlight', content: 'no' }
    ],

    links: _.filter([
      { rel: 'apple-touch-icon', href: config.ICON_256_URL },
      // {rel: 'canonical', href: "#{meta.canonical}"}
      { rel: 'icon', href: config.FAVICON_URL },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com/' }, // faster dns for fonts
      config.HAS_MANIFEST
        ? { rel: 'manifest', href: '/manifest.json' } : undefined
    ]),

    twitter: {},

    openGraph: {
      // image: ''
      site_name: config.APP_NAME
    }
  }
}

export function getDefaultCssVariables ({ colors, router }) {
  let cssColors = colors.default
  if (router.getHost() === 'data.upchieve.org') {
    cssColors = _.defaults({
      '--primary-50': '#E3FAF5',
      '--primary-100': '#B9F2E6',
      '--primary-200': '#8BE9D5',
      '--primary-300': '#5CE0C4',
      '--primary-400': '#39D9B7',
      '--primary-500': '#16D2AA',
      '--primary-600': '#13CDA3',
      '--primary-700': '#10C799',
      '--primary-800': '#0CC190',
      '--primary-900': '#06B67F',
      '--primary-main': '#16d2aa', // primary500
      '--primary-main-8': 'rgba(22, 210, 170, 0.08)'
    }, cssColors)
  } else if (router.getHost() === 'numberwang.hackclub.com' || true) {
    cssColors = _.defaults({
      '--primary-50': '#FDE7EA',
      '--primary-100': '#F9C3CB',
      '--primary-200': '#F69BA8',
      '--primary-300': '#F27385',
      '--primary-400': '#EF556A',
      '--primary-500': '#EC3750',
      '--primary-600': '#EA3149',
      '--primary-700': '#E72A40',
      '--primary-800': '#E42337',
      '--primary-900': '#DF1627',
      '--primary-main': '#EC3750', // primary500
      '--primary-main-8': 'rgba(236, 55, 80, 0.08)'
    }, cssColors)
  }
  cssColors['--drawer-header-500'] = cssColors['--drawer-header-500'] ||
     cssColors['--primary-500']
  cssColors['--drawer-header-500-text'] = cssColors['--drawer-header-500-text'] ||
    cssColors['--primary-500-text']
  const cssVariables = _.map(cssColors, (value, key) => `${key}:${value}`).join(';')
  return cssVariables // || cookie.get('cachedCssVariables')
}
