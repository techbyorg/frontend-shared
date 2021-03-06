import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import { streams } from 'frontend-shared/services/obs'

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
    const roleStreams = streams(
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
        id: role.id,
        menuItem: role.slug,
        text: role.name,
        isNoDelete: ['everyone', 'admin'].includes(role.slug)
      }))
    ))
  }))

  return z('.z-roles', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.roles'),
        isDraggable: true,
        onReorder: (ids) => model.role.setPriorities(ids),
        onAdd: () => model.role.upsert({ name: 'New role' }),
        onDelete: (id) => {
          if (confirm(lang.get('general.areYouSure'))) {
            model.role.deleteById(id)
          }
        },
        currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z('.scroller', [
        z($editRole, { roleStreams })
      ])
    ])
  ])
}
