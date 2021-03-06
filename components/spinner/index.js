import { z, useContext } from 'zorium'
import * as _ from 'lodash-es'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const DEFAULT_SIZE = 50

export default function $spinner ({ size = DEFAULT_SIZE }) {
  const { colors } = useContext(context)

  return z('.z-spinner', {
    style: {
      width: `${size}px`,
      height: `${size * 0.6}px`
    }
  }, _.map(_.range(3), () =>
    z('li', {
      style: {
        border: `${Math.round(size * 0.06)}px solid ${colors.$primary500}`
      }
    })
  ))
}
