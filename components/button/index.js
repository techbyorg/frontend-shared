/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext } from 'zorium'

import $ripple from '../ripple'
import $icon from '../icon'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $button (props) {
  const obj = props || {}
  const {
    isPrimary,
    isSecondary,
    isFancy,
    isInverted,
    isDisabled,
    text
  } = obj
  const val = obj.isFullWidth
  const isFullWidth = val != null ? val : true
  const {
    isOutline
  } = obj
  const val1 = obj.onclick
  const onclick = val1 != null ? val1 : () => null
  const val2 = obj.type
  const type = val2 != null ? val2 : 'button'
  const {
    icon
  } = obj
  const val3 = obj.heightPx
  const heightPx = val3 != null ? val3 : 36
  const val4 = obj.hasRipple
  const hasRipple = val4 != null ? val4 : true
  const { colors } = useContext(context)

  return z('.z-button', {
    className: classKebab({
      isFullWidth,
      isOutline,
      isPrimary,
      isSecondary,
      isFancy,
      isInverted,
      isDisabled
    }),
    onclick (e) {
      if (!isDisabled) {
        return onclick(e)
      }
    }
  },

  z('button.button', {
    type,
    disabled: Boolean(isDisabled),
    style: {
      // lineHeight: "#{heightPx}px"
      minHeight: `${heightPx}px`
    }
  },
  icon
    ? z('.icon',
      z($icon, {
        icon,
        color: isPrimary
          ? colors.$primaryMainText
          : colors.$primaryMain
      }
      )
    ) : undefined,
  text,
  hasRipple
    ? z($ripple,
      { color: isPrimary ? colors.$primaryMainText : colors.$bgText26 }) : undefined
  )
  )
}
