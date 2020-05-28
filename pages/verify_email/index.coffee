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

module.exports = $verifyEmailPage = ({model, requestsStream, router}) ->
  {model, browser, lang, router} = useContext context

  useEffect ->
    if window?
      disposable = requestsStream.switchMap ({req, route}) ->
        RxObservable.fromPromise model.user.verifyEmail({
          userId: route.params.userId
          tokenStr: route.params.tokenStr
        }).then ->
          isVerifiedStream.next true
        .catch (err) ->
          console.log err
          errorStream.next 'There was an error verifying your email!'
          RxObservable.of null

      .take(1)
      .subscribe()

    return ->
      disposable?.unsubscribe()
  , []

  {isVerifiedStream, errorStream} = useMemo ->
    {
      isVerifiedStream: new RxBehaviorSubject false
      errorStream: new RxBehaviorSubject null
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
