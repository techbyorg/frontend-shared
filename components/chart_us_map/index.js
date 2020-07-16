import { z, lazy, Suspense, useErrorBoundary, useContext, useRef, useMemo } from 'zorium'
import * as _ from 'lodash-es'

import $chartTooltip from '../chart_tooltip'
import $spinner from '../spinner'
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
    return ({ key, width, height, data, min, max, chartOptions }) =>
      z(ChloroplethCanvas, _.defaultsDeep(chartOptions || {}, {
        key,
        data,
        width,
        height,
        features,
        theme: {},
        // animate: false,
        tooltip: ({ feature }) => {
          return feature.data && z($chartTooltip, {
            color: feature.color,
            key: feature.id,
            x: feature.id,
            y: feature.data.value
          })
        },
        domain: [min, max],
        unknownColor: colors.getRawColor(colors.$bgText12),
        colors: [
          // `${colors.getRawColor(colors.$primary900)}10`,
          // `${colors.getRawColor(colors.$primary900)}20`,
          `${colors.getRawColor(colors.$primary900)}30`,
          `${colors.getRawColor(colors.$primary900)}40`,
          `${colors.getRawColor(colors.$primary900)}50`,
          `${colors.getRawColor(colors.$primary900)}60`,
          `${colors.getRawColor(colors.$primary900)}70`,
          `${colors.getRawColor(colors.$primary900)}80`,
          `${colors.getRawColor(colors.$primary900)}90`,
          `${colors.getRawColor(colors.$primary900)}`
        ],
        label: 'properties.name',
        projectionScale: width * 1.2,
        projectionType: 'albersUsa',
        borderWidth: 1,
        borderColor: colors.getRawColor(colors.$bgColor)
      }))
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

  const [error] = useErrorBoundary()
  if (error) { console.log(error) }

  return z('.z-chart-us-map', { ref: $$ref }, [
    (typeof window !== 'undefined') && size &&
      z(Suspense, { fallback: $spinner }, [
        z($choropleth, {
          data, min, max, width: size.width, height: size.height
        })
      ])
  ])
}
