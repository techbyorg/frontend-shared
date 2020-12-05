export default class Partner {
  constructor ({ auth }) {
    this.auth = auth
  }

  getByOrgIdAndSlug = (orgId, slug) => {
    return this.auth.stream({
      query: `
        query PartnerByOrgIdAndSlug($orgId: ID!, $slug: String) {
          partner(orgId: $orgId, slug: $slug) {
            id, slug, name, data
          }
        }`,
      variables: { orgId, slug },
      pull: 'partner'
    })
  }

  getAll = () => {
    return this.auth.stream({
      query: `
        query Partners {
          partners {
            nodes { id, slug, name, data }
          }
        }`,
      // variables:  { orgId },
      pull: 'partners'
    })
  }

  upsert = ({ id, slug, name, data }) => {
    return this.auth.call({
      query: `
        mutation RoleUpsert(
          $id: ID
          $slug: String
          $name: String
          $data: JSON
        ) {
          partnerUpsert(id: $id, slug: $slug, name: $name, data: $data) {
            name
          }
        }
`,
      variables: { id, slug, name, data },
      pull: 'partner'
    }, { invalidateAll: true })
  }

  deleteById = (id) => {
    return this.auth.call({
      query: `
        mutation PartnerDeleteById($id: ID) {
          partnerDeleteById(id: $id)
        }
`,
      variables: { id },
      pull: 'partnerDeleteById'
    }, { invalidateAll: true })
  }
}
