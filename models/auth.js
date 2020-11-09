import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import sharedConfig from '../shared_config'

// TODO: clean this up
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
        newAccessToken = await this.validateAccessToken(accessToken)
      } else {
        newAccessToken = await this.loginAnon()
      }

      if (newAccessToken) {
        this.setAccessToken(newAccessToken)
        if (!globalThis.window) {
          // so user is in exoid cache for client
          await this.getMe({ accessToken: newAccessToken })
            .pipe(rx.take(1)).toPromise()
        }
      }
      return null
    }).pipe(rx.publishReplay(1), rx.refCount())
  }

  getMe = ({ accessToken, fromCache } = {}) => {
    // for ssr we want this to be consistent & cacheable
    const req = {
      query: 'query UserGetMe { me { id } }'
    }
    if (fromCache) {
      return this.exoid.getCached('graphql', req)
    } else if (accessToken) {
      // bypass the waitValidAuthCookie
      return this.exoid.stream('graphql', req)
    } else {
      return this.stream(req)
    }
  }

  loginAnon = async () => {
    const { data } = await this.exoid.call('graphql', {
      query: `
        mutation LoginAnon {
          userLoginAnon {
            accessToken
          }
        }`
    })
    console.log('data', data)
    return data?.userLoginAnon.accessToken
  }

  validateAccessToken = async (accessToken) => {
    try {
      let user = await this.getMe({ fromCache: true })
      if (!user?.data?.me) {
        user = await this.getMe({ accessToken }).pipe(rx.take(1)).toPromise()
      }
      if (!user?.data?.me) {
        console.log('user', user)
        throw new Error('no user for accesstoken')
      }
    } catch (err) {
      console.log('caught err, logging in anon', err)
      return this.loginAnon()
    }
  }

  setAccessToken = (accessToken) => {
    const domain = sharedConfig.ENV === sharedConfig.ENVS.DEV
      ? sharedConfig.HOST
      : this.host.indexOf('techby.org') !== -1 // FIXME: var?
        ? _.takeRight(this.host.split('.'), 2).join('.')
        : this.host // 3rd part domains
    return this.cookie.set(this.authCookie, accessToken, {
      // top level domain
      host: domain
    })
  }

  logout = async () => {
    this.setAccessToken('')
    const accessToken = await this.loginAnon()
    this.setAccessToken(accessToken)
    return this.exoid.invalidateAll()
  }

  join = async ({ name, email, password }) => {
    const { data } = this.exoid.call('graphql', {
      query: `
        mutation UserJoin($name: String!, $email: String!, $password: String!) {
          userJoin(name: $name, email: $email, password: $password) {
            accessToken
          }
        }`,
      variables: { name, email, password }
    })
    return this.afterLogin(data.userJoin)
  }

  resetPassword = ({ email }) => {
    console.log('FIXME')
    return Promise.resolve(null)
  }
  // @exoid.call 'auth.resetPassword', {email}

  afterLogin = (r) => {
    const { accessToken } = r
    console.log('r', r)
    console.log('afterLogin', accessToken)
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

  login = async ({ email, password }) => {
    const { data } = await this.exoid.call('graphql', {
      query: `
        mutation UserLoginEmail($email: String!, $password: String!) {
          userLoginEmail(email: $email, password: $password) {
            accessToken
          }
        }`,
      variables: { email, password }
    })
    return this.afterLogin(data.userLoginEmail)
  }

  loginLink = async ({ userId, tokenStr }) => {
    const { data } = await this.exoid.call('graphql', {
      query: `
        mutation UserLoginLink($userId: ID!, $tokenStr: String!) {
          userLoginLink(userId: $userId, tokenStr: $tokenStr) {
            accessToken
          }
        }`,
      variables: { userId, tokenStr }
    })
    return this.afterLogin(data.userLoginLink)
  }

  stream = ({ query, variables, pull }, options = {}) => {
    options = _.pick(options, [
      'isErrorable', 'clientChangesStream', 'ignoreCache', 'initialSortFn',
      'isStreamed', 'limit'
    ])
    return Rx.combineLatest(
      this.waitValidAuthCookie,
      this.orgSlugStream
    )
      .pipe(rx.switchMap(([cookie, orgSlug]) => {
      // accessToken, userAgent, product added in model/index.js ioEmit
        const stream = this.exoid.stream('graphql', { query, variables }, options)
        if (pull) {
          return stream.pipe(rx.map(({ data }) => data[pull]))
        } else {
          return stream
        }
      }))
  }

  call = async ({ query, variables }, options = {}) => {
    const { invalidateAll, invalidateSingle, additionalDataStream } = options

    // accessToken, userAgent, product added in model/index.js ioEmit
    await this.waitValidAuthCookie.pipe(rx.take(1)).toPromise()
    await this.orgSlugStream.pipe(rx.take(1)).toPromise()
    const response = await this.exoid.call('graphql', { query, variables }, {
      additionalDataStream
    })
    if (invalidateAll) {
      console.log('Invalidating all')
      this.exoid.invalidateAll()
    } else if (invalidateSingle) {
      console.log('Invalidating single', invalidateSingle)
      this.exoid.invalidate(invalidateSingle.path, invalidateSingle.body)
    }
    return response
  }

  setOrgSlugStream = (orgSlugStream) => {
    this.orgSlugStream = orgSlugStream
  }
}
