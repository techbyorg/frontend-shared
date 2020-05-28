import {z} from 'zorium'

import $policies from '../../components/policies'

if window?
  require './index.styl'

module.exports = $policiesPage = ({requestsStream}) ->
  z '.p-policies',
    z $policies, {
      isIabStream: requestsStream.map ({req}) ->
        req.query.isIab
    }
