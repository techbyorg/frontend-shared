import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $permissionToggle from 'frontend-shared/components/permission_toggle'
import $sidebarMenu from 'frontend-shared/components/sidebar_menu'
import { streams } from 'frontend-shared/services/obs'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

// sourceType: impact-dashboard
export default function $sourcePermissions ({ sourceStream, sourceType }) {
  const { lang, model } = useContext(context)

  const {
    rolesStream, sourceRolesStream, sourcePermissionsStream,
    selectedRoleIdStreams, selectedRoleStream
  } = useMemo(() => {
    const allBlockPermissionsStream = sourceStream.pipe(
      rx.switchMap((source) => {
        return source
          ? model.permission.getBySourceTypeAndSourceId(sourceType, source?.id)
          : Rx.of(null)
      })
    )

    const rolesStream = model.role.getAll()

    const selectedRoleIdStreams = streams(rolesStream.pipe(
      rx.map((roles) =>
        roles?.nodes?.[0]?.id
      )
    ))

    const selectedRoleStream = Rx.combineLatest(
      selectedRoleIdStreams.stream,
      rolesStream
    ).pipe(rx.map(([selectedRoleId, roles]) =>
      _.find(roles?.nodes, { id: selectedRoleId })
    ))

    const allBlockPermissionsAndSelectedRoleId = Rx.combineLatest(
      allBlockPermissionsStream, selectedRoleIdStreams.stream
    )

    const sourcePermissionsStream = allBlockPermissionsAndSelectedRoleId.pipe(
      rx.map(([allBlockPermissions, selectedRoleId]) => {
        const viewPermission = _.find(allBlockPermissions?.nodes, {
          roleId: selectedRoleId, permission: 'view'
        })
        const editPermission = _.find(allBlockPermissions?.nodes, {
          roleId: selectedRoleId, permission: 'edit'
        })
        return [
          {
            name: lang.get('permissionType.view'),
            permission: 'view',
            key: Math.random(), // HACK: $permissionToggle needs to be remounted any time this is updated
            valueStream: new Rx.BehaviorSubject(viewPermission?.value)
          },
          {
            name: lang.get('permissionType.edit'),
            permission: 'edit',
            key: Math.random(), // HACK: $permissionToggle needs to be remounted any time this is updated
            valueStream: new Rx.BehaviorSubject(editPermission?.value)
          }
        ]
      })
    )

    return {
      rolesStream: rolesStream,
      sourceRolesStream,
      sourcePermissionsStream,
      selectedRoleIdStreams,
      selectedRoleStream
    }
  }, [])

  const {
    sourcePermissions, source, selectedRoleId, selectedRole, menuItems
  } = useStream(() => ({
    sourceRoles: sourceRolesStream,
    sourcePermissions: sourcePermissionsStream,
    source: sourceStream,
    selectedRoleId: selectedRoleIdStreams.stream,
    selectedRole: selectedRoleStream,
    menuItems: rolesStream.pipe(rx.map((roles) =>
      _.map(roles?.nodes, (role) => ({
        menuItem: role.id, text: role.name
      }))
    ))
  }))

  const updatePermissions = async () => {
    model.permission.batchUpsert(
      _.map(sourcePermissions, ({ permission, valueStream }) => ({
        sourceType: sourceType,
        sourceId: source?.id,
        roleId: selectedRoleId,
        permission,
        value: valueStream.getValue()
      }))
    )
  }

  return z('.z-source-permissions', [
    z('.sidebar', [
      z($sidebarMenu, {
        title: lang.get('general.roles'),
        currentMenuItemStreams: selectedRoleIdStreams,
        menuItems
      })
    ]),
    z('.content', [
      z('.title', lang.get(`sourceTypes.${sourceType}.permissionTitle`, {
        replacements: { roleName: selectedRole?.name }
      })),
      z('.divider'),
      z('.permissions-title', lang.get('editRole.generalPermissions')),
      z('.permissions', _.map(sourcePermissions, (perm) => {
        const { name, key, valueStream } = perm
        return z('.permission', { key }, [
          z('.info', [
            z('.name', name)
            // z('.description', name)
          ]),
          z('.toggle', z($permissionToggle, {
            valueStream
          }))
        ])
      })),
      z('.save', [
        z($button, {
          text: lang.get('general.save'),
          isPrimary: true,
          onclick: updatePermissions,
          shouldHandleLoading: true,
          isFullWidth: false
        })
      ])
    ])
  ])
};
