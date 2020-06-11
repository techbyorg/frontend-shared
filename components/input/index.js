/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useRef, useLayoutEffect, useStream } from 'zorium'

import $icon from '../icon'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $searchInput ({ icon, placeholder, valueStream }) {
  const { value } = useStream(() => ({
    value: valueStream
  }))

  return z('.z-input', {
    className: classKebab({ hasIcon: icon })
  },
  z('input.input', {
    placeholder,
    value,
    oninput (e) {
      return valueStream.next(e.target.value)
    }
  }
  ),
  icon
    ? z('.icon',
      z($icon,
        { icon })
    ) : undefined
  )
}