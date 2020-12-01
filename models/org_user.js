import * as _ from 'lodash-es'

// viewPrivateBlock, viewPrivateDashboard
const EMPTY_UUID = '00000000-0000-0000-0000-000000000000'

export default class OrgUser {
  constructor ({ auth }) {
    this.auth = auth
  }

  // sourceType/sourceId ex: sourceType: dashboard, sourceId: <dashboard id>
  hasPermission = ({ orgUser, me, permissions, sourceType, sourceId, roles }) => {
    roles = _.orderBy(roles || orgUser?.roles?.nodes, 'priority')
    const userPermissions = _.filter(_.flatten(_.map(roles, (role) => {
      const sourceIdPermissions = sourceId && _.filter(role.permissions.nodes, { sourceType, sourceId })
      const sourceTypePermissions = _.filter(role.permissions.nodes, { sourceType, sourceId: EMPTY_UUID })
      const globalPermissions = _.filter(role.permissions.nodes, { sourceType: 'global' })
      return [].concat(
        sourceIdPermissions, sourceTypePermissions, globalPermissions
      )
    })))
    return _.every(permissions, (permission) =>
      _.find(userPermissions, { permission })?.value
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
