import * as _ from 'lodash-es'
import qs from 'qs-lite'

import Environment from '../services/environment'
import SemverService from '../services/semver'

function ev (fn) {
  return function (e) {
    const $$el = this
    return fn(e, $$el)
  }
}

function isSimpleClick (e) {
  return !((e.which > 1) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
}

class RouterService {
  constructor ({ router, model, cookie, lang, portal, host }) {
    this.router = router
    this.model = model
    this.cookie = cookie
    this.lang = lang
    this.portal = portal
    this.host = host
    this.history = (typeof window !== 'undefined') ? [window.location.pathname] : []
    this.requestsStream = null
    this.onBackFn = null
    this.orgSlug = null
  }

  goPath = (path, options = {}) => {
    const { ignoreHistory, reset, keepPreserved, skipBlur } = options
    if (this.preservedRequest && !keepPreserved) {
      this.removeOverlay()
    }

    if (Environment.isIos() && !skipBlur) {
      document.activeElement.blur()
    }

    if (!ignoreHistory) {
      this.history.push(path || globalThis?.window?.location.pathname)
    }

    if ((this.history[0] === '/') || (this.history[0] === this.get('home')) || reset) {
      this.history = [path]
    }

    if (path) {
      // store current page for app re-launch
      if (Environment.isNativeApp() && this.cookie) {
        this.cookie.set('routerLastPath', path)
      }

      return this.router?.go(path)
    }
  }

  go = (routeKey, replacements, options = {}) => {
    const path = this.get(routeKey, replacements, options)
    return this.goPath(path, options)
  }

  get = (routeKey, replacements = {}, options = {}) => {
    let route = this.lang.get(routeKey, { file: 'paths', language: options?.language })

    const isOrganizationPage = route?.indexOf(':orgSlug') !== -1

    const orgSlug = replacements.orgSlug || this.orgSlug
    if (isOrganizationPage && !orgSlug) {
      replacements.orgSlug = this.cookie.get('orgSlug')
    }

    // replacements.orgSlug = orgSlug
    // TODO: non-hardcoded
    const isCustomDomain = [
      'data.upchieve.org',
      'numberwang.hackclub.com'
    ].includes(this.getHost())
    if (isCustomDomain) {
      route = route.replace('/org/:orgSlug', '')
      if (!route) {
        route = '/'
      }
    }

    _.forEach(replacements, (value, key) => {
      route = route.replace(`:${key}`, value)
    })

    if (options?.qs) {
      route = `${route}?${qs.stringify(options.qs)}`
    }
    return route
  }

  removeOverlay = () => {
    this.preservedRequest = null
    if (this.overlayListener) {
      window.removeEventListener('popstate', this.overlayOnBack)
      this.overlayListener = null
    }
  }

  overlayOnBack = () => {
    return this.removeOverlay()
  }

  goOverlay = (routeKey, replacements, options) => {
    if (options == null) { options = {} }
    this.overlayListener = window.addEventListener('popstate', this.overlayOnBack)

    return this.requestsStream.take(1).subscribe(request => {
      this.preservedRequest = request
      return this.go(routeKey, replacements, _.defaults(
        { keepPreserved: true }, options
      ))
    })
  }

  setOrgSlug = (orgSlug) => {
    this.orgSlug = orgSlug
  }

  setRequests = (requestsStream) => {
    this.requestsStream = requestsStream
  }

  openLink = (url, target) => {
    const isMailto = url?.indexOf('mailto:') === 0
    const isAbsoluteUrl = isMailto || url?.match(/^(?:[a-z-]+:)?\/\//i)
    const webAppRegex = new RegExp(`https?://(${this.host})`, 'i')
    const isWebApp = url?.match(webAppRegex)
    const isNative = Environment.isNativeApp()
    if (!isAbsoluteUrl || isWebApp) {
      const path = isWebApp
        ? url.replace(webAppRegex, '')
        : url
      return this.goPath(path)
    } else {
      return this.portal.call('browser.openWindow', {
        url,
        target: target || isNative ? '_system' : '_blank'
      })
    }
  }

  setModel = (model) => {
    this.model = model
  }

  back = (param) => {
    if (param == null) { param = {} }
    const { fromNative, fallbackPath } = param
    if (this.preservedRequest) {
      this.removeOverlay()
    } else {
      const overlays = this.model.overlay.get()
      if (!_.isEmpty(overlays)) {
        this.model.overlay.close()
      }
    }

    if (this.onBackFn) {
      const fn = this.onBackFn()
      this.onBack(null)
      return fn
    }
    if (this.model.drawer.isOpen().getValue()) {
      return this.model.drawer.close()
    }
    if (fromNative && (_.last(this.history) === this.get('home'))) {
      return this.portal.call('app.exit')
    } else if ((this.history.length > 1) && (window.history.length > 0)) {
      window.history.back()
      return this.history.pop()
    } else if (fallbackPath) {
      return this.goPath(fallbackPath, { reset: true })
    } else {
      return this.goPath('/')
    }
  }

  onBack = (onBackFn) => {
    this.onBackFn = onBackFn
  }

  openInAppBrowser = (addon, param) => {
    let language
    if (param == null) { param = {} }
    let { colors, replacements } = param
    if (_.isEmpty(addon.data?.translatedLanguages) ||
          (addon.data?.translatedLanguages.indexOf(
            this.lang.getLanguageStr()
          ) !== -1)) {
      language = this.lang.getLanguageStr()
    } else {
      language = 'en'
    }

    if (replacements == null) { replacements = {} }
    replacements = _.defaults(replacements, { lang: language })
    const vars = addon.url.match(/\{[a-zA-Z0-9]+\}/g)
    const url = _.reduce(vars, function (str, variable) {
      const key = variable.replace(/\{|\}/g, '')
      return str.replace(variable, replacements[key] || '')
    }
    , addon.url)
    return this.portal.call('browser.openWindow', {
      url,
      target: '_blank',
      options: {
        statusbar: {
          color: colors.getRawColor(colors.$primaryMain)
        },
        toolbar: {
          height: 56,
          color: colors.getRawColor(colors.$bgColor)
        },
        title: {
          color: colors.getRawColor(colors.$bgText),
          staticText: this.lang.get(`${addon.key}.title`, {
            file: 'addons'
          })
        },
        closeButton: {
          // https://jgilfelt.github.io/AndroidAssetStudio/icons-launcher.html#foreground.type=clipart&foreground.space.trim=1&foreground.space.pad=0.5&foreground.clipart=res%2Fclipart%2Ficons%2Fnavigation_close.svg&foreColor=fff%2C0&crop=0&backgroundShape=none&backColor=fff%2C100&effects=none&elevate=0
          image: 'close',
          // imagePressed: 'close_grey'
          align: 'left',
          event: 'closePressed'
        }
      }
    }, data => {
      return this.portal.portal.onMessageInAppBrowserWindow(data)
    })
  }

  getStream = () => {
    return this.router.getStream()
  }

  getHost = () => {
    return this.host
  }

  getSubdomain = () => {
    const hostParts = this.host?.split('.')
    const isStaging = hostParts[0] === 'tech-by-staging'
    if ((hostParts.length === 3) && !isStaging) {
      return hostParts[0]
    }
  }

  link = (node) => {
    node.props.onclick = ev((e, $$el) => {
      if (isSimpleClick(e)) {
        e.preventDefault()
        return this.openLink(node.props.href, node.props.target)
      }
    })

    return node
  }

  linkIfHref = (node) => {
    if (node.props.href) {
      node.type = 'a'
      this.link(node)
    }

    return node
  }
}

export default RouterService
