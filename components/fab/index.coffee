import {z, useMemo} from 'zorium'
import _defaults from 'lodash/defaults'

import $icon from '../icon'
import $ripple from '../ripple'
import allColors from '../../colors'

if window?
  require './index.styl'

module.exports = $fab = (props) ->
  {icon, colors, isPrimary, isSecondary, onclick, isImmediate,
    sizePx = 56} = props

  {colorsMemo} = useMemo (colors) ->
    {
      colorsMemo: _defaults colors, {
        c500: if isPrimary then allColors.$primaryMain \
              else if isSecondary then allColors.$secondaryMain \
              else allColors.$white
        cText: if isPrimary then allColors.$primaryMainText \
              else if isSecondary then allColors.$secondaryMainText \
              else allColors.$bgText87
        ripple: allColors.$white
      }
    }
  , [colors]

  z '.z-fab', {
    onclick: if isImmediate then onclick
    style:
      backgroundColor: colorsMemo.c500
      width: "#{sizePx}px"
      height: "#{sizePx}px"
  },
    z '.icon-container',
      z $icon,
        icon: icon
        isTouchTarget: false
        color: colorsMemo.cText
    z $ripple,
      onComplete: if not isImmediate then onclick
      color: colorsMemo.ripple
