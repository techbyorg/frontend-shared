import { z, classKebab, useContext, useRef, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as _ from 'lodash'

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
    startDateStreams, endDateStreams, startDateStream, endDateStream
  } = props
  const { colors, lang } = useContext(context)

  const $$ref = useRef()

  const { dropdownOptions, isOpenStream } = useMemo(() => {
    return {
      dropdownOptions: getDropdownOptions({
        lang, startDateStreams, endDateStreams, startDateStream, endDateStream
      }),
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
  const endDateFormatted = endDate && DateService.format(
    DateService.dateToUTC(new Date(endDate)),
    'MMM D, YYYY'
  )

  return z('.z-input-date-range', { ref: $$ref }, [
    z('.input', {
      onclick: () => isOpenStream.next(!isOpen)
    }, [
      z('.start', startDateFormatted),
      z('.divider'),
      z('.end', endDateFormatted || '...')
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
            startDateStreams, startDateStream, endDateStreams, endDateStream
          })
        ])
      })
  ])
}

function getDropdownOptions (props) {
  const {
    lang, startDateStreams, startDateStream, endDateStreams, endDateStream
  } = props

  const rawOptions = [
    {
      value: '7days',
      text: lang.get('inputDateRange.7days'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 8)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() - 1)
        return endDate
      }
    },
    {
      value: '30days',
      text: lang.get('inputDateRange.30days'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 31)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setDate(endDate.getDate() - 1)
        return endDate
      }
    },
    {
      value: 'thisMonth',
      text: lang.get('inputDateRange.thisMonth'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setDate(1)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
        return endDate
      }
    },
    {
      value: 'lastMonth',
      text: lang.get('inputDateRange.lastMonth'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        startDate.setDate(1)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setDate(0)
        return endDate
      }
    },
    {
      value: 'last6Months',
      text: lang.get('inputDateRange.last6Months'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 6)
        startDate.setDate(1)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setDate(0)
        return endDate
      }
    },
    {
      value: 'last12Months',
      text: lang.get('inputDateRange.last12Months'),
      startDateFn: () => {
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 12)
        startDate.setDate(1)
        return startDate
      },
      endDateFn: () => {
        const endDate = new Date()
        endDate.setDate(0)
        return endDate
      }
    }
  ]

  return _.map(rawOptions, (option) => {
    const startDateFormatted = DateService.format(
      option.startDateFn(),
      'MMM D, YYYY'
    )
    const endDateFormatted = DateService.format(
      option.endDateFn(),
      'MMM D, YYYY'
    )
    return _.defaults({
      text: z('.z-input-date-range_option', [
        z('.text', option.text),
        z('.date', `${startDateFormatted} - ${endDateFormatted}`)
      ]),
      onSelect: () => {
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
  })
}
