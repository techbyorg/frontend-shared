import { z, useStream } from 'zorium'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $textarea (props) {
  const { placeholder, valueStream, type = 'text' } = props

  const { value } = useStream(() => ({
    value: valueStream
  }))

  return z('.z-textarea', [
    z('textarea.textarea', {
      placeholder,
      value,
      type,
      oninput: (e) => { valueStream.next(e.target.value) }
    })
  ])
}
