import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $toggle (props) {
  const { isSelectedStream, onToggle, withText } = props
  const { lang } = useContext(context)

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
    if (isSelected) {
      isSelected.next(!isSelected)
    } else {
      isSelectedStreams.next(Rx.of(!isSelected))
    }
    return onToggle?.(!isSelected)
  }

  return z('.z-toggle', {
    className: classKebab({ isSelected, withText }),
    onclick: () => { return toggle({ onToggle }) }
  }, [
    z('.track',
      withText && isSelected
        ? lang.get('general.yes')
        : withText && lang.get('general.no')
    ),
    z('.knob')
  ])
}
