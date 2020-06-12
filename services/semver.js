import semverCompare from 'semver-compare'

class SemverService {
  gte (v1, v2) {
    return (semverCompare(v1, v2) === 1) || (v1 === v2)
  }
}

export default new SemverService()
