// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'
import _ from 'lodash-es'
import * as Rx from 'rxjs'

import $dropdown from 'frontend-shared/components/dropdown'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $partnersDropdown ({ partnerStream }) {
  const { model, router, lang } = useContext(context)

  const {
    partnersStream, partnerStreams
  } = useMemo(() => {
    const partnerStreams = new Rx.ReplaySubject(1)
    partnerStreams.next(partnerStream)

    return {
      partnersStream: model.partner.getAll(),
      partnerStreams
    }
  }, [])

  const { partners } = useStream(() => ({
    partners: partnersStream
  }))

  return !_.isEmpty(partners?.nodes) && z('.z-partners-dropdown', [
    z($dropdown, {
      anchor: 'top-right',
      onChange: (value) => {
        router.go('orgPartner', { partnerSlug: value })
      },
      placeholder: lang.get('partnerDropdown.placeholder'),
      valueStreams: partnerStreams,
      options: _.map(partners.nodes, ({ slug }) => ({
        value: slug,
        text: slug
      }))
    })
  ])
}
