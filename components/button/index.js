import { z, classKebab, useContext } from 'zorium'

import $ripple from '../ripple'
import $icon from '../icon'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $button (props) {
  const {
    isPrimary, isSecondary, isDisplay, isInverted, isDisabled, text, isOutline,
    icon, onclick = () => null, isFullWidth = true, type = 'button',
    heightPx = 36, hasRipple = true
  } = props
  const { colors } = useContext(context)

  return z('.z-button', {
    className: classKebab({
      isFullWidth,
      isOutline,
      isPrimary,
      isSecondary,
      isDisplay,
      isInverted,
      isDisabled
    }),
    onclick: (e) => {
      if (!isDisabled) {
        return onclick(e)
      }
    }
  }, [
    z('button.button', {
      type,
      disabled: Boolean(isDisabled),
      style: {
        // lineHeight: "#{heightPx}px"
        minHeight: `${heightPx}px`
      }
    }, [
      icon &&
        z('.icon', [
          z($icon, {
            icon,
            color: isPrimary ? colors.$primaryMainText : colors.$primaryMain
          })
        ]),
      text,
      hasRipple &&
        z($ripple, {
          color: isPrimary ? colors.$primaryMainText : colors.$bgText26
        })
    ])
  ])
}
