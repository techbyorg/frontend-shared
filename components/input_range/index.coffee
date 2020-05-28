import {z, classKebab, useContext, useEffect, useMemo, useStream} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/of'
import _map from 'lodash/map'
import _range from 'lodash/range'

import context from '../../context'

if window?
  require './index.styl'

module.exports = $inputRange = (props) ->
  {valueStream, valueStreams, minValue, maxValue, onChange,
    hideInfo, step} = props
  {lang} = useContext context

  useEffect ->
    if onChange
      disposable = (valueStreams?.switch() or value).subscribe onChange

    return -> disposable?.unsubscribe()
  , []

  {valueStream} = useMemo ->
    {
      valueStream: valueStream or new RxBehaviorSubject null
    }
  , []

  {value} = useStream ->
    value: valueStreams?.switch() or valueStream

  setValue = (value) ->
    if valueStreams
      valueStreams.next RxObservable.of value
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
            _map _range(minValue, maxValue + 1), (number) ->
              z '.number', {
                onclick: ->
                  setValue parseInt(number)
              },
                if number in [minValue, maxValue / 2, maxValue, value]
                  number
