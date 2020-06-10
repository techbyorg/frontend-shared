/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useRef, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import { checkIconPath } from '../icon/paths'
import context from '../../context'
let $checkbox

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $checkbox = function (props) {
  let errorStream
  let { valueStream, valueStreams, isDisabled, colors, onChange } = props
  const allColors = useContext(context).colors;

  ({ valueStream, errorStream } = useMemo(() => ({
    valueStream: valueStream || new Rx.BehaviorSubject(null),
    errorStream: new Rx.BehaviorSubject(null)
  })
  , []))

  // $$ref = useRef (props) ->
  //   props.ref.current = {isChecked: -> ref.current.checked}

  const { value } = useStream(() => ({
    value: valueStreams?.pipe(rx.switchAll()) || valueStream
  }))

  colors = _.defaults(colors || {}, {
    checked: allColors.$primaryMain,
    checkedBorder: allColors.$primary900,
    border: allColors.$bgText26,
    background: allColors.$tertiary0
  })

  return z('.z-checkbox', {
    // ref: $$ref
  },
  z('input.checkbox', {
    type: 'checkbox',
    style: {
      background: value ? colors.checked : colors.background,
      border: value
        ? `1px solid ${colors.checkedBorder}`
        : `1px solid ${colors.border}`
    },
    disabled: !!isDisabled,
    checked: !!value,
    onchange (e) {
      if (valueStreams) {
        valueStreams.next(Rx.of(e.target.checked))
      } else {
        valueStream.next(e.target.checked)
      }
        onChange?.(e.target.checked)
        return e.target.blur()
    }
  }),
  z('.icon',
    z($icon, {
      icon: checkIconPath,
      color: allColors.$primaryMainText,
      size: '16px'
    }
    )
  )
  )
}
