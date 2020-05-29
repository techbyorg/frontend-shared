import {z, useContext} from 'zorium'

import $icon from '../icon'
import colors from '../../colors'
import context from '../../context'

if window?
  require './index.styl'

export default $buttonMenu = ({color, onclick, isAlignedLeft = true}) ->
  {model} = useContext context

  z '.z-button-menu',
    z $icon,
      isAlignedLeft: isAlignedLeft
      icon: 'menu'
      color: color or colors.$header500Icon
      hasRipple: true
      onclick: (e) ->
        e.preventDefault()
        if onclick
          onclick()
        else
          model.drawer.open()
