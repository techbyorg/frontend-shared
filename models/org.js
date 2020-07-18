export default class Org {
  constructor ({ auth }) {
    this.auth = auth
  }

  getById = (id) => {
    return this.auth.stream({
      query: `
        query OrgById($id: ID!) {
          org(id: $id) {
            id, slug
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
            id, slug
          }
        }`,
      variables: { slug },
      pull: 'org'
    })
  }
}
