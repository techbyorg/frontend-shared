import {z, useContext, useRef, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import {checkIconPath} from '../icon/paths'
import context from '../../context'

if window?
  require './index.styl'

export default $checkbox = (props) ->
  {valueStream, valueStreams, isDisabled, colors, onChange} = props
  allColors = useContext(context).colors

  {valueStream, errorStream} = useMemo ->
    {
      valueStream: valueStream or new Rx.BehaviorSubject null
      errorStream: new Rx.BehaviorSubject null
    }

  # $$ref = useRef (props) ->
  #   props.ref.current = {isChecked: -> ref.current.checked}

  {value} = useStream ->
    value: valueStreams?.pipe(rx.switchAll()) or valueStream

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
          valueStreams.next Rx.of e.target.checked
        else
          valueStream.next e.target.checked
        onChange?()
        e.target.blur()
    }
    z '.icon',
      z $icon,
        icon: checkIconPath
        isTouchTarget: false
        color: allColors.$primaryMainText
        size: '16px'
