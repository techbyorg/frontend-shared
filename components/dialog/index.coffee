{z, classKebab, createPortal, useEffect, useMemo, useRef} = require 'zorium'
# _isEmpty = require 'lodash/isEmpty'
_map = require 'lodash/map'
# _defaults = require 'lodash/defaults'

if window?
  require './index.styl'

$button = require '../button'
colors = require '../../colors'

CLOSE_DELAY_MS = 450 # 0.45s for animation

module.exports = $dialog = (props) ->
  {onClose, $content = '', $title, $actions, isWide} = props

  $$ref = useRef()

  {$$overlays} = useMemo ->
    {
      $$overlays: document?.getElementById 'overlays-portal'
    }
  , []

  useEffect ->
    setTimeout (-> $$ref.current.classList.add 'is-mounted'), 0
    window.addEventListener 'keydown', keyListener

    return ->
      window.removeEventListener 'keydown', keyListener
  , []

  close = ->
    $$ref.current.classList.remove 'is-mounted'
    setTimeout ->
      onClose()
    , CLOSE_DELAY_MS

  keyListener = (e) ->
    if (e.key == 'Escape' or e.key == 'Esc' or e.keyCode == 27)
      e.preventDefault()
      close()

  createPortal(
    z '.z-dialog', {
      ref: $$ref
      className: classKebab {isWide}
    },
      z '.backdrop', {
        onclick: close
      }

      z '.dialog',
        if $title
          z '.title', $title
        z '.content',
          $content
        if $actions
          z '.actions', $actions
    $$overlays
  )
