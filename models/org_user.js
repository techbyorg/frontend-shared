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
            orgId, roleIds, roles { nodes { name, permissions } }
          }
        }`,
      variables: { orgId },
      pull: 'orgUser'
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
}
