import { FRAGMENT_ORG_WITH_ORG_USER } from 'all-shared/index.js'

export default class Org {
  constructor ({ auth }) {
    this.auth = auth
  }

  // uses orgSlug automatically
  getMe = () => {
    return this.auth.stream({
      query: `
        query OrgByMe {
          org {
            ...orgWithOrgUser
          }
        } ${FRAGMENT_ORG_WITH_ORG_USER}`,
      // variables: {},
      pull: 'org'
    })
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query OrgById($id: ID!) {
          org(id: $id) {
            ...orgWithOrgUser
          }
        } ${FRAGMENT_ORG_WITH_ORG_USER}`,
      variables: { id },
      pull: 'org'
    })
  }
}
