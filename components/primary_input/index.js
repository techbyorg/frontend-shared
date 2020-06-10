/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $icon from '../icon'
import $inputOld from '../input_old'
import { eyeIconPath, helpIconPath } from '../icon/paths'
import context from '../../context'
let $primaryInput

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $primaryInput = function (props) {
  const allColors = useContext(context).colors
  const { isPasswordVisibleStream } = useMemo(() => ({
    isPasswordVisibleStream: new Rx.BehaviorSubject(false)
  })
  , [])

  const { isPasswordVisible } = useStream(() => ({
    isPasswordVisible: isPasswordVisibleStream
  }))

  const propsType = props.type

  props.type = isPasswordVisible ? 'text' : props.type

  const {
    isFullWidth
  } = props

  const colors = props.colors || {
    // background: colors.$bgColor
    c200: allColors.$bgText54,
    c500: allColors.$bgText,
    c600: allColors.$bgText87,
    c700: allColors.$bgText70,
    ink: allColors.$bgText
  }

  return z('.z-primary-input', {
    className: classKebab({ isFullWidth })
  },
  z($inputOld, _.defaults(props, {
    isRaised: true,
    isFloating: true,
    isDark: true,
    colors
  })),
  (() => {
    if (propsType === 'password') {
      return z('.make-visible', {
        onclick () {
          return isPasswordVisibleStream.next(!isPasswordVisible)
        }
      },
      z($icon, {
        icon: eyeIconPath,
        color: colors.ink,
        isTouchTarget: true
      }
      )
      )
    } else if (props.onInfo) {
      return z('.make-visible', {
        onclick () {
          return props.onInfo()
        }
      },
      z($icon, {
        icon: helpIconPath,
        color: colors.ink,
        isTouchTarget: true
      }
      )
      )
    }
  })()
  )
}
