{z, useContext} = require 'zorium'

$icon = require '../icon'
colors = require '../../colors'
context = require '../../context'

if window?
  require './index.styl'

module.exports = $buttonMenu = ({color, onclick, isAlignedLeft = true}) ->
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
