import * as _ from 'lodash-es'

class Environment {
  constructor () {
    this.getPlatform = this.getPlatform.bind(this)
  }

  setAppKey (appKey) { this.appKey = appKey; return null }

  isMobile ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return new RegExp('Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune').test(userAgent)
  }

  isAndroid ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return _.includes(userAgent, 'Android')
  }

  isIos ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return Boolean(userAgent?.match(/iP(hone|od|ad)/g))
  }

  isNativeApp ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/`)
  }

  isMainApp ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/${this.appKey}`)
  }

  isEntityApp (entityAppKey, { userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    return Boolean(entityAppKey &&
      _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/${entityAppKey}/`)
    )
  }

  getAppKey ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    const matches = userAgent.match(/techby\/([a-zA-Z0-9-]+)/)
    return matches?.[1] || 'browser'
  }

  hasPushSupport () {
    return Promise.resolve(Boolean(globalThis?.window?.PushManager))
  }

  getAppVersion ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent
    const regex = new RegExp(`(${this.appKey})/(?:[a-zA-Z0-9]+/)?([0-9.]+)`)
    const matches = userAgent.match(regex)
    return matches?.[2]
  }

  getPlatform ({ userAgent } = {}) {
    userAgent = userAgent || globalThis?.navigator?.userAgent

    const isApp = this.isNativeApp(this.appKey, { userAgent })

    if (isApp && this.isIos({ userAgent })) {
      return 'ios'
    } else if (isApp && this.isAndroid({ userAgent })) {
      return 'android'
    } else { return 'web' }
  }
}

export default new Environment()
