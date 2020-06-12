import { z, useContext } from 'zorium'

import $icon from '../icon'
import { menuIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $buttonMenu (props) {
  const { color, onclick, isAlignedLeft = true } = props
  const { model, colors } = useContext(context)

  return z('.z-button-menu', [
    z($icon, {
      isAlignedLeft,
      icon: menuIconPath,
      color: color || colors.$header500Icon,
      hasRipple: true,
      isTouchTarget: true,
      onclick: (e) => {
        e.preventDefault()
        if (onclick) {
          onclick()
        } else {
          model.drawer.open()
        }
      }
    })
  ])
}
