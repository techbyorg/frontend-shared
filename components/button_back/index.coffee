import {z, useContext} from 'zorium'

import $icon from '../icon'
import colors from '../../colors'
import context from '../../context'

module.exports = $buttonBack = (props) ->
  {color, onclick, fallbackPath, isAlignedLeft = true} = props
  {router} = useContext context

  z '.z-button-back',
    z $icon,
      isAlignedLeft: isAlignedLeft
      icon: 'back'
      color: color or colors.$header500Icon
      hasRipple: true
      onclick: (e) ->
        e.preventDefault()
        setTimeout ->
          if onclick
            onclick()
          else
            router.back {fallbackPath}
        , 0
