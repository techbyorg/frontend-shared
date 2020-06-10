/* eslint-disable
    no-undef,
    no-unused-vars,
    prefer-const,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import context from '../../context'
let $togle

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $togle = function (props) {
  let isSelectedStreams, onToggle, withText;
  ({ isSelectedStreams, isSelectedStreams, onToggle, withText } = props)
  const { lang } = useContext(context);

  ({ isSelectedStreams } = useMemo(function () {
    if (!isSelectedStreams) {
      isSelectedStreams = new Rx.ReplaySubject(1)
      if (isSelectedStreams == null) { isSelectedStreams = Rx.of('') }
      isSelectedStreams.next(isSelectedStream)
    }
    return {
      isSelectedStreams
    }
  }
  , []))

  const { isSelected } = useStream(() => ({
    isSelected: isSelectedStreams.pipe(rx.switchAll())
  }))

  function toggle (param) {
    let onToggle
    if (param == null) { param = {} }
    ({ onToggle } = param)
    if (isSelected) {
      isSelected.next(!isSelected)
    } else {
      isSelectedStreams.next(Rx.of(!isSelected))
    }
    return onToggle?.(!isSelected)
  }

  return z('.z-toggle', {
    className: classKebab({ isSelected, withText }),
    onclick () { return toggle({ onToggle }) }
  },
  z('.track',
    (() => {
      if (withText && isSelected) {
        return lang.get('general.yes')
      } else if (withText) {
        return lang.get('general.no')
      }
    })()
  ),

  z('.knob'))
}
