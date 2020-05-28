import _pick from 'lodash/pick'
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/defer'
require 'rxjs/add/operator/toPromise'
require 'rxjs/add/observable/fromPromise'
require 'rxjs/add/operator/switchMap'
require 'rxjs/add/operator/take'
require 'rxjs/add/operator/publishReplay'

import Environment from '../services/environment'
import config from '../config'

module.exports = class Auth
  constructor: (options) ->
    {@exoid, @pushToken, @lang, @cookie, @userAgent, @portal} = options

    @waitValidAuthCookie = RxObservable.defer =>
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
    .publishReplay(1).refCount()

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
    options = _pick options, [
      'isErrorable', 'clientChangesStream', 'ignoreCache', 'initialSortFn'
      'isStreamed', 'limit'
    ]
    @waitValidAuthCookie
    .switchMap =>
      stream = @exoid.stream 'graphql', {query, variables}, options
      if pull
        stream.map ({data}) -> data[pull]
      else
        stream

  call: ({query, variables}, options = {}) =>
    {invalidateAll, invalidateSingle, additionalDataStream} = options

    unless query
      console.warn 'missing', arguments[0]

    @waitValidAuthCookie.take(1).toPromise()
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
