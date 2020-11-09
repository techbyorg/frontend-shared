export default class User {
  constructor (options) {
    ({
      auth: this.auth, proxy: this.proxy, exoid: this.exoid, cookie: this.cookie, lang: this.lang,
      overlay: this.overlay, portal: this.portal, apiUrl: this.apiUrl
    } = options)
    this.getMe = this.auth.getMe
  }

  getById = (id) => {
    return this.auth.stream({
      query: 'query UserGetById($id: ID!) { user(id: $id) { id, name, data { bio } } }',
      variables: { id }
    })
  }

  getIp = () => {
    return this.cookie.get('ip')
  }

  unsubscribeEmail = ({ userId, tokenStr }) => {
    return this.auth.call({
      query: `
        mutation UserUnsubscribeEmail($userId: ID!, $tokenStr: String!) {
          userUnsubscribeEmail(userId: $userId, tokenStr: $tokenStr): Boolean
        }`,
      variables: { userId, tokenStr }
    })
  }

  verifyEmail = ({ userId, tokenStr }) => {
    return this.auth.call({
      query: `
        mutation UserVerifyEmail($userId: ID!, $tokenStr: String!) {
          userVerifyEmail(userId: $userId, tokenStr: $tokenStr): Boolean
        }`,
      variables: { userId, tokenStr }
    })
  }

  resendVerficationEmail = () => {
    return this.auth.call({
      query: `
        mutation UserResendVerficationEmail {
          userResendVerficationEmail: Boolean
        }
        `
    })
  }

  upsert = (diff, { file } = {}) => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file, file.name)

      return this.proxy(this.apiUrl + '/upload', {
        method: 'POST',
        query: {
          path: 'graphql',
          body: JSON.stringify({
            query: `
              mutation UserUpsert($diff UserInput!) {
                userUpsert($diff) {
                  user {
                    id # FIXME: fragment?
                    name
                    email
                  }
                }
              }`,
            variables: JSON.stringify({ input: diff })
          })
        },
        body: formData
      })
      // this (exoid.update) doesn't actually work... it'd be nice
      // but it doesn't update existing streams
      // .then @exoid.update
        .then(response => {
          setTimeout(this.exoid.invalidateAll, 0)
          return response
        })
    } else {
      return this.auth.call({
        query: `
          mutation UserUpsert($diff UserInput!) {
            userUpsert($diff) {
              user {
                id # FIXME: fragment?
                name
                email
              }
            }
          }`,
        variables: { input: diff }
      }, { invalidateAll: true })
    }
  }

  getDisplayName = (user) => {
    return user?.name || this.lang.get('general.anonymous')
  }

  isMember = (user) => {
    return Boolean(user?.email)
  }
}
