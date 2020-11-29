export default class Permission {
  constructor ({ auth }) {
    this.auth = auth
  }

  getBySourceTypeAndSourceId = (sourceType, sourceId) => {
    return this.auth.stream({
      query: `
        query Permissions($sourceType: String, $sourceId: ID) {
          permissions(sourceType: $sourceType, sourceId: $sourceId) {
            nodes { permission, value, roleId, role { id, name } }
          }
        }`,
      variables: { sourceType, sourceId },
      pull: 'permissions'
    })
  }

  batchUpsert = (permissions) => {
    console.log('batch', permissions)
    return this.auth.call({
      query: `
        mutation PermissionBatchUpsert(
          $permissions: JSON
        ) {
          permissionBatchUpsert(permissions: $permissions) {
            roleId
          }
        }
      `,
      variables: { permissions },
      pull: 'permission'
    }, { invalidateAll: true })
  }

  upsert = ({ roleId, sourceType, sourceId, permission, value }) => {
    return this.auth.call({
      query: `
        mutation PermissionUpsert(
          $roleId: ID
          $sourceType: String
          $sourceId: ID
          $permission: String
          $value: Boolean
        ) {
          permissionUpsert(roleId: $roleId, sourceType: $sourceType, sourceId: $sourceId, permission: $permission, value: $value) {
            roleId
          }
        }
`,
      variables: { roleId, sourceType, sourceId, permission, value },
      pull: 'permission'
    }, { invalidateAll: true })
  }
}
