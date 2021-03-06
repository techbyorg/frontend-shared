import { z, useContext, useMemo, useRef, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $avatar from 'frontend-shared/components/avatar'
import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $icon from 'frontend-shared/components/icon'
import { copyIconPath } from 'frontend-shared/components/icon/paths'
import $input from 'frontend-shared/components/input'
import { streams } from 'frontend-shared/services/obs'

import $partnerPicker from '../partner_picker'
import $rolePicker from '../role_picker'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $inviteOrgUserDialog ({ orgUserInvite, onClose }) {
  const { config, lang, model } = useContext(context)

  const $$ref = useRef()

  const {
    partnerIdsStreams, roleIdsStreams, inviteLinkStream, emailStream, nameStream
  } = useMemo(() => {
    const partnerIdsStreams = streams(Rx.of(orgUserInvite?.partnerIds))
    const roleIdsStreams = streams(Rx.of(orgUserInvite?.roleIds))

    return {
      partnerIdsStreams,
      roleIdsStreams,
      inviteLinkStream: new Rx.BehaviorSubject(null),
      emailStream: new Rx.BehaviorSubject(''),
      nameStream: new Rx.BehaviorSubject('')
    }
  }, [])

  const { email, name, org, partnerIds, roleIds, inviteLink } = useStream(() => ({
    email: emailStream,
    name: nameStream,
    org: model.org.getMe(),
    partnerIds: partnerIdsStreams.stream,
    roleIds: roleIdsStreams.stream,
    inviteLink: inviteLinkStream
  }))

  const inviteOrgUser = async (getLink) => {
    const { tokenStr } = await model.orgUserInvite.upsert({
      id: orgUserInvite?.id,
      name,
      email,
      partnerIds,
      roleIds
    })

    if (getLink) {
      const link = org?.domain
        ? `https://${org?.domain}/invite/${tokenStr}`
        : `${config.HOST}/org/${org?.slug}/invite/${tokenStr}`
      inviteLinkStream.next(link)
    } else {
      onClose()
    }
  }

  return z('.z-invite-org-user-dialog', [
    z($dialog, {
      $$ref,
      onClose,
      isWide: true,
      $title: lang.get('inviteOrgUserDialog.title'),
      $content:
        z('.z-invite-org-user-dialog_content', [
          z('.description',
            lang.get('inviteOrgUserDialog.partnersDescription')
          ),
          z('.section', z($partnerPicker, { partnerIdsStreams, $$parentRef: $$ref })),
          z('.description',
            lang.get('inviteOrgUserDialog.rolesDescription')
          ),
          z('.section', z($rolePicker, { roleIdsStreams, omitEveryone: true, $$parentRef: $$ref })),
          !inviteLink && z('.invite-section.email', [
            z('.title',
              lang.get('inviteOrgUserDialog.inviteEmailTitle')
            ),
            z('.input', z($input, {
              placeholder: lang.get('general.email'),
              valueStream: emailStream
            })),
            z('.action',
              z($avatar, { user: { name: email } }),
              z('.value', email),
              z('.button',
                z($button, {
                  text: lang.get('general.invite'),
                  isPrimary: true,
                  isFullWidth: false,
                  onclick: () => inviteOrgUser(),
                  shouldHandleLoading: true
                })
              )
            )
          ]),
          z('.divider'),
          z('.invite-section.link', [
            z('.title',
              lang.get('inviteOrgUserDialog.inviteLinkTitle')
            ),
            !inviteLink && z('.action', [
              z('.input', z($input, {
                placeholder: lang.get('general.name'),
                valueStream: nameStream
              })),
              z('.button',
                z($button, {
                  text: lang.get('inviteOrgUserDialog.generateLink'),
                  isPrimary: true,
                  isFullWidth: false,
                  onclick: () => inviteOrgUser('getLink'),
                  shouldHandleLoading: true
                })
              )
            ]),
            inviteLink && z('.action.link', [
              z('.input#invite-link', z($input, {
                valueStream: inviteLinkStream,
                readonly: true,
                onclick: (e) => e.target.select()
              })),
              z('.icon', z($icon, {
                icon: copyIconPath,
                isCircled: true,
                onclick: () => {
                  document.querySelector('#invite-link input').select()
                  document.execCommand('copy')
                }
              }))
            ])
          ])
        ])
    })
  ])
};
