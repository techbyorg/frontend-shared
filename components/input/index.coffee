{z, classKebab, useMemo, useStream} = require 'zorium'
_defaults = require 'lodash/defaults'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/of'
require 'rxjs/add/operator/switch'

allColors = require '../../colors'

if window?
  require './index.styl'

module.exports = $input = (props) ->
  {valueStream, valueStreams, errorStream, isFocusedStream
    colors, hintText = '', type = 'text', isFloating = false,
    isDisabled = false, isFullWidth,  autoCapitalize = true
    height, isDark, isCentered, disableAutoComplete} = props

  {valueStream, errorStream, isFocusedStream} = useMemo ->
    {
      valueStream: valueStream or new RxBehaviorSubject ''
      errorStream: errorStream or new RxBehaviorSubject null
      isFocusedStream: isFocusedStream or new RxBehaviorSubject false
    }
  , []

  {value, error, isFocused} = useStream ->
    value: valueStreams?.switch() or valueStream
    error: errorStream
    isFocused: isFocusedStream


  colors = _defaults colors, {
    c500: allColors.$bgColor
    background: allColors.$bgColor
    underline: allColors.$primaryMain
  }

  z '.z-input',
    style:
      height: height
      minHeight: height
    className: classKebab {
      isDark
      isFloating
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
          valueStreams.next RxObservable.of e.target.value
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
