import { z } from 'zorium'

import $policies from '../../components/policies'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $policiesPage ({ requestsStream }) {
  z('.p-policies', [
    z($policies, {
      isIabStream: requestsStream.map(({ req }) => req.query.isIab)
    })
  ])
}
