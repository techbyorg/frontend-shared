import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from '../icon'
import { checkIconPath } from '../icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $checkbox (props) {
  const { valueStreams, isDisabled, onChange } = props
  const allColors = useContext(context).colors

  const { valueStream } = useMemo(() => ({
    valueStream: props.valueStream || new Rx.BehaviorSubject(null)
    // errorStream: new Rx.BehaviorSubject(null)
  }), [])

  const { value } = useStream(() => ({
    value: streamsOrStream(valueStreams, valueStream)
  }))

  const colors = _.defaults(props.colors || {}, {
    checked: allColors.$primaryMain,
    checkedBorder: allColors.$primary900,
    border: allColors.$bgText26,
    background: allColors.$tertiary0
  })

  return z('.z-checkbox', [
    z('input.checkbox', {
      type: 'checkbox',
      style: {
        background: value ? colors.checked : colors.background,
        border: value
          ? `1px solid ${colors.checkedBorder}`
          : `1px solid ${colors.border}`
      },
      disabled: Boolean(isDisabled),
      checked: Boolean(value),
      onchange: (e) => {
        setStreamsOrStream(valueStreams, valueStream, e.target.checked)
        onChange?.(e.target.checked)
        return e.target.blur()
      }
    }),
    z('.icon', [
      z($icon, {
        icon: checkIconPath,
        color: allColors.$primaryMainText,
        size: '16px'
      })
    ])
  ])
}
