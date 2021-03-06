import { z, useContext, useMemo, useStream } from 'zorium'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import { streams } from 'frontend-shared/services/obs'

import $partnerPicker from '../partner_picker'
import $rolePicker from '../role_picker'
import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newBlockDialog ({ orgUserStream, onClose }) {
  const { lang, model } = useContext(context)

  const { partnerIdsStreams, roleIdsStreams } = useMemo(() => {
    const partnerIdsStreams = streams(orgUserStream.pipe(
      rx.map((orgUser) => (orgUser?.partnerIds))
    ))

    const roleIdsStreams = streams(orgUserStream.pipe(
      rx.map((orgUser) => (orgUser?.roleIds))
    ))

    return {
      partnerIdsStreams,
      roleIdsStreams
    }
  }, [])

  const { orgUser, partnerIds, roleIds } = useStream(() => ({
    orgUser: orgUserStream,
    partnerIds: partnerIdsStreams.stream,
    roleIds: roleIdsStreams.stream
  }))

  const updateOrgUser = async () => {
    await model.orgUser.upsert({
      id: orgUser.id,
      partnerIds,
      roleIds
    })
    onClose()
  }

  return z('.z-edit-org-user-dialog', [
    z($dialog, {
      onClose,
      isWide: true,
      $title: lang.get('editOrgUserDialog.title'),
      $content:
        z('.z-new-block-dialog_content', [
          z($partnerPicker, { partnerIdsStreams }),
          z($rolePicker, { roleIdsStreams })
        ]),
      $actions:
        z('.z-new-block-dialog_actions', [
          z('.save', [
            z($button, {
              text: lang.get('general.save'),
              isPrimary: true,
              onclick: updateOrgUser,
              shouldHandleLoading: true
            })
          ])
        ])
    })
  ])
};
