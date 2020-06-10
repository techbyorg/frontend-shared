import {z, classKebab, useContext, useEffect, useMemo, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if window?
  require './index.styl'

export default $inputRange = (props) ->
  {valueStream, valueStreams, minValue, maxValue, onChange,
    hideInfo, step} = props
  {lang} = useContext context

  useEffect ->
    if onChange
      disposable = (valueStreams?.pipe(rx.switchAll()) or value).subscribe onChange

    return -> disposable?.unsubscribe()
  , []

  {valueStream} = useMemo ->
    {
      valueStream: valueStream or new Rx.BehaviorSubject null
    }
  , []

  {value} = useStream ->
    value: valueStreams?.pipe(rx.switchAll()) or valueStream

  setValue = (value) ->
    if valueStreams
      valueStreams.next Rx.of value
    else
      valueStream.next value

  value = if value? then parseInt(value) else null

  percent = parseInt 100 * ((if value? then value else 1) - minValue) / (maxValue - minValue)

  # FIXME: handle null starting value better (clicking on mid should set value)

  z '.z-input-range', {
    className: classKebab {hasValue: value?}
  },
    z 'label.label',
      z '.range-container',
        z "input.range.percent-#{percent}",
          type: 'range'
          min: "#{minValue}"
          max: "#{maxValue}"
          step: "#{step or 1}"
          value: "#{value}"
          ontouchstart: (e) ->
            e.stopPropagation()
          onclick: (e) ->
            setValue parseInt(e.currentTarget.value)
          oninput: (e) ->
            setValue parseInt(e.currentTarget.value)
      unless hideInfo
        z '.info',
          z '.unset', lang.get 'inputRange.default'
          z '.numbers',
            _.map _.range(minValue, maxValue + 1), (number) ->
              z '.number', {
                onclick: ->
                  setValue parseInt(number)
              },
                if number in [minValue, maxValue / 2, maxValue, value]
                  number
