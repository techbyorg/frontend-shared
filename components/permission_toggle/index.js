import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $icon from 'frontend-shared/components/icon'
import { checkIconPath, closeIconPath, slashIconPath } from 'frontend-shared/components/icon/paths'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $permissionToggle (props) {
  const { valueStreams } = props
  const { colors, lang } = useContext(context)

  const { valueStream } = useMemo(() => ({
    valueStream: props.valueStream || new Rx.BehaviorSubject(null)
  }), [])

  const { value } = useStream(() => ({
    value: streamsOrStream(valueStreams, valueStream)
  }))

  const isNo = value === false
  const isInherit = value === null || value === undefined
  const isYes = value === true

  return z('.z-permission-toggle', {
    className: classKebab({ value })
  }, [
    z('.no', {
      title: lang.get('permissionToggle.noTooltip'),
      className: classKebab({ isSelected: isNo }),
      onclick: () => setStreamsOrStream(valueStreams, valueStream, false)
    }, z($icon, {
      icon: closeIconPath,
      size: '18px',
      color: isNo ? colors.$bgColor : colors.$bgText60
    })),
    z('.inherit', {
      title: lang.get('permissionToggle.inheritTooltip'),
      className: classKebab({ isSelected: isInherit }),
      onclick: () => setStreamsOrStream(valueStreams, valueStream, null)
    }, z($icon, {
      icon: slashIconPath,
      size: '18px',
      color: isInherit ? colors.$bgColor : colors.$bgText60
    })),
    z('.yes', {
      title: lang.get('permissionToggle.yesTooltip'),
      className: classKebab({ isSelected: isYes }),
      onclick: () => setStreamsOrStream(valueStreams, valueStream, true)
    }, z($icon, {
      icon: checkIconPath,
      size: '18px',
      color: isYes ? colors.$bgColor : colors.$bgText60
    }))
  ])
}
