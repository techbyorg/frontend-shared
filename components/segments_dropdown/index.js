// TODO: settings page might be better in frontend-shared
import { z, useContext, useMemo, useStream } from 'zorium'
import _ from 'lodash-es'
import * as rx from 'rxjs/operators'

import $dropdown from 'frontend-shared/components/dropdown'
import { streams } from 'frontend-shared/services/obs'

import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $segmentsDropdown ({ segmentStream, dashboardSlug }) {
  const { model, router, lang } = useContext(context)

  const {
    segmentsStream, segmentStreams
  } = useMemo(() => {
    const segmentStreams = streams(segmentStream.pipe(
      rx.map((segment) => segment?.slug))
    )

    return {
      segmentsStream: model.segment.getAll(),
      segmentStreams
    }
  }, [])

  const { segments } = useStream(() => ({
    segments: segmentsStream
  }))

  return !_.isEmpty(segments?.nodes) && z('.z-segments-dropdown', [
    z($dropdown, {
      anchor: 'top-right',
      onChange: (value) => {
        router.go('orgDashboardWithSegment', {
          segmentSlug: value,
          dashboardSlug: dashboardSlug
        })
      },
      placeholder: lang.get('segmentDropdown.placeholder'),
      valueStreams: segmentStreams,
      options: [{
        value: 'all', text: lang.get('general.all')
      }].concat(_.map(segments.nodes, ({ slug }) => ({
        value: slug,
        text: slug
      })))
    })
  ])
}
