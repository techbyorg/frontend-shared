import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $editRole from '../edit_role'
import $sidebarMenu from '../sidebar_menu'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $roles () {
  const { model, lang } = useContext(context)

  const {
    currentMenuItemStream, rolesStream, roleStreams
  } = useMemo(() => {
    const currentMenuItemStream = new Rx.BehaviorSubject('everyone')
    const rolesStream = model.role.getAll()
    const roleStreams = new Rx.ReplaySubject(1)
    roleStreams.next(
      Rx.combineLatest(currentMenuItemStream, rolesStream).pipe(
        rx.map(([currentMenuItem, roles]) =>
          _.find(roles?.nodes, { slug: currentMenuItem })
        )
      )
    )

    return {
      currentMenuItemStream,
      rolesStream,
      roleStreams
    }
  }, [])

  const { menuItems } = useStream(() => ({
    menuItems: rolesStream.pipe(rx.map((roles) =>
      _.map(roles?.nodes, (role) => ({
        menuItem: role.slug, text: role.name
      }))
    ))
  }))

  return z('.z-roles', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.roles'),
        onAdd: () => {
          return model.role.upsert({
            name: 'New role'
          })
        },
        currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z($editRole, { roleStreams })
    ])
  ])
}
