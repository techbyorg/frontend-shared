import {z, classKebab} from 'zorium'
import _defaults from 'lodash/defaults'

import $ripple from '../ripple'
import $icon from '../icon'
import colors from '../../colors'

if window?
  require './index.styl'

module.exports = $button = (props) ->
  {isPrimary, isSecondary, isFancy, isInverted, isDisabled, text,
    isFullWidth = true, isOutline, onclick = (-> null), type = 'button', icon,
    heightPx = 36, hasRipple = true} = props or {}

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
