import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from '../button'
import $input from '../input'
import $toggle from '../toggle'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const PERMISSIONS = [
  // view partners
  { sourceType: 'global-public', permissions: ['view', 'edit'] },
  { sourceType: 'global-private', permissions: ['view', 'edit'] },
  { sourceType: 'dashboard', permissions: ['view', 'edit'] },
  { sourceType: 'partner', permissions: ['view', 'edit'] },
  { sourceType: 'org-user-invite', permissions: ['view', 'edit'] }
]

export default function $editRole ({ roleStreams }) {
  const { lang, model } = useContext(context)

  const { roleStream, nameStreams, permissionsWithTogglesStream } = useMemo(() => {
    const roleStream = roleStreams.pipe(rx.switchAll())

    const nameStreams = new Rx.ReplaySubject(1)
    nameStreams.next(roleStream.pipe(rx.map((role) => role?.name)))

    const permissionsWithTogglesStream = roleStream.pipe(rx.map((role) =>
      _.map(PERMISSIONS, (permission) => {
        return {
          permission,
          key: Math.random(), // HACK: $toggle needs to be remounted any time this is updated
          isSelectedStreamArray: _.map(permission.permissions, (perm) => {
            console.log('cur', role.permissions, permission.sourceType, perm)
            const isSelected = _.find(role.permissions.nodes, {
              sourceType: permission.sourceType,
              permission: perm
            })?.value
            return new Rx.BehaviorSubject(isSelected)
          })
        }
      })
    ))

    return {
      roleStream,
      nameStreams,
      permissionsWithTogglesStream
    }
  }, [])

  const { name, role, permissionsWithToggles } = useStream(() => ({
    name: nameStreams.pipe(rx.switchAll()),
    permissionsWithToggles: permissionsWithTogglesStream,
    role: roleStream
  }))

  const save = () => {
    const permissions = _.flatten(
      _.map(permissionsWithToggles, ({ permission, isSelectedStreamArray }) =>
        _.map(permission.permissions, (permissionType, i) => {
          return {
            sourceType: permission.sourceType,
            permission: permissionType,
            value: isSelectedStreamArray[i].getValue()
          }
        })
      )
    )
    model.role.upsert({ id: role.id, slug: role.slug, name, permissions })
  }

  return z('.z-edit-role', [
    z('.title', lang.get('general.roles')),
    z('.description', lang.get('editRole.description')),
    z('.input', [
      z($input, {
        valueStreams: nameStreams,
        placeholder: lang.get('editRole.roleName'),
        disabled: role?.slug === 'everyone'
      })
    ]),
    z('.divider'),
    z('.subtitle', lang.get('editRole.generalPermissions')),
    z('.permissions', [
      _.map(permissionsWithToggles, ({ permission, key, isSelectedStreamArray }) => {
        // HACK: key forces new $toggle components to remount and create new isSelectedStream
        return z('.permission', { key }, [
          z('.title', lang.get(`sourceTypes.${permission.sourceType}s`)),
          z('.description', lang.get(`sourceTypes.${permission.sourceType}Description`)),
          _.map(permission.permissions, (permissionType, i) => {
            return z('.permission-type', [
              z('.type', lang.get(`permissionType.${permissionType}`)),
              z('.toggle', z($toggle, {
                isSelectedStream: isSelectedStreamArray[i]
              }))
            ])
          })
        ])
      })
    ]),
    z($button, {
      onclick: save,
      isPrimary: true,
      text: lang.get('general.save'),
      isFullWidth: false
    })
  ])
}
