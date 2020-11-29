import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $permissionToggle (props) {
  const { valueStreams, withText } = props
  const { lang } = useContext(context)

  const { valueStream } = useMemo(() => ({
    valueStream: props.valueStream || new Rx.BehaviorSubject(null)
  }), [])

  const { value } = useStream(() => ({
    value: streamsOrStream(valueStreams, valueStream)
  }))

  return z('.z-permission-toggle', {
    className: classKebab({ value, withText })
  }, [
    z('.no', {
      className: classKebab({
        isSelected: value === false
      }),
      onclick: () => {
        setStreamsOrStream(valueStreams, valueStream, false)
      }
    }, lang.get('general.no')),
    z('.inherit', {
      className: classKebab({
        isSelected: value === null || value === undefined
      }),
      onclick: () => {
        setStreamsOrStream(valueStreams, valueStream, null)
      }
    }, lang.get('general.next')),
    z('.yes', {
      className: classKebab({
        isSelected: value === true
      }),
      onclick: () => {
        setStreamsOrStream(valueStreams, valueStream, true)
      }
    }, lang.get('general.yes'))
  ])
}
