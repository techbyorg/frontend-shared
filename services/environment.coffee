import _includes from 'lodash/includes'

import config from '../config'

class Environment
  isMobile: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    ///
      Mobile
    | iP(hone|od|ad)
    | Android
    | BlackBerry
    | IEMobile
    | Kindle
    | NetFront
    | Silk-Accelerated
    | (hpw|web)OS
    | Fennec
    | Minimo
    | Opera\ M(obi|ini)
    | Blazer
    | Dolfin
    | Dolphin
    | Skyfire
    | Zune
    ///.test userAgent

  isAndroid: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    _includes userAgent, 'Android'

  isIos: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    Boolean userAgent?.match /iP(hone|od|ad)/g

  isNativeApp: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    _includes(userAgent?.toLowerCase(), " #{config.APP_KEY}/")

  isMainApp: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    _includes(userAgent?.toLowerCase(), " #{config.APP_KEY}/#{config.APP_KEY}")

  isEntityApp: (entityAppKey, {userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    Boolean entityAppKey and
      _includes(userAgent?.toLowerCase(), " #{config.APP_KEY}/#{entityAppKey}/")

  getAppKey: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    matches = userAgent.match /techby\/([a-zA-Z0-9-]+)/
    matches?[1] or 'browser'

  hasPushSupport: ->
    Promise.resolve Boolean window?.PushManager

  getAppVersion: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    regex = new RegExp("(#{config.APP_KEY})\/(?:[a-zA-Z0-9]+/)?([0-9\.]+)")
    matches = userAgent.match(regex)
    matches?[2]

  getPlatform: ({userAgent} = {}) =>
    userAgent ?= navigator?.userAgent

    isApp = @isNativeApp config.APP_KEY, {userAgent}

    if isApp and @isIos({userAgent}) then 'ios'
    else if isApp and @isAndroid({userAgent}) then 'android'
    else 'web'

module.exports = new Environment()
