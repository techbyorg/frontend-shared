import * as _ from 'lodash-es'
import qsStringify from 'qs/lib/stringify'
RxObservable = require('rxjs/Observable').Observable

import Environment from '../services/environment'
import SemverService from '../services/semver'
import colors from '../colors'
import config from '../config'

ev = (fn) ->
  # coffeelint: disable=missing_fat_arrows
  (e) ->
    $$el = this
    fn(e, $$el)
  # coffeelint: enable=missing_fat_arrows
isSimpleClick = (e) ->
  not (e.which > 1 or e.shiftKey or e.altKey or e.metaKey or e.ctrlKey)

class RouterService
  constructor: ({@router, @model, @cookie, @lang, @portal, @host}) ->
    @history = if window? then [window.location.pathname] else []
    @requestsStream = null
    @onBackFn = null
    @entitySlug = null

  goPath: (path, options = {}) =>
    {ignoreHistory, reset, keepPreserved, skipBlur} = options
    if @preservedRequest and not keepPreserved
      @removeOverlay()

    if Environment.isIos() and not skipBlur
      document.activeElement.blur()

    unless ignoreHistory
      @history.push(path or window?.location.pathname)

    if @history[0] is '/' or @history[0] is @get('home') or reset
      @history = [path]

    if path
      # store current page for app re-launch
      if Environment.isNativeApp() and @cookie
        @cookie.set 'routerLastPath', path

      @router?.go path

  go: (routeKey, replacements, options = {}) =>
    path = @get routeKey, replacements, options
    console.log 'gott', path, routeKey
    @goPath path, options

  getFund: (fund) =>
    @get 'fundByEin', {slug: _.kebabCase(fund?.name), ein: fund?.ein}
  goFund: (fund) =>
    @goPath @getFund fund

  getOrg: (org) =>
    @get 'orgByEin', {slug: _.kebabCase(org?.name), ein: org?.ein}
  goOrg: (org) =>
    @goPath @getOrg org

  get: (routeKey, replacements, options) =>
    replacements ?= {}

    route = @lang.get routeKey, {file: 'paths', language: options?.language}

    isEntityPage = route?.indexOf(':entitySlug') isnt -1

    entitySlug = replacements.entitySlug or @entitySlug
    if isEntityPage and not entitySlug
      console.log 'entity not set yet'
      return

    replacements.entitySlug = entitySlug
    subdomain = @getSubdomain()
    if subdomain and subdomain is entitySlug
      route = route.replace "/#{entitySlug}", ''

    _.forEach replacements, (value, key) ->
      route = route.replace ":#{key}", value

    if options?.qs
      route = "#{route}?#{qsStringify options.qs}"
    route

  removeOverlay: =>
    @preservedRequest = null
    if @overlayListener
      window.removeEventListener 'popstate', @overlayOnBack
      @overlayListener = null

  overlayOnBack: =>
    @removeOverlay()

  goOverlay: (routeKey, replacements, options = {}) =>
    @overlayListener = window.addEventListener 'popstate', @overlayOnBack

    @requestsStream.take(1).subscribe (request) =>
      @preservedRequest = request
      @go routeKey, replacements, _.defaults(
        {keepPreserved: true}, options
      )

  setEntitySlug: (@entitySlug) => null
  setRequests: (@requestsStream) => null

  openLink: (url) =>
    isAbsoluteUrl = url?.match /^(?:[a-z-]+:)?\/\//i
    webAppRegex = new RegExp "https?://(.*?)\.?(#{config.HOST})", 'i'
    isWebApp = url?.match webAppRegex
    if not isAbsoluteUrl or isWebApp
      path = if isWebApp \
             then url.replace webAppRegex, '' \
             else url
      @goPath path
    else
      @portal.call 'browser.openWindow', {
        url: url
        target: '_system'
      }

  back: ({fromNative, fallbackPath} = {}) =>
    if @preservedRequest
      @removeOverlay()
    else
      overlays = @model.overlay.get()
      unless _.isEmpty overlays
        @model.overlay.close()

    if @onBackFn
      fn = @onBackFn()
      @onBack null
      return fn
    if @model.drawer.isOpen().getValue()
      return @model.drawer.close()
    if fromNative and _.last(@history) is @get 'home'
      @portal.call 'app.exit'
    else if @history.length > 1 and window.history.length > 0
      window.history.back()
      @history.pop()
    else if fallbackPath
      @goPath fallbackPath, {reset: true}
    else
      @goPath '/'

  onBack: (@onBackFn) => null

  openInAppBrowser: (addon, {replacements} = {}) =>
    if _.isEmpty(addon.data?.translatedLanguages) or
          addon.data?.translatedLanguages.indexOf(
            @lang.getLanguageStr()
          ) isnt -1
      language = @lang.getLanguageStr()
    else
      language = 'en'

    replacements ?= {}
    replacements = _.defaults replacements, {lang: language}
    vars = addon.url.match /\{[a-zA-Z0-9]+\}/g
    url = _.reduce vars, (str, variable) ->
      key = variable.replace /\{|\}/g, ''
      str.replace variable, replacements[key] or ''
    , addon.url
    @portal.call 'browser.openWindow', {
      url: url
      target: '_blank'
      options:
        statusbar: {
          color: colors.getRawColor colors.$primaryMain
        }
        toolbar: {
          height: 56
          color: colors.getRawColor colors.$bgColor
        }
        title: {
          color: colors.getRawColor colors.$bgText
          staticText: @lang.get "#{addon.key}.title", {
            file: 'addons'
          }
        }
        closeButton: {
          # https://jgilfelt.github.io/AndroidAssetStudio/icons-launcher.html#foreground.type=clipart&foreground.space.trim=1&foreground.space.pad=0.5&foreground.clipart=res%2Fclipart%2Ficons%2Fnavigation_close.svg&foreColor=fff%2C0&crop=0&backgroundShape=none&backColor=fff%2C100&effects=none&elevate=0
          image: 'close'
          # imagePressed: 'close_grey'
          align: 'left'
          event: 'closePressed'
        }
    }, (data) =>
      @portal.portal.onMessageInAppBrowserWindow data

  openAddon: (addon, {replacements} = {}) =>
    isNative = Environment.isNativeApp()
    appVersion = isNative and Environment.getAppVersion()
    isNewIAB = isNative and SemverService.gte appVersion, '1.4.0'
    isExternalAddon = addon.url.substr(0, 4) is 'http'
    shouldUseIAB = isNative and isNewIAB and isExternalAddon

    if shouldUseIAB or addon.data?.isUnframeable
      @openInAppBrowser addon, {replacements}
    else
      @go 'toolByKey', {
        key: _.kebabCase(addon.key)
      }, {
        query:
          replacements: JSON.stringify replacements
      }

  getStream: =>
    @router.getStream()

  getSubdomain: =>
    hostParts = @host?.split '.'
    isStaging = hostParts[0] is 'free-roam-staging'
    isDevSubdomain = config.ENV is config.ENVS.DEV and hostParts.length is 7
    if (hostParts.length is 3 or isDevSubdomain) and not isStaging
      return hostParts[0]

  link: (node) =>
    node.props.onclick = ev (e, $$el) =>
      if isSimpleClick e
        e.preventDefault()
        @openLink node.props.href

    return node


module.exports = RouterService
