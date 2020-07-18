export default class LoginLink {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByUserIdAndToken = (userId, tokenStr) => {
    return this.auth.stream({
      query: `
        query LoginLinkGetByUserIdAndToken($userId: ID!, tokenStr: String!) {
          loginLinkGetByUserIdAndToken(userId: $userId, tokenStr: $tokenStr) {
            { loginLink { data } }
          }
        }`,
      variables: { userId, tokenStr }
    })
  }
}
