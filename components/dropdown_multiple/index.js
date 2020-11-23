import { z, classKebab, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $checkbox from '../checkbox'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdownMultiple (props) {
  const {
    valuesStreams, errorStream, $current, optionsStream, placeholder,
    isFullWidth, isDisabled = false
  } = props

  const { isOpenStream, optionsWithIsCheckedStream } = useMemo(() => {
    const optionsAndValuesStreams = Rx.combineLatest(
      optionsStream,
      // don't want to generate new isCheckedStreams as value changes
      valuesStreams.pipe(rx.switchAll(), rx.take(1))
    )
    const optionsWithIsCheckedStream = optionsAndValuesStreams.pipe(
      rx.map(([options, values]) => {
        values = values || []
        return _.map(options, (option) => {
          const isCheckedStreams = new Rx.ReplaySubject(1)
          isCheckedStreams.next(Rx.of(values.indexOf(option.value) !== -1))
          return { option, isCheckedStreams }
        })
      })
    )

    return {
      isOpenStream: new Rx.BehaviorSubject(false),
      optionsWithIsCheckedStream
    }
  }, [])

  const { optionsWithIsChecked, values, isOpen, error } = useStream(() => ({
    optionsWithIsChecked: optionsWithIsCheckedStream,
    values: valuesStreams.pipe(rx.switchAll(), rx.map((values) => values || [])),
    isOpen: isOpenStream,
    error: errorStream
  }))

  const toggle = () => isOpenStream.next(!isOpen)

  const currentText = _.filter(_.map(optionsWithIsChecked, ({ option }) =>
    values.indexOf(option.value) !== -1 && option.text
  )).join(', ') || placeholder || ''

  console.log('ct', currentText, placeholder)

  return z('.z-dropdown-multiple', {
    // vdom doesn't key defaultValue correctly if elements are switched
    // key: _.kebabCase hintText
    className: classKebab({
      hasValue: !_.isEmpty(values),
      isDisabled,
      isFullWidth,
      isOpen,
      isError: (error != null)
    })
  }, [
    z('.wrapper', { onclick: () => { toggle() } }),
    z('.current', { onclick: toggle }, [
      $current || [
        z('.text', currentText),
        z('.arrow')
      ]
    ]),
    z('.options',
      _.map(optionsWithIsChecked, ({ option, isCheckedStreams }) =>
        z('label.option', [
          z('.text', option?.text),
          z('.checkbox', z($checkbox, {
            onChange: (isChecked) => {
              let newValues
              if (isChecked) {
                newValues = values.concat(option.value)
              } else {
                newValues = _.filter(values, (value) => value !== option.value)
              }
              valuesStreams.next(Rx.of(newValues))
            },
            valueStreams: isCheckedStreams
          }))
        ])
      )
    ),
    error && z('.error', error)
  ])
}
