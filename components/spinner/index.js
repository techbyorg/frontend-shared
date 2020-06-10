/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext } from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'
let $spinner

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

const DEFAULT_SIZE = 50

export default $spinner = function (...args) {
  const obj = args[0]; const val = obj.size; const size = val != null ? val : DEFAULT_SIZE
  const { colors } = useContext(context)

  return z('.z-spinner', {
    style: {
      width: `${size}px`,
      height: `${size * 0.6}px`
    }
  },
  _.map(_.range(3), () => z('li', {
    style: {
      border: `${Math.round(size * 0.06)}px solid ${colors.$primary500}`
    }
  }
  ))
  )
}
