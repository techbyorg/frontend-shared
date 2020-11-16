import { z, useContext, useMemo } from 'zorium'
import _ from 'lodash-es'
import * as rx from 'rxjs/operators'

import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $rolePicker ({ roleIdsStreams }) {
  const { model, lang } = useContext(context)

  const {
    roleOptionsStream
  } = useMemo(() => {
    const allRolesStreams = model.role.getAll()
    const roleOptionsStream = allRolesStreams.pipe(rx.map((allRoles) => {
      return _.map(allRoles.nodes, (role) => ({
        value: role.id, text: role.name
      }))
    }))

    return {
      roleOptionsStream
    }
  }, [])

  return z('.z-role-picker', [
    z($dropdownMultiple, {
      placeholder: lang.get('rolePicker.placeholder'),
      isFullWidth: true,
      valuesStreams: roleIdsStreams,
      optionsStream: roleOptionsStream
    })
  ])
}
