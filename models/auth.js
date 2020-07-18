import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import sharedConfig from '../shared_config'

export default class Auth {
  constructor (options) {
    ({
      exoid: this.exoid, pushToken: this.pushToken, lang: this.lang,
      cookie: this.cookie, userAgent: this.userAgent,
      portal: this.portal, authCookie: this.authCookie, host: this.host
    } = options)

    this.waitValidAuthCookie = Rx.defer(async () => {
      const accessToken = this.cookie.get(this.authCookie)
      let newAccessToken
      if (accessToken) {
        newAccessToken = await this.tryAccessToken(accessToken)
      } else {
        newAccessToken = await this.loginAnon()
      }

      if (newAccessToken) {
        this.setAccessToken(newAccessToken)
        if (!globalThis.window) {
          await this.directGetMe() // so user is in exoid cache for client
        }
      }
      return null
    }).pipe(rx.publishReplay(1), rx.refCount())
  }

  loginAnon = () => {
    console.log('login anon')
    return this.exoid.call('graphql', {
      query: `
        mutation LoginAnon {
          userLoginAnon {
            accessToken
          }
        }`
    }).then(({ data }) => data?.userLoginAnon.accessToken)
  }

  directGetMe = async () => {
    return this.exoid.stream('graphql', {
      // FIXME
      query: 'query Query { me { id, name, data { bio } } }'.trim()
    }).pipe(rx.take(1)).toPromise()
  }

  tryAccessToken = async (accessToken) => {
    try {
      let user = await this.exoid.getCached('graphql', {
        query: 'query Query { me { id, name, data { bio } } }'.trim()
      })

      console.log('user from cache', user, Date.now())
      if (!user?.data?.me) { // FIXME: only if user.data.user
        user = await this.directGetMe()
      }
      if (!user?.data?.me) {
        throw new Error('no user for accesstoken')
      }
    } catch (err) {
      const { data } = await this.exoid.call('graphql', {
        // FIXME: cleanup all this duplication
        query: `
          mutation LoginAnon {
            userLoginAnon {
              accessToken
            }
          }`
      })
      return data?.userLoginAnon.accessToken
    }
  }

  setAccessToken = (accessToken) => {
    const domain = sharedConfig.ENV === sharedConfig.ENVS.DEV
      ? sharedConfig.HOST
      : _.takeRight(this.host.split('.'), 2).join('.')
    console.log('setAccessToken', this.authCookie, domain, accessToken)
    return this.cookie.set(this.authCookie, accessToken, {
      // top level domain
      host: domain
    })
  }

  logout = () => {
    this.setAccessToken('')
    return this.exoid.call('graphql', {
      query: `
        mutation LoginAnon {
          userLoginAnon {
            accessToken
          }
        }`
    }).then(({ data }) => {
      this.setAccessToken(data?.userLoginAnon.accessToken)
      return this.exoid.invalidateAll()
    })
  }

  join = (param) => {
    if (param == null) { param = {} }
    // const { name, email, password } = param
    console.log('FIXME')
    return Promise.resolve(null)
  }
  // @exoid.call 'auth.join', {name, email, password}
  // .then ({accessToken}) =>
  //   @setAccessToken accessToken
  //   @exoid.invalidateAll()

  resetPassword = (param) => {
    if (param == null) { param = {} }
    // const { email } = param
    console.log('FIXME')
    return Promise.resolve(null)
  }
  // @exoid.call 'auth.resetPassword', {email}

  afterLogin = ({ accessToken }) => {
    this.setAccessToken(accessToken)
    this.exoid.invalidateAll()
    let pushToken = this.pushToken.getValue()
    if (pushToken) {
      if (pushToken == null) { pushToken = 'none' }
      return this.portal.call('app.getDeviceId')
        .catch(() => null)
        .then(deviceId => {
          // const sourceType = Environment.isAndroid()
          //   ? 'android'
          //   : 'ios-fcm'
          return console.log('FIXME: tokens')
        }).catch(() => null)
    }
  }

  login = (param) => {
    if (param == null) { param = {} }
    const { email, password } = param
    return this.exoid.call('graphql', {
      query: `
        mutation UserLoginEmail($email: String!, $password: String!) {
          userLoginEmail(email: $email, password: $password) {
            accessToken
          }
        }`,
      variables: { email, password }
    })
      .then(this.afterLogin)
  }

  loginLink = (param) => {
    if (param == null) { param = {} }
    const { userId, tokenStr } = param
    return this.exoid.call('graphql', {
      query: `
        mutation UserLoginLink($userId: ID!, $tokenStr: String!) {
          userLoginLink(userId: $userId, tokenStr: $tokenStr) {
            accessToken
          }
        }`,
      variables: { userId, tokenStr }
    })
      .then(this.afterLogin)
  }

  // _accessToken, _userAgent, _appKey added in model/index.js ioEmit
  stream = ({ query, variables, pull }, options = {}) => {
    options = _.pick(options, [
      'isErrorable', 'clientChangesStream', 'ignoreCache', 'initialSortFn',
      'isStreamed', 'limit'
    ])
    return this.waitValidAuthCookie
      .pipe(rx.switchMap(() => {
        const stream = this.exoid.stream('graphql', { query, variables }, options)
        if (pull) {
          return stream.pipe(rx.map(({ data }) => data[pull]))
        } else {
          return stream
        }
      })
      )
  }

  // _accessToken, _userAgent, _appKey added in model/index.js ioEmit
  call = ({ query, variables }, options = {}) => {
    const { invalidateAll, invalidateSingle, additionalDataStream } = options

    return this.waitValidAuthCookie.pipe(rx.take(1)).toPromise()
      .then(() => {
        return this.exoid.call('graphql', { query, variables }, {
          additionalDataStream
        })
      })
      .then(response => {
        if (invalidateAll) {
          console.log('Invalidating all')
          this.exoid.invalidateAll()
        } else if (invalidateSingle) {
          console.log('Invalidating single', invalidateSingle)
          this.exoid.invalidate(invalidateSingle.path, invalidateSingle.body)
        }
        return response
      })
  }
}
