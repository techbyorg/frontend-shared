import {z, useContext} from 'zorium'

import $icon from '../icon'
import {backIconPath} from '../icon/paths'
import context from '../../context'

export default $buttonBack = (props) ->
  {color, onclick, fallbackPath, isAlignedLeft = true} = props
  {router, colors} = useContext context

  z '.z-button-back',
    z $icon,
      isAlignedLeft: isAlignedLeft
      icon: backIconPath
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
