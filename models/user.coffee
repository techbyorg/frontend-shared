config = require '../config'

module.exports = class User
  namespace: 'users'

  constructor: ({@auth, @proxy, @exoid, @cookie, @lang, @overlay, @portal}) -> null

  getMe: ({embed} = {}) =>
    @auth.stream
      query: '''
        query UserGetMe { me { id, name, data { bio } } }
      '''

  getById: (id) =>
    @auth.stream
      query: '''
        query UserGetById($id: ID!) { user(id: $id) { id, name, data { bio } } }
      '''
      variables: {id}

  getIp: =>
    @cookie.get 'ip'

  unsubscribeEmail: ({userId, tokenStr}) =>
    @auth.call
      query: '''
        mutation UserUnsubscribeEmail($userId: ID!, $tokenStr: String!) {
          userUnsubscribeEmail(userId: $userId, tokenStr: $tokenStr): Boolean
        }
      '''
      variables: {userId, tokenStr}

  verifyEmail: ({userId, tokenStr}) =>
    @auth.call
      query: '''
        mutation UserVerifyEmail($userId: ID!, $tokenStr: String!) {
          userVerifyEmail(userId: $userId, tokenStr: $tokenStr): Boolean
        }
      '''
      variables: {userId, tokenStr}

  resendVerficationEmail: =>
    @auth.call
      query: '''
        mutation UserResendVerficationEmail {
          userResendVerficationEmail: Boolean
        }
      '''

  upsert: (diff, {file} = {}) =>
    if file
      formData = new FormData()
      formData.append 'file', file, file.name

      @proxy config.API_URL + '/upload', {
        method: 'post'
        query:
          path: 'graphql'
          body: JSON.stringify {
            query: '''
              mutation UserUpsert($diff UserInput!) {
                userUpsert($diff) {
                  user {
                    id # FIXME: fragment?
                    name
                    email
                  }
                }
              }
            '''
            variables: {input: diff}
          }
        body: formData
      }
      # this (exoid.update) doesn't actually work... it'd be nice
      # but it doesn't update existing streams
      # .then @exoid.update
      .then (response) =>
        setTimeout @exoid.invalidateAll, 0
        response
    else
      @auth.call
        query: '''
          mutation UserUpsert($diff UserInput!) {
            userUpsert($diff) {
              user {
                id # FIXME: fragment?
                name
                email
              }
            }
          }
        '''
        variables: {input: diff}
      , {invalidateAll: true}

  getDisplayName: (user) =>
    user?.name or @lang.get 'general.anonymous'

  isMember: (user) ->
    Boolean user?.email

  # requestLoginIfGuest: (user) =>
  #   new Promise (resolve, reject) =>
  #     if @isMember user
  #       resolve true
  #     else
  #       @overlay.open new SignInOverlay({
  #         model: {@lang, @auth, @overlay, @portal, user: this}
  #       }), {
  #         data: 'join'
  #         onComplete: resolve
  #         onCancel: reject
  #       }
