import { z, classKebab, lazy, Suspense, Boundary, useContext, useMemo, useStream } from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $chartTooltip from '../chart_tooltip'
import $spinner from '../spinner'
import FormatService from '../../services/format'
import context from '../../context'

const $line = lazy(() => import(/* webpackChunkName: "nivo" */'@nivo/line').then(({ ResponsiveLineCanvas }) => ResponsiveLineCanvas))

if (typeof window !== 'undefined') { require('./index.styl') }

/*
if this is ever acting weird (ie theme is undefined and throwing errors)
make sure there aren't dupe react/preact/nivos in package-lock.json.
also make sure nothing is npm-linked (idk why)
*/

export default function $chartLine ({ data, chartOptions }) {
  const { colors } = useContext(context)

  const { hoveredPointStream } = useMemo(() => {
    return {
      hoveredPointStream: new Rx.BehaviorSubject(null)
    }
  }, [])

  const nivoOptions = _.defaultsDeep(chartOptions || {}, {
    data,
    theme: {
      textColor: colors.getRawColor(colors.$bgText54),
      axis: {
        ticks: {
          line: {
            stroke: 'transparent'
          }
        }
      }
    },
    tooltip: ({ point }) => {
      hoveredPointStream.next(point)
      return z($chartTooltip, {
        color: point.serieColor,
        label: data.length > 1 && point.serieId,
        x: point.data.xFormatted,
        y: point.data.yFormatted
      })
    },
    motionStiffness: 150,
    motionDamping: 25,
    xScale: { type: 'point' },
    yScale: { type: 'linear', min: 'auto', max: 'auto' },
    curve: 'monotoneX',
    enableGridX: false,
    lineWidth: 4,
    pointSize: 10,
    pointColor: colors.getRawColor(colors.$bgColor),
    pointBorderWidth: 2,
    pointBorderColor: {
      from: 'serieColor'
    },
    colors: [colors.getRawColor(colors.$primaryMain)],
    useMesh: true,
    enableCrosshair: false,
    gridYValues: 5,
    margin: {
      left: 60,
      bottom: 40,
      right: 20,
      top: 10
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
        return FormatService.abbreviateNumber(Number(value))
      }
    },
    yFormat (value) {
      return FormatService.abbreviateNumber(Number(value))
    }
  })

  return z('.z-chart-line', {
    onmouseleave: () => {
      hoveredPointStream.next(null)
    }
  }, [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($line, nivoOptions),
          z($chartLinePoint, { hoveredPointStream, nivoOptions })
        ])
      ])
  ])
}

// separate component so main component doesn't have to rerender
function $chartLinePoint ({ hoveredPointStream, nivoOptions }) {
  const { hoveredPoint } = useStream(() => ({
    hoveredPoint: hoveredPointStream
  }))

  return z('.z-hovered-point', {
    className: classKebab({ isVisible: hoveredPoint }),
    style: {
      backgroundColor: hoveredPoint?.serieColor,
      boxShadow: `0 0 0 2px ${hoveredPoint?.serieColor}`,
      left: `${hoveredPoint?.x + nivoOptions.margin.left}px`,
      top: `${hoveredPoint?.y + nivoOptions.margin.top}px`
    }
  })
}
