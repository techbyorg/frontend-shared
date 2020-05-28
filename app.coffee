import {z, classKebab, useMemo, useStream} from 'zorium'
import HttpHash from 'http-hash'
import _map from 'lodash/map'
import _forEach from 'lodash/forEach'
import _defaults from 'lodash/defaults'
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/operator/map'
require 'rxjs/add/operator/filter'
require 'rxjs/add/operator/switchMap'
require 'rxjs/add/observable/combineLatest'
require 'rxjs/add/observable/of'
require 'rxjs/add/operator/publishReplay'

import $head from './components/head'
# $navDrawer = require './components/nav_drawer'
import $bottomBar from './components/bottom_bar'
import Environment from './services/environment'
import GlobalContext from './context'

# TODO: clean this up a bit
module.exports = $app = (props) ->
  {routes, requestsStream, serverData, model, router, portal,
    lang, cookie, browser, isCrawler} = props

  {hash, requestsStream} = useMemo ->
    hash = new HttpHash()
    _forEach routes, ($page, key) ->
      # there can be multiple paths per route, 1 per language
      _forEach lang.getAllPathsByRouteKey(key), (path) ->
        hash.set path, -> $page

    requestsStream = requestsStream.map (req) ->
      if window? and isFirstRequest and req.query.referrer
        model.user.setReferrer req.query.referrer

      if isFirstRequest and isNativeApp
        path = cookie.get('routerLastPath') or req.path
        if window?
          req.path = path # doesn't work server-side
        else
          req = _defaults {path}, req

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
    .publishReplay(1).refCount()

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


  isNativeApp = Environment.isNativeApp {userAgent}

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
    request: requestsStream.do (request) ->
      if request.$page is routes.fourOhFour
        serverData?.res?.status? 404


  console.log 'overlay', request, $overlays

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
    requestsStream: requestsStream.filter (request) ->
      request.$page is $page
  }

  $body =
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
          _map $overlays, ($overlay) ->
            $overlay

        # z $tooltip

        # used in color.coffee to detect support
        z '#css-variable-test',
          style:
            display: 'none'
            backgroundColor: 'var(--test-color)'

  z GlobalContext.Provider, {
    value: {
      model, router, portal, lang, cookie, browser
    }
  },
    if window?
      $body
    else
      z 'html', {
        lang: 'en'
      },
        z $head, {
          requestsStream
          serverData
          # FIXME
          meta: $page?.getMeta?()
        }
        z 'body', $body
