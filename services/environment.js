/* eslint-disable
    no-multi-str,
    no-useless-escape,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import * as _ from 'lodash-es'

class Environment {
  constructor () {
    this.getPlatform = this.getPlatform.bind(this)
  }

  setAppKey (appKey) { this.appKey = appKey; return null }

  isMobile (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return new RegExp('\
Mobile\
|iP(hone|od|ad)\
|Android\
|BlackBerry\
|IEMobile\
|Kindle\
|NetFront\
|Silk-Accelerated\
|(hpw|web)OS\
|Fennec\
|Minimo\
|Opera M(obi|ini)\
|Blazer\
|Dolfin\
|Dolphin\
|Skyfire\
|Zune\
').test(userAgent)
  }

  isAndroid (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return _.includes(userAgent, 'Android')
  }

  isIos (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return Boolean(userAgent?.match(/iP(hone|od|ad)/g))
  }

  isNativeApp (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/`)
  }

  isMainApp (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/${this.appKey}`)
  }

  isEntityApp (entityAppKey, param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    return Boolean(entityAppKey &&
      _.includes(userAgent?.toLowerCase(), ` ${this.appKey}/${entityAppKey}/`)
    )
  }

  getAppKey (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    const matches = userAgent.match(/techby\/([a-zA-Z0-9-]+)/)
    return matches?.[1] || 'browser'
  }

  hasPushSupport () {
    return Promise.resolve(Boolean(window?.PushManager))
  }

  getAppVersion (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }
    const regex = new RegExp(`(${this.appKey})\/(?:[a-zA-Z0-9]+/)?([0-9\.]+)`)
    const matches = userAgent.match(regex)
    return matches?.[2]
  }

  getPlatform (param) {
    if (param == null) { param = {} }
    let { userAgent } = param
    if (userAgent == null) { userAgent = navigator?.userAgent }

    const isApp = this.isNativeApp(this.appKey, { userAgent })

    if (isApp && this.isIos({ userAgent })) {
      return 'ios'
    } else if (isApp && this.isAndroid({ userAgent })) {
      return 'android'
    } else { return 'web' }
  }
}

export default new Environment()
