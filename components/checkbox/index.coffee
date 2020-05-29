import {z, useRef, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/of'

import $icon from '../icon'
import allColors from '../../colors'

if window?
  require './index.styl'

module.exports = $checkbox = (props) ->
  {valueStream, valueStreams, isDisabled, colors, onChange} = props

  {valueStream, errorStream} = useMemo ->
    {
      valueStream: valueStream or new RxBehaviorSubject null
      errorStream: new RxBehaviorSubject null
    }

  # $$ref = useRef (props) ->
  #   props.ref.current = {isChecked: -> ref.current.checked}

  {value} = useStream ->
    value: valueStreams?.switch() or valueStream

  colors = _.defaults colors or {}, {
    checked: allColors.$primaryMain
    checkedBorder: allColors.$primary900
    border: allColors.$bgText26
    background: allColors.$tertiary0
  }

  z '.z-checkbox', {
    # ref: $$ref
  },
    z 'input.checkbox', {
      type: 'checkbox'
      style:
        background: if value then colors.checked else colors.background
        border: if value \
                then "1px solid #{colors.checkedBorder}" \
                else "1px solid #{colors.border}"
      disabled: if isDisabled then true else undefined
      checked: if value then true else undefined
      onchange: (e) ->
        if valueStreams
          valueStreams.next RxObservable.of e.target.checked
        else
          valueStream.next e.target.checked
        onChange?()
        e.target.blur()
    }
    z '.icon',
      z $icon,
        icon: 'check'
        isTouchTarget: false
        color: allColors.$primaryMainText
        size: '16px'
