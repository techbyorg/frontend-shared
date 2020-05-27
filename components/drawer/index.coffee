{z, classKebab, useContext, useRef, useStream, useEffect, useMemo} = require 'zorium'

colors = require '../../colors'
context = require '../../context'
config = require '../../config'

if window?
  IScroll = require 'iscroll/build/iscroll-lite-snap-zoom.js'
  require './index.styl'

MAX_OVERLAY_OPACITY = 0.5

# FIXME: store iScrollContainer in state??

module.exports = $drawer = (props) ->
  {isOpenStream, onOpen, onClose, side = 'left', key = 'nav', isStaticStream,
    $content, hasAppBar} = props
  {model, browser} = useContext context


  $$ref = useRef()

  {transformProperty, isStaticStream} = useMemo ->
    {
      transformProperty: browser.getTransformProperty()
      isStaticStream: isStatic or (browser.getBreakpoint().map (breakpoint) ->
        breakpoint in ['desktop']
      .publishReplay(1).refCount())
    }
  , []

  {isOpen, windowSize, appBarHeight,
    drawerWidth, isStatic, breakpoint} = useStream ->
    {
      isOpen: isOpenStream
      isStatic: isStaticStream
      windowSize: browser.getSize()
      breakpoint: browser.getBreakpoint()
      appBarHeight: browser.getAppBarHeightVal()
      drawerWidth: browser.getDrawerWidth()
    }

  useEffect ->
    onStaticChange = (isStatic) ->
      # sometimes get cannot get length of undefined for gotopage with this
      setTimeout ->
        if not iScrollContainer and not isStatic
          checkIsReady = ->
            $$container = $$ref
            if $$container and $$container.clientWidth
              initIScroll $$container
            else
              setTimeout checkIsReady, 1000

          checkIsReady()
        else if iScrollContainer and isStatic
          open 0
          iScrollContainer?.destroy()
          delete iScrollContainer
          disposable?.unsubscribe()
      , 0
    isStaticDisposable = isStaticStream.subscribe onStaticChange

    return ->
      iScrollContainer?.destroy()
      delete iScrollContainer
      disposable?.unsubscribe()
      isStaticDisposable?.unsubscribe()
  , []


  close = (animationLengthMs = 500) ->
    try
      if side is 'right'
        iScrollContainer.goToPage 0, 0, animationLengthMs
      else
        iScrollContainer.goToPage 1, 0, animationLengthMs
    catch err
      console.log 'caught err', err

  open = (animationLengthMs = 500) ->
    try
      if side is 'right'
        iScrollContainer.goToPage 1, 0, animationLengthMs
      else
        iScrollContainer.goToPage 0, 0, animationLengthMs
    catch err
      console.log 'caught err', err

  initIScroll = ($$container) ->
    iScrollContainer = new IScroll $$container, {
      scrollX: true
      scrollY: false
      eventPassthrough: true
      bounce: false
      snap: '.tab'
      deceleration: 0.002
    }

    disposable = isOpenStream.subscribe (isOpen) ->
      if isOpen then open() else close()
      $$overlay = $$ref.current.querySelector '.overlay-tab'
      updateOpacity()

    isScrolling = false
    iScrollContainer.on 'scrollStart', ->
      isScrolling = true
      $$overlay = $$ref.current.querySelector '.overlay-tab'
      update = ->
        updateOpacity()
        if isScrolling
          window.requestAnimationFrame update
      update()
      updateOpacity()

    iScrollContainer.on 'scrollEnd', ->
      isScrolling = false

      openPage = if side is 'right' then 1 else 0

      newIsOpen = iScrollContainer.currentPage.pageX is openPage

      # landing on new tab
      if newIsOpen and not isOpen
        onOpen()
      else if not newIsOpen and isOpen
        onClose()


  # the scroll listener in IScroll (iscroll-probe.js) is really slow
  updateOpacity = ->
    if side is 'right'
      opacity = -1 * iScrollContainer.x / drawerWidth
    else
      opacity = 1 + iScrollContainer.x / drawerWidth

    $$overlay.style.opacity = opacity * MAX_OVERLAY_OPACITY

  # HACK: isStatic is null on first render for some reason
  # FIXME: is this still the case w/ zorium 3?
  isStatic ?= breakpoint is 'desktop'

  height = windowSize.height
  if hasAppBar and isStatic
    height -= appBarHeight

  x = if side is 'right' or isStatic then 0 else -drawerWidth

  $drawerTab =
    z '.drawer-tab.tab',
      z '.drawer', {
        style:
          width: "#{drawerWidth}px"
      },
        $content

  $overlayTab =
    z '.overlay-tab.tab', {
      onclick: ->
        onClose()
    },
      z '.grip'

  z '.z-drawer', {
    rel: $$ref
    className: classKebab {isOpen, isStatic, isRight: side is 'right'}
    key: "drawer-#{key}"
    style:
      display: if windowSize.width then 'block' else 'none'
      height: "#{height}px"
      width: if not isStatic \
             then '100%' \
             else "#{drawerWidth}px"
  },
    z '.drawer-wrapper', {
      style:
        width: "#{drawerWidth + windowSize.width}px"
        # make sure drawer is hidden before js laods
        "#{transformProperty}":
          "translate(#{x}px, 0px) translateZ(0px)"
    },
      if side is 'right'
        [$overlayTab, $drawerTab]
      else
        [$drawerTab, $overlayTab]
