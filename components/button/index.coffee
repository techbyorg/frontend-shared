import {z, classKebab, useContext} from 'zorium'

import $ripple from '../ripple'
import $icon from '../icon'
import context from '../../context'

if window?
  require './index.styl'

export default $button = (props) ->
  {isPrimary, isSecondary, isFancy, isInverted, isDisabled, text,
    isFullWidth = true, isOutline, onclick = (-> null), type = 'button', icon,
    heightPx = 36, hasRipple = true} = props or {}
  {colors} = useContext context

  z '.z-button', {
    className: classKebab {
      isFullWidth
      isOutline
      isPrimary
      isSecondary
      isFancy
      isInverted
      isDisabled
    }
    onclick: (e) ->
      unless isDisabled
        onclick(e)
  },

    z 'button.button', {
      type: type
      disabled: if isDisabled then true else undefined
      style:
        # lineHeight: "#{heightPx}px"
        minHeight: "#{heightPx}px"
    },
      if icon
        z '.icon',
          z $icon,
          icon: icon
          isTouchTarget: false
          color: colors.$white # FIXME
      text
      if hasRipple
        z $ripple
