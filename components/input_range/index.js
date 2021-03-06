import { z, classKebab, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $inputRange (props) {
  const {
    valueStreams, minValue, maxValue, onChange, hideInfo, step
  } = props
  const { lang } = useContext(context)

  useEffect(function () {
    let disposable
    if (onChange) {
      disposable = streamsOrStream(valueStreams, valueStream)
        .subscribe(onChange)
    }

    return () => disposable?.unsubscribe()
  }, [])

  const { valueStream } = useMemo(() => {
    return {
      valueStream: props.valueStream || new Rx.BehaviorSubject(null)
    }
  }, [])

  const { value } = useStream(() => ({
    value: (streamsOrStream(valueStreams, valueStream)).pipe(
      rx.map((value) => (value != null) ? parseInt(value) : null)
    )
  }))

  const percent = parseInt((100 * (((value != null) ? value : 1) - minValue)) / (maxValue - minValue))

  // FIXME: handle null starting value better (clicking on mid should set value)

  return z('.z-input-range', {
    className: classKebab({ hasValue: (value != null) })
  }, [
    z('label.label', [
      z('.range-container', [
        z(`input.range.percent-${percent}`, {
          type: 'range',
          min: `${minValue}`,
          max: `${maxValue}`,
          step: `${step || 1}`,
          value: `${value}`,
          ontouchstart: (e) => {
            return e.stopPropagation()
          },
          onclick: (e) => {
            setStreamsOrStream(
              valueStreams, valueStream, parseInt(e.currentTarget.value)
            )
          },
          oninput: (e) => {
            setStreamsOrStream(
              valueStreams, valueStream, parseInt(e.currentTarget.value)
            )
          }
        })
      ]),
      !hideInfo &&
        z('.info', [
          z('.unset', lang.get('inputRange.default')),
          z('.numbers', [
            _.map(_.range(minValue, maxValue + 1), (number) => {
              const isStepWithNumber = [
                minValue, maxValue / 2, maxValue, value
              ].includes(number)
              return z('.number', {
                onclick: () => {
                  setStreamsOrStream(
                    valueStreams, valueStream, parseInt(number)
                  )
                }
              }, isStepWithNumber && number)
            })
          ])
        ])
    ])
  ])
}
