import { z, lazy, Suspense, Boundary } from 'zorium'
import * as _ from 'lodash-es'

import $chartTooltip from '../chart_tooltip'
import $spinner from '../spinner'

const $pie = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/pie').then(({ ResponsivePie }) => ResponsivePie))

if (typeof window !== 'undefined') { require('./index.styl') }

const LEGEND_COUNT = 5

export default function $chartPie ({ heightPx, key, data, colors }) {
  return z('.z-chart-pie', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z('.pie', { style: { height: heightPx } }, [
            z($pie, {
              key,
              data,
              innerRadius: 0.7,
              colors,
              enableRadialLabels: false,
              enableSlicesLabels: false,
              // TODO: rm whenever nivo updates all tooltips to be like line graph
              theme: {
                tooltip: {
                  container: {
                    background: 'transparent', boxShadow: 'none', padding: 0
                  }
                }
              },
              tooltip: ({ id, color, value }) => {
                return z($chartTooltip, {
                  x: id,
                  y: value,
                  color
                })
              }
            })
          ]),
          z('.legend',
            _.map(_.take(data, LEGEND_COUNT), ({ id, value, percent, color }) =>
              z('.legend-item', [
                z('.color', { style: { background: color } }),
                z('.info', [
                  z('.label', id)
                ]),
                // z '.value', FormatService.abbreviateDollar value
                z('.percent', `${Math.round(percent)}%`)
              ])
            )
          )
        ])
      ])
  ])
}
