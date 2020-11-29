export default class Org {
  constructor ({ auth }) {
    this.auth = auth
  }

  getMe = () => {
    return this.auth.stream({
      query: `
        query OrgByMe {
          org {
            id
            slug
            name
            domain
            orgUser {
              id
              userId
              orgId
              partners {
                nodes {
                  name
                  data
                }
              }
              roleIds
              roles {
                nodes {
                  name
                  permissions {
                    nodes {
                      sourceType
                      sourceId
                      permission
                      value
                    }
                  }
                }
              }
            }
          }
        }`,
      // variables: {},
      pull: 'org'
    })
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query OrgById($id: ID!) {
          org(id: $id) {
            id
            slug
            orgUser {
              id
              userId
              orgId
              partners {
                nodes {
                  name
                  data
                }
              }
              roleIds
              roles {
                nodes {
                  name
                  permissions {
                    nodes {
                      sourceType
                      sourceId
                      permission
                      value
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: { id },
      pull: 'org'
    })
  }

  getBySlug = (slug) => {
    return this.auth.stream({
      query: `
        query OrgBySlug($slug: String!) {
          org(slug: $slug) {
            id
            slug
            orgUser {
              id
              userId
              orgId
              partners {
                nodes {
                  name
                  data
                }
              }
              roleIds
              roles {
                nodes {
                  name
                  permissions {
                    nodes {
                      sourceType
                      sourceId
                      permission
                      value
                    }
                  }
                }
              }
            }
          }
        }
`,
      variables: { slug },
      pull: 'org'
    })
  }
}
