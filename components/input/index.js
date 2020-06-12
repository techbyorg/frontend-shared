import { z, classKebab, useStream } from 'zorium'

import $icon from '../icon'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $input (props) {
  const { icon, placeholder, valueStream, type = 'text' } = props

  const { value } = useStream(() => ({
    value: valueStream
  }))

  return z('.z-input', {
    className: classKebab({ hasIcon: icon })
  }, [
    z('input.input', {
      placeholder,
      value,
      type,
      oninput: (e) => { valueStream.next(e.target.value) }
    }),
    icon && z('.icon', z($icon, { icon }))
  ])
}
