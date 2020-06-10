import {z, classKebab, useContext, useEffect, useMemo, useRef, useStream} from 'zorium'
import * as _ from 'lodash-es'
import * as Rx from 'rxjs'

import $tabsBar from '../../components/tabs_bar'
import context from '../../context'

if window?
  IScroll = require 'iscroll/build/iscroll-lite-snap-zoom.js'
  require './index.styl'

TRANSITION_TIME_MS = 500 # 0.5s

# FIXME: i don't think this will actually unsub mountDisposable?
export default $tabs = (props) ->
  {selectedIndexStream, hideTabBarStream,
    disableDeceleration, deferTabLoads, tabs, barColor, barBgColor,
    barInactiveColor, isBarFixed, isBarFlat, isBarArrow, barTabWidth,
    barTabHeight, windowSize, vDomKey, isPrimary} = props
  {browser} = useContext context

  $$ref = useRef()

  {selectedIndexStream, isPausedStream} = useMemo ->
    {
      selectedIndexStream: selectedIndexStream or new Rx.BehaviorSubject 0
      isPausedStream: new Rx.BehaviorSubject false
    }
  , []

  transformProperty = browser.getTransformProperty()
  transitionTime = TRANSITION_TIME_MS


  useEffect ($$ref) ->
    mountDisposable = null
    iScrollContainer = null
    loadedIndices = []

    checkIsReady = ->
      $$container = $$ref?.querySelector('.z-tabs > .content > .tabs-scroller')
      if $$container and $$container.clientWidth
        initIScroll $$container, {
          mountDisposable, iScrollContainer, loadedIndices
        }
      else
        setTimeout checkIsReady, 1000

    checkIsReady()

    return ->
      loadedIndices = []
      mountDisposable?.unsubscribe()
      iScrollContainer?.destroy()
  , []

  {selectedIndex, hideTabBar, isPaused, windowSize} = useStream ->
    selectedIndex: selectedIndexStream
    hideTabBar: hideTabBarStream
    isPaused: isPausedStream
    windowSize: browser.getSize()

  # FIXME: have these callable by parent (ref, see checkbox component for ex)
  disableTransition = -> transitionTime = 0

  enableTransition = -> transitionTime = TRANSITION_TIME_MS

  toggle = (mode) ->
    if mode is 'enable' and isPaused
      iScrollContainer?.enable()
      isPausedStream.next false
    else if mode is 'disable' and not isPaused
      iScrollContainer?.disable()
      isPausedStream.next true

  initIScroll = ($$container) ->
    iScrollContainer = new IScroll $$container, {
      scrollX: true
      scrollY: false
      eventPassthrough: true
      bounce: false
      snap: '.iscroll-tab'
      # when disabled, bounce anim is done by our transitions and there
      # is no momentum. fast swiping through photo gallery breaks with
      # defaul deceleration
      deceleration: if disableDeceleration then 1 else 0.002
    }

    unless hideTabBar
      $$selector = $el?.querySelector '.z-tabs-bar .selector'
      updateSelectorPosition = ->
        # updating state and re-rendering every time is way too slow
        xOffset = -100 * iScrollContainer.pages.length * (
          iScrollContainer.x / iScrollContainer.scrollerWidth
        )
        xOffset = "#{xOffset}%"
        $$selector and selector.style[transformProperty] = "translateX(#{xOffset})"

    # the scroll listener in IScroll (iscroll-probe.js) is really slow
    isScrolling = false
    iScrollContainer.on 'scrollStart', ->
      isScrolling = true
      unless hideTabBar
        $$selector = document.querySelector '.z-tabs-bar .selector'
        update = ->
          updateSelectorPosition()
          if isScrolling
            window.requestAnimationFrame update
        update()
        updateSelectorPosition()

    iScrollContainer.on 'scrollEnd', ->
      isScrolling = false

      newIndex = iScrollContainer.currentPage.pageX
      # landing on new tab
      if selectedIndex isnt newIndex
        selectedIndexStream.next newIndex

    mountDisposable = selectedIndexStream.do((index) ->
      loadedIndices.push index
      if iScrollContainer.pages?[index]
        iScrollContainer.goToPage index, 0, transitionTime
      unless hideTabBar
        $$selector = document.querySelector '.z-tabs-bar .selector'
        updateSelectorPosition()
    ).subscribe()

  tabs ?= [{$el: ''}]
  x = iScrollContainer?.x or -1 * selectedIndex * (windowSize?.width or 0)

  vDomKey = "#{vDomKey}-tabs-#{tabs?.length}"
  isBarFixed ?= true
  isBarFlat ?= true

  z '.z-tabs', {
    rel: $$ref
    className: classKebab {isBarFixed}
    key: vDomKey
    style:
      maxWidth: "#{windowSize.width}px"
  },
    z '.content',
      unless hideTabBar
        z '.tabs-bar',
          z $tabsBar, {
            selectedIndexStream
            isFixed: isBarFixed
            isFlat: isBarFlat
            isArrow: isBarArrow
            tabWidth: barTabWidth
            tabHeight: barTabHeight
            color: barColor
            inactiveColor: barInactiveColor
            bgColor: barBgColor
            isPrimary: isPrimary
            items: tabs
          }
      z '.tabs-scroller', {
        key: vDomKey
      },
        z '.tabs', {
          style:
            minWidth: "#{(100 * tabs.length)}%"
            # v-dom sometimes changes up the DOM node we're using when the
            # page changes, then back to this page. when that happens,
            # translate x is 0 initially even though iscroll might realize
            # it's actually something other than 0. since iscroll uses
            # css transitions, it causes the page to swipe in, which looks bad
            # This fixes that
            "#{transformProperty}": "translate(#{x}px, 0px) translateZ(0px)"
            # webkitTransform: "translate(#{x}px, 0px) translateZ(0px)"
        },
          _.map tabs, ({$el}, i) ->
            z '.iscroll-tab', {
              style:
                width: "#{(100 / tabs.length)}%"
            },
              if not deferTabLoads or (
                i is selectedIndex or loadedIndices.indexOf(i) isnt -1
              )
                $el
