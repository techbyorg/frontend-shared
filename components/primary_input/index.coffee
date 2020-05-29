import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from '../icon'
import $input from '../input'
import {eyeIconPath, helpIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

export default $primaryInput = (props) ->
  allColors = useContext(context).colors
  {isPasswordVisibleStream} = useMemo ->
    {
      isPasswordVisibleStream: new Rx.BehaviorSubject false
    }
  , []

  {isPasswordVisible} = useStream ->
    isPasswordVisible: isPasswordVisibleStream

  propsType = props.type

  props.type = if isPasswordVisible then 'text' else props.type

  isFullWidth = props.isFullWidth

  colors = props.colors or
    # background: colors.$bgColor
    c200: allColors.$bgText54
    c500: allColors.$bgText
    c600: allColors.$bgText87
    c700: allColors.$bgText70
    ink: allColors.$bgText

  z '.z-primary-input', {
    className: classKebab {isFullWidth}
  },
    z $input, _.defaults props, {
      isRaised: true
      isFloating: true
      isDark: true
      colors: colors
    }
    if propsType is 'password'
      z '.make-visible', {
        onclick: ->
          isPasswordVisibleStream.next not isPasswordVisible
      },
        z $icon,
          icon: eyeIconPath
          color: colors.ink
    else if props.onInfo
      z '.make-visible', {
        onclick: ->
          props.onInfo()
      },
        z $icon,
          icon: helpIconPath
          color: colors.ink
