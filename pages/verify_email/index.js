import { z, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $spinner from '../../components/spinner'
import $button from '../../components/button'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $verifyEmailPage ({ model, requestsStream, router }) {
  const { browser, lang } = useContext(context)

  useEffect(function () {
    let disposable
    if (typeof window !== 'undefined' && window !== null) {
      disposable = requestsStream.pipe(
<<<<<<< HEAD
        rx.switchMap(({ req, route }) =>
          Rx.fromPromise(model.user.verifyEmail({
            userId: route.params.userId,
            tokenStr: route.params.tokenStr
          }).then(() => isVerifiedStream.next(true))).catchError(function (err) {
            console.log(err)
            errorStream.next('There was an error verifying your email!')
            return Rx.of(null)
          })
        ),
=======
        rx.switchMap(({ req, route }) => Rx.from(model.user.verifyEmail({
          userId: route.params.userId,
          tokenStr: route.params.tokenStr
        }).then(() => isVerifiedStream.next(true))).catchError(function (err) {
          console.log(err)
          errorStream.next('There was an error verifying your email!')
          return Rx.of(null)
        })),
>>>>>>> f2795a82899721432510e55b8dd6b5c29a159da4

        rx.take(1)
      ).subscribe()
    }

    return () => disposable?.unsubscribe()
  }
  , [])

  const { isVerifiedStream, errorStream } = useMemo(() => ({
    isVerifiedStream: new Rx.BehaviorSubject(false),
    errorStream: new Rx.BehaviorSubject(null)
  }), [])

  const { windowSize, isVerified, error } = useStream(() => ({
    windowSize: browser.getSize(),
    isVerified: isVerifiedStream,
    error: errorStream
  }))

  return z('.p-verify-email', {
    style: {
      height: `${windowSize.height}px`
    }
  }, [
    isVerified || error
      ? z('.is-verified',
        error || lang.get('verifyEmail.isVerified'),
        z('.home', [
          z($button, {
            text: lang.get('verifyEmail.tapHome'),
            onclick () {
              return router.go('home')
            }
          })
        ])
      )
      : [
        z($spinner),
        z('.loading', 'Loading...'),
        router.link(z('a.stuck', {
          href: router.get('home')
        }, 'Stuck? Tap to go home'))
      ]
  ])
}
