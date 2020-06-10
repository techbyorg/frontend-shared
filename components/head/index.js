let $head;
import {z, useContext, useStream} from 'zorium';
import * as _ from 'lodash-es';

import Environment from '../../services/environment';
import fontsCss from './fonts';
import context from '../../context';

export default $head = function(props) {
  const {serverData, metaHtml, lang, model, cookie, config, colors} = props;

  const cssColors = colors.default;
  if (cssColors['--drawer-header-500'] == null) { cssColors['--drawer-header-500'] = cssColors['--primary-500']; }
  if (cssColors['--drawer-header-500-text'] == null) { cssColors['--drawer-header-500-text'] = cssColors['--primary-500-text']; }
  const cssVariables = _.map(cssColors, (value, key) => `${key}:${value}`).join(';');
  cssVariables;

  const bundlePath = serverData?.bundlePath ||
    document?.getElementById('bundle')?.src;
  const bundleCssPath = serverData?.bundleCssPath ||
    document?.getElementById('bundle-css')?.href;

  // {modelSerialization} = useStream ->
  //   modelSerialization: unless window?
  //     model.getSerializationStream()

  const modelSerialization = (typeof window === 'undefined' || window === null) && model.getSerialization();

  const isInliningSource = config.ENV === config.ENVS.PROD;

  return [
    z('script#model.model', {
      key: 'model',
      dangerouslySetInnerHTML: {
        __html: modelSerialization || ''
      }
    }
    ),


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
    }
    ),
    z('script#ga2', {
      key: 'ga2',
      async: true,
      src: 'https://www.google-analytics.com/analytics.js'
    }
    ),

    z('style#fonts', {key: 'fonts'}, fontsCss),

    // styles
    z('style#css-variables', {
      key: 'css-variables',
      dangerouslySetInnerHTML: {
        __html:
          `:root {${cssVariables || cookie.get('cachedCssVariables')}}`
      }
    }
    ),
    isInliningSource ?
      z('link#bundle-css', {
        rel: 'stylesheet',
        type: 'text/css',
        href: bundleCssPath
      }
      )
    :
      null,

    // scripts
    z('script#bundle', {
      key: 'bundle',
      async: true,
      src: bundlePath || `${config.WEBPACK_DEV_URL}/bundle.js`
    }
    )

    // any conditional scripts need to be at end or else they interfere with others
    // if meta.structuredData
    //   z 'script#structured-data', {
    //     key: 'structured-data'
    //     type: 'application/ld+json'
    //     dangerouslySetInnerHTML:
    //       __html:
    //         JSON.stringify {
    //           'context': 'http://schema.org'
    //           'type': meta.structuredData.type or 'LocalBusiness'
    //           'name': meta.structuredData.name
    //           'aggregateRating': {
    //             'type': 'AggregateRating'
    //             'ratingValue': meta.structuredData.ratingValue
    //             'ratingCount': meta.structuredData.ratingCount
    //           }
    //         }
    //       }
  ];
};

export var getDefaultMeta = ({lang, colors, config}) => ({
  title: lang.get('homePage.title'),
  description: lang.get('homePage.description'),

  metas: [
    {
      name: 'viewport',
      content: `initial-scale=1.0, width=device-width, minimum-scale=1.0, \
maximum-scale=1.0, user-scalable=0, minimal-ui, \
viewport-fit=cover`
    },
    // {
    //   'http-equiv': 'Content-Security-Policy'
    //   content: "default-src 'self' file://* *; style-src 'self'" +
    //     " 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    // }
    {name: 'apple-mobile-web-app-capable', content: 'yes'},
    {name: 'theme-color', content: `${colors.getRawColor(colors.$primaryMain)}`},
    {name: 'msapplication-tap-highlight', content: 'no'}
  ],

  links: _.filter([
    {rel: 'apple-touch-icon', href: config.ICON_256_URL},
    // {rel: 'canonical', href: "#{meta.canonical}"}
    {rel: 'icon', href: config.FAVICON_URL},
    {rel: 'preconnect', href: 'https://fonts.gstatic.com/'}, // faster dns for fonts
    config.HAS_MANIFEST ?
      {rel: 'manifest', href: '/manifest.json'} : undefined
  ]),

  twitter: {},

  openGraph: {
    // image: ''
    site_name: config.APP_NAME
  }
});
