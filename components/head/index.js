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
