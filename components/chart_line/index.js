import { z, lazy, Suspense, Boundary, useContext } from 'zorium'

import $spinner from '../spinner'
import FormatService from '../../services/format'
import context from '../../context'

const $line = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/line').then(({ ResponsiveLine }) => ResponsiveLine))

if (typeof window !== 'undefined') { require('./index.styl') }

/*
if this is ever acting weird (ie theme is undefined and throwing errors)
make sure there aren't dupe react/preact/nivos in package-lock.json.
also make sure nothing is npm-linked (idk why)
*/

export default function $chartLine ({ data }) {
  const { colors } = useContext(context)

  return z('.z-chart-line', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($line, {
            data,
            theme: {},
            xScale: { type: 'point' },
            yScale: { type: 'linear', min: 'auto', max: 'auto' },
            curve: 'monotoneX',
            enableGridX: false,
            lineWidth: 4,
            pointSize: 10,
            pointColor: colors.$bgColor,
            pointBorderWidth: 2,
            pointBorderColor: {
              from: 'serieColor'
            },
            colors: [colors.$primaryMain],
            useMesh: true,
            enableCrosshair: false,
            gridYValues: 5,
            margin: {
              left: 60,
              bottom: 40,
              right: 20,
              top: 30
            },
            axisBottom: {
              tickSize: 0,
              tickPadding: 24
            },
            axisLeft: {
              tickSize: 0,
              tickPadding: 16,
              tickValues: 5,
              format (value) {
                return FormatService.abbreviateDollar(Number(value), 2)
              }
            },
            yFormat (value) {
              return FormatService.abbreviateDollar(Number(value), 2)
            }
          })
        ])
      ])
  ])
}
