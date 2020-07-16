import { z, lazy, Suspense, useErrorBoundary, useContext } from 'zorium'
import * as _ from 'lodash-es'

import $chartTooltip from '../chart_tooltip'
import $spinner from '../spinner'
import FormatService from '../../services/format'
import context from '../../context'

const $bar = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/bar').then(({ ResponsiveBar }) => ResponsiveBar))

if (typeof window !== 'undefined') { require('./index.styl') }

/*
if this is ever acting weird (ie theme is undefined and throwing errors)
make sure there aren't dupe react/preact/nivos in package-lock.json.
also make sure nothing is npm-linked (idk why)
*/

export default function $chartLine ({ data, chartOptions }) {
  const { colors } = useContext(context)

  const [error] = useErrorBoundary()
  if (error) { console.log(error) }

  return z('.z-chart-bar', [
    (typeof window !== 'undefined') &&
      z(Suspense, { fallback: $spinner }, [
        z($bar, _.defaultsDeep(chartOptions || {}, {
          data,
          theme: {
            textColor: colors.$bgText54,
            // TODO: rm whenever nivo updates all tooltips to be like line graph
            tooltip: {
              container: {
                background: 'transparent', boxShadow: 'none', padding: 0
              }
            }
          },
          tooltip: (point) => {
            return z($chartTooltip, {
              x: point.indexValue,
              y: point.value
            })
          },
          borderRadius: 10,
          padding: 0.4,
          enableLabel: false,
          motionStiffness: 150,
          motionDamping: 25,
          enableGridY: false,
          // xScale: { type: 'point' },
          // yScale: { type: 'linear', min: 'auto', max: 'auto' },
          margin: {
            left: 100,
            bottom: 30,
            right: 20,
            top: 10
          },
          axisBottom: {
            tickSize: 0,
            tickPadding: 24,
            format (value) {
              return FormatService.abbreviateNumber(Number(value))
            }
          },
          axisLeft: {
            tickSize: 0,
            tickPadding: 16
          },
          xFormat (value) {
            return FormatService.abbreviateNumber(Number(value))
          }
        }))
      ])
  ])
}
