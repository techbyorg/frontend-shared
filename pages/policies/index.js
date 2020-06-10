/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z } from 'zorium'

import $policies from '../../components/policies'
let $policiesPage

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $policiesPage = ({ requestsStream }) => z('.p-policies',
  z($policies, {
    isIabStream: requestsStream.map(({ req }) => req.query.isIab)
  }))
