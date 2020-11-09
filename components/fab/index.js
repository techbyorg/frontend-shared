import { z, useContext, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $icon from '../icon'
import $ripple from '../ripple'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $fab (props) {
  const {
    icon, colors, isPrimary, isSecondary, isInverted, onclick,
    isImmediate = true,
    sizePx = 56
  } = props
  const allColors = useContext(context).colors

  const { colorsMemo } = useMemo(colors => {
    return {
      colorsMemo: _.defaults(colors, {
        c500: isPrimary ? allColors.$primaryMain
          : isSecondary ? allColors.$secondaryMain
            : isInverted ? allColors.$bgText87
              : allColors.$white,
        cText: isPrimary ? allColors.$primaryMainText
          : isSecondary ? allColors.$secondaryMainText
            : isInverted ? allColors.$bgColor
              : allColors.$bgText87,
        ripple: allColors.$white
      })
    }
  }, [colors])

  return z('.z-fab', {
    onclick: isImmediate && onclick,
    style: {
      backgroundColor: colorsMemo.c500,
      width: `${sizePx}px`,
      height: `${sizePx}px`
    }
  }, [
    z('.icon-container', [
      z($icon, {
        icon,
        color: colorsMemo.cText
      })
    ]),
    z($ripple, {
      onComplete: !isImmediate && onclick,
      color: colorsMemo.ripple
    })
  ])
}
