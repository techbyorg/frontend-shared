let User;
export default User = (function() {
  User = class User {
    static initClass() {
      this.prototype.namespace = 'users';
    }

    constructor(options) {
      this.getMe = this.getMe.bind(this);
      this.getById = this.getById.bind(this);
      this.getIp = this.getIp.bind(this);
      this.unsubscribeEmail = this.unsubscribeEmail.bind(this);
      this.verifyEmail = this.verifyEmail.bind(this);
      this.resendVerficationEmail = this.resendVerficationEmail.bind(this);
      this.upsert = this.upsert.bind(this);
      this.getDisplayName = this.getDisplayName.bind(this);
      ({auth: this.auth, proxy: this.proxy, exoid: this.exoid, cookie: this.cookie, lang: this.lang,
        overlay: this.overlay, portal: this.portal, apiUrl: this.apiUrl} = options);
    }

    getMe(param) {
      if (param == null) { param = {}; }
      const {embed} = param;
      return this.auth.stream({
        query: `\
query UserGetMe { me { id, name, data { bio } } }\
`
      });
    }

    getById(id) {
      return this.auth.stream({
        query: `\
query UserGetById($id: ID!) { user(id: $id) { id, name, data { bio } } }\
`,
        variables: {id}});
    }

    getIp() {
      return this.cookie.get('ip');
    }

    unsubscribeEmail({userId, tokenStr}) {
      return this.auth.call({
        query: `\
mutation UserUnsubscribeEmail($userId: ID!, $tokenStr: String!) {
  userUnsubscribeEmail(userId: $userId, tokenStr: $tokenStr): Boolean
}\
`,
        variables: {userId, tokenStr}});
    }

    verifyEmail({userId, tokenStr}) {
      return this.auth.call({
        query: `\
mutation UserVerifyEmail($userId: ID!, $tokenStr: String!) {
  userVerifyEmail(userId: $userId, tokenStr: $tokenStr): Boolean
}\
`,
        variables: {userId, tokenStr}});
    }

    resendVerficationEmail() {
      return this.auth.call({
        query: `\
mutation UserResendVerficationEmail {
  userResendVerficationEmail: Boolean
}\
`
      });
    }

    upsert(diff, param) {
      if (param == null) { param = {}; }
      const {file} = param;
      if (file) {
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.proxy(this.apiUrl + '/upload', {
          method: 'POST',
          query: {
            path: 'graphql',
            body: JSON.stringify({
              query: `\
mutation UserUpsert($diff UserInput!) {
  userUpsert($diff) {
    user {
      id # FIXME: fragment?
      name
      email
    }
  }
}\
`,
              variables: JSON.stringify({input: diff})
            })
          },
          body: formData
        })
        // this (exoid.update) doesn't actually work... it'd be nice
        // but it doesn't update existing streams
        // .then @exoid.update
        .then(response => {
          setTimeout(this.exoid.invalidateAll, 0);
          return response;
        });
      } else {
        return this.auth.call({
          query: `\
mutation UserUpsert($diff UserInput!) {
  userUpsert($diff) {
    user {
      id # FIXME: fragment?
      name
      email
    }
  }
}\
`,
          variables: {input: diff}
        }
        , {invalidateAll: true});
      }
    }

    getDisplayName(user) {
      return user?.name || this.lang.get('general.anonymous');
    }

    isMember(user) {
      return Boolean(user?.email);
    }
  };
  User.initClass();
  return User;
})();

  // requestLoginIfGuest: (user) =>
  //   new Promise (resolve, reject) =>
  //     if @isMember user
  //       resolve true
  //     else
  //       @overlay.open new SignInOverlay({
  //         model: {@lang, @auth, @overlay, @portal, user: this}
  //       }), {
  //         data: 'join'
  //         onComplete: resolve
  //         onCancel: reject
  //       }
