import { z, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $spinner from '../../components/spinner'
import $button from '../../components/button'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $unsubscribeEmailPage ({ requestsStream }) {
  const { model, browser, lang, router } = useContext(context)

  useEffect(function () {
    let disposable
    if (typeof window !== 'undefined' && window !== null) {
      disposable = requestsStream.pipe(
        rx.switchMap(({ req, route }) =>
          Rx.from(model.user.unsubscribeEmail({
            userId: route.params.userId,
            tokenStr: route.params.tokenStr
          }).then(() => isUnsubscribedStream.next(true))).catchError(function (err) {
            console.log(err)
            errorStream.next('This email isn\'t subscribed')
            return Rx.of(null)
          })
        ),

        rx.take(1)
      ).subscribe()
    }

    return () => disposable?.unsubscribe()
  }
  , [])

  var { isUnsubscribedStream, errorStream } = useMemo(() => ({
    isUnsubscribedStream: new Rx.BehaviorSubject(false),
    errorStream: new Rx.BehaviorSubject(null)
  })
  , [])

  const { windowSize, isUnsubscribed, error } = useStream(() => ({
    windowSize: browser.getSize(),
    isUnsubscribed: isUnsubscribedStream,
    error: errorStream
  }))

  return z('.p-unsubscribe-email', {
    style: {
      height: `${windowSize.height}px`
    }
  }, [
    isUnsubscribed || error
      ? z('.is-verified', [
        error || lang.get('unsubscribeEmail.isUnsubscribed'),
        z('.home',
          z($button, {
            text: lang.get('unsubscribeEmail.tapHome'),
            onclick () {
              return router.go('home')
            }
          }
          )
        )
      ])
      : [
        z($spinner),
        z('.loading', 'Loading...'),
        router.link(z('a.stuck', {
          href: router.get('home')
        }, 'Stuck? Tap to go home'))
      ]
  ])
}
