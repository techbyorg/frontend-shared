import { z, classKebab, useEffect, useRef, useStream } from 'zorium'
import * as _ from 'lodash-es'

import colors from '../../colors'

if (typeof window !== 'undefined') { require('./index.styl') }

export default function $tabsBar (props) {
  const {
    selectedIndexStream, items, isPrimary,
    isFixed, isFlat, isArrow, tabWidth, tabHeight
  } = props

  const $$ref = useRef()

  useEffect(() => {
    $$ref.current.addEventListener('touchmove', onTouchMove)

    return () => $$ref?.current.removeEventListener('touchmove', onTouchMove)
  }, [])

  const { selectedIndex } = useStream(() => ({
    selectedIndex: selectedIndexStream
  }))

  var onTouchMove = e => e.preventDefault()

  const bgColor = props.bgColor ||
                    isPrimary ? colors.$primaryMain : colors.$bgColor

  const inactiveColor = props.inactiveColor ||
                    isPrimary ? colors.$primaryMainText54 : colors.$bgText54

  const color = props.color ||
                    isPrimary ? colors.$primaryMainText : colors.$bgText

  const underlineColor = props.underlineColor ||
                    isPrimary ? colors.$primaryMainText : colors.$primaryMain

  const isFullWidth = !tabWidth

  return z('.z-tabs-bar', {
    ref: $$ref,
    className: classKebab({ isFixed, isArrow, isFlat, isFullWidth }),
    style: { background: bgColor }
  }, [
    z('.bar', {
      style: {
        background: bgColor,
        height: tabHeight ? `${tabHeight}px` : undefined,
        width: isFullWidth ? '100%' : `${tabWidth * items.length}px`
      }
    }, [
      z('.selector', {
        key: 'selector',
        style: {
          background: underlineColor,
          width: `${100 / items.length}%`
        }
      }), _.map(items, function (item, i) {
        const hasIcon = Boolean(item.$menuIcon)
        const hasText = Boolean(item.$menuText)
        const { hasNotification } = item
        const isSelected = i === selectedIndex

        return z('.tab', {
          key: i,
          slug: item.slug,
          className: classKebab({ hasIcon, hasText, isSelected }),
          style: tabWidth ? { width: `${tabWidth}px` } : null,

          onclick: (e) => {
            e.preventDefault()
            e.stopPropagation()
            selectedIndexStream.next(i)
          }
        }, [
          hasIcon &&
            z('.icon', [
              z(item.$menuIcon, {
                color: isSelected ? color : inactiveColor,
                icon: item.menuIconName
              })
            ]),
          item.$after,
          hasText &&
            z('.text', {
              style: { color: isSelected ? color : inactiveColor }
            }, item.$menuText),
          z('.notification', {
            className: classKebab({ isVisible: hasNotification })
          })
        ])
      })
    ])
  ])
}
