export default class Role {
  constructor ({ auth }) {
    this.auth = auth
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query Roles {
          roles {
            nodes { id, name, slug, permissions { nodes { sourceType, sourceId, permission, value } } }
          }
        }`,
      // variables: { orgId },
      pull: 'roles'
    })
  }

  upsert = ({ id, slug, name, permissions }) => {
    return this.auth.call({
      query: `
        mutation RoleUpsert(
          $id: ID
          $slug: String
          $name: String
          $permissions: JSON
        ) {
          roleUpsert(id: $id, slug: $slug, name: $name, permissions: $permissions) {
            name
          }
        }
`,
      variables: { id, slug, name, permissions },
      pull: 'role'
    }, { invalidateAll: true })
  }
}
