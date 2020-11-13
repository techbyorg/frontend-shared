export default class OrgUserInvite {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query OrgUserInviteGetAll {
          orgUserInvites {
            nodes {
              id
              orgId
              roleIds
              roles { nodes { id, name } }
              partnerIds
              partners { nodes { name } }
            }
          }
        }
`,
      // variables: {},
      pull: 'orgUserInvites'
    })
  }

  upsert = ({ id, email, partnerIds, roleIds }) => {
    return this.auth.call({
      query: `
        mutation OrgUserInviteUpsert(
          $id: ID
          $email: String!
          $partnerIds: [ID]
          $roleIds: [ID]
        ) {
          orgUserInviteUpsert(id: $id, email: $email, partnerIds: $partnerIds, roleIds: $roleIds) {
            roleIds
          }
        }
`,
      variables: { id, email, partnerIds, roleIds },
      pull: 'orgUserInvite'
    }, { invalidateAll: true })
  }
}
