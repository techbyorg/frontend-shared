import { z, classKebab, useStream } from 'zorium'

import $icon from '../icon'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $input (props) {
  const {
    icon, placeholder, valueStream, valueStreams, errorStream, isFullWidth,
    onclick, type = 'text'
  } = props

  const { value, error } = useStream(() => ({
    value: streamsOrStream(valueStreams, valueStream),
    error: errorStream
  }))

  return z('.z-input', {
    className: classKebab({ isFullWidth, hasIcon: icon })
  }, [
    z('input.input', {
      placeholder,
      value,
      type,
      onclick,
      oninput: (e) => {
        setStreamsOrStream(valueStreams, valueStream, e.target.value)
      }
    }),
    icon && z('.icon', z($icon, { icon })),
    error && z('.error', error)
  ])
}
