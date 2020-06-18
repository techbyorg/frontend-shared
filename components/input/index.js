import { z, classKebab, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $input (props) {
  const { icon, placeholder, valueStream, valueStreams, type = 'text' } = props

  const { value } = useStream(() => ({
    value: valueStreams?.pipe(rx.switchAll()) || valueStream
  }))

  function setValue (value) {
    if (valueStreams) {
      return valueStreams.next(Rx.of(value))
    } else {
      return valueStream.next(value)
    }
  }

  return z('.z-input', {
    className: classKebab({ hasIcon: icon })
  }, [
    z('input.input', {
      placeholder,
      value,
      type,
      oninput: (e) => { setValue(e.target.value) }
    }),
    icon && z('.icon', z($icon, { icon }))
  ])
}
