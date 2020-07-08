import { z, lazy, Suspense, Boundary, useStream } from 'zorium'

import Environment from 'frontend-shared/services/environment'

import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import DateService from '../../services/date'
import $spinner from '../spinner'

const $dayPicker = lazy(() =>
  Promise.all([
    import(/* webpackChunkName: "nivo" */'react-day-picker'),
    import('react-day-picker/lib/style.css')
  ]).then(([Calendar]) => Calendar))

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $calendar (props) {
  const {
    startDateStream, startDateStreams, endDateStream, endDateStreams
  } = props

  const { startDate, endDate } = useStream(() => ({
    startDate: streamsOrStream(startDateStreams, startDateStream),
    endDate: streamsOrStream(endDateStreams, endDateStream)
  }))

  // TODO: when preact rerender suspense bug is fixed, move this to
  // useStream as a pipe map to only get once per change instead of per render
  // https://github.com/preactjs/preact/pull/2570
  const startDateObj = startDate && DateService.dateToUTC(new Date(startDate))
  const endDateObj = endDate && DateService.dateToUTC(new Date(endDate))

  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  return z('.z-calendar', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($dayPicker, {
            className: 'Selectable',
            numberOfMonths: Environment.isMobile() ? 1 : 2,
            month: Environment.isMobile() ? undefined : lastMonth,
            selectedDays: [startDateObj, {
              from: startDateObj,
              to: endDateObj
            }],
            modifiers: {
              start: startDateObj,
              end: endDateObj
            },
            onDayClick: (day) => {
              console.log('day click', day)
              const date = DateService.format(
                DateService.dateToUTC(day),
                'yyyy-mm-dd'
              )

              if (startDate && endDate) {
                // order matters (end before start) bc of metricStream rx.filter
                setStreamsOrStream(endDateStreams, endDateStream, null)
                setStreamsOrStream(startDateStreams, startDateStream, date)
              } else {
                setStreamsOrStream(endDateStreams, endDateStream, date)
              }
            }
          })
        ])
      ])
  ])
}
