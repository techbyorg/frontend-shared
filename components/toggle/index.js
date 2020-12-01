import { z, classKebab, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $icon from '../icon'
import { checkIconPath } from '../icon/paths'
// import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $toggle (props) {
  const { isSelectedStream, onToggle } = props
  // const { lang } = useContext(context)

  const { isSelectedStreams } = useMemo(function () {
    let isSelectedStreams = props.isSelectedStreams
    if (!isSelectedStreams) {
      isSelectedStreams = new Rx.ReplaySubject(1)
      if (isSelectedStreams == null) { isSelectedStreams = Rx.of('') }
      isSelectedStreams.next(isSelectedStream)
    }
    return {
      isSelectedStreams
    }
  }, [])

  const { isSelected } = useStream(() => ({
    isSelected: isSelectedStreams.pipe(rx.switchAll())
  }))

  function toggle ({ onToggle } = {}) {
    if (isSelectedStream) {
      isSelectedStream.next(!isSelected)
    } else {
      isSelectedStreams.next(Rx.of(!isSelected))
    }
    return onToggle?.(!isSelected)
  }

  return z('.z-toggle', {
    className: classKebab({ isSelected }),
    onclick: () => { return toggle({ onToggle }) }
  }, [
    z('.track'),
    z('.knob', [
      z('.icon', z($icon, { icon: checkIconPath, size: '18px' }))
    ])
  ])
}
