import {z, useContext, useEffect, useMemo, useStream} from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import Spinner from '../../components/spinner'
import Button from '../../components/button'
import context from '../../context'

if window?
  require './index.styl'

export default $unsubscribeEmailPage = ({requestsStream}) ->
  {model, browser, lang, router} = useContext

  useEffect ->
    if window?
      disposable = requestsStream.pipe(
        rx.switchMap ({req, route}) ->
          Rx.fromPromise model.user.unsubscribeEmail({
            userId: route.params.userId
            tokenStr: route.params.tokenStr
          }).then ->
            isUnsubscribedStream.next true
          .catchError (err) ->
            console.log err
            errorStream.next 'This email isn\'t subscribed'
            Rx.of null

        rx.take(1)
      ).subscribe()

    return ->
      disposable?.unsubscribe()
  , []

  {isUnsubscribedStream, errorStream} = useMemo ->
    {
      isUnsubscribedStream: new Rx.BehaviorSubject false
      errorStream: new Rx.BehaviorSubject null
    }
  , []

  {windowSize, isUnsubscribed, error} = useStream ->
    windowSize: browser.getSize()
    isUnsubscribed: isUnsubscribedStream
    error: errorStream

  z '.p-unsubscribe-email', {
    style:
      height: "#{windowSize.height}px"
  },
    if isUnsubscribed or error
      z '.is-verified',
        error or lang.get 'unsubscribeEmail.isUnsubscribed'
        z '.home',
          z $button,
            text: lang.get 'unsubscribeEmail.tapHome'
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
