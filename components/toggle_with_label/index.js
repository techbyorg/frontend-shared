import { z, useStream } from 'zorium'

import $toggle from '../toggle'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $toggleWithLabel (props) {
  const { placeholder, valueStream, type = 'text' } = props

  const { value } = useStream(() => ({
    value: valueStream
  }))

  return z('.z-toggle-with-label', [
    z($toggle)
  ])
}
