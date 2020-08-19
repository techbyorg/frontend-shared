import { z, classKebab, useContext, useMemo, useRef, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import { chevronDownIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdown (props) {
  const {
    valueStreams, errorStream, options, $$parentRef, isPrimary, $current,
    onChange, isCondensedOptions, anchor = 'top-left', isDisabled = false,
    maxHeightPx = 200
  } = props
  const { colors } = useContext(context)

  const $$ref = useRef()

  const { valueStream, isOpenStream } = useMemo(() => {
    return {
      valueStream: props.valueStream || new Rx.BehaviorSubject(null),
      isOpenStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { value, selectedOption, isOpen } = useStream(() => {
    const _valueStream = streamsOrStream(valueStreams, valueStream)
    return {
      value: _valueStream,
      selectedOption: _valueStream.pipe(rx.map((value) =>
        _.find(options, { value: `${value}` }))
      ),
      error: errorStream,
      isOpen: isOpenStream
    }
  })

  console.log('sel', selectedOption)

  const toggle = () => isOpenStream.next(!isOpen)

  return z('.z-dropdown', {
    ref: $$ref,
    className: classKebab({
      hasValue: value !== '',
      isPrimary,
      isDisabled,
      isOpen
    })
  }, [
    z('.wrapper', { onclick: toggle },
      $current || z('.current', [
        z('.text', selectedOption?.text),
        z('.arrow', [
          z($icon, {
            icon: chevronDownIconPath,
            color: isPrimary
              ? colors.$secondaryMainText
              : colors.$bgText
          })
        ])
      ])
    ),

    isOpen &&
      z($positionedOverlay, {
        onClose () {
          return isOpenStream.next(false)
        },
        $$targetRef: $$ref,
        fillTargetWidth: true,
        anchor,
        zIndex: 999,
        $$parentRef,
        $content:
          z('.z-dropdown_options', {
            className: classKebab({ isCondensedOptions }),
            style: { maxHeight: maxHeightPx }
          }, _.map(options, option =>
            z('label.option', {
              className: classKebab({ isSelected: `${value}` === option.value }),
              onclick: () => {
                if (option.onSelect) {
                  option.onSelect()
                } else if (onChange) {
                  onChange(option.value)
                } else {
                  setStreamsOrStream(valueStreams, valueStream, option.value)
                }
                return toggle()
              }
            }, z('.text', option.text))
          ))
      })
  ])
}
