export default class Org {
  constructor ({ auth }) {
    this.auth = auth
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query OrgById($id: ID!) {
          org(id: $id) {
            id, slug, orgUser { id, userId, orgId, roleIds, roles { nodes { name, permissions } } }
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
            id, slug, orgUser { id, userId, orgId, roleIds, roles { nodes { name, permissions } } }
          }
        }`,
      variables: { slug },
      pull: 'org'
    })
  }
}
