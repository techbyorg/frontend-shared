import { z, lazy, Suspense, Boundary, useStream } from 'zorium'

import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import DateService from '../../services/date'
import $spinner from '../spinner'

const $lightCalendar = lazy(() =>
  Promise.all([
    import(/* webpackChunkName: "nivo" */'@lls/react-light-calendar'),
    import('@lls/react-light-calendar/dist/index.css')
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
  const startDateTime = new Date(startDate).getTime()
  // HACK: figure out why i have to add 24 hrs
  const endDateTime = new Date(endDate).getTime()

  console.log('sd', startDate, endDate, startDateTime, endDateTime)

  return z('.z-calendar', [
    (typeof window !== 'undefined') &&
      z(Boundary, { fallback: z('.error', 'err') }, [
        z(Suspense, { fallback: $spinner }, [
          z($lightCalendar, {
            startDate: startDateTime,
            endDate: endDateTime,
            onChange: (startDateTime, endDateTime) => {
              console.log(startDateTime, endDateTime)
              const startDate = DateService.format(
                DateService.dateToUTC(new Date(startDateTime)),
                'yyyy-mm-dd'
              )
              const endDate = DateService.format(
                DateService.dateToUTC(new Date(endDateTime || startDateTime)),
                'yyyy-mm-dd'
              )
              console.log('set', startDate, endDate)

              setStreamsOrStream(startDateStreams, startDateStream, startDate)
              setStreamsOrStream(endDateStreams, endDateStream, endDate)
            }
          })
        ])
      ])
  ])
}
