import { z, classKebab, useStream } from 'zorium'

import $icon from '../icon'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $input (props) {
  const { icon, placeholder, valueStream, valueStreams, errorStream, type = 'text' } = props

  const { value, error } = useStream(() => ({
    value: streamsOrStream(valueStreams, valueStream),
    error: errorStream
  }))

  return z('.z-input', {
    className: classKebab({ hasIcon: icon })
  }, [
    z('input.input', {
      placeholder,
      value,
      type,
      oninput: (e) => {
        setStreamsOrStream(valueStreams, valueStream, e.target.value)
      }
    }),
    icon && z('.icon', z($icon, { icon })),
    error && z('.error', error)
  ])
}
