{z, createPortal, useContext, useRef, useMemo, useEffect} = require 'zorium'
_defaults = require 'lodash/defaults'

$icon = require '../icon'
$button = require '../button'
colors = require '../../colors'
context = require '../../context'
config = require '../../config'

CLOSE_DELAY_MS = 450 # 0.45s for animation

if window?
  require './index.styl'

module.exports = $sheet = (props) ->
  {onClose, $content, $actions} = props
  {lang} = useContext context

  $$ref = useRef()

  {$$overlays} = useMemo ->
    {
      $$overlays: document?.getElementById 'overlays-portal'
    }
  , []

  useEffect ->
    setTimeout (-> $$ref.current?.classList.add 'is-mounted'), 0
  , []

  close = ->
    $$ref.current?.classList.remove 'is-mounted'
    setTimeout ->
      onClose()
    , CLOSE_DELAY_MS

  createPortal(
    z '.z-sheet', {
      ref: $$ref
    },
      z '.backdrop',
        onclick: close
      z '.sheet',
        z '.inner',
          $content
          if $actions
            z '.actions', $actions
  $$overlays
  )
