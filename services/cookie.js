// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
import * as Rx from 'rxjs'

const COOKIE_DURATION_MS = 365 * 24 * 3600 * 1000 // 1 year

class Cookie {
  constructor ({ initialCookies, setCookie, host }) {
    this.getCookieOpts = this.getCookieOpts.bind(this)
    this.set = this.set.bind(this)
    this.get = this.get.bind(this)
    this.getStream = this.getStream.bind(this)
    this.setCookie = setCookie
    this.host = host
    this.cookies = initialCookies || {}
    this.stream = new Rx.BehaviorSubject(this.cookies)
  }

  getCookieOpts (key, { ttlMs, host }) {
    if (ttlMs == null) { ttlMs = COOKIE_DURATION_MS }
    if (host == null) {
      ({
        host
      } = this)
    }
    const hostname = host.split(':')[0]

    console.log('set', hostname)

    return {
      path: '/',
      expires: new Date(Date.now() + ttlMs),
      // Set cookie for subdomains
      domain: hostname === 'localhost' ? hostname : '.' + hostname
    }
  }

  set (key, value, param) {
    if (param == null) { param = {} }
    let { ttlMs, host } = param
    if (ttlMs == null) { ttlMs = COOKIE_DURATION_MS }
    this.cookies[key] = value
    this.stream.next(this.cookies)
    const options = this.getCookieOpts(key, { ttlMs, host })
    return this.setCookie(key, value, options)
  }

  get (key) {
    return this.cookies[key]
  }

  getStream () {
    return this.stream
  }
}

export default Cookie