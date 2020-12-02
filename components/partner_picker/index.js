import { z, useContext, useMemo } from 'zorium'
import _ from 'lodash-es'
import * as rx from 'rxjs/operators'

import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $partnerPicker ({ partnerIdsStreams, $$parentRef }) {
  const { model, lang } = useContext(context)

  const {
    partnerOptionsStream
  } = useMemo(() => {
    const allPartnersStreams = model.partner.getAll()
    const partnerOptionsStream = allPartnersStreams.pipe(rx.map((allPartners) => {
      return _.map(allPartners.nodes, (partner) => ({
        value: partner.id, text: partner.name
      }))
    }))

    return {
      partnerOptionsStream
    }
  }, [])

  return z('.z-partner-picker', [
    z($dropdownMultiple, {
      $$parentRef,
      placeholder: lang.get('partnerPicker.placeholder'),
      isFullWidth: true,
      valuesStreams: partnerIdsStreams,
      optionsStream: partnerOptionsStream
    })
  ])
}
