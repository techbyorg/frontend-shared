import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $input from '../input'
import $sidebarMenu from '../sidebar_menu'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $editRole ({ role }) {
  const { model, lang } = useContext(context)

  // const { currentMenuItemStream, editRoleStream } = useMemo(() => {
  //   return {
  //     currentMenuItemStream: new Rx.BehaviorSubject('everyone'),
  //     editRoleStream: model.role.getAll()
  //   }
  // }, [])

  // const { menuItems } = useStream(() => ({
  //   menuItems: editRoleStream.pipe(rx.map((editRole) =>
  //     _.map(editRole?.nodes, (role) => ({
  //       menuItem: role.slug, text: role.name
  //     }))
  //   ))
  // }))

  console.log('current role', role)

  return z('.z-edit-role', [
    z('.title', lang.get('general.roles')),
    z('.description', lang.get('editRole.description')),
    z('.input', [
      z($input, {
        placeholder: lang.get('editRole.roleName')
      })
    ]),
    z('.divider'),
    z('.subtitle', lang.get('editRole.generalPermissions'))
  ])
}
