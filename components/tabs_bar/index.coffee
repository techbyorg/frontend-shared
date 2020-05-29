import {z, classKebab, useEffect, useRef, useStream} from 'zorium'
import * as _ from 'lodash-es'

import colors from '../../colors'

if window?
  require './index.styl'

export default $tabsBar = (props) ->
  {selectedIndexStream, items, bgColor, color, isPrimary, inactiveColor,
    underlineColor, isFixed, isFlat, isArrow, tabWidth, tabHeight} = props

  $$ref = useRef()

  useEffect ->
    $$ref.current.addEventListener 'touchmove', onTouchMove

    return ->
      $$ref?.current.removeEventListener 'touchmove', onTouchMove
  , []

  {selectedIndex} = useStream ->
    selectedIndex: selectedIndexStream

  onTouchMove = (e) ->
    e.preventDefault()

  bgColor ?= if isPrimary then colors.$primaryMain else colors.$bgColor
  inactiveColor ?= if isPrimary \
                   then colors.$primaryMainText54 \
                   else colors.$bgText54
  color ?= if isPrimary \
           then colors.$primaryMainText \
           else colors.$bgText
  underlineColor ?= if isPrimary \
                    then colors.$primaryMainText \
                    else colors.$primaryMain

  isFullWidth = not tabWidth

  z '.z-tabs-bar', {
    ref: $$ref
    className: classKebab {isFixed, isArrow, isFlat, isFullWidth}
    style:
      background: bgColor
  },
    z '.bar', {
      style:
        background: bgColor
        height: if tabHeight then "#{tabHeight}px"
        width: if isFullWidth \
               then '100%' \
               else "#{tabWidth * items.length}px"
    },
        z '.selector',
          key: 'selector'
          style:
            background: underlineColor
            width: "#{100 / items.length}%"
        _.map items, (item, i) ->
          hasIcon = Boolean item.$menuIcon
          hasText = Boolean item.$menuText
          hasNotification = item.hasNotification
          isSelected = i is selectedIndex

          z '.tab',
            key: i
            slug: item.slug
            className: classKebab {hasIcon, hasText, isSelected}
            style: if tabWidth then {width: "#{tabWidth}px"} else null

            onclick: (e) ->
              e.preventDefault()
              e.stopPropagation()
              selectedIndexStream.next(i)
            if hasIcon
              z '.icon',
                z item.$menuIcon,
                  isTouchTarget: false
                  color: if isSelected then color else inactiveColor
                  icon: item.menuIconName
            item.$after
            if hasText
              z '.text', {
                style:
                  color: if isSelected then color else inactiveColor
              },
               item.$menuText

             z '.notification', {
               className: classKebab {
                 isVisible: hasNotification
               }
             }
