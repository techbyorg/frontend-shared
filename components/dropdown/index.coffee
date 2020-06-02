import {z, classKebab, useContext, useMemo, useRef, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import {chevronDownIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

export default $dropdown = (props) ->
  {valueStreams, valueStream, errorStream, options, $$parentRef, isPrimary,
    anchor = 'top-left', isDisabled = false} = props
  {colors} = useContext context

  $$ref = useRef()

  {valueStream, selectedOptionStream, isOpenStream} = useMemo ->
    {
      valueStream: valueStream or new Rx.ReplaySubject 1
      selectedOptionStream: valueStream
      isOpenStream: new Rx.BehaviorSubject false
    }
  , []

  {value, selectedOption, isOpen, options} = useStream ->
    _.valueStream = valueStreams?.pipe(switchAll()) or valueStream
    value: _.valueStream
    selectedOption: _.valueStream.pipe rx.map (value) ->
      _.find options, {value: "#{value}"}
    error: errorStream
    isOpen: isOpenStream
    options: options

  console.log 'dropdown val', value

  setValue = (value) ->
    if valueStreams
      valueStreams.next Rx.of value
    else
      valueStream.next value

  toggle = ->
    isOpenStream.next not isOpen

  z '.z-dropdown', {
    ref: $$ref
    className: classKebab {
      hasValue: value isnt ''
      isPrimary
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
          icon: chevronDownIconPath
          isTouchTarget: false
          color: if isPrimary \
                 then colors.$secondaryMainText \
                 else colors.$bgText

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
            _.map options, (option) ->
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
