import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $input from '../input'
import $toggle from '../toggle'
import $unsavedSnackBar from '../unsaved_snack_bar'
import { streams } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

const PERMISSIONS = [
  // view partners
  { sourceType: 'global', permissions: ['view', 'edit'] },
  { sourceType: 'impact-dashboard', permissions: ['view', 'edit'] },
  { sourceType: 'impact-block', permissions: ['view', 'edit'] },
  { sourceType: 'partner', permissions: ['view', 'edit'] },
  { sourceType: 'role', permissions: ['view', 'edit'] },
  { sourceType: 'org-user-invite', permissions: ['view', 'edit'] },
  { sourceType: 'org-user', permissions: ['view', 'edit'] }
]

export default function $editRole ({ roleStreams }) {
  const { lang, model } = useContext(context)

  const {
    roleStream, nameStreams, permissionsWithTogglesStream,
    hasPermissionsChangedStream
  } = useMemo(() => {
    const roleStream = roleStreams.stream

    const nameStreams = streams(roleStream.pipe(rx.map((role) => role?.name)))

    const permissionsWithTogglesStream = roleStream.pipe(rx.map((role) =>
      role && _.map(PERMISSIONS, (permission) => {
        return {
          permission,
          key: Math.random(), // HACK: $toggle needs to be remounted any time this is updated
          isSelectedStreamArray: _.map(permission.permissions, (perm) => {
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
      permissionsWithTogglesStream,
      hasPermissionsChangedStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { name, role, permissionsWithToggles, hasPermissionsChanged } = useStream(() => ({
    name: nameStreams.stream,
    role: roleStream,
    permissionsWithToggles: permissionsWithTogglesStream,
    hasPermissionsChanged: hasPermissionsChangedStream
  }))

  const reset = () => {
    roleStreams.reset()
    nameStreams.reset()
    hasPermissionsChangedStream.next(false)
  }

  const save = async () => {
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
    await model.role.upsert({ id: role.id, slug: role.slug, name, permissions })
    hasPermissionsChangedStream.next(false)
  }

  const isUnsaved = hasPermissionsChanged || nameStreams.isChanged()

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
          z('.title', lang.get(`sourceTypes.${permission.sourceType}.title`)),
          z('.description', lang.get(`sourceTypes.${permission.sourceType}.description`)),
          _.map(permission.permissions, (permissionType, i) => {
            return z('.permission-type', [
              z('.type', lang.get(`permissionType.${permissionType}`)),
              z('.toggle', z($toggle, {
                isSelectedStream: isSelectedStreamArray[i],
                onToggle: () => hasPermissionsChangedStream.next(true)
              }))
            ])
          })
        ])
      })
    ]),
    isUnsaved && z($unsavedSnackBar, {
      onCancel: reset,
      onSave: save
    })
  ])
}
