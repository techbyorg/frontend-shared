import {z, useContext, useEffect, useMemo, useStream} from 'zorium'
RxBehaviorSubject = require('rxjs/BehaviorSubject').BehaviorSubject
RxObservable = require('rxjs/Observable').Observable
require 'rxjs/add/observable/fromPromise'

import Spinner from '../../components/spinner'
import Button from '../../components/button'
import context from '../../context'
import config from '../../config'

if window?
  require './index.styl'

module.exports = $unsubscribeEmailPage = ({requestsStream}) ->
  {model, browser, lang, router} = useContext

  useEffect ->
    if window?
      disposable = requestsStream.switchMap ({req, route}) ->
        RxObservable.fromPromise model.user.unsubscribeEmail({
          userId: route.params.userId
          tokenStr: route.params.tokenStr
        }).then ->
          isUnsubscribedStream.next true
        .catch (err) ->
          console.log err
          errorStream.next 'This email isn\'t subscribed'
          RxObservable.of null

      .take(1)
      .subscribe()

    return ->
      disposable?.unsubscribe()
  , []

  {isUnsubscribedStream, errorStream} = useMemo ->
    {
      isUnsubscribedStream: new RxBehaviorSubject false
      errorStream: new RxBehaviorSubject null
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
