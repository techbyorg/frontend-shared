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
    currentMenuItemStream, rolesStream, currentRoleStream
  } = useMemo(() => {
    const currentMenuItemStream = new Rx.BehaviorSubject('everyone')
    const rolesStream = model.role.getAll()
    const currentRoleStream = Rx.combineLatest(
      currentMenuItemStream, rolesStream
    ).pipe(rx.map(([currentMenuItem, roles]) =>
      _.find(roles?.nodes, { slug: currentMenuItem })
    ))
    return {
      currentMenuItemStream,
      rolesStream,
      currentRoleStream
    }
  }, [])

  const { menuItems, currentRole } = useStream(() => ({
    menuItems: rolesStream.pipe(rx.map((roles) =>
      _.map(roles?.nodes, (role) => ({
        menuItem: role.slug, text: role.name
      }))
    )),
    currentRole: currentRoleStream
  }))

  return z('.z-roles', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.roles'),
        currentMenuItemStream,
        menuItems
      })
    ]),
    z('.content', [
      z($editRole, { role: currentRole })
    ])
  ])
}
