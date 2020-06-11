/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $inputRange (props) {
  let {
    valueStream, valueStreams, minValue, maxValue, onChange,
    hideInfo, step
  } = props
  const { lang } = useContext(context)

  useEffect(function () {
    let disposable
    if (onChange) {
      disposable = (valueStreams?.pipe(rx.switchAll()) || value).subscribe(onChange)
    }

    return () => disposable?.unsubscribe()
  }
  , []);

  ({ valueStream } = useMemo(() => ({
    valueStream: valueStream || new Rx.BehaviorSubject(null)
  })
  , []))

  var { value } = useStream(() => ({
    value: valueStreams?.pipe(rx.switchAll()) || valueStream
  }))

  function setValue (value) {
    if (valueStreams) {
      return valueStreams.next(Rx.of(value))
    } else {
      return valueStream.next(value)
    }
  }

  value = (value != null) ? parseInt(value) : null

  const percent = parseInt((100 * (((value != null) ? value : 1) - minValue)) / (maxValue - minValue))

  // FIXME: handle null starting value better (clicking on mid should set value)

  return z('.z-input-range', {
    className: classKebab({ hasValue: (value != null) })
  },
  z('label.label',
    z('.range-container',
      z(`input.range.percent-${percent}`, {
        type: 'range',
        min: `${minValue}`,
        max: `${maxValue}`,
        step: `${step || 1}`,
        value: `${value}`,
        ontouchstart (e) {
          return e.stopPropagation()
        },
        onclick (e) {
          return setValue(parseInt(e.currentTarget.value))
        },
        oninput (e) {
          return setValue(parseInt(e.currentTarget.value))
        }
      }
      )
    ),
    !hideInfo
      ? z('.info',
        z('.unset', lang.get('inputRange.default')),
        z('.numbers',
          _.map(_.range(minValue, maxValue + 1), number => z('.number', {
            onclick () {
              return setValue(parseInt(number))
            }
          },
          [minValue, maxValue / 2, maxValue, value].includes(number)
            ? number : undefined
          ))
        )
      ) : undefined
  )
  )
}
