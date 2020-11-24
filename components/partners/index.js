import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

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
    const currentMenuItemStreams = new Rx.ReplaySubject(1)
    currentMenuItemStreams.next(partnersStream.pipe(
      rx.map((partners) => partners?.nodes[0]?.slug)
    ))
    const partnerStreams = new Rx.ReplaySubject(1)
    const currentMenuItemAndPartners = Rx.combineLatest(
      currentMenuItemStreams.pipe(rx.switchAll()),
      partnersStream
    )
    partnerStreams.next(currentMenuItemAndPartners.pipe(
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
        menuItem: partner.slug, text: partner.name
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
        currentMenuItemStreams,
        menuItems
      })
    ]),
    z('.content', [
      z($editPartner, { partnerStreams })
    ])
  ])
}
