/* eslint-disable
    no-return-assign,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import * as _ from 'lodash-es'
import qs from 'qs-lite'

import Environment from '../services/environment'
import SemverService from '../services/semver'
import sharedConfig from '../shared_config'

function ev (
  // coffeelint: disable=missing_fat_arrows
  fn
) {
  return function (e) {
    const $$el = this
    return fn(e, $$el)
  }
}
// coffeelint: enable=missing_fat_arrows

function isSimpleClick (e) {
  return !((e.which > 1) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey)
}

class RouterService {
  constructor ({ router, model, cookie, lang, portal, host }) {
    this.goPath = this.goPath.bind(this)
    this.go = this.go.bind(this)
    this.getFund = this.getFund.bind(this)
    this.goFund = this.goFund.bind(this)
    this.getOrg = this.getOrg.bind(this)
    this.goOrg = this.goOrg.bind(this)
    this.get = this.get.bind(this)
    this.removeOverlay = this.removeOverlay.bind(this)
    this.overlayOnBack = this.overlayOnBack.bind(this)
    this.goOverlay = this.goOverlay.bind(this)
    this.setEntitySlug = this.setEntitySlug.bind(this)
    this.setRequests = this.setRequests.bind(this)
    this.openLink = this.openLink.bind(this)
    this.back = this.back.bind(this)
    this.onBack = this.onBack.bind(this)
    this.openInAppBrowser = this.openInAppBrowser.bind(this)
    this.openAddon = this.openAddon.bind(this)
    this.getStream = this.getStream.bind(this)
    this.getSubdomain = this.getSubdomain.bind(this)
    this.link = this.link.bind(this)
    this.linkIfHref = this.linkIfHref.bind(this)
    this.router = router
    this.model = model
    this.cookie = cookie
    this.lang = lang
    this.portal = portal
    this.host = host
    this.history = (typeof window !== 'undefined' && window !== null) ? [window.location.pathname] : []
    this.requestsStream = null
    this.onBackFn = null
    this.entitySlug = null
  }

  goPath (path, options) {
    if (options == null) { options = {} }
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

  go (routeKey, replacements, options) {
    if (options == null) { options = {} }
    const path = this.get(routeKey, replacements, options)
    console.log('gott', path, routeKey)
    return this.goPath(path, options)
  }

  // FIXME: this should be in fundraise repo, not frontend-shared
  getFund (fund, tab) {
    if (tab) {
      return this.get('fundByEinWithTab', {
        tab, slug: _.kebabCase(fund?.name), ein: fund?.ein
      })
    } else {
      return this.get('fundByEin', { slug: _.kebabCase(fund?.name), ein: fund?.ein })
    }
  }

  goFund (fund) {
    return this.goPath(this.getFund(fund))
  }

  getOrg (org) {
    return this.get('orgByEin', { slug: _.kebabCase(org?.name), ein: org?.ein })
  }

  goOrg (org) {
    return this.goPath(this.getOrg(org))
  }

  get (routeKey, replacements, options) {
    if (replacements == null) { replacements = {} }

    let route = this.lang.get(routeKey, { file: 'paths', language: options?.language })

    const isEntityPage = route?.indexOf(':entitySlug') !== -1

    const entitySlug = replacements.entitySlug || this.entitySlug
    if (isEntityPage && !entitySlug) {
      console.log('entity not set yet')
      return
    }

    replacements.entitySlug = entitySlug
    const subdomain = this.getSubdomain()
    if (subdomain && (subdomain === entitySlug)) {
      route = route.replace(`/${entitySlug}`, '')
    }

    _.forEach(replacements, (value, key) => route = route.replace(`:${key}`, value))

    if (options?.qs) {
      route = `${route}?${qs.stringify(options.qs)}`
    }
    return route
  }

  removeOverlay () {
    this.preservedRequest = null
    if (this.overlayListener) {
      window.removeEventListener('popstate', this.overlayOnBack)
      return this.overlayListener = null
    }
  }

  overlayOnBack () {
    return this.removeOverlay()
  }

  goOverlay (routeKey, replacements, options) {
    if (options == null) { options = {} }
    this.overlayListener = window.addEventListener('popstate', this.overlayOnBack)

    return this.requestsStream.take(1).subscribe(request => {
      this.preservedRequest = request
      return this.go(routeKey, replacements, _.defaults(
        { keepPreserved: true }, options
      )
      )
    })
  }

  setEntitySlug (entitySlug) { this.entitySlug = entitySlug; return null }
  setRequests (requestsStream) { this.requestsStream = requestsStream; return null }

  openLink (url, target) {
    const isAbsoluteUrl = url?.match(/^(?:[a-z-]+:)?\/\//i)
    const webAppRegex = new RegExp(`https?://(${this.host})`, 'i')
    const isWebApp = url?.match(webAppRegex)
    if (!isAbsoluteUrl || isWebApp) {
      const path = isWebApp
        ? url.replace(webAppRegex, '')
        : url
      return this.goPath(path)
    } else {
      return this.portal.call('browser.openWindow', {
        url,
        target: target || '_system'
      })
    }
  }

  back (param) {
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

  onBack (onBackFn) { this.onBackFn = onBackFn; return null }

  openInAppBrowser (addon, param) {
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

  openAddon (addon, param) {
    if (param == null) { param = {} }
    const { replacements } = param
    const isNative = Environment.isNativeApp()
    const appVersion = isNative && Environment.getAppVersion()
    const isNewIAB = isNative && SemverService.gte(appVersion, '1.4.0')
    const isExternalAddon = addon.url.substr(0, 4) === 'http'
    const shouldUseIAB = isNative && isNewIAB && isExternalAddon

    if (shouldUseIAB || addon.data?.isUnframeable) {
      return this.openInAppBrowser(addon, { replacements })
    } else {
      return this.go('toolByKey', {
        key: _.kebabCase(addon.key)
      }, {
        query: {
          replacements: JSON.stringify(replacements)
        }
      })
    }
  }

  getStream () {
    return this.router.getStream()
  }

  getSubdomain () {
    const hostParts = this.host?.split('.')
    const isStaging = hostParts[0] === 'free-roam-staging'
    if ((hostParts.length === 3) && !isStaging) {
      return hostParts[0]
    }
  }

  link (node) {
    node.props.onclick = ev((e, $$el) => {
      if (isSimpleClick(e)) {
        e.preventDefault()
        return this.openLink(node.props.href, node.props.target)
      }
    })

    return node
  }

  linkIfHref (node) {
    if (node.props.href) {
      node.type = 'A'
      this.link(node)
    }

    return node
  }
}

export default RouterService
