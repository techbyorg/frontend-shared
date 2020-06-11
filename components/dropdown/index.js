/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useMemo, useRef, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import { chevronDownIconPath } from '../icon/paths'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdown (props) {
  let isOpen, isOpenStream, selectedOption, selectedOptionStream, value
  let {
    valueStreams,
    valueStream,
    errorStream,
    options,
    $$parentRef,
    isPrimary
  } = props
  const val = props.anchor
  const anchor = val != null ? val : 'top-left'
  const val1 = props.isDisabled
  const isDisabled = val1 != null ? val1 : false
  const { colors } = useContext(context)

  const $$ref = useRef();

  ({ valueStream, selectedOptionStream, isOpenStream } = useMemo(() => ({
    valueStream: valueStream || new Rx.ReplaySubject(1),
    selectedOptionStream: valueStream,
    isOpenStream: new Rx.BehaviorSubject(false)
  })
  , []));

  ({ value, selectedOption, isOpen, options } = useStream(function () {
    _.valueStream = valueStreams?.pipe(switchAll()) || valueStream
    return {
      value: _.valueStream,
      selectedOption: _.valueStream.pipe(rx.map(value => _.find(options, { value: `${value}` }))),
      error: errorStream,
      isOpen: isOpenStream,
      options
    }
  }))

  console.log('dropdown val', value)

  function setValue (value) {
    if (valueStreams) {
      return valueStreams.next(Rx.of(value))
    } else {
      return valueStream.next(value)
    }
  }

  const toggle = () => isOpenStream.next(!isOpen)

  return z('.z-dropdown', {
    ref: $$ref,
    className: classKebab({
      hasValue: value !== '',
      isPrimary,
      isDisabled,
      isOpen,
      isError: (typeof error !== 'undefined' && error !== null)
    })
  },
  z('.wrapper', {
    onclick () {
      return toggle()
    }
  }),
  z('.current', {
    onclick: toggle
  },
  z('.text',
        selectedOption?.text),
  z('.arrow',
    z($icon, {
      icon: chevronDownIconPath,
      color: isPrimary
        ? colors.$secondaryMainText
        : colors.$bgText
    }
    )
  )
  ),

  isOpen
    ? z($positionedOverlay, {
      onClose () {
        return isOpenStream.next(false)
      },
      $$targetRef: $$ref,
      fillTargetWidth: true,
      anchor,
      zIndex: 999,
      $$parentRef,
      $content:
          z('.z-dropdown_options',
            _.map(options, option => z('label.option', {
              className: classKebab({ isSelected: `${value}` === option.value }),
              onclick () {
                setValue(option.value)
                return toggle()
              }
            },
            z('.text',
              option.text)
            ))
          )
    }
    ) : undefined,
  (typeof error !== 'undefined' && error !== null)
    ? z('.error', error) : undefined
  )
}
