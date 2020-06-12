import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import sharedConfig from '../shared_config'

export default class Auth {
  constructor (options) {
    this.setAccessToken = this.setAccessToken.bind(this)
    this.logout = this.logout.bind(this)
    this.join = this.join.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.afterLogin = this.afterLogin.bind(this)
    this.login = this.login.bind(this)
    this.loginLink = this.loginLink.bind(this)
    this.stream = this.stream.bind(this)
    this.call = this.call.bind(this);
    ({
      exoid: this.exoid, pushToken: this.pushToken, lang: this.lang,
      cookie: this.cookie, userAgent: this.userAgent,
      portal: this.portal, authCookie: this.authCookie, host: this.host
    } = options)

    this.waitValidAuthCookie = Rx.defer(() => {
      let accessToken = this.cookie.get(this.authCookie)
      return (accessToken
        ? this.exoid.getCached('graphql', {
          query: 'query Query { me { id, name, data { bio } } }'.trim()
        }).then(user => {
          if (user != null) {
            return { data: { userLoginAnon: { accessToken } } }
          }
          return this.exoid.stream('graphql', {
            query: 'query Query { me { id, name, data { bio } } }'.trim()
          }).pipe(rx.take(1)).toPromise()
            .then(() => ({
              data: { userLoginAnon: { accessToken } }
            }))
        })
          .catch(() => {
            return this.exoid.call('graphql', {
            // FIXME: cleanup all this duplication
              query: `
                mutation LoginAnon {
                  userLoginAnon {
                    accessToken
                  }
                }`
            }
            )
          })
        : this.exoid.call('graphql', {
          query: `
            mutation LoginAnon {
              userLoginAnon {
                accessToken
              }
            }`
        }))
        .then(({ data }) => {
          accessToken = data?.userLoginAnon.accessToken
          if (accessToken && (accessToken !== 'undefined')) {
            return this.setAccessToken(data?.userLoginAnon.accessToken)
          }
        })
    }).pipe(rx.publishReplay(1), rx.refCount())
  }

  setAccessToken (accessToken) {
    const domain = sharedConfig.ENV === sharedConfig.ENVS.DEV
      ? sharedConfig.HOST
      : _.takeRight(this.host.split('.'), 2).join('.')
    return this.cookie.set(this.authCookie, accessToken, {
      // top level domain
      host: domain
    })
  }

  logout () {
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

  join (param) {
    if (param == null) { param = {} }
    // const { name, email, password } = param
    console.log('FIXME')
    return Promise.resolve(null)
  }
  // @exoid.call 'auth.join', {name, email, password}
  // .then ({accessToken}) =>
  //   @setAccessToken accessToken
  //   @exoid.invalidateAll()

  resetPassword (param) {
    if (param == null) { param = {} }
    // const { email } = param
    console.log('FIXME')
    return Promise.resolve(null)
  }
  // @exoid.call 'auth.resetPassword', {email}

  afterLogin ({ accessToken }) {
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

  login (param) {
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

  loginLink (param) {
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

  stream ({ query, variables, pull }, options) {
    if (options == null) { options = {} }
    if (!query) {
      console.warn('missing', arguments[0])
    }

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

  call ({ query, variables }, options) {
    if (options == null) { options = {} }
    const { invalidateAll, invalidateSingle, additionalDataStream } = options

    if (!query) {
      console.warn('missing', arguments[0])
    }

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
