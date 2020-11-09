import { z, classKebab, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $ripple from '../ripple'
import $icon from '../icon'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: adding isLoading prop
export default function $button (props) {
  const {
    isPrimary, isSecondary, isDisplay, isInverted, isDisabled, text, isOutline,
    icon, shouldHandleLoading, onclick = () => null, isFullWidth = true,
    type = 'button', heightPx = 36, hasRipple = true
  } = props
  const { colors, lang } = useContext(context)

  const { isLoadingStream } = useMemo(() => {
    return {
      isLoadingStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { isLoading } = useStream(() => ({
    isLoading: isLoadingStream
  }))

  console.log('isloading', isLoading)

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
