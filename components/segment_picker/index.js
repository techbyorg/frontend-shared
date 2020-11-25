import { z, useContext, useMemo } from 'zorium'
import _ from 'lodash-es'
import * as rx from 'rxjs/operators'

import $dropdownMultiple from 'frontend-shared/components/dropdown_multiple'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $segmentPicker ({ segmentIdsStreams }) {
  const { model, lang } = useContext(context)

  const {
    segmentOptionsStream
  } = useMemo(() => {
    const allSegmentsStreams = model.segment.getAll()
    const segmentOptionsStream = allSegmentsStreams.pipe(rx.map((allSegments) => {
      return _.map(allSegments.nodes, (segment) => ({
        value: segment.id, text: segment.slug
      }))
    }))

    return {
      segmentOptionsStream
    }
  }, [])

  return z('.z-segment-picker', [
    z($dropdownMultiple, {
      placeholder: lang.get('segmentPicker.placeholder'),
      isFullWidth: true,
      valuesStreams: segmentIdsStreams,
      optionsStream: segmentOptionsStream
    })
  ])
}
