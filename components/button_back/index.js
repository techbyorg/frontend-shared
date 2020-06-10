/* eslint-disable
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext } from 'zorium'

import $icon from '../icon'
import { backIconPath } from '../icon/paths'
import context from '../../context'
let $buttonBack

export default $buttonBack = function (props) {
  const {
    color,
    onclick,
    fallbackPath
  } = props
  const val = props.isAlignedLeft
  const isAlignedLeft = val != null ? val : true
  const { router, colors } = useContext(context)

  return z('.z-button-back',
    z($icon, {
      isAlignedLeft,
      icon: backIconPath,
      color: color || colors.$header500Icon,
      hasRipple: true,
      isTouchTarget: true,
      onclick (e) {
        e.preventDefault()
        return setTimeout(function () {
          if (onclick) {
            return onclick()
          } else {
            return router.back({ fallbackPath })
          }
        }
        , 0)
      }
    }
    )
  )
}
