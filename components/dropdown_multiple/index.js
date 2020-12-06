import { z, classKebab, useMemo, useRef, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $positionedOverlay from '../positioned_overlay'
import $checkbox from '../checkbox'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdownMultiple (props) {
  const {
    valuesStreams, errorStream, $current, optionsStream, placeholder,
    $$parentRef, isFullWidth, isDisabled = false, anchor = 'top-left',
    maxHeightPx = 200
  } = props

  const $$ref = useRef()

  const { isOpenStream, optionsWithIsCheckedStream } = useMemo(() => {
    const optionsAndValuesStream = Rx.combineLatest(
      optionsStream,
      valuesStreams.stream
    )
    const optionsWithIsCheckedStream = optionsAndValuesStream.pipe(
      rx.map(([options, values]) => {
        values = values || []
        return _.map(options, (option) => {
          const isCheckedStream = new Rx.BehaviorSubject(
            values.indexOf(option.value) !== -1
          )
          return { option, isCheckedStream }
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
    values: valuesStreams.stream.pipe(rx.map((values) => values || [])),
    isOpen: isOpenStream,
    error: errorStream
  }))

  const toggle = () => isOpenStream.next(!isOpen)

  const currentText = _.filter(_.map(optionsWithIsChecked, ({ option }) =>
    values.indexOf(option.value) !== -1 && option.text
  )).join(', ') || placeholder || ''

  console.log('pref', $$parentRef)

  return z('.z-dropdown-multiple', {
    ref: $$ref,
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
    isOpen && z($positionedOverlay, {
      onClose () {
        return isOpenStream.next(false)
      },
      $$targetRef: $$ref,
      fillTargetWidth: true,
      anchor,
      zIndex: 9999999,
      $$parentRef,
      $content: z('.z-dropdown-multiple_options', {
        style: { maxHeight: maxHeightPx }
      }, _.map(optionsWithIsChecked, ({ option, isCheckedStream }) =>
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
              valuesStreams.next(newValues)
            },
            valueStream: isCheckedStream
          }))
        ])
      ))
    }),
    error && z('.error', error)
  ])
}
