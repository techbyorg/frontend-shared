import {z, classKebab, useMemo, useRef, useStream} from 'zorium'
import _map from 'lodash/map'
import _find from 'lodash/find'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxReplaySubject = require('rxjs/ReplaySubject').ReplaySubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/of'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import colors from '../../colors'

if window?
  require './index.styl'

module.exports = $dropdown = (props) ->
  {valueStreams, valueStream, errorStream, options, $$parentRef,
    anchor = 'top-left', isDisabled = false} = props

  $$ref = useRef()

  {valueStream, selectedOptionStream, isOpenStream} = useMemo ->
    {
      valueStream: valueStream or new RxReplaySubject 1
      selectedOptionStream: valueStream
      isOpenStream: new RxBehaviorSubject false
    }
  , []

  {value, selectedOption, isOpen, options} = useStream ->
    _valueStream = valueStreams?.switch() or valueStream
    value: _valueStream
    selectedOption: _valueStream.map (value) ->
      _find options, {value: "#{value}"}
    error: errorStream
    isOpen: isOpenStream
    options: options

  console.log 'dropdown val', value

  setValue = (value) ->
    if valueStreams
      valueStreams.next RxObservable.of value
    else
      valueStream.next value

  toggle = ->
    isOpenStream.next not isOpen

  z '.z-dropdown', {
    ref: $$ref
    className: classKebab {
      hasValue: value isnt ''
      isDisabled
      isOpen
      isError: error?
    }
  },
    z '.wrapper', {
      onclick: ->
        toggle()
    }
    z '.current', {
      onclick: toggle
    },
      z '.text',
        selectedOption?.text
      z '.arrow',
        z $icon,
          icon: 'chevron-down'
          isTouchTarget: false
          color: colors.$secondaryMainText

    if isOpen
      z $positionedOverlay,
        onClose: ->
          isOpenStream.next false
        $$targetRef: $$ref
        fillTargetWidth: true
        anchor: anchor
        zIndex: 999
        $$parentRef: $$parentRef
        $content:
          z '.z-dropdown_options',
            _map options, (option) ->
              z 'label.option', {
                className: classKebab {isSelected: "#{value}" is option.value}
                onclick: ->
                  setValue option.value
                  toggle()
              },
                z '.text',
                  option.text
    if error?
      z '.error', error
