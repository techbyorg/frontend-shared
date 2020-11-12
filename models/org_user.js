import * as _ from 'lodash-es'

// viewPrivateBlock, viewPrivateDashboard
const DEFAULT_PERMISSIONS = []

export default class OrgUser {
  constructor ({ auth }) {
    this.auth = auth
  }

  getMeByOrgId = (orgId) => {
    return this.auth.stream({
      query: `
        query OrgUserMeByOrgId($orgId: ID!) {
          orgUser(orgId: $orgId) {
            id
            orgId
            roleIds
            roles { nodes { id, name, permissions } }
            partners { nodes { name } }
          }
        }
`,
      variables: { orgId },
      pull: 'orgUser'
    })
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query OrgUserGetAll {
          orgUsers {
            nodes {
              id
              orgId
              user { id, email, name }
              roleIds
              roles { nodes { id, name } }
              partnerIds
              partners { nodes { name } }
            }
          }
        }
`,
      // variables: {},
      pull: 'orgUsers'
    })
  }

  // sourceType/sourceId ex: sourceType: dashboard, sourceId: <dashboard id>
  hasPermission = ({ orgUser, me, permissions, sourceType, sourceId, roles }) => {
    roles = roles || orgUser?.roles?.nodes
    console.log('roles', roles)
    return _.every(permissions, (permission) =>
      _.find(roles, (role) => {
        const customPermissions = sourceId && _.filter(role.permissions, { sourceType, sourceId })
        const globalPermissions = _.filter(role.permissions, { sourceType: 'global-public' })
        permissions = [].concat(
          customPermissions, globalPermissions, DEFAULT_PERMISSIONS
        )
        console.log('find', permissions, permission)
        return _.find(permissions, { permission })?.value
      })
    )
  }

  upsert = ({ id, partnerIds, roleIds }) => {
    return this.auth.call({
      query: `
        mutation OrgUserUpsert(
          $id: ID
          $partnerIds: [ID]
          $roleIds: [ID]
        ) {
          orgUserUpsert(id: $id, partnerIds: $partnerIds, roleIds: $roleIds) {
            roleIds
          }
        }
`,
      variables: { id, partnerIds, roleIds },
      pull: 'orgUser'
    }, { invalidateAll: true })
  }
}
