import {
  z, classKebab, useContext, useErrorBoundary, useRef, useMemo, useStream
} from 'zorium'
import * as Rx from 'rxjs'
import * as _ from 'lodash-es'

import $calendar from '../calendar'
import $dropdown from '../dropdown'
import $icon from '../icon'
import { notesIconPath } from '../icon/paths'
import $positionedOverlay from '../positioned_overlay'
import $sheet from '../sheet'
import Environment from '../../services/environment'
import DateService from '../../services/date'
import { streamsOrStream, setStreamsOrStream } from '../../services/obs'
import context from '../../context'

if (typeof window !== 'undefined') { require('./index.styl') }

// TODO: errorStream
export default function $inputDateRange (props) {
  const {
    startDateStreams, endDateStreams, startDateStream, endDateStream,
    presetDateRangeStream, earliestTime
  } = props
  const { colors, lang } = useContext(context)

  const $$ref = useRef()

  const { isSettingStartStream, isOpenStream } = useMemo(() => {
    return {
      isSettingStartStream: new Rx.BehaviorSubject(true),
      isOpenStream: new Rx.BehaviorSubject(false)
    }
  }, [])

  const dropdownOptions = useMemo(() =>
    getDropdownOptions({
      lang,
      startDateStreams,
      endDateStreams,
      startDateStream,
      endDateStream,
      presetDateRangeStream,
      earliestTime
    })
  , [earliestTime])

  const {
    isOpen, startDate, endDate, isSettingStart
  } = useStream(() => ({
    isOpen: isOpenStream,
    startDate: streamsOrStream(startDateStreams, startDateStream),
    endDate: streamsOrStream(endDateStreams, endDateStream),
    isSettingStart: isSettingStartStream
  }))

  const [error] = useErrorBoundary()
  if (error) { console.warn('err', error) }

  const isMobile = Environment.isMobile()
  const $container = isMobile ? $sheet : $positionedOverlay

  const startDateFormatted = DateService.format(
    DateService.dateToUTC(new Date(startDate)),
    'MMM D, YYYY'
  )
  const endDateFormatted = endDate && DateService.format(
    DateService.dateToUTC(new Date(endDate)),
    'MMM D, YYYY'
  )

  return z('.z-input-date-range', { ref: $$ref }, [
    z('.input', {
      onclick: () => {
        isOpenStream.next(!isOpen)
        isSettingStartStream.next(true)
      }
    }, [
      z('.start', {
        className: classKebab({ isFocused: isOpen && isSettingStart }),
        onclick: (e) => {
          e.stopPropagation()
          isOpenStream.next(true)
          isSettingStartStream.next(true)
        }
      }, startDateFormatted),
      z('.divider'),
      z('.end', {
        className: classKebab({ isFocused: isOpen && !isSettingStart }),
        onclick: (e) => {
          e.stopPropagation()
          isOpenStream.next(true)
          isSettingStartStream.next(false)
        }
      }, endDateFormatted || '...')
    ]),
    z($dropdown, {
      anchor: 'top-right',
      maxHeightPx: 'none',
      isCondensedOptions: true,
      $current: z('.z-input-date-range_preset-dates-button', [
        z($icon, {
          icon: notesIconPath,
          size: '18px',
          color: colors.$bgText70
        })
      ]),
      options: dropdownOptions
    }),
    isOpen &&
      z($container, {
        $$targetRef: $$ref,
        offset: { y: 8 },
        onClose: () => isOpenStream.next(false),
        $content: z('.z-input-date-range_calendar', {
          className: classKebab({ isMobile })
        }, [
          z($calendar, {
            startDateStreams,
            startDateStream,
            endDateStreams,
            endDateStream,
            isSettingStartStream
          })
        ])
      })
  ])
}

function getDropdownOptions (props) {
  const {
    lang, startDateStreams, startDateStream, endDateStreams, endDateStream,
    presetDateRangeStream, earliestTime
  } = props

  console.log('EARLY', earliestTime)

  return _.map(
    DateService.getPresetDateRangeOptions(new Date(earliestTime)),
    (option, key) => {
      const startDateFormatted = DateService.format(
        option.startDateFn(),
        'MMM D, YYYY'
      )
      const endDateFormatted = DateService.format(
        option.endDateFn(),
        'MMM D, YYYY'
      )
      return _.defaults({
        value: key,
        text: z('.z-input-date-range_option', [
          z('.text', lang.get(`inputDateRange.${key}`)),
          z('.date', `${startDateFormatted} - ${endDateFormatted}`)
        ]),
        onSelect: () => {
          presetDateRangeStream?.next(key)
          setStreamsOrStream(
            startDateStreams,
            startDateStream,
            DateService.format(option.startDateFn(), 'yyyy-mm-dd')
          )
          setStreamsOrStream(
            endDateStreams,
            endDateStream,
            DateService.format(option.endDateFn(), 'yyyy-mm-dd')
          )
        }
      }, option)
    }
  )
}
