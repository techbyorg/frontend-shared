import { z } from 'zorium'

import $policies from '../../components/policies'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $policiesPage ({ requestsStream }) {
<<<<<<< HEAD
  z('.p-policies', [
=======
  return z('.p-policies',
>>>>>>> f2795a82899721432510e55b8dd6b5c29a159da4
    z($policies, {
      isIabStream: requestsStream.map(({ req }) => req.query.isIab)
    })
  ])
}
