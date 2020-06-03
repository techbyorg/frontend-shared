import {z, useContext, useMemo} from 'zorium'
import * as _ from 'lodash-es'

import $icon from '../icon'
import $ripple from '../ripple'
import context from '../../context'

if window?
  require './index.styl'

export default $fab = (props) ->
  {icon, colors, isPrimary, isSecondary, onclick, isImmediate,
    sizePx = 56} = props
  allColors = useContext(context).colors

  {colorsMemo} = useMemo (colors) ->
    {
      colorsMemo: _.defaults colors, {
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
        color: colorsMemo.cText
    z $ripple,
      onComplete: if not isImmediate then onclick
      color: colorsMemo.ripple
