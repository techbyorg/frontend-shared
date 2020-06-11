/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useMemo, useStream } from 'zorium'

import $button from '../button'
import $dialog from '../dialog'
import context from '../../context'
Rx.BehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $requestRatingDialog ({ onClose }) {
  const { model, portal, lang, colors } = useContext(context)

  const { isLoadingStream } = useMemo(() => ({
    isLoadingStream: new Rx.BehaviorSubject(false)
  })
  , [])

  const { isLoading } = useStream(() => ({
    isLoading: isLoadingStream
  }))

  return z('.z-request-rating-dialog',
    z($dialog, {
      onClose () {
        localStorage.hasSeenRequestRating = '1'
        return onClose?.()
      },
      isWide: true,
      $title: lang.get('requestRating.title'),
      $content: lang.get('requestRating.text'),
      $actions: [
        z($button, {
          text: lang.get('general.no'),
          colors: {
            cText: colors.$bgText54
          },
          onclick () {
            localStorage.hasSeenRequestRating = '1'
            return onClose?.()
          }
        }
        ),
        z($button, {
          text: lang.get('requestRating.rate'),
          colors: {
            cText: colors.$secondaryMain
          },
          onclick () {
              globalThis?.window?.ga?.('send', 'event', 'requestRating', 'rate')
              localStorage.hasSeenRequestRating = '1'
              isLoadingStream.next(true)
              return portal.call('app.rate')
                .then(function () {
                  isLoadingStream.next(false)
                  return model.overlay.close()
                }).catch(() => isLoadingStream.next(false))
          }
        }
        )
      ]
    }))
}
