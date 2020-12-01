import { z, classKebab, useContext, useMemo, useRef, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from '../icon'
import $positionedOverlay from '../positioned_overlay'
import { chevronDownIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $dropdown (props) {
  const {
    valueStreams, errorStream, options, $$parentRef, isPrimary, $current,
    onChange, isCondensedOptions, isFullWidth, placeholder, anchor = 'top-left',
    isDisabled = false, maxHeightPx = 200
  } = props
  const { colors } = useContext(context)

  const $$ref = useRef()

  const { valueStream, isOpenStream } = useMemo(() => {
    return {
      valueStream: props.valueStream || new Rx.BehaviorSubject(null),
      isOpenStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { value, isOpen } = useStream(() => {
    return {
      value: streamsOrStream(valueStreams, valueStream),
      error: errorStream,
      isOpen: isOpenStream
    }
  })

  const selectedOption = useMemo(() => _.find(options, { value: `${value}` }), [value, options])

  const toggle = () => isOpenStream.next(!isOpen)

  return z('.z-dropdown', {
    ref: $$ref,
    className: classKebab({
      hasValue: value,
      isPrimary,
      isDisabled,
      isOpen,
      isFullWidth
    })
  }, [
    z('.wrapper', { onclick: toggle },
      $current || z('.current', [
        z('.text', selectedOption?.text || placeholder),
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
        zIndex: 9999999,
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
