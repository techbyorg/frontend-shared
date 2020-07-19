import * as Rx from 'rxjs'

const COOKIE_DURATION_MS = 365 * 24 * 3600 * 1000 // 1 year

class Cookie {
  constructor ({ initialCookies, setCookie, host }) {
    this.setCookie = setCookie
    this.host = host
    this.cookies = initialCookies || {}
    this.stream = new Rx.BehaviorSubject(this.cookies)
  }

  getCookieOpts = (key, { ttlMs = COOKIE_DURATION_MS, host }) => {
    host = host || this.host
    const hostname = host.split(':')[0]

    return {
      path: '/',
      expires: new Date(Date.now() + ttlMs),
      // Set cookie for subdomains
      domain: hostname === 'localhost' ? hostname : '.' + hostname
    }
  }

  set = (key, value, { ttlMs = COOKIE_DURATION_MS, host } = {}) => {
    this.cookies[key] = value
    this.stream.next(this.cookies)
    const options = this.getCookieOpts(key, { ttlMs, host })
    return this.setCookie(key, value, options)
  }

  get = (key) => {
    return this.cookies[key]
  }

  getStream = () => {
    return this.stream
  }
}

export default Cookie
