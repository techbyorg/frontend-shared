import { z, lazy, Suspense, Boundary } from 'zorium'

import $chartTooltip from '../chart_tooltip'
import $spinner from '../spinner'

const $pie = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/pie').then(({ ResponsivePie }) => ResponsivePie))

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $chartPie ({ key, data, colors }) {
  return z('.z-chart-pie', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($pie, {
            key,
            data,
            innerRadius: 0.5,
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
          }
          )
        ])
      ])
  ])
}
