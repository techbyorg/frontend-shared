module.exports = class LoginLink
  namespace: 'loginLinks'

  constructor: ({@auth}) -> null

  getByUserIdAndToken: (userId, tokenStr) =>
    @auth.stream
      query: """
        query LoginLinkGetByUserIdAndToken($userId: ID!, tokenStr: String!) {
          loginLinkGetByUserIdAndToken(userId: $userId, tokenStr: $tokenStr) {
            { loginLink { data } }
          }
        }
      """
      variables: {userId, tokenStr}
