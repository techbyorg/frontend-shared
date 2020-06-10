/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useEffect, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Spinner from '../../components/spinner'
import Button from '../../components/button'
import context from '../../context'
let $verifyEmailPage

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default $verifyEmailPage = function ({ model, requestsStream, router }) {
  let browser, lang;
  ({ model, browser, lang, router } = useContext(context))

  useEffect(function () {
    let disposable
    if (typeof window !== 'undefined' && window !== null) {
      disposable = requestsStream.pipe(
        rx.switchMap(({ req, route }) => Rx.fromPromise(model.user.verifyEmail({
          userId: route.params.userId,
          tokenStr: route.params.tokenStr
        }).then(() => isVerifiedStream.next(true))).catchError(function (err) {
          console.log(err)
          errorStream.next('There was an error verifying your email!')
          return Rx.of(null)
        })),

        rx.take(1)
      ).subscribe()
    }

    return () => disposable?.unsubscribe()
  }
  , [])

  var { isVerifiedStream, errorStream } = useMemo(() => ({
    isVerifiedStream: new Rx.BehaviorSubject(false),
    errorStream: new Rx.BehaviorSubject(null)
  })
  , [])

  const { windowSize, isVerified, error } = useStream(() => ({
    windowSize: browser.getSize(),
    isVerified: isVerifiedStream,
    error: errorStream
  }))

  return z('.p-verify-email', {
    style: {
      height: `${windowSize.height}px`
    }
  },
  isVerified || error
    ? z('.is-verified',
      error || lang.get('verifyEmail.isVerified'),
      z('.home',
        z($button, {
          text: lang.get('verifyEmail.tapHome'),
          onclick () {
            return router.go('home')
          }
        }
        )
      )
    )
    : [
      z($spinner),
      z('.loading', 'Loading...'),
      router.link(z('a.stuck', {
        href: router.get('home')
      }, 'Stuck? Tap to go home')
      )
    ])
}
