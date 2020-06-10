import * as _ from 'lodash-es'

class Environment
  setAppKey: (@appKey) -> null

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
    _.includes userAgent, 'Android'

  isIos: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    Boolean userAgent?.match /iP(hone|od|ad)/g

  isNativeApp: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    _.includes(userAgent?.toLowerCase(), " #{@appKey}/")

  isMainApp: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    _.includes(userAgent?.toLowerCase(), " #{@appKey}/#{@appKey}")

  isEntityApp: (entityAppKey, {userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    Boolean entityAppKey and
      _.includes(userAgent?.toLowerCase(), " #{@appKey}/#{entityAppKey}/")

  getAppKey: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    matches = userAgent.match /techby\/([a-zA-Z0-9-]+)/
    matches?[1] or 'browser'

  hasPushSupport: ->
    Promise.resolve Boolean window?.PushManager

  getAppVersion: ({userAgent} = {}) ->
    userAgent ?= navigator?.userAgent
    regex = new RegExp("(#{@appKey})\/(?:[a-zA-Z0-9]+/)?([0-9\.]+)")
    matches = userAgent.match(regex)
    matches?[2]

  getPlatform: ({userAgent} = {}) =>
    userAgent ?= navigator?.userAgent

    isApp = @isNativeApp @appKey, {userAgent}

    if isApp and @isIos({userAgent}) then 'ios'
    else if isApp and @isAndroid({userAgent}) then 'android'
    else 'web'

export default new Environment()
