import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $input from '../input'
import $button from '../button'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// FIXME: passing stream to child component causes 2 renders of child?
// since state updates in 2 places

export default function $signInForm (props) {
  const { inviteTokenStrStream, modeStreams } = props
  const { model, lang, router } = useContext(context)

  const {
    nameValueStream, nameErrorStream, passwordValueStream, passwordErrorStream,
    emailValueStream, emailErrorStream, isLoadingStream, hasErrorStream
  } = useMemo(() => {
    return {
      nameValueStream: new Rx.BehaviorSubject(''),
      nameErrorStream: new Rx.BehaviorSubject(null),
      passwordValueStream: new Rx.BehaviorSubject(''),
      passwordErrorStream: new Rx.BehaviorSubject(null),
      emailValueStream: new Rx.BehaviorSubject(''),
      emailErrorStream: new Rx.BehaviorSubject(null),
      isLoadingStream: new Rx.BehaviorSubject(false),
      hasErrorStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { me, mode, hasError, inviteTokenStr } = useStream(() => ({
    me: model.user.getMe(),
    mode: modeStreams.pipe(rx.switchAll()),
    isLoading: isLoadingStream,
    hasError: hasErrorStream,
    inviteTokenStr: inviteTokenStrStream
  }))

  const action = async (method, e) => {
    e?.preventDefault()
    isLoadingStream.next(true)
    hasErrorStream.next(false)
    nameErrorStream.next(null)
    emailErrorStream.next(null)
    passwordErrorStream.next(null)

    try {
      await method({
        name: nameValueStream.getValue(),
        password: passwordValueStream.getValue(),
        email: emailValueStream.getValue(),
        inviteTokenStr: inviteTokenStr
      })
      setTimeout(() => // give time for invalidate to work
        model.user.getMe().pipe(rx.take(1)).subscribe(() => {
          router.go('orgHome')
        })
      , 0)
      isLoadingStream.next(false)
    } catch (err) {
      isLoadingStream.next(false)
      let error
      try {
        error = JSON.parse(err.message)
      } catch {
        error = {}
      }
      let errorStream
      switch (error.info?.field) {
        case 'name': errorStream = nameErrorStream; break
        case 'email': errorStream = emailErrorStream; break
        case 'password': errorStream = passwordErrorStream; break
        default: errorStream = emailErrorStream; break
      }
      errorStream.next(lang.get(error.info?.langKey))
    }
  }

  const join = (e) => { action(model.auth.join, e) }
  const reset = (e) => { action(model.auth.resetPassword, e) }
  const signIn = (e) => { action(model.auth.login, e) }
  const isMember = model.user.isMember(me)

  return z('form.z-sign-in-form', {
    onsubmit: (e) => {
      if (mode === 'reset') {
        return reset(e)
      } else if (mode === 'join') {
        return join(e)
      } else {
        return signIn(e)
      }
    }
  }, [
    z('.title', [
      mode === 'join' ? lang.get('signIn.join') : lang.get('signIn.signIn')
    ]),
    mode === 'join' && z('.input', [
      z($input, {
        valueStream: nameValueStream,
        errorStream: nameErrorStream,
        placeholder: lang.get('general.name'),
        type: 'text'
      })
    ]),
    z('.input', [
      z($input, {
        valueStream: emailValueStream,
        errorStream: emailErrorStream,
        placeholder: lang.get('general.email'),
        type: 'email'
      })
    ]),
    mode !== 'reset' && z('.input', { key: 'password-input' }, [
      z($input, {
        valueStream: passwordValueStream,
        errorStream: passwordErrorStream,
        placeholder: lang.get('general.password'),
        type: 'password'
      })
    ]),
    // mode === 'join' && z('.terms', [
    //   lang.get('signIn.terms', {
    //     replacements: { tos: ' ' }
    //   }),
    //   z('a', {
    //     href: `https://${config.HOST}/policies`,
    //     target: '_system',
    //     onclick (e) {
    //       e.preventDefault()
    //       return portal.call('browser.openWindow', {
    //         url: `https://${config.HOST}/policies`,
    //         target: '_system'
    //       })
    //     }
    //   }, 'TOS')
    // ]),
    isMember && z('.actions', {
      onclick: () => {
        model.auth.logout()
      }
    }, lang.get('signIn.alreadyLoggedIn')),
    !isMember && z('.actions', [
      z('.button', [
        z($button, {
          isPrimary: true,
          isLoadingStream,
          text: mode === 'reset'
            ? lang.get('signIn.emailResetLink')
            : mode === 'join'
              ? lang.get('signIn.join')
              : lang.get('general.signIn'),
          type: 'submit'
        })
      ])
    ]),
    (mode === 'join' || inviteTokenStr) && z('.toggle', [
      mode === 'join'
        ? lang.get('signIn.haveAccount')
        : lang.get('signIn.notHaveAccount'),
      z('.link', {
        onclick: () => {
          modeStreams.next(Rx.of(mode === 'join' ? 'signIn' : 'join'))
        }
      }, mode === 'join' ? lang.get('general.signIn') : lang.get('signIn.join'))
    ]),
    (hasError && mode === 'signIn') &&
      z('.button', [
        z($button, {
          isInverted: true,
          text: lang.get('signIn.resetPassword'),
          onclick: () => modeStreams.next(Rx.of('reset'))
        })
      ])
  ])
}
