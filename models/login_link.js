// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let LoginLink
export default LoginLink = (function () {
  LoginLink = class LoginLink {
    static initClass () {
      this.prototype.namespace = 'loginLinks'
    }

    constructor ({ auth }) { this.getByUserIdAndToken = this.getByUserIdAndToken.bind(this); this.auth = auth; null }

    getByUserIdAndToken (userId, tokenStr) {
      return this.auth.stream({
        query: `\
query LoginLinkGetByUserIdAndToken($userId: ID!, tokenStr: String!) {
  loginLinkGetByUserIdAndToken(userId: $userId, tokenStr: $tokenStr) {
    { loginLink { data } }
  }
}\
`,
        variables: { userId, tokenStr }
      })
    }
  }
  LoginLink.initClass()
  return LoginLink
})()
