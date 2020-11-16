import { z, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newBlockDialog ({ orgUserStream, onClose }) {
  const { lang, model } = useContext(context)

  const {
    partnerIdsStreams, roleIdsStreams, partnerOptionsStream, roleOptionsStream
  } = useMemo(() => {
    const allPartnersStreams = model.partner.getAll()
    const allRolesStreams = model.role.getAll()

    const partnerIdsStreams = new Rx.ReplaySubject(1)
    partnerIdsStreams.next(orgUserStream.pipe(
      rx.map((orgUser) => (orgUser?.partnerIds))
    ))

    const roleIdsStreams = new Rx.ReplaySubject(1)
    roleIdsStreams.next(orgUserStream.pipe(
      rx.map((orgUser) => (orgUser?.roleIds))
    ))

    const partnerOptionsStream = allPartnersStreams.pipe(rx.map((allPartners) => {
      return _.map(allPartners.nodes, (partner) => ({
        value: partner.id, text: partner.name
      }))
    }))

    const roleOptionsStream = allRolesStreams.pipe(rx.map((allRoles) => {
      return _.map(allRoles.nodes, (role) => ({
        value: role.id, text: role.name
      }))
    }))

    return {
      partnerIdsStreams,
      roleIdsStreams,
      partnerOptionsStream,
      roleOptionsStream
    }
  }, [])

  const { orgUser, partnerIds, roleIds } = useStream(() => ({
    orgUser: orgUserStream,
    partnerIds: partnerIdsStreams.pipe(rx.switchAll()),
    roleIds: roleIdsStreams.pipe(rx.switchAll())
  }))

  console.log('orgUser', orgUser)

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

          z('.input', z($dropdownMultiple, {
            valuesStreams: partnerIdsStreams,
            optionsStream: partnerOptionsStream
          })),
          z('.input', z($dropdownMultiple, {
            valuesStreams: roleIdsStreams,
            optionsStream: roleOptionsStream
          }))
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
