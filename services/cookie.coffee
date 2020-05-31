import * as Rx from 'rxjs'

COOKIE_DURATION_MS = 365 * 24 * 3600 * 1000 # 1 year

class Cookie
  constructor: ({initialCookies, @setCookie, @host}) ->
    @cookies = initialCookies or {}
    @stream = new Rx.BehaviorSubject @cookies

  getCookieOpts: (key, ttlMs) =>
    ttlMs ?= COOKIE_DURATION_MS
    hostname = @host.split(':')[0]

    {
      path: '/'
      expires: new Date(Date.now() + ttlMs)
      # Set cookie for subdomains
      domain: if hostname is 'localhost' then hostname else '.' + hostname
    }

  set: (key, value, {ttlMs} = {}) =>
    ttlMs ?= COOKIE_DURATION_MS
    @cookies[key] = value
    @stream.next @cookies
    options = @getCookieOpts key, ttlMs
    @setCookie key, value, options

  get: (key) =>
    @cookies[key]

  getStream: =>
    @stream


export default Cookie
