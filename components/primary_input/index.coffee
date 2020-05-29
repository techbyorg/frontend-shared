import {z, classKebab, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

import $icon from '../icon'
import $input from '../input'
import allColors from '../../colors'


if window?
  require './index.styl'

module.exports = $primaryInput = (props) ->
  {isPasswordVisibleStream} = useMemo ->
    {
      isPasswordVisibleStream: new RxBehaviorSubject false
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
          icon: 'eye'
          color: colors.ink
    else if props.onInfo
      z '.make-visible', {
        onclick: ->
          props.onInfo()
      },
        z $icon,
          icon: 'help'
          color: colors.ink
