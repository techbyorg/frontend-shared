# TODO: replace completely with $input
import {z, classKebab, useContext, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if window?
  require './index.styl'

export default $input = (props) ->
  {valueStream, valueStreams, errorStream, isFocusedStream
    colors, hintText = '', type = 'text', isFloating, isRounded,
    isDisabled, isFullWidth,  autoCapitalize = true
    height, isDark, isCentered, disableAutoComplete} = props
  allColors = useContext(context).colors

  {valueStream, errorStream, isFocusedStream} = useMemo ->
    {
      valueStream: valueStream or new Rx.BehaviorSubject ''
      errorStream: errorStream or new Rx.BehaviorSubject null
      isFocusedStream: isFocusedStream or new Rx.BehaviorSubject false
    }
  , []

  {value, error, isFocused} = useStream ->
    value: valueStreams?.pipe(rx.switchAll()) or valueStream
    error: errorStream
    isFocused: isFocusedStream


  colors = _.defaults colors, {
    c500: allColors.$bgColor
    background: allColors.$bgColor
    underline: allColors.$primaryMain
  }

  z '.z-input-old',
    style:
      height: height
      minHeight: height
    className: classKebab {
      isDark
      isFloating
      isRounded
      hasValue: type is 'date' or value isnt ''
      isFocused
      isDisabled
      isCentered
      isError: error?
    }
    # style:
    #   backgroundColor: colors.background
    z '.hint', {
      style:
        color: colors.ink
      # style:
      #   color: if isFocused and not error? \
      #          then colors.c500 else null
    },
      hintText
    z 'input.input',
      disabled: if isDisabled then true else undefined
      autocomplete: if disableAutoComplete then 'off' else undefined
      # hack to get chrome to not autofill
      readonly: if disableAutoComplete then true else undefined
      autocapitalize: if not autoCapitalize then 'off' else undefined
      type: type
      # FIXME?
      style: "color: #{colors.ink};height: #{height};-webkit-text-fill-color:#{colors.ink} !important;-webkit-box-shadow: 0 0 0 30px #{colors.background} inset !important"
      value: "#{value}" or ''
      oninput: (e) ->
        if valueStreams
          valueStreams.next Rx.of e.target.value
        else
          valueStream.next e.target.value
      onfocus: (e) ->
        if disableAutoComplete
          e.target.removeAttribute 'readonly' # hack to get chrome to not autofill
        isFocusedStream.next true
      onblur: (e) ->
        isFocusedStream.next false
    z '.underline-wrapper',
      z '.underline',
        style:
          backgroundColor: if isFocused and not error? \
                           then colors.underline or colors.c500 \
                           else colors.ink
    if error?
      z '.error', error