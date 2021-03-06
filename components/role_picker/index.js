import { z, useContext, useMemo } from 'zorium'
import _ from 'lodash-es'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'

import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// props: sourceType and sourceIdStream (can be set to preselect roleIds)
export default function $rolePicker (props) {
  const { roleIdsStreams, omitEveryone, $$parentRef } = props
  const { model, lang } = useContext(context)

  const {
    roleOptionsStream
  } = useMemo(() => {
    const allRolesStream = model.role.getAll()
    if (props.sourceIdStream) {
      const allRolesAndSourceIdStream = Rx.combineLatest(
        allRolesStream, props.sourceIdStream
      )
      // TODO: should use something other than dropdownMultiple.
      // needs to have 3 options like discord yes/no/undefined (use parent)
      roleIdsStreams.next(allRolesAndSourceIdStream.pipe(
        rx.map(([allRoles, sourceId]) => {
          const enabledRoles = _.filter(allRoles.nodes, (role) => {
            return _.find(role.permissions.nodes, {
              sourceType: props.sourceType,
              sourceId,
              permission: 'view',
              value: true
            })
          })
          return _.map(enabledRoles, 'id')
        })
      ))
    }
    const roleOptionsStream = allRolesStream.pipe(rx.map((allRoles) => {
      return _.filter(_.map(allRoles.nodes, (role) => {
        if (role.slug !== 'everyone' || !omitEveryone) {
          return { value: role.id, text: role.name }
        }
      }))
    }))

    return {
      roleOptionsStream
    }
  }, [])

  return z('.z-role-picker', [
    z($dropdownMultiple, {
      $$parentRef,
      placeholder: lang.get('rolePicker.placeholder'),
      isFullWidth: true,
      valuesStreams: roleIdsStreams,
      optionsStream: roleOptionsStream
    })
  ])
}
