import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import PropTypes from 'prop-types'

import $ripple from '../ripple'
import $icon from '../icon'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $button (props) {
  // TODO: adding isLoading prop
  const {
    isPrimary, isSecondary, isDisplay, isInverted, isDisabled, text,
    isBgColor, isOutline, icon, shouldHandleLoading, onclick = () => null,
    isFullWidth = true, type = 'button', heightPx = 36, hasRipple = true
    // isLoadingStream (accessed via props)
  } = props
  const { colors, lang } = useContext(context)

  const { isLoadingStream } = useMemo(() => {
    return {
      isLoadingStream: props.isLoadingStream || new Rx.BehaviorSubject(false)
    }
  }, [])

  const { isLoading } = useStream(() => ({
    isLoading: isLoadingStream
  }))

  return z('.z-button', {
    className: classKebab({
      isFullWidth,
      isOutline,
      isPrimary,
      isSecondary,
      isBgColor,
      isDisplay,
      isInverted,
      isDisabled
    }),
    onclick: async (e) => {
      if (!isDisabled) {
        shouldHandleLoading && isLoadingStream.next(true)
        try {
          await onclick(e)
          shouldHandleLoading && isLoadingStream.next(false)
        } catch (err) {
          shouldHandleLoading && isLoadingStream.next(false)
          throw err
        }
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
      isLoading ? lang.get('general.loading') : text,
      hasRipple &&
        z($ripple, {
          color: isPrimary ? colors.$primaryMainText : colors.$bgText26
        })
    ])
  ])
}

$button.propTypes = {
  isPrimary: PropTypes.bool.isRequired,
  isDisplay: PropTypes.bool,
  isSecondary: PropTypes.bool,
  isInverted: PropTypes.bool,
  isDisabled: PropTypes.bool,
  text: PropTypes.string,
  isBgColor: PropTypes.bool,
  isOutline: PropTypes.bool,
  icon: PropTypes.string,
  shouldHandleLoading: PropTypes.bool,
  onclick: PropTypes.func,
  isFullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'enum']),
  heightPx: PropTypes.number,
  hasRipple: PropTypes.bool
}
