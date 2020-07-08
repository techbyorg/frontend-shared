import { z, classKebab, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import HttpHash from 'http-hash'
import * as rx from 'rxjs/operators'

import { getDefaultMeta } from './components/head'
// import $navDrawer from './components/nav_drawer'
// import $bottomBar from './components/bottom_bar'
import Environment from './services/environment'
import useMeta from './services/use_meta'
import GlobalContext from './context'

// TODO: clean this up a bit
export default function $app (props) {
  const {
    routes, serverData, model, router, portal,
    lang, cookie, browser, config, colors
  } = props

  const { hash, requestsStream } = useMemo(() => {
    let isFirstRequest = true
    const hash = new HttpHash()
    _.forEach(routes, ($page, key) => // there can be multiple paths per route, 1 per language
      _.forEach(lang.getAllPathsByRouteKey(key), path =>
        hash.set(path, () => $page)
      )
    )

    const requestsStream = props.requestsStream.pipe(
      rx.map(function (req) {
        let path
        if (isFirstRequest && isNativeApp) {
          path = cookie.get('routerLastPath') || req.path
          if (typeof window !== 'undefined' && window !== null) {
            req.path = path // doesn't work server-side
          } else {
            req = _.defaults({ path }, req)
          }
        }

        // TODO: non-hardcoded version. need to grab corresponding orgId
        // from domain and store as cookie?
        const host = router.getHost()
        console.log('server', host)
        let route
        if (host === 'data.upchieve.org') {
          route = hash.get(`/org/upchieve/${req.path}`)
        } else {
          route = hash.get(req.path)
        }

        const $page = route.handler()
        isFirstRequest = false
        return { req, route, $page }
      }),

      rx.publishReplay(1),
      rx.refCount()
    )

    return {
      hash,
      requestsStream
    }
  }, [])

  let userAgent = browser.getUserAgent()
  var isNativeApp = Environment.isNativeApp({ userAgent })

  // used for overlay pages
  router.setRequests(requestsStream)

  // used if state / requestsStream fails to work
  const $backupPage = (() => {
    if (serverData != null) {
      let serverPath
      if (isNativeApp) {
        serverPath = cookie.get('routerLastPath') || serverData.req.path
      } else {
        serverPath = serverData.req.path
      }
      return hash.get(serverPath).handler?.()
    } else {
      return routes.fourOhFour
    }
  })()

  const {
    request, me, windowSize, $overlays
  } = useStream(() => ({
    me,
    $overlays: model.overlay.get$(),
    // $tooltip: model.tooltip.get$(),
    windowSize: browser.getSize(),
    request: requestsStream.pipe(rx.tap(function (request) {
      if (request.$page === routes.fourOhFour) {
        return serverData?.res?.status?.(404)
      }
    }))
  }))

  userAgent = browser.getUserAgent()
  const isIos = Environment.isIos({ userAgent })
  const isAndroid = Environment.isAndroid({ userAgent })
  const isFirefox = userAgent?.indexOf('Firefox') !== -1

  let $page, $overlayPage
  if (router.preservedRequest) {
    $page = router.preservedRequest?.$page
    $overlayPage = request?.$page
  } else {
    $page = request?.$page || $backupPage
  }

  const hasOverlayPage = ($overlayPage != null)

  const focusTags = ['INPUT', 'TEXTAREA', 'SELECT']

  const pageProps = {
    serverData,
    requestsStream: requestsStream.pipe(
      rx.filter(request => request.$page === $page)
    )
  }

  useMeta(() => getDefaultMeta({ lang, colors, config }), [])

  return z(GlobalContext.Provider, {
    value: { model, router, portal, lang, cookie, browser, config, colors }
  }, [
    z('#zorium-root', {
      key: props.key,
      className: classKebab({ isIos, isAndroid, isFirefox, hasOverlayPage }),
      onclick: Environment.isIos() && function (e) {
        const focusTag = document.activeElement.tagName
        if (Array.from(focusTags).includes(focusTag) &&
          !(Array.from(focusTags).includes(e.target.tagName))
        ) {
          return document.activeElement.blur()
        }
      }
    }, [
      z('.z-root', [
        // unless hideDrawer
        //   z $navDrawer, {
        //     currentPath: request?.req.path
        //   }

        z('.content', {
          style: {
            height: `${windowSize.height}px`
          }
        }, [
          z('.page', { key: 'page' }, [
            z($page, pageProps)
          ]),

          $overlayPage &&
            z('.overlay-page', {
              key: 'overlay-page',
              style: {
                height: `${windowSize.height}px`
              }
            }, z($overlayPage, pageProps)),

          z('#overlays-portal',
            // legacy overlays
            _.map($overlays, $overlay => $overlay)
          ),

          // z $tooltip

          // used in color.js to detect support
          z('#css-variable-test', {
            style: {
              display: 'none',
              backgroundColor: 'var(--test-color)'
            }
          })
        ])
      ])
    ])
  ])
}
