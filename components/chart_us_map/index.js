import { z, lazy, Suspense, Boundary, useContext, useRef, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $spinner from '../spinner'
import FormatService from '../../services/format'
import useRefSize from '../../services/use_ref_size'
import context from '../../context'

const $choropleth = lazy(() => Promise.all([
  import(/* webpackChunkName: "nivo" */'@nivo/geo')
    .then(({ ChoroplethCanvas }) => ChoroplethCanvas),
  // canvas is more performant here. enough to matter on slow devices
  // due to us geojson

  fetch(
    // https://github.com/hrbrmstr/albersusa
    // ogr2ogr ./us_states.json ./composite_us_states.geojson -simplify 0.05 -sql "SELECT iso_3166_2 as id, name FROM composite_us_states"
    // then i manually changed the numberic ids to the two letter code
    'https://fdn.uno/d/data/us_states.json?1'
  ).then(response => response.json())
])
  .then(function ([ChloroplethCanvas, { features }]) {
    const { colors } = useContext(context)
    return ({ width, height, data, min, max }) =>
      z(ChloroplethCanvas, {
        data,
        width,
        height,
        features,
        theme: {},
        domain: [min, max],
        unknownColor: colors.getRawColor(colors.$bgText12),
        colors: [
          '#91e0f4', '#81caef', '#6fafe6', '#5e9de7', '#4a7ed5', '#3d6edb'
        ],
        label: 'properties.name',
        valueFormat (value) {
          return FormatService.abbreviateDollar(Number(value))
        },
        projectionScale: width * 1.2,
        projectionType: 'albersUsa',
        borderWidth: 1,
        borderColor: colors.getRawColor(colors.$bgColor)
      })
  })
)

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $chartUsMap ({ data }) {
  const $$ref = useRef()

  const { min, max } = useMemo(() => {
    const values = _.map(data, 'value')
    return {
      min: _.min(values),
      max: _.max(values)
    }
  }, [data])

  const size = useRefSize($$ref)

  return z('.z-chart-us-map', { ref: $$ref }, [
    (typeof window !== 'undefined') && size &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($choropleth, {
            data, min, max, width: size.width, height: size.height
          })
        ])
      ])
  ])
}
