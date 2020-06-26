import { z, lazy, Suspense, Boundary } from 'zorium'

import $spinner from '../spinner'

const $pie = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/pie').then(({ ResponsivePie }) => ResponsivePie))

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $chartPie ({ data, colors }) {
  return z('.z-chart-pie', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($pie, {
            data,
            innerRadius: 0.5,
            colors,
            enableRadialLabels: false,
            enableSlicesLabels: false
          }
          )
        ])
      ])
  ])
}
