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

    const inviteTokenStrAndOrgUserInviteStream = Rx.combineLatest(
      inviteTokenStrStream, orgUserInviteStream
    )

    const modeStreams = new Rx.ReplaySubject(1)
    modeStreams.next(inviteTokenStrAndOrgUserInviteStream.pipe(
      rx.map(([inviteTokenStr, orgUserInvite]) => {
        return orgUserInvite
          ? 'join'
          : inviteTokenStr
            ? 'failedInvite'
            : 'signIn'
      })
    ))

    return {
      modeStreams: modeStreams
    }
  }, [])

  const { org, mode } = useStream(() => ({
    org: model.org.getMe(),
    mode: modeStreams.pipe(rx.switchAll())
  }))

  return z('.z-sign-in', [
    z('.title', [
      org && lang.get('signIn.title', { replacements: { orgName: org.name } })
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
