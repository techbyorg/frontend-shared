/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext } from 'zorium'

import $icon from '../icon'
import { menuIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $buttonMenu (...args) {
  const obj = args[0]
  const {
    color,
    onclick
  } = obj
  const val = obj.isAlignedLeft
  const isAlignedLeft = val != null ? val : true
  const { model, colors } = useContext(context)

  return z('.z-button-menu',
    z($icon, {
      isAlignedLeft,
      icon: menuIconPath,
      color: color || colors.$header500Icon,
      hasRipple: true,
      isTouchTarget: true,
      onclick (e) {
        e.preventDefault()
        if (onclick) {
          return onclick()
        } else {
          return model.drawer.open()
        }
      }
    }
    )
  )
}
