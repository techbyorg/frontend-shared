import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import { streams } from 'frontend-shared/services/obs'

import $editPartner from '../edit_partner'
import $sidebarMenu from '../sidebar_menu'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $partners () {
  const { model, lang } = useContext(context)

  const {
    currentMenuItemStreams, partnersStream, partnerStreams
  } = useMemo(() => {
    const partnersStream = model.partner.getAll()
    const currentMenuItemStreams = streams(partnersStream.pipe(
      rx.map((partners) => partners?.nodes[0]?.slug)
    ))
    const currentMenuItemAndPartners = Rx.combineLatest(
      currentMenuItemStreams.stream,
      partnersStream
    )
    const partnerStreams = streams(currentMenuItemAndPartners.pipe(
      rx.map(([currentMenuItem, partners]) =>
        _.find(partners?.nodes, { slug: currentMenuItem })
      )
    ))

    return {
      currentMenuItemStreams,
      partnersStream,
      partnerStreams
    }
  }, [])

  const { menuItems } = useStream(() => ({
    menuItems: partnersStream.pipe(rx.map((partners) =>
      _.map(partners?.nodes, (partner) => ({
        id: partner.id, menuItem: partner.slug, text: partner.name
      }))
    ))
  }))

  return z('.z-partners', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.partners'),
        onAdd: () => {
          return model.partner.upsert({
            name: 'New partner'
          })
        },
        onDelete: (id) => {
          if (confirm(lang.get('general.areYouSure'))) {
            model.partner.deleteById(id)
          }
        },
        currentMenuItemStreams,
        menuItems
      })
    ]),
    z('.content', [
      z($editPartner, { partnerStreams })
    ])
  ])
}
