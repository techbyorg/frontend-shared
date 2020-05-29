import {z, useContext} from 'zorium'

import $icon from '../icon'
import {menuIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

export default $buttonMenu = ({color, onclick, isAlignedLeft = true}) ->
  {model, colors} = useContext context

  z '.z-button-menu',
    z $icon,
      isAlignedLeft: isAlignedLeft
      icon: menuIconPath
      color: color or colors.$header500Icon
      hasRipple: true
      onclick: (e) ->
        e.preventDefault()
        if onclick
          onclick()
        else
          model.drawer.open()
