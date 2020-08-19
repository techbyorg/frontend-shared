import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import { z, lazy, Suspense, useContext, useStream, useMemo } from 'zorium'

import Environment from 'frontend-shared/services/environment'

import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import DateService from '../../services/date'
import $spinner from '../spinner'
import context from '../../context'

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
  const { cookie } = useContext(context)

  const { isSettingStartStream } = useMemo(() => {
    return {
      isSettingStartStream:
        props.isSettingStartStream || new Rx.BehaviorSubject(false)
    }
  }, [])

  const {
    startDateObj, endDateObj, isSettingStart
  } = useStream(() => ({
    startDateObj: streamsOrStream(startDateStreams, startDateStream).pipe(
      rx.map((startDate) =>
        startDate && DateService.dateToUTC(new Date(startDate))
      )
    ),
    endDateObj: streamsOrStream(endDateStreams, endDateStream).pipe(
      rx.map((endDate) =>
        endDate && DateService.dateToUTC(new Date(endDate))
      )
    ),
    isSettingStart: isSettingStartStream
  }))

  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  return z('.z-calendar', [
    (typeof window !== 'undefined') &&
      z(Suspense, { fallback: $spinner }, [
        z($dayPicker, {
          className: 'Selectable',
          numberOfMonths: Environment.isMobile() ? 1 : 2,
          month: Environment.isMobile() ? undefined : lastMonth,
          disabledDays: {
            before: isSettingStart ? undefined : startDateObj,
            after: isSettingStart ? endDateObj : new Date()
          },
          selectedDays: [startDateObj, {
            from: startDateObj,
            to: endDateObj
          }],
          modifiers: {
            start: startDateObj,
            end: endDateObj
          },
          onDayClick: (day, modifiers = {}) => {
            if (modifiers.disabled) {
              return
            }
            const date = DateService.format(
              DateService.dateToUTC(day),
              'yyyy-mm-dd'
            )

            // TODO: rm cookie.set when fixed in preact
            // https://github.com/preactjs/preact/pull/2570
            // ^^ "fix" was merged in, but still breaks (this time when trying
            // to dismount lazy component)
            if (isSettingStart) {
              isSettingStartStream.next(false)
              // order matters (end before start) bc of metricStream rx.filter
              // setStreamsOrStream(endDateStreams, endDateStream, null)
              setStreamsOrStream(startDateStreams, startDateStream, date)
              cookie.set('startDate', date)
            } else {
              isSettingStartStream.next(true)
              setStreamsOrStream(endDateStreams, endDateStream, date)
              cookie.set('endDate', date)
            }
          }
        })
      ])
  ])
}
