import {z, useContext, useEffect, useMemo, useStream} from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Spinner from '../../components/spinner'
import Button from '../../components/button'
import context from '../../context'

if window?
  require './index.styl'

export default $verifyEmailPage = ({model, requestsStream, router}) ->
  {model, browser, lang, router} = useContext context

  useEffect ->
    if window?
      disposable = requestsStream.pipe(
        rx.switchMap ({req, route}) ->
          Rx.fromPromise model.user.verifyEmail({
            userId: route.params.userId
            tokenStr: route.params.tokenStr
          }).then ->
            isVerifiedStream.next true
          .catchError (err) ->
            console.log err
            errorStream.next 'There was an error verifying your email!'
            Rx.of null

        rx.take(1)
      ).subscribe()

    return ->
      disposable?.unsubscribe()
  , []

  {isVerifiedStream, errorStream} = useMemo ->
    {
      isVerifiedStream: new Rx.BehaviorSubject false
      errorStream: new Rx.BehaviorSubject null
    }
  , []

  {windowSize, isVerified, error} = useStream ->
    windowSize: browser.getSize()
    isVerified: isVerifiedStream
    error: errorStream

  z '.p-verify-email', {
    style:
      height: "#{windowSize.height}px"
  },
    if isVerified or error
      z '.is-verified',
        error or lang.get 'verifyEmail.isVerified'
        z '.home',
          z $button,
            text: lang.get 'verifyEmail.tapHome'
            onclick: ->
              router.go 'home'
    else
      [
        z $spinner
        z '.loading', 'Loading...'
        router.link z 'a.stuck', {
          href: router.get 'home'
        }, 'Stuck? Tap to go home'
      ]
