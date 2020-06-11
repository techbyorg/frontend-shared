/* eslint-disable
    no-undef,
    no-unused-vars,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $primaryInput from '../primary_input'
import $button from '../button'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// FIXME: passing stream to child component causes 2 renders of child
// since state updates in 2 places

export default function $signIn ({ modeStream }) {
  let emailErrorStream, emailValueStream, hasErrorStream, isLoadingStream, nameErrorStream, nameValueStream, passwordErrorStream, passwordValueStream
  let e
  const { model, router, portal, lang, config } = useContext(context);

  ({
    nameValueStream, nameErrorStream, passwordValueStream, passwordErrorStream,
    emailValueStream, emailErrorStream, modeStream,
    isLoadingStream, hasErrorStream
  } = useMemo(() => ({
    nameValueStream: new Rx.BehaviorSubject(''),
    nameErrorStream: new Rx.BehaviorSubject(null),
    passwordValueStream: new Rx.BehaviorSubject(''),
    passwordErrorStream: new Rx.BehaviorSubject(null),
    emailValueStream: new Rx.BehaviorSubject(''),
    emailErrorStream: new Rx.BehaviorSubject(null),
    modeStream: modeStream || new Rx.BehaviorSubject('signIn')
  })
  , []))

  const { me, mode, isLoading, hasError, nameValue } = useStream(() => ({
    me: model.user.getMe(),
    mode: modeStream,
    isLoading: isLoadingStream,
    hasError: hasErrorStream
  }))

  function join (e) {
    e?.preventDefault()
    isLoadingStream.next(true)
    hasErrorStream.next(false)
    nameErrorStream.next(null)
    emailErrorStream.next(null)
    passwordErrorStream.next(null)

    return model.auth.join({
      name: nameValueStream.getValue(),
      password: passwordValueStream.getValue(),
      email: emailValueStream.getValue()
    })
      .then(function () {
        isLoadingStream.next(false)
        // give time for invalidate to work
        return setTimeout(() => model.user.getMe().take(1).subscribe(() => model.overlay.close({ action: 'complete' }))
          , 0)
      }).catch(function (err) {
        err = (() => {
          try {
            return JSON.parse(err.message)
          } catch (error) {
            return {}
          }
        })()
        const errorStream = (() => {
          switch (err.info.field) {
            case 'name': return nameErrorS
            case 'email': return emailErrorStream
            case 'password': return passwordErrorS
            default: return emailErrorStream
          }
        })()
        errorStream.next(lang.get(err.info.langKey))
        return isLoadingStream.next(false)
      })
  }

  function reset (e) {
    e?.preventDefault()
    isLoadingStream.next(true)
    hasErrorStream.next(false)
    emailErrorStream.next(null)

    return model.auth.resetPassword({
      email: emailValueStream.getValue()
    })
      .then(function () {
        isLoadingStream.next(false)
        return model.overlay.close({ action: 'complete' })
      })
      .catch(function (err) {
        err = (() => {
          try {
            return JSON.parse(err.message)
          } catch (error) {
            return {}
          }
        })()
        const errorStream = (() => {
          switch (err.info.field) {
            case 'email': return emailErrorStream
            default: return emailErrorStream
          }
        })()
        errorStream.next(lang.get(err.info.langKey))
        return isLoadingStream.next(false)
      })
  }

  function signIn (e) {
    e?.preventDefault()
    isLoadingStream.next(true)
    hasErrorStream.next(false)
    emailErrorStream.next(null)
    passwordErrorStream.next(null)

    return model.auth.login({
      email: emailValueStream.getValue(),
      password: passwordValueStream.getValue()
    })
      .then(function () {
        isLoadingStream.next(false)
        // give time for invalidate to work
        return setTimeout(() => model.user.getMe().take(1).subscribe(() => model.overlay.close({ action: 'complete' }))
          , 0)
      }).catch(function (err) {
        hasErrorStream.next(true)
        err = (() => {
          try {
            return JSON.parse(err.message)
          } catch (error) {
            return {}
          }
        })()
        const errorStream = (() => {
          switch (err.info?.field) {
            case 'password': return passwordErrorStream
            default: return emailErrorStream
          }
        })()

        errorStream.next(lang.get(err.info?.langKey))
        return isLoadingStream.next(false)
      })
  }

  // cancel = ->
  //   model.overlay.close 'cancel'

  const isMember = model.user.isMember(me)

  return z('.z-sign-in',
    z('.title',
      mode === 'join'
        ? lang.get('signInOverlay.join')
        : lang.get('signInOverlay.signIn')
    ),
    (() => {
      if ((mode === 'join') && isMember) {
        return z('.content',
          lang.get('signIn.alreadyLoggedIn'))
      } else if (mode) {
        return z('form.content',
          mode === 'join'
            ? z('.input',
              z($primaryInput, {
                valueStream: nameValueStream,
                errorStream: nameErrorStream,
                hintText: lang.get('general.name'),
                type: 'text'
              })) : undefined,
          z('.input',
            z($primaryInput, {
              valueStream: emailValueStream,
              errorStream: emailErrorStream,
              hintText: lang.get('general.email'),
              type: 'email'
            })),
          mode !== 'reset'
            ? z('.input', { key: 'password-input' },
              z($primaryInput, {
                valueStream: passwordValueStream,
                errorStream: passwordErrorStream,
                hintText: lang.get('general.password'),
                type: 'password'
              })) : undefined,

          mode === 'join'
            ? z('.terms',
              lang.get('signInOverlay.terms', {
                replacements: { tos: ' ' }
              }),
              z('a', {
                href: `https://${config.HOST}/policies`,
                target: '_system',
                onclick (e) {
                  e.preventDefault()
                  return portal.call('browser.openWindow', {
                    url: `https://${config.HOST}/policies`,
                    target: '_system'
                  })
                }
              }, 'TOS')
            ) : undefined,
          z('.actions',
            z('.button',
              z($button, {
                isPrimary: true,
                text: isLoading
                  ? lang.get('general.loading')
                  : mode === 'reset'
                    ? lang.get('signInOverlay.emailResetLink')
                    : mode === 'join'
                      ? lang.get('signInOverlay.createAccount')
                      : lang.get('general.signIn'),
                onclick (e) {
                  if (mode === 'reset') {
                    return reset(e)
                  } else if (mode === 'join') {
                    return join(e)
                  } else {
                    return signIn(e)
                  }
                },
                type: 'submit'
              }
              )
            )
          )
        )
      }
    })()
  )
}
// TODO: re-enable after removing username req
// if hasError and mode is 'signIn'
//   z '.button',
//     z $button,
//       isInverted: true
//       text: lang.get 'signInOverlay.resetPassword'
//       onclick: ->
//         mode.next 'reset'
