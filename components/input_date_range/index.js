import { z, classKebab, useRef, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'

import $calendar from '../calendar'
import $positionedOverlay from '../positioned_overlay'
import $sheet from '../sheet'
import Environment from '../../services/environment'
import DateService from '../../services/date'
import { streamsOrStream } from '../../services/obs'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $inputDateRange (props) {
  const {
    startDateStreams, endDateStreams, startDateStream, endDateStream
  } = props

  const $$ref = useRef()

  const { isOpenStream } = useMemo(() => {
    return {
      isOpenStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const { isOpen, startDate, endDate } = useStream(() => ({
    isOpen: isOpenStream,
    startDate: streamsOrStream(startDateStreams, startDateStream),
    endDate: streamsOrStream(endDateStreams, endDateStream)
  }))

  const isMobile = Environment.isMobile()
  const $container = isMobile ? $sheet : $positionedOverlay

  console.log('open', isOpen)
  const startDateFormatted = DateService.format(
    DateService.dateToUTC(new Date(startDate)),
    'MMM D, YYYY'
  )
  const endDateFormatted = DateService.format(
    DateService.dateToUTC(new Date(endDate)),
    'MMM D, YYYY'
  )

  return z('.z-input-date-range', { ref: $$ref }, [
    z('.input', {
      onclick: () => isOpenStream.next(!isOpen)
    }, [
      z('.start', startDateFormatted),
      z('.divider'),
      z('.end', endDateFormatted),
      z('.preset-dates-button')
    ]),
    isOpen &&
      z($container, {
        $$targetRef: $$ref,
        onClose: () => isOpenStream.next(false),
        $content: z('.z-input-date-range_calendar', {
          className: classKebab({ isMobile })
        }, [
          z($calendar, {
            startDateStreams, startDateStream, endDateStreams, endDateStream
          })
        ])
      })
  ])
}
