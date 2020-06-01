import {z, classKebab, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import HttpHash from 'http-hash'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import useMetaTags from 'react-metatags-hook'

import {getDefaultMeta} from './components/head'
# $navDrawer = require './components/nav_drawer'
import $bottomBar from './components/bottom_bar'
import Environment from './services/environment'
import GlobalContext from './context'

# TODO: clean this up a bit
export default $app = (props) ->
  {routes, requestsStream, serverData, model, router, portal,
    lang, cookie, browser, isCrawler, config, colors} = props

  {hash, requestsStream} = useMemo ->
    hash = new HttpHash()
    _.forEach routes, ($page, key) ->
      # there can be multiple paths per route, 1 per language
      _.forEach lang.getAllPathsByRouteKey(key), (path) ->
        hash.set path, -> $page

    requestsStream = requestsStream.pipe(
      rx.map (req) ->
        if isFirstRequest and isNativeApp
          path = cookie.get('routerLastPath') or req.path
          if window?
            req.path = path # doesn't work server-side
          else
            req = _.defaults {path}, req

        # subdomain = router.getSubdomain()
        #
        # if subdomain # equiv to /entitySlug/route
        #   route = routes.get "/#{subdomain}#{req.path}"
        #   if route.handler?() is routes.fourOhFour
        #     route = routes.get req.path
        # else
        console.log 'hash get', req.path
        route = hash.get req.path

        $page = route.handler()
        isFirstRequest = false
        {req, route, $page: $page}

      rx.publishReplay(1)
      rx.refCount()
    )

    {
      hash
      requestsStream
    }
  , []

  userAgent = browser.getUserAgent()
  isNativeApp = Environment.isNativeApp {userAgent}

  isFirstRequest = true

  # used for overlay pages
  router.setRequests requestsStream

  # used if state / requestsStream fails to work
  $backupPage = if serverData?
    if isNativeApp
      serverPath = cookie.get('routerLastPath') or serverData.req.path
    else
      serverPath = serverData.req.path
    hash.get(serverPath).handler?()
  else
    routes.fourOhFour

  {request, me, hideDrawer, statusBarData, windowSize,
    $overlays, $tooltip} = useStream ->
    me: me
    $overlays: model.overlay.get$()
    $tooltip: model.tooltip.get$()
    windowSize: browser.getSize()
    request: requestsStream.pipe rx.tap (request) ->
      if request.$page is routes.fourOhFour
        serverData?.res?.status? 404


  userAgent = browser.getUserAgent()
  isIos = Environment.isIos {userAgent}
  isAndroid = Environment.isAndroid {userAgent}
  isFirefox = userAgent?.indexOf('Firefox') isnt -1

  if router.preservedRequest
    $page = router.preservedRequest?.$page
    $overlayPage = request?.$page
    hasBottomBar = $overlayPage.hasBottomBar
  else
    $page = request?.$page or $backupPage
    hasBottomBar = $page?.$bottomBar

  hasOverlayPage = $overlayPage?

  focusTags = ['INPUT', 'TEXTAREA', 'SELECT']

  pageProps = {
    serverData
    # FIXME!
    # $bottomBar: if $page.hasBottomBar then z $bottomBar, {
    #   model, router, requestsStream, serverData
    # }
    requestsStream: requestsStream.pipe rx.filter (request) ->
      request.$page is $page
  }

  useMetaTags getDefaultMeta({lang, colors, config}), []

  z GlobalContext.Provider, {
    value: {
      model, router, portal, lang, cookie, browser, config, colors
    }
  },
    z '#zorium-root', {
      key: props.key
      className: classKebab {isIos, isAndroid, isFirefox, hasOverlayPage}
      onclick: if Environment.isIos()
        (e) ->
          focusTag = document.activeElement.tagName
          if focusTag in focusTags and not (e.target.tagName in focusTags)
            document.activeElement.blur()
    },
      z '.z-root',
        # unless hideDrawer
        #   z $navDrawer, {
        #     currentPath: request?.req.path
        #   }

        z '.content', {
          style:
            height: "#{windowSize.height}px"
        },
          z '.page', {key: 'page'},
            z $page, pageProps

        if $overlayPage
          z '.overlay-page', {
            key: 'overlay-page'
            style:
              height: "#{windowSize.height}px"
          },
            z $overlayPage, pageProps

        z '#overlays-portal',
          # legacy overlays
          _.map $overlays, ($overlay) ->
            $overlay

        # z $tooltip

        # used in color.coffee to detect support
        z '#css-variable-test',
          style:
            display: 'none'
            backgroundColor: 'var(--test-color)'

