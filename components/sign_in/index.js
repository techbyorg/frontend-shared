import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $signInForm from '../sign_in_form'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $signIn ({ inviteTokenStrStream, ...props }) {
  const { model, lang } = useContext(context)

  const { modeStreams } = useMemo(() => {
    const orgUserInviteStream = inviteTokenStrStream.pipe(
      rx.switchMap((inviteTokenStr) =>
        inviteTokenStr
          ? model.orgUserInvite.getByTokenStr(inviteTokenStr)
          : Rx.of(null)
      )
    )

    const modeStreams = new Rx.ReplaySubject(1)
    modeStreams.next(orgUserInviteStream.pipe(rx.map((orgUserInvite) => {
      return orgUserInvite
        ? 'join'
        : inviteTokenStrStream
          ? 'failedInvite'
          : 'signIn'
    })))

    return {
      modeStreams: modeStreams
    }
  }, [])

  const { org, mode } = useStream(() => ({
    org: model.org.getMe(),
    mode: modeStreams.pipe(rx.switchAll())
  }))

  console.log('mode', mode)

  return z('.z-sign-in', [
    z('.title', [
      lang.get('signIn.title', { replacements: { orgName: org?.name } })
    ]),
    z('.content', [
      mode === 'failedInvite'
        ? z('.invalid-invite', [
          z('.title', lang.get('signIn.invalidInviteTitle')),
          z('.description', lang.get('signIn.invalidInviteDescription'))
        ])
        : z($signInForm, { inviteTokenStrStream, modeStreams, ...props })
    ])
  ])
}
