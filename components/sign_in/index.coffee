import {z, useContext, useMemo, useStream} from 'zorium'
import * as Rx from 'rxjs'

import $primaryInput from '../primary_input'
import $button from '../button'
import context from '../../context'

if window?
  require './index.styl'

# FIXME: passing stream to child component causes 2 renders of child
# since state updates in 2 places

export default $signIn = ({modeStream}) ->
  {model, router, portal, lang, config} = useContext context

  {nameValueStream, nameErrorStream, passwordValueStream, passwordErrorStream,
    emailValueStream, emailErrorStream, modeStream,
    isLoadingStream, hasErrorStream} = useMemo ->
    {
      nameValueStream: new Rx.BehaviorSubject ''
      nameErrorStream: new Rx.BehaviorSubject null
      passwordValueStream: new Rx.BehaviorSubject ''
      passwordErrorStream: new Rx.BehaviorSubject null
      emailValueStream: new Rx.BehaviorSubject ''
      emailErrorStream: new Rx.BehaviorSubject null
      modeStream: modeStream or new Rx.BehaviorSubject 'signIn'
    }
  , []

  {me, mode, isLoading, hasError, nameValue} = useStream ->
    me: model.user.getMe()
    mode: modeStream
    isLoading: isLoadingStream
    hasError: hasErrorStream

  join = (e) ->
    e?.preventDefault()
    isLoadingStream.next true
    hasErrorStream.next false
    nameErrorStream.next null
    emailErrorStream.next null
    passwordErrorStream.next null

    model.auth.join {
      name: nameValueStream.getValue()
      password: passwordValueStream.getValue()
      email: emailValueStream.getValue()
    }
    .then ->
      isLoadingStream.next false
      # give time for invalidate to work
      setTimeout ->
        model.user.getMe().take(1).subscribe ->
          model.overlay.close {action: 'complete'}
      , 0
    .catch (err) ->
      err = try
        JSON.parse err.message
      catch
        {}
      errorStream = switch err.info.field
        when 'name' then nameErrorS
        when 'email' then emailErrorStream
        when 'password' then passwordErrorS
        else emailErrorStream
      errorStream.next lang.get err.info.langKey
      isLoadingStream.next false

  reset = (e) ->
    e?.preventDefault()
    isLoadingStream.next true
    hasErrorStream.next false
    emailErrorStream.next null

    model.auth.resetPassword {
      email: emailValueStream.getValue()
    }
    .then ->
      isLoadingStream.next false
      model.overlay.close {action: 'complete'}
    .catch (err) ->
      err = try
        JSON.parse err.message
      catch
        {}
      errorStream = switch err.info.field
        when 'email' then emailErrorStream
        else emailErrorStream
      errorStream.next lang.get err.info.langKey
      isLoadingStream.next false

  signIn = (e) ->
    e?.preventDefault()
    isLoadingStream.next true
    hasErrorStream.next false
    emailErrorStream.next null
    passwordErrorStream.next null

    model.auth.login {
      email: emailValueStream.getValue()
      password: passwordValueStream.getValue()
    }
    .then ->
      isLoadingStream.next false
      # give time for invalidate to work
      setTimeout ->
        model.user.getMe().take(1).subscribe ->
          model.overlay.close {action: 'complete'}
      , 0
    .catch (err) ->
      hasErrorStream.next true
      err = try
        JSON.parse err.message
      catch
        {}
      errorStream = switch err.info?.field
        when 'password' then passwordErrorStream
        else emailErrorStream

      errorStream.next lang.get err.info?.langKey
      isLoadingStream.next false

  # cancel = ->
  #   model.overlay.close 'cancel'

  isMember = model.user.isMember me

  z '.z-sign-in',
    z '.title',
      if mode is 'join'
      then lang.get 'signInOverlay.join'
      else lang.get 'signInOverlay.signIn'
    if mode is 'join' and isMember
      z '.content',
        lang.get 'signIn.alreadyLoggedIn'
    else if mode
      z 'form.content',
        if mode is 'join'
          z '.input',
            z $primaryInput, {
              valueStream: nameValueStream
              errorStream: nameErrorStream
              hintText: lang.get 'general.name'
              type: 'text'
            }
        z '.input',
          z $primaryInput, {
            valueStream: emailValueStream
            errorStream: emailErrorStream
            hintText: lang.get 'general.email'
            type: 'email'
          }
        if mode isnt 'reset'
          z '.input', {key: 'password-input'},
            z $primaryInput, {
              valueStream: passwordValueStream
              errorStream: passwordErrorStream
              hintText: lang.get 'general.password'
              type: 'password'
            }

        if mode is 'join'
          z '.terms',
            lang.get 'signInOverlay.terms', {
              replacements: {tos: ' '}
            }
            z 'a', {
              href: "https://#{config.HOST}/policies"
              target: '_system'
              onclick: (e) ->
                e.preventDefault()
                portal.call 'browser.openWindow', {
                  url: "https://#{config.HOST}/policies"
                  target: '_system'
                }
            }, 'TOS'
        z '.actions',
          z '.button',
            z $button,
              isPrimary: true
              text: if isLoading \
                    then lang.get 'general.loading' \
                    else if mode is 'reset' \
                    then lang.get 'signInOverlay.emailResetLink' \
                    else if mode is 'join' \
                    then lang.get 'signInOverlay.createAccount' \
                    else lang.get 'general.signIn'
              onclick: (e) ->
                if mode is 'reset'
                  reset e
                else if mode is 'join'
                  join e
                else
                  signIn e
              type: 'submit'
          # TODO: re-enable after removing username req
          # if hasError and mode is 'signIn'
          #   z '.button',
          #     z $button,
          #       isInverted: true
          #       text: lang.get 'signInOverlay.resetPassword'
          #       onclick: ->
          #         mode.next 'reset'
