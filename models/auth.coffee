import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Environment from '../services/environment'
import config from '../config'

export default class Auth
  constructor: (options) ->
    {@exoid, @pushToken, @lang, @cookie, @userAgent, @portal} = options

    @waitValidAuthCookie = Rx.defer =>
      accessToken = @cookie.get config.AUTH_COOKIE
      language = @lang.getLanguageStr()
      (if accessToken
        @exoid.getCached 'graphql',
          query: '''
            query Query { me { id, name, data { bio } } }
          '''
        .then (user) =>
          if user?
            return {data: userLoginAnon: {accessToken}}
          @exoid.call 'graphql',
            query: '''
              query Query { me { id, name, data { bio } } }
            '''
          .then ->
            return {data: userLoginAnon: {accessToken}}
        .catch =>
          @exoid.call 'graphql',
            # FIXME: cleanup all this duplication
            query: '''
              mutation LoginAnon {
                userLoginAnon {
                  accessToken
                }
              }
            '''
      else
        @exoid.call 'graphql',
          query: '''
            mutation LoginAnon {
              userLoginAnon {
                accessToken
              }
            }
          ''')
      .then ({data}) =>
        console.log 'RESPONSE', data
        accessToken = data?.userLoginAnon.accessToken
        if accessToken and accessToken isnt 'undefined'
          @setAccessToken data?.userLoginAnon.accessToken
    .pipe rx.publishReplay(1), rx.refCount()

  setAccessToken: (accessToken) =>
    @cookie.set config.AUTH_COOKIE, accessToken

  logout: =>
    @setAccessToken ''
    language = @lang.getLanguageStr()
    @exoid.call 'graphql',
      query: '''
        mutation LoginAnon {
          userLoginAnon {
            accessToken
          }
        }
      '''
    .then ({data}) =>
      @setAccessToken data?.userLoginAnon.accessToken
      @exoid.invalidateAll()

  join: ({name, email, password} = {}) =>
    @exoid.call 'auth.join', {name, email, password}
    .then ({accessToken}) =>
      @setAccessToken accessToken
      @exoid.invalidateAll()

  resetPassword: ({email} = {}) =>
    @exoid.call 'auth.resetPassword', {email}

  afterLogin: ({accessToken}) =>
    @setAccessToken accessToken
    @exoid.invalidateAll()
    pushToken = @pushToken.getValue()
    if pushToken
      pushToken ?= 'none'
      @portal.call 'app.getDeviceId'
      .catch -> null
      .then (deviceId) =>
        sourceType = if Environment.isAndroid() \
                     then 'android' \
                     else 'ios-fcm'
        @call 'pushTokens.upsert', {tokenStr: pushToken, sourceType, deviceId}
      .catch -> null

  login: ({email, password} = {}) =>
    @exoid.call 'graphql',
      query: '''
        mutation UserLoginEmail($email: String!, $password: String!) {
          userLoginEmail(email: $email, password: $password) {
            accessToken
          }
        }
      '''
      variables: {email, password}
    .then @afterLogin

  loginLink: ({userId, tokenStr} = {}) =>
    @exoid.call 'graphql',
      query: '''
        mutation UserLoginLink($userId: ID!, $tokenStr: String!) {
          userLoginLink(userId: $userId, tokenStr: $tokenStr) {
            accessToken
          }
        }
      '''
      variables: {userId, tokenStr}
    .then @afterLogin

  stream: ({query, variables, pull}, options = {}) =>
    options = _.pick options, [
      'isErrorable', 'clientChangesStream', 'ignoreCache', 'initialSortFn'
      'isStreamed', 'limit'
    ]
    @waitValidAuthCookie
    .pipe rx.switchMap =>
      stream = @exoid.stream 'graphql', {query, variables}, options
      if pull
        stream.pipe rx.map ({data}) -> data[pull]
      else
        stream

  call: ({query, variables}, options = {}) =>
    {invalidateAll, invalidateSingle, additionalDataStream} = options

    unless query
      console.warn 'missing', arguments[0]

    @waitValidAuthCookie.pipe(rx.take(1)).toPromise()
    .then =>
      @exoid.call 'graphql', {query, variables}, {additionalDataStream}
    .then (response) =>
      if invalidateAll
        console.log 'Invalidating all'
        @exoid.invalidateAll()
      else if invalidateSingle
        console.log 'Invalidating single', invalidateSingle
        @exoid.invalidate invalidateSingle.path, invalidateSingle.body
      response
